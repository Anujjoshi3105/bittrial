import { Button } from "@/components/ui/button";
import { useDocStore } from "@/lib/store/use-doc-store";
import { RefreshCwIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function Refresh() {
  const params = useParams();
  const id = params?.docID as string;
  const { getDocAsync, loadingDoc } = useDocStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await getDocAsync(id);
    setIsRefreshing(false);
  };

  return (
    <Button
      size="smIcon"
      onClick={handleRefresh}
      disabled={loadingDoc || isRefreshing}>
      <RefreshCwIcon
        className={loadingDoc || isRefreshing ? "animate-spin" : ""}
      />
    </Button>
  );
}
