-- =========================================================
-- DUMMY DATA FOR ANALYTICS TESTING
-- =========================================================
-- Purpose: Create sample data to test analytics dashboard
-- Note: Run this AFTER the main schema is set up
-- =========================================================

-- Insert sample products for existing tenants
-- (Assuming you already have tenants in the system)

DO $$
DECLARE
  tenant_id_1 uuid;
  tenant_id_2 uuid;
  tenant_id_3 uuid;
  product_id_1 bigint;
  product_id_2 bigint;
  product_id_3 bigint;
  product_id_4 bigint;
  product_id_5 bigint;
  product_id_6 bigint;
  transaction_id_1 bigint;
  transaction_id_2 bigint;
  transaction_id_3 bigint;
  transaction_id_4 bigint;
  transaction_id_5 bigint;
BEGIN
  -- Get first 3 tenant IDs (adjust if needed)
  SELECT id INTO tenant_id_1 FROM profiles WHERE role = 'tenant' AND deleted_at IS NULL LIMIT 1;
  SELECT id INTO tenant_id_2 FROM profiles WHERE role = 'tenant' AND deleted_at IS NULL OFFSET 1 LIMIT 1;
  SELECT id INTO tenant_id_3 FROM profiles WHERE role = 'tenant' AND deleted_at IS NULL OFFSET 2 LIMIT 1;

  -- Only proceed if we have tenants
  IF tenant_id_1 IS NOT NULL THEN
    
    -- Insert products for tenant 1
    INSERT INTO products (tenant_id, name, description, price, stock, category, is_active)
    VALUES 
      (tenant_id_1, 'Nasi Goreng Spesial', 'Nasi goreng dengan telur dan ayam', 25000, 100, 'Makanan', true),
      (tenant_id_1, 'Es Teh Manis', 'Es teh manis segar', 5000, 200, 'Minuman', true),
      (tenant_id_1, 'Mie Goreng', 'Mie goreng pedas', 20000, 80, 'Makanan', true)
    RETURNING id INTO product_id_1;
    
    SELECT id INTO product_id_2 FROM products WHERE tenant_id = tenant_id_1 AND name = 'Es Teh Manis' LIMIT 1;
    SELECT id INTO product_id_3 FROM products WHERE tenant_id = tenant_id_1 AND name = 'Mie Goreng' LIMIT 1;

  END IF;

  IF tenant_id_2 IS NOT NULL THEN
    
    -- Insert products for tenant 2
    INSERT INTO products (tenant_id, name, description, price, stock, category, is_active)
    VALUES 
      (tenant_id_2, 'Kaos Polos Premium', 'Kaos cotton combed 30s', 75000, 50, 'Fashion', true),
      (tenant_id_2, 'Topi Snapback', 'Topi snapback keren', 50000, 30, 'Fashion', true)
    RETURNING id INTO product_id_4;
    
    SELECT id INTO product_id_5 FROM products WHERE tenant_id = tenant_id_2 AND name = 'Topi Snapback' LIMIT 1;

  END IF;

  IF tenant_id_3 IS NOT NULL THEN
    
    -- Insert products for tenant 3
    INSERT INTO products (tenant_id, name, description, price, stock, category, is_active)
    VALUES 
      (tenant_id_3, 'Kerajinan Tas Anyaman', 'Tas anyaman handmade', 150000, 20, 'Kerajinan', true)
    RETURNING id INTO product_id_6;

  END IF;

  -- Create transactions for the last 7 days
  -- Transaction 1: Today - Tenant 1
  IF tenant_id_1 IS NOT NULL AND product_id_1 IS NOT NULL THEN
    INSERT INTO transactions (tenant_id, type, total_amount, transaction_date, note)
    VALUES (tenant_id_1, 'PEMASUKAN', 0, CURRENT_DATE, 'Penjualan hari ini')
    RETURNING id INTO transaction_id_1;

    -- Add transaction items
    INSERT INTO transaction_items (transaction_id, product_id, product_name, quantity, unit_price, subtotal)
    VALUES 
      (transaction_id_1, product_id_1, 'Nasi Goreng Spesial', 3, 25000, 75000),
      (transaction_id_1, product_id_2, 'Es Teh Manis', 5, 5000, 25000),
      (transaction_id_1, product_id_3, 'Mie Goreng', 2, 20000, 40000);
  END IF;

  -- Transaction 2: Yesterday - Tenant 1
  IF tenant_id_1 IS NOT NULL AND product_id_1 IS NOT NULL THEN
    INSERT INTO transactions (tenant_id, type, total_amount, transaction_date, note)
    VALUES (tenant_id_1, 'PEMASUKAN', 0, CURRENT_DATE - 1, 'Penjualan kemarin')
    RETURNING id INTO transaction_id_2;

    INSERT INTO transaction_items (transaction_id, product_id, product_name, quantity, unit_price, subtotal)
    VALUES 
      (transaction_id_2, product_id_1, 'Nasi Goreng Spesial', 5, 25000, 125000),
      (transaction_id_2, product_id_2, 'Es Teh Manis', 8, 5000, 40000);
  END IF;

  -- Transaction 3: 2 days ago - Tenant 2
  IF tenant_id_2 IS NOT NULL AND product_id_4 IS NOT NULL THEN
    INSERT INTO transactions (tenant_id, type, total_amount, transaction_date, note)
    VALUES (tenant_id_2, 'PEMASUKAN', 0, CURRENT_DATE - 2, 'Penjualan fashion')
    RETURNING id INTO transaction_id_3;

    INSERT INTO transaction_items (transaction_id, product_id, product_name, quantity, unit_price, subtotal)
    VALUES 
      (transaction_id_3, product_id_4, 'Kaos Polos Premium', 4, 75000, 300000),
      (transaction_id_3, product_id_5, 'Topi Snapback', 2, 50000, 100000);
  END IF;

  -- Transaction 4: 3 days ago - Tenant 1 (Expense)
  IF tenant_id_1 IS NOT NULL THEN
    INSERT INTO transactions (tenant_id, type, total_amount, transaction_date, note)
    VALUES (tenant_id_1, 'PENGELUARAN', 150000, CURRENT_DATE - 3, 'Beli bahan baku');
  END IF;

  -- Transaction 5: 4 days ago - Tenant 3
  IF tenant_id_3 IS NOT NULL AND product_id_6 IS NOT NULL THEN
    INSERT INTO transactions (tenant_id, type, total_amount, transaction_date, note)
    VALUES (tenant_id_3, 'PEMASUKAN', 0, CURRENT_DATE - 4, 'Penjualan kerajinan')
    RETURNING id INTO transaction_id_4;

    INSERT INTO transaction_items (transaction_id, product_id, product_name, quantity, unit_price, subtotal)
    VALUES 
      (transaction_id_4, product_id_6, 'Kerajinan Tas Anyaman', 3, 150000, 450000);
  END IF;

  -- Transaction 6: 5 days ago - Tenant 2
  IF tenant_id_2 IS NOT NULL AND product_id_4 IS NOT NULL THEN
    INSERT INTO transactions (tenant_id, type, total_amount, transaction_date, note)
    VALUES (tenant_id_2, 'PEMASUKAN', 0, CURRENT_DATE - 5, 'Penjualan kaos')
    RETURNING id INTO transaction_id_5;

    INSERT INTO transaction_items (transaction_id, product_id, product_name, quantity, unit_price, subtotal)
    VALUES 
      (transaction_id_5, product_id_4, 'Kaos Polos Premium', 6, 75000, 450000);
  END IF;

  -- Transaction 7: 6 days ago - Tenant 1
  IF tenant_id_1 IS NOT NULL AND product_id_1 IS NOT NULL THEN
    INSERT INTO transactions (tenant_id, type, total_amount, transaction_date, note)
    VALUES (tenant_id_1, 'PEMASUKAN', 0, CURRENT_DATE - 6, 'Penjualan minggu lalu');

    INSERT INTO transaction_items (transaction_id, product_id, product_name, quantity, unit_price, subtotal)
    VALUES 
      (CURRVAL('transactions_id_seq'), product_id_1, 'Nasi Goreng Spesial', 8, 25000, 200000),
      (CURRVAL('transactions_id_seq'), product_id_2, 'Es Teh Manis', 12, 5000, 60000);
  END IF;

  RAISE NOTICE 'Dummy data created successfully!';
  
END $$;

-- Verify the data
SELECT 
  'Transactions created:' as info,
  COUNT(*) as count
FROM transactions
WHERE transaction_date >= CURRENT_DATE - 7;

SELECT 
  'Transaction items created:' as info,
  COUNT(*) as count
FROM transaction_items;

SELECT 
  'Products created:' as info,
  COUNT(*) as count
FROM products
WHERE created_at >= CURRENT_DATE - 1;
