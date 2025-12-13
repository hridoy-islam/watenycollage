import React, { useState } from 'react';
import { TabContentProps } from './types';
import PersonalDetails from './tabs/PersonalDetails';
import AddressData from './tabs/ApplicationData';
import EmergencyContactData from './tabs/NextOfKinData';
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
import AddressDetails from './tabs/addressData';
import TrainingData from './tabs/TrainingData';
import DisabilityData from './tabs/DisabilityData';
import ExperienceData from './tabs/ExperienceData';
import NextToKin from './tabs/NextOfKinData';

import EthnicityData from './tabs/EthnicityData';
import PaymentData from './tabs/PaymentData';
import PostEmployment from './tabs/PostEmployment';
import { useNavigate, useParams } from 'react-router-dom';

const TabContent: React.FC<TabContentProps> = ({ activeTab, userData,refreshData,loading }) => {
  const [isEditing, setIsEditing] = useState(true);
  const {id,userId}= useParams();
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSave = async (updatedUserData) => {
    try {
      await axiosInstance.patch(`/users/${userId}`, updatedUserData);

      setIsEditing(false);
          navigate(-1);
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
    navigate(-1);
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
      refreshData,
      loading
    };

   switch (activeTab) {
  case "personalDetails":
    return <PersonalDetails {...commonProps} />;
  case "addressDetails":
    return <AddressDetails {...commonProps} />;
  case "nextToKin":
    return <NextToKin {...commonProps} />;
  case "applicationData":
    return <ApplicationData {...commonProps} />;
  case "educationData":
    return <EducationData {...commonProps} />;
  case "trainingData":
    return <TrainingData {...commonProps} />;
  case "experienceData":
    return <ExperienceData {...commonProps} />;
  case "ethnicityData":
    return <EthnicityData {...commonProps} />;
  case "employmentData":
    return <EmploymentData {...commonProps} />;
  case "disabilityData":
    return <DisabilityData {...commonProps} />;
  case "refereeData":
    return <RefereeDetails {...commonProps} />;
  case "documentData":
    return <DocumentData {...commonProps} />;
  case "postEmployment":
    return <PostEmployment {...commonProps} />;
  case "paymentData":
    return <PaymentData {...commonProps} />;
  default:
    return <div>Select a tab to view content</div>;
}

  };

  return <div className="animate-fadeIn">{renderTabContent()}</div>;
};

export default TabContent;
