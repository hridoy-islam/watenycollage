import { useEffect, useState } from 'react';
import { DollarSign, Eye, Users2 } from 'lucide-react';
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
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { Badge } from '@/components/ui/badge';
import { useSelector } from 'react-redux';
import moment from '@/lib/moment-setup';
import DynamicPagination from '@/components/shared/DynamicPagination';

interface OptionType {
  value: string;
  label: string;
}

export default function Employee() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [designations, setDesignations] = useState<OptionType[]>([]);

  const [selectedDesignation, setSelectedDesignation] =
    useState<OptionType | null>(null);
  const user = useSelector((state: any) => state.auth?.user) || null;

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setInitialLoading(true);
      const params: any = {
        page: currentPage,
        limit: entriesPerPage,
        role: 'employee',
      };

      if (searchTerm) params.searchTerm = searchTerm;
      if (selectedDesignation) params.designationId = selectedDesignation.value;

      const response = await axiosInstance.get('/users', { params });

      setEmployees(response.data.data.result || []);
      setTotalPages(response.data.data.meta?.totalPage || 1);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to load employees.',
        variant: 'destructive'
      });
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const desigRes = await axiosInstance.get(`/designation?limit=all`);

        setDesignations(
          desigRes.data.data.result.map((d: any) => ({
            value: d._id,
            label: d.title
          }))
        );
      } catch (error) {
        console.error('Error fetching filter options:', error);
        toast({
          title: 'Error',
          description: 'Failed to load filter options.',
          variant: 'destructive'
        });
      }
    };
    fetchOptions();
  }, [user?._id, toast]);

  useEffect(() => {
    fetchData();
  }, [
    currentPage,
    entriesPerPage,
    searchTerm,
    selectedDesignation
  ]);

  const handleSearch = () => {
    setCurrentPage(1);
    setSearchTerm(searchInput);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setSelectedDesignation(null);
    setCurrentPage(1);
  };

  const handleStatusChange = async (employeeId: string, status: boolean) => {
    try {
      const updatedStatus = status ? 'active' : 'block';
      await axiosInstance.patch(`/users/${employeeId}`, { status: updatedStatus });
      toast({
        title: 'Success',
        description: 'Status updated successfully.',
        className: 'bg-watney text-white'
      });
      fetchData();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status.',
        variant: 'destructive'
      });
    }
  };

  const calculateAge = (dobString: string) => {
    if (!dobString) return '';
    return moment().diff(moment(dobString), 'years');
  };

 const handleDownloadReport = async () => {
    try {
      setIsDownloading(true);

      // 1. Fetch ALL matching employees for the report (ignoring pagination limits)
      const empParams: any = {
        limit: 'all',
        role: 'employee',
        status: 'active'
      };
      if (searchTerm) empParams.searchTerm = searchTerm;
      if (selectedDesignation) empParams.designationId = selectedDesignation.value;

      const empRes = await axiosInstance.get('/users', { params: empParams });

      const allEmployees = empRes.data.data.result || [];

      const headers = [
        "Full Name",
        "First Name",
        "Initial",
        "Last Name",
        "Date Of Birth",
        "Age",
        "Email",
        "Phone",
        "Address",
        "Designation",
        "Site",
        "Continuous Service"
      ];

      const csvRows = [headers.join(',')];

      const escapeCSV = (value: any) => {
        if (value === null || value === undefined) return '""';
        return `"${value.toString().replace(/"/g, '""')}"`;
      };

      const formatCSVDate = (dateString: string | null) => {
        if (!dateString) return '';
        const parsed = moment(dateString, [
          'YYYY-MM-DD', 
          'DD-MM-YYYY', 
          'MM/DD/YYYY', 
          'M/D/YYYY', 
          moment.ISO_8601
        ]);
        return parsed.isValid() ? `\t${parsed.format('DD-MM-YYYY')}` : '';
      };

      allEmployees.forEach((emp: any) => {
        const fullName = `${emp.title || ''} ${emp.firstName || ''} ${emp.initial || ''} ${emp.lastName || ''}`.replace(/\s+/g, ' ').trim();
        
        const dob = formatCSVDate(emp.dateOfBirth);
        const continousService = formatCSVDate(emp.createdAt);
        const age = calculateAge(emp.dateOfBirth);
        const site = emp.company?.name || '';
          
        const desigNames = Array.isArray(emp.designationId) 
          ? emp.designationId.map((d: any) => d.title).join(', ') 
          : '';

        const rowData = [
          escapeCSV(fullName),
          escapeCSV(emp.firstName || ''),
          escapeCSV(emp.initial || ''),
          escapeCSV(emp.lastName || ''),
          escapeCSV(dob),
          escapeCSV(age),
          escapeCSV(emp.email || ''),
          escapeCSV(emp.mobilePhone || ''),
          escapeCSV(emp.address || ''),
          escapeCSV(desigNames),
          escapeCSV(site),
          escapeCSV(continousService)
        ];

        csvRows.push(rowData.join(','));
      });

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('download', `Employees_Report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error generating CSV report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate the report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Search & Filter Section */}
      <div className="space-y-5 rounded-lg bg-white p-5 shadow-sm w-full">
        <div className="flex items-center">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Users2 className="h-6 w-6" />
            All Employees
          </h2>
        </div>
        
        {/* Responsive Grid for Filters */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 flex-1">
            <div className="w-full">
              <Input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, email"
                className="h-10 w-full text-sm"
              />
            </div>
          
           <div className="w-full">
  <Select
    options={designations}
    value={selectedDesignation}
    onChange={setSelectedDesignation}
    placeholder="Designation"
    isClearable
    className="text-sm w-full"
    menuPortalTarget={document.body}
    styles={{
      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      control: (base, state) => ({
        ...base,
        borderRadius: '16px', // Makes it fully rounded
        borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
        boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
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
        overflow: 'hidden'
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected 
          ? '#3b82f6' 
          : state.isFocused 
          ? '#eff6ff' 
          : 'transparent',
        color: state.isSelected ? 'white' : '#374151',
        cursor: 'pointer'
      })
    }}
  />
</div>
          </div>
          
          {/* Responsive Buttons Container */}
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <Button
              onClick={handleSearch}
              className="flex h-9 items-center gap-1  text-white flex-1 sm:flex-none justify-center"
              size="sm"
            >
              Search
            </Button>
            <Button
              variant="outline"
              onClick={handleResetFilters}
              size="sm"
              className="flex h-9 items-center gap-1 flex-1 sm:flex-none justify-center"
            >
              Reset Filters
            </Button>
            <Button
              onClick={handleDownloadReport}
              disabled={isDownloading}
              className="flex h-9 items-center gap-1  text-white  w-full sm:w-auto justify-center"
              size="sm"
            >
              {isDownloading ? 'Generating...' : 'Download Employees Report'}
            </Button>
          </div>
        </div>

        {/* Employee Table */}
        {initialLoading ? (
          <div className="flex justify-center py-8">
            <BlinkingDots size="large"  />
          </div>
        ) : employees.length === 0 ? (
          <div className="flex justify-center py-8 text-gray-500">
            No employees found matching your criteria.
          </div>
        ) : (
          <div className="w-full overflow-x-auto mt-4">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Name</TableHead>
                  <TableHead className="w-40 whitespace-nowrap">Phone</TableHead>
                  <TableHead className="whitespace-nowrap">Designation</TableHead>
                  <TableHead className="text-center whitespace-nowrap">Status</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee._id} className="cursor-pointer">
                    <TableCell onClick={() => navigate(`${employee._id}`)}>
                      <div className="flex flex-col min-w-[150px]">
                        <span className="text-black font-medium">
                          {employee.title} {employee.firstName} {employee.initial}{' '}
                          {employee.lastName}
                        </span>
                        <span className="text-xs text-gray-600">
                          {employee.email}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell onClick={() => navigate(`${employee._id}`)}>
                      {employee.phone || '–'}
                    </TableCell>

                    <TableCell onClick={() => navigate(`${employee._id}`)}>
                      {Array.isArray(employee.designationId) &&
                      employee.designationId.length > 0
                        ? employee.designationId
                            .map((des: any) => des.title)
                            .join(', ')
                        : '–'}
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={employee.status === 'active'}
                          onCheckedChange={(checked) =>
                            handleStatusChange(employee._id, checked)
                          }
                        />
                        <Badge
                          variant={
                            employee.status === 'active'
                              ? 'default'
                              : 'secondary'
                          }
                          className={`min-w-[70px] justify-center shadow-none ${
                            employee.status === 'active'
                              ? 'bg-watney text-white hover:bg-watney/90'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {employee.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {/* <Button
                          size="sm"
                          className="bg-watney text-white hover:bg-watney/90 whitespace-nowrap"
                          onClick={() =>
                            navigate(`${employee._id}/employee-rate`, {
                              state: employee
                            })
                          }
                        >
                          Pay Rate
                        </Button> */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="bg-watney text-white hover:bg-watney/90 whitespace-nowrap"
                          onClick={() => navigate(`${employee._id}`)}
                        >
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="mt-6 p-4">
                <DynamicPagination
                  pageSize={entriesPerPage}
                  setPageSize={setEntriesPerPage}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}