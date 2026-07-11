import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MoveLeft } from 'lucide-react';
import { Tabs } from './Tabs';
import PersonalInfoTab from './tabs/PersonalInfoTab';
import ContactInfoTab from './tabs/ContactInfoTab';
import EmploymentDetailsTab from './tabs/EmploymentDetailsTab';
import IdentificationTab from './tabs/IdentificationTab';
import PayrollTab from './tabs/PayrollTab';
import EqualityInfoTab from './tabs/EqualityInfoTab';
import DisabilityInfoTab from './tabs/DisabilityInfoTab';
import BeneficiaryTab from './tabs/BeneficiaryTab';
import NotesTab from './tabs/NotesTab';
import { useEditEmployee } from './useEditEmployee';
import axiosInstance from '@/lib/axios';
import SettingsTab from './tabs/settings';
import TrainingTab from './tabs/TrainingTab';
import HolidayTab from './tabs/HolidayTab';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import EmployeeDocumentTab from './tabs/DocumentTab';
import SickNoteTab from './tabs/SickNoteTab';
import ApplicationTab from './tabs/ApplicationTab';
import EducationTab from './tabs/EducationTab';
import ExperienceTab from './tabs/ExperienceTab';
import ReferencesTab from './tabs/ReferencesTab';
import TermsTab from './tabs/TermsTab';
import RightToWorkTab from './tabs/RightToWorkTab';
import VisaTab from './tabs/VisaTab';
import DbsTab from './tabs/DbsTab';
import PassportTab from './tabs/passportTab';
import ImmigrationTab from './tabs/ImmigrationTab';
import AppraisalTab from './tabs/AppraisalTab';
import SpotCheckTab from './tabs/SpotCheckTab';
import InductionTab from './tabs/InductionTab';
import QACheckTab from './tabs/QATab';
import DisciplinaryTab from './tabs/DisciplinaryTab';
import SupervisionTab from './tabs/SuperVisionCheckTab';

const EditEmployee = () => {
  const navigate = useNavigate();
  const {
    loading,
    activeTab,
    setActiveTab,
    formData,
    handleFieldUpdate,
    handleNestedFieldUpdate,
    handleDateChange,
    handleSelectChange,
    handleCheckboxChange,
    isFieldSaving
  } = useEditEmployee();

  const location = useLocation();

  const { eid } = useParams();

  const [user, setUser] = useState<any>(null);
  const fetchEmployee = async () => {
    try {
      const response = await axiosInstance.get(`/users/${eid}`);

      setUser(response.data.data);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state, setActiveTab]);

  useEffect(() => {
    fetchEmployee();
  }, [eid]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex justify-center py-6">
          <BlinkingDots size="large" color="bg-theme" />
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'personal',
      label: 'Personal Details',
      component: (
        <PersonalInfoTab
          formData={formData}
          onUpdate={handleFieldUpdate}
          onDateChange={handleDateChange}
          onSelectChange={handleSelectChange}
          isFieldSaving={isFieldSaving}
        />
      )
    },
    {
      id: 'contact',
      label: 'Address Details',
      component: (
        <ContactInfoTab
          formData={formData}
          onUpdate={handleFieldUpdate}
          onSelectChange={handleSelectChange}
          isFieldSaving={isFieldSaving}
        />
      )
    },
    {
      id: 'beneficiary',
      label: 'Next of Kin',
      component: (
        <BeneficiaryTab
          formData={formData}
          onUpdate={handleNestedFieldUpdate}
          onSelectChange={handleSelectChange}
          onCheckboxChange={handleCheckboxChange}
          isFieldSaving={isFieldSaving}
        />
      )
    },
    {
      id: 'application',
      label: 'Application',
      component: (
        <ApplicationTab
          formData={formData}
          onUpdate={handleFieldUpdate}
          onDateChange={handleDateChange}
          onSelectChange={handleSelectChange}
          onCheckboxChange={handleCheckboxChange}
          isFieldSaving={isFieldSaving}
        />
      )
    },
    {
      id: 'education',
      label: 'Education',
      component: (
        <EducationTab
          formData={formData}
          onUpdate={handleFieldUpdate}
          isFieldSaving={isFieldSaving}
        />
      )
    },
    {
      id: 'training',
      label: 'Training',
      component: <TrainingTab />
    },
    {
      id: 'experience',
      label: 'Experience',
      component: (
        <ExperienceTab
          formData={formData}
          onUpdate={handleFieldUpdate}
          onNestedUpdate={handleNestedFieldUpdate}
          onDateChange={handleDateChange}
          isFieldSaving={isFieldSaving}
        />
      )
    },
    {
      id: 'equality',
      label: 'Ethnicity',
      component: (
        <EqualityInfoTab
          formData={formData}
          onUpdate={handleNestedFieldUpdate}
          onSelectChange={handleSelectChange}
          onCheckboxChange={handleCheckboxChange}
          isFieldSaving={isFieldSaving}
        />
      )
    },
    {
      id: 'employment',
      label: 'Employment',
      component: (
        <EmploymentDetailsTab
          formData={formData}
          onUpdate={handleFieldUpdate}
          onDateChange={handleDateChange}
          onSelectChange={handleSelectChange}
          onCheckboxChange={handleCheckboxChange}
          isFieldSaving={isFieldSaving}
        />
      )
    },
    {
      id: 'disability',
      label: 'Disability',
      component: (
        <DisabilityInfoTab
          formData={formData}
          onUpdate={handleFieldUpdate}
          onCheckboxChange={handleCheckboxChange}
          isFieldSaving={isFieldSaving}
        />
      )
    },
    {
      id: 'references',
      label: 'References',
      component: (
        <ReferencesTab
          formData={formData}
          onUpdate={handleNestedFieldUpdate}
          isFieldSaving={isFieldSaving}
        />
      )
    },
    { id: 'document', label: 'Documents', component: <EmployeeDocumentTab /> },
    {
      id: 'terms',
      label: 'Terms',
      component: (
        <TermsTab
          formData={formData}
          onCheckboxChange={handleCheckboxChange}
          isFieldSaving={isFieldSaving}
        />
      )
    },

    {
      id: 'rightToWork',
      label: 'Right To Work',
      component: <RightToWorkTab />
    },
    {
      id: 'visa',
      label: 'Visa',
      component: <VisaTab />
    },
    {
      id: 'dbs',
      label: 'DBS',
      component: <DbsTab />
    },
    {
      id: 'passport',
      label: 'Passport',
      component: <PassportTab />
    },
    {
      id: 'immigration',
      label: 'Immigration',
      component: <ImmigrationTab />
    },
    {
      id: 'appraisal',
      label: 'Appraisal',
      component: <AppraisalTab />
    },
    {
      id: 'spotcheck',
      label: 'Spot Check',
      component: <SpotCheckTab />
    },
    {
      id: 'induction',
      label: 'Induction',
      component: <InductionTab />
    },
    {
      id: 'qa',
      label: 'Quality Assurance',
      component: <QACheckTab />
    },
    {
      id: 'disciplinary',
      label: 'Disciplinary',
      component: <DisciplinaryTab />
    },
    {
      id: 'supervision',
      label: 'Super Vision Check',
      component: <SupervisionTab />
    },

    { id: 'holiday', label: 'Holiday', component: <HolidayTab formData={formData} /> },
    { id: 'sicknote', label: 'Sick Note', component: <SickNoteTab /> },
    {
      id: 'identification',
      label: 'Identification',
      component: (
        <IdentificationTab
          formData={formData}
          onUpdate={handleFieldUpdate}
          onDateChange={handleDateChange}
          isFieldSaving={isFieldSaving}
        />
      )
    },
    {
      id: 'payroll',
      label: 'Payroll',
      component: (
        <PayrollTab
          formData={formData}
          onNestedUpdate={handleNestedFieldUpdate}
          isFieldSaving={isFieldSaving}
        />
      )
    },
    {
      id: 'settings',
      label: 'Settings',
      component: (
        <SettingsTab
          formData={formData}
          onSelectChange={handleSelectChange}
          isFieldSaving={isFieldSaving}
        />
      )
    },
    {
      id: 'notes',
      label: 'Notes',
      component: (
        <NotesTab
          formData={formData}
          onUpdate={handleFieldUpdate}
          isFieldSaving={isFieldSaving}
        />
      )
    }
  ];

  return (
    <div className="mx-auto rounded-md bg-white p-4 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {user?.title} {user?.firstName} {user?.lastName}
        </h1>
        <Button
          variant="outline"
          className="border-none bg-theme text-white hover:bg-theme/90"
          onClick={() => navigate(-1)}
        >
          <MoveLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
};

export default EditEmployee;
