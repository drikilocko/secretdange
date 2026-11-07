import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type PaymentDetails = {
    token: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    otp: string;
};

type OperatorConfig = {
    endpoint: string;
    countryCode: string;
    minPhoneDigits: number;
    maxPhoneDigits: number;
    paymentMethod: 'tmoney' | 'flooz' | 'paydunya';
    requiresOtp?: boolean;
    buildBody: (details: PaymentDetails) => Record<string, string>;
};

const OPERATOR_CONFIG: Record<string, OperatorConfig> = {
    'tmoney-tg': {
        endpoint: 't-money-togo', countryCode: '228', minPhoneDigits: 8, maxPhoneDigits: 8, paymentMethod: 'tmoney',
        buildBody: ({ token, name, email, phone }) => ({ name_t_money: name, email_t_money: email, phone_t_money: phone, payment_token: token }),
    },
    'flooz-tg': {
        endpoint: 'moov-togo', countryCode: '228', minPhoneDigits: 8, maxPhoneDigits: 8, paymentMethod: 'flooz',
        buildBody: ({ token, name, email, phone, address }) => ({ moov_togo_customer_fullname: name, moov_togo_email: email, moov_togo_customer_address: address, moov_togo_phone_number: phone, payment_token: token }),
    },
    'orange-sn': {
        endpoint: 'new-orange-money-senegal', countryCode: '221', minPhoneDigits: 9, maxPhoneDigits: 9, paymentMethod: 'paydunya',
        buildBody: ({ token, name, email, phone }) => ({ customer_name: name, customer_email: email, phone_number: phone, invoice_token: token }),
    },
    'expresso-sn': {
        endpoint: 'expresso-senegal', countryCode: '221', minPhoneDigits: 9, maxPhoneDigits: 9, paymentMethod: 'paydunya',
        buildBody: ({ token, name, email, phone }) => ({ expresso_sn_fullName: name, expresso_sn_email: email, expresso_sn_phone: phone, payment_token: token }),
    },
    'wave-sn': {
        endpoint: 'wave-senegal', countryCode: '221', minPhoneDigits: 9, maxPhoneDigits: 9, paymentMethod: 'paydunya',
        buildBody: ({ token, name, email, phone }) => ({ wave_senegal_fullName: name, wave_senegal_email: email, wave_senegal_phone: phone, wave_senegal_payment_token: token }),
    },
    'free-sn': {
        endpoint: 'free-money-senegal', countryCode: '221', minPhoneDigits: 9, maxPhoneDigits: 9, paymentMethod: 'paydunya',
        buildBody: ({ token, name, email, phone }) => ({ customer_name: name, customer_email: email, phone_number: phone, payment_token: token }),
    },
    'djamo-sn': {
        endpoint: 'djamo', countryCode: '221', minPhoneDigits: 9, maxPhoneDigits: 9, paymentMethod: 'paydunya',
        buildBody: ({ token, name, email, phone }) => ({ djamo_fullName: name, djamo_email: email, djamo_phone: phone, code_country: 'sn', djamo_payment_token: token }),
    },
    'orange-ci': {
        endpoint: 'orange-money-ci', countryCode: '225', minPhoneDigits: 10, maxPhoneDigits: 10, paymentMethod: 'paydunya', requiresOtp: true,
        buildBody: ({ token, name, email, phone, otp }) => ({ orange_money_ci_customer_fullname: name, orange_money_ci_email: email, orange_money_ci_phone_number: phone, orange_money_ci_otp: otp, payment_token: token }),
    },
    'mtn-ci': {
        endpoint: 'mtn-ci', countryCode: '225', minPhoneDigits: 10, maxPhoneDigits: 10, paymentMethod: 'paydunya',
        buildBody: ({ token, name, email, phone }) => ({ mtn_ci_customer_fullname: name, mtn_ci_email: email, mtn_ci_phone_number: phone, mtn_ci_wallet_provider: 'MTNCI', payment_token: token }),
    },
    'moov-ci': {
        endpoint: 'moov-ci', countryCode: '225', minPhoneDigits: 10, maxPhoneDigits: 10, paymentMethod: 'paydunya',
        buildBody: ({ token, name, email, phone }) => ({ moov_ci_customer_fullname: name, moov_ci_email: email, moov_ci_phone_number: phone, payment_token: token }),
    },
    'wave-ci': {
        endpoint: 'wave-ci', countryCode: '225', minPhoneDigits: 10, maxPhoneDigits: 10, paymentMethod: 'paydunya',
        buildBody: ({ token, name, email, phone }) => ({ wave_ci_fullName: name, wave_ci_email: email, wave_ci_phone: phone, wave_ci_payment_token: token }),
    },
    'djamo-ci': {
        endpoint: 'djamo', countryCode: '225', minPhoneDigits: 10, maxPhoneDigits: 10, paymentMethod: 'paydunya',
        buildBody: ({ token, name, email, phone }) => ({ djamo_fullName: name, djamo_email: email, djamo_phone: phone, code_country: 'ci', djamo_payment_token: token }),
    },
    'orange-bf': {
        endpoint: 'orange-money-burkina', countryCode: '226', minPhoneDigits: 8, maxPhoneDigits: 8, paymentMethod: 'paydunya', requiresOtp: true,
        buildBody: ({ token, name, email, phone, otp }) => ({ name_bf: name, email_bf: email, phone_bf: phone, otp_code: otp, payment_token: token }),
    },
    'moov-bf': {
        endpoint: 'moov-burkina', countryCode: '226', minPhoneDigits: 8, maxPhoneDigits: 8, paymentMethod: 'paydunya',
        buildBody: ({ token, name, email, phone }) => ({ moov_burkina_faso_fullName: name, moov_burkina_faso_email: email, moov_burkina_faso_phone_number: phone, moov_burkina_faso_payment_token: token }),
    },
    'orange-ml': {
        endpoint: 'orange-money-mali', countryCode: '223', minPhoneDigits: 8, maxPhoneDigits: 8, paymentMethod: 'paydunya',
        buildBody: ({ token, name, email, phone, address }) => ({ orange_money_mali_customer_fullname: name, orange_money_mali_email: email, orange_money_mali_phone_number: phone, orange_money_mali_customer_address: address, payment_token: token }),
    },
    'moov-bj': {
        endpoint: 'moov-benin', countryCode: '229', minPhoneDigits: 8, maxPhoneDigits: 10, paymentMethod: 'paydunya',
        buildBody: ({ token, name, email, phone }) => ({ moov_benin_customer_fullname: name, moov_benin_email: email, moov_benin_phone_number: phone, payment_token: token }),
    },
    'celtiis-bj': {
        endpoint: 'celtiis-cash', countryCode: '229', minPhoneDigits: 10, maxPhoneDigits: 10, paymentMethod: 'paydunya',
        buildBody: ({ token, name, email, phone }) => ({ celtiis_cash_customer_fullname: name, celtiis_cash_customer_email: email, celtiis_cash_phone_number: phone, payment_token: token }),
    },
    'mtn-cm': {
        endpoint: 'mtn-cameroun', countryCode: '237', minPhoneDigits: 9, maxPhoneDigits: 9, paymentMethod: 'paydunya',
        buildBody: ({ token, name, email, phone }) => ({ mtn_cameroun_customer_fullname: name, mtn_cameroun_email: email, mtn_cameroun_phone_number: phone, mtn_cameroun_wallet_provider: 'MTNCAMEROUN', payment_token: token }),
    },
};

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonResp = (body: Record<string, unknown>, status: number) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const isRec = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    if (req.method !== 'POST') return jsonResp({ error: 'Méthode non autorisée.' }, 405);

    const authorization = req.headers.get('Authorization');
    if (!authorization) return jsonResp({ error: 'Authentification requise.' }, 401);

    let payload: unknown;
    try {
        payload = await req.json();
    } catch {
        return jsonResp({ error: 'Requête JSON invalide.' }, 400);
    }
    if (!isRec(payload)) return jsonResp({ error: 'Requête JSON invalide.' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const masterKey = Deno.env.get('PAYDUNYA_MASTER_KEY');
    const pdToken = Deno.env.get('PAYDUNYA_TOKEN');
    const privateKey = Deno.env.get('PAYDUNYA_PRIVATE_KEY');
    if (!supabaseUrl || !supabaseAnonKey || !masterKey || !pdToken || !privateKey) {
        return jsonResp({ error: 'Service de paiement non configuré.' }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authorization } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return jsonResp({ error: 'Session invalide. Reconnectez-vous.' }, 401);

    const pdHeaders = {
        'Content-Type': 'application/json',
        'PAYDUNYA-MASTER-KEY': masterKey,
        'PAYDUNYA-PRIVATE-KEY': privateKey,
        'PAYDUNYA-TOKEN': pdToken,
    };

    const updateOrderPayment = async (
        orderId: string,
        paymentStatus: 'pending' | 'paid' | 'failed',
        paymentReference?: string | null,
        paymentMethod?: string,
    ) => {
        if (!serviceRoleKey) return new Error('La mise à jour sécurisée du paiement n’est pas configurée.');
        const admin = createClient(supabaseUrl, serviceRoleKey);
        const update: Record<string, string | number | boolean | null> = {
            payment_status: paymentStatus,
            payment_verified: paymentStatus === 'paid',
        };
        if (paymentReference !== undefined) update.payment_reference = paymentReference;
        if (paymentMethod !== undefined) update.payment_method = paymentMethod;
        if (paymentStatus === 'paid') update.status = 'processing';
        const { error } = await admin
            .from('orders')
            .update(update)
            .eq('id', orderId)
            .eq('user_id', user.id);
        return error;
    };

    const calculateVerifiedOrderAmount = async (order: {
        items: unknown;
        subtotal: unknown;
        discount: unknown;
        shipping: unknown;
        total: unknown;
    }): Promise<{ amountXOF?: number; error?: string }> => {
        if (!serviceRoleKey) {
            return { error: 'La vérification sécurisée du montant n’est pas configurée.' };
        }
        if (!Array.isArray(order.items) || order.items.length === 0) {
            return { error: 'La commande ne contient aucun ebook.' };
        }

        const orderItems: { productId: string; quantity: number }[] = [];
        for (const item of order.items) {
            if (!isRec(item) || !isRec(item.product)) {
                return { error: 'Les articles de la commande sont invalides.' };
            }
            const productId = item.product.id;
            const quantity = item.quantity;
            if (
                typeof productId !== 'string'
                || !productId
                || typeof quantity !== 'number'
                || !Number.isSafeInteger(quantity)
                || quantity < 1
                || quantity > 1000
            ) {
                return { error: 'Les articles de la commande sont invalides.' };
            }
            orderItems.push({ productId, quantity });
        }

        const admin = createClient(supabaseUrl, serviceRoleKey);
        const productIds = [...new Set(orderItems.map((item) => item.productId))];
        const { data: products, error: productsError } = await admin
            .from('products')
            .select('id, data')
            .in('id', productIds);
        if (productsError) {
            console.error('Unable to verify ebook prices against the catalog', productsError);
            return { error: 'Impossible de vérifier les articles du catalogue.' };
        }

        const catalog = new Map<string, unknown>(
            (products || []).map((product) => [product.id, product.data as unknown] as const),
        );
        let subtotalCents = 0;
        for (const item of orderItems) {
            const product = catalog.get(item.productId);
            if (!isRec(product) || typeof product.ebookStoragePath !== 'string' || !product.ebookStoragePath) {
                return { error: 'Un ebook de la commande n’est plus disponible dans le catalogue.' };
            }
            const price = Number(product.price);
            if (!Number.isFinite(price) || price <= 0) {
                return { error: 'Le prix d’un ebook du catalogue est invalide.' };
            }
            subtotalCents += Math.round(price * 100) * item.quantity;
            if (!Number.isSafeInteger(subtotalCents)) {
                return { error: 'Le montant de la commande est invalide.' };
            }
        }

        const toCents = (value: unknown) => {
            const amount = Number(value);
            return Number.isFinite(amount) ? Math.round(amount * 100) : null;
        };
        if (
            toCents(order.subtotal) !== subtotalCents
            || toCents(order.discount) !== 0
            || toCents(order.shipping) !== 0
            || toCents(order.total) !== subtotalCents
        ) {
            return { error: 'Le montant de la commande ne correspond pas aux prix du catalogue. Recréez votre panier.' };
        }

        const amountXOF = Math.round((subtotalCents / 100) * 600);
        if (!Number.isSafeInteger(amountXOF) || amountXOF <= 0) {
            return { error: 'Le montant de la commande est invalide.' };
        }
        return { amountXOF };
    };

    if (payload.action === 'check-order-status') {
        const orderId = payload.orderId;
        if (typeof orderId !== 'string' || !orderId.trim()) {
            return jsonResp({ error: 'Identifiant de commande invalide.' }, 400);
        }
        if (!serviceRoleKey) {
            return jsonResp({ error: 'La vérification sécurisée du paiement n’est pas configurée.' }, 500);
        }
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('id, payment_reference, payment_status, payment_verified')
            .eq('id', orderId.trim())
            .eq('user_id', user.id)
            .maybeSingle();
        if (orderError) return jsonResp({ error: 'Impossible de vérifier la commande.' }, 500);
        if (!order) return jsonResp({ error: 'Commande introuvable.' }, 404);
        if (order.payment_status === 'paid' && order.payment_verified) {
            return jsonResp({ status: 'paid' }, 200);
        }
        if (order.payment_status === 'unverified') return jsonResp({ status: 'unverified' }, 200);
        if (!order.payment_reference) return jsonResp({ status: order.payment_status }, 200);

        try {
            const response = await fetch(`https://app.paydunya.com/api/v1/checkout-invoice/confirm/${encodeURIComponent(order.payment_reference)}`, {
                method: 'GET',
                headers: pdHeaders,
            });
            const result: unknown = await response.json();
            if (!response.ok || !isRec(result) || typeof result.status !== 'string') {
                return jsonResp({ error: 'Impossible de vérifier le statut PayDunya.' }, 502);
            }
            const providerStatus = result.status.toLowerCase();
            const paymentStatus = ['completed', 'success', 'paid'].includes(providerStatus)
                ? 'paid'
                : ['cancelled', 'canceled', 'failed'].includes(providerStatus)
                    ? 'failed'
                    : 'pending';
            if (paymentStatus !== 'pending') {
                const updateError = await updateOrderPayment(
                    order.id,
                    paymentStatus,
                    paymentStatus === 'failed' ? null : undefined,
                );
                if (updateError) {
                    console.error('Unable to persist verified PayDunya status', updateError);
                    return jsonResp({ error: 'Paiement vérifié mais impossible de mettre à jour la commande.' }, 500);
                }
            }
            return jsonResp({ status: paymentStatus }, 200);
        } catch (error) {
            console.error('Unable to confirm PayDunya order status', error);
            return jsonResp({ error: 'Impossible de vérifier le statut PayDunya.' }, 502);
        }
    }

    if (payload.action === 'card-checkout') {
        const orderId = payload.orderId;
        if (typeof orderId !== 'string' || !orderId.trim()) {
            return jsonResp({ error: 'Identifiant de commande invalide.' }, 400);
        }
        if (!serviceRoleKey) {
            return jsonResp({ error: 'La confirmation sécurisée du paiement n’est pas configurée.' }, 500);
        }
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('id, items, subtotal, discount, shipping, total, payment_status, payment_verified, payment_reference')
            .eq('id', orderId.trim())
            .eq('user_id', user.id)
            .maybeSingle();
        if (orderError) return jsonResp({ error: 'Impossible de vérifier la commande.' }, 500);
        if (!order) return jsonResp({ error: 'Commande introuvable.' }, 404);
        if (order.payment_status === 'paid' && order.payment_verified) {
            return jsonResp({ error: 'Cette commande est déjà payée.' }, 409);
        }
        if (order.payment_reference && order.payment_status === 'pending') {
            return jsonResp({ error: 'Un paiement par carte est déjà en cours. Vérifiez son statut avant de relancer.' }, 409);
        }

        const verifiedAmount = await calculateVerifiedOrderAmount(order);
        if (!verifiedAmount.amountXOF) return jsonResp({ error: verifiedAmount.error || 'Le montant de la commande est invalide.' }, 400);
        const amountXOF = verifiedAmount.amountXOF;
        const customerName = typeof payload.customerName === 'string' && payload.customerName.trim()
            ? payload.customerName.trim()
            : user.email || 'Client';
        let response: Response;
        try {
            response = await fetch('https://app.paydunya.com/api/v1/checkout-invoice/create', {
                method: 'POST',
                headers: pdHeaders,
                body: JSON.stringify({
                    invoice: {
                        total_amount: amountXOF,
                        description: `Ebooks Secret d’Ange - commande ${order.id}`,
                        channels: ['card'],
                        customer: { name: customerName, email: user.email || '' },
                    },
                    store: {
                        name: 'Secret d’Ange',
                        tagline: 'Ebooks de formation',
                        phone_number: '+22890000000',
                        postal_address: 'Lomé, Togo',
                    },
                    actions: {
                        cancel_url: 'https://zonedepapy.com/cancel',
                        return_url: 'https://zonedepapy.com/success',
                        callback_url: 'https://zonedepapy.com/api/ipn',
                    },
                    custom_data: { order_id: order.id, customer_email: user.email || '' },
                }),
            });
        } catch (error) {
            console.error('Unable to create PayDunya card invoice', error);
            return jsonResp({ error: 'Impossible de joindre PayDunya.' }, 502);
        }

        let invoice: unknown;
        try {
            invoice = await response.json();
        } catch {
            return jsonResp({ error: 'PayDunya a renvoyé une réponse invalide.' }, 502);
        }
        if (!response.ok || !isRec(invoice) || invoice.response_code !== '00' || typeof invoice.token !== 'string') {
            if (isRec(invoice) && typeof invoice.response_code === 'string' && invoice.response_code !== '00') {
                const updateError = await updateOrderPayment(order.id, 'failed', null);
                if (updateError) {
                    console.error('Unable to persist rejected PayDunya card payment', updateError);
                    return jsonResp({ error: 'PayDunya a refusé le paiement et le statut de la commande n’a pas pu être enregistré.' }, 500);
                }
            }
            const providerError = isRec(invoice)
                ? [invoice.description, invoice.response_text].find((value) => typeof value === 'string')
                : undefined;
            return jsonResp({ error: providerError || `PayDunya a refusé la demande (HTTP ${response.status}).` }, 502);
        }
        const referenceError = await updateOrderPayment(order.id, 'pending', invoice.token, 'card');
        if (referenceError) {
            console.error('Unable to save PayDunya card invoice reference', referenceError);
            return jsonResp({ error: 'Facture créée mais impossible de préparer la confirmation sécurisée.' }, 500);
        }
        if (typeof invoice.response_text !== 'string') {
            return jsonResp({ error: 'PayDunya n’a pas fourni le lien de paiement sécurisé.' }, 502);
        }
        let paymentUrl: URL;
        try {
            paymentUrl = new URL(invoice.response_text);
        } catch {
            return jsonResp({ error: 'PayDunya a renvoyé un lien de paiement invalide.' }, 502);
        }
        if (paymentUrl.protocol !== 'https:') {
            return jsonResp({ error: 'PayDunya a renvoyé un lien de paiement non sécurisé.' }, 502);
        }

        return jsonResp({
            message: 'Redirection vers le paiement sécurisé par carte.',
            amountXOF,
            invoiceToken: invoice.token,
            paymentUrl: paymentUrl.toString(),
        }, 200);
    }

    const orderId = payload.orderId;
    const operatorKey = payload.operatorKey;
    const paymentMethod = payload.paymentMethod;
    const paymentPhone = payload.paymentPhone;
    if (typeof orderId !== 'string' || !orderId.trim()) return jsonResp({ error: 'Identifiant de commande invalide.' }, 400);
    if (!serviceRoleKey) {
        return jsonResp({ error: 'La confirmation sécurisée du paiement n’est pas configurée.' }, 500);
    }
    if (typeof operatorKey !== 'string' || !OPERATOR_CONFIG[operatorKey]) return jsonResp({ error: 'Opérateur de paiement invalide.' }, 400);
    const operator = OPERATOR_CONFIG[operatorKey];
    if (paymentMethod !== operator.paymentMethod) return jsonResp({ error: 'Le mode de paiement ne correspond pas à l’opérateur.' }, 400);
    if (typeof paymentPhone !== 'string') return jsonResp({ error: 'Numéro de paiement invalide.' }, 400);
    const otp = typeof payload.otp === 'string' ? payload.otp.trim() : '';
    if (operator.requiresOtp && !otp) return jsonResp({ error: 'Le code de paiement demandé par cet opérateur est requis.' }, 400);

    const phoneDigits = paymentPhone.replace(/\D/g, '');
    if (!phoneDigits.startsWith(operator.countryCode)) return jsonResp({ error: 'Le numéro ne correspond pas au pays sélectionné.' }, 400);
    const localPhone = phoneDigits.slice(operator.countryCode.length);
    if (localPhone.length < operator.minPhoneDigits || localPhone.length > operator.maxPhoneDigits) {
        return jsonResp({ error: 'Numéro de paiement invalide pour cet opérateur.' }, 400);
    }

    let amountXOF: number;
    let customerName: string;
    let customerAddress: string;
    let description: string;

    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, items, subtotal, discount, shipping, total, payment_method, payment_status, payment_verified, payment_reference, shipping_address')
        .eq('id', orderId.trim())
        .eq('user_id', user.id)
        .maybeSingle();
    if (orderError) return jsonResp({ error: 'Impossible de vérifier la commande.' }, 500);
    if (!order) return jsonResp({ error: 'Commande introuvable.' }, 404);
    if (order.payment_status === 'paid' && order.payment_verified) {
        return jsonResp({ error: 'Cette commande est déjà payée.' }, 409);
    }
    if (order.payment_reference && order.payment_status === 'pending') {
        return jsonResp({ error: 'Un paiement est déjà en cours. Vérifiez son statut avant de relancer.' }, 409);
    }
    if (order.payment_method !== paymentMethod) {
        const admin = createClient(supabaseUrl, serviceRoleKey);
        const { error: methodError } = await admin
            .from('orders')
            .update({ payment_method: paymentMethod })
            .eq('id', order.id)
            .eq('user_id', user.id)
            .in('payment_status', ['pending', 'failed', 'initiating']);
        if (methodError) return jsonResp({ error: 'Impossible de mettre à jour le mode de paiement.' }, 500);
    }

    const verifiedAmount = await calculateVerifiedOrderAmount(order);
    if (!verifiedAmount.amountXOF) {
        return jsonResp({ error: verifiedAmount.error || 'Le montant de la commande est invalide.' }, 400);
    }
    amountXOF = verifiedAmount.amountXOF;

    const shippingAddress = isRec(order.shipping_address) ? order.shipping_address : {};
    customerName = typeof payload.customerName === 'string' && payload.customerName.trim()
        ? payload.customerName.trim()
        : typeof shippingAddress.fullName === 'string' && shippingAddress.fullName.trim()
        ? shippingAddress.fullName.trim()
        : user.email || 'Client';
    customerAddress = typeof shippingAddress.address === 'string' && shippingAddress.address.trim()
        ? shippingAddress.address.trim()
        : 'Afrique de l’Ouest';
    description = `Commande ${order.id} - Secret d’Ange`;

    const email = user.email || '';
    let invoiceResponse: Response;
    try {
        invoiceResponse = await fetch('https://app.paydunya.com/api/v1/checkout-invoice/create', {
            method: 'POST',
            headers: pdHeaders,
            body: JSON.stringify({
                invoice: { total_amount: amountXOF, description },
                store: {
                    name: 'Secret d’Ange',
                    tagline: 'Ebooks de formation',
                    phone_number: '+22890000000',
                    postal_address: 'Lomé, Togo',
                },
                actions: {
                    cancel_url: 'https://zonedepapy.com/cancel',
                    return_url: 'https://zonedepapy.com/success',
                    callback_url: 'https://zonedepapy.com/api/ipn',
                },
                custom_data: {
                    order_id: orderId.trim(),
                    customer_name: customerName,
                    customer_phone: localPhone,
                    customer_email: email,
                    operator: operatorKey,
                },
            }),
        });
    } catch {
        return jsonResp({ error: 'Impossible de joindre PayDunya.' }, 502);
    }

    let invoice: unknown;
    try {
        invoice = await invoiceResponse.json();
    } catch {
        return jsonResp({ error: 'PayDunya a renvoyé une réponse invalide.' }, 502);
    }
    if (!invoiceResponse.ok || !isRec(invoice) || invoice.response_code !== '00' || typeof invoice.token !== 'string') {
        if (
            isRec(invoice)
            && typeof invoice.response_code === 'string'
            && invoice.response_code !== '00'
        ) {
            const updateError = await updateOrderPayment(orderId.trim(), 'failed', null);
            if (updateError) {
                console.error('Unable to persist rejected PayDunya mobile payment', updateError);
                return jsonResp({ error: 'PayDunya a refusé le paiement et le statut de la commande n’a pas pu être enregistré.' }, 500);
            }
        }
        const providerError = isRec(invoice)
            ? [invoice.description, invoice.response_text].find((value) => typeof value === 'string')
            : undefined;
        return jsonResp({ error: providerError || `PayDunya a refusé la demande (HTTP ${invoiceResponse.status}).` }, 502);
    }

    const method = paymentMethod === 'tmoney' || paymentMethod === 'flooz' ? paymentMethod : 'paydunya';
    const referenceError = await updateOrderPayment(orderId.trim(), 'pending', invoice.token, method);
    if (referenceError) {
        console.error('Unable to save PayDunya invoice reference', referenceError);
        return jsonResp({ error: 'Facture créée mais impossible de préparer la confirmation sécurisée.' }, 500);
    }

    let softPayResponse: Response;
    try {
        softPayResponse = await fetch(`https://app.paydunya.com/api/v1/softpay/${operator.endpoint}`, {
            method: 'POST',
            headers: pdHeaders,
            body: JSON.stringify(operator.buildBody({
                token: invoice.token,
                name: customerName,
                email,
                phone: localPhone,
                address: customerAddress,
                otp,
            })),
        });
    } catch {
        return jsonResp({ error: 'Facture créée mais paiement mobile injoignable.' }, 502);
    }

    let softPayResponseBody: string;
    try {
        softPayResponseBody = await softPayResponse.text();
    } catch {
        console.error('Unable to read PayDunya SoftPay response', {
            operatorKey,
            status: softPayResponse.status,
        });
        return jsonResp({ error: `Impossible de lire la réponse SoftPay (HTTP ${softPayResponse.status}).` }, 502);
    }
    if (softPayResponse.status === 404) {
        console.error('PayDunya SoftPay endpoint not found', { operatorKey, endpoint: operator.endpoint });
        const updateError = await updateOrderPayment(orderId.trim(), 'failed', null);
        if (updateError) {
            console.error('Unable to persist PayDunya SoftPay endpoint failure', updateError);
            return jsonResp({ error: 'Opérateur introuvable et statut du paiement non enregistré.' }, 500);
        }
        return jsonResp({
            error: `L’endpoint PayDunya "${operator.endpoint}" est introuvable (HTTP 404). Vérifiez que la fonction paydunya-checkout mise à jour est déployée.`,
        }, 502);
    }

    let softPay: unknown;
    try {
        softPay = JSON.parse(softPayResponseBody);
    } catch {
        console.error('PayDunya SoftPay returned a non-JSON response', {
            operatorKey,
            status: softPayResponse.status,
            contentType: softPayResponse.headers.get('content-type'),
        });
        return jsonResp({ error: `PayDunya SoftPay a renvoyé une réponse non-JSON (HTTP ${softPayResponse.status}).` }, 502);
    }
    if (!softPayResponse.ok || !isRec(softPay) || softPay.success !== true) {
        const providerError = isRec(softPay)
            ? [softPay.message, softPay.error].find((value) => typeof value === 'string')
            : undefined;
        const updateError = await updateOrderPayment(orderId.trim(), 'failed', null);
        if (updateError) {
            console.error('Unable to persist rejected PayDunya SoftPay request', updateError);
            return jsonResp({ error: 'Le paiement mobile a échoué et son statut n’a pas pu être enregistré.' }, 500);
        }
        return jsonResp({ error: providerError || `Échec SoftPay (HTTP ${softPayResponse.status}).` }, 502);
    }

    return jsonResp({
        message: typeof softPay.message === 'string' ? softPay.message : 'Demande envoyée. Valide-la sur ton téléphone.',
        amountXOF,
        invoiceToken: invoice.token,
        paymentUrl: typeof softPay.url === 'string' ? softPay.url : undefined,
    }, 200);
});
