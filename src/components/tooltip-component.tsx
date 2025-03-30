import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TooltipComponentProps {
  children: React.ReactNode;
  message: string;
  key?: string;
  side?: "top" | "right" | "bottom" | "left";
}

const TooltipComponent: React.FC<TooltipComponentProps> = ({
  children,
  message,
  side = "bottom",
}) => {
  return (
    <TooltipProvider key={Math.random()}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} className="text-xs">
          {message}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipComponent;
