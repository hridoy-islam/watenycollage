import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { useSelector } from 'react-redux';

const CareerResumeUpload: React.FC = () => {
  const [resume, setResume] = useState<File | null>(null);
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const [loading, setLoading] = useState(false);
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
    if (!resume) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('entityId', user._id);
    formData.append('file_type', 'resumeDoc');
    formData.append('file', resume);

    try {
      const response = await axiosInstance.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const textContent = response.data?.data?.fileContent;
      const fileUrl = response.data?.data?.fileUrl;

      await axiosInstance.patch(`/users/${user._id}`, {
        cvResume: fileUrl
      });

      navigate('/dashboard/career-application', {
        state: { parsedResume: textContent }
      });
    } catch (error) {
      console.error('Error uploading resume:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-150px)] items-center justify-center">
      <div className="w-[500px] space-y-6 rounded-2xl bg-white p-6 shadow-md">
        <h2 className="text-md text-start font-medium text-gray-800">
          Upload your resume to fill in your application details quickly and
          accurately automatically.
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
            disabled={!resume || loading}
            className="hover:bg-watney-dark flex w-full items-center justify-center gap-2 rounded-xl bg-watney px-4 py-2 font-medium text-white transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg
                  className="h-5 w-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                <span>Uploading...</span>
              </>
            ) : (
              'Continue'
            )}
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
