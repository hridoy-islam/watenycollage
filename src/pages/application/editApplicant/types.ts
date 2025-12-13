
export type TabType =
  | "personalDetails"
  | "addressDetails"
  | "nextToKin"
  | "applicationData"
  | "educationData"
  | "trainingData"
  | "experienceData"
  | "ethnicityData"
  | "employmentData"
  | "disabilityData"
  | "refereeData"
  | "documentData"
  | "postEmployment"
  | "paymentData";


export interface TabItemProps {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: (tab: TabType) => void;
}

export interface TabListProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userData?: any;
}

export interface TabContentProps {
  activeTab: TabType;
  userData: any;
  refreshData: any;
  loading: any;
}