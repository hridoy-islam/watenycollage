import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import moment from 'moment';
import { useSelector } from 'react-redux';

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  formData: any;
  userId?: string; // Add userId prop to fetch user data
}

export function ReviewModal({ open, onClose, formData, userId }: ReviewModalProps) {
  const [courseName, setCourseName] = useState<string>('');
  const [termName, setTermName] = useState<string>('');
  const [fetchData, setFetchData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useSelector((state: any) => state.auth);
  // Fetch user data and course/term names when the modal opens
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // Fetch user data if userId is provided
          if (user._id) {
            const userResponse = await axiosInstance.get(`/users/${user._id}`);
            setFetchData(userResponse.data.data);
          }

          // Fetch course and term names from formData
          if (formData?.courseDetailsData) {
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
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [open, formData?.courseDetailsData, userId]);

  // Reset data when modal closes
  useEffect(() => {
    if (!open) {
      setCourseName('');
      setTermName('');
      setFetchData(null);
    }
  }, [open]);

  const getDataValue = (key: string, subKey?: string) => {
    if (fetchData && fetchData[key] !== undefined) {
      return subKey ? fetchData[key]?.[subKey] : fetchData[key];
    }
    return subKey ? formData[key]?.[subKey] : formData[key];
  };

  // Helper to format field names
  const formatFieldName = (name: string) => {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Helper to format values
  const formatValue = (value: any): string | React.ReactNode => {
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
      if (typeof value[0] === 'string' && value[0].startsWith('http')) {
        return (
          <div className="flex flex-col gap-1">
            {value.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Document 
              </a>
            ))}
          </div>
        );
      }
      if (value[0] instanceof File) return `${value.length} file(s) uploaded`;
      return value.join(', ');
    }
    if (value instanceof File) {
      return 'File uploaded';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value).charAt(0).toUpperCase() + String(value).slice(1);
  };

  const formatDocumentLinks = (value: any): any => {
    if (Array.isArray(value)) {
      if (value.length === 0) return 'None';
      if (
        value.every(
          (item) => typeof item === 'string' && item.startsWith('http')
        )
      ) {
        return (
          <div className="flex flex-col gap-1">
            {value.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Document {index + 1}
              </a>
            ))}
          </div>
        );
      }
      return value.join(', ');
    }

    if (typeof value === 'string' && value.startsWith('http')) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          View Document
        </a>
      );
    }

    return value;
  };


  // Generic render section function
  const renderSection = (title: string, data: any, showTitle = true) => {
    if (!data) return null;

    const rows = Object.entries(data).map(([key, value]) => {
      // Handle array of URLs
      if (
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === 'string' &&
        value[0].startsWith('http')
      ) {
        return [
          formatFieldName(key),
          <div key={key} className="flex flex-col gap-1">
            {value.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Document
              </a>
            ))}
          </div>
        ];
      }

      // Handle single URL string
      if (typeof value === 'string' && value.startsWith('http')) {
        return [
          formatFieldName(key),
          <a
            key={key}
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {formatFieldName(key)}
          </a>
        ];
      }

      // Standard value formatting
      return [formatFieldName(key), formatValue(value)];
    });

    return (
      <div className="mb-6">
        {showTitle && <h3 className="mb-2 text-lg font-semibold">{title}</h3>}
        <div className="rounded-md border border-gray-200 p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="divide-y divide-gray-200">
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

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <p>Loading application data...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
              title: getDataValue('title'),
              firstName: getDataValue('firstName'),
              lastName: getDataValue('lastName'),
              initial: getDataValue('initial'),
              gender: getDataValue('gender'),
              dateOfBirth: getDataValue('dateOfBirth'),
              email: getDataValue('email'),
              phone: getDataValue('phone'),
              ethnicity: getDataValue('ethnicity'),
              studentType: getDataValue('studentType'),
              countryOfBirth: getDataValue('countryOfBirth'),
              maritalStatus: getDataValue('maritalStatus')
            })}
            {/* Address */}
            {renderSection('Residential Address', {
              residentialAddressLine1:
                getDataValue('residentialAddress', 'line1') ||
                getDataValue('residentialAddressLine1'),
              residentialAddressLine2:
                getDataValue('residentialAddress', 'line2') ||
                getDataValue('residentialAddressLine2'),
              residentialCity:
                getDataValue('residentialAddress', 'city') ||
                getDataValue('residentialCity'),
              residentialPostCode:
                getDataValue('residentialAddress', 'postCode') ||
                getDataValue('residentialPostCode'),
              residentialCountry:
                getDataValue('residentialAddress', 'country') ||
                getDataValue('residentialCountry')
            })}
            {!getDataValue('sameAsResidential') &&
              renderSection('Postal Address', {
                postalAddressLine1:
                  getDataValue('postalAddress', 'line1') ||
                  getDataValue('postalAddressLine1'),
                postalAddressLine2:
                  getDataValue('postalAddress', 'line2') ||
                  getDataValue('postalAddressLine2'),
                postalCity:
                  getDataValue('postalAddress', 'city') ||
                  getDataValue('postalCity'),
                postalPostCode:
                  getDataValue('postalAddress', 'postCode') ||
                  getDataValue('postalPostCode'),
                postalCountry:
                  getDataValue('postalAddress', 'country') ||
                  getDataValue('postalCountry')
              })}
            {/* Course Details */}

            {formData?.courseDetailsData?.course &&
            formData?.courseDetailsData?.intake
              ? renderSection('Course Details', {
                  course: courseName || 'N/A',
                  intake: termName || 'N/A'
                })
              : null}
            {/* Contact Information */}
            {renderSection('Contact Information', {
              emergencyFullName: getDataValue('emergencyFullName'),
              emergencyContactNumber: getDataValue('emergencyContactNumber'),
              emergencyEmail: getDataValue('emergencyEmail'),
              emergencyRelationship: getDataValue('emergencyRelationship'),
              emergencyAddress: getDataValue('emergencyAddress')
            })}
            {/* Education */}
            {renderSection('English Language Test', {
              hasEnglishQualification: getDataValue('englishQualification')
                ? 'Yes'
                : 'No',
              ...(getDataValue('englishQualification') && {
                englishTestType: getDataValue(
                  'englishQualification',
                  'englishTestType'
                ),
                englishTestScore: getDataValue(
                  'englishQualification',
                  'englishTestScore'
                ),
                englishTestDate: getDataValue(
                  'englishQualification',
                  'englishTestDate'
                )
              })
            })}
            {/* Education Background */}
            {(getDataValue('educationData') || []).length > 0 &&
              getDataValue('educationData').map((entry: any, index: number) => (
                <React.Fragment key={`education-entry-${index}`}>
                  {renderSection(`Education Background #${index + 1}`, {
                    institution: entry.institution || '',
                    qualification: entry.qualification || '',
                    grade: entry.grade || '',
                    awardDate: entry.awardDate
                      ? new Date(entry.awardDate).toLocaleDateString()
                      : '',
                    certificate: entry.certificate ? 'Uploaded' : 'Not uploaded'
                  })}
                </React.Fragment>
              ))}
            {/* Employment */}
            {renderSection('Employment', {
              isEmployed: getDataValue('isEmployed'),
              currentlyEmployed: getDataValue(
                'currentEmployment',
                'currentlyEmployed'
              ),
              employer: getDataValue('currentEmployment', 'employer'),
              jobTitle: getDataValue('currentEmployment', 'jobTitle'),
              startDate: getDataValue('currentEmployment', 'startDate'),
              endDate: getDataValue('currentEmployment', 'endDate'),
              employmentType: getDataValue(
                'currentEmployment',
                'employmentType'
              ),
              responsibilities: getDataValue(
                'currentEmployment',
                'responsibilities'
              )
            })}
            {(getDataValue('previousEmployments') || []).length > 0 &&
              getDataValue('previousEmployments').map(
                (emp: any, index: number) => (
                  <div
                    key={`prevEmp-${index}`}
                    className="mb-4 rounded-md border border-gray-200 bg-gray-50 p-4"
                  >
                    {renderSection(
                      `Previous Employment #${index + 1}`,
                      Object.fromEntries(
                        Object.entries(emp).filter(([key]) => key !== '_id')
                      ),
                      true
                    )}
                  </div>
                )
              )}
            {/* Compliance */}
            {renderSection('Miscellienious', {
              disability: getDataValue('disability'),
              disabilityDetails: getDataValue('disabilityDetails'),
              benefits: getDataValue('benefits'),
              criminalConviction: getDataValue('criminalConviction'),
              convictionDetails: getDataValue('convictionDetails'),
              studentFinance: getDataValue('studentFinance'),
              hearAboutUs: getDataValue('hearAboutUs'),
              visaRequired: getDataValue('visaRequired'),
              enteredUKBefore: getDataValue('enteredUKBefore'),
              completedUKCourse: getDataValue('completedUKCourse'),
              visaRefusal: getDataValue('visaRefusal')
            })}
            {renderSection('Funding Information', {
              fundingType: getDataValue('fundingType'),
              grantDetails: getDataValue('grantDetails'),
              fundingCompanyName: getDataValue('fundingCompanyName'),
              fundingContactPerson: getDataValue('fundingContactPerson'),
              fundingEmail: getDataValue('fundingEmail'),
              fundingPhoneNumber: getDataValue('fundingPhoneNumber')
            })}
            {/* Documents */}
            {renderSection('Documents', {
              passport: getDataValue('passport') || [],
              workExperience: getDataValue('workExperience') || [],
              personalStatement: getDataValue('personalStatement') || [],
              bankStatement: getDataValue('bankStatement') || [],
              photoId: getDataValue('photoId') || [],
              image: getDataValue('image') || "View Document"
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