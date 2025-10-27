import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, MoveLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import Select from 'react-select';

import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { useNavigate, useParams } from 'react-router-dom';
import { BlinkingDots } from '@/components/shared/blinking-dots';

interface CareerApplication {
  _id: string;
  applicantId?: {
    _id?: string;
    name?: string;
    email?: string;
    title?: string;
    firstName?: string;
    initial?: string;
    lastName?: string;
    postalAddressLine1?: string;
    phone?: string;
  };
  jobId?: { jobTitle?: string };
}

export default function CareerApplicationsPage() {
  const [allApplications, setAllApplications] = useState<CareerApplication[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Recruit Dialog States
  const [recruitDialogOpen, setRecruitDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<CareerApplication | null>(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Confirmation, 2: Success & Course Assignment
  const [submitting, setSubmitting] = useState(false);

  // Course Assignment States
  const [courses, setCourses] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  const fetchAllApplications = async (
    page,
    entriesPerPage,
    searchTerm = ''
  ) => {
    setLoading(true);
    try {
      const [applicationsRes, jobRes] = await Promise.all([
        axiosInstance.get(`/application-job?jobId=${id}&status=applied`, {
          params: {
            page,
            limit: entriesPerPage,
            ...(searchTerm ? { searchTerm } : {})
          }
        }),
        axiosInstance.get(`/jobs/${id}`)
      ]);

      const applicationsData = applicationsRes.data.data;
      setAllApplications(applicationsData.result || []);
      setTotalPages(applicationsData.meta.totalPage);
      setJobTitle(jobRes?.data?.data?.jobTitle);
    } catch (error) {
      console.error('Error fetching applications or job details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllApplications(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage]);

  const handleSearch = () => {
    fetchAllApplications(currentPage, entriesPerPage, searchTerm);
  };

  // Fetch courses and terms for assignment
  const fetchCoursesAndTerms = async () => {
    try {
      const [coursesResponse, termsResponse] = await Promise.all([
        axiosInstance.get('/courses?limit=all'),
        axiosInstance.get('/terms?limit=all')
      ]);

      const courseOptions =
        coursesResponse?.data?.data?.result?.map((course) => ({
          value: course._id,
          label: `${course.name} (${course.courseCode})`
        })) || [];
      setCourses(courseOptions);

      const termOptions =
        termsResponse?.data?.data?.result?.map((term) => ({
          value: term._id,
          label: term.termName
        })) || [];
      setTerms(termOptions);
    } catch (error) {
      console.error('Error fetching courses and terms:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch courses and terms',
        className: 'bg-red-500 border-none text-white'
      });
    }
  };

  const handleRecruitClick = (application: CareerApplication) => {
    setSelectedApplication(application);
    setRecruitDialogOpen(true);
    setCurrentStep(1);
    setSelectedCourse('');
    setSelectedTerm('');
  };

  const handleRecruitConfirmation = async () => {
    if (!selectedApplication?.applicantId?._id) return;

    setSubmitting(true);
    try {
      // Update user role to teacher
      await axiosInstance.patch(
        `/users/${selectedApplication.applicantId._id}`,
        {
          role: 'teacher',
          address: selectedApplication.applicantId.postalAddressLine1 || ''
        }
      );

      await axiosInstance.patch(`/application-job/${selectedApplication._id}`, {
        status: 'recruit'
      });

      // Move to success step
      await fetchCoursesAndTerms();
      setCurrentStep(2);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to recruit user',
        className: 'bg-red-500 border-none text-white'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCourseAssignment = async () => {
    if (
      !selectedApplication?.applicantId?._id ||
      !selectedCourse ||
      !selectedTerm
    ) {
      toast({
        title: 'Error',
        description: 'Please select both course and term',
        className: 'bg-red-500 border-none text-white'
      });
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstance.post(`/teacher-courses`, {
        teacherId: selectedApplication.applicantId._id,
        courseId: selectedCourse,
        termId: selectedTerm
      });

      toast({
        title: 'Course assigned successfully',
        // description: 'Course assigned successfully',
        className: 'bg-watney border-none text-white'
      });

      // Close dialog and refresh data
      setRecruitDialogOpen(false);
      setSelectedApplication(null);
      setCurrentStep(1);
      fetchAllApplications(currentPage, entriesPerPage);
    } catch (error) {
      console.error('Error assigning course:', error);
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || 'Failed to assign course',
        className: 'bg-red-500 border-none text-white'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipCourseAssignment = () => {
    setRecruitDialogOpen(false);
    setSelectedApplication(null);
    setCurrentStep(1);
    // toast({
    //   title: 'Success',
    //   description: 'User recruited as teacher successfully',
    //   className: 'bg-watney border-none text-white'
    // });
    fetchAllApplications(currentPage, entriesPerPage);
  };

  const getApplicantName = (app: CareerApplication) => {
    return `${app.applicantId?.title || ''} ${app.applicantId?.firstName || ''} ${app.applicantId?.initial || ''} ${app.applicantId?.lastName || ''}`.trim();
  };

  return (
    <div className="space-y-6">
      {/* Header with Search + Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <h2 className="text-xl font-bold">{jobTitle}</h2>
        </div>
        <Button
          className="bg-watney text-white hover:bg-watney/90"
          onClick={() => navigate('/dashboard/jobs')}
        >
          <MoveLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Unified Table Container */}
      <div className="rounded-md bg-white p-4 shadow-2xl">
        {loading ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        ) : allApplications.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No matching results found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead className="w-32 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allApplications.map((app) => (
                <TableRow key={app._id}>
                  <TableCell className="font-medium">
                    {getApplicantName(app)}
                  </TableCell>
                  <TableCell>{app.applicantId?.email ?? 'N/A'}</TableCell>
                  <TableCell>{app.jobId?.jobTitle ?? 'N/A'}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-row items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        className="border-none bg-watney text-white hover:bg-watney/90"
                        size="sm"
                        onClick={() => handleRecruitClick(app)}
                      >
                        Recruit
                      </Button>
                      <Button
                        variant="ghost"
                        className="border-none bg-watney text-white hover:bg-watney/90"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/dashboard/career-application/${app?._id}/${app.applicantId?._id}`
                          )
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        <DataTablePagination
          pageSize={entriesPerPage}
          setPageSize={setEntriesPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Recruit Dialog */}
      <Dialog open={recruitDialogOpen} onOpenChange={setRecruitDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {currentStep === 1
                ? 'Confirm Recruitment'
                : 'Recruitment Successful'}
            </DialogTitle>
            <DialogDescription>
              {' '}
              {currentStep === 1
                ? ''
                : 'The applicant has been successfully recruited.'}
            </DialogDescription>
          </DialogHeader>

          {currentStep === 1 && selectedApplication && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Applicant Details
                </h3>

                <div className="grid grid-cols-2 space-y-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Name</p>
                    <p className="text-lg text-gray-900">
                      {getApplicantName(selectedApplication)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">Email</p>
                    <p className="text-lg text-gray-900">
                      {selectedApplication.applicantId?.email || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">Phone</p>
                    <p className="text-lg text-gray-900">
                      {selectedApplication.applicantId?.phone || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Address
                    </p>
                    <p className="text-lg text-gray-900">
                      {selectedApplication.applicantId?.postalAddressLine1 ||
                        'N/A'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Job Title
                    </p>
                    <p className="text-lg text-gray-900">
                      {selectedApplication.jobId?.jobTitle || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="mb-4 text-lg font-semibold text-gray-900">
                  Are you sure you want to recruit this applicant?
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setRecruitDialogOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-watney text-white hover:bg-watney/90"
                  onClick={handleRecruitConfirmation}
                  disabled={submitting}
                >
                  {submitting ? 'Recruiting...' : 'Yes, Recruit'}
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-2">
              <div>
                <p className="mb-4 text-lg font-semibold text-gray-900">
                 Would you like to continue with assigning a course?{' '}
                </p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="course">Select Course</Label>
                    <Select
                      id="course"
                      options={courses}
                      value={
                        courses.find((c) => c.value === selectedCourse) || null
                      }
                      onChange={(selected) =>
                        setSelectedCourse(selected?.value || '')
                      }
                      placeholder="Select a course..."
                      isClearable
                      className="text-gray-900"
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderColor: '#D1D5DB',
                          boxShadow: 'none',
                          '&:hover': { borderColor: '#9CA3AF' }
                        })
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="term">Select Term</Label>
                    <Select
                      id="term"
                      options={terms}
                      value={
                        terms.find((t) => t.value === selectedTerm) || null
                      }
                      onChange={(selected) =>
                        setSelectedTerm(selected?.value || '')
                      }
                      placeholder="Select a term..."
                      isClearable
                      className="text-gray-900"
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderColor: '#D1D5DB',
                          boxShadow: 'none',
                          '&:hover': { borderColor: '#9CA3AF' }
                        })
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={handleSkipCourseAssignment}
                  disabled={submitting}
                >
                  Skip for Now
                </Button>
                <Button
                  className="bg-watney text-white hover:bg-watney/90"
                  onClick={handleCourseAssignment}
                  disabled={submitting || !selectedCourse || !selectedTerm}
                >
                  {submitting ? 'Assigning...' : 'Assign Course'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
