import React from 'react';
import { TabContentProps } from './types';
import PersonalDetails from './tabs/PersonalDetails';
import AddressData from './tabs/AddressData';
import EmergencyContactData from './tabs/EmergencyContactData';
import EducationData from './tabs/EducationData';
import EmploymentData from './tabs/EmploymentData';
import ComplianceData from './tabs/ComplianceData';
import CourseDetails from './tabs/CourseDetails';

const TabContent: React.FC<TabContentProps> = ({ activeTab, userData }) => {
  // Render the appropriate tab content based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'personalDetails':
        return <PersonalDetails userData={userData} />;
      case 'addressData':
        return <AddressData userData={userData} />;
      case 'emergencyContactData':
        return <EmergencyContactData userData={userData} />;
      case 'educationData':
        return <EducationData userData={userData} />;
      case 'employmentData':
        return <EmploymentData userData={userData} />;
      case 'complianceData':
        return <ComplianceData userData={userData} />;
      case 'courseDetails':
        return <CourseDetails userData={userData} />;
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div className="animate-fadeIn">
      {renderTabContent()}
    </div>
  );
};

export default TabContent;