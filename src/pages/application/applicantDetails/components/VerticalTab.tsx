import { useState, ReactNode } from 'react';
import {
  User,
  MapPin,
  Users,
  FileText,
  GraduationCap,
  Award,
  Briefcase,
  Globe,
  UserCheck,
  Heart,
  Phone,
  FileStack,
  UserPlus,
  CreditCard,
  FileCheck
} from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: ReactNode;
}

interface VerticalTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
}

const tabs: Tab[] = [
  { id: 'personalDetails', label: 'Personal Details', icon: <User className="w-4 h-4" /> },
  { id: 'addressDetails', label: 'Address Details', icon: <MapPin className="w-4 h-4" /> },
  { id: 'nextToKin', label: 'Next of Kin', icon: <Users className="w-4 h-4" /> },
  { id: 'applicationData', label: 'Application', icon: <FileText className="w-4 h-4" /> },
  { id: 'educationData', label: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'trainingData', label: 'Training', icon: <Award className="w-4 h-4" /> },
  { id: 'experienceData', label: 'Experience', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'ethnicityData', label: 'Ethnicity', icon: <Globe className="w-4 h-4" /> },
  { id: 'employmentData', label: 'Employment', icon: <UserCheck className="w-4 h-4" /> },
  { id: 'disabilityData', label: 'Disability', icon: <Heart className="w-4 h-4" /> },
  { id: 'refereeData', label: 'References', icon: <Phone className="w-4 h-4" /> },
  { id: 'documentData', label: 'Documents', icon: <FileStack className="w-4 h-4" /> },
  // { id: 'postEmployment', label: 'Post Employment', icon: <UserPlus className="w-4 h-4" /> },
  // { id: 'paymentData', label: 'Payment Details', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'terms', label: 'Terms', icon: <FileCheck className="w-4 h-4" /> },
];

export function VerticalTabs({ activeTab, onTabChange, children }: VerticalTabsProps) {
  return (
    <div className="flex gap-6 h-full">
      <aside className="w-64 flex-shrink-0">
        <nav className="bg-white rounded-lg shadow-lg overflow-hidden sticky top-4">
          <div className="py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-left transition-all
                  hover:bg-gray-50
                  ${
                    activeTab === tab.id
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'text-gray-700'
                  }
                `}
              >
                {tab.icon}
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </aside>

      <main className="flex-1 bg-white rounded-lg shadow-lg p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}

interface TabContentProps {
  value: string;
  activeTab: string;
  children: ReactNode;
}

export function TabContent({ value, activeTab, children }: TabContentProps) {
  if (value !== activeTab) return null;
  return <div>{children}</div>;
}
