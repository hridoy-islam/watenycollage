"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import RegistrationForm from "./registration-form"
import LoginForm from "./login-form"
import StudentApplication from "@/pages/studentApplication"
import { MoveLeft } from "lucide-react"

interface ApplicationFormProps {
  formData: {
    studentType: string
    termName: string
    courseName: string
    courseId: string
  }
  onBack: () => void
}

export default function ApplicationForm({ formData, onBack }: ApplicationFormProps) {
  const [showStudentApplication, setShowStudentApplication] = useState(false)
  const [showRegisterDialog, setShowRegisterDialog] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)

  // Format student type for display
  const getFormattedStudentType = (type: string) => {
    return type === "international" ? "International Student" : type === "eu" ? "European Union Student" : type
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
      {/* {!showStudentApplication && (
        <div className="absolute right-4 top-4">
          <Button variant="outline" onClick={onBack} className="bg-watney text-white hover:bg-watney/90">
            Back to Course Selection
          </Button>
        </div>
      )} */}

      <div className="-mt-4 w-full space-y-8">
        {showStudentApplication ? (
          <StudentApplication />
        ) : (
          <>
            {/* Course Details */}
            <Card className="border border-gray-200 shadow-md">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>Selected Course Details</CardTitle>
                  <CardDescription>
                    Please verify your course selection before proceeding
                  </CardDescription>
                </div>

                {!showStudentApplication && (
                  <Button
                    variant="outline"
                    onClick={onBack}
                    className="bg-watney text-white hover:bg-watney/90 h-8"
                  >
                    <MoveLeft/>Back
                  </Button>
                )}
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
                      <TableCell>
                        {formData.termName || 'Not selected'}
                      </TableCell>
                      <TableCell>
                        {getFormattedStudentType(formData.studentType) ||
                          'Not selected'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Login and Register Section - Side by Side */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Login Section - Left Side */}
              <Card className="border border-gray-200 shadow-md">
                <CardHeader className="bg-watney text-white">
                  <CardTitle>Login</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <LoginForm
                    onSuccess={() => setShowStudentApplication(true)}
                  />
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
                    username and Password as you will need these to log back in
                    to your application.
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
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
