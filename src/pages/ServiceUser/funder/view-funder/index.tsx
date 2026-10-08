import React, { useState } from 'react';
import { MoveLeft, AlertCircle } from 'lucide-react';
import { Tabs } from './components/Tabs';
import PersonalInfoTab from './tabs/PersonalInfoTab';
import AddressTab from './tabs/ContactTab';
import { ValidationNotification } from './components/ValidationNotification';
import { useEditApplicant } from './hooks/useEditApplicant';
import { Button } from '@/components/ui/button';
import ContactTab from './tabs/ContactTab';
import TravelTab from './tabs/TravelTab';
import InvoiceTab from './tabs/InvoiceTab';
import InvoiceContactTab from './tabs/InvoiceContactTab';
import PurchaseOrderTab from './tabs/PurchaseOrderTab';
import TravelRateDetailTab from './tabs/TravelDetailsTab';
import AdhocInvoiceTab from './tabs/AdhocInvoiceTab';
import { BlinkingDots } from '@/components/shared/blinking-dots';

const ServiceUserFunderDetailPage = () => {
  const [showNotification, setShowNotification] = useState(true);

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
    getTabValidation,
    getMissingFields
  } = useEditApplicant();

  const tabValidation = getTabValidation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
       <div className="flex justify-center py-6">
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
      label: 'Communication',
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
      id: 'travel',
      label: 'Travel Information',
      component: (
        <TravelTab
          formData={formData}
          onUpdate={handleFieldUpdate}
          onSelectChange={handleSelectChange}
          isFieldSaving={isFieldSaving}
          getMissingFields={getMissingFields}
        />
      )
    },
    {
      id: 'invoice',
      label: 'Invoice',
      component: (
        <InvoiceTab
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
      id: 'invoiceContact',
      label: 'Invoice Contact',
      component: (
        <InvoiceContactTab
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
      id: 'po',
      label: 'PO',
      component: (
        <PurchaseOrderTab
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
      id: 'travelDetails',
      label: 'Travel Details',
      component: (
        <TravelRateDetailTab
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
      id: 'adhocInvoice',
      label: 'Adhoc Invoice',
      component: (
        <AdhocInvoiceTab
          formData={formData}
          onUpdate={handleFieldUpdate}
          onDateChange={handleDateChange}
          onSelectChange={handleSelectChange}
          isFieldSaving={isFieldSaving}
          getMissingFields={getMissingFields}
        />
      )
    }
  ];

  const handleTabNavigation = (tabId: string) => {
    setActiveTab(tabId);
    setShowNotification(false);
  };

  const incompleteTabsCount = Object.values(tabValidation).filter(
    (validation) => !validation.isValid
  ).length;

  return (
    <div className="">
      <div className="mx-auto  py-8 ">
        <div className="-mt-8 mb-4 flex items-center justify-between">
          <div>
            <p className="mt-2 text-3xl font-semibold text-gray-600">
              {formData.firstName && formData.lastName
                ? `${formData.title || ''} ${formData.firstName} ${formData.lastName}`.trim()
                : 'Service Funder'}
            </p>
          </div>
          <Button
            variant="outline"
            className="border-theme bg-watney text-white  hover:bg-watney/90"
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
              />
            </div>
        
        </div>
      </div>
    </div>
  );
};

export default ServiceUserFunderDetailPage;
