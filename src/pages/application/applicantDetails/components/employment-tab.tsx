import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"

type Application = any

interface EmploymentTabProps {
  application: Application
  renderFieldRow: (label: string, value: any, fieldPath: string) => React.ReactNode
}

export function EmploymentTab({ application, renderFieldRow }: EmploymentTabProps) {
  // Build unified employment list
  const allEmployments: Array<{
    label: string
    data: any
    prefix: string
  }> = []

  // Add current employment as Employment 1 if employed
  if (application.isEmployed === "yes" && application.currentEmployment) {
    allEmployments.push({
      label: "Employment 1 (Current)",
      data: application.currentEmployment,
      prefix: "currentEmployment",
    })
  }

  // Add previous employments
  if (
    application.hasPreviousEmployment === "yes" &&
    application.previousEmployments &&
    application.previousEmployments.length > 0
  ) {
    application.previousEmployments.forEach((employment: any, index: number) => {
      const employmentNumber = allEmployments.length + 1
      allEmployments.push({
        label: `Employment ${employmentNumber}`,
        data: employment,
        prefix: `previousEmployments.${index}`,
      })
    })
  }

  // Helper function to format month as two-digit string (01-12)
  const formatMonth = (date: Date | null): string => {
    if (!date) return ''
    const month = date.getMonth() + 1 // getMonth() returns 0-11
    return month.toString().padStart(2, '0')
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardContent className="pt-6">
          {/* Summary Fields */}
          <Table className="mb-6">
            <TableBody>
              {renderFieldRow("Currently Employed", application.isEmployed, "isEmployed")}
              {renderFieldRow(
                "Previous Employment History",
                application.hasPreviousEmployment,
                "hasPreviousEmployment",
              )}
            </TableBody>
          </Table>

          {/* Employment History Section */}
          {allEmployments.length > 0 ? (
            <div>
              <h3 className="mb-4 text-lg font-semibold">Employment History</h3>
              <Table className="border">
                <TableHeader>
                  <TableRow>
                    <TableHead colSpan={4} className="text-center border">Date</TableHead>
                    <TableHead rowSpan={3} className="text-center border align-middle">Employers Name & Address</TableHead>
                    <TableHead rowSpan={3} className="text-center border align-middle">Department/Position & Duties</TableHead>
                    <TableHead rowSpan={3} className="text-center border align-middle">Reason For Leaving</TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead colSpan={2} className="text-center border">From</TableHead>
                    <TableHead colSpan={2} className="text-center border">To</TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="border">Month</TableHead>
                    <TableHead className="border">Year</TableHead>
                    <TableHead className="border">Month</TableHead>
                    <TableHead className="border">Year</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allEmployments.map((employment, index) => {
                    const startDate = employment.data.startDate ? new Date(employment.data.startDate) : null
                    const endDate = employment.data.endDate ? new Date(employment.data.endDate) : null
                    const startMonth = formatMonth(startDate)
                    const startYear = startDate ? startDate.getFullYear() : ''

                    return (
                      <TableRow key={index}>
                        <TableCell className="border">{startMonth}</TableCell>
                        <TableCell className="border">{startYear}</TableCell>
                        {endDate ? (
                          <>
                            <TableCell className="border">{formatMonth(endDate)}</TableCell>
                            <TableCell className="border">{endDate.getFullYear()}</TableCell>
                          </>
                        ) : (
                          <TableCell colSpan={2} className="border">Still Working</TableCell>
                        )}
                        <TableCell className="border">{employment.data.employer || ''}</TableCell>
                        <TableCell className="border">
                          {[employment.data.jobTitle, employment.data.responsibilities].filter(Boolean).join(' - ')}
                        </TableCell>
                        <TableCell className="border">{employment.data.reasonForLeaving || ''}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No employment history available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}