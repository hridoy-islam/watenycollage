import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
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
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import RegistrationForm from './registration-form';
import LoginForm from './login-form';
import StudentApplication from '@/pages/homeStudentApplication';
import { MoveLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

interface ApplicationFormProps {
  formData: {
    studentType: string;
    termName: string;
    courseName: string;
    courseId: string;
  };
  onBack: () => void;
}

export default function ApplicationForm({
  formData,
  onBack
}: ApplicationFormProps) {
  const [showStudentApplication, setShowStudentApplication] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);

  // Format student type for display
  const getFormattedStudentType = (type: string) => {
    return type === 'international'
      ? 'Overseas'
      : type === 'eu'
        ? 'Home Student'
        : type;
  };

  // useEffect(() => {
  //   if (!user) return;

  //   if (user.isCompleted) {
  //     const courseId = localStorage.getItem('courseId');
  //     if (courseId) {
  //       navigate(`/dashboard/course-application/${courseId}`);
  //     }
  //   } else if (!user.authorized) {
  //     navigate('/dashboard/student-guideline');
  //   } else {
  //     if (formData.studentType === 'international') {
  //       navigate('/dashboard/international/student-form');
  //     } else {
  //       navigate('/dashboard/eu/student-form');
  //     }
  //   }
  // }, [user,formData,  navigate]);

  useEffect(() => {
    if (!user) return;

    if (!user.authorized) {
      navigate('/dashboard/student-guideline');
    } else {
      if (user.isCompleted) {
        const courseId = localStorage.getItem('courseId');
        if (courseId) {
          navigate(`/dashboard/course-application/${courseId}`);
        }
      } else if (formData.studentType === 'international') {
        navigate('/dashboard/international/student-form');
      } else {
        navigate('/dashboard/eu/student-form');
      }
    }
  }, [user, formData, navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className=" space-y-8 px-4 py-8">
        {/* Course Details Card - Top Section */}
        <Card className="border border-gray-200 shadow-md">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Selected Course Details</CardTitle>
              <CardDescription>
                Please verify your course selection before proceeding
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={onBack}
              className="h-8 bg-watney text-white hover:bg-watney/90"
            >
              <MoveLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Student Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">
                    {formData.courseName || 'Not selected'}
                  </TableCell>
                  <TableCell>{formData.termName || 'Not selected'}</TableCell>
                  <TableCell>
                    {getFormattedStudentType(formData.studentType) ||
                      'Not selected'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Login and Re gister Section - Centered */}
        <div className="w-full  py-8">
          <div className="flex flex-col items-center">
            <div className="grid w-full  grid-cols-1 gap-6  md:grid-cols-2">
              {/* Login Section - Left Side */}
              <Card className="border border-gray-200 shadow-md">
                <CardHeader className="bg-watney text-white">
                  <CardTitle>Login</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <LoginForm />
                </CardContent>
              </Card>

              {/* Register Section - Right Side */}
              <Card className="border border-gray-200 shadow-md">
                <CardHeader className="bg-watney text-white">
                  <CardTitle>Create a new user</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="mb-8 mt-4 w-full max-w-xs text-center">
                    <Button
                      className="w-full bg-watney text-white hover:bg-watney/90"
                      onClick={() => setShowRegisterDialog(true)}
                    >
                      New User
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">
                    You will be asked to create a Username (your email address)
                    and Password on the next screen. Please make a note of your
                    username and password as you will need these to log back in
                    to your application.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Register</DialogTitle>
            <DialogDescription>
              Create a new account to apply for this course
            </DialogDescription>
          </DialogHeader>
          <RegistrationForm
            formSubmitted={false}
            setFormSubmitted={() => {}}
            setActiveTab={() => setShowRegisterDialog(false)}
            onSuccess={() => setShowRegisterDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
