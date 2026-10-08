import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
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
import { Eye, Plus, Search } from 'lucide-react';
import  DynamicPagination  from '@/components/shared/DynamicPagination';
import { Input } from '@/components/ui/input';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Badge } from '@/components/ui/badge';

// React Select options
const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'Inpatient', label: 'Inpatient' },
  { value: 'Outpatient', label: 'Outpatient' }
];

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'block', label: 'Blocked' }
];

const areaOptions = [
  { value: 'all', label: 'All Areas' },
  { value: 'North Wing', label: 'North Wing' },
  { value: 'South Wing', label: 'South Wing' },
  { value: 'East Wing', label: 'East Wing' }
];

export default function ServiceUserList() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState(typeOptions[0]);
  const [statusFilter, setStatusFilter] = useState(statusOptions[0]);
  const [areaFilter, setAreaFilter] = useState(areaOptions[0]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // Fetch users from API
  const fetchUsers = async (page, entriesPerPage, searchTerm = '') => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/users', {
        params: {
          role: 'serviceUser',
          page,
          limit: entriesPerPage,
          ...(searchTerm ? { searchTerm } : {})
        }
      });
      setUsers(res.data.data.result || []);
      setTotalPages(res.data.data.meta.totalPage);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage]);

  // Handle status toggle
  const handleStatusChange = async (id: string, checked: boolean) => {
    try {
      await axiosInstance.patch(`/users/${id}`, {
        status: checked ? 'active' : 'block'
      });
      setUsers((prev) =>
        prev.map((user) =>
          user._id === id
            ? { ...user, status: checked ? 'active' : 'block' }
            : user
        )
      );
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  // Handle view action
  const handleView = (serviceid: string) => {
    navigate(`${serviceid}`);
  };

  // Filtering logic
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const fullName = [user.title, user.firstName, user.initial, user.lastName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const phone = user.mobilePhone?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();

      if (search && !fullName.includes(search) && !phone.includes(search)) {
        return false;
      }
      if (typeFilter.value !== 'all' && user.type !== typeFilter.value) {
        return false;
      }
      if (statusFilter.value !== 'all' && user.status !== statusFilter.value) {
        return false;
      }
      if (areaFilter.value !== 'all' && user.area !== areaFilter.value) {
        return false;
      }
      return true;
    });
  }, [users, searchTerm, typeFilter, statusFilter, areaFilter]);

  return (
    <div className="space-y-6 rounded-md bg-white p-6 shadow-md">
      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center justify-between">
        <div className='flex flex-row items-center gap-4'>

        
        <h1 className="text-2xl font-semibold">Service Users</h1>

        <div className="items-cente flex flex-row gap-4">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              className="min-w-[300px] rounded-xl border px-3 py-1 "
              placeholder="Search by Name or Phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button className="bg-watney text-white hover:bg-watney/90">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>

          {/* <div className="w-48">
            <Select
              options={typeOptions}
              value={typeFilter}
              onChange={(option) => option && setTypeFilter(option)}
              isSearchable={false}
            />
          </div>

          <div className="w-48">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(option) => option && setStatusFilter(option)}
              isSearchable={false}
            />
          </div>

          <div className="w-48">
            <Select
              options={areaOptions}
              value={areaFilter}
              onChange={(option) => option && setAreaFilter(option)}
              isSearchable={false}
            />
          </div> */}
        </div>

        </div>
        <Button
          className="flex gap-2 bg-watney text-white hover:bg-watney/90"
          onClick={() => navigate(`/dashboard/people-planner/create-serviceuser`)}
          disabled={loading}
        >
          <Plus className="h-4 w-4" />
          Add Service User
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="py-4 text-center">
                <BlinkingDots size="large" color="bg-watney" />
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-4 text-center text-gray-500">
                No matching records found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user._id}>
                <Link to={`${user._id}`} target="_blank"
  rel="noopener noreferrer">
                  <TableCell className="text-blue-500 hover:text-blue-600 hover:underline items-center">
                    <div className='flex items-center justify-center mt-2'>
 
                    {[user.title, user.firstName, user.initial, user.lastName]
                      .filter(Boolean)
                      .join(' ')}
                      </div>
                  </TableCell>
                </Link>
                <TableCell>{user?.email}</TableCell>
                <TableCell>
                  {[user.address, user.city].filter(Boolean).join(', ')}
                </TableCell>
                <TableCell>{user?.phone}</TableCell>
                <TableCell>
                  <div className="flex flex-row items-center gap-2">
                    <Switch
                      checked={user.status === 'active'}
                      onCheckedChange={(checked) =>
                        handleStatusChange(user._id, checked)
                      }
                    />
                    <Badge variant="default">
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </TableCell>
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

      {totalPages > 1 && (
        <>
          <DynamicPagination
            pageSize={entriesPerPage}
            setPageSize={setEntriesPerPage}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
