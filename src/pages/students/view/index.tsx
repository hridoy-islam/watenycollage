import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Printer, Plus, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StudentProfile } from './components/student-profile';
import { PersonalDetailsForm } from './components/personal-details-form';
import { AcademicRecords } from './components/academic-records';
import { WorkExperienceSection } from './components/work-experience';
import { ApplicationsSection } from './components/application-section';
import { EmergencyContacts } from './components/emergency-contacts';
import { PersonalInfoForm } from './components/personal-info-form';
import { AddressForm } from './components/address-form';
import { Link, useParams } from 'react-router-dom';
import axiosInstance from '../../../lib/axios';
import { DocumentsSection } from './components/documents-section';
import { SendEmailComponent } from './components/send-email-component';
import { NotesPage } from './components/notes';
import { AssignStaff } from './components/assign-staff';
import { useToast } from '@/components/ui/use-toast';
import AccountPage from './components/account';
import {
  isStudentDataComplete,
  isPersonalInfoComplete,
  isAcademicInfoComplete,
  isWorkExperienceComplete
} from '@/lib/utils';
import { useSelector } from 'react-redux';
import axios from 'axios';

export default function StudentViewPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [student, setStudent] = useState<any>();
  const [documents, setDocuments] = useState<any>([]);
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial loading
  const [hasRequiredDocuments, setHasRequiredDocuments] = useState(false);
  // const isComplete = isStudentDataComplete(student, hasRequiredDocuments);
  // const isPersonalComplete = isPersonalInfoComplete(student); // Check personal info completion
  // const isAcademicComplete = isAcademicInfoComplete(student); // check education is complete

  const isPersonalComplete = useMemo(
    () => isPersonalInfoComplete(student),
    [student]
  );
  const isAcademicComplete = useMemo(
    () => isAcademicInfoComplete(student),
    [student]
  );
  const isWorkExperience = useMemo(
    () => isWorkExperienceComplete(student),
    [student]
  );
  const isComplete = useMemo(
    () => isStudentDataComplete(student, hasRequiredDocuments),
    [student, hasRequiredDocuments]
  );
  const { user } = useSelector((state: any) => state.auth);
  // Check if the user is an agent
  const isAgent = user?.role === 'agent';

  const fetchData = async () => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/students/${id}`);
      setStudent(response.data.data);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setInitialLoading(false); // Disable initial loading after the first fetch
    }
  };

  // Fetch documents data
  const fetchDocuments = async () => {
    try {
      const response = await axios.get(
        `https://core.qualitees.co.uk/api/documents?where=entity_id,${student.id}&exclude=file_type,profile`,
        {
          headers: {
            'x-company-token': 'admissionhubz-0123' // Add the custom header
          }
        }
      );

      setDocuments(response.data.result); // Assuming the API returns an array of documents
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleSave = async (data) => {
    await axiosInstance.patch(`/students/${id}`, data);
    fetchData();
    toast({
      title: 'Student updated successfully',
      className: 'bg-supperagent border-none text-white'
    });
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-3">
        <h1 className="text-2xl font-semibold">View Student</h1>
        <div className="flex items-center gap-2">
          <Link to={'/admin/students'}>
            <Button
              variant="outline"
              size="sm"
              className="border-none bg-supperagent hover:bg-supperagent/90"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to List
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-none bg-supperagent hover:bg-supperagent/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
      </header>

      <StudentProfile student={student} />

      <Tabs defaultValue="personal" className="mt-1 px-2">
        <TabsList>
          <TabsTrigger
            value="personal"
            className="data-[state=active]:bg-supperagent data-[state=active]:text-white"
          >
            {!isPersonalComplete && (
              <XCircle className="mr-2 h-4 w-4 text-red-600" />
            )}
            Personal Details
          </TabsTrigger>
          {/* <TabsTrigger
            value="travel"
            className="data-[state=active]:bg-supperagent data-[state=active]:text-white"
          >
            Travel & Immigration
          </TabsTrigger> */}
          <TabsTrigger
            value="education"
            className="data-[state=active]:bg-supperagent data-[state=active]:text-white"
          >
            {!isAcademicComplete && (
              <XCircle className="mr-2 h-4 w-4 text-red-600" />
            )}
            Education
          </TabsTrigger>
          <TabsTrigger
            value="work"
            className="data-[state=active]:bg-supperagent data-[state=active]:text-white"
          >
            {!isWorkExperience && (
              <XCircle className="mr-2 h-4 w-4 text-red-600" />
            )}
            Work Details
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="data-[state=active]:bg-supperagent data-[state=active]:text-white"
          >
            {!hasRequiredDocuments && (
              <XCircle className="mr-2 h-4 w-4 text-red-600" />
            )}
            Documents
          </TabsTrigger>
          {isComplete && (
            <>
              <TabsTrigger
                value="application"
                className="data-[state=active]:bg-supperagent data-[state=active]:text-white"
              >
                Application
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="data-[state=active]:bg-supperagent data-[state=active]:text-white"
              >
                Notes
              </TabsTrigger>
              {!isAgent && (
                <>
                  <TabsTrigger
                    value="staff"
                    className="data-[state=active]:bg-supperagent data-[state=active]:text-white"
                  >
                    Assigned Staffs
                  </TabsTrigger>

                  <TabsTrigger
                    value="communications"
                    className="data-[state=active]:bg-supperagent data-[state=active]:text-white"
                  >
                    Communications
                  </TabsTrigger>
                  <TabsTrigger
                    value="account"
                    className="data-[state=active]:bg-supperagent data-[state=active]:text-white"
                  >
                    Account
                  </TabsTrigger>
                </>
              )}
            </>
          )}
        </TabsList>
        <TabsContent value="personal">
          <PersonalDetailsForm student={student} onSave={handleSave} />
          {/* <AddressForm student={student} onSave={handleSave} /> */}
          {/* <PersonalInfoForm student={student} onSave={handleSave} /> */}
          <EmergencyContacts student={student} onSave={handleSave} />
        </TabsContent>
        {/* <TabsContent value="travel">
          <TravelImmigrationHistory student={student} onSave={handleSave}/>
          <RefusalHistory student={student} onSave={handleSave} />
        </TabsContent> */}
        <TabsContent value="education">
          <AcademicRecords student={student} onSave={handleSave} />
        </TabsContent>
        <TabsContent value="work">
          <WorkExperienceSection student={student} onSave={handleSave} />
        </TabsContent>
        <TabsContent value="documents">
          <DocumentsSection
            student={student}
            documents={documents}
            setHasRequiredDocuments={setHasRequiredDocuments}
            fetchDocuments={fetchDocuments}
            onSave={handleSave}
          />
        </TabsContent>
        {isComplete && (
          <>
            <TabsContent value="application">
              <ApplicationsSection student={student} onSave={handleSave} />
            </TabsContent>

            <TabsContent value="staff">
              <AssignStaff student={student} onSave={handleSave} />
            </TabsContent>
            <TabsContent value="notes">
              <NotesPage />
            </TabsContent>
            <TabsContent value="communications">
              <SendEmailComponent student={student} />
            </TabsContent>
            <TabsContent value="account">
              <AccountPage student={student} />
            </TabsContent>
          </>
        )}
        {/* Add other tab contents as needed */}
      </Tabs>
    </div>
  );
}
