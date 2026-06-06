import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Store } from "@/lib/types";

export interface SessionUser {
  id: string;
  email: string;
}

export interface DashboardContext {
  store: Store;
  user: SessionUser;
}

export const getDashboardContext = cache(async (): Promise<DashboardContext | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (!store) return null;

  return {
    store,
    user: { id: user.id, email: user.email },
  };
});

export async function getCurrentStore(): Promise<Store | null> {
  const context = await getDashboardContext();
  return context?.store ?? null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const context = await getDashboardContext();
  return context?.user ?? null;
}

export async function getStoreId(): Promise<string | null> {
  const store = await getCurrentStore();
  return store?.id ?? null;
}
