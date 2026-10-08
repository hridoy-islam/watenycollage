import { useState, useEffect } from 'react';
import { Plus, Pen, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import axiosInstance from '@/lib/axios';
import { Input } from '@/components/ui/input';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { downloadContractPDF } from './components/pdf-generator';
import { ContractTypeDialog } from './components/contract-type-dialog';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ContractTypeTemplatePage = () => {
  const [contracts, setContracts] = useState<any>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<any>(null);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingContract, setDeletingContract] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchData = async (page, entriesPerPage, searchTerm = '') => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get('/contract-type', {
        params: {
          page,
          limit: entriesPerPage,
          ...(searchTerm ? { searchTerm } : {})
        }
      });
      setContracts(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error) {
      console.error('Error fetching contract types:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage]);

  const handleSubmit = async (data) => {
    try {
      if (editingContract) {
        await axiosInstance.patch(`/contract-type/${editingContract?._id}`, data);
        toast({
          title: 'Contract Type updated successfully',
          className: 'bg-watney border-none text-white'
        });
        fetchData(currentPage, entriesPerPage);
        setEditingContract(null);
      } else {
        await axiosInstance.post('/contract-type', data);
        toast({
          title: 'Contract Type created successfully',
          className: 'bg-watney border-none text-white'
        });
        fetchData(currentPage, entriesPerPage);
      }
    } catch (error) {
      console.error('Error saving contract type:', error);
    }
  };

  const handleSearch = () => {
    fetchData(currentPage, entriesPerPage, searchTerm);
  };

  const handleDeleteClick = (contract: any) => {
    setDeletingContract(contract);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingContract) return;
    try {
      setIsDeleting(true);
      await axiosInstance.delete(`/contract-type/${deletingContract._id}`);
      toast({
        title: 'Contract Type deleted successfully',
        className: 'bg-watney border-none text-white'
      });
      fetchData(currentPage, entriesPerPage);
    } catch (error) {
      console.error('Error deleting contract type:', error);
      toast({
        title: 'Error deleting contract type',
        description: 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDeletingContract(null);
    }
  };

  const handleDownloadPDF = async (contract: any) => {
    try {
      setDownloadingPdf(contract._id);
      await downloadContractPDF(contract.title, contract.body);
     
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Error downloading PDF',
        description: 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setDownloadingPdf(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <h2 className="text-2xl font-semibold">Contract Type Templates</h2>
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Title"
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
        <div className='flex gap-4'>
         
          <Button
            className="bg-watney text-white hover:bg-watney/90"
            onClick={() => setDialogOpen(true)}
            size={'sm'}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Contract Type
          </Button>
        </div>
      </div>

      <div className="rounded-md bg-white p-4 shadow-2xl">
        {initialLoading ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        ) : contracts.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No contract types found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract._id}>
                  <TableCell>{contract.title}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDownloadPDF(contract)}
                        disabled={downloadingPdf === contract._id}
                        className="border-green-600 bg-green-600 text-white hover:bg-green-700"
                        title="Download PDF"
                      >
                        {downloadingPdf === contract._id ? (
                          <BlinkingDots size="small" color="bg-white" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setEditingContract(contract);
                          setDialogOpen(true);
                        }}
                        className="bg-watney text-white hover:bg-watney/90"
                        title="Edit Contract Type"
                      >
                        <Pen className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteClick(contract)}
                        className="border-red-600 bg-red-600 text-white hover:bg-red-700"
                        title="Delete Contract Type"
                      >
                        <Trash2 className="h-4 w-4" />
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

      <ContractTypeDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingContract(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingContract}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contract type
              "{deletingContract?.title}" and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <BlinkingDots size="small" color="bg-white" />
                  Deleting...
                </div>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContractTypeTemplatePage;
