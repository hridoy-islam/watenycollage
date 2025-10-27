import React, { useState } from 'react';
import { TabContentProps } from './types';
import PersonalDetails from './tabs/PersonalDetails';
import AddressData from './tabs/ApplicationData';
import EmergencyContactData from './tabs/EmergencyContactData';
import EducationData from './tabs/EducationData';
import EmploymentData from './tabs/EmploymentData';
import ComplianceData from './tabs/DisabilityData';
import CourseDetails from './tabs/CourseDetails';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast';
import { useSelector } from 'react-redux';
import DocumentData from './tabs/DocumentData';
import ApplicationData from './tabs/ApplicationData';
import RefereeDetails from './tabs/RefereeData';
import { useNavigate, useParams } from 'react-router-dom';

const TabContent: React.FC<TabContentProps> = ({
  activeTab,
  userData,
  refreshData
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const { id, userId } = useParams();

  const navigate = useNavigate();

  const { toast } = useToast();

  const handleSave = async (updatedUserData) => {
    try {
      await axiosInstance.patch(`/users/${userId}`, updatedUserData);

      setIsEditing(false);
      // navigate(-1);
      toast({ title: 'Changes saved successfully!' });
    } catch (error) {
      console.error('Error updating user data:', error);
      toast({
        title: 'Failed to save changes. Please try again.',
        className: 'destructive'
      });
    }
  };
  const handleCancel = () => {
    setIsEditing(false);
    // navigate(-1);
  };

  const handleEdit = () => {
    setIsEditing(true);
    // navigate(-1);
  };

  // Render the appropriate tab content based on the active tab
  const renderTabContent = () => {
    const commonProps = {
      userData,
      isEditing,
      onSave: handleSave,
      onCancel: handleCancel,
      onEdit: handleEdit,
      refreshData
    };

    switch (activeTab) {
      case 'personalDetails':
        return <PersonalDetails {...commonProps} />;
      case 'applicationData':
        return <ApplicationData {...commonProps} />;
      case 'emergencyContactData':
        return <EmergencyContactData {...commonProps} />;
      case 'educationData':
        return <EducationData {...commonProps} />;
      case 'employmentData':
        return <EmploymentData {...commonProps} />;
      case 'disabilityData':
        return <ComplianceData {...commonProps} />;
      case 'documentData':
        return <DocumentData {...commonProps} />;
      case 'refereeData':
        return <RefereeDetails {...commonProps} />;
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return <div className="animate-fadeIn">{renderTabContent()}</div>;
};

export default TabContent;
