/**
 * Shows the Git commit Vercel built (only when VERCEL_GIT_COMMIT_SHA is set).
 * Use this to confirm production matches GitHub `main` without guessing about cache.
 */
export function DeployStamp() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  if (!sha) return null;
  return (
    <p
      className="pointer-events-none text-center font-mono text-[10px] text-[var(--text-muted)]/35 pb-2"
      title={`Deployed from commit ${sha}`}
    >
      {sha.slice(0, 7)}
    </p>
  );
}
