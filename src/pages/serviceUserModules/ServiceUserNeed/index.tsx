import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { Plus, Pen, Trash2, MoveLeft, List } from 'lucide-react';
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
  DialogDescription
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Select from 'react-select';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import DynamicPagination from '@/components/shared/DynamicPagination';
import moment from 'moment';

interface NeedOption {
  value: string;
  label: string;
  parentId?: string;
}

interface GroupedOption {
  label: string;
  options: NeedOption[];
}

export default function ServiceUserNeedPage() {
  const { sid } = useParams<{ sid: string }>();
  const [userName, setUserName] = useState('');
  const [needs, setNeeds] = useState<any[]>([]);
  const [allNeeds, setAllNeeds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedNeed, setSelectedNeed] = useState<NeedOption | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!sid) return;
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(`/users/${sid}`);
        const user = res.data?.data;
        if (user) {
          setUserName(
            `${user.title || ''} ${user.firstName || ''} ${user.lastName || ''}`.trim()
          );
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, [sid]);

  useEffect(() => {
    if (!sid) return;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [needsRes, catalogRes] = await Promise.all([
          axiosInstance.get('/serviceuser-needs', {
            params: { serviceUserId: sid, page: currentPage, limit: entriesPerPage }
          }),
          axiosInstance.get('/needs', { params: { limit: 'all' } })
        ]);

        const rawNeeds = catalogRes.data?.data?.result || [];
        setNeeds(needsRes.data?.data?.result || []);
        setTotalPages(needsRes.data?.data?.meta?.totalPage || 1);
        setAllNeeds(rawNeeds);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [sid, currentPage, entriesPerPage]);

  const groupedOptions: GroupedOption[] = allNeeds
    .filter((n) => !n.parentNeedId)
    .map((parent) => ({
      label: parent.NeedTitle,
      options: allNeeds
        .filter(
          (child) =>
            (child.parentNeedId?._id || child.parentNeedId) === parent._id
        )
        .map((child) => ({
          value: child._id,
          label: child.NeedTitle,
          parentId: parent._id
        }))
    }))
    .filter((group) => group.options.length > 0);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setSelectedNeed(null);
    setNote('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    const targetId = item.needId?._id || item.needId;
    let match: NeedOption | null = null;
    for (const group of groupedOptions) {
      const found = group.options.find((c) => c.value === targetId);
      if (found) {
        match = found;
        break;
      }
    }
    setSelectedNeed(match);
    setNote(item.note || '');
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sid || !selectedNeed) return;
    setIsSubmitting(true);

    try {
      const payload = {
        serviceUserId: sid,
        needId: selectedNeed.value,
        note
      };

      if (editingItem) {
        const res = await axiosInstance.patch(
          `/serviceuser-needs/${editingItem._id}`,
          payload
        );
        setNeeds((prev) =>
          prev.map((n) =>
            n._id === editingItem._id ? res.data?.data : n
          )
        );
      } else {
        const res = await axiosInstance.post('/serviceuser-needs', payload);
        setNeeds((prev) => [res.data?.data, ...prev]);
      }

      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/serviceuser-needs/${deletingId}`);
      setNeeds((prev) => prev.filter((n) => n._id !== deletingId));
      setDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getNeedTitle = (item: any) => {
    const id = item.needId?._id || item.needId;
    const match = allNeeds.find((n) => n._id === id);
    return match?.NeedTitle || id || '—';
  };

  return (
    <div className="w-full">
      <div className="rounded-lg bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-row items-center justify-between">
          <div>
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              {userName ? `${userName}'s Needs` : 'Service User Needs'}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => window.history.back()}>
              <MoveLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" /> Add Need
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        ) : needs.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No needs assigned yet.
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[20%]'>Need Title</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className='w-[10%]'>Created</TableHead>
                  <TableHead className="w-32 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {needs.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">
                      {getNeedTitle(item)}
                    </TableCell>
                    <TableCell>{item.note || '—'}</TableCell>
                    <TableCell>
                      {item.createdAt
                        ? moment(item.createdAt).format('DD/MM/YYYY')
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-watney text-white hover:bg-watney/90"
                          onClick={() => handleOpenEdit(item)}
                        >
                          <Pen className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-red-500 text-white hover:bg-red-600"
                          onClick={() => handleDeleteClick(item._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="mt-5">
                <DynamicPagination
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Need' : 'Add Need'}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? 'Update the need assignment.'
                : 'Assign a need to this service user.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>
                Need <span className="text-red-500">*</span>
              </Label>
              <Select
                options={groupedOptions}
                value={selectedNeed}
                onChange={(value) => setSelectedNeed(value)}
                placeholder="Select a child need..."
                isClearable
                formatGroupLabel={(group) => (
                  <div className="flex items-center gap-2 py-1">
                    <span className="text-sm font-bold text-gray-900">
                      {group.label}
                    </span>
                  </div>
                )}
                formatOptionLabel={(option) => (
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4 text-watney shrink-0" />
                    <span className="text-sm text-gray-700">
                      {option.label}
                    </span>
                  </div>
                )}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderRadius: '16px',
                    borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
                    boxShadow: state.isFocused
                      ? '0 0 0 1px #3b82f6'
                      : 'none',
                    '&:hover': {
                      borderColor: state.isFocused ? '#3b82f6' : '#9ca3af'
                    },
                    minHeight: '40px',
                    paddingLeft: '4px'
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    padding: '2px 8px'
                  }),
                  indicatorsContainer: (base) => ({
                    ...base,
                    paddingRight: '8px'
                  }),
                  menu: (base) => ({
                    ...base,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    zIndex: 9999
                  }),
                  groupHeading: (base) => ({
                    ...base,
                    fontWeight: 700,
                    color: '#111827',
                    fontSize: '14px',
                    padding: '8px 12px 4px',
                    cursor: 'default',
                    pointerEvents: 'none'
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                      ? '#eff6ff'
                      : state.isFocused
                        ? '#eff6ff'
                        : 'transparent',
                    color: state.isSelected ? 'white' : '#374151',
                    cursor: 'pointer'
                  })
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="note..."
                rows={8}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedNeed || isSubmitting}
                className="border-none bg-watney text-white hover:bg-watney/90"
              >
                {isSubmitting ? 'Saving...' : 'Submit'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this need assignment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
