/* eslint-disable no-unused-vars */
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
  FileText,
  Trash
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
import { useNavigate } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { EcertDialog } from './components/EcertDialog';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';

interface TEcert {
  _id?: string;
  title: string;
  status: 'active' | 'block';
  createdAt?: Date;
  updatedAt?: Date;
}

export default function EcertsPage() {
  const [ecerts, setEcerts] = useState<TEcert[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEcert, setEditingEcert] = useState<TEcert | undefined>();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEcertId, setSelectedEcertId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const navigate = useNavigate();

  // Updated API path from /courses to /ecerts
  const fetchData = async (
    page: number,
    entriesPerPage: number,
    searchTerm: string = ''
  ) => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/ecerts`, {
        params: {
          page,
          limit: entriesPerPage,
          ...(searchTerm ? { searchTerm } : {})
        }
      });
      // Ensure the response data structure is correctly accessed
      setEcerts(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error) {
      console.error('Error fetching Traning:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch Traning data.',
        className: 'bg-red-500 border-none text-white'
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (data: { title: string }) => {
    try {
      let response;
      if (editingEcert) {
        response = await axiosInstance.patch(
          `/ecerts/${editingEcert._id}`,
          data
        );
      } else {
        response = await axiosInstance.post(`/ecerts`, data);
      }

      if (response.data && response.data.success) {
        toast({
          title:
            response.data.message ||
            `Traning ${editingEcert ? 'updated' : 'created'} successfully`,
          className: 'bg-watney border-none text-white'
        });

        if (editingEcert) {
          // Update existing ecert locally
          setEcerts((prev) =>
            prev.map((e) =>
              e._id === editingEcert._id ? { ...e, ...data } : e
            )
          );
        } else if (response.data.data) {
          // Add new ecert locally
          setEcerts((prev) => [response.data.data, ...prev]);
        }

        setEditingEcert(undefined);
        setDialogOpen(false);
      } else {
        toast({
          title: response.data?.message || 'Operation failed',
          className: 'bg-red-500 border-none text-white'
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'An error occurred. Please try again.',
        className: 'bg-red-500 border-none text-white'
      });
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData(1, entriesPerPage, searchTerm);
  };

  const handleStatusChange = async (id: string, isChecked: boolean) => {
    try {
      const updatedStatus = isChecked ? 'active' : 'block';
      await axiosInstance.patch(`/ecerts/${id}`, { status: updatedStatus });

      // Update the state locally
      setEcerts((prev) =>
        prev.map((ecert) =>
          ecert._id === id ? { ...ecert, status: updatedStatus } : ecert
        )
      );

      toast({
        title: 'Traning status updated successfully',
        className: 'bg-watney border-none text-white'
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Update Failed',
        description: 'Could not change Traning status.',
        className: 'bg-red-500 border-none text-white'
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await axiosInstance.delete(`/ecerts/${id}`);

      if (response.data && response.data.success) {
        // Remove the ecert locally
        setEcerts((prev) => prev.filter((e) => e._id !== id));

        toast({
          title: response.data.message || 'Traning deleted successfully',
          className: 'bg-watney border-none text-white'
        });
      } else {
        toast({
          title: response.data?.message || 'Delete failed',
          className: 'bg-red-500 border-none text-white'
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'An error occurred. Please try again.',
        className: 'bg-red-500 border-none text-white'
      });
    }
  };

  const handleEdit = (ecert: TEcert) => {
    setEditingEcert(ecert);
    setDialogOpen(true);
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage, searchTerm);
  }, [currentPage, entriesPerPage]); // searchTerm dependency removed to prevent double fetch

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <h1 className="text-2xl font-semibold">All Trainings</h1>
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Training Title"
              className="h-12 max-w-[400px] border-gray-300 focus:border-watney"
              onKeyDown={(e) => {
                // Added functionality to search on Enter key
                if (e.key === 'Enter') handleSearch();
              }}
            />
            <Button
              onClick={handleSearch}
              className="min-w-[100px] border-none bg-watney text-white hover:bg-watney/90"
            >
              Search
            </Button>
          </div>
        </div>
        <div className="flex flex-row items-center gap-4">
          <Button
            className="border-none bg-watney text-white hover:bg-watney/90"
            onClick={() => navigate('/dashboard')}
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            className="border-none bg-watney text-white hover:bg-watney/90"
            onClick={() => {
              setEditingEcert(undefined); // Ensure no old data is passed
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Traning
          </Button>
        </div>
      </div>

      <div className="rounded-md bg-white p-4 shadow-2xl">
        {initialLoading && ecerts.length === 0 ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        ) : ecerts.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No Traning records found.
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                  <TableHead className="min-w-[300px]">Training Title</TableHead>
                  <TableHead className="w-32 text-center">Status</TableHead>
                  <TableHead className="w-32 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ecerts.map((ecert) => (
                  <TableRow key={ecert._id}>
                    {/* Display Training Title */}
                    <TableCell className="font-medium text-gray-800">
                      <span className="line-clamp-2">{ecert.title}</span>
                    </TableCell>

                    {/* Status Switch */}
                    <TableCell className="text-center ">
                      <div className="flex flex-row items-center gap-4">
                        <Switch
                          checked={ecert.status === 'active'}
                          onCheckedChange={(checked) =>
                            handleStatusChange(ecert?._id, checked)
                          }
                        />

                        <Badge>{ecert?.status.toUpperCase()}</Badge>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="space-x-3 text-center">
                      <div className="flex items-center justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="default"
                                className="h-8 w-8"
                                size="icon"
                                onClick={() => handleEdit(ecert)}
                              >
                                <Pen className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit Training</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="default"
                                className="h-8 w-8"
                                size="icon"
                                onClick={() => {
                                  setSelectedEcertId(ecert._id); // store which ecert to delete
                                  setDeleteDialogOpen(true); // open confirmation dialog
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>delete Training</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {ecerts.length > 50 && (
              <DataTablePagination
                pageSize={entriesPerPage}
                setPageSize={setEntriesPerPage}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>

      <EcertDialog // Use the refactored dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingEcert(undefined); // Clear editing state on close
        }}
        onSubmit={handleSubmit}
        initialData={editingEcert}
      />

      {deleteDialogOpen && selectedEcertId && (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this Ecert? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-500 text-white hover:bg-red-600"
                onClick={() => {
                  if (selectedEcertId) handleDelete(selectedEcertId);
                  setDeleteDialogOpen(false);
                  setSelectedEcertId(null);
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
