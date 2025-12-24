import { useEffect, useState } from 'react';
import {
  Plus,
  Pen,
  MoveLeft,
  Check,
  Copy,
  FileQuestion,
  FileJson,
  FileBadge,
  File,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Input } from '@/components/ui/input';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { CourseDialog } from './components/course-dialog';
import { useNavigate } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [copiedId, setCopiedId] = useState(null);

  const fetchData = async (page, entriesPerPage, searchTerm = '') => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/courses`, {
        params: {
          page,
          limit: entriesPerPage,
          ...(searchTerm ? { searchTerm } : {})
        }
      });
      setCourses(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setInitialLoading(false); // Disable initial loading after the first fetch
    }
  };

  const handleSubmit = async (data) => {
    try {
      let response;
      if (editingCourse) {
        response = await axiosInstance.patch(
          `/courses/${editingCourse?._id}`,
          data
        );
      } else {
        response = await axiosInstance.post(`/courses`, data);
      }

      if (response.data && response.data.success === true) {
        toast({
          title: response.data.message || 'Record Updated successfully',
          className: 'bg-watney border-none text-white'
        });
      } else if (response.data && response.data.success === false) {
        toast({
          title: response.data.message || 'Operation failed',
          className: 'bg-red-500 border-none text-white'
        });
      } else {
        toast({
          title: 'Unexpected response. Please try again.',
          className: 'bg-red-500 border-none text-white'
        });
      }
      // Refresh data
      fetchData(currentPage, entriesPerPage);
      setEditingCourse(undefined); // Reset editing state
    } catch (error) {
      // Display an error toast if the request fails
      toast({
        title: 'An error occurred. Please try again.',
        className: 'bg-red-500 border-none text-white'
      });
    }
  };

  const handleSearch = () => {
    fetchData(currentPage, entriesPerPage, searchTerm);
  };

  const handleStatusChange = async (id, status) => {
    try {
      const updatedStatus = status ? '1' : '0';
      await axiosInstance.patch(`/courses/${id}`, { status: updatedStatus });
      toast({
        title: 'Record updated successfully',
        className: 'bg-watney border-none text-white'
      });
      fetchData(currentPage, entriesPerPage);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setDialogOpen(true);
  };
  const handleUnit = (course) => {
    navigate(`${course._id}/unit`)
  };

   const handleDocument = (course) => {
    navigate(`course-document/${course._id}`)
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage); // Refresh data
  }, [currentPage, entriesPerPage]);

  const navigate = useNavigate();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: 'URL copied to clipboard',
          className: 'bg-watney border-none text-white'
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: 'Failed to copy URL',
          className: 'bg-red-500 border-none text-white'
        });
      }
    );
  };

  const handleCopy = (id) => {
    const formatted = `[courseCode="${id}"]`;
    navigator.clipboard.writeText(formatted);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1000);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <h1 className="text-2xl font-semibold">All Courses</h1>
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Course Name"
              className="h-8 max-w-[400px]"
            />
            <Button
              onClick={handleSearch}
              size="sm"
              className="min-w-[100px] border-none bg-watney text-white hover:bg-watney/90"
            >
              Search
            </Button>
          </div>
        </div>
        <div className="flex flex-row items-center gap-4">
          <Button
            className="border-none bg-watney text-white hover:bg-watney/90"
            size={'sm'}
            onClick={() => navigate('/dashboard')}
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            className="border-none bg-watney text-white hover:bg-watney/90"
            size={'sm'}
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Course
          </Button>
        </div>
      </div>

      <div className="rounded-md bg-white p-4 shadow-2xl">
        {initialLoading ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        ) : courses.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No records found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead className="w-32 text-center">Status</TableHead>
                <TableHead className="w-32 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course._id}>
                  <TableCell className="items-center font-medium ">
                    <div className="flex items-center">
                      {course?.courseCode ? (
                        <span className=" text-md">{course?.courseCode}</span>
                      ) : (
                        '-'
                      )}
                      {/* {course?.courseCode &&
                    <Button
                      variant="ghost"
                      size="icon"
                      className="p-1"
                      onClick={() => handleCopy(course?.courseCode)}
                      >
                      {copiedId === course?.courseCode ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>} */}
                    </div>
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <span>{course.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="border-none bg-blue-100 text-blue-600 hover:bg-blue-200"
                      onClick={() =>
                        copyToClipboard(
                          `${window.location.origin}/courses/apply/${course._id}`
                        )
                      }
                      title="Copy application link"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        ></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </Button>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex flex-row items-center justify-center gap-1">
                      <Switch
                        checked={course.status === 1}
                        onCheckedChange={(checked) =>
                          handleStatusChange(course._id, checked)
                        }
                        className="mx-auto"
                      />
                      <span className="text-sm font-medium">
                        {course.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="space-x-3 text-center">
                    <div className='flex flex-row items-center gap-2'>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            className="border-none bg-watney text-white hover:bg-watney/90 flex "
                            size="sm"
                            onClick={() => handleDocument(course)}
                            >
                            <File className="h-4 w-4 mr-2" />
                            Document
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Course Document</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            className="border-none bg-watney text-white hover:bg-watney/90 flex "
                            size="sm"
                            onClick={() => handleUnit(course)}
                            >
                            <FileText className="h-4 w-4 mr-2" />
                            Units
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Units</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            className="border-none bg-watney text-white hover:bg-watney/90 space-x-2"
                            size="sm"
                            onClick={() => handleEdit(course)}
                            >
                            <Pen className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                            </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <DataTablePagination
          pageSize={entriesPerPage}
          setPageSize={setEntriesPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <CourseDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingCourse(undefined);
        }}
        onSubmit={handleSubmit}
        initialData={editingCourse}
      />
    </div>
  );
}
