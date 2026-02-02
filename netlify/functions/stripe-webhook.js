const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method not allowed' };
    }

    const sig = event.headers['stripe-signature'];
    let stripeEvent;

    try {
        // Verify webhook signature
        stripeEvent = stripe.webhooks.constructEvent(
            event.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return {
            statusCode: 400,
            body: `Webhook Error: ${err.message}`
        };
    }

    // Handle the checkout.session.completed event
    if (stripeEvent.type === 'checkout.session.completed') {
        const session = stripeEvent.data.object;

        console.log('Processing checkout session:', session.id);
        console.log('Shipping details from Stripe:', JSON.stringify(session.shipping_details));
        console.log('Customer details from Stripe:', JSON.stringify(session.customer_details));

        try {
            // Get line items from the session
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

            // Format shipping address as a readable string or JSON
            let shippingAddress = null;
            if (session.shipping_details?.address) {
                const addr = session.shipping_details.address;
                shippingAddress = {
                    line1: addr.line1 || '',
                    line2: addr.line2 || '',
                    city: addr.city || '',
                    state: addr.state || '',
                    postal_code: addr.postal_code || '',
                    country: addr.country || ''
                };
            }

            // Prepare order data
            const orderData = {
                stripe_session_id: session.id,
                stripe_payment_intent: session.payment_intent,
                customer_email: session.customer_details?.email || session.customer_email || 'unknown',
                customer_name: session.shipping_details?.name || session.customer_details?.name || 'Guest',
                shipping_address: shippingAddress,
                shipping_name: session.shipping_details?.name || null,
                amount_total: session.amount_total / 100, // Convert from cents
                currency: session.currency.toUpperCase(),
                payment_status: session.payment_status,
                order_status: 'confirmed',
                items: lineItems.data.map(item => ({
                    name: item.description,
                    quantity: item.quantity,
                    price: item.amount_total / 100
                })),
                created_at: new Date().toISOString()
            };

            console.log('Saving order data:', JSON.stringify(orderData));

            // Save to Supabase
            const { data, error } = await supabase
                .from('orders')
                .insert([orderData])
                .select();

            if (error) {
                console.error('Supabase error:', error);
                console.error('Supabase error details:', JSON.stringify(error));
                // Don't return error - order is still valid in Stripe
            } else {
                console.log('Order saved to Supabase:', data[0]?.id);
            }

        } catch (err) {
            console.error('Error processing order:', err.message);
            console.error('Error stack:', err.stack);
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ received: true })
    };
};
