import { createClient } from "@/lib/supabase/server";
import type { Store } from "@/lib/types";

export interface SessionUser {
  id: string;
  email: string;
}

export async function getCurrentStore(): Promise<Store | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  return data;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  return { id: user.id, email: user.email };
}

export async function getStoreId(): Promise<string | null> {
  const store = await getCurrentStore();
  return store?.id ?? null;
}
