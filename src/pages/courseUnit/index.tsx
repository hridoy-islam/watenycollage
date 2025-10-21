import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Plus, FileText, MoveLeft, Pen, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useSelector } from 'react-redux';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import axiosInstance from '@/lib/axios';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

// Define the CourseUnit interface
interface CourseUnit {
  _id: string;
  courseId: string;
  unitReference: string;
  title: string;
  level: string;
  gls: string;
  credit: string;
}

function CourseUnitPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  // State
  const [units, setUnits] = useState<CourseUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUnitId, setCurrentUnitId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<CourseUnit | null>(null);

  // Form state
  const [unitReference, setUnitReference] = useState('');
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('');
  const [gls, setGls] = useState('');
  const [credit, setCredit] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [courseName, setCourseName] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch course name and units
  const fetchData = async (
    page: number = 1,
    entriesPerPage: number = 100,
    searchTerm: string = ''
  ) => {
    if (!courseId) return;

    try {
      setLoading(true);

      // Fetch course name
      const courseRes = await axiosInstance.get(`/courses/${courseId}`);
      setCourseName(courseRes.data?.data?.name || 'Course');

      // Fetch course units with pagination + search
      const unitsRes = await axiosInstance.get('/course-unit', {
        params: {
          courseId,
          page,
          limit: entriesPerPage,
          ...(searchTerm ? { searchTerm } : {})
        }
      });

      setUnits(unitsRes.data?.data?.result || []);
      setTotalPages(unitsRes.data?.data?.meta?.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load course units.',
        variant: 'destructive'
      });
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  // Open dialog for adding
  const openAddDialog = () => {
    setIsEditing(false);
    setCurrentUnitId(null);
    setUnitReference('');
    setTitle('');
    setLevel('');
    setGls('');
    setCredit('');
    setDialogOpen(true);
  };

  // Open dialog for editing
  const openEditDialog = (unit: CourseUnit) => {
    setIsEditing(true);
    setCurrentUnitId(unit._id);
    setUnitReference(unit.unitReference);
    setTitle(unit.title);
    setLevel(unit.level);
    setGls(unit.gls);
    setCredit(unit.credit);
    setDialogOpen(true);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (unit: CourseUnit) => {
    setUnitToDelete(unit);
    setDeleteDialogOpen(true);
  };

  // Submit form (create or update)
  const handleSubmit = async () => {
    if (
      !unitReference.trim() ||
      !title.trim() ||
      !level.trim() ||
      !gls.trim() ||
      !credit.trim()
    ) {
      toast({
        title: 'Error',
        description: 'All fields are required.',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);

    try {
      if (isEditing && currentUnitId) {
        // PATCH update
        await axiosInstance.patch(`/course-unit/${currentUnitId}`, {
          unitReference,
          title,
          level,
          gls,
          credit
        });

          setUnits((prevUnits) =>
        prevUnits.map((unit) =>
          unit._id === currentUnitId
            ? { ...unit, unitReference, title, level, gls, credit }
            : unit
        )
      );


        toast({ title: 'Unit updated successfully!' });
      } else {
        // POST create
        const res = await axiosInstance.post('/course-unit', {
        courseId,
        unitReference,
        title,
        level,
        gls,
        credit
      });

      // Add new unit to local state
      const newUnit: CourseUnit = res.data?.data;
       if (newUnit) {
        setUnits((prevUnits) => [...prevUnits, newUnit]);
      }
        toast({ title: 'Unit added successfully!' });
      }

      // Refresh data
      // fetchData();
      setDialogOpen(false);
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Error',
        description: isEditing
          ? 'Failed to update unit.'
          : 'Failed to add unit.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!unitToDelete) return;

    try {
      await axiosInstance.delete(`/course-unit/${unitToDelete._id}`);
      toast({ title: 'Unit deleted successfully!' });
      fetchData();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete unit.',
        variant: 'destructive'
      });
    }
  };

  const handleModule = (unit: CourseUnit) => {
    navigate(`${unit._id}`);
  };

  const sortedUnits = [...units].sort((a, b) => {
    const getUnitNumber = (title: string) => {
      const match = title.match(/Unit (\d+)/i);
      return match ? parseInt(match[1], 10) : Infinity; // Non-unit titles go to the end
    };
    return getUnitNumber(a.title) - getUnitNumber(b.title);
  });

  return (
    <div className="">
      {/* Header */}
      <div className="mb-4 flex flex-col items-stretch space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {courseName} Units
          </h1>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button
              className="w-full justify-center bg-watney text-white hover:bg-watney/90 sm:w-auto"
              onClick={() => navigate(-1)}
              size="sm"
            >
              <MoveLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {user?.role !== 'student' && (
              <DialogTrigger asChild>
                <Button
                  className="w-full justify-center bg-watney text-white hover:bg-watney/90 sm:w-auto"
                  onClick={openAddDialog}
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Unit
                </Button>
              </DialogTrigger>
            )}
          </div>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Edit Course Unit' : 'Add New Course Unit'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unitRef">Unit Reference</Label>
                  <Input
                    id="unitRef"
                    value={unitReference}
                    onChange={(e) => setUnitReference(e.target.value)}
                    placeholder="e.g., CS101"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Introduction to Programming"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Input
                    id="level"
                    value={level}
                    type="number"
                    min="0"
                    onChange={(e) => setLevel(e.target.value)}
                    placeholder="e.g., 4"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gls">GLS</Label>
                  <Input
                    id="gls"
                    type="number"
                    min="0"
                    value={gls}
                    onChange={(e) => setGls(e.target.value)}
                    placeholder="e.g., 3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credit">Credit</Label>
                  <Input
                    id="credit"
                    type="number"
                    min="0"
                    value={credit}
                    onChange={(e) => setCredit(e.target.value)}
                    placeholder="e.g., 15"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse justify-between gap-2 pt-4 sm:flex-row sm:justify-end sm:gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-watney text-white hover:bg-watney/90"
                >
                  {submitting
                    ? isEditing
                      ? 'Updating...'
                      : 'Adding...'
                    : isEditing
                      ? 'Update'
                      : 'Add Unit'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              unit{' '}
              <span className="font-semibold">"{unitToDelete?.title}"</span> and
              remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Units Table */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        ) : units.length === 0 ? (
          <div className="py-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-muted-foreground">
              No course units added yet
            </h3>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit Reference</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>GLS</TableHead>
                    <TableHead>Credit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUnits.map((unit) => (
                    <TableRow key={unit._id}>
                      <TableCell>{unit.unitReference}</TableCell>
                      <TableCell>{unit.title}</TableCell>
                      <TableCell>{unit.level}</TableCell>
                      <TableCell>{unit.gls}</TableCell>
                      <TableCell>{unit.credit}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleModule(unit)}
                                  className="flex flex-row items-center gap-2 bg-watney text-white hover:bg-watney/90"
                                >
                                  <FileText className="h-4 w-4" />
                                  View Details
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {user?.role !== 'student' && (
                            <>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => openEditDialog(unit)}
                                      className="bg-watney text-white hover:bg-watney/90"
                                    >
                                      <Pen className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => openDeleteDialog(unit)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {units.length > entriesPerPage && (
              <div className="mt-4 w-full max-md:flex max-md:scale-75 max-md:justify-center">
                <DataTablePagination
                  pageSize={entriesPerPage}
                  setPageSize={setEntriesPerPage}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CourseUnitPage;
