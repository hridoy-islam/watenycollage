import React from 'react';
import { ChevronRight, X, CheckCircle } from 'lucide-react';

interface ValidationNotificationProps {
  validation: { [key: string]: { isValid: boolean; missingFields: string[] } };
  onTabClick: (tabId: string) => void;
  userId: string;
  onDeleteClick: () => void;
  onCancelClick: () => void;
}

const tabLabels: { [key: string]: string } = {
  general: 'General',
  equipment: 'Equipment',
  expense: 'Expenses',
  tag: 'Tag',
  dayOnOff: 'Day ON/OFF',
  note: 'Note',
  po: 'PO',
  break: 'Break',
  logs: 'Logs' 
};

export const ValidationNotification: React.FC<ValidationNotificationProps> = ({
  validation,
  onTabClick,
  onDeleteClick,
  onCancelClick,
}) => {
  const allTabs = Object.entries(validation).filter(([tabId]) =>
    Object.keys(tabLabels).includes(tabId)
  );

  if (allTabs.length === 0) return null;

  return (
    <div className="w-72 self-center rounded-lg border border-gray-200 bg-white shadow-lg">
      <div className="space-y-2 p-2">
        {allTabs.map(([tabId, tabValidation]) => {
          const isInvalid = !tabValidation.isValid;
          // 1. Calculate the missing count
          const missingCount = tabValidation.missingFields.length;
          return (
            <div
              key={tabId}
              className={`group cursor-pointer rounded-md border px-2 py-1 transition-all duration-200 ${
                isInvalid 
                  ? 'border-red-200 hover:border-red-400 bg-red-50/30' // Red tint if invalid
                  : 'border-gray-300 hover:border-theme'
              }`}
              onClick={() => onTabClick(tabId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-black">
                    {tabLabels[tabId]}
                  </span>
                  
                  {/* 2. Logic to show Count or Checkmark */}
                  {isInvalid ? (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {missingCount}
                    </span>
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>

                <ChevronRight className="h-4 w-4 text-theme transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
        
        <div className="my-2 h-px bg-gray-200" />

        {/* Delete Button */}
        <div
          className="group cursor-pointer rounded-md border border-gray-300 px-2 py-1 transition-all duration-200 hover:border-destructive hover:bg-red-50"
          onClick={onDeleteClick}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-destructive transition-transform group-hover:translate-x-1">
              Delete Schedule
            </span>
          </div>
        </div>

        {/* Cancel Button */}
        <div
          className="group cursor-pointer rounded-md border border-gray-300 px-2 py-1 transition-all duration-200 hover:bg-gray-100"
          onClick={onCancelClick} 
        >
          <div className="flex items-center justify-start gap-2">
            <X className="h-4 w-4 text-gray-500 transition-transform group-hover:rotate-90" />
            <span className="text-sm font-medium text-gray-600">
              Cancel
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};