import React, { useState, useMemo, useEffect } from 'react';
import Select from 'react-select';
import { Button } from '@/components/ui/button';
// import { Switch } from '@/components/ui/switch'; // Unused in this snippet
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, MoveLeft, Plus, Search, Loader2 } from 'lucide-react';
import { DynamicPagination } from '@/components/shared/DynamicPagination';
import { Input } from '@/components/ui/input';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { toast } from 'sonner'; // Assuming you use sonner or similar for toasts

export default function ServiceUserFunder() {
  const [fundUsers, setFundUsers] = useState<any[]>([]);
  const [serviceUser, setServiceUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // -- Add Funder Dialog States --
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availableFunders, setAvailableFunders] = useState<any[]>([]);
  const [selectedFunderToAdd, setSelectedFunderToAdd] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const { id } = useParams<{ id: string }>();

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);

  const navigate = useNavigate();

  // ✅ 1. Reusable fetch function
  const fetchUserData = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // Fetch Service User
      const userRes = await axiosInstance.get(`/users/${id}`);
      setServiceUser(userRes.data.data);

      // Fetch Funders for this Service User
      const fundersRes = await axiosInstance.get(`/service-funder`, {
        params: {
          serviceUser: id,
          limit: 'all',
          fields: 'title firstName lastName middleInitial email phone type organization'
        }
      });
      setFundUsers(fundersRes.data.data.result || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setFundUsers([]);
      setServiceUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [id]);

  // ✅ 2. Fetch Available Funders (for the Dropdown)
  const handleOpenAddDialog = async () => {
    setIsDialogOpen(true);
    setAvailableFunders([]); // Reset options
    setSelectedFunderToAdd(null);

    try {
      // Fetch ALL funders (without serviceUser filter)
      const res = await axiosInstance.get(`/service-funder`, {
        params: {
          limit: 'all',
          fields: 'title firstName lastName _id organization' 
        }
      });
      
      const allFunders = res.data.data.result || [];

      // Create a Set of IDs that are ALREADY assigned to this user
      const existingFunderIds = new Set(fundUsers.map(u => u._id));

      // Filter: Only keep funders NOT in the existing list
      const filteredOptions = allFunders
        .filter((funder: any) => !existingFunderIds.has(funder._id))
        .map((funder: any) => ({
          value: funder._id,
          label: `${[funder.title, funder.firstName, funder.lastName].filter(Boolean).join(' ')} ${funder.organization ? `(${funder.organization})` : ''}`
        }));

      setAvailableFunders(filteredOptions);

    } catch (error) {
      console.error("Failed to fetch available funders", error);
    }
  };


  const handleAddFunder = async () => {
    if (!selectedFunderToAdd || !id) return;

    try {
      setIsAdding(true);

      await axiosInstance.patch(`/service-funder/${selectedFunderToAdd.value}`, {
        serviceUser: id
      });

      // Close dialog and refresh list
      setIsDialogOpen(false);
      await fetchUserData(); 
      // Optional: toast.success("Funder added successfully");

    } catch (error) {
      console.error("Failed to add funder", error);
      // Optional: toast.error("Failed to add funder");
    } finally {
      setIsAdding(false);
    }
  };

  // Handle view action
  const handleView = (funderId: string) => {
    navigate(`${funderId}`);
  };

  // Filtering logic
  const filteredFundUsers = useMemo(() => {
    if (!fundUsers.length) return [];

    return fundUsers.filter((user) => {
      const fullName = [user.title, user.firstName, user.lastName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const search = searchTerm.toLowerCase();

      if (
        search &&
        !fullName.includes(search) &&
        !user.organization?.toLowerCase().includes(search) &&
        !user.phone?.includes(search) &&
        !user.email?.toLowerCase().includes(search)
      ) {
        return false;
      }

      return true;
    });
  }, [fundUsers, searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredFundUsers.length / entriesPerPage);
  const paginatedFundUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredFundUsers.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredFundUsers, currentPage, entriesPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const getUserName = () => {
    if (!serviceUser) return 'Loading...';
    return [serviceUser.title, serviceUser.firstName, serviceUser.lastName]
      .filter(Boolean)
      .join(' ');
  };

  if (loading && !serviceUser) {
    return (
      <div className="flex justify-center py-6">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-md bg-white p-6 shadow-md">
      <div className="flex flex-row justify-between">
        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <h1 className="text-2xl font-semibold">{getUserName()} Funders</h1>
          {/* <div className="flex items-center gap-2">
            <Input
              type="text"
              className="min-w-[300px] rounded border px-3 py-1"
              placeholder="Search by Name, Org, Email or Phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button className="bg-watney text-white hover:bg-watney/90">
              <Search className="mr-1 h-4 w-4" /> Search
            </Button>
          </div> */}
        </div>
        <div className="flex flex-row items-center gap-4">
          <Button
            className="bg-watney text-white hover:bg-watney/90"
            onClick={() => navigate(-1)}
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          {/* ✅ Opened Dialog Button */}
          <Button 
            className="flex gap-2 bg-watney text-white hover:bg-watney/90"
            onClick={handleOpenAddDialog}
          >
            Add Funder
          </Button>

          <Button
            className="flex gap-2 bg-watney text-white hover:bg-watney/90"
            onClick={() => navigate('create')}
          >
            <Plus className="h-4 w-4" /> Create Funder
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedFundUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-4 text-center text-gray-500">
                No matching funders found.
              </TableCell>
            </TableRow>
          ) : (
            paginatedFundUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  {[user.title, user.firstName, user.lastName]
                    .filter(Boolean)
                    .join(' ')}
                </TableCell>
                <TableCell>
                  {user.type
                    ? user.type
                        .replace(/([a-z])([A-Z])/g, '$1 $2')
                        .replace(/[_-]+/g, ' ')
                        .replace(/\b\w/g, (char: string) => char.toUpperCase())
                    : '-'}
                </TableCell>
                <TableCell>{user.email || '-'}</TableCell>
                <TableCell>{user.phone || '-'}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleView(user._id)}
                    className="bg-watney text-white hover:bg-watney/90"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {paginatedFundUsers.length > 40 && (
        <DynamicPagination
          pageSize={entriesPerPage}
          setPageSize={setEntriesPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* ✅ Add Funder Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Existing Funder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select Funder
            </label>
            <Select
              className="basic-single"
              classNamePrefix="select"
              isClearable
              isSearchable
              name="funder"
              options={availableFunders}
              onChange={(option) => setSelectedFunderToAdd(option)}
              value={selectedFunderToAdd}
              placeholder="Search for a funder..."
              noOptionsMessage={() => "No available funders found"}
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: '48px',
                  borderRadius: '0.5rem',
                  borderColor: '#e2e8f0',
                  '&:hover': {
                    borderColor: '#cbd5e1'
                  }
                }),
                valueContainer: (base) => ({
                  ...base,
                  padding: '2px 12px'
                }),
                input: (base) => ({
                  ...base,
                  margin: '0px'
                })
              }}
            />
          
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isAdding}>
              Cancel
            </Button>
            <Button 
              className="bg-watney text-white hover:bg-watney/90"
              onClick={handleAddFunder}
              disabled={!selectedFunderToAdd || isAdding}
            >
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                </>
              ) : (
                'Done'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}