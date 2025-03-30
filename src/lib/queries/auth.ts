"use server";

import { eq, ilike } from "drizzle-orm";
import db from "@/lib/supabase/db";

import { createClient } from "@/lib/supabase/utils/server";
import { getErrorMessage } from "@/lib/helper/error.helper";
import { Provider } from "@supabase/supabase-js";
import { toastError, toastSuccess } from "@/lib/helper/toast";
import { revalidatePath } from "next/cache";
import { users } from "../supabase/migrations/schema";
import { User } from "@/types/supabase.types";

/** Get authenticated user */
export async function getAuthUser() {
  try {
    const supabaseClient = await createClient();
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) return null;
    return await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, user.id),
    });
  } catch {
    return null;
  }
}

export async function getUser(userId: string) {
  try {
    return await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
    });
  } catch {
    return null;
  }
}
/** Search users from their email */
export async function searchUser(email: string) {
  if (!email) return [];

  return db
    .select()
    .from(users)
    .where(ilike(users.email, `${email}%`));
}

/** Update user information */
export async function updateUser(newUser: Partial<User>, userId: string) {
  if (!userId) return undefined;

  try {
    const data = await db
      .update(users)
      .set(newUser)
      .where(eq(users.id, userId))
      .returning();
    return {
      data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: getErrorMessage(error as Error),
    };
  }
}

/** Reset password */
export async function resetPasswordAsync(email: string) {
  try {
    const supabaseClient = await createClient();
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email);
    if (error) throw new Error(error.message);
  } catch (error) {
    return { error: getErrorMessage(error as Error) };
  }
}

/** Verify password reset */
export async function resetPasswordVerifyAsync(token: string, email: string) {
  try {
    const supabaseClient = await createClient();
    const { error } = await supabaseClient.auth.verifyOtp({
      email,
      token,
      type: "recovery",
    });
    if (error) throw new Error(error.message);
  } catch (error) {
    return { error: getErrorMessage(error as Error) };
  }
}

/** Login user */
export async function loginAsync({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const supabaseClient = await createClient();
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) return;

    if (error.message.toLowerCase() === "email not confirmed") {
      throw new Error("NEED_CONFIRM_EMAIL");
    }
    throw new Error(
      error.status === 400 ? "Invalid email or password" : error.message
    );
  } catch (error) {
    return {
      error: getErrorMessage(error as Error),
      isNeedConfirmEmail:
        getErrorMessage(error as Error) === "NEED_CONFIRM_EMAIL",
    };
  }
}

/** Sign up user */
export async function signUpAsync({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const supabaseClient = await createClient();
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
    });
    if (!error && data.user?.identities?.length === 0) {
      throw new Error("Email already in use");
    }
    if (error) throw new Error(error.message);
  } catch (error) {
    return { error: getErrorMessage(error as Error) };
  }
}

/** Sign up with OAuth */
export async function signUpWithOauth({ provider }: { provider: Provider }) {
  try {
    const supabaseClient = await createClient();
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/oauth/callback`;
    if (!redirectTo) throw new Error("Undefined callback URL!");

    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (error) throw new Error(error.message);
  } catch (error) {
    return { error: getErrorMessage(error as Error) };
  }
}

/** Verify email sign-up */
export async function signUpVerifyAsync({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  try {
    const supabaseClient = await createClient();
    const { error } = await supabaseClient.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error) throw new Error(error.message);
  } catch (error) {
    return { error: getErrorMessage(error as Error) };
  }
}

/** Resend OTP */
export async function resendOtpAsync({ email }: { email: string }) {
  try {
    const supabaseClient = await createClient();
    const { error } = await supabaseClient.auth.resend({
      type: "signup",
      email,
    });
    if (error) throw new Error(error.message);
  } catch (error) {
    return { error: getErrorMessage(error as Error) };
  }
}

export async function deleteUser() {
  try {
    const supabaseClient = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return toastError({
        description: "User not authenticated to delete account",
      });
    }

    const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(
      user.id
    );
    if (deleteError) {
      toastError({ description: "Failed to delete account" });
      throw new Error("Failed to delete account");
    }

    revalidatePath("/");
    toastSuccess({ description: "Account deleted successfully" });
  } catch (error) {
    console.log("Failed to delete account:", error);
  }
}

export async function updatePasswordAsync(password: string) {
  try {
    const supabaseClient = await createClient();
    const { error } = await supabaseClient.auth.updateUser({ password });
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    return { error: getErrorMessage(error as Error) };
  }
}

export async function signOutAsync(
  scope = "local" as "local" | "global" | "others"
) {
  const messages = {
    local: "Successfully logged out.",
    global: "Logged out from all devices.",
    others: "Logged out from other devices.",
  };

  try {
    const supabaseClient = await createClient();
    const { error } = await supabaseClient.auth.signOut({ scope });
    if (error) throw new Error(error.message);
    toastSuccess({ description: messages[scope] || messages.local });
  } catch {
    toastError({ description: "Failed to log out!" });
    return { error: "Failed to log out." };
  }
}

export async function updateProfileAsync(opt: {
  full_name?: string;
  user_name?: string;
  avatar_url?: string;
  bio?: string;
}) {
  try {
    const supabaseClient = await createClient();
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    console.log("Update Profile user: ", user);
    if (!user) return;

    const { error } = await supabaseClient
      .from("users")
      .upsert({ id: user.id, ...opt }, { onConflict: "id" })
      .select("full_name, user_name, avatar_url, bio")
      .single();

    if (error) {
      throw new Error(
        error.message.includes("profiles_userName_key")
          ? "userName is not available."
          : error.message
      );
    }

    return { error: null };
  } catch (error) {
    return { error: getErrorMessage(error as Error) };
  }
}

export async function updateEmailAsync(email: string) {
  try {
    const supabaseClient = await createClient();
    const { error } = await supabaseClient.auth.updateUser({ email });
    if (error) throw new Error(error.message);
    return { error: null };
  } catch (error) {
    return { error: getErrorMessage(error as Error) };
  }
}

export async function updateEmailVerifyAsync(opt: {
  token: string;
  email: string;
}) {
  try {
    const supabaseClient = await createClient();
    const { error } = await supabaseClient.auth.verifyOtp({
      ...opt,
      type: "email_change",
    });
    if (error) throw new Error(error.message);
  } catch (error) {
    return { error: getErrorMessage(error as Error) };
  }
}
