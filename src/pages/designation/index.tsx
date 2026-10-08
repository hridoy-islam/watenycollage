import { useEffect, useState } from 'react';
import { Plus, Pen, Trash, MoveLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { useNavigate } from 'react-router-dom';
import { DesignationDialog } from './components/DesignationDialog';

interface TDesignation {
  _id: string;
  title: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function DesignationPage() {
  const [designations, setDesignations] = useState<TDesignation[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<TDesignation | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchData = async (page = 1, limit) => {
    try {
      setInitialLoading(true);
      const response = await axiosInstance.get('/designation', {
        params: { page, limit }
      });
      const data = response.data.data;
      setDesignations(data.result || []);
      setTotalPages(data.meta?.totalPage || 1);
    } catch (error) {
      console.error('Error fetching designations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load designations',
        variant: 'destructive'
      });
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage]);

  const handleCreate = async (data: { title: string; description: string }) => {
    try {
      await axiosInstance.post('/designation', data);
      toast({ title: 'Success', description: 'Designation created successfully' });
      fetchData(currentPage, entriesPerPage);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create designation', variant: 'destructive' });
    }
  };

  const handleEdit = async (data: { title: string; description: string }) => {
    if (!editingDesignation) return;
    try {
      await axiosInstance.patch(`/designation/${editingDesignation._id}`, data);
      toast({ title: 'Success', description: 'Designation updated successfully' });
      setEditingDesignation(null);
      fetchData(currentPage, entriesPerPage);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update designation', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await axiosInstance.delete(`/designation/${deletingId}`);
      toast({ title: 'Success', description: 'Designation deleted successfully' });
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchData(currentPage, entriesPerPage);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete designation', variant: 'destructive' });
    }
  };

  const openCreateDialog = () => {
    setEditingDesignation(null);
    setDialogOpen(true);
  };

  const openEditDialog = (designation: TDesignation) => {
    setEditingDesignation(designation);
    setDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6 ">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Designations</h1>
        <div className="flex items-center gap-2">
          <Button
            className="bg-watney text-white hover:bg-watney/90"
            onClick={() => navigate('/dashboard/recruitment')}
          >
            <MoveLeft /> Back
          </Button>
          <Button
            className="bg-watney text-white hover:bg-watney/90"
            onClick={openCreateDialog}
          >
            <Plus className="mr-1 h-4 w-4" /> Create Designation
          </Button>
        </div>
      </div>

      <div className="rounded-md bg-white p-4 shadow-2xl">
        {initialLoading ? (
          <div className="flex justify-center py-6">
            <BlinkingDots />
          </div>
        ) : designations.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No designations found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {designations.map((designation) => (
                <TableRow key={designation._id}>
                  <TableCell className="font-medium">{designation.title}</TableCell>
                  <TableCell className="">
                    {designation.description || '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="icon"
                        onClick={() => openEditDialog(designation)}
                      >
                        <Pen className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                variant={'destructive'}
                        onClick={() => openDeleteDialog(designation._id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {
          totalPages>1 &&

        <DataTablePagination
        pageSize={entriesPerPage}
        setPageSize={setEntriesPerPage}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        />
      }
      </div>

      <DesignationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={editingDesignation ? handleEdit : handleCreate}
        initialData={editingDesignation}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this designation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
