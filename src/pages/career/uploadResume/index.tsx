import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';

const CareerResumeUpload: React.FC = () => {
  const [resume, setResume] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResume(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setResume(null);
  };

  const handleSkip = () => {
    navigate('/dashboard/career-application');
  };

  const handleContinue = async () => {
    if (resume) {
      const formData = new FormData();
      formData.append("file", resume); 
  
      try {
        const response = await axiosInstance.post("/documents", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const { textContent } = response.data.data;
        navigate('/career-application', {
            state: { parsedResume: textContent } 
          });
      } catch (error) {
        console.error("Error uploading resume:", error);
      }
    } else {
      console.warn("No resume file selected");
    }
  };
  
  return (
    <div className="flex min-h-[calc(100vh-150px)] items-center justify-center">
      <div className="w-[500px] space-y-6 rounded-2xl bg-white p-6 shadow-md">
        <h2 className="text-md text-start font-medium text-gray-800">
         Upload your resume to fill in your application details quickly and accurately automatically.
        </h2>

        {!resume ? (
          <label className="block cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition hover:bg-gray-50">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            <span className="text-gray-500">
              Click to upload resume (PDF, DOC)
            </span>
          </label>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-watney"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 12h6v1H9v-1zM9 9h6v1H9V9z" />
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h8.586a2 2 0 001.414-.586l3.414-3.414A2 2 0 0018 12.586V5a2 2 0 00-2-2H4zm0 2h12v7h-3a1 1 0 00-1 1v3H4V5z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs text-gray-700">{resume.name}</span>
            </div>
            <button
              onClick={handleRemove}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={handleContinue}
            disabled={!resume}
            className="hover:bg-watney-dark w-full rounded-xl bg-watney px-4 py-2 font-medium text-white transition disabled:opacity-50"
          >
            Continue
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CareerResumeUpload;
