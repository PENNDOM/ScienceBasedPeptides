import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  eventType: z.enum(["site_open"]),
  source: z.enum(["organic_site_open", "referral_link"]),
  path: z.string().min(1).max(300),
});

async function ensureMarketingEventsTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS marketing_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      source TEXT,
      path TEXT,
      session_key TEXT,
      created_at BIGINT NOT NULL
    );
  `);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const sessionKey = req.headers.get("x-session-key") || null;
  const now = Math.floor(Date.now() / 1000);
  const id = nanoid();

  await ensureMarketingEventsTable();
  await prisma.$executeRawUnsafe(
    `INSERT INTO marketing_events (id, event_type, source, path, session_key, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    id,
    parsed.data.eventType,
    parsed.data.source,
    parsed.data.path,
    sessionKey,
    now
  );

  return NextResponse.json({ ok: true });
}

