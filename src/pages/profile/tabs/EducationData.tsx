import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import TabSection from '../TabSection';
import { User } from '../../../types/user.types';

interface EducationDataProps {
  userData: User;
  isEditing?: boolean;
}

const EducationData: React.FC<EducationDataProps> = ({ userData, isEditing = false }) => {
  // Mock education data since we don't have it in our sample userData
  const mockEducationData = [
    {
      institution: 'University of London',
      studyType: 'Bachelor',
      qualification: 'BSc Computer Science',
      awardDate: '2020-06-15',
      certificate: null,
      transcript: null
    }
  ];

  const educationData = userData.educationData?.educationData || mockEducationData;

  return (
    <TabSection 
      title="Education" 
      description="Your educational background and qualifications" 
      userData={userData}
    >
      <div className="space-y-8">
        {/* Education Qualifications */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Education History</h3>
            
            {isEditing && (
              <button 
                type="button"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus size={16} className="mr-2" />
                Add Education
              </button>
            )}
          </div>

          {educationData.length > 0 ? (
            <div className="space-y-6">
              {educationData.map((education, index) => (
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
                      <label className="block text-sm font-medium text-gray-700">Institution</label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          defaultValue={education.institution}
                        />
                      ) : (
                        <div className="mt-1 text-gray-900">{education.institution}</div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Study Type</label>
                      {isEditing ? (
                        <select
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          defaultValue={education.studyType}
                        >
                          <option value="Bachelor">Bachelor</option>
                          <option value="Master">Master</option>
                          <option value="PhD">PhD</option>
                          <option value="Diploma">Diploma</option>
                          <option value="Certificate">Certificate</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <div className="mt-1 text-gray-900">{education.studyType}</div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Qualification</label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          defaultValue={education.qualification}
                        />
                      ) : (
                        <div className="mt-1 text-gray-900">{education.qualification}</div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Award Date</label>
                      {isEditing ? (
                        <input
                          type="date"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          defaultValue={education.awardDate as string}
                        />
                      ) : (
                        <div className="mt-1 text-gray-900">
                          {education.awardDate ? new Date(education.awardDate).toLocaleDateString() : '-'}
                        </div>
                      )}
                    </div>
                    
                    {isEditing && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Certificate</label>
                          <input
                            type="file"
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Transcript</label>
                          <input
                            type="file"
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No education records found</p>
              {isEditing && (
                <button 
                  type="button"
                  className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus size={16} className="mr-2" />
                  Add Education
                </button>
              )}
            </div>
          )}
        </div>

        {/* English Qualification */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">English Language Qualification</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">English Test Type</label>
              {isEditing ? (
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={userData.educationData?.englishQualification.englishTestType || ''}
                >
                  <option value="">Select test type</option>
                  <option value="IELTS">IELTS</option>
                  <option value="TOEFL">TOEFL</option>
                  <option value="PTE">PTE Academic</option>
                  <option value="Cambridge">Cambridge English</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <div className="mt-1 text-gray-900">
                  {userData.educationData?.englishQualification.englishTestType || '-'}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Test Score</label>
              {isEditing ? (
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={userData.educationData?.englishQualification.englishTestScore || ''}
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {userData.educationData?.englishQualification.englishTestScore || '-'}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Test Date</label>
              {isEditing ? (
                <input
                  type="date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue={userData.educationData?.englishQualification.englishTestDate as string || ''}
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {userData.educationData?.englishQualification.englishTestDate 
                    ? new Date(userData.educationData.englishQualification.englishTestDate).toLocaleDateString() 
                    : '-'}
                </div>
              )}
            </div>
            
            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload Certificate</label>
                <input
                  type="file"
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </TabSection>
  );
};

export default EducationData;