import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type GitHubRepo = {
  id: string;
  agent_id: string | null;
  owner: string;
  name: string;
  default_branch: string;
  last_commit_sha: string | null;
  last_commit_at: string | null;
  created_at: string;
};

export type Deployment = {
  id: string;
  repo_id: string;
  environment: string;
  status: string;
  commit_sha: string | null;
  log_url: string | null;
  started_at: string;
  finished_at: string | null;
};

export function useGitHubRepos() {
  const [data, setData] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    const load = () => supabase.from("github_repos").select("*").order("created_at", { ascending: false })
      .then(({ data }) => mounted && (setData((data as any) ?? []), setLoading(false)));
    load();
    const ch = supabase.channel("rt:github_repos")
      .on("postgres_changes", { event: "*", schema: "public", table: "github_repos" }, load).subscribe();
    return () => { mounted = false; supabase.removeChannel(ch); };
  }, []);
  return { data, loading };
}

export function useDeployments(limit = 30) {
  const [data, setData] = useState<Deployment[]>([]);
  useEffect(() => {
    let mounted = true;
    const load = () => supabase.from("deployments").select("*").order("started_at", { ascending: false }).limit(limit)
      .then(({ data }) => mounted && setData((data as any) ?? []));
    load();
    const ch = supabase.channel("rt:deployments")
      .on("postgres_changes", { event: "*", schema: "public", table: "deployments" }, load).subscribe();
    return () => { mounted = false; supabase.removeChannel(ch); };
  }, [limit]);
  return { data };
}
