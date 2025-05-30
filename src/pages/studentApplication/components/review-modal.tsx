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
          // Fetch course name
          if (formData.courseDetailsData.course) {
            const courseResponse = await axiosInstance.get(
              `/courses/${formData.courseDetailsData.course}`
            );
            setCourseName(courseResponse.data.data.name || '');
          }

          // Fetch term name
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

  // Helper function to format field names
  const formatFieldName = (name: string) => {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Helper function to format values
  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return 'Not provided';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
   if (value instanceof Date || moment(value, moment.ISO_8601, true).isValid()) {
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

    // Convert to string and capitalize the first letter
    const str = String(value);
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Manual rendering for each section
  const renderPersonalDetails = () => {
    const data = formData;

    return (
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold">Personal Details</h3>
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <FieldDisplay label="Title" value={data.title} />
              <FieldDisplay label="First Name" value={data.firstName} />
              <FieldDisplay label="Last Name" value={data.lastName} />
              <FieldDisplay label="Initial" value={data.initial} />
            </div>
            <div className="space-y-2">
              <FieldDisplay label="Gender" value={data.gender} />
              <FieldDisplay label="Date of Birth" value={data.dateOfBirth} />
              <FieldDisplay label="Email" value={data.email} />
              <FieldDisplay label="Phone" value={data.phone} />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <FieldDisplay label="Nationality" value={data.nationality} />
              <FieldDisplay label="Ethnicity" value={data.ethnicity} />
              <FieldDisplay label="Student Type" value={data.studentType} />
            </div>
            <div className="space-y-2">
              <FieldDisplay
                label="Country of Birth"
                value={data.countryOfBirth}
              />
              <FieldDisplay label="Marital Status" value={data.maritalStatus} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAddress = () => {
    if (!formData) return null;
    const data = formData;

    return (
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold">Address</h3>
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
          <h4 className="mb-2 font-medium">Residential Address</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <FieldDisplay
                label="Address Line 1"
                value={data.residentialAddressLine1}
              />
              <FieldDisplay
                label="Address Line 2"
                value={data.residentialAddressLine2}
              />
              <FieldDisplay label="City" value={data.residentialCity} />
            </div>
            <div className="space-y-2">
              <FieldDisplay
                label="Postal Code"
                value={data.residentialPostCode}
              />
              <FieldDisplay label="Country" value={data.residentialCountry} />
              <FieldDisplay
                label="Same as residential"
                value={data.sameAsResidential}
                className="mt-4"
              />
            </div>
          </div>

          {!data.sameAsResidential && (
            <>
              <h4 className="mb-2 mt-4 font-medium">Postal Address</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FieldDisplay
                    label="Address Line 1"
                    value={data.postalAddressLine1}
                  />
                  <FieldDisplay
                    label="Address Line 2"
                    value={data.postalAddressLine2}
                  />
                  <FieldDisplay label="City" value={data.postalCity} />
                </div>
                <div className="space-y-2">
                  <FieldDisplay
                    label="Postal Code"
                    value={data.postalPostCode}
                  />
                  <FieldDisplay label="Country" value={data.postalCountry} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderCourseDetails = () => {
    if (!formData) return null;
    const data = formData
    return (
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold">Course Details</h3>
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-4">
            <FieldDisplay label="Course" value={courseName || 'Loading...'} />
            <FieldDisplay label="Intake" value={termName || 'Loading...'} />
          </div>
        </div>
      </div>
    );
  };

  const renderContact = () => {
    if (!formData) return null;
    const data = formData;

    return (
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold">Contact Information</h3>
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <FieldDisplay
                label="Emergency Contact Name"
                value={data.emergencyFullName}
              />
              <FieldDisplay
                label="Emergency Contact Number"
                value={data.emergencyContactNumber}
              />
            </div>
            <div className="space-y-2">
              <FieldDisplay
                label="Emergency Email"
                value={data.emergencyEmail}
              />
              <FieldDisplay
                label="Relationship"
                value={data.emergencyRelationship}
              />
            </div>
          </div>
          <FieldDisplay
            label="Emergency Address"
            value={data.emergencyAddress}
            className="mt-4"
          />
        </div>
      </div>
    );
  };

  const renderEducation = () => {
    if (!formData) return null;
    const data = formData;

    return (
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold">Education</h3>
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
          {Array.isArray(data.educationData) &&
            data.educationData.map((edu: any, index: number) => (
              <div
                key={index}
                className="mb-4 border-b border-gray-200 pb-4 last:border-0 last:pb-0"
              >
                <h4 className="mb-2 font-medium">Education #{index + 1}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FieldDisplay label="Institution" value={edu.institution} />
                    <FieldDisplay label="Grade" value={edu.grade} />
                    <FieldDisplay
                      label="Qualification"
                      value={edu.qualification}
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldDisplay label="Award Date" value={edu.awardDate} />
                    <FieldDisplay label="Certificate" value={edu.certificate} />
                    <FieldDisplay label="Transcript" value={edu.transcript} />
                  </div>
                </div>
              </div>
            ))}

          {data.englishQualification && (
            <div className="mt-4">
              <h4 className="mb-2 font-medium">English Qualification</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FieldDisplay
                    label="Test Type"
                    value={data.englishQualification.englishTestType}
                  />
                  <FieldDisplay
                    label="Test Score"
                    value={data.englishQualification.englishTestScore}
                  />
                </div>
                <div className="space-y-2">
                  <FieldDisplay
                    label="Test Date"
                    value={data.englishQualification.englishTestDate}
                  />
                  <FieldDisplay
                    label="Certificate"
                    value={data.englishQualification.englishCertificate}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEmployment = () => {
    if (!formData) return null;
    const data = formData;

    return (
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold">Employment</h3>
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
          <FieldDisplay label="Currently Employed" value={data.isEmployed} />

          {data.currentEmployment && (
            <div className="mt-4">
              <h4 className="mb-2 font-medium">Current Employment</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FieldDisplay
                    label="Employer"
                    value={data.currentEmployment.employer}
                  />
                  <FieldDisplay
                    label="Job Title"
                    value={data.currentEmployment.jobTitle}
                  />
                  <FieldDisplay
                    label="Start Date"
                    value={data.currentEmployment.startDate}
                  />
                </div>
                <div className="space-y-2">
                  <FieldDisplay
                    label="Employment Type"
                    value={data.currentEmployment.employmentType}
                  />
                  <FieldDisplay
                    label="Currently Employed"
                    value={data.currentEmployment.currentlyEmployed}
                  />
                  {!data.currentEmployment.currentlyEmployed && (
                    <FieldDisplay
                      label="End Date"
                      value={data.currentEmployment.endDate}
                    />
                  )}
                </div>
              </div>
              <FieldDisplay
                label="Responsibilities"
                value={data.currentEmployment.responsibilities}
                className="mt-2"
              />
            </div>
          )}

          {Array.isArray(data.previousEmployments) &&
            data.previousEmployments.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 font-medium">Previous Employment</h4>
                {data.previousEmployments.map((emp: any, index: number) => (
                  <div
                    key={index}
                    className="mb-4 border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <FieldDisplay label="Employer" value={emp.employer} />
                        <FieldDisplay label="Job Title" value={emp.jobTitle} />
                        <FieldDisplay
                          label="Start Date"
                          value={emp.startDate}
                        />
                      </div>
                      <div className="space-y-2">
                        <FieldDisplay label="End Date" value={emp.endDate} />
                        <FieldDisplay
                          label="Reason for Leaving"
                          value={emp.reasonForLeaving}
                        />
                      </div>
                    </div>
                    <FieldDisplay
                      label="Responsibilities"
                      value={emp.responsibilities}
                      className="mt-2"
                    />
                  </div>
                ))}
              </div>
            )}

          <FieldDisplay
            label="Employment Gaps"
            value={data.hasEmploymentGaps}
            className="mt-4"
          />
          {data.hasEmploymentGaps === 'Yes' && (
            <FieldDisplay
              label="Gaps Explanation"
              value={data.employmentGapsExplanation}
              className="mt-2"
            />
          )}
        </div>
      </div>
    );
  };

  const renderCompliance = () => {
    if (!formData) return null;
    const data = formData;

    return (
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold">Compliance</h3>
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <FieldDisplay label="NI Number" value={data.niNumber} />
              <FieldDisplay label="Status" value={data.status} />
              <FieldDisplay label="LTR Code" value={data.ltrCode} />
              <FieldDisplay label="Disability" value={data.disability} />
              {data.disability === 'Yes' && (
                <FieldDisplay
                  label="Disability Details"
                  value={data.disabilityDetails}
                />
              )}
            </div>
            <div className="space-y-2">
              <FieldDisplay label="Benefits" value={data.benefits} />
              <FieldDisplay
                label="Criminal Conviction"
                value={data.criminalConviction}
              />
              {data.criminalConviction === 'Yes' && (
                <FieldDisplay
                  label="Conviction Details"
                  value={data.convictionDetails}
                />
              )}
              <FieldDisplay
                label="Student Finance"
                value={data.studentFinance}
              />
              <FieldDisplay label="Visa Required" value={data.visaRequired} />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <FieldDisplay
              label="Entered UK Before"
              value={data.enteredUKBefore}
            />
            <FieldDisplay
              label="Completed UK Course"
              value={data.completedUKCourse}
            />
            <FieldDisplay label="Visa Refusal" value={data.visaRefusal} />
          </div>
        </div>
      </div>
    );
  };

  const renderDocuments = () => {
    if (!formData) return null;
    const data = formData;

    return (
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold">Documents</h3>
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <FieldDisplay label="Document Type" value={data.documentType} />
              <FieldDisplay label="National ID" value={data.nationalID} />
              <FieldDisplay label="Has Document" value={data.hasDocument} />
              <FieldDisplay
                label="Passport Number"
                value={data.passportNumber}
              />
              <FieldDisplay
                label="Passport Expiry"
                value={data.passportExpiry}
              />
              <FieldDisplay label="ID Document" value={data.idDocument} />
            </div>
            <div className="space-y-2">
              <FieldDisplay
                label="Has Certificates"
                value={data.hasCertificates}
              />
              {data.hasCertificates && (
                <>
                  <FieldDisplay
                    label="Certificates Details"
                    value={data.certificatesDetails}
                  />
                  <FieldDisplay
                    label="Qualification Certificates"
                    value={data.qualificationCertificates}
                  />
                </>
              )}
              <FieldDisplay label="CV/Resume" value={data.cvResume} />
              <FieldDisplay
                label="Has Proof of Address"
                value={data.hasProofOfAddress}
              />
              {data.hasProofOfAddress && (
                <>
                  <FieldDisplay
                    label="Proof of Address Type"
                    value={data.proofOfAddressType}
                  />
                  <FieldDisplay
                    label="Proof of Address Date"
                    value={data.proofOfAddressDate}
                  />
                  <FieldDisplay
                    label="Proof of Address"
                    value={data.proofOfAddress}
                  />
                </>
              )}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <FieldDisplay label="Other Documents" value={data.otherDocuments} />
            {data.otherDocuments && (
              <FieldDisplay
                label="Other Documents Description"
                value={data.otherDocumentsDescription}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const FieldDisplay = ({
    label,
    value,
    className = ''
  }: {
    label: string;
    value: any;
    className?: string;
  }) => (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      <div className="text-sm font-medium">{label}</div>
      <div className="text-sm">{formatValue(value)}</div>
    </div>
  );

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
            {renderPersonalDetails()}
            {renderAddress()}
            {renderCourseDetails()}
            {renderContact()}
            {renderEducation()}
            {renderEmployment()}
            {renderCompliance()}
            {renderDocuments()}
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