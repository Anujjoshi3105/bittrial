import { ReactNode, ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

interface SidebarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  asChild?: boolean;
}

export default function SidebarButton({
  children,
  className,
  asChild,
  ...props
}: SidebarButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "py-2 inline-flex w-full hover:scale-[1.005] ease-in-out duration-300 items-center gap-2 whitespace-nowrap text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-8 justify-start px-3 font-normal hover:bg-primary/5 rounded-md transition-colors",
        className
      )}
      {...props}>
      {children}
    </Comp>
  );
}
