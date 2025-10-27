import { User } from '../../types/user.types';

export type TabType =
  | 'personalDetails'
  | 'applicationData'
  | 'educationData'
  | 'employmentData'
  | 'disabilityData'
  | 'refereeData'
  | 'documentData'
  | 'emergencyContactData';

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
  userData:User
}

export interface TabContentProps {
  activeTab: TabType;
  userData: User;
  refreshData: any;
}
