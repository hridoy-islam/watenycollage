import { useEffect, useState } from "react"
import { ArrowLeft, Printer, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentProfile } from "./components/student-profile"
import { PersonalDetailsForm } from "./components/personal-details-form"
import { TravelImmigrationHistory } from "./components/travel-immigration-history"
import { AcademicRecords } from "./components/academic-records"
import { WorkExperienceSection } from "./components/work-experience"
import { ApplicationsSection } from "./components/application-section"
import { EmergencyContacts } from "./components/emergency-contacts"
import { PersonalInfoForm } from "./components/personal-info-form"
import { AddressForm } from "./components/address-form"
import { Link, useParams } from "react-router-dom"
import axiosInstance from '../../../lib/axios'
import { RefusalHistory } from "./components/refusal-history"
import { DocumentsSection } from "./components/documents-section"


export default function StudentViewPage() {
  const { id } = useParams();
  const [student, setStudent] = useState<any>([])
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial loading

  

  const fetchData = async () => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/students/${id}`);
      setStudent(response.data.data);
    } catch (error) {
      console.error("Error fetching institutions:", error);
    } finally {
      setInitialLoading(false); // Disable initial loading after the first fetch
    }
  };

  const handleImageUpdate = (data) => {
    fetchData()
  }

  const handleSave = async(data) => {
    await axiosInstance.patch(`/students/${id}`, data);
    fetchData();
  }

  useEffect(() => {
    fetchData();
  }, [id]);

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-3">
        <h1 className="text-2xl font-semibold">View Student</h1>
        <div className="flex items-center gap-2">
        <Link to={'/admin/students'}>
          <Button variant="outline" size="sm" className="bg-supperagent border-none hover:bg-supperagent/90">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
          </Link>
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button size="sm" variant="outline" className="bg-supperagent border-none hover:bg-supperagent/90">
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
      </header>

      <StudentProfile student={student} onImageUpdate={handleImageUpdate} />

      <Tabs defaultValue="personal" className="px-2 mt-1">
        <TabsList>
          <TabsTrigger value="personal" className="data-[state=active]:bg-supperagent data-[state=active]:text-white">Personal Details</TabsTrigger>
          <TabsTrigger value="travel" className="data-[state=active]:bg-supperagent data-[state=active]:text-white">Travel & Immigration</TabsTrigger>
          <TabsTrigger value="education" className="data-[state=active]:bg-supperagent data-[state=active]:text-white">Education</TabsTrigger>
          <TabsTrigger value="work" className="data-[state=active]:bg-supperagent data-[state=active]:text-white">Work Details</TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-supperagent data-[state=active]:text-white">Documents</TabsTrigger>
          <TabsTrigger value="application" className="data-[state=active]:bg-supperagent data-[state=active]:text-white">Application</TabsTrigger>
          <TabsTrigger value="staff" className="data-[state=active]:bg-supperagent data-[state=active]:text-white">Assigned Staffs</TabsTrigger>
          <TabsTrigger value="notes" className="data-[state=active]:bg-supperagent data-[state=active]:text-white">Notes</TabsTrigger>
          <TabsTrigger value="communications" className="data-[state=active]:bg-supperagent data-[state=active]:text-white">Communications</TabsTrigger>
        </TabsList>
        <TabsContent value="personal">
          <PersonalDetailsForm student={student} onSave={handleSave}/>
           <AddressForm student={student} onSave={handleSave}/>
          <PersonalInfoForm student={student} onSave={handleSave}/>
          <EmergencyContacts student={student} onSave={handleSave}/>

        </TabsContent>
        <TabsContent value="travel">
          <TravelImmigrationHistory student={student} onSave={handleSave}/>
          <RefusalHistory student={student} onSave={handleSave} />
        </TabsContent>
        <TabsContent value="education">
          <AcademicRecords student={student} onSave={handleSave}/>
        </TabsContent>
        <TabsContent value="work">
          <WorkExperienceSection student={student} onSave={handleSave}/>
        </TabsContent>
        <TabsContent value="documents">
          <DocumentsSection student={student} onDocumentUpdate={fetchData}/>
        </TabsContent>
        <TabsContent value="application">
          <ApplicationsSection student={student} onSave={handleSave}/>
        </TabsContent>

        {/* Add other tab contents as needed */}
      </Tabs>
    </div>
  )
}

