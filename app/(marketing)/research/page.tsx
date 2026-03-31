import Link from "next/link";
import { getMdxSlugs } from "@/lib/mdx";
import { FooterDisclaimer } from "@/components/ui/disclaimer";
import { Container, SectionHeading } from "@/components/ui/shell";

export default function ResearchHubPage() {
  const slugs = getMdxSlugs("research");
  const titles: Record<string, string> = {
    "peptide-purity-basics": "Understanding peptide purity in research materials",
    "coa-readership": "How to read a certificate of analysis (COA)",
  };

  return (
    <Container className="section-shell max-w-3xl">
      <SectionHeading>Research library</SectionHeading>
      <p className="mt-4 text-[var(--text-muted)]">
        Technical notes on specifications, COAs, and laboratory documentation. Not medical or regulatory advice.
      </p>
      <ul className="mt-10 space-y-4">
        {slugs.map((s) => (
          <li key={s}>
            <Link href={`/research/${s}`} className="text-lg text-accent hover:underline">
              {titles[s] ?? s}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-16 max-w-3xl">
        <FooterDisclaimer />
      </div>
    </Container>
  );
}
