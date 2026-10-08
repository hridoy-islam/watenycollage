import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Eye, MoveLeft, Plus, Search } from 'lucide-react';
import { DynamicPagination } from '@/components/shared/DynamicPagination';
import { Input } from '@/components/ui/input';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { toast } from '@/components/ui/use-toast';

export default function ServiceUserFunder() {
  const [fundUsers, setFundUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [totalPages, setTotalPages] = useState(1);
  const {id} = useParams()
  const navigate = useNavigate();

  const fetchFunders = async (
    page: number,
    entriesPerPage: number,
    searchTerm = ''
  ) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/service-funder`, {
        params: {
          page,
          limit: entriesPerPage,
          companyId:id,
          ...(searchTerm ? { searchTerm } : {})
        }
      });

      setFundUsers(res.data.data.result || []);
      setTotalPages(res.data.data.meta?.totalPage || 1);
    } catch (error) {
      console.error('Failed to fetch funders:', error);
      toast({ title: 'Failed to fetch funders', variant: 'destructive' });
      setFundUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunders(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage]);

  // Handle view
  const handleView = (funderId: string) => {
    navigate(`${funderId}`);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md bg-white p-6 shadow-md">
        <BlinkingDots size="large" color="bg-theme" />
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-md bg-white p-6 shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Heading + Search */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              className="min-w-[300px] rounded border px-3 py-1"
              placeholder="Search by Name, Email or Phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              className="bg-theme text-white hover:bg-theme/90"
              onClick={() => fetchFunders(1, entriesPerPage, searchTerm)}
            >
              <Search className="mr-1 h-4 w-4" /> Search
            </Button>
          </div>
        </div>

        {/* Back + Add */}
        <div className="flex flex-row gap-4">
          <Button
            variant="outline"
            className="bg-theme text-white hover:bg-theme/90"
            onClick={() => navigate(-1)} // Better than window.history.back()
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            className="flex gap-2 bg-theme text-white hover:bg-theme/90"
            onClick={() => navigate(`/company/${id}/create-servicefunder`)}
            disabled={loading}
          >
            <Plus className="h-4 w-4" />
            Add Funder
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="">
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-4 text-center">
                  <BlinkingDots size="large" color="bg-theme" />
                </TableCell>
              </TableRow>
            ) : fundUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-4 text-center text-gray-500"
                >
                  No matching funders found.
                </TableCell>
              </TableRow>
            ) : (
              fundUsers.map((user) => (
                <TableRow key={user._id || user.id}>
                  <TableCell>
                    {user.organizationName
                      ? user.organizationName
                      : [
                          user.title,
                          user.firstName,
                          user?.initial,
                          user.lastName
                        ]
                          .filter(Boolean)
                          .join(' ')}
                  </TableCell>
                  <TableCell>
                    {user.type
                      ? user.type.charAt(0).toUpperCase() + user.type.slice(1)
                      : '-'}
                  </TableCell>
                  <TableCell>{user.email || '-'}</TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleView(user._id || user.id)}
                      className="bg-theme text-white hover:bg-theme/90"
                      aria-label="View funder details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {fundUsers.length > 40 && (
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
