-- ============================================
-- SUPABASE DATABASE SETUP FOR KONDAPPALI TOYS
-- Run this in your Supabase SQL Editor
-- ============================================

-- Create the orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stripe_session_id TEXT UNIQUE,
    stripe_payment_intent TEXT,
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    shipping_address JSONB,
    shipping_name TEXT,
    amount_total DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_status TEXT DEFAULT 'paid',
    order_status TEXT DEFAULT 'confirmed',
    items JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access (for your Netlify functions)
CREATE POLICY "Service role can do everything" ON orders
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (for testing - remove in production)
-- ============================================
-- INSERT INTO orders (customer_email, customer_name, amount_total, items, order_status)
-- VALUES
--     ('test@example.com', 'Test Customer', 25.99, '[{"name": "Dancing Doll", "quantity": 1, "price": 25.99}]'::jsonb, 'confirmed');
