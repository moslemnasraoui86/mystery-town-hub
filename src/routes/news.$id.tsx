import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/news/$id")({
  loader: async ({ params }) => {
    const { data } = await supabase.from("news").select("*").eq("id", params.id).maybeSingle();
    if (!data) throw notFound();
    return data;
  },
  head: ({ params, loaderData }) => {
    const url = `https://prime-roleplay.lovable.app/news/${params.id}`;
    if (!loaderData) {
      return {
        meta: [{ title: "Article — Prime RolePlay" }],
        links: [{ rel: "canonical", href: url }],
      };
    }
    const desc = (loaderData.excerpt ?? loaderData.title ?? "Prime RolePlay news article.").slice(0, 160);
    return {
      meta: [
        { title: `${loaderData.title} — Prime RolePlay` },
        { name: "description", content: desc },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "article:published_time", content: loaderData.created_at },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: loaderData.title,
          description: desc,
          datePublished: loaderData.created_at,
          author: { "@type": "Organization", name: "Prime RolePlay" },
          publisher: { "@type": "Organization", name: "Prime RolePlay" },
          mainEntityOfPage: url,
        }),
      }],
    };
  },
  component: NewsItem,
});

function NewsItem() {
  const data = Route.useLoaderData();
  return (
    <SiteLayout>
      <article className="max-w-3xl mx-auto px-4 py-20">
        <Link to="/news" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> All news</Link>
        <div className="mt-6 text-xs uppercase tracking-widest text-primary">{new Date(data.created_at).toLocaleDateString()}</div>
        <h1 className="mt-2 font-display text-5xl font-black">{data.title}</h1>
        {data.excerpt && <p className="mt-3 text-lg text-muted-foreground italic">{data.excerpt}</p>}
        <div className="mt-8 prose prose-invert max-w-none whitespace-pre-wrap">{data.body}</div>
      </article>
    </SiteLayout>
  );
}
