import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/news/$id")({
  head: () => ({ meta: [{ title: "Article — Mystery Town" }] }),
  component: NewsItem,
});

function NewsItem() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["news", id],
    queryFn: async () => (await supabase.from("news").select("*").eq("id", id).maybeSingle()).data,
  });
  return (
    <SiteLayout>
      <article className="max-w-3xl mx-auto px-4 py-20">
        <Link to="/news" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> All news</Link>
        {isLoading && <p className="mt-6">Loading...</p>}
        {!isLoading && !data && <p className="mt-6">Article not found.</p>}
        {data && (
          <>
            <div className="mt-6 text-xs uppercase tracking-widest text-primary">{new Date(data.created_at).toLocaleDateString()}</div>
            <h1 className="mt-2 font-display text-5xl font-black">{data.title}</h1>
            <p className="mt-3 text-lg text-muted-foreground italic">{data.excerpt}</p>
            <div className="mt-8 prose prose-invert max-w-none whitespace-pre-wrap">{data.body}</div>
          </>
        )}
      </article>
    </SiteLayout>
  );
}
