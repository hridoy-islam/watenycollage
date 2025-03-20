"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardFooter } from "@/components/ui/card"
import axiosInstance from "@/lib/axios"
import { toast } from "@/components/ui/use-toast"
import { StudentFilter } from "./components/student-filter"
import { StudentSelection } from "./components/StudentSelection"
import { InvoiceDetails } from "./components/invoice-details"


// Updated Zod schema to include remitTo, paymentInfo, and course details
const invoiceSchema = z.object({
  Status: z.enum(["due", "paid"]),
  remitTo: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    address: z.string().min(1, "Address is required"),
  }),
  paymentInfo: z.object({
    sortCode: z.string().min(1, "Sort code is required"),
    accountNo: z.string().min(1, "Account number is required"),
    beneficiary: z.string().optional(),
  }),
  courseDetails: z.object({
    semester: z.string(),
    year: z.string(),
    session: z.string(),
  }),
})

const filterSchema = z.object({
  term: z.string().optional(),
  course: z.string().optional(),
  institute: z.string().optional(), // Changed from university to institute
  paymentStatus: z.string().optional(),
  searchQuery: z.string().optional(),
  year: z.string().optional(),
  session: z.string().optional(),
})

export default function StudentListPage() {
  const navigate = useNavigate()
  const [selectedStudents, setSelectedStudents] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [courses, setCourses] = useState([])
  const [institutes, setInstitutes] = useState([])
  const [terms, setTerms] = useState([])
  const [years, setYears] = useState([])
  const [sessions, setSessions] = useState([])
  const [courseRelations, setCourseRelations] = useState([])
  const [selectedCourseRelation, setSelectedCourseRelation] = useState(null)

  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [paymentStatuses, setPaymentStatuses] = useState(["paid", "due"])

  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      Status: "due",
      remitTo: {
        name: "",
        email: "",
        address: "",
      },
      paymentInfo: {
        sortCode: "",
        accountNo: "",
        beneficiary: "",
      },
      courseDetails: {
        semester: "",
        year: "",
        session: "",
      },
    },
  })

  const filterForm = useForm<z.infer<typeof filterSchema>>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      term: "",
      course: "",
      institute: "",
      paymentStatus: "",
      year: "",
      session: "",
      searchQuery: "",
    },
  })

  // Fetch course relations
  const fetchCourseRelations = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get("/course-relations?limit=all")
      const courseRelationsData = response?.data?.data?.result || []
      setCourseRelations(courseRelationsData)

      // Extract unique terms, courses, institutes, years, and sessions from course relations
      const uniqueTerms = [...new Set(courseRelationsData.map((cr) => cr.term))]
      const uniqueCourses = [...new Set(courseRelationsData.map((cr) => cr.course))]
      const uniqueInstitutes = [...new Set(courseRelationsData.map((cr) => cr.institute))]

      const uniqueYears = [...new Set(courseRelationsData.flatMap((cr) => cr.years.map((year) => year.year)))]
      const uniqueSessions = [
        ...new Set(
          courseRelationsData.flatMap((cr) =>
            cr.years.flatMap((year) => year.sessions.map((session) => session.sessionName)),
          ),
        ),
      ]

      setTerms(uniqueTerms.map((term) => ({ _id: term._id, name: term.term })))
      setCourses(uniqueCourses.map((course) => ({ _id: course._id, name: course.name })))
      setInstitutes(
        uniqueInstitutes.map((institute) => ({
          _id: institute._id,
          name: institute.name,
        })),
      )
      setYears(uniqueYears) // Set the unique years
      setSessions(uniqueSessions) // Set the unique session names
    } catch (error) {
      console.error("Error fetching course relations:", error)
      toast({
        title: "Error",
        description: "Failed to fetch course relations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async (filters: z.infer<typeof filterSchema>) => {
    try {
      setLoading(true);
  
      const { term, course, institute, paymentStatus, year, session } = filters;
  
      console.log("Filters:", { term, course, institute }); // Log the filters
  
      // Find matching course relation based on filters
      let courseRelationId = null;
      if (term && course && institute) {
        const matchingRelation = courseRelations.find(
          (cr) => cr.term._id === term && cr.course._id === course && cr.institute._id === institute,
        );
  
        if (!matchingRelation) {
          console.warn("No matching course relation found for filters:", { term, course, institute });
        } else {
          courseRelationId = matchingRelation._id;
          setSelectedCourseRelation(matchingRelation);
          updateFormWithCourseDetails(matchingRelation, year, session);
        }
      }
  
      console.log("Course Relation ID:", courseRelationId); // Log the course relation ID
  
      // Prepare API request parameters
      const params = {
        paymentStatus,
        ...(year ? { year } : {}),
        ...(session ? { session } : {}),
      };
  
      if (courseRelationId) {
        params.applicationCourse = courseRelationId;
      }
  
      console.log("API Request Params:", params); // Log the API request parameters
  
      // Fetch students from the API
      const response = await axiosInstance.get("/students", { params });
      const studentsData = response?.data?.data.result || [];
  
      console.log("Raw Students Data from API:", studentsData); // Log the raw data returned by the API
  
      const filteredStudentsData = studentsData.filter((student) => {
        if (!student.accounts || student.accounts.length === 0) {
          console.warn("Student has no accounts:", student._id);
          return false; // Exclude the student if no accounts are available
        }
  
        const matchingAccount = student.accounts.find((account) => {
          return account.courseRelationId?._id === courseRelationId; // Match courseRelationId safely
        });
  
        if (!matchingAccount) {
          console.warn("No matching account found for student:", student._id);
          return false; 
        }
  
        console.log("Matching Account for Student:", student._id, matchingAccount); 
  
        // If a matching account is found, check if the year matches
        const matchingYear = matchingAccount.years.find((y) => y.year === year);
        if (!matchingYear) {
          console.warn("No matching year found for student:", student._id);
          return false; 
        }
  
        console.log("Matching Year for Student:", student._id, matchingYear); 
  
        return true; 
      });
  
      console.log("Filtered Students Data:", filteredStudentsData); 
  
      setStudents(filteredStudentsData);
      setFilteredStudents(filteredStudentsData);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormWithCourseDetails = (courseRelation, selectedYear = null, selectedSession = null) => {
    if (!courseRelation) return


    form.setValue("courseDetails.semester", courseRelation.term.term)

    const yearToUse =
      selectedYear || (courseRelation.years && courseRelation.years.length > 0 ? courseRelation.years[0].year : "")
    form.setValue("courseDetails.year", yearToUse)


    const yearObj = courseRelation.years.find((y) => y.year === yearToUse)

    const sessionToUse =
      selectedSession ||
      (yearObj && yearObj.sessions && yearObj.sessions.length > 0 ? yearObj.sessions[0].sessionName : "")
    form.setValue("courseDetails.session", sessionToUse)

    form.setValue("Status", "due")
  }

  const onFilterSubmit = (data) => {
    fetchStudents(data)
  }

  // Update filter form when year or session is selected
  const handleYearChange = (value) => {
    filterForm.setValue("year", value)

    // If we have a selected course relation, update the available sessions for this year
    if (selectedCourseRelation) {
      const yearObj = selectedCourseRelation.years.find((y) => y.year === value)
      if (yearObj && yearObj.sessions) {
        const yearSessions = yearObj.sessions.map((s) => s.sessionName)
        setSessions(yearSessions)

        // Reset session if the current one isn't available for this year
        const currentSession = filterForm.getValues("session")
        if (currentSession && !yearSessions.includes(currentSession)) {
          filterForm.setValue("session", "")
        }
      }
    }
  }

  const handleSessionChange = (value) => {
    filterForm.setValue("session", value)
  }

  const handleAddStudent = (student) => {
    // Check if student is already in the selected list
    const isAlreadySelected = selectedStudents.some((s) => s._id === student._id)

    if (!isAlreadySelected) {
      // Get the current filter values
      const filterValues = filterForm.getValues()

      // Add sessionFee property and courseRelationId for grouping
      const studentWithFee = {
        ...student,
        sessionFee: Math.floor(Math.random() * 500) + 500, // Random fee between 500-1000 for demo
        selected: true,
        courseRelationId: selectedCourseRelation?._id,
        year: filterValues.year,
        session: filterValues.session,
      }

      setSelectedStudents((prev) => [...prev, studentWithFee])

      // Update form values based on the selected course relation and filter values
      if (selectedCourseRelation) {
        updateFormWithCourseDetails(selectedCourseRelation, filterValues.year, filterValues.session)
      }
    } else {
      toast({
        title: "Student already added",
        description: "This student is already in your selection.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    // Fetch course relations and other initial data
    fetchCourseRelations()

    setPaymentStatuses(["paid", "due"])
  }, [])

  useEffect(() => {
    // Initialize selectedStudents with an empty array
    setSelectedStudents([])
  }, [])

  useEffect(() => {
    // Calculate total amount whenever selected students change
    const total = selectedStudents
      .filter((student) => student.selected)
      .reduce((sum, student) => sum + (student.sessionFee || 0), 0)
    setTotalAmount(total)

    // Update form's total amount
    form.setValue("totalAmount", total)
  }, [selectedStudents, form])

  const handleStudentSelect = (studentId) => {
    setSelectedStudents((prev) =>
      prev.map((student) => (student._id === studentId ? { ...student, selected: !student.selected } : student)),
    )
  }

  const handleRemoveStudent = (studentId) => {
    setSelectedStudents((prev) => prev.filter((student) => student._id !== studentId))
  }

  const onSubmit = (data: z.infer<typeof invoiceSchema>) => {
    const selectedStudentsWithRelation = selectedStudents.filter((student) => student.selected)

    if (selectedStudentsWithRelation.length === 0) {
      alert("No students selected.")
      return
    }

    const courseRelationId = selectedStudentsWithRelation[0].courseRelationId

    const invoiceData = {
      ...data,
      noOfStudents: selectedStudentsWithRelation.length,
      courseRelationId,
      totalAmount,
    }

    console.log("Invoice data:", invoiceData)

    alert("Invoice generated successfully!")
    navigate("/admin/invoice")
  }

  return (
    <div className="py-1">
      <h1 className="mb-6 text-2xl font-bold">Generate Invoice</h1>

      <div className="grid gap-6">
        <Card>
          {/* Invoice Details Component */}
          <InvoiceDetails form={form} />

          {/* Student Filter Component */}
          <StudentFilter
            filterForm={filterForm}
            terms={terms}
            courses={courses}
            institutes={institutes}
            years={years}
            sessions={sessions}
            paymentStatuses={paymentStatuses}
            onFilterSubmit={onFilterSubmit}
            handleYearChange={handleYearChange}
            handleSessionChange={handleSessionChange}
          />

          {/* Student Selection Component */}
          <StudentSelection
            filteredStudents={filteredStudents}
            selectedStudents={selectedStudents}
            loading={loading}
            handleAddStudent={handleAddStudent}
            handleStudentSelect={handleStudentSelect}
            handleRemoveStudent={handleRemoveStudent}
          />

          <CardFooter className="flex justify-between p-4">
            <div className="text-lg font-semibold">
              Total Amount: <span className="text-xl">${totalAmount.toFixed(2)}</span>
            </div>
            <Button
              type="submit"
              form="invoice-form"
              className="bg-supperagent text-white hover:bg-supperagent"
              disabled={selectedStudents.filter((s) => s.selected).length === 0}
              onClick={form.handleSubmit(onSubmit)}
            >
              Generate Invoice
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

