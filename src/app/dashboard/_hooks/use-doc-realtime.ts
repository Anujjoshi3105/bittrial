import { client } from "@/lib/supabase/utils/client";
import { Database } from "@/types/database.types";
import { useDocStore } from "@/lib/store/use-doc-store";
import { useSidebarStore } from "@/lib/store/use-sidebar-store";
import { useEffect } from "react";

type Page = Database["public"]["Tables"]["pages"]["Row"];
export default function useDocRealtime() {
  const { sidebarTreeRealtimeHandler } = useSidebarStore();
  const { docRealtimeHandler } = useDocStore();

  useEffect(() => {
    const subscribe = client
      .channel(`sidebar_menu_room`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pages",
        },
        (payload) => {
          const { eventType } = payload;
          const doc = payload.new as Page;

          if (doc) {
            docRealtimeHandler({ eventType, doc, old: payload.old });
            sidebarTreeRealtimeHandler({
              eventType,
              doc,
            });
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(subscribe);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
