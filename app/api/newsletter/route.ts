import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  consent: z.boolean(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success || !parsed.data.consent) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }
  const id = nanoid();
  try {
    await prisma.newsletter_signups.create({
      data: {
        id,
        email: parsed.data.email.toLowerCase(),
        consent: 1,
      },
    });
  } catch {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: true });
}
