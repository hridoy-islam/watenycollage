import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { FileText, Search, BookOpen, Eye, ArrowLeft } from 'lucide-react';
import { BlinkingDots } from '@/components/shared/blinking-dots';

interface ApplicationCourse {
  _id: string;
  courseId: {
    _id: string;
    name: string;
    courseCode: string;
  };
  studentId: {
    _id: string;
    name: string;
  };
  status: string;
}

interface CourseUnit {
  _id: string;
  title: string;
  unitReference: string;
  level: string;
  gls: string;
  credit: string;
}

interface CourseUnitMaterial {
  _id: string;
  courseId: string;
  unitId: {
    _id: string;
    title: string;
    unitReference: string;
  };
  assignments: Array<{
    _id?: string;
    title: string;
    content?: string;
    deadline?: string;
    type: string;
  }>;
}

interface AssignmentData {
  applicationId: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  unitId: string;
  unitTitle: string;
  unitReference: string;
  assignmentName: string;
  assignmentId?: string;
  deadline?: string;
}

export function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  const fetchStudentAssignments = async () => {
    try {
      setLoading(true);

      // Step 1: Get student applications
      const applicationsResponse = await axiosInstance.get(
        `/application-course?studentId=${user._id}&limit=all&status=approved`
      );
      const applications: ApplicationCourse[] =
        applicationsResponse.data.data?.result || [];

      if (applications.length === 0) {
        setAssignments([]);
        return;
      }

      const allAssignments: AssignmentData[] = [];

      // Step 2: For each application, get unit materials and assignments
      for (const application of applications) {
        try {
          // Get unit materials for this course
          const unitMaterialResponse = await axiosInstance.get(
            `/unit-material?courseId=${application.courseId._id}&limit=all`
          );
          const unitMaterials: CourseUnitMaterial[] =
            unitMaterialResponse.data.data?.result || [];

          // Step 3: Extract assignments from unit materials
          for (const unitMaterial of unitMaterials) {
            if (
              unitMaterial.assignments &&
              unitMaterial.assignments.length > 0
            ) {
              for (const assignment of unitMaterial.assignments) {
                // Only include assignments (not other resource types)
                if (assignment.type === 'assignment') {
                  allAssignments.push({
                    applicationId: application._id,
                    courseId: application.courseId._id,
                    courseName: application.courseId.name,
                    courseCode: application.courseId.courseCode,
                    unitId: unitMaterial.unitId._id,
                    unitTitle: unitMaterial.unitId.title,
                    unitReference: unitMaterial.unitId.unitReference,
                    assignmentName: assignment.title,
                    assignmentId: assignment._id,
                    deadline: assignment.deadline
                  });
                }
              }
            }
          }
        } catch (error) {
          console.error(
            `Error fetching unit materials for course ${application.courseId.name}:`,
            error
          );
        }
      }

      setAssignments(allAssignments);
    } catch (error) {
      console.error('Error fetching student assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchStudentAssignments();
    }
  }, [user?._id]);

  // Filter assignments based on search term and course filter
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.assignmentName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assignment.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.unitTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.unitReference.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse =
      courseFilter === 'all' || assignment.courseName === courseFilter;

    return matchesSearch && matchesCourse;
  });

  // Get unique course names for filter
  const uniqueCourses = [
    ...new Set(assignments.map((assignment) => assignment.courseName))
  ];

  const handleViewAssignment = (assignment: AssignmentData) => {
    navigate(
      `/dashboard/student-applications/${assignment.applicationId}/assignment/${user._id}/unit-assignments/${assignment.unitId}`,
      {
        state: {
          assignmentId: assignment.assignmentId,
          assignmentName: assignment.assignmentName
        }
      }
    );
  };



   const assignmentsByCourse: Record<string, AssignmentData[]> = {};

filteredAssignments.forEach((assignment) => {
  if (!assignmentsByCourse[assignment.courseName]) {
    assignmentsByCourse[assignment.courseName] = [];
  }
  assignmentsByCourse[assignment.courseName].push(assignment);
});

// Sort units within each course
Object.keys(assignmentsByCourse).forEach((course) => {
  assignmentsByCourse[course].sort((a, b) => {
    const getUnitNumber = (title: string) => {
      const match = title.match(/Unit (\d+)/i);
      return match ? parseInt(match[1], 10) : Infinity;
    };
    return getUnitNumber(a.unitTitle) - getUnitNumber(b.unitTitle);
  });
});

// Flatten to an array, maintaining course order
const sortedAssignments = Object.keys(assignmentsByCourse).flatMap(
  (course) => assignmentsByCourse[course]
);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Assignments</CardTitle>
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
                {assignments.length === 0
                  ? 'There are no assignments at the moment.'
                  : 'No matching assignments'}
              </h3>
            </div>
          ) : (
            <div className="">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Course</TableHead>
                    <TableHead className="text-xs">Unit</TableHead>
                    <TableHead className="text-xs">Assignment Name</TableHead>
                    {/* <TableHead className="text-xs">Deadline</TableHead> */}
                    <TableHead className="text-right text-xs">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAssignments.map((assignment, index) => (
                    <TableRow
                      key={`${assignment.unitId}-${assignment.assignmentName}-${index}`}
                      className="group"
                    >
                      <TableCell
                        className="cursor-pointer text-xs"
                        onClick={() => handleViewAssignment(assignment)}
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          {assignment.courseName}
                        </div>
                      </TableCell>
                      <TableCell
                        className="cursor-pointer text-xs"
                        onClick={() => handleViewAssignment(assignment)}
                      >
                        {assignment.unitTitle}
                      </TableCell>

                      <TableCell
                        className="cursor-pointer text-xs font-medium"
                        onClick={() => handleViewAssignment(assignment)}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {assignment.assignmentName}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      {/* <TableCell className="text-xs">
                        {assignment.deadline
                          ? new Date(assignment.deadline).toLocaleDateString()
                          : 'No deadline'}
                      </TableCell> */}
                      <TableCell className="cursor-pointer text-right">
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewAssignment(assignment)}
                            className="flex items-center gap-1 bg-watney text-xs text-white hover:bg-watney/90"
                          >
                            <Eye className="h-3 w-3" />
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
