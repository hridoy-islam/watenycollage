// // components/shared/HelperTooltip.tsx
// import { Info } from "lucide-react";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger
// } from "@/components/ui/tooltip";
// import React from "react";

// interface HelperTooltipProps {
//   text: string;
// }

// export const HelperTooltip: React.FC<HelperTooltipProps> = ({ text }) => {
//   return (
//     <TooltipProvider delayDuration={100}>
//       <Tooltip>
//         <TooltipTrigger asChild>
//           <span className="ml-1 inline-flex cursor-pointer text-gray-400 hover:text-gray-600">
//             <Info size={14} strokeWidth={1.5} />
//           </span>
//         </TooltipTrigger>
//         <TooltipContent
//           side="left"
//           className="max-w-xs rounded-md bg-gray-500 text-sm text-white shadow-md -mt-4"
//         >
//           <p>{text}</p>
//         </TooltipContent>
//       </Tooltip>
//     </TooltipProvider>
//   );
// };

// components/shared/HelperTooltip.tsx
import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React, { useState } from "react";

interface HelperTooltipProps {
  text: string;
}

export const HelperTooltip: React.FC<HelperTooltipProps> = ({ text }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span
          onClick={() => setOpen((prev) => !prev)} // toggle on click
          className="ml-1 inline-flex cursor-pointer text-gray-400 hover:text-gray-600"
        >
          <Info size={14} strokeWidth={1.5} />
        </span>
      </PopoverTrigger>
      <PopoverContent
        side="left"
        className="max-w-xs rounded-md bg-gray-700 text-sm text-white shadow-md z-[999999]"
        onInteractOutside={(event) => {
          const target = event.target as HTMLElement;
          // ✅ Allow clicks inside inputs, buttons, and labels
          if (
            target.closest("input") ||
            target.closest("button") ||
            target.closest("label")
          ) {
            event.preventDefault(); // don’t close
          }
        }}
      >
        <p>{text}</p>
      </PopoverContent>
    </Popover>
  );
};
