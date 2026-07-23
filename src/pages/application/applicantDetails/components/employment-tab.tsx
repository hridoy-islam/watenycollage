import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
              <div className="space-y-6">
                {allEmployments.map((employment, index) => (
                  <div key={index}>
                    <div className="mb-2 flex items-center">
                      <h4 className="font-medium">{employment.label}</h4>
                      <Separator className="mx-4 flex-1" />
                    </div>
                    <Table>
                      <TableBody>
                        {renderFieldRow("Employer", employment.data.employer, `${employment.prefix}.employer`)}
                        {renderFieldRow("Job Title", employment.data.jobTitle, `${employment.prefix}.jobTitle`)}
                        {renderFieldRow("Start Date", employment.data.startDate, `${employment.prefix}.startDate`)}
                        {employment.data.endDate && 
                          renderFieldRow("End Date", employment.data.endDate, `${employment.prefix}.endDate`)}
                        {employment.data.employmentType &&
                          renderFieldRow(
                            "Employment Type",
                            employment.data.employmentType,
                            `${employment.prefix}.employmentType`,
                          )}
                        {employment.data.reasonForLeaving &&
                          renderFieldRow(
                            "Reason for Leaving",
                            employment.data.reasonForLeaving,
                            `${employment.prefix}.reasonForLeaving`,
                          )}
                        {renderFieldRow(
                          "Responsibilities",
                          employment.data.responsibilities,
                          `${employment.prefix}.responsibilities`,
                        )}
                        {employment.data.hasEmploymentGaps !== undefined &&
                          renderFieldRow(
                            "Employment Gaps",
                            employment.data.hasEmploymentGaps,
                            `${employment.prefix}.hasEmploymentGaps`,
                          )}
                        {employment.data.employmentGapsExplanation &&
                          renderFieldRow(
                            "Gaps Explanation",
                            employment.data.employmentGapsExplanation,
                            `${employment.prefix}.employmentGapsExplanation`,
                          )}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
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