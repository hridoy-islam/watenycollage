// components/shared/HelperTooltip.tsx
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import React from "react";

interface HelperTooltipProps {
  text: string;
}

export const HelperTooltip: React.FC<HelperTooltipProps> = ({ text }) => {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="ml-1 inline-flex cursor-pointer text-gray-400 hover:text-gray-600">
            <Info size={14} strokeWidth={1.5} />
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="left"
          className="max-w-xs rounded-md bg-gray-500 text-sm text-white shadow-md -mt-4"
        >
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
