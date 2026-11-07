# Supabase setup

1. For a fresh project, open the project's SQL Editor and run `schema.sql`. For an existing project, run `migrations/20261106000000_add_ebook_payment_status.sql` in the SQL Editor. This migration adds the payment columns, permits address-less ebook orders, protects payment fields and order contents from client changes, makes the ebook bucket private, and refreshes its storage policy. Existing orders previously marked paid are reset to unverified because their status was not independently protected; review legitimate historical purchases manually before restoring access.
2. Run `seed.sql` to remove legacy physical-product entries and load eight training ebook examples. Back up the `products` table first if it contains products you want to keep.
3. Create a customer account in the app. To grant it admin access, run this query with that account's email:

   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'admin@example.com');
   ```

The local app configuration is in `.env.local`; `.env.example` shows the required variable names. The publishable key is intended for client use. Never put a Supabase secret/service-role key in the app.

Email/password authentication is ready. To use Google sign-in, enable the Google provider in Supabase Authentication and configure its OAuth credentials. Add `https://www.dreamyyspace.com/` to **Authentication → URL Configuration → Redirect URLs** in Supabase. Local web development uses the current `localhost` origin, which must also be allowed.

## Ebooks and private downloads

The sample catalog points to PDF files in the private Supabase Storage bucket `ebooks`. Upload the real training PDFs to the matching paths in `seed.sql`, or change each product's `ebookStoragePath` to the uploaded object path. The app creates short-lived signed links only for products in an order whose `payment_status` is `paid`. Do not make this bucket public.

The schema migration marks historical orders whose payment cannot be independently trusted as `unverified`; their payment result cannot be inferred retroactively. Physical-product purchases are excluded from the ebook purchase history and no unverified order is treated as paid or failed.

The admin product form requires the PDF's storage path. It does not upload the file; upload PDFs through the Supabase Storage dashboard.

## PayDunya card and mobile-money checkout

The app calls the `paydunya-checkout` Edge Function instead of calling PayDunya from the browser. Card payments use PayDunya's hosted invoice page, restricted to the `card` channel; the app never collects or stores card details. Mobile-money checkout starts the selected SoftPay operator. Configured operators are T-Money and Moov Togo; Orange Money, Expresso, Wave, Free Money, and Djamo Senegal; Orange Money, MTN, Moov, Wave, and Djamo Côte d'Ivoire; Orange Money and Moov Burkina Faso; Orange Money Mali; Moov Money and Celtiis Cash Benin; and MTN Cameroon. Orange Money Senegal, Wave, and Djamo may return a hosted payment URL, which the app opens. Orange Money Côte d'Ivoire and Burkina Faso require the customer to provide the operator payment code.

The checkout collects no delivery address. It creates an `initiating` digital order, starts PayDunya, and records `pending` only after a provider invoice is created. Definitive PayDunya or SoftPay rejections are recorded as `failed`; the customer can check provider status after approving payment.

The function keeps Supabase JWT verification enabled and requires a signed-in customer. The app invokes it through the Supabase client so the customer's access token is sent. The function verifies order ownership and each ebook against the server-side catalog, recalculates the total from catalog prices, saves the invoice reference server-side, and updates `payment_status` only after a fresh PayDunya status check. Database triggers prevent client-supplied payment states and order totals or contents from being changed after creation; the storage policy grants ebook access only for server-confirmed paid orders and catalog-backed ebook paths. Do not disable JWT verification or trust a client-supplied order amount.

```sh
supabase functions deploy paydunya-checkout
```

In the Supabase Dashboard, open **Edge Functions → Secrets** and set `PAYDUNYA_MASTER_KEY`, `PAYDUNYA_TOKEN`, `PAYDUNYA_PRIVATE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. The service-role key is used only by the Edge Function to persist provider-confirmed payments and must never be placed in the app bundle or an `EXPO_PUBLIC_` variable. Use the PayDunya credentials with those exact names from the same PayDunya application and mode. A PayDunya Public Key is not a substitute for the Master Key required by the Checkout Invoice API. Remove any PayDunya credentials from `.env.local` after moving them to Supabase. Since the old implementation exposed payment credentials in client code, rotate those credentials before adding them as Edge Function secrets.

The order table stores PayDunya orders with the generic `paydunya` method; legacy Togo values `tmoney` and `flooz` remain supported. `schema.sql` adds the digital payment state, invoice reference, private bucket and paid-buyer read policy. Run it in the SQL Editor before deploying the updated function:

```sql
alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
    check (payment_method in ('card', 'apple-pay', 'paypal', 'cod', 'tmoney', 'flooz', 'paydunya'));
```
