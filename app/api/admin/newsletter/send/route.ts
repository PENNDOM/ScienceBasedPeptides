import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendNewsletterBroadcastEmail } from "@/lib/email";

const schema = z.object({
  subject: z.string().min(3).max(180),
  headline: z.string().min(3).max(180),
  message: z.string().min(3).max(10000),
  ctaLabel: z.string().max(80).optional(),
  ctaUrl: z.string().url().optional(),
  maxRecipients: z.number().int().positive().max(5000).optional(),
  dryRun: z.boolean().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const {
    subject,
    headline,
    message,
    ctaLabel,
    ctaUrl,
    maxRecipients = 1000,
    dryRun = false,
  } = parsed.data;

  const recipients = (await prisma.$queryRawUnsafe(
    `SELECT DISTINCT LOWER(ns.email) AS email
     FROM newsletter_signups ns
     LEFT JOIN users u ON LOWER(u.email) = LOWER(ns.email)
     WHERE ns.consent = 1
       AND (u.id IS NULL OR u.email_consent = 1)
     ORDER BY LOWER(ns.email) ASC
     LIMIT $1`,
    maxRecipients
  )) as Array<{ email: string }>;

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      recipients: recipients.length,
      sample: recipients.slice(0, 10).map((r) => r.email),
    });
  }

  let sent = 0;
  for (const recipient of recipients) {
    try {
      await sendNewsletterBroadcastEmail({
        to: recipient.email,
        subject,
        headline,
        message,
        ctaLabel,
        ctaUrl,
      });
      sent += 1;
    } catch {
      // continue best-effort; caller receives sent count
    }
  }

  return NextResponse.json({
    ok: true,
    recipients: recipients.length,
    sent,
  });
}

