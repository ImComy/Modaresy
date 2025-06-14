import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from "@/lib/utils"; // or clsx

const Tooltip = ({ children, content, className }) => (
  <TooltipPrimitive.Provider delayDuration={150}>
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={6}
          className={cn(
            "z-50 max-w-xs rounded-md bg-background px-3 py-2 text-xs text-muted-foreground border shadow-sm animate-in fade-in-0 zoom-in-95",
            className
          )}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-muted" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  </TooltipPrimitive.Provider>
);

export default Tooltip;
