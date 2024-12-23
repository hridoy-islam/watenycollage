"use client"

import { useState } from "react"
import { ArrowLeft, Printer, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentProfile } from "./components/student-profile"
import { PersonalDetailsForm } from "./components/personal-details-form"
import type { Student } from "@/types/index"

const mockStudent: Student = {
  id: "STD000001",
  title: "Mr",
  firstName: "Mark",
  lastName: "Nemes",
  email: "nemes.mark@yahoo.com",
  phone: "07706457032",
  dateOfBirth: "06-06-1976",
  maritalStatus: "Single",
  gender: "Male",
  nationality: "United Kingdom",
  countryOfResidence: "United Kingdom",
  countryOfBirth: "Hungary",
  nativeLanguage: "Hungarian",
  institution: "Omniscient",
  passportName: "",
  passportIssueLocation: "",
  passportNumber: "",
  address: {
    street: "19A London Road",
    city: "Barking",
    country: "England",
    postalCode: "IG11 8AF"
  }
}

export default function StudentViewPage() {
  const [student, setStudent] = useState<Student>(mockStudent)

  const handleImageUpdate = (url: string) => {
    setStudent({ ...student, profileImage: url })
  }

  const handleSave = (data: Partial<Student>) => {
    setStudent({ ...student, ...data })
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-3">
        <h1 className="text-2xl font-semibold">View Student</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-supperagent border-none hover:bg-supperagent/90">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
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
          <PersonalDetailsForm student={student} onSave={handleSave} />
        </TabsContent>
        {/* Add other tab contents as needed */}
      </Tabs>
    </div>
  )
}

