import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSelector } from 'react-redux';

interface AssessmentCriteria {
  _id: string;
  description: string;
}

interface LearningOutcome {
  _id: string;
  learningOutcomes: string;
  assessmentCriteria: AssessmentCriteria[];
}

interface FinalFeedbackData {
  learningOutcomes: {
    learningOutcomeId: string;
    learningOutcomeTitle: string;
    assessmentCriteria: {
      criteriaId: string;
      description: string;
      fulfilled: boolean | undefined;
      comment: string;
    }[];
  }[];
}

interface FinalFeedbackDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  unitMaterial: {
    learningOutcomes: LearningOutcome[];
  };
  assignmentId: string;
  onSubmit: (feedbackData: FinalFeedbackData) => Promise<void>;
  initialData?: FinalFeedbackData;
  isSubmitting?: boolean;
  isEditing?: boolean; // Add this new prop
}

export const FinalFeedbackDialog: React.FC<FinalFeedbackDialogProps> = ({
  isOpen,
  onOpenChange,
  unitMaterial,
  assignmentId,
  onSubmit,
  initialData,
  isSubmitting = false,
  isEditing = false
}) => {
  const { toast } = useToast();
  const [feedbackData, setFeedbackData] = useState<FinalFeedbackData>({
    learningOutcomes: []
  });
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const { user } = useSelector((state: any) => state.auth);

  // useEffect(() => {
  //   if (!isOpen || !unitMaterial) return;

  //   if (initialData) {
  //     // 🟢 Merge updated learning outcomes & criteria with existing feedback data
  //     setFeedbackData((prev) => {
  //       const baseData = prev?.learningOutcomes?.length ? prev : initialData; // fallback if prev empty

  //       const mergedLearningOutcomes = unitMaterial.learningOutcomes
  //         .filter((lo) => lo.finalFeedback === true)
  //         .map((lo) => {
  //           const existingLO = baseData.learningOutcomes?.find(
  //             (l) => l.learningOutcomeId === lo._id
  //           );

  //           return {
  //             learningOutcomeId: lo._id,
  //             learningOutcomeTitle: lo.learningOutcomes,
  //             assessmentCriteria: lo.assessmentCriteria.map((ac) => {
  //               const existingAC = existingLO?.assessmentCriteria?.find(
  //                 (a) => a.criteriaId === ac._id
  //               );

  //               return {
  //                 criteriaId: ac._id,
  //                 description: ac.description,
  //                 fulfilled: existingAC?.fulfilled ?? undefined,
  //                 comment: existingAC?.comment ?? ''
  //               };
  //             })
  //           };
  //         });

  //       return { learningOutcomes: mergedLearningOutcomes };
  //     });
  //   } else {
  //     const filteredLearningOutcomes = unitMaterial.learningOutcomes.filter(
  //       (lo) => lo.finalFeedback === true
  //     );

  //     const initialLearningOutcomes = filteredLearningOutcomes.map((lo) => ({
  //       learningOutcomeId: lo._id,
  //       learningOutcomeTitle: lo.learningOutcomes,
  //       assessmentCriteria: lo.assessmentCriteria.map((ac) => ({
  //         criteriaId: ac._id,
  //         description: ac.description,
  //         fulfilled: undefined,
  //         comment: ''
  //       }))
  //     }));

  //     setFeedbackData({ learningOutcomes: initialLearningOutcomes });
  //   }

  //   // 🧹 Clear validation errors every time dialog opens or data changes
  //   setValidationErrors({});
  // }, [isOpen, unitMaterial, initialData]);



  useEffect(() => {
  if (!isOpen || !unitMaterial) return;

  // 🧹 Always reset before building new data when switching assignments
  setFeedbackData({ learningOutcomes: [] });

  const filteredLearningOutcomes = unitMaterial.learningOutcomes.filter(
    (lo) => lo?.finalFeedback === true
  );

  if (initialData && initialData.learningOutcomes?.length > 0) {
    // 🟢 Edit mode: build from initialData, ensuring sync with unitMaterial
    const mergedLearningOutcomes = filteredLearningOutcomes.map((lo) => {
      const existingLO = initialData.learningOutcomes?.find(
        (l) => l.learningOutcomeId === lo._id
      );

      return {
        learningOutcomeId: lo._id,
        learningOutcomeTitle: lo.learningOutcomes,
        assessmentCriteria: lo.assessmentCriteria.map((ac) => {
          const existingAC = existingLO?.assessmentCriteria?.find(
            (a) => a.criteriaId === ac._id
          );

          return {
            criteriaId: ac._id,
            description: ac.description,
            fulfilled: existingAC?.fulfilled ?? undefined,
            comment: existingAC?.comment ?? '',
          };
        }),
      };
    });

    setFeedbackData({ learningOutcomes: mergedLearningOutcomes });
  } else {
    // 🆕 Add mode: initialize from scratch
    const initialLearningOutcomes = filteredLearningOutcomes.map((lo) => ({
      learningOutcomeId: lo._id,
      learningOutcomeTitle: lo.learningOutcomes,
      assessmentCriteria: lo.assessmentCriteria.map((ac) => ({
        criteriaId: ac._id,
        description: ac.description,
        fulfilled: undefined,
        comment: '',
      })),
    }));

    setFeedbackData({ learningOutcomes: initialLearningOutcomes });
  }

  // 🧹 Reset validation each time dialog opens or assignment changes
  setValidationErrors({});
}, [isOpen, unitMaterial, initialData, assignmentId]);



  const handleCriteriaChange = (
    loIndex: number,
    acIndex: number,
    field: 'fulfilled' | 'comment',
    value: boolean | undefined | string
  ) => {
    setFeedbackData((prev) => {
      const updatedLOs = [...prev.learningOutcomes];
      const updatedCriteria = [...updatedLOs[loIndex].assessmentCriteria];

      updatedCriteria[acIndex] = {
        ...updatedCriteria[acIndex],
        [field]: value
      };

      updatedLOs[loIndex] = {
        ...updatedLOs[loIndex],
        assessmentCriteria: updatedCriteria
      };

      return {
        ...prev,
        learningOutcomes: updatedLOs
      };
    });

    // Clear validation error for this field when user makes a change
    const criteriaKey = `lo-${loIndex}-ac-${acIndex}`;
    if (validationErrors[criteriaKey]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[criteriaKey];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    feedbackData.learningOutcomes.forEach((learningOutcome, loIndex) => {
      learningOutcome.assessmentCriteria.forEach((criteria, acIndex) => {
        const criteriaKey = `lo-${loIndex}-ac-${acIndex}`;

        // Check if fulfilled is undefined (not selected)
        if (criteria.fulfilled === undefined) {
          errors[criteriaKey] = 'Please select Yes or No for this criteria';
        }

        // Check if comment is empty
        if (!criteria.comment.trim()) {
          errors[criteriaKey] = errors[criteriaKey]
            ? `${errors[criteriaKey]} and add a comment`
            : 'Please add a comment for this criteria';
        }
      });
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const finalData = {
        ...feedbackData,
        submitBy: user?._id
      };
      await onSubmit(finalData);
      toast({
        title: 'Final feedback submitted successfully!'
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit final feedback.',
        variant: 'destructive'
      });
    }
  };

  const getCriteriaKey = (loIndex: number, acIndex: number): string => {
    return `lo-${loIndex}-ac-${acIndex}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-[95%] flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? 'Edit Final Feedback' : 'Final Feedback Assessment'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto pr-2">
          <Card className="overflow-hidden rounded-none">
            {/* Table Header */}
            <div className="grid grid-cols-[40%_auto_50%] gap-4 bg-watney px-6 py-3 text-sm font-semibold text-white">
              <div>Assessment Criteria</div>
              <div className="text-center">Achieved</div>
              <div>Comments</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {feedbackData.learningOutcomes.map((learningOutcome, loIndex) => (
                <div key={learningOutcome.learningOutcomeId}>
                  {/* Learning Outcome Header */}
                  <div className="border-b border-gray-200 bg-watney/30 px-6 py-3">
                    <h3 className="text-sm font-medium">
                      <span
                        dangerouslySetInnerHTML={{
                          __html: learningOutcome.learningOutcomeTitle
                        }}
                      />
                    </h3>
                  </div>

                  {/* Criteria Rows */}
                  <div>
                    {learningOutcome.assessmentCriteria.map(
                      (criteria, acIndex) => {
                        const criteriaKey = getCriteriaKey(loIndex, acIndex);
                        const hasError = !!validationErrors[criteriaKey];

                        return (
                          <div
                            key={criteria.criteriaId}
                            className={`grid grid-cols-[40%_auto_50%] items-start gap-4 px-6 py-4`}
                          >
                            {/* Criteria Description */}
                            <div className="min-w-0 text-xs">
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: criteria.description
                                }}
                              />
                              {hasError && (
                                <p className="mt-1 text-xs font-medium text-destructive">
                                  {validationErrors[criteriaKey]}
                                </p>
                              )}
                            </div>

                            {/* Yes/No Checkboxes */}
                            <div className="flex items-start justify-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`yes-${loIndex}-${acIndex}`}
                                  checked={criteria.fulfilled === true}
                                  onCheckedChange={(checked) =>
                                    handleCriteriaChange(
                                      loIndex,
                                      acIndex,
                                      'fulfilled',
                                      checked ? true : undefined
                                    )
                                  }
                                  className="rounded"
                                />
                                <Label
                                  htmlFor={`yes-${loIndex}-${acIndex}`}
                                  className="cursor-pointer text-sm font-normal"
                                >
                                  Yes
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`no-${loIndex}-${acIndex}`}
                                  checked={criteria.fulfilled === false}
                                  onCheckedChange={(checked) =>
                                    handleCriteriaChange(
                                      loIndex,
                                      acIndex,
                                      'fulfilled',
                                      checked ? false : undefined
                                    )
                                  }
                                  className="rounded"
                                />
                                <Label
                                  htmlFor={`no-${loIndex}-${acIndex}`}
                                  className="cursor-pointer text-sm font-normal"
                                >
                                  No
                                </Label>
                              </div>
                            </div>

                            {/* Comment Textarea */}
                            <div className="w-full">
                              <Textarea
                                placeholder="Add comments..."
                                value={criteria.comment}
                                onChange={(e) =>
                                  handleCriteriaChange(
                                    loIndex,
                                    acIndex,
                                    'comment',
                                    e.target.value
                                  )
                                }
                                rows={2}
                                className={`h-[140px] w-full resize-none border border-gray-300 text-sm`}
                              />
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </ScrollArea>

        <DialogFooter className="flex-shrink-0 pt-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              // Reset any editing state if needed
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-watney text-white hover:bg-watney/90"
          >
            {isSubmitting
              ? 'Submitting...'
              : isEditing
                ? 'Update Feedback'
                : 'Submit Feedback'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
