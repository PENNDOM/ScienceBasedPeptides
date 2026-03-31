import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendNewsletterWelcomeEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
  consent: z.boolean(),
});

export async function POST(req: Request) {
  const auth = await getCurrentUser();
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success || !parsed.data.consent) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const targetEmail = (auth?.email || parsed.data.email).toLowerCase();
  const existing = await prisma.newsletter_signups.findFirst({
    where: { email: targetEmail },
    select: { consent: true },
  });

  if (auth?.userId) {
    await prisma.users.update({
      where: { id: auth.userId },
      data: { email_consent: 1 },
    });
  }

  await prisma.newsletter_signups.upsert({
    where: { email: targetEmail },
    update: { consent: 1 },
    create: {
      id: nanoid(),
      email: targetEmail,
      consent: 1,
    },
  });

  // Send welcome only when this is a new signup or a re-subscribe.
  if (!existing || Number(existing.consent) !== 1) {
    void sendNewsletterWelcomeEmail({ to: targetEmail });
  }

  return NextResponse.json({ ok: true });
}
