const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
    // Simple admin authentication via query param (replace with proper auth in production)
    const params = event.queryStringParameters || {};
    const adminKey = params.key;

    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Unauthorized' })
        };
    }

    try {
        // Get orders from Supabase, most recent first
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            throw error;
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                success: true,
                orders: data,
                count: data.length
            })
        };

    } catch (error) {
        console.error('Error fetching orders:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to fetch orders',
                message: error.message
            })
        };
    }
};
