import React from 'react';
import { AlertCircle, Check } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  component: React.ReactNode;
}

interface TabValidation {
  isValid: boolean;
  missingFields: string[];
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  validation?: { [key: string]: TabValidation };
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, validation = {} }) => {
  const getTabStatus = (tabId: string) => {
    const tabValidation = validation[tabId];
    if (!tabValidation) return 'neutral';
    return tabValidation.isValid ? 'complete' : 'incomplete';
  };

  const getTabIcon = (tabId: string) => {
    const status = getTabStatus(tabId);
    switch (status) {
      case 'complete':
        return null;
      case 'incomplete':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getTabStyles = (tabId: string) => {
    const status = getTabStatus(tabId);
    const isActive = activeTab === tabId;
    
    if (isActive) {
      return 'border-blue-500 text-blue-600 bg-blue-50';
    }
    
    switch (status) {
      case 'complete':
        return 'border-transparent text-green-600 hover:text-green-700 hover:border-green-300';
      case 'incomplete':
        return 'border-transparent text-red-600 hover:text-red-700 hover:border-red-300';
      default:
        return 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
    }
  };

  return (
    <div className="mb-8">
   
      <div className="tab-content">
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};