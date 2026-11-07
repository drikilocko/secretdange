create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null default '',
    avatar_url text,
    saved_address jsonb,
    role text not null default 'customer' check (role in ('customer', 'admin')),
    created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists saved_address jsonb;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, full_name, avatar_url)
    values (
        new.id,
        coalesce(new.raw_user_meta_data ->> 'full_name', ''),
        new.raw_user_meta_data ->> 'avatar_url'
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

create table if not exists public.products (
    id text primary key,
    data jsonb not null,
    created_at timestamptz not null default now()
);

create table if not exists public.orders (
    id text primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    date text not null,
    items jsonb not null,
    subtotal numeric not null,
    discount numeric not null default 0,
    shipping numeric not null default 0,
    total numeric not null,
    currency text not null check (currency in ('USD', 'EUR', 'GBP', 'FCFA')),
    shipping_address jsonb not null,
    payment_method text not null check (payment_method in ('card', 'apple-pay', 'paypal', 'cod', 'tmoney', 'flooz', 'paydunya')),
    status text not null default 'placed' check (status in ('placed', 'processing', 'shipped', 'delivered')),
    payment_status text not null default 'initiating' constraint orders_payment_status_check check (payment_status in ('initiating', 'pending', 'paid', 'failed', 'unverified')),
    payment_verified boolean not null default false,
    constraint orders_payment_verified_check check (payment_verified = (payment_status = 'paid')),
    payment_reference text,
    estimated_delivery text,
    created_at timestamptz not null default now()
);

alter table public.orders alter column shipping_address drop not null;
alter table public.orders alter column estimated_delivery drop not null;
alter table public.orders add column if not exists payment_status text not null default 'pending';
alter table public.orders add column if not exists payment_verified boolean not null default false;
alter table public.orders add column if not exists payment_reference text;

alter table public.orders alter column payment_status set default 'initiating';
alter table public.orders drop constraint if exists orders_payment_status_check;

update public.orders o
set payment_status = 'unverified'
where o.payment_status = 'pending'
  and o.payment_reference is null;

update public.orders
set payment_status = 'unverified'
where payment_status = 'paid'
  and not payment_verified;

alter table public.orders
    add constraint orders_payment_status_check
    check (payment_status in ('initiating', 'pending', 'paid', 'failed', 'unverified'));

alter table public.orders drop constraint if exists orders_payment_verified_check;
alter table public.orders
    add constraint orders_payment_verified_check
    check (payment_verified = (payment_status = 'paid'));

create or replace function public.protect_order_payment_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        if tg_op = 'INSERT' then
            new.payment_status := 'initiating';
            new.payment_verified := false;
            new.payment_reference := null;
            if jsonb_typeof(new.items) <> 'array' or jsonb_array_length(new.items) = 0 then
                raise exception 'An order must contain at least one item';
            end if;
        elsif
            new.id is distinct from old.id
            or new.user_id is distinct from old.user_id
            or new.items is distinct from old.items
            or new.subtotal is distinct from old.subtotal
            or new.discount is distinct from old.discount
            or new.shipping is distinct from old.shipping
            or new.total is distinct from old.total
            or new.currency is distinct from old.currency
            or (
                new.payment_method is distinct from old.payment_method
                and old.payment_reference is not null
            )
            or new.payment_status is distinct from old.payment_status
            or new.payment_verified is distinct from old.payment_verified
            or new.payment_reference is distinct from old.payment_reference
        then
            raise exception 'Order contents and payment status can only be changed by the payment service';
        end if;
    end if;
    return new;
end;
$$;

drop trigger if exists protect_order_payment_fields on public.orders;
create trigger protect_order_payment_fields
    before insert or update on public.orders
    for each row execute function public.protect_order_payment_fields();

create table if not exists public.wishlist_items (
    user_id uuid not null references auth.users(id) on delete cascade,
    product_id text not null references public.products(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (user_id, product_id)
);

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.wishlist_items enable row level security;

drop policy if exists "Profiles are readable by their owner" on public.profiles;
create policy "Profiles are readable by their owner"
    on public.profiles for select to authenticated
    using (id = (select auth.uid()));

drop policy if exists "Products are readable by everyone" on public.products;
create policy "Products are readable by everyone"
    on public.products for select to anon, authenticated
    using (true);

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products"
    on public.products for all to authenticated
    using (exists (
        select 1 from public.profiles
        where profiles.id = (select auth.uid()) and profiles.role = 'admin'
    ))
    with check (exists (
        select 1 from public.profiles
        where profiles.id = (select auth.uid()) and profiles.role = 'admin'
    ));

drop policy if exists "Customers read their own orders" on public.orders;
create policy "Customers read their own orders"
    on public.orders for select to authenticated
    using (user_id = (select auth.uid()) or exists (
        select 1 from public.profiles
        where profiles.id = (select auth.uid()) and profiles.role = 'admin'
    ));

drop policy if exists "Customers create their own orders" on public.orders;
create policy "Customers create their own orders"
    on public.orders for insert to authenticated
    with check (user_id = (select auth.uid()));

drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders"
    on public.orders for update to authenticated
    using (exists (
        select 1 from public.profiles
        where profiles.id = (select auth.uid()) and profiles.role = 'admin'
    ))
    with check (exists (
        select 1 from public.profiles
        where profiles.id = (select auth.uid()) and profiles.role = 'admin'
    ));

drop policy if exists "Customers manage their own wishlist" on public.wishlist_items;
create policy "Customers manage their own wishlist"
    on public.wishlist_items for all to authenticated
    using (user_id = (select auth.uid()))
    with check (user_id = (select auth.uid()));

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant select, insert, update on public.orders to authenticated;
grant select on public.profiles to authenticated;
grant select, insert, delete on public.wishlist_items to authenticated;

create or replace function public.save_shipping_address(address jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.profiles
    set saved_address = address
    where id = (select auth.uid());
    if not found then
        raise exception 'Profile not found for the current user';
    end if;
end;
$$;

revoke all on function public.save_shipping_address(jsonb) from public, anon;
grant execute on function public.save_shipping_address(jsonb) to authenticated;

notify pgrst, 'reload schema';

insert into storage.buckets (id, name, public)
values ('ebooks', 'ebooks', false)
on conflict (id) do update set public = false;

drop policy if exists "Paid ebook buyers can read purchased ebooks" on storage.objects;
create policy "Paid ebook buyers can read purchased ebooks"
    on storage.objects for select to authenticated
    using (
        bucket_id = 'ebooks'
        and exists (
            select 1
            from public.orders o
            cross join lateral jsonb_array_elements(
                case when jsonb_typeof(o.items) = 'array' then o.items else '[]'::jsonb end
            ) item
            join public.products p
              on p.id = (item -> 'product' ->> 'id')
            where o.user_id = (select auth.uid())
              and o.payment_status = 'paid'
              and o.payment_verified
              and p.data ->> 'ebookStoragePath' = storage.objects.name
        )
    );
