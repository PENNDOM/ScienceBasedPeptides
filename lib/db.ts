import { prisma } from "@/lib/prisma";

function toPgPlaceholders(sql: string): string {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

export async function run(sql: string, params: unknown[] = []) {
  const pgSql = toPgPlaceholders(sql);
  return prisma.$executeRawUnsafe(pgSql, ...params);
}

export async function get<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  const pgSql = toPgPlaceholders(sql);
  const rows = (await prisma.$queryRawUnsafe(pgSql, ...params)) as T[];
  return rows[0];
}

export async function all<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const pgSql = toPgPlaceholders(sql);
  return (await prisma.$queryRawUnsafe(pgSql, ...params)) as T[];
}

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  password_hash: string;
  role: string;
  loyalty_points: number;
  referral_code: string;
  referred_by_id: string | null;
  email_consent: number;
  sms_consent: number;
  reset_token: string | null;
  reset_token_expires: number | null;
  last_purchase_at: number | null;
  created_at: number;
}

export interface ProductRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string | null;
  scientific_name: string | null;
  category_id: string;
  images: string;
  base_price: number;
  compare_price_at: number | null;
  sku: string;
  purity: number | null;
  molecular_formula: string | null;
  cas_number: string | null;
  storage_instructions: string | null;
  cycle_length_days: number | null;
  is_active: number;
  is_featured: number;
  is_best_seller: number;
  subscription_eligible: number;
  subscription_discount: number;
  sold_count: number;
  seo_title: string | null;
  seo_description: string | null;
  tags: string;
  created_at: number;
}

export interface VariantRow {
  id: string;
  product_id: string;
  size: string;
  price: number;
  compare_at: number | null;
  sku: string;
  stock_qty: number;
  low_stock_threshold: number;
  is_default: number;
  display_order: number;
}

export interface OrderRow {
  id: string;
  user_id: string | null;
  guest_email: string | null;
  status: string;
  items: string;
  subtotal: number;
  discount_amount: number;
  discount_code: string | null;
  shipping_cost: number;
  tax: number;
  total: number;
  shipping_address: string;
  tracking_number: string | null;
  tracking_carrier: string | null;
  tracking_url: string | null;
  is_subscription_order: number;
  loyalty_points_earned: number;
  loyalty_points_used: number;
  crypto_currency: string | null;
  crypto_amount: number | null;
  crypto_wallet_sent_to: string | null;
  crypto_tx_hash: string | null;
  admin_notes: string | null;
  created_at: number;
  confirmed_at: number | null;
  shipped_at: number | null;
  delivered_at: number | null;
}
