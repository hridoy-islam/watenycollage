import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios'; // Make sure to import your axiosInstance
import type React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import moment from 'moment';

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  formData: any;
}

export function ReviewModal({ open, onClose, formData }: ReviewModalProps) {
  const [courseName, setCourseName] = useState<string>('');
  const [termName, setTermName] = useState<string>('');

  // Fetch course and term names when the modal opens
  useEffect(() => {
    if (open && formData?.courseDetailsData) {
      const fetchNames = async () => {
        try {
          if (formData.courseDetailsData.course) {
            const courseResponse = await axiosInstance.get(
              `/courses/${formData.courseDetailsData.course}`
            );
            setCourseName(courseResponse.data.data.name || '');
          }
          if (formData.courseDetailsData.intake) {
            const termResponse = await axiosInstance.get(
              `/terms/${formData.courseDetailsData.intake}`
            );
            setTermName(termResponse.data.data.termName || '');
          }
        } catch (error) {
          console.error('Error fetching course or term details:', error);
          setCourseName('Error loading course name');
          setTermName('Error loading term name');
        }
      };
      fetchNames();
    }
  }, [open, formData?.courseDetailsData]);

  // Reset names when modal closes
  useEffect(() => {
    if (!open) {
      setCourseName('');
      setTermName('');
    }
  }, [open]);

  // Helper to format field names
  const formatFieldName = (name: string) => {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Helper to format values
  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return 'Not provided';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (
      value instanceof Date ||
      moment(value, moment.ISO_8601, true).isValid()
    ) {
      return moment(value).format('MM-DD-YYYY');
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return 'None';
      if (value[0] instanceof File) return `${value.length} file(s) uploaded`;
      return value.join(', ');
    }
    if (value instanceof File) {
      return 'File uploaded';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    // Convert to string and capitalize first letter
    const str = String(value);
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Generic render section function
  const renderSection = (title: string, data: any, showTitle = true) => {
    if (!data) return null;

    const rows = Object.entries(data).reduce(
      (acc: [string, string][], [key, value]) => {
        if (
          typeof value === 'object' &&
          value !== null &&
          !(value instanceof Date)
        ) {
          return acc; // Skip nested objects
        }

        let formattedValue = value;

        if (
          formattedValue instanceof Date ||
          moment(formattedValue, moment.ISO_8601, true).isValid()
        ) {
          formattedValue = moment(formattedValue).format('MM-DD-YYYY');
        }

        if (typeof formattedValue === 'boolean') {
          formattedValue = formattedValue ? 'Yes' : 'No';
        }

        const label = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (s) => s.toUpperCase());

        acc.push([
          label,
          formattedValue === undefined ||
          formattedValue === null ||
          formattedValue === ''
            ? 'Not provided'
            : String(formattedValue)
        ]);

        return acc;
      },
      []
    );

    return (
      <div className="mb-6">
        {showTitle && <h3 className="mb-2 text-lg font-semibold">{title}</h3>}
        <div className="rounded-md border border-gray-200  p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Field
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 ">
              {rows.map(([label, value], index) => (
                <tr key={index}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {label}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAddress = (address: any) => {
    if (!address) return 'Not provided';
    return `${address.line1}${address.line2 ? `, ${address.line2}` : ''}, ${address.city}, ${address.postCode}, ${address.country}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex h-[80vh] max-w-4xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold">
            Application Summary
          </DialogTitle>
        </DialogHeader>
        <div
          className="flex-1 overflow-y-auto p-6"
          style={{ maxHeight: 'calc(80vh - 120px)' }}
        >
          <div className="space-y-6">
            {/* Personal Details */}
            {renderSection('Personal Details', {
              title: formData.title,
              firstName: formData.firstName,
              lastName: formData.lastName,
              initial: formData.initial,
              gender: formData.gender,
              dateOfBirth: formData.dateOfBirth,
              email: formData.email,
              phone: formData.phone,
              nationality: formData.nationality,
              ethnicity: formData.ethnicity,
              studentType: formData.studentType,
              countryOfBirth: formData.countryOfBirth,
              maritalStatus: formData.maritalStatus
            })}

            {/* Address */}
            {renderSection('Residential Address', {
              residentialAddressLine1: formData.residentialAddressLine1,
              residentialAddressLine2: formData.residentialAddressLine2,
              residentialCity: formData.residentialCity,
              residentialPostCode: formData.residentialPostCode,
              residentialCountry: formData.residentialCountry
            })}
            {!formData.sameAsResidential &&
              renderSection('Postal Address', {
                postalAddressLine1: formData.postalAddressLine1,
                postalAddressLine2: formData.postalAddressLine2,
                postalCity: formData.postalCity,
                postalPostCode: formData.postalPostCode,
                postalCountry: formData.postalCountry
              })}

            {/* Course Details */}
            {renderSection('Course Details', {
              course: courseName || 'Loading...',
              intake: termName || 'Loading...'
            })}

            {/* Contact Information */}
            {renderSection('Contact Information', {
              emergencyFullName: formData.emergencyFullName,
              emergencyContactNumber: formData.emergencyContactNumber,
              emergencyEmail: formData.emergencyEmail,
              emergencyRelationship: formData.emergencyRelationship,
              emergencyAddress: formData.emergencyAddress
            })}

            {/* Education */}
            {renderSection('Education', {
              hasEnglishQualification: formData.englishQualification
                ? 'Yes'
                : 'No',
              ...(formData.englishQualification && {
                englishTestType: formData.englishQualification.englishTestType,
                englishTestScore:
                  formData.englishQualification.englishTestScore,
                englishTestDate: formData.englishQualification.englishTestDate
              })
            })}

            {/* Employment */}
            {renderSection('Employment', {
              isEmployed: formData.isEmployed,
              currentlyEmployed: formData.currentEmployment?.currentlyEmployed,
              employer: formData.currentEmployment?.employer,
              jobTitle: formData.currentEmployment?.jobTitle,
              startDate: formData.currentEmployment?.startDate,
              endDate: formData.currentEmployment?.endDate,
              employmentType: formData.currentEmployment?.employmentType,
              responsibilities: formData.currentEmployment?.responsibilities
            })}
            {Array.isArray(formData.previousEmployments) &&
              formData.previousEmployments.length > 0 &&
              formData.previousEmployments.map((emp: any, index: number) => (
                <div
                  key={`prevEmp-${index}`}
                  className="mb-4 rounded-md border border-gray-200 bg-gray-50 p-4"
                >
                  {renderSection(
                    `Previous Employment #${index + 1}`,
                    emp,
                    false
                  )}
                </div>
              ))}

            {/* Compliance */}
            {renderSection('Compliance', {
              niNumber: formData.niNumber,
              status: formData.status,
              ltrCode: formData.ltrCode,
              disability: formData.disability,
              disabilityDetails: formData.disabilityDetails,
              benefits: formData.benefits,
              criminalConviction: formData.criminalConviction,
              convictionDetails: formData.convictionDetails,
              studentFinance: formData.studentFinance,
              visaRequired: formData.visaRequired,
              enteredUKBefore: formData.enteredUKBefore,
              completedUKCourse: formData.completedUKCourse,
              visaRefusal: formData.visaRefusal
            })}

            {/* Documents */}
            {renderSection('Documents', {
              documentType: formData.documentType,
              nationalID: formData.nationalID,
              hasDocument: formData.hasDocument,
              passportNumber: formData.passportNumber,
              passportExpiry: formData.passportExpiry,
              idDocument: formData.idDocument,
              hasCertificates: formData.hasCertificates,
              certificatesDetails: formData.certificatesDetails,
              qualificationCertificates: formData.qualificationCertificates,
              cvResume: formData.cvResume,
              hasProofOfAddress: formData.hasProofOfAddress,
              proofOfAddressType: formData.proofOfAddressType,
              proofOfAddressDate: formData.proofOfAddressDate,
              proofOfAddress: formData.proofOfAddress,
              otherDocuments: formData.otherDocuments,
              otherDocumentsDescription: formData.otherDocumentsDescription
            })}
          </div>
        </div>
        <div className="flex justify-end p-4">
          <Button
            onClick={onClose}
            className="bg-watney text-white hover:bg-watney/90"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
