import { useEffect, useState } from 'react';
import { Plus, Pen, MoveLeft, Check } from 'lucide-react';
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
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Controller } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Select from 'react-select';
import { Clipboard } from 'lucide-react';

// Types
interface Course {
  _id: string;
  name: string;
}

interface CourseCode {
  _id: string;
  course: Course;
  courseCode: string;
  status: number;
}

const courseCodeSchema = z.object({
  courseId: z.string().min(1, 'Course is required'),
  courseCode: z.string().min(1, 'Course code is required')
});

type CourseCodeFormValues = z.infer<typeof courseCodeSchema>;

export default function CourseCodePage() {
  const [courseCodes, setCourseCodes] = useState<CourseCode[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<CourseCode | null>(null);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [triggerSearch, setTriggerSearch] = useState(false);
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fetch course codes
  const fetchData = async (
    page = 1,
    limit = 10,
    courseId?: string,
    search?: string
  ) => {
    try {
      setInitialLoading(true);
      const params: any = { page, limit };
      if (courseId) params.course = courseId;
      if (search) params.courseCode = search;

      const response = await axiosInstance.get('/course-code', { params });
      setCourseCodes(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error) {
      console.error('Error fetching course codes:', error);
      toast({
        title: 'Failed to load course codes',
        className: 'bg-red-500 text-white'
      });
    } finally {
      setInitialLoading(false);
    }
  };

  // Fetch all courses for dropdown
  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get('/courses', {
        params: { limit: 'all' }
      });
      setCourses(response.data.data.result);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Failed to load courses',
        className: 'bg-red-500 text-white'
      });
    }
  };

  // Handle form submission (add/edit)
  const form = useForm<CourseCodeFormValues>({
    resolver: zodResolver(courseCodeSchema),
    defaultValues: { courseId: '', courseCode: '' }
  });

  const onSubmit = async (data: CourseCodeFormValues) => {
    try {
      const payload = { course: data.courseId, courseCode: data.courseCode };
      let response;

      if (editingCode) {
        response = await axiosInstance.patch(
          `/course-code/${editingCode._id}`,
          payload
        );
      } else {
        response = await axiosInstance.post('/course-code', payload);
      }

      if (response.data.success) {
        toast({
          title: response.data.message || 'Course code saved successfully',
          className: 'bg-watney text-white'
        });
        setDialogOpen(false);
        setEditingCode(null);
        fetchData(
          currentPage,
          entriesPerPage,
          selectedCourse || undefined,
          searchTerm
        );
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      toast({
        title: error.response?.data?.message || 'Operation failed',
        className: 'bg-red-500 text-white'
      });
    }
  };

  // Handle status toggle
  const handleStatusChange = async (id: string, status: boolean) => {
    try {
      await axiosInstance.patch(`/course-code/${id}`, {
        status: status ? 1 : 0
      });
      toast({ title: 'Status updated', className: 'bg-watney text-white' });
      fetchData(
        currentPage,
        entriesPerPage,
        selectedCourse || undefined,
        searchTerm
      );
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Failed to update status',
        className: 'bg-red-500 text-white'
      });
    }
  };

  // Open dialog for edit
  const handleEdit = (code: CourseCode) => {
    setEditingCode(code);
    form.reset({ courseId: code.course._id, courseCode: code.courseCode });
    setDialogOpen(true);
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (dialogOpen && !editingCode) {
      form.reset({ courseId: '', courseCode: '' });
    }
  }, [dialogOpen, editingCode, form]);

  // Load data on mount or when filter/page/search changes
  useEffect(() => {
    fetchData(
      currentPage,
      entriesPerPage,
      selectedCourse || undefined,
      triggerSearch ? searchTerm : undefined
    );
  }, [currentPage, entriesPerPage, selectedCourse, triggerSearch]);

  // Course filter handler
  const handleCourseFilter = (option: any) => {
    setSelectedCourse(option?.value || null);
    setCurrentPage(1);
  };

  // Trigger search button click
  const handleSearchClick = () => {
    setTriggerSearch((prev) => !prev);
    setCurrentPage(1);
  };

  // Course options for react-select
  const courseOptions = courses.map((c) => ({ value: c._id, label: c.name }));
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1000); // revert after 1 second
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <h1 className="text-2xl font-semibold">Course Codes</h1>

          {/* Course Filter */}
          <Select
            options={courseOptions}
            value={
              courseOptions.find((opt) => opt.value === selectedCourse) || null
            }
            onChange={handleCourseFilter}
            placeholder="Filter by course"
            className="min-w-[250px]"
            isClearable
          />

          {/* Search by Course Code */}
          <div className="flex gap-2">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by course code"
              className="h-9 min-w-[200px]"
            />
            <Button
              onClick={handleSearchClick}
              className="bg-watney text-white hover:bg-watney/90"
            >
              Search
            </Button>
          </div>
        </div>

        <div className="flex flex-row items-center gap-4">
          <Button
            className="bg-watney text-white hover:bg-watney/90"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button
            className="bg-watney text-white hover:bg-watney/90"
            size="sm"
            onClick={() => {
              setEditingCode(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Course Code
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md bg-white p-4 shadow-2xl">
        {initialLoading ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        ) : courseCodes.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No course codes found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Name</TableHead>
                <TableHead>Course Code</TableHead>
                <TableHead className="w-32 text-center">Status</TableHead>
                <TableHead className="w-32 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courseCodes.map((code) => (
                <TableRow key={code._id}>
                  <TableCell>{code?.course?.name}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    {code.courseCode}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(code.courseCode)}
                    >
                      {copiedCode === code.courseCode ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clipboard className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>

                  <TableCell className="text-center">
                    <Switch
                      checked={code.status === 1}
                      onCheckedChange={(checked) =>
                        handleStatusChange(code._id, checked)
                      }
                      className="mx-auto"
                    />
                  </TableCell>
                  <TableCell className="flex flex-row items-center justify-center gap-4">
                    <Button
                      variant="ghost"
                      className="bg-watney text-white hover:bg-watney/90"
                      size="icon"
                      onClick={() => handleEdit(code)}
                    >
                      <Pen className="h-4 w-4" />
                    </Button>
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

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingCode(null);
            form.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCode ? 'Edit Course Code' : 'Add New Course Code'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Controller
                      name="courseId"
                      control={form.control}
                      render={({ field }) => (
                        <Select
                          options={courseOptions}
                          value={courseOptions.find(
                            (opt) => opt.value === field.value
                          )}
                          onChange={(selected) =>
                            field.onChange(selected?.value)
                          }
                          placeholder="Select a course"
                        />
                      )}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="courseCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter course code (e.g., ENG101)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-watney text-white hover:bg-watney/90"
                >
                  {editingCode ? 'Update' : 'Save'} Course Code
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
