'use client';

import { cn } from '@/lib/utils';
import {
  User,
  Home,
  BookOpen,
  Phone,
  GraduationCap,
  Briefcase,
  Shield,
  FileText,
  CheckSquare,
  Check
} from 'lucide-react';

interface StepsIndicatorProps {
  currentStep: number;
  completedSteps: number[];
  steps: { id: number; label: string; icon: string }[];
  onStepClick: (stepId: number) => void;
}

export function StepsIndicator({
  currentStep,
  completedSteps,
  steps,
  onStepClick
}: StepsIndicatorProps) {
  const getIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'user':
        return <User className={className} />;
      case 'home':
        return <Home className={className} />;
      case 'book':
        return <BookOpen className={className} />;
      case 'phone':
        return <Phone className={className} />;
      case 'graduation-cap':
        return <GraduationCap className={className} />;
      case 'briefcase':
        return <Briefcase className={className} />;
      case 'shield':
        return <Shield className={className} />;
      case 'file-text':
        return <FileText className={className} />;
      case 'check-square':
        return <CheckSquare className={className} />;
      default:
        return <User className={className} />;
    }
  };

  return (
    <div className="mb-10 w-full">
      <div className="flex justify-between">
        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = completedSteps.includes(step.id);
          const isPrevious = step.id < currentStep;

          return (
            <div
              key={step.id}
              className="flex cursor-pointer flex-col items-center"
              onClick={() => onStepClick(step.id)}
            >
              <div
                className={cn(
                  'mb-2 flex h-12 w-12 items-center justify-center rounded-full text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'scale-110 bg-green-500 text-white shadow-lg'
                    : isCompleted || isPrevious
                      ? 'bg-blue-600 text-white'
                      : 'border-2 border-gray-300 bg-white text-gray-500 hover:border-blue-400'
                )}
              >
                {isCompleted ? (
                  <Check className="h-6 w-6" />
                ) : (
                  getIcon(step.icon, 'h-5 w-5')
                )}
              </div>
              <span
                className={cn(
                  'text-center text-sm font-medium transition-colors',
                  isActive
                    ? 'text-green-600'
                    : isCompleted || isPrevious
                      ? 'text-blue-600'
                      : 'text-gray-600'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
