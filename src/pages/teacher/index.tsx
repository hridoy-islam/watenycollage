import { useEffect, useState } from 'react';
import {
  ClipboardPaste,
  FilePlus,
  Link2,
  MoveLeft,
  Pen,
  Plus
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
import { TeacherDialog } from './components/teacher-dialog';
import axiosInstance from '../../lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const fetchData = async (page: number, limit: number, search = '') => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get('/users', {
        params: {
          role: 'teacher',
          page,
          limit,
          ...(search ? { searchTerm: search } : {})
        }
      });
      setTeachers(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast({
        title: 'Failed to fetch teachers',
        className: 'bg-destructive border-none text-white'
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      let response;
      if (editingTeacher) {
        // Update teacher
        response = await axiosInstance.patch(
          `/users/${editingTeacher._id}`,
          data
        );

        if (response.data?.success) {
          // Update teacher in local state
          setTeachers((prev) =>
            prev.map((t) =>
              t._id === editingTeacher._id ? { ...t, ...data } : t
            )
          );

          toast({
            title: 'Teacher updated successfully',
            className: 'bg-watney border-none text-white'
          });
        }
      } else {
        // Create new teacher
        const teacherData = {
          ...data,
          role: 'teacher',
          authorized: true,
          isValided: true,
          isCompleted: true
        };
        response = await axiosInstance.post('/auth/signup', teacherData);

        if (response.data?.success) {
          // Add new teacher to local state
          setTeachers((prev) => [response.data.data, ...prev]);

          toast({
            title: 'Teacher created successfully',
            className: 'bg-watney border-none text-white'
          });
        }
      }

      setEditingTeacher(null);
      setDialogOpen(false);
    } catch (error: any) {
      console.error(error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred. Please try again.';

      toast({
        title: message,
        className: 'bg-destructive border-none text-white'
      });
    }
  };

  const handleSearch = () => {
    fetchData(currentPage, entriesPerPage, searchTerm);
  };

  const handleStatusChange = async (id: string, status: boolean) => {
    try {
      const updatedStatus = status ? 'active' : 'block';
      await axiosInstance.patch(`/users/${id}`, { status: updatedStatus });
      toast({
        title: 'Status updated successfully',
        className: 'bg-watney border-none text-white'
      });
      fetchData(currentPage, entriesPerPage, searchTerm);
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Failed to update status',
        className: 'bg-destructive border-none text-white'
      });
    }
  };

  const handleEdit = (teacher: any) => {
    setEditingTeacher(teacher);
    setDialogOpen(true);
  };

  const handleDetails = (teacher: any) => {
    navigate(`${teacher._id}`);
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage, searchTerm);
  }, [currentPage, entriesPerPage]);

  return (
    <div className="space-y-3 rounded-lg bg-white p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">All Teachers</h1>

        <Button
          className="bg-watney text-white hover:bg-watney/90"
          size="sm"
          onClick={() => {
            navigate(-1);
          }}
        >
          <MoveLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
      <div className="flex w-full justify-between ">
        <div className="flex items-center space-x-4">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email"
            className="h-8 min-w-[400px]"
          />
          <Button
            size="sm"
            onClick={handleSearch}
            className="min-w-[100px] border-none bg-watney text-white hover:bg-watney/90"
          >
            Search
          </Button>
        </div>
        <Button
          className="bg-watney text-white hover:bg-watney/90"
          size="sm"
          onClick={() => {
            setEditingTeacher(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Teacher
        </Button>
      </div>
      <div className=" p-4">
        {initialLoading ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        ) : teachers.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No records found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher._id}>
                  <TableCell>{teacher.name}</TableCell>
                  <TableCell>{teacher.phone}</TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>{teacher.address}</TableCell>

                  <TableCell className="text-center">
                    <Switch
                      checked={teacher.status == 'active'}
                      onCheckedChange={(checked) =>
                        handleStatusChange(teacher._id, checked)
                      }
                      className="mx-auto"
                    />
                  </TableCell>
                  <TableCell className="space-x-2 text-center">
                    <TooltipProvider>
                      <div className="flex justify-end gap-2">
                        {/* Details Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              className="border-none bg-watney text-white hover:bg-watney/90"
                              size="icon"
                              onClick={() => handleDetails(teacher)}
                            >
                              <FilePlus className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Assign Course</p>
                          </TooltipContent>
                        </Tooltip>

                        {/* Edit Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              className="border-none bg-watney text-white hover:bg-watney/90"
                              size="icon"
                              onClick={() => handleEdit(teacher)}
                            >
                              <Pen className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit Teacher</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {teachers.length > 10 && (
          <DataTablePagination
            pageSize={entriesPerPage}
            setPageSize={setEntriesPerPage}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <TeacherDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingTeacher(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingTeacher}
      />
    </div>
  );
}
