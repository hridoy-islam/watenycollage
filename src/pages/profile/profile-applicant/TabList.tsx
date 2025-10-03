import React from 'react';
import {
  User, MapPin, Phone, BookOpen, Briefcase,
  FileCheck, GraduationCap, ChevronRight,
  File,
  User2Icon,
  UserCircle,
  ClipboardList,
  FileText,
  Home,
  Wallet
} from 'lucide-react';
import { TabListProps, TabItemProps, TabType } from './types';

// Individual tab item component
const TabItem: React.FC<TabItemProps> = ({ id, label, icon, isActive, onClick }) => {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={`w-full flex items-center px-4 py-3 text-left text-md ${isActive
          ? 'bg-indigo-50 text-watney border-l-4 border-watney/60 font-medium'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        } transition-all duration-200`}
    >
      <span className="mr-3">{icon}</span>
      <span className="flex-1">{label}</span>
      <ChevronRight size={16} className={`ml-2 transition-transform duration-200 ${isActive ? 'text-watney rotate-90' : ''}`} />
    </button>
  );
};

const TabList: React.FC<TabListProps> = ({ activeTab, setActiveTab }) => {
  // Define tab data
 const tabs = [
  { id: "personalDetails" as TabType, label: "Personal Details", icon: <User size={20} /> },
  { id: "addressDetails" as TabType, label: "Address Details", icon: <Home size={20} /> },
  { id: "nextToKin" as TabType, label: "Next of Kin", icon: <Phone size={20} /> },

  { id: "applicationData" as TabType, label: "Application Details", icon: <ClipboardList size={20} /> },
  { id: "educationData" as TabType, label: "Education", icon: <GraduationCap size={20} /> },
  { id: "trainingData" as TabType, label: "Training", icon: <BookOpen size={20} /> },
  { id: "experienceData" as TabType, label: "Experience", icon: <Briefcase size={20} /> },
  { id: "ethnicityData" as TabType, label: "Ethnicity", icon: <User2Icon size={20} /> },

  { id: "employmentData" as TabType, label: "Employment", icon: <Briefcase size={20} /> },
  { id: "disabilityData" as TabType, label: "Disability", icon: <User2Icon size={20} /> },
  { id: "refereeData" as TabType, label: "Reference", icon: <UserCircle size={20} /> },
  { id: "documentData" as TabType, label: "Documents", icon: <FileText size={20} /> },
  { id: "postEmployment" as TabType, label: "Post Employment", icon: <ClipboardList size={20} /> },
  { id: "paymentData" as TabType, label: "Payment Details", icon: <Wallet size={20} /> },
];

  return (
    <div className="py-2">
      <div className="px-4 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-800">Profile Sections</h2>
        <p className="mt-1 text-sm text-gray-500">Manage your profile information</p>
      </div>
      <nav className="mt-2">
        {tabs.map(tab => (
          <TabItem
            key={tab.id}
            id={tab.id}
            label={tab.label}
            icon={tab.icon}
            isActive={activeTab === tab.id}
            onClick={setActiveTab}
          />
        ))}
      </nav>
    </div>
  );
};

export default TabList;