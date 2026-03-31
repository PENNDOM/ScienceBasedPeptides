import { NextResponse } from "next/server";
import { z } from "zod";
import { sendSupportIntakeEmail } from "@/lib/email";

const schema = z.object({
  type: z.enum(["contact", "coa_request"]),
  name: z.string().min(1),
  email: z.string().email(),
  orderNumber: z.string().optional(),
  message: z.string().min(1),
  productSlug: z.string().optional(),
  productName: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await sendSupportIntakeEmail(parsed.data);
  return NextResponse.json({ ok: true });
}

