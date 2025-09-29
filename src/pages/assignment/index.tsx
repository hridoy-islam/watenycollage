import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileText,

  MoveLeft,
  Eye,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { useSelector } from 'react-redux';
import { BlinkingDots } from '@/components/shared/blinking-dots';

// Interfaces
interface Assignment {
  _id: string;
  applicationId: string;
  unitId: string;
  studentId: string;
  assignmentName: string;
  document: string; // URL or path
  createdAt: string;
  updatedAt: string;
}

interface CourseUnit {
  _id: string;
  title: string;
  unitReference: string;
  level: string;
  gls: string;
  credit: string;
}

interface ApplicationCourse {
  _id: string;
  courseId: string;
  studentId: string;
  status: string;
  seen: boolean;
  refId: string;
  createdAt: string;
}

function AssignmentPage() {
  const { id: applicationId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();

  // State
  const [applicant, setApplicant] = useState<ApplicationCourse | null>(null);
  const [courseUnits, setCourseUnits] = useState<CourseUnit[]>([]);
  const [assignmentsByUnit, setAssignmentsByUnit] = useState<Record<string, Assignment[]>>({});
  const [loading, setLoading] = useState(true);


  // Fetch applicant and course units
  const fetchApplicantAndUnits = async () => {
    try {
      setLoading(true);
      const appRes = await axiosInstance.get(`/application-course/${applicationId}`);
      const appData = appRes.data.data;
      setApplicant(appData);

      // Fetch course units
      const unitsRes = await axiosInstance.get(`/course-unit`, {
        params: { courseId: appData.courseId._id, limit:'all' },
      });
      const units = unitsRes.data.data.result || [];
      setCourseUnits(units);

      // Fetch assignments for each unit
      const assignmentsMap: Record<string, Assignment[]> = {};
      for (const unit of units) {
        const assignRes = await axiosInstance.get(`/assignment`, {
          params: { applicationId, unitId: unit._id,limit:'all' },
        });
        assignmentsMap[unit._id] = assignRes.data.data.result || [];
      }
      setAssignmentsByUnit(assignmentsMap);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast({
        title: 'Error',
        description: 'Failed to load assignments or course units.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (applicationId) {
      fetchApplicantAndUnits();
    }
  }, [applicationId]);


  return (
    <div className="">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assignment Submissions</h1>
          {applicant && (
            <p className="text-md font-medium">
              Course: {applicant?.courseId?.name} 
            </p>
          )}
        </div>
        <Button variant="default" className='bg-watney text-white hover:bg-watney/90' size="sm" onClick={() => navigate(-1)}>
          <MoveLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
<div className='bg-white rounded-lg shadow-md p-6'>


     {loading ? (
  <div className="flex justify-center py-10">
    <BlinkingDots size="large" color='bg-watney' />
  </div>
) : courseUnits.length === 0 ? (
  <div className="text-center py-10 text-muted-foreground italic">
    No course units found.
  </div>
) : (
  <Accordion type="multiple" className="w-full">
    {courseUnits.map((unit) => (
      <AccordionItem value={unit._id} key={unit._id}>
        <AccordionTrigger className="text-md font-semibold">
          {unit.title}
        </AccordionTrigger>
        <AccordionContent>
          {assignmentsByUnit[unit._id]?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className='text-right'>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignmentsByUnit[unit._id].map((assign) => (
                  <TableRow key={assign._id}>
                    <TableCell className="font-medium flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                      {assign.assignmentName}
                    </TableCell>
                    <TableCell>
                      {format(new Date(assign.createdAt), 'PPP p')}
                    </TableCell>
                    <TableCell className='flex justify-end'>
                      <Button
                        size="sm"
                        variant="default"
                        className='bg-watney text-white hover:bg-watney/90'
                        onClick={() => window.open(assign.document, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Assignment
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground italic">No assignments submitted yet.</p>
          )}
        </AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
)}
</div>
    </div>
  );
}

export default AssignmentPage;