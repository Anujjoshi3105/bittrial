import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AvatarComponent({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt?: string | null;
  className?: string;
}) {
  return (
    <Avatar className={cn("rounded-full size-8 cursor-pointer hover:scale-[0.96]", className)}>
      <AvatarImage src={src || "/logo.svg"} alt={alt || "user"} />
      <AvatarFallback className="capitalize">
        {alt ? alt.charAt(0) : "U"}
      </AvatarFallback>
    </Avatar>
  );
}
