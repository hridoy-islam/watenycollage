// import { useEffect, useState } from 'react';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow
// } from '@/components/ui/table';
// import { CheckCircle, Clock, Info } from 'lucide-react';
// import axiosInstance from '@/lib/axios';
// import { useNavigate } from 'react-router-dom';
// import moment from 'moment';
// import { DataTablePagination } from '@/components/shared/data-table-pagination';
// import { BlinkingDots } from '@/components/shared/blinking-dots';

// // --- Types ---

// interface Job {
//   _id: string;
//   jobTitle: string;
//   applicationDeadline: string | Date;
// }

// interface Application {
//   _id: string;
//   jobId: Job;
// }

// interface UserData {
//   _id: string;
//   name: string;
//   role: string;

//   // Task Completion Statuses
//   dbsDone: boolean;
//   medicalDone: boolean;
//   ecertDone: boolean;
//   bankDetailsDone: boolean;
//   checkListDone: boolean;

//   // Task Unlock Flags (Server-side controls)
//   postEmploymentUnlock?: boolean; // Unlocks Medical
//   dbsUnlock?: boolean;            // Unlocks DBS
//   ecertUnlock?: boolean;          // Unlocks Ecert
//   bankDetailsUnlock?: boolean;    // Unlocks Bank Details
//   startDateUnlock?: boolean;      // Unlocks Starter Checklist

//   // Email/Process Statuses
//   jobOfferMailSent?: boolean;
//   interviewMailSent?: boolean;
// }

// interface ApplicantDashboardProps {
//   user: {
//     _id: string;
//     name: string;
//     role: string;
//   };
// }

// interface TaskItemProps {
//   title: string;
//   isCompleted: boolean;
//   navigateTo: string;
// }

// // --- Sub-Components ---

// const TaskItem: React.FC<TaskItemProps> = ({
//   title,
//   isCompleted,
//   navigateTo
// }) => {
//   const navigate = useNavigate();

//   const handleAction = () => {
//     if (!isCompleted) {
//       navigate(navigateTo);
//     }
//   };

//   return (
//     <div className="flex items-center justify-between p-6">
//       <div className="flex items-center space-x-2">
//         <div className="flex h-6 w-6 items-center justify-center">
//           {isCompleted ? (
//             <CheckCircle className="h-full w-full stroke-[2.5] text-green-500" />
//           ) : (
//             <Clock className="h-full w-full stroke-[2.5] text-yellow-500" />
//           )}
//         </div>

//         <span
//           className={`text-lg font-medium ${isCompleted ? 'text-green-500 ' : 'text-gray-800'}`}
//         >
//           {title}
//         </span>
//       </div>
//       <Button
//         variant={isCompleted ? 'outline' : 'default'}
//         onClick={isCompleted ? undefined : handleAction}
//         className={
//           isCompleted
//             ? 'border-green-500 bg-green-500 text-white hover:bg-green-500'
//             : 'bg-watney text-white hover:bg-watney/90'
//         }
//       >
//         {isCompleted ? 'Completed' : `Let's Go`}
//       </Button>
//     </div>
//   );
// };

// const TaskStatusList: React.FC<{ userData: UserData; userId: string }> = ({ userData, userId }) => {
//   // Define all possible tasks with their specific unlock keys
//   const allTasks = [
//     {
//       title: 'Complete Your Medical Questionnaire',
//       unlockKey: 'postEmploymentUnlock',
//       completeKey: 'medicalDone',
//       navigateTo: `medical-form/${userId}`
//     },
//     {
//       title: 'Complete Your DBS',
//       unlockKey: 'dbsUnlock',
//       completeKey: 'dbsDone',
//       navigateTo: `dbs-form/${userId}`
//     },
//     {
//       title: 'Upload Your Ecert Training certificates',
//       unlockKey: 'ecertUnlock',
//       completeKey: 'ecertDone',
//       navigateTo: `ecert-form/${userId}`
//     },
//     {
//       title: 'Complete Your Bank Details',
//       unlockKey: 'bankDetailsUnlock',
//       completeKey: 'bankDetailsDone',
//       navigateTo: `bank-details/${userId}`
//     },
//     {
//       title: 'Complete Your Starter Checklist',
//       unlockKey: 'startDateUnlock',
//       completeKey: 'checkListDone',
//       navigateTo: `starter-checklist-form/${userId}`
//     }
//   ];

//   // Filter: Only return tasks where the specific unlock key is TRUE in userData
//   const visibleTasks = allTasks.filter((task) => userData[task.unlockKey as keyof UserData] === true);

//   return (
//     <Card>
//       <CardHeader>
//          <CardTitle>Onboarding Tasks</CardTitle>
//          <CardDescription>Complete the unlocked steps below.</CardDescription>
//       </CardHeader>
//       <CardContent className="p-0">
//         <div className="space-y-0 divide-y divide-gray-100">
//           {visibleTasks.length > 0 ? (
//             visibleTasks.map((task) => (
//               <TaskItem
//                 key={task.unlockKey}
//                 title={task.title}
//                 isCompleted={userData[task.completeKey as keyof UserData] as boolean}
//                 navigateTo={task.navigateTo}
//               />
//             ))
//           ) : (
//             <div className="p-8 text-center text-gray-500">
//               <Clock className="mx-auto mb-2 h-8 w-8 text-gray-300" />
//               <p>No onboarding tasks are currently unlocked.</p>
//             </div>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// // --- Main Component ---

// export function ApplicantDashboard({ user }: ApplicantDashboardProps) {
//   const [applications, setApplications] = useState<Application[]>([]);
//   const [totalApplication, setTotalApplication] = useState(10);
//   const [allJobs, setAllJobs] = useState<Job[]>([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();
//   const [userData, setUserData] = useState<UserData | null>(null);

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [entriesPerPage, setEntriesPerPage] = useState(10);

//   const fetchData = async (page = 1, limit = 10) => {
//     try {
//       const [applicationRes, jobRes, userRes] = await Promise.all([
//         axiosInstance.get(
//           `/application-job?applicantId=${user._id}&page=${page}&limit=${limit}`
//         ),
//         axiosInstance.get(`/jobs?page=${page}&limit=${limit}`),
//         axiosInstance.get(`/users/${user._id}`)
//       ]);

//       const appliedJobs = Array.isArray(applicationRes.data.data?.result)
//         ? applicationRes.data.data.result
//         : [];

//       const allJobsData = Array.isArray(jobRes.data.data?.result)
//         ? jobRes.data.data.result
//         : [];

//       setUserData(userRes?.data?.data);

//       const totalApplicationPages =
//         applicationRes.data.data?.meta?.totalPage || 1;
//       const totalJobPages = jobRes.data.data?.meta?.totalPage || 1;
//       const totalApplicationCount = jobRes.data.data?.meta?.total || 1;
//       setTotalApplication(totalApplicationCount);
//       setApplications(appliedJobs);
//       setTotalPages(Math.max(totalApplicationPages, totalJobPages));

//       // Get applied job IDs
//       const appliedJobIds = new Set(
//         appliedJobs.map((app: Application) => app.jobId._id)
//       );

//       // Filter out applied jobs
//       const availableJobs = allJobsData.filter(
//         (job: Job) => !appliedJobIds.has(job._id)
//       );

//       setAllJobs(availableJobs);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData(currentPage, entriesPerPage);
//   }, [currentPage, entriesPerPage, user._id]);

//   const handleApply = (jobId: string) => {
//     navigate(`/dashboard/job-application/${jobId}`);
//   };

//   // --- RENDERING LOGIC ---

//   // 1. Loading State
//   if (loading || !userData) {
//     return (
//       <div className="flex h-[80vh] items-center justify-center">
//         <BlinkingDots size="large" color="bg-watney" />
//       </div>
//     );
//   }

//     // 2. Application Received / Waiting for Offer
//   // If no job offer has been sent yet, show this holding message.
//   if (!userData?.jobOfferMailSent && !userData.interviewMailSent ) {
//     return (
//       <div className="flex-1 space-y-4 p-4">
//         <div className="flex w-full items-center gap-3 rounded-lg border border-watney border-l-4 border-l-watney bg-watney/5 p-4 shadow-sm transition-all animate-in fade-in slide-in-from-top-2">
//           <Info className="h-5 w-5 text-watney" />
//           <div>
//             <h3 className="font-medium ">
//               You will be contacted from the office regarding the next steps for
//               your application.
//             </h3>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // 3. Interview Mail Sent - PRIORITY MESSAGE
//   // If this is true, show this message and DO NOT show the task list.
//   if (userData.interviewMailSent === true) {
//     return (
//       <div className="flex-1 space-y-4 p-4">
//         <div className="flex w-full items-center gap-3 rounded-lg border border-watney border-l-4 border-l-watney bg-watney/5 p-4 shadow-sm transition-all animate-in fade-in slide-in-from-top-2">
//           <Info className="h-5 w-5 text-watney" />
//           <div>
//             <h3 className="font-medium ">
//               You have been invited for an interview. Please check your email for more details.
//             </h3>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // 4. Main Dashboard (Job Offer Sent & No Interview Pending)
//   // This is where we show the Task List (filtered by individual unlocks) and Job Tables.
//   return (
//     <div className="flex-1 space-y-4 p-4">
//       <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">

//         {/* Task List Section */}
//         <div className="lg:col-span-5">
//           <TaskStatusList userData={userData} userId={user._id} />
//         </div>

//         {/* Jobs & Applications Section */}
//         {/* <div className="lg:col-span-2">
//           <Tabs defaultValue="applied" className="space-y-4">
//             <TabsList>
//               <TabsTrigger value="applied">Jobs Applied</TabsTrigger>
//               <TabsTrigger value="all-jobs">All Jobs</TabsTrigger>
//             </TabsList>

//             <TabsContent
//               value="applied"
//               className="max-h-[96vh] space-y-4 overflow-y-auto"
//             >
//               {applications?.length > 0 ? (
//                 <>
//                   <div className="hidden max-w-full overflow-x-auto md:block">
//                     <Card>
//                       <CardContent>
//                         <Table className="">
//                           <TableHeader>
//                             <TableRow>
//                               <TableHead>Job Title</TableHead>
//                               <TableHead className="text-right">
//                                 Application Deadline
//                               </TableHead>
//                             </TableRow>
//                           </TableHeader>
//                           <TableBody>
//                             {applications?.map((application) => (
//                               <TableRow key={application._id}>
//                                 <TableCell className="font-medium">
//                                   {application.jobId?.jobTitle || 'Unnamed Job'}
//                                 </TableCell>
//                                 <TableCell className="text-right">
//                                   {application.jobId?.applicationDeadline
//                                     ? moment(
//                                         application.jobId.applicationDeadline
//                                       ).format('DD MMM YYYY')
//                                     : 'N/A'}
//                                 </TableCell>
//                               </TableRow>
//                             ))}
//                           </TableBody>
//                         </Table>
//                       </CardContent>
//                     </Card>
//                   </div>

//                   <div className="max-h-[96vh] space-y-4 overflow-y-auto md:hidden">
//                     {applications.map((application) => (
//                       <Card key={application._id}>
//                         <CardHeader>
//                           <CardTitle>
//                             {application.jobId?.jobTitle || 'Unnamed Job'}
//                           </CardTitle>
//                           <CardDescription>
//                             Deadline:{' '}
//                             {application.jobId?.applicationDeadline
//                               ? moment(
//                                   application.jobId.applicationDeadline
//                                 ).format('MM-DD-YYYY')
//                               : 'N/A'}
//                           </CardDescription>
//                         </CardHeader>
//                       </Card>
//                     ))}
//                   </div>
//                 </>
//               ) : (
//                 <p className="py-4 text-center text-gray-500">
//                   No applications found.
//                 </p>
//               )}
//             </TabsContent>

//             <TabsContent
//               value="all-jobs"
//               className="max-h-[96vh] space-y-4 overflow-y-auto"
//             >
//               {loading ? (
//                 <BlinkingDots size="small" color="bg-gray-800" />
//               ) : allJobs.length > 0 ? (
//                 <>
//                   <div className="hidden max-w-full overflow-x-auto md:block">
//                     <Card>
//                       <CardContent>
//                         <Table className="min-w-[700px]">
//                           <TableHeader>
//                             <TableRow>
//                               <TableHead>Job Title</TableHead>
//                               <TableHead>Application Deadline</TableHead>
//                               <TableHead className="text-right">
//                                 Actions
//                               </TableHead>
//                             </TableRow>
//                           </TableHeader>
//                           <TableBody>
//                             {allJobs.map((job) => (
//                               <TableRow key={job._id}>
//                                 <TableCell className="font-medium">
//                                   {job.jobTitle || 'Unnamed Job'}
//                                 </TableCell>
//                                 <TableCell>
//                                   {job.applicationDeadline
//                                     ? moment(job.applicationDeadline).format(
//                                         'MM-DD-YYYY'
//                                       )
//                                     : 'N/A'}
//                                 </TableCell>
//                                 <TableCell className="text-right">
//                                   <Button
//                                     size="sm"
//                                     className="bg-watney text-white hover:bg-watney/90"
//                                     onClick={() => handleApply(job._id)}
//                                   >
//                                     Apply
//                                   </Button>
//                                 </TableCell>
//                               </TableRow>
//                             ))}
//                           </TableBody>
//                         </Table>
//                       </CardContent>
//                     </Card>
//                   </div>

//                   <div className="max-h-[96vh] space-y-4 overflow-y-auto md:hidden">
//                     {allJobs.map((job) => (
//                       <Card key={job._id}>
//                         <CardHeader>
//                           <CardTitle>{job.jobTitle || 'Unnamed Job'}</CardTitle>
//                           <CardDescription>
//                             Deadline:{' '}
//                             {job.applicationDeadline
//                               ? moment(job.applicationDeadline).format(
//                                   'MM-DD-YYYY'
//                                 )
//                               : 'N/A'}
//                           </CardDescription>
//                           <div className="mt-2 text-right">
//                             <Button
//                               size="sm"
//                               className="bg-watney text-white hover:bg-watney/90"
//                               onClick={() => handleApply(job._id)}
//                             >
//                               Apply
//                             </Button>
//                           </div>
//                         </CardHeader>
//                       </Card>
//                     ))}
//                   </div>

//                   <div className="mt-4 flex w-full max-md:scale-75 max-md:justify-center">
//                     <DataTablePagination
//                       pageSize={entriesPerPage}
//                       setPageSize={setEntriesPerPage}
//                       currentPage={currentPage}
//                       totalPages={totalPages}
//                       onPageChange={setCurrentPage}
//                     />
//                   </div>
//                 </>
//               ) : (
//                 <p className="py-4 text-center text-gray-500">
//                   No jobs available at the moment.
//                 </p>
//               )}
//             </TabsContent>
//           </Tabs>
//         </div> */}
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { CheckCircle, Clock, Info } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { BlinkingDots } from '@/components/shared/blinking-dots';

// --- Types ---

interface Job {
  _id: string;
  jobTitle: string;
  applicationDeadline: string | Date;
}

interface Application {
  _id: string;
  jobId: Job;
}

interface UserData {
  _id: string;
  name: string;
  role: string;

  // Task Completion Statuses
  dbsDone: boolean;
  medicalDone: boolean;
  ecertDone: boolean;
  bankDetailsDone: boolean;
  checkListDone: boolean;

  // Task Unlock Flags
  postEmploymentUnlock?: boolean;
  dbsUnlock?: boolean;
  ecertUnlock?: boolean;
  bankDetailsUnlock?: boolean;
  startDateUnlock?: boolean;

  // Email/Process Statuses
  jobOfferMailSent?: boolean;
  interviewMailSent?: boolean;
}

interface ApplicantDashboardProps {
  user: {
    _id: string;
    name: string;
    role: string;
  };
}

interface TaskItemProps {
  title: string;
  isCompleted: boolean;
  navigateTo: string;
}

// --- Sub-Components ---

const TaskItem: React.FC<TaskItemProps> = ({
  title,
  isCompleted,
  navigateTo
}) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (!isCompleted) {
      navigate(navigateTo);
    }
  };

  return (
    <div className="flex items-center justify-between border-b border-gray-200 p-6 last:border-0">
      <div className="flex items-center space-x-2">
        <div className="flex h-6 w-6 items-center justify-center">
          {isCompleted ? (
            <CheckCircle className="h-full w-full stroke-[2.5] text-green-500" />
          ) : (
            <Clock className="h-full w-full stroke-[2.5] text-yellow-500" />
          )}
        </div>

        <span
          className={`text-lg font-medium ${isCompleted ? 'text-green-500 ' : 'text-gray-800'}`}
        >
          {title}
        </span>
      </div>
      <Button
        variant={isCompleted ? 'outline' : 'default'}
        onClick={isCompleted ? undefined : handleAction}
        className={
          isCompleted
            ? 'border-green-500 bg-green-500 text-white hover:bg-green-500'
            : 'bg-watney text-white hover:bg-watney/90'
        }
      >
        {isCompleted ? 'Completed' : `Let's Go`}
      </Button>
    </div>
  );
};

const TaskStatusList: React.FC<{ userData: UserData; userId: string }> = ({
  userData,
  userId
}) => {
  const allTasks = [
    {
      title: 'Complete Your Medical Questionnaire',
      unlockKey: 'postEmploymentUnlock',
      completeKey: 'medicalDone',
      navigateTo: `medical-form/${userId}`
    },
    {
      title: 'Complete Your DBS',
      unlockKey: 'dbsUnlock',
      completeKey: 'dbsDone',
      navigateTo: `dbs-form/${userId}`
    },
    {
      title: 'Upload Your Ecert Training certificates',
      unlockKey: 'ecertUnlock',
      completeKey: 'ecertDone',
      navigateTo: `ecert-form/${userId}`
    },
    {
      title: 'Complete Your Bank Details',
      unlockKey: 'bankDetailsUnlock',
      completeKey: 'bankDetailsDone',
      navigateTo: `bank-details/${userId}`
    },
    {
      title: 'Complete Your Starter Checklist',
      unlockKey: 'startDateUnlock',
      completeKey: 'checkListDone',
      navigateTo: `starter-checklist-form/${userId}`
    }
  ];

  // Filter: Only return tasks where the specific unlock key is TRUE/Truthy
  const visibleTasks = allTasks.filter((task) => {
    const val = userData[task.unlockKey as keyof UserData];
    return Boolean(val);
  });

  // If no tasks are visible, we render nothing (the parent handles layout)
  if (visibleTasks.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Onboarding Tasks</CardTitle>
        <CardDescription>Complete the unlocked steps below.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {visibleTasks.map((task) => (
            <TaskItem
              key={task.unlockKey}
              title={task.title}
              isCompleted={
                userData[task.completeKey as keyof UserData] as boolean
              }
              navigateTo={task.navigateTo}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// --- Main Component ---

export function ApplicantDashboard({ user }: ApplicantDashboardProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [totalApplication, setTotalApplication] = useState(10);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const fetchData = async (page = 1, limit = 10) => {
    try {
      const [applicationRes, jobRes, userRes] = await Promise.all([
        axiosInstance.get(
          `/application-job?applicantId=${user._id}&page=${page}&limit=${limit}`
        ),
        axiosInstance.get(`/jobs?page=${page}&limit=${limit}`),
        axiosInstance.get(`/users/${user._id}`)
      ]);

      const appliedJobs = Array.isArray(applicationRes.data.data?.result)
        ? applicationRes.data.data.result
        : [];

      const allJobsData = Array.isArray(jobRes.data.data?.result)
        ? jobRes.data.data.result
        : [];

      setUserData(userRes?.data?.data);

      const totalApplicationPages =
        applicationRes.data.data?.meta?.totalPage || 1;
      const totalJobPages = jobRes.data.data?.meta?.totalPage || 1;
      const totalApplicationCount = jobRes.data.data?.meta?.total || 1;
      setTotalApplication(totalApplicationCount);
      setApplications(appliedJobs);
      setTotalPages(Math.max(totalApplicationPages, totalJobPages));

      const appliedJobIds = new Set(
        appliedJobs.map((app: Application) => app.jobId._id)
      );

      const availableJobs = allJobsData.filter(
        (job: Job) => !appliedJobIds.has(job._id)
      );

      setAllJobs(availableJobs);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage, user._id]);

  const handleApply = (jobId: string) => {
    navigate(`/dashboard/job-application/${jobId}`);
  };

  // --- RENDERING LOGIC ---

  if (loading || !userData) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  // 1. CHECK FOR UNLOCKED TASKS FIRST
  // If any of these are true, we MUST show the dashboard, ignoring the messages below.
  const isAnyTaskUnlocked =
    Boolean(userData.postEmploymentUnlock) ||
    Boolean(userData.dbsUnlock) ||
    Boolean(userData.ecertUnlock) ||
    Boolean(userData.bankDetailsUnlock) ||
    Boolean(userData.startDateUnlock);

  // 1. Interview Mail Sent Message
  if (userData.interviewMailSent === true && !isAnyTaskUnlocked) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center p-4">
        <div className="max-w-8xl flex w-full flex-col items-center justify-center gap-6 rounded-xl border-2 border-watney bg-white p-6 text-center shadow-sm duration-500 animate-in fade-in zoom-in-95 md:flex-row md:gap-10 md:p-12 md:text-left">
          <div className="shrink-0 rounded-full bg-watney/10 p-6">
            <Info className="h-12 w-12 text-watney md:h-16 md:w-16" />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold leading-tight md:text-4xl">
              You have been invited for an interview. Please check your email for more details regarding the schedule.
            </h3>
           
          </div>
        </div>
      </div>
    );
  }

  if (
    !userData?.jobOfferMailSent &&
    !userData.interviewMailSent &&
    !isAnyTaskUnlocked
  ) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center p-4">
        <div className="max-w-8xl flex w-full flex-col items-center justify-center gap-6 rounded-xl border-2 border-watney bg-white p-6 text-center shadow-sm duration-500 animate-in fade-in zoom-in-95 md:flex-row md:gap-10 md:p-12 md:text-left">
          <div className="shrink-0 rounded-full bg-watney/10 p-6">
            <Info className="h-12 w-12 text-watney md:h-16 md:w-16" />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold leading-tight md:text-4xl">
              You will be contacted from the office regarding the next steps for
              your application
            </h3>
          </div>
        </div>
      </div>
    );
  }
  // 4. Main Dashboard (Shows if Tasks are Unlocked OR Job Offer Sent)
  return (
    <div className="flex-1 space-y-4 p-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Task List Section */}
        <div className="lg:col-span-5">
          <TaskStatusList userData={userData} userId={user._id} />
        </div>

        {/* Jobs Section */}
        {/* <div className="lg:col-span-5">
          <Tabs defaultValue="applied" className="space-y-4">
            <TabsList>
              <TabsTrigger value="applied">Jobs Applied</TabsTrigger>
              <TabsTrigger value="all-jobs">All Jobs</TabsTrigger>
            </TabsList>

            <TabsContent
              value="applied"
              className="max-h-[96vh] space-y-4 overflow-y-auto"
            >
              {applications?.length > 0 ? (
                <>
                  <div className="hidden max-w-full overflow-x-auto md:block">
                    <Card>
                      <CardContent>
                        <Table className="">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Job Title</TableHead>
                              <TableHead className="text-right">
                                Application Deadline
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {applications?.map((application) => (
                              <TableRow key={application._id}>
                                <TableCell className="font-medium">
                                  {application.jobId?.jobTitle || 'Unnamed Job'}
                                </TableCell>
                                <TableCell className="text-right">
                                  {application.jobId?.applicationDeadline
                                    ? moment(
                                        application.jobId.applicationDeadline
                                      ).format('DD MMM YYYY')
                                    : 'N/A'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="max-h-[96vh] space-y-4 overflow-y-auto md:hidden">
                    {applications.map((application) => (
                      <Card key={application._id}>
                        <CardHeader>
                          <CardTitle>
                            {application.jobId?.jobTitle || 'Unnamed Job'}
                          </CardTitle>
                          <CardDescription>
                            Deadline:{' '}
                            {application.jobId?.applicationDeadline
                              ? moment(
                                  application.jobId.applicationDeadline
                                ).format('MM-DD-YYYY')
                              : 'N/A'}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <p className="py-4 text-center text-gray-500">
                  No applications found.
                </p>
              )}
            </TabsContent>

            <TabsContent
              value="all-jobs"
              className="max-h-[96vh] space-y-4 overflow-y-auto"
            >
              {loading ? (
                <BlinkingDots size="small" color="bg-gray-800" />
              ) : allJobs.length > 0 ? (
                <>
                  <div className="hidden max-w-full overflow-x-auto md:block">
                    <Card>
                      <CardContent>
                        <Table className="min-w-[700px]">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Job Title</TableHead>
                              <TableHead>Application Deadline</TableHead>
                              <TableHead className="text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {allJobs.map((job) => (
                              <TableRow key={job._id}>
                                <TableCell className="font-medium">
                                  {job.jobTitle || 'Unnamed Job'}
                                </TableCell>
                                <TableCell>
                                  {job.applicationDeadline
                                    ? moment(job.applicationDeadline).format(
                                        'MM-DD-YYYY'
                                      )
                                    : 'N/A'}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    size="sm"
                                    className="bg-watney text-white hover:bg-watney/90"
                                    onClick={() => handleApply(job._id)}
                                  >
                                    Apply
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="max-h-[96vh] space-y-4 overflow-y-auto md:hidden">
                    {allJobs.map((job) => (
                      <Card key={job._id}>
                        <CardHeader>
                          <CardTitle>{job.jobTitle || 'Unnamed Job'}</CardTitle>
                          <CardDescription>
                            Deadline:{' '}
                            {job.applicationDeadline
                              ? moment(job.applicationDeadline).format(
                                  'MM-DD-YYYY'
                                )
                              : 'N/A'}
                          </CardDescription>
                          <div className="mt-2 text-right">
                            <Button
                              size="sm"
                              className="bg-watney text-white hover:bg-watney/90"
                              onClick={() => handleApply(job._id)}
                            >
                              Apply
                            </Button>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>

                  <div className="mt-4 flex w-full max-md:scale-75 max-md:justify-center">
                    <DataTablePagination
                      pageSize={entriesPerPage}
                      setPageSize={setEntriesPerPage}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                </>
              ) : (
                <p className="py-4 text-center text-gray-500">
                  No jobs available at the moment.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div> */}
      </div>
    </div>
  );
}
