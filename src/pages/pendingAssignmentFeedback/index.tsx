import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  FileText,
  Search,
  Filter,
  Eye,
  User,
  BookOpen,
  MessageSquare,
  ArrowUpDown,
  ArrowLeft
} from 'lucide-react';
import { BlinkingDots } from '@/components/shared/blinking-dots';

interface Assignment {
  _id: string;
  assignmentName: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  applicationId: {
    _id: string;
    courseId: {
      _id: string;
      name: string;
    };
  };
  unitId: {
    _id: string;
    title: string;
  };
  submissions: Array<{
    _id: string;
    submitBy: {
      _id: string;
      name: string;
      email: string;
    };
    files: string[];
    comment?: string;
    seen: boolean;
    status: 'submitted' | 'resubmitted';
    createdAt: string;
  }>;
  feedbacks: Array<{
    _id: string;
    submitBy: {
      _id: string;
      name: string;
      email: string;
    };
    comment?: string;
    files: string[];
    seen: boolean;
    createdAt: string;
  }>;
  status: string;
  deadline?: string;
  requireResubmit: boolean;
  createdAt: string;
  updatedAt: string;
}

export function AssignmentFeedbackList() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');

  const navigate = useNavigate();

  const fetchAssignments = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params: any = {
        limit: 'all',
        sort: `-createdAt`,
        fields: 'applicationId,studentId,unitId,status,assignmentName'
      };

      const response = await axiosInstance.get('/assignment?status=submitted', {
        params
      });
      const assignmentsData = response.data.data?.result || [];

      // Filter assignments that have unseen submissions
      const assignmentsWithUnseen = assignmentsData;

      setAssignments(assignmentsWithUnseen);
      setFilteredAssignments(assignmentsWithUnseen);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter assignments based on search term and filters
  useEffect(() => {
    if (!assignments.length) return;

    let filtered = assignments;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(assignment => 
        assignment.assignmentName?.toLowerCase().includes(searchLower) ||
        assignment.applicationId?.courseId?.name?.toLowerCase().includes(searchLower) ||
        assignment.unitId?.title?.toLowerCase().includes(searchLower) ||
        getStudentName(assignment).toLowerCase().includes(searchLower) ||
        assignment.studentId?.email?.toLowerCase().includes(searchLower)
      );
    }

    // Apply course filter
    if (courseFilter !== 'all') {
      filtered = filtered.filter(assignment => 
        assignment.applicationId?.courseId?.name === courseFilter
      );
    }

    // Apply unit filter
    if (unitFilter !== 'all') {
      filtered = filtered.filter(assignment => 
        assignment.unitId?.title === unitFilter
      );
    }

    setFilteredAssignments(filtered);
  }, [assignments, searchTerm, courseFilter, unitFilter]);

  useEffect(() => {
    fetchAssignments();
  }, []);

  // const handleViewAssignment = (assignment: Assignment) => {
  //   // Navigate to assignment detail page
  //   navigate(
  //     `/dashboard/student-applications/${assignment.applicationId?._id}/assignment/${assignment.studentId._id}/unit-assignments/${assignment.unitId?._id}`,
  //     { state: { assignmentId: assignment._id } }
  //   );
  // };


const handleViewAssignment = (assignment: Assignment) => {
  const url = `/dashboard/student-applications/${assignment.applicationId?._id}/assignment/${assignment.studentId._id}/unit-assignments/${assignment.unitId?._id}?assignmentId=${assignment._id}`;
  window.open(url, "_blank");
};

  const getStudentName = (assignment: Assignment) => {
    if (assignment.studentId.name) {
      return assignment.studentId.name;
    }
    if (assignment.studentId.firstName && assignment.studentId.lastName) {
      return `${assignment.studentId.firstName} ${assignment.studentId.lastName}`;
    }
    return 'Unknown Student';
  };

  // Get unique courses and units for filters
  const uniqueCourses = Array.from(new Set(
    assignments
      .map(assignment => assignment.applicationId?.courseId?.name)
      .filter(Boolean)
  ));

  const uniqueUnits = Array.from(new Set(
    assignments
      .map(assignment => assignment.unitId?.title)
      .filter(Boolean)
  ));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Assignment Feedbacks</CardTitle>
              
            </div>
            <div>
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate(-1)}
                className="bg-watney text-white hover:bg-watney/90"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Section */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="w-full sm:w-96">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                  placeholder="Search assignments, courses, or units..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-full sm:w-48">
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {uniqueCourses.map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-48">
                <Select value={unitFilter} onValueChange={setUnitFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Units</SelectItem>
                    {uniqueUnits.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

       

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                <BlinkingDots size="large" color="bg-watney" />
              </div>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">
                {assignments.length === 0 ? 'No pending feedback' : 'No assignments match your filters'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {assignments.length === 0 
                  ? 'All assignments have been reviewed.' 
                  : 'Try adjusting your search or filters.'}
              </p>
            </div>
          ) : (
            <div className="">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Course</TableHead>
                    <TableHead className="text-xs">Unit</TableHead>
                    <TableHead className="text-xs">Student</TableHead>
                    <TableHead className="text-xs">Assignment</TableHead>
                    <TableHead className="text-right text-xs">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment) => (
                    <TableRow key={assignment._id} className="group">
                      <TableCell
                        className="text-xs cursor-pointer"
                        onClick={() => handleViewAssignment(assignment)}
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          {assignment.applicationId?.courseId?.name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell
                        className="text-xs cursor-pointer"
                        onClick={() => handleViewAssignment(assignment)}
                      >
                        {assignment.unitId?.title || 'N/A'}
                      </TableCell>
                      <TableCell
                        className="text-xs cursor-pointer"
                        onClick={() => handleViewAssignment(assignment)}
                      >
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {getStudentName(assignment)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {assignment.studentId.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell
                        className="text-xs font-medium cursor-pointer"
                        onClick={() => handleViewAssignment(assignment)}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {assignment.assignmentName}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewAssignment(assignment)}
                            className="flex items-center gap-1 bg-watney text-xs text-white hover:bg-watney/90"
                          >
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}