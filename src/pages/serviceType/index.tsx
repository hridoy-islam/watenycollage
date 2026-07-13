import { useEffect, useState } from 'react';
import { Tag, Pen, Plus, Briefcase } from 'lucide-react'; // Swapped Tag for Briefcase if preferred, otherwise keep Tag
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
import { DynamicPagination } from '@/components/shared/DynamicPagination';
import { useParams } from 'react-router-dom';
import { ServiceTypeDialog } from './Components/ServiceTypeDialog';

export default function ServiceTypePage() {
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingServiceType, setEditingServiceType] = useState<any>();
  const [initialLoading, setInitialLoading] = useState(true);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');
  const { id: companyId } = useParams();

  const fetchData = async (
    page = currentPage,
    limit = entriesPerPage,
    search = searchTerm
  ) => {
    try {
      setInitialLoading(true);
      const response = await axiosInstance.get('/service-type', {
        params: {
          page,
          limit,
          companyId,
          ...(search ? { searchTerm: search } : {})
        }
      });

      setServiceTypes(response.data.data.result || []);
      setTotalPages(response.data.data.meta?.totalPage || 1);
    } catch (error: any) {
      console.error('Error fetching service types:', error);
      toast({
        title: 'Failed to load service types',
        description: error.response?.data?.message || 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (data: { title: string }) => {
    try {
      const payload = {
        ...data,
        companyId
      };

      const response = editingServiceType
        ? await axiosInstance.patch(
            `/service-type/${editingServiceType._id}`,
            payload
          )
        : await axiosInstance.post('/service-type', payload);

      if (response.data?.success) {
        toast({
          title: editingServiceType ? 'Service type updated' : 'Service type created',
          description: response.data.message
        });
        fetchData();
        setEditingServiceType(undefined);
        setDialogOpen(false);
      } else {
        throw new Error(response.data?.message || 'Operation failed');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to save service type',
        variant: 'destructive'
      });
    }
  };

  const handleStatusChange = async (id: string, checked: boolean) => {
    try {
      const status = checked ? 'active' : 'inactive';
      await axiosInstance.patch(`/service-type/${id}`, { status });

      toast({
        title: 'Status updated',
        className: 'bg-theme border-none text-white'
      });

      // Optimistically update UI
      setServiceTypes((prev) =>
        prev.map((st) => (st._id === id ? { ...st, status } : st))
      );
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: 'Failed to update status',
        description: error.response?.data?.message || 'Please try again',
        className: 'bg-red-500 border-none text-white'
      });
      // Revert optimistic update on error
      fetchData();
    }
  };

  const handleEdit = (serviceType: any) => {
    setEditingServiceType(serviceType);
    setDialogOpen(true);
  };

  // Initial load and param changes
  useEffect(() => {
    if (companyId) {
      fetchData(1, entriesPerPage, searchTerm);
      setCurrentPage(1);
    }
  }, [companyId, entriesPerPage, searchTerm]);

  // Page change handler
  useEffect(() => {
    if (companyId) {
      fetchData(currentPage, entriesPerPage, searchTerm);
    }
  }, [currentPage]);

  return (
    <div className="space-y-3 rounded-md bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Tag className="h-6 w-6" />
          Service Types
        </h2>
        <Button
          className="bg-theme text-white hover:bg-theme/90"
          size="sm"
          onClick={() => {
            setEditingServiceType(undefined);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Service Type
        </Button>
      </div>

      <div className="rounded-md">
        {initialLoading ? (
          <div className="flex justify-center py-12">
            <BlinkingDots size="large" color="bg-theme" />
          </div>
        ) : serviceTypes.length === 0 ? (
          <div className="flex justify-center py-12 text-gray-500">
            {searchTerm
              ? 'No service types match your search'
              : 'No service types found. Create your first service type!'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-gray-50">
                <TableHead className="font-medium">Title</TableHead>
                <TableHead className="w-32 text-center font-medium">
                  Status
                </TableHead>
                <TableHead className="w-24 text-center font-medium">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceTypes.map((serviceType) => (
                <TableRow key={serviceType._id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {serviceType.title}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Switch
                        checked={serviceType.status === 'active'}
                        onCheckedChange={(checked) =>
                          handleStatusChange(serviceType._id, checked)
                        }
                      />
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          serviceType.status === 'active'
                            ? 'bg-theme text-white'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {serviceType.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button size="icon" onClick={() => handleEdit(serviceType)}>
                      <Pen className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {serviceTypes.length > 50 && !initialLoading && (
        <DynamicPagination
          pageSize={entriesPerPage}
          setPageSize={setEntriesPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <ServiceTypeDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingServiceType(undefined);
        }}
        onSubmit={handleSubmit}
        initialData={editingServiceType}
      />
    </div>
  );
}