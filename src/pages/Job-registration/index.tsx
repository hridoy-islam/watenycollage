import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import JobSelectionForm from './components/job-selection-form';
import JobApplicationForm from './components/job-application-form';

export interface Job {
  _id: string;
  jobTitle: string;
  applicationDeadline: string;
  status: number;
}

export interface Department {
  _id: string;
  name: string;
}

function JobRegistration() {
  const [formData, setFormData] = useState({
    applicantType: '',
    department: '',
    jobTitle: '',
    jobId: ''
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showApplication, setShowApplication] = useState(false);
  const { id: jobIdFromUrl } = useParams();

  useEffect(() => {
    async function fetchInitialData() {
      try {
        // This would fetch actual data in a real implementation
        // Mock data for demonstration
        const mockDepartments = [
          { _id: "1", name: "Engineering" },
          { _id: "2", name: "Marketing" },
          { _id: "3", name: "Human Resources" },
          { _id: "4", name: "Finance" },
          { _id: "5", name: "Operations" }
        ];
        
        const mockJobs = [
          { _id: "101", jobTitle: "Senior Software Engineer", applicationDeadline: "2025-06-30", status: 1, departmentId: "1" },
          { _id: "102", jobTitle: "Marketing Manager", applicationDeadline: "2025-07-15", status: 1, departmentId: "2" },
          { _id: "103", jobTitle: "HR Specialist", applicationDeadline: "2025-06-25", status: 1, departmentId: "3" },
          { _id: "104", jobTitle: "Financial Analyst", applicationDeadline: "2025-07-10", status: 1, departmentId: "4" },
          { _id: "105", jobTitle: "Operations Director", applicationDeadline: "2025-08-01", status: 1, departmentId: "5" },
          { _id: "106", jobTitle: "Frontend Developer", applicationDeadline: "2025-07-20", status: 1, departmentId: "1" },
          { _id: "107", jobTitle: "Backend Developer", applicationDeadline: "2025-07-25", status: 1, departmentId: "1" }
        ];

        // In a real implementation, you would fetch this data from the server
        // const [departmentsRes, jobsRes] = await Promise.all([
        //   axiosInstance.get('/departments'),
        //   axiosInstance.get('/jobs')
        // ]);
        
        // setDepartments(departmentsRes?.data?.data?.result || []);
        // const fetchedJobs = jobsRes?.data?.data?.result || [];
        
        setDepartments(mockDepartments);
        setJobs(mockJobs);

        // If there's a job ID in the URL, find and set that job
        if (jobIdFromUrl) {
          const selectedJob = mockJobs.find(
            (job) => job._id === jobIdFromUrl
          );
          if (selectedJob) {
            setFormData((prev) => ({
              ...prev,
              jobTitle: selectedJob.jobTitle,
              jobId: selectedJob._id
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    }

    fetchInitialData();
  }, [jobIdFromUrl]);

  const handleJobChange = (value: string) => {
    const selectedJob = jobs.find((job) => job.jobTitle === value);
    setFormData((prev) => ({
      ...prev,
      jobTitle: value,
      jobId: selectedJob?._id || ''
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedDepartment = departments.find(
      (dept) => dept.name === formData.department
    );
    const departmentId = selectedDepartment?._id;

    const selectedJob = jobs.find(
      (job) => job.jobTitle === formData.jobTitle
    );
    const jobId = selectedJob?._id;

    if (jobId && departmentId && formData.applicantType) {
      localStorage.setItem('jobId', jobId);
      localStorage.setItem('departmentId', departmentId);
      localStorage.setItem('applicantType', formData.applicantType);

      setShowApplication(true);
    }
  };

  return showApplication ? (
    <JobApplicationForm 
      formData={formData} 
      onBack={() => setShowApplication(false)} 
    />
  ) : (
    <JobSelectionForm
      formData={formData}
      setFormData={setFormData}
      jobs={jobs}
      departments={departments}
      handleJobChange={handleJobChange}
      handleSubmit={handleSubmit}
    />
  );
}

export default JobRegistration;