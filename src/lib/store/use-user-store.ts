import { getErrorMessage } from "@/lib/helper/error.helper";
import { client } from "@/lib/supabase/utils/client";
import { toastError, toastLoading, toastSuccess } from "@/lib/helper/toast";
import { getImage } from "@/lib/queries/storage";
import { type SignOut, type User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { create } from "zustand";

type UserState = {
  currentUser: User | null;
  username: string | null;
  fullname: string | null;
  bio: string | null;
  avatar: string | null;
};

type UserAction = {
  reset: () => void;
  setCurrentUser: (user: User) => void;
  setProfile: (opt: {
    username: string | null;
    fullname: string | null;
    avatar: string | null;
    bio: string | null;
  }) => void;
  signOutAsync: (scope?: SignOut["scope"]) => Promise<{ error: string } | void>;
  updatePasswordAsync(password: string): Promise<{ error: string } | void>;
  getCurrentUserAsync: () => Promise<{ error: string } | void>;
  getCurrentProfileUserAsync: () => Promise<void>;
  updateProfileAsync(opt: {
    fullname: string;
    username: string;
    bio: string | null;
    image_url: string | null;
  }): Promise<{ error: string } | void>;
  updateEmailAsync(email: string): Promise<{ error: string } | void>;
  updateEmailVerifyAsync(opt: {
    token: string;
    email: string;
  }): Promise<{ error: string } | void>;
};

const initialState: UserState = {
  currentUser: null,
  username: null,
  fullname: null,
  bio: null,
  avatar: null,
};

export const useUserStore = create<UserState & UserAction>()((set, get) => ({
  ...initialState,
  setCurrentUser: (user) => set({ currentUser: user }),
  reset: () => set(initialState),
  setProfile: ({ username, fullname, avatar, bio }) =>
    set({ username, fullname, avatar, bio }),
  async updatePasswordAsync(password) {
    try {
      const { error } = await client.auth.updateUser({ password });

      if (error) throw new Error(error.message);

      toastSuccess({ description: "Password has been changed successfully." });
    } catch (error) {
      return { error: getErrorMessage(error as Error) };
    }
  },
  async signOutAsync(scope = "local") {
    const message = {
      success: {
        local: "Successfully logged out.",
        global: "Successfully logged out all device",
        others: "Successfully logged out other device",
      },
      error: {
        local: "Something went wrong! Failed to log out",
        global: "Something went wrong! Failed to log out all device",
        others: "Something went wrong! Failed to log out other device",
      },
    };

    const id = toast("signOut");
    toastLoading({ description: "Logging out...", id });

    try {
      const { error } = await client.auth.signOut({ scope });
      if (error) throw new Error(error.message);
      toastSuccess({ description: message.success[scope], id });
      window.location.reload();
    } catch {
      toastError({ description: message.error[scope], id });
      return { error: message.error[scope] };
    }
  },
  async getCurrentProfileUserAsync() {
    try {
      const { data, error } = await client
        .from("users")
        .select(`username, fullname, image_url, bio`);
      if (error) throw new Error(error.message);

      const avatar = getImage(
        data?.length ? data[0]?.image_url : null,
        "avatars"
      );
      set({
        fullname: data?.length ? data[0]?.fullname : null,
        username: data?.length ? data[0]?.username : null,
        bio: data?.length ? data[0]?.bio : null,
        avatar: avatar,
      });
    } catch {
      toastError({ description: "Failed to get user profile!" });
    }
  },
  async getCurrentUserAsync() {
    try {
      const { data, error } = await client.auth.getUser();
      if (error) throw new Error(error.message);
      set({ currentUser: data.user });
    } catch {
      const message = "Something went wrong. Please reload or try login again.";
      toastError({ description: message });
      return { error: message };
    }
  },
  async updateProfileAsync(opt) {
    try {
      const { data, error } = await client
        .from("users")
        .upsert(opt, { onConflict: "id" })
        .select(`username, fullname, bio, image_url`)
        .single();

      const avatar = getImage(data?.image_url, "avatars");
      if (!error) {
        set({
          username: data.username,
          fullname: data.fullname,
          bio: data.bio,
          avatar: avatar,
        });
        toastSuccess({ description: "Profile has been changed successfully." });
        return;
      }

      throw new Error(
        error.message.includes("profiles_username_key")
          ? "Username is not available."
          : error.message
      );
    } catch (error) {
      return { error: getErrorMessage(error as Error) };
    }
  },
  async updateEmailAsync(email) {
    try {
      const { error } = await client.auth.updateUser({ email });
      if (error) throw new Error(error.message);
    } catch (error) {
      return { error: getErrorMessage(error as Error) };
    }
  },
  async updateEmailVerifyAsync(opt) {
    try {
      const { error } = await client.auth.verifyOtp({
        ...opt,
        type: "email_change",
      });
      if (error) throw new Error(error.message);

      let currentUser = get().currentUser;

      currentUser = currentUser ? { ...currentUser, email: opt.email } : null;
      set({ currentUser });

      toastSuccess({ description: "Email has been changed successfully." });
    } catch (error) {
      return { error: getErrorMessage(error as Error) };
    }
  },
}));
