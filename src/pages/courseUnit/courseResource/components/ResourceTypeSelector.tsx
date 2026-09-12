import React from 'react';
import {
  GraduationCap,
  BookOpen,
  BookA as BookAIcon,
  FileText,
  Target,
  Check,
  Lock
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
      description: 'A welcome message and overview that opens the unit.',
      hint: 'One per unit',
      disabled: hasIntroduction && !editingResource
    },
    {
      type: 'learning-outcome' as ResourceType,
      icon: Target,
      title: 'Learning outcome',
      description: 'What a student must demonstrate, with its criteria.',
      hint: 'Assessed',
      disabled: false
    },
    {
      type: 'study-guide' as ResourceType,
      icon: BookOpen,
      title: 'Study guide',
      description: 'Reading and guidance, written inline or uploaded.',
      hint: 'Text or file',
      disabled: false
    },
    {
      type: 'lecture' as ResourceType,
      icon: BookAIcon,
      title: 'Lecture',
      description: 'Lecture notes, slides or recordings for a session.',
      hint: 'Text or file',
      disabled: false
    },
    {
      type: 'assignment' as ResourceType,
      icon: FileText,
      title: 'Assignment',
      description: 'A submitted piece of work with a start date and deadline.',
      hint: 'Deadlines',
      disabled: false
    }
  ];

  return (
    <div className="py-2">
      <p className="mb-3 text-xs text-black">
        Choose what you are adding to this unit.
      </p>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {resourceTypes.map(
          ({ type, icon: Icon, title, description, hint, disabled }) => (
            <button
              key={type}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onSelect(type)}
              className="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-watney/50 hover:bg-watney/5 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:border-gray-200 disabled:hover:bg-white disabled:hover:shadow-none"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-watney/10 text-watney transition-colors group-hover:bg-watney group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                {disabled ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-watney/10 px-2 py-0.5 text-[10px] font-semibold text-black">
                    <Check className="h-3 w-3" /> Added
                  </span>
                ) : (
                  <span className="rounded-full bg-watney/10 px-2 py-0.5 text-[10px] font-semibold text-black">
                    {hint}
                  </span>
                )}
              </div>

              <p className="mt-3 text-sm font-semibold text-black">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-black">
                {description}
              </p>

              {disabled && (
                <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-black">
                  <Lock className="h-3 w-3" />
                  Edit the existing one instead
                </p>
              )}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default ResourceTypeSelector;
