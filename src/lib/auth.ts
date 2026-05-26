import type { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "./supabaseClient";

export async function signInAdmin(email: string, password: string): Promise<{
  user: User;
  isAdmin: boolean;
}> {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Could not log in: ${error.message}`);
  }

  if (!data.user) {
    throw new Error("Could not log in with those details.");
  }

  return {
    user: data.user,
    isAdmin: await isCurrentUserAdmin(),
  };
}

export async function signOut() {
  const { error } = await getSupabaseClient().auth.signOut();

  if (error) {
    throw new Error(`Could not sign out: ${error.message}`);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await getSupabaseClient().auth.getUser();

  if (error) {
    if (error.name === "AuthSessionMissingError" || error.message === "Auth session missing!") {
      return null;
    }

    throw new Error(`Could not check your login session: ${error.message}`);
  }

  return data.user;
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  const { data, error } = await getSupabaseClient()
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not check admin access: ${error.message}`);
  }

  return Boolean(data);
}
