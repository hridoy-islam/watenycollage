import React, { useEffect, useState } from 'react';
import { MoveLeft, AlertCircle } from 'lucide-react';
import { Tabs } from './components/Tabs';
import PersonalInfoTab from './tabs/PersonalInfoTab';
import AddressTab from './tabs/ContactTab';
import MiscellaneousTab from './tabs/MiscellaneousTab';
import EqualityTab from './tabs/EqualityTab';
import { ValidationNotification } from './components/ValidationNotification';
import { useEditApplicant } from './hooks/useEditApplicant';
import { Button } from '@/components/ui/button';
import EmergencyContactTab from './tabs/EmergencyContacTab';
import CriticalInfoTab from './tabs/CriticalInformation';
import EquipmentTab from './tabs/EquipmentTab';

import NoteTab from './tabs/NoteTab';
import PrimaryBranchTab from './tabs/PrimaryBranchTab';
import ContactTab from './tabs/ContactTab';
import SettingTab from './tabs/SettingTab';
import { CarePlanTab } from './tabs/CarePlanTab';
import { MentalCapacityTab } from './tabs/MentalCapacityTab';
import { ReviewTab } from './tabs/ReviewTab';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';

const ServiceuserDetailPage = () => {
  const { sid } = useParams();
  const {
    loading,
    activeTab,
    setActiveTab,
    formData,
    handleFieldUpdate,
    handleDateChange,
    handleSelectChange,
    handleCheckboxChange,
    isFieldSaving,
    getMissingFields,
    getTabValidation
  } = useEditApplicant(sid);

  const tabValidation = getTabValidation();



  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
                      <BlinkingDots size="large" color="bg-watney" />
          
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'general',
      label: 'General',
      component: (
        <PersonalInfoTab
          formData={formData}
          onUpdate={handleFieldUpdate}
          onDateChange={handleDateChange}
          onSelectChange={handleSelectChange}
          isFieldSaving={isFieldSaving}
          getMissingFields={getMissingFields}
        />
      )
    },
    {
      id: 'contact',
      label: 'Contact',
      component: (
        <ContactTab
          formData={formData}
          onUpdate={handleFieldUpdate}
          onSelectChange={handleSelectChange}
          isFieldSaving={isFieldSaving}
          getMissingFields={getMissingFields}
        />
      )
    },
    {
      id: 'equality',
      label: 'Equality',
      component: (
        <EqualityTab
          formData={formData}
          onUpdate={handleFieldUpdate}
          onSelectChange={handleSelectChange}
          isFieldSaving={isFieldSaving}
          getMissingFields={getMissingFields}
        />
      )
    },

    // {
    //   id: 'emergency',
    //   label: 'Emergency Contact',
    //   component: (
    //     <EmergencyContactTab
    //       formData={formData}
    //       onUpdate={handleFieldUpdate}
    //       onDateChange={handleDateChange}
    //       onSelectChange={handleSelectChange}
    //       isFieldSaving={isFieldSaving}
    //       getMissingFields={getMissingFields}
    //     />
    //   )
    // },

   
    {
      id: 'notes',
      label: 'Note',
      component: (
        <NoteTab
          formData={formData}
          onDateChange={handleDateChange}
          onUpdate={handleFieldUpdate}
          onSelectChange={handleSelectChange}
          isFieldSaving={isFieldSaving}
          getMissingFields={getMissingFields}
        />
      )
    },
    {
      id: 'carePlan',
      label: 'Care Plan',
      component: <CarePlanTab />
    },
    {
      id: 'mentalCapacity',
      label: 'Mental Capacity',
      component: <MentalCapacityTab />
    },
    {
      id: 'review',
      label: 'Review',
      component: <ReviewTab />
    },
    {
      id: 'settings',
      label: 'Settings',
      component: <SettingTab />
    }
  ];

  const handleTabNavigation = (tabId: string) => {
    setActiveTab(tabId);
  };

  const incompleteTabsCount = Object.values(tabValidation).filter(
    (validation) => !validation.isValid
  ).length;

  return (
    <div className="min-h-screen ">
      <div className="mx-auto py-8 ">
        <div className="-mt-8 mb-4 flex items-center justify-between">
          <p className="mt-2 text-2xl font-semibold ">
            {formData.firstName && formData.lastName
              ? `${formData.title || ''} ${formData.firstName} ${formData.lastName}`.trim()
              : 'Service User'}
          </p>

          <Button
            onClick={() => window.history.back()}
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="flex items-start gap-2">
          <div className="flex-1">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={setActiveTab}
              validation={tabValidation}
            />
          </div>

          <div className="">
            <ValidationNotification
              validation={tabValidation}
              onTabClick={handleTabNavigation}
              userId={sid}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceuserDetailPage;
