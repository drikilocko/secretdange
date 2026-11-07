alter table public.orders
    alter column shipping_address drop not null;

alter table public.orders
    alter column estimated_delivery drop not null;

alter table public.orders
    add column if not exists payment_status text not null default 'unverified';

alter table public.orders
    add column if not exists payment_verified boolean not null default false;

alter table public.orders
    add column if not exists payment_reference text;

update public.orders
set payment_status = 'unverified'
where payment_status = 'pending'
  and payment_reference is null;

update public.orders
set payment_status = 'unverified'
where payment_status = 'paid'
  and not payment_verified;

alter table public.orders
    alter column payment_status set default 'initiating';

alter table public.orders
    drop constraint if exists orders_payment_status_check;

alter table public.orders
    add constraint orders_payment_status_check
    check (payment_status in ('initiating', 'pending', 'paid', 'failed', 'unverified'));

alter table public.orders
    drop constraint if exists orders_payment_verified_check;

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

notify pgrst, 'reload schema';
