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

import { Briefcase, Calendar, MoveLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import RegistrationForm from './components/registration-form';
import LoginForm from './components/login-form';
import axiosInstance from '@/lib/axios';
import moment from 'moment';
import CareerApplicationForm from '../career-application';
import { useSelector } from 'react-redux';

export default function JobApplication() {
  const [showJobApplication, setShowJobApplication] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [application, setApplication] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { id: applicationId } = useParams();
  const navigate = useNavigate()
  const { user } = useSelector((state: any) => state.auth);


  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (applicationId) {
          localStorage.setItem("applicationId", applicationId);
        }
        const response = await axiosInstance.get(`/jobs/${applicationId}`);

        setApplication(response.data.data);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, [applicationId]);

  


    useEffect(() => {
    if (!user) return;

    if (!user.authorized) {
      navigate('/dashboard/career-guideline');
    } 
    else if (user.isCompleted) {
      const applicationId = localStorage.getItem('applicationId');
      if (applicationId) {
        navigate(`/dashboard/job-application/${applicationId}`);
      }
    }else{
      navigate('/dashboard/career')
    }
    
    
    
  }, [user, navigate]);

  return (
  <div className="flex min-h-screen flex-col items-center justify-start bg-white p-4">
    <div className="w-full space-y-8">
      <Card className="w-full rounded-xl border border-gray-100 bg-white shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gray-50 px-8 py-5">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Application Details
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Review your application details before submission
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-8 py-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Role Applied For */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium uppercase tracking-wider text-gray-500">
                  Job Title
                </span>
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {application?.jobTitle || (
                  <span className="italic text-gray-400">
                    No position selected
                  </span>
                )}
              </p>
            </div>

            {/* Application Deadline */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium uppercase tracking-wider text-gray-500">
                  Application Deadline
                </span>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-lg font-semibold text-gray-800">
                  {application?.applicationDeadline ? (
                    moment(application.applicationDeadline).format(
                      'MMMM D, YYYY'
                    )
                  ) : (
                    <span className="italic text-gray-400">
                      No deadline specified
                    </span>
                  )}
                </p>
                
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Login Section - Left Side */}
        <Card className="border border-gray-200 shadow-md">
          <CardHeader className="bg-watney text-white">
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <LoginForm  />
          </CardContent>
        </Card>

        {/* Register Section - Right Side */}
        <Card className="border border-gray-200 shadow-md">
          <CardHeader className="bg-watney text-white">
            <CardTitle>Create a new user</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="mb-8 mt-4 text-center">
              <Button
                className="w-full bg-watney text-white hover:bg-watney/90"
                onClick={() => setShowRegisterDialog(true)}
              >
                New User
              </Button>
            </div>
            <p className="text-center text-sm text-gray-600">
              You will be asked to create a Username (your email address)
              and Password on the next screen. Please make a note of your
              username and Password as you will need these to log back in to
              your application.
            </p>
          </CardContent>
        </Card>
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
          formSubmitted={formSubmitted}
          setFormSubmitted={setFormSubmitted}
          setActiveTab={() => {
            setShowRegisterDialog(false);
            setFormSubmitted(false);
          }}
          onSuccess={() => {
            setShowRegisterDialog(false);
          }}
        />
      </DialogContent>
    </Dialog>
  </div>
);

}
