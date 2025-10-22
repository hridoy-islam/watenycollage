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
import { Input } from '@/components/ui/input';

import {
  FileText,
  Search,
  BookOpen,
  ArrowLeft
} from 'lucide-react';
import { BlinkingDots } from '@/components/shared/blinking-dots';

interface Assignment {
  _id: string;
  courseMaterialAssignmentId: string;
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
      name: string;
    };
  };
  unitId: {
    _id: string;
    title: string;
  };
  unitMaterialId: {
    _id: string;
    assignments: Array<{
      _id: string;
      title: string;
      content?: string;
      deadline?: string;
      type: string;
    }>;
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
  requireResubmit: boolean;
  createdAt: string;
  updatedAt: string;
}

export function StudentAssignmentFeedbackList() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        '/assignment?status=feedback_given&status=resubmission_required&status=completed&limit=all'
      );
      const assignmentsData = response.data.data?.result || [];
      setAssignments(assignmentsData);
      setFilteredAssignments(assignmentsData);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get assignment title from unitMaterialId.assignments
  const getAssignmentTitle = (assignment: Assignment): string => {
    if (!assignment.unitMaterialId?.assignments || !assignment.courseMaterialAssignmentId) {
      return 'Unknown Assignment';
    }

    const materialAssignment = assignment.unitMaterialId.assignments.find(
      (a: any) => a._id.toString() === assignment.courseMaterialAssignmentId
    );

    return materialAssignment?.title || 'Unknown Assignment';
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = assignments;

    // Status filter: Only filter out completed assignments that have ALL feedback seen
    filtered = filtered.filter(assignment => {
      if (assignment.status === 'completed') {
        // Check if there's at least one unseen feedback
        const hasUnseenFeedback = assignment.feedbacks?.some(feedback => !feedback.seen);
        return hasUnseenFeedback;
      }
      // For other statuses (feedback_given, resubmission_required), show all
      return true;
    });

    // Search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(assignment => {
        const assignmentTitle = getAssignmentTitle(assignment);
        return (
          assignmentTitle.toLowerCase().includes(lowerSearchTerm) ||
          assignment.applicationId?.courseId?.name?.toLowerCase().includes(lowerSearchTerm) ||
          assignment.unitId?.title?.toLowerCase().includes(lowerSearchTerm) ||
          assignment.studentId?.name?.toLowerCase().includes(lowerSearchTerm)
        );
      });
    }

    setFilteredAssignments(filtered);
  }, [assignments, searchTerm]);

  const handleViewAssignment = (assignment: Assignment) => {
    const url = `/dashboard/student-applications/${assignment.applicationId?._id}/assignment/${assignment.studentId._id}/unit-assignments/${assignment.unitId?._id}?assignmentId=${assignment._id}`;
    window.open(url, "_blank");
  };

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
          {/* Filters Section */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
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
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">You've seen everything — nothing pending now</h3>
            </div>
          ) : (
            <div className="">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Course</TableHead>
                    <TableHead className="text-xs">Unit</TableHead>
                    <TableHead className="text-xs">Assignment</TableHead>
                    <TableHead className="text-right text-xs">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment) => {
                    const unseenFeedbackCount = assignment.feedbacks?.filter(feedback => !feedback.seen).length || 0;
                    const assignmentTitle = getAssignmentTitle(assignment);
                    
                    return (
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
                          className="text-xs font-medium cursor-pointer"
                          onClick={() => handleViewAssignment(assignment)}
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {assignmentTitle}
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
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}