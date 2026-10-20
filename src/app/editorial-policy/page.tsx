import Link from "next/link";
import { PolicyPage } from "@/components/PolicyPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Editorial policy: how we research, write and correct",
  description:
    "How Desi Nature chooses topics, selects sources, handles health and origin claims, uses AI tools, and corrects mistakes in its journal.",
  path: "/editorial-policy",
});

export default function EditorialPolicyPage() {
  return (
    <PolicyPage
      title="Editorial policy"
      path="/editorial-policy"
      intro="What we publish, how we check it, and what we will not do."
      lastReviewed="20 October 2026"
    >
      <h2>What the journal is for</h2>
      <p>
        We write practical guides for people who store, buy, cook with and grow food in Indian homes. A topic earns an
        article when we can answer a real question better, or more specifically for Indian conditions, than what is
        already available.
      </p>

      <h2>Sources</h2>
      <p>Facts that come from outside our own experience are cited at the end of each article. In order of preference we use:</p>
      <ol>
        <li>Indian regulators and government bodies, such as FSSAI and the Department of Consumer Affairs;</li>
        <li>ICAR institutes, state agricultural universities and their extension services;</li>
        <li>peer-reviewed research and international standards bodies such as Codex Alimentarius;</li>
        <li>established reference works.</li>
      </ol>
      <p>
        We do not cite sellers&apos; marketing pages as evidence. Each source is opened and checked against the claim it
        supports before an article is published, and the date we accessed it is shown.
      </p>

      <h2>Health, purity and origin claims</h2>
      <p>
        We do not say that a food cures, prevents or treats any condition. Nutrition and health statements need strong
        evidence from the kinds of sources above and a separate human review. We do not describe products as organic,
        A2, certified, pure or from a particular place unless we hold the documents to show it.
      </p>

      <h2>Experience and opinion</h2>
      <p>
        When an article draws on our own experience or opinion, it says so. We never invent customer stories, reviews,
        testimonials, credentials or first-hand experience.
      </p>

      <h2>Use of AI tools</h2>
      <p>
        We may use AI tools to help research outlines and prepare drafts. Every claim in a draft is listed and checked
        against a source by a person, and nothing is published without human approval. AI tools never publish to this
        site on their own.
      </p>

      <h2>Links</h2>
      <p>
        We link to our own articles and products where they genuinely help the reader. We do not accept payment for
        links or for coverage. If that ever changes for a specific article, it will be clearly disclosed in it.
      </p>

      <h2>Corrections</h2>
      <p>
        If you find an error, <Link href="/contact">tell us</Link>. We correct factual mistakes promptly, update the
        article&apos;s &ldquo;Updated&rdquo; date, and note significant corrections at the end of the article.
      </p>
    </PolicyPage>
  );
}
