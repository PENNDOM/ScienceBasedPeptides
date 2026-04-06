import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** GET /api/version — which commit this deployment was built from (Vercel sets VERCEL_GIT_* at build time). */
export function GET() {
  return NextResponse.json({
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    ref: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    env: process.env.VERCEL_ENV ?? null,
  });
}
