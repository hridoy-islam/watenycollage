import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  GraduationCap,
  BookOpen,
  BookA as BookAIcon,
  FileText,
  Target
} from 'lucide-react';
import { ResourceType } from './types';

interface ResourceTypeSelectorProps {
  onSelect: (type: ResourceType) => void;
  hasIntroduction: boolean;
  editingResource: boolean;
}

const ResourceTypeSelector: React.FC<ResourceTypeSelectorProps> = ({
  onSelect,
  hasIntroduction,
  editingResource
}) => {
  const resourceTypes = [
    {
      type: 'introduction' as ResourceType,
      icon: GraduationCap,
      title: 'Introduction',
      description:
        'Create a course introduction with welcome message and overview',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      hoverColor: 'hover:border-blue-500',
      disabled: hasIntroduction && !editingResource
    },
    {
      type: 'study-guide' as ResourceType,
      icon: BookOpen,
      title: 'Study Guides',
      description: 'Add study materials with text content or document uploads',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      hoverColor: 'hover:border-green-500',
      disabled: false
    },
    {
      type: 'lecture' as ResourceType,
      icon: BookAIcon,
      title: 'Lectures',
      description: 'Create lecture content with notes or video uploads',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      hoverColor: 'hover:border-purple-500',
      disabled: false
    },
    {
      type: 'assignment' as ResourceType,
      icon: FileText,
      title: 'Assignments',
      description: 'Create assignments with title and deadline',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      hoverColor: 'hover:border-orange-500',
      disabled: false
    },
    {
      type: 'learning-outcome' as ResourceType,
      icon: Target,
      title: 'Learning Outcomes',
      description:
        'Define learning outcomes and assessment criteria for the unit',
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      hoverColor: 'hover:border-indigo-500',
      disabled: false
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 py-6 md:grid-cols-4">
      {resourceTypes.map(
        ({
          type,
          icon: Icon,
          title,
          description,
          bgColor,
          iconColor,
          hoverColor,
          disabled
        }) => (
          <Card
            key={type}
            className={`cursor-pointer border-2 border-gray-300 transition-all hover:scale-105 hover:shadow-lg ${hoverColor} ${
              disabled ? 'cursor-not-allowed opacity-50' : ''
            }`}
            onClick={() => !disabled && onSelect(type)}
          >
            <CardHeader className="text-center">
              <div
                className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${bgColor}`}
              >
                <Icon className={`h-8 w-8 ${iconColor}`} />
              </div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        )
      )}
    </div>
  );
};

export default ResourceTypeSelector;
