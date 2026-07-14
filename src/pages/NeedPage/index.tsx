import { useEffect, useState } from 'react';
import { Plus, Pen, Trash2, MoveLeft, CornerDownRight } from 'lucide-react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Input } from '@/components/ui/input';
import { NeedDialog } from './components/NeedDialog';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NeedPage() {
  const [needs, setNeeds] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNeed, setEditingNeed] = useState<any>();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [needToDelete, setNeedToDelete] = useState<any>();
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setInitialLoading(true);
      const params: any = {
        page: currentPage,
      };
      if (searchTerm) params.searchTerm = searchTerm;

      const response = await axiosInstance.get('/needs?limit=all', { params });
      setNeeds(response.data.data.result || []);
    } catch (error: any) {
      console.error('Error fetching needs:', error);
      toast({
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to load needs.',
        variant: 'destructive'
      });
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm]);

  const handleSearch = () => {
    setCurrentPage(1);
    setSearchTerm(searchInput);
  };

  // Helper: get the id of a need's parent, whether parentNeedId is populated or a raw id string
  const getParentId = (need: any): string | null => {
    if (!need?.parentNeedId) return null;
    return typeof need.parentNeedId === 'object'
      ? need.parentNeedId._id
      : need.parentNeedId;
  };

  const handleSubmit = async (data: {
    NeedTitle: string;
    parentNeedId?: string;
  }) => {
    try {
      let response;
      if (editingNeed) {
        response = await axiosInstance.patch(`/needs/${editingNeed._id}`, data);
      } else {
        response = await axiosInstance.post('/needs', data);
      }

      if (response.data?.success === true) {
        toast({
          title: response.data.message || 'Record saved successfully',
          className: 'bg-watney border-none text-white'
        });

        const saved = response.data.data;

        setNeeds((prev) => {
          if (editingNeed) {
            // Update just the edited record in place
            return prev.map((n) => (n._id === saved._id ? { ...n, ...saved } : n));
          }
          // Append the newly created record
          return [...prev, saved];
        });
      } else {
        toast({
          title: response.data?.message || 'Operation failed',
          className: 'bg-red-500 border-none text-white'
        });
      }
      setEditingNeed(undefined);
    } catch (error: any) {
      toast({
        title: error.response?.data?.message || 'An error occurred',
        className: 'bg-red-500 border-none text-white'
      });
    }
  };

  const handleEdit = (need: any) => {
    setEditingNeed(need);
    setDialogOpen(true);
  };

  const handleDeleteClick = (need: any) => {
    setNeedToDelete(need);
    setDeleteDialogOpen(true);
  };

  const childrenOf = (need: any) =>
    needs.filter((n) => getParentId(n) === need._id);

  const confirmDelete = async () => {
    if (!needToDelete) return;
    const childNeeds = childrenOf(needToDelete);

    try {
      setIsDeleting(true);

      // Delete the need itself
      await axiosInstance.delete(`/needs/${needToDelete._id}`);

      // If it's a parent, cascade-delete its children too
      if (childNeeds.length > 0) {
        await Promise.all(
          childNeeds.map((child) => axiosInstance.delete(`/needs/${child._id}`))
        );
      }

      const deletedIds = new Set([
        needToDelete._id,
        ...childNeeds.map((c) => c._id)
      ]);
      setNeeds((prev) => prev.filter((n) => !deletedIds.has(n._id)));

      toast({
        title:
          childNeeds.length > 0
            ? 'Need and its sub-needs deleted successfully'
            : 'Need deleted successfully',
        className: 'bg-watney border-none text-white'
      });
    } catch (error: any) {
      toast({
        title: error.response?.data?.message || 'Failed to delete need',
        className: 'bg-red-500 border-none text-white'
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setNeedToDelete(undefined);
    }
  };

  // Build groups: top-level needs (no parent) each carry their own children
  const groups = needs
    .filter((n) => !getParentId(n))
    .map((group) => ({
      group,
      children: needs.filter((n) => getParentId(n) === group._id)
    }));

  const needToDeleteChildCount = needToDelete ? childrenOf(needToDelete).length : 0;

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex flex-row items-center gap-4">
          <CardTitle className="text-2xl font-semibold">All Needs</CardTitle>
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by need title..."
              className="max-w-[400px]"
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
            onClick={() => navigate(-1)}
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            className="border-none bg-watney text-white hover:bg-watney/90"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Need
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {initialLoading ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        ) : needs.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No records found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Need Title</TableHead>
                <TableHead className="w-40 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map(({ group, children }) => (
                <>
                  <TableRow key={group._id} className="bg-gray-100">
                    <TableCell className="font-semibold">
                      {group.NeedTitle}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          className="border-none bg-watney text-white hover:bg-watney/90"
                          size="icon"
                          onClick={() => handleEdit(group)}
                        >
                          <Pen className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="border-none bg-red-500 text-white hover:bg-red-600"
                          size="icon"
                          onClick={() => handleDeleteClick(group)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {children.map((child) => (
                    <TableRow key={child._id}>
                      <TableCell className="text-gray-700">
                        <div className="flex items-center gap-1 pl-6">
                          <CornerDownRight className="h-4 w-4 text-gray-400" />
                          <span>{child.NeedTitle}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            className="border-none bg-watney text-white hover:bg-watney/90"
                            size="icon"
                            onClick={() => handleEdit(child)}
                          >
                            <Pen className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="border-none bg-red-500 text-white hover:bg-red-600"
                            size="icon"
                            onClick={() => handleDeleteClick(child)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <NeedDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingNeed(undefined);
        }}
        onSubmit={handleSubmit}
        initialData={editingNeed}
        // Only top-level needs are valid parents, and a need can never be its own parent
        parentOptions={needs.filter(
          (n) => !getParentId(n) && n._id !== editingNeed?._id
        )}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {needToDeleteChildCount > 0
                ? 'Delete this need and all its sub-needs?'
                : 'Delete this need?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {needToDeleteChildCount > 0 ? (
                <>
                  <span className="font-medium text-red-600">
                    "{needToDelete?.NeedTitle}"
                  </span>{' '}
                  has {needToDeleteChildCount}{' '}
                  {needToDeleteChildCount === 1 ? 'sub-need' : 'sub-needs'} under
                  it. Deleting it will permanently delete all of them as well.
                  This action cannot be undone.
                </>
              ) : (
                <>
                  This will permanently delete{' '}
                  <span className="font-medium">"{needToDelete?.NeedTitle}"</span>.
                  This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}