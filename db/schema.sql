-- Legacy SQLite reference schema only. Production DB is PostgreSQL via Prisma migrations.

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by_id TEXT,
  email_consent INTEGER NOT NULL DEFAULT 0,
  sms_consent INTEGER NOT NULL DEFAULT 0,
  reset_token TEXT,
  reset_token_expires INTEGER,
  last_purchase_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ADDRESSES
CREATE TABLE IF NOT EXISTS addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  label TEXT,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  scientific_name TEXT,
  category_id TEXT NOT NULL REFERENCES categories(id),
  images TEXT NOT NULL DEFAULT '[]',
  base_price REAL NOT NULL,
  compare_price_at REAL,
  cost_of_goods REAL,
  sku TEXT UNIQUE NOT NULL,
  purity REAL,
  molecular_formula TEXT,
  cas_number TEXT,
  storage_instructions TEXT,
  cycle_length_days INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_best_seller INTEGER NOT NULL DEFAULT 0,
  subscription_eligible INTEGER NOT NULL DEFAULT 1,
  subscription_discount REAL NOT NULL DEFAULT 0.15,
  sold_count INTEGER NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  price REAL NOT NULL,
  compare_at REAL,
  sku TEXT UNIQUE NOT NULL,
  stock_qty INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,
  is_default INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0
);

-- BUNDLES
CREATE TABLE IF NOT EXISTS bundles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  compare_at REAL NOT NULL,
  discount_percent REAL NOT NULL,
  image TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- BUNDLE ITEMS
CREATE TABLE IF NOT EXISTS bundle_items (
  id TEXT PRIMARY KEY,
  bundle_id TEXT NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1
);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  guest_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending_payment',
  items TEXT NOT NULL DEFAULT '[]',
  subtotal REAL NOT NULL,
  discount_amount REAL NOT NULL DEFAULT 0,
  discount_code TEXT,
  shipping_cost REAL NOT NULL DEFAULT 0,
  tax REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL,
  shipping_address TEXT NOT NULL,
  tracking_number TEXT,
  tracking_carrier TEXT,
  tracking_url TEXT,
  is_subscription_order INTEGER NOT NULL DEFAULT 0,
  loyalty_points_earned INTEGER NOT NULL DEFAULT 0,
  loyalty_points_used INTEGER NOT NULL DEFAULT 0,
  crypto_currency TEXT,
  crypto_amount REAL,
  crypto_wallet_sent_to TEXT,
  crypto_tx_hash TEXT,
  admin_notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  confirmed_at INTEGER,
  shipped_at INTEGER,
  delivered_at INTEGER
);

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'active',
  interval_days INTEGER NOT NULL DEFAULT 30,
  next_billing_date INTEGER NOT NULL,
  discount_percent REAL NOT NULL DEFAULT 0.15,
  paused_until INTEGER,
  cancel_reason TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  cancelled_at INTEGER
);

-- SUBSCRIPTION ITEMS
CREATE TABLE IF NOT EXISTS subscription_items (
  id TEXT PRIMARY KEY,
  subscription_id TEXT NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL
);

-- DISCOUNT CODES
CREATE TABLE IF NOT EXISTS discount_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  value REAL NOT NULL,
  min_order_value REAL,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  applicable_product_ids TEXT DEFAULT '[]',
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- LOYALTY TRANSACTIONS
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  order_id TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  order_id TEXT,
  rating INTEGER NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  is_verified INTEGER NOT NULL DEFAULT 0,
  is_approved INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- LAB REPORTS (COAs)
CREATE TABLE IF NOT EXISTS lab_reports (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  batch_number TEXT NOT NULL,
  lab_name TEXT NOT NULL,
  purity REAL NOT NULL,
  report_url TEXT NOT NULL,
  tested_at INTEGER NOT NULL,
  is_current INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- EMAIL SEQUENCES
CREATE TABLE IF NOT EXISTS email_sequences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  sequence_type TEXT NOT NULL,
  reference_id TEXT,
  current_step INTEGER NOT NULL DEFAULT 0,
  last_sent_at INTEGER,
  completed INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- REFERRALS
CREATE TABLE IF NOT EXISTS referrals (
  id TEXT PRIMARY KEY,
  referrer_id TEXT NOT NULL REFERENCES users(id),
  referred_email TEXT,
  referred_user_id TEXT REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'clicked',
  points_awarded INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  converted_at INTEGER
);

-- CART ABANDONMENT
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  guest_email TEXT,
  cart_data TEXT NOT NULL,
  email_step INTEGER NOT NULL DEFAULT 0,
  last_updated INTEGER NOT NULL DEFAULT (unixepoch()),
  recovered INTEGER NOT NULL DEFAULT 0
);

-- RELATED PRODUCTS
CREATE TABLE IF NOT EXISTS related_products (
  product_id TEXT NOT NULL,
  related_id TEXT NOT NULL,
  relation_type TEXT NOT NULL DEFAULT 'related',
  PRIMARY KEY (product_id, related_id)
);

-- NEWSLETTER / EMAIL CAPTURE (consent-based marketing signups)
CREATE TABLE IF NOT EXISTS newsletter_signups (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  consent INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_variants_product ON variants(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_loyalty_user ON loyalty_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_email_seq_user ON email_sequences(user_id, sequence_type);
