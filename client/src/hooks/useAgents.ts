import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export function useAgents() {
  const q = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("agents").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    const ch = supabase
      .channel("agents-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "agents" }, () => q.refetch())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [q]);

  return q;
}

export function useAgent(id?: string) {
  return useQuery({
    queryKey: ["agent", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("agents").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}