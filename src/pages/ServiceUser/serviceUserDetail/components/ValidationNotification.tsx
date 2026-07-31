import React, { useState } from 'react';
import { ChevronRight, CheckCircle, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ValidationNotificationProps {
  validation: { [key: string]: { isValid: boolean; missingFields: string[] } };
  onTabClick: (tabId: string) => void;
  userId?: string;
}

const tabLabels: { [key: string]: string } = {
  general: 'General',
  contact: 'Contact',
  equality: 'Equality',
  emergency: 'Emergency Contact',
  notes: 'Note'
};

export const ValidationNotification: React.FC<ValidationNotificationProps> = ({
  validation,
  onTabClick,
  userId
}) => {
  // Filter out the notes tab and reorder it to be last
  const allTabs = Object.keys(tabLabels)
    .map((tabId) => [
      tabId,
      validation[tabId] || { isValid: true, missingFields: [] }
    ]) as [string, { isValid: boolean; missingFields: string[] }][];
  
  // Separate notes from other tabs
  const notesTab = allTabs.find(([tabId]) => tabId === 'notes');
  const otherTabs = allTabs.filter(([tabId]) => tabId !== 'notes');
  
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  if (allTabs.length === 0) return null;

  // Menu items with their sub-items
  const menuItems = [
    {
      id: 'dailyLogs',
      label: 'Daily Logs',
      path: 'daily-logs',
      subItems: []
    },
    {
      id: 'charts',
      label: 'Charts',
      isExpandable: true,
      subItems: [
        { id: 'generalCharts', label: 'General Charts', path: 'charts/general-charts' },
        { id: 'riskAssessmentScore', label: 'Risk Assessment Score', path: 'charts/risk-assessment-scores' }
      ]
    },
    {
      id: 'documents',
      label: 'Documents',
        path: 'documents',
      subItems: [
        
      ]
    },
    {
      id: 'medication',
      label: 'Medication',
      isExpandable: true,
      subItems: [
        { id: 'marChart', label: 'MAR Chart', path: 'mar-chart' },
        { id: 'stock', label: 'Stock', path: 'stock' }
      ]
    },
    {
      id: 'care-planning',
      label: 'Care Planning',
      isExpandable: true,
      subItems: [
        
        { 
          id: 'needAssessments', 
          label: 'Needs Assessment', 
          path: 'needs-assessment' 
        },
        { 
          id: 'riskAssessments', 
          label: 'Risk Assessments', 
          path: 'risk-assessments' 
        },
        { 
          id: 'supportPlans', 
          label: 'Support Plans', 
          path: 'support-plans' 
        },
      ]
    },
    {
      id: 'stock',
      label: 'Stock',
      path: 'stock',
      subItems: []
    },
    {
      id: 'consents',
      label: 'Consents',
      path: 'consents',
      subItems: []
    }
  ];

  return (
    <div className="w-72 self-center rounded-lg border border-gray-200 bg-white shadow-lg">
      <div className="space-y-2 p-2">
        {/* Show all tabs except notes first */}
        {otherTabs.map(([tabId, tabValidation]) => {
          const isInvalid = !tabValidation.isValid;
          const missingCount = tabValidation.missingFields.length;

          return (
            <div
              key={tabId}
              className={`group cursor-pointer rounded-md border px-2 py-1 transition-all duration-200 hover:border-watney ${
                isInvalid ? 'border-red-300' : 'border-gray-300'
              }`}
              onClick={() => onTabClick(tabId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-black">
                    {tabLabels[tabId] || tabId}
                  </span>
                  {isInvalid && (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {missingCount}
                    </span>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-watney transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}

        {/* Additional static items */}
        <div
          className="group cursor-pointer rounded-md border border-gray-300 px-2 py-1 transition-all duration-200 hover:border-watney"
          onClick={() => navigate(`schedule`)}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-black">Schedule</span>
            <ChevronRight className="h-4 w-4 text-watney transition-transform group-hover:translate-x-1" />
          </div>
        </div>
        <div
          className="group cursor-pointer rounded-md border border-gray-300 px-2 py-1 transition-all duration-200 hover:border-watney"
          onClick={() => navigate(`needs`)}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-black">Needs</span>
            <ChevronRight className="h-4 w-4 text-watney transition-transform group-hover:translate-x-1" />
          </div>
        </div>
        <div
          className="group cursor-pointer rounded-md border border-gray-300 px-2 py-1 transition-all duration-200 hover:border-watney"
          onClick={() => navigate(`emergency-contracts`)}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-black">Emergency Contracts</span>
            <ChevronRight className="h-4 w-4 text-watney transition-transform group-hover:translate-x-1" />
          </div>
        </div>
        <div
          className="group cursor-pointer rounded-md border border-gray-300 px-2 py-1 transition-all duration-200 hover:border-watney"
          onClick={() => navigate(`#`)}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-black">Funder</span>
            <ChevronRight className="h-4 w-4 text-watney transition-transform group-hover:translate-x-1" />
          </div>
        </div>
        <div
          className="group cursor-pointer rounded-md border border-gray-300 px-2 py-1 transition-all duration-200 hover:border-watney"
          onClick={() => navigate(`planner`)}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-black">Call Time</span>
            <ChevronRight className="h-4 w-4 text-watney transition-transform group-hover:translate-x-1" />
          </div>
        </div>
        
        {/* Menu items with submenus */}
        {menuItems.map((item) => (
          <div key={item.id}>
            {item.isExpandable && item.subItems.length > 0 ? (
              // Expandable menu item
              <>
                <div
                  className="group cursor-pointer rounded-md border border-gray-300 px-2 py-1 transition-all duration-200 hover:border-watney"
                  onClick={() => toggleMenu(item.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-black">{item.label}</span>
                    <ChevronDown 
                      className={`h-4 w-4 text-watney transition-transform duration-200 ${
                        expandedMenus[item.id] ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
                
                {/* Sub-items */}
                {expandedMenus[item.id] && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                    {item.subItems.map((subItem) => (
                      <div
                        key={subItem.id}
                        className="group cursor-pointer rounded-md border border-gray-300 px-2 py-1 transition-all duration-200 hover:border-watney"
                        onClick={() => navigate(`${subItem.path}`)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-black">{subItem.label}</span>
                          <ChevronRight className="h-4 w-4 text-watney transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              // Non-expandable menu item
              <div
                className="group cursor-pointer rounded-md border border-gray-300 px-2 py-1 transition-all duration-200 hover:border-watney"
                onClick={() => navigate(`${item.path}`)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-black">{item.label}</span>
                  <ChevronRight className="h-4 w-4 text-watney transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            )}
          </div>
        ))}

        <div
          className="group cursor-pointer rounded-md border border-gray-300 px-2 py-1 transition-all duration-200 hover:border-watney"
          onClick={() => onTabClick('settings')}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-black">Settings</span>
            <ChevronRight className="h-4 w-4 text-watney transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Notes tab at the very end */}
        {notesTab && (() => {
          const [tabId, tabValidation] = notesTab;
          const isInvalid = !tabValidation.isValid;
          const missingCount = tabValidation.missingFields.length;

          return (
            <div
              key={tabId}
              className={`group cursor-pointer rounded-md border px-2 py-1 transition-all duration-200 hover:border-watney ${
                isInvalid ? 'border-red-300' : 'border-gray-300'
              }`}
              onClick={() => onTabClick(tabId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-black">
                    {tabLabels[tabId] || tabId}
                  </span>
                  {isInvalid && (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {missingCount}
                    </span>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-watney transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};