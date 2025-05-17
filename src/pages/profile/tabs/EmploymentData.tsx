import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import TabSection from '../TabSection';
import { User } from '../../../types/user.types';

interface EmploymentDataProps {
  userData: User;
  isEditing?: boolean;
}

const EmploymentData: React.FC<EmploymentDataProps> = ({ userData, isEditing = false }) => {
  // Mock employment data
  const mockEmploymentData = {
    isEmployed: 'Yes',
    currentEmployment: {
      employer: 'Tech Solutions Ltd',
      jobTitle: 'Software Developer',
      startDate: '2021-03-15',
      employmentType: 'Full-time',
      responsibilities: 'Developing web applications using React and Node.js',
      supervisor: 'Jane Smith',
      contactPermission: 'Yes'
    },
    previousEmployments: [
      {
        employer: 'Digital Agency',
        jobTitle: 'Junior Developer',
        startDate: '2019-06-01',
        endDate: '2021-02-28',
        reasonForLeaving: 'Career advancement',
        responsibilities: 'Frontend development with HTML, CSS, and JavaScript',
        contactPermission: 'Yes'
      }
    ]
  };

  const employmentData = userData.employmentData || mockEmploymentData;

  return (
    <TabSection 
      title="Employment" 
      description="Your employment history and current status" 
      userData={userData}
    >
      <div className="space-y-8">
        {/* Employment Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Are you currently employed?</label>
          {isEditing ? (
            <div className="flex space-x-4">
              <div className="flex items-center">
                <input
                  id="employed-yes"
                  name="isEmployed"
                  type="radio"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  defaultChecked={employmentData.isEmployed === 'Yes'}
                  value="Yes"
                />
                <label htmlFor="employed-yes" className="ml-2 block text-sm text-gray-700">
                  Yes
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="employed-no"
                  name="isEmployed"
                  type="radio"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  defaultChecked={employmentData.isEmployed === 'No'}
                  value="No"
                />
                <label htmlFor="employed-no" className="ml-2 block text-sm text-gray-700">
                  No
                </label>
              </div>
            </div>
          ) : (
            <div className="text-gray-900">{employmentData.isEmployed || '-'}</div>
          )}
        </div>
        
        {/* Current Employment */}
        {(employmentData.isEmployed === 'Yes' || employmentData.currentEmployment) && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Employment</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employer</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      defaultValue={employmentData.currentEmployment?.employer}
                    />
                  ) : (
                    <div className="mt-1 text-gray-900">{employmentData.currentEmployment?.employer || '-'}</div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Job Title</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      defaultValue={employmentData.currentEmployment?.jobTitle}
                    />
                  ) : (
                    <div className="mt-1 text-gray-900">{employmentData.currentEmployment?.jobTitle || '-'}</div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      defaultValue={employmentData.currentEmployment?.startDate}
                    />
                  ) : (
                    <div className="mt-1 text-gray-900">
                      {employmentData.currentEmployment?.startDate 
                        ? new Date(employmentData.currentEmployment.startDate).toLocaleDateString()
                        : '-'}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employment Type</label>
                  {isEditing ? (
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      defaultValue={employmentData.currentEmployment?.employmentType}
                    >
                      <option value="">Select type</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Internship">Internship</option>
                    </select>
                  ) : (
                    <div className="mt-1 text-gray-900">{employmentData.currentEmployment?.employmentType || '-'}</div>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Responsibilities</label>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      defaultValue={employmentData.currentEmployment?.responsibilities}
                    />
                  ) : (
                    <div className="mt-1 text-gray-900">{employmentData.currentEmployment?.responsibilities || '-'}</div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supervisor</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      defaultValue={employmentData.currentEmployment?.supervisor}
                    />
                  ) : (
                    <div className="mt-1 text-gray-900">{employmentData.currentEmployment?.supervisor || '-'}</div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Permission to Contact</label>
                  {isEditing ? (
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      defaultValue={employmentData.currentEmployment?.contactPermission}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  ) : (
                    <div className="mt-1 text-gray-900">{employmentData.currentEmployment?.contactPermission || '-'}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Previous Employment */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Previous Employment</h3>
            
            {isEditing && (
              <button 
                type="button"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus size={16} className="mr-2" />
                Add Previous Job
              </button>
            )}
          </div>

          {employmentData.previousEmployments && employmentData.previousEmployments.length > 0 ? (
            <div className="space-y-4">
              {employmentData.previousEmployments.map((job, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative"
                >
                  {isEditing && (
                    <button 
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Employer</label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          defaultValue={job.employer}
                        />
                      ) : (
                        <div className="mt-1 text-gray-900">{job.employer || '-'}</div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Job Title</label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          defaultValue={job.jobTitle}
                        />
                      ) : (
                        <div className="mt-1 text-gray-900">{job.jobTitle || '-'}</div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      {isEditing ? (
                        <input
                          type="date"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          defaultValue={job.startDate}
                        />
                      ) : (
                        <div className="mt-1 text-gray-900">
                          {job.startDate ? new Date(job.startDate).toLocaleDateString() : '-'}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      {isEditing ? (
                        <input
                          type="date"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          defaultValue={job.endDate}
                        />
                      ) : (
                        <div className="mt-1 text-gray-900">
                          {job.endDate ? new Date(job.endDate).toLocaleDateString() : '-'}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reason for Leaving</label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          defaultValue={job.reasonForLeaving}
                        />
                      ) : (
                        <div className="mt-1 text-gray-900">{job.reasonForLeaving || '-'}</div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Permission to Contact</label>
                      {isEditing ? (
                        <select
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          defaultValue={job.contactPermission}
                        >
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      ) : (
                        <div className="mt-1 text-gray-900">{job.contactPermission || '-'}</div>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Responsibilities</label>
                      {isEditing ? (
                        <textarea
                          rows={2}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          defaultValue={job.responsibilities}
                        />
                      ) : (
                        <div className="mt-1 text-gray-900">{job.responsibilities || '-'}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No previous employment records</p>
              {isEditing && (
                <button 
                  type="button"
                  className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus size={16} className="mr-2" />
                  Add Previous Job
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Employment Gaps */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Do you have any gaps in your employment history?</label>
          {isEditing ? (
            <div className="flex space-x-4 mb-4">
              <div className="flex items-center">
                <input
                  id="gaps-yes"
                  name="hasEmploymentGaps"
                  type="radio"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  defaultChecked={employmentData.hasEmploymentGaps === 'Yes'}
                  value="Yes"
                />
                <label htmlFor="gaps-yes" className="ml-2 block text-sm text-gray-700">
                  Yes
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="gaps-no"
                  name="hasEmploymentGaps"
                  type="radio"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  defaultChecked={employmentData.hasEmploymentGaps === 'No'}
                  value="No"
                />
                <label htmlFor="gaps-no" className="ml-2 block text-sm text-gray-700">
                  No
                </label>
              </div>
            </div>
          ) : (
            <div className="text-gray-900 mb-4">{employmentData.hasEmploymentGaps || '-'}</div>
          )}
          
          {(employmentData.hasEmploymentGaps === 'Yes' || employmentData.employmentGapsExplanation) && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Please explain any gaps in your employment history</label>
              {isEditing ? (
                <textarea
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={employmentData.employmentGapsExplanation}
                />
              ) : (
                <div className="mt-1 text-gray-900">{employmentData.employmentGapsExplanation || '-'}</div>
              )}
            </div>
          )}
        </div>
        
        {/* Declaration */}
        {isEditing && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="declaration"
                  name="declaration"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  defaultChecked={employmentData.declaration}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="declaration" className="font-medium text-gray-700">Declaration</label>
                <p className="text-gray-500">I confirm that the information provided above is true and accurate to the best of my knowledge.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </TabSection>
  );
};

export default EmploymentData;