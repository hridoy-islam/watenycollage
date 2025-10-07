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
  return (
    <div className="grid grid-cols-1 gap-6 ">
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-2 text-lg font-semibold">Current Employment</h3>
          <Table className="mb-6">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3 text-left">Field</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="w-10 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderFieldRow("Currently Employed", application.isEmployed, "isEmployed")}
              {application.isEmployed === "yes" && application.currentEmployment && (
                <>
                  {renderFieldRow("Employer", application.currentEmployment.employer, "currentEmployment.employer")}
                  {renderFieldRow("Job Title", application.currentEmployment.jobTitle, "currentEmployment.jobTitle")}
                  {renderFieldRow("Start Date", application.currentEmployment.startDate, "currentEmployment.startDate")}
                  {renderFieldRow(
                    "Employment Type",
                    application.currentEmployment.employmentType,
                    "currentEmployment.employmentType",
                  )}
                  {renderFieldRow(
                    "Responsibilities",
                    application.currentEmployment.responsibilities,
                    "currentEmployment.responsibilities",
                  )}
                 
                 
                </>
              )}
              {renderFieldRow(
                "Previous Employment History",
                application.hasPreviousEmployment,
                "hasPreviousEmployment",
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {application.hasPreviousEmployment === "yes" &&
        application.previousEmployments &&
        application.previousEmployments.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-2 text-lg font-semibold">Previous Employment</h3>
              <div className="space-y-6">
                {application.previousEmployments.map((employment: any, index: number) => (
                  <div key={index}>
                    <div className="mb-2 flex items-center">
                      <h4 className="font-medium">Previous Employment {index + 1}</h4>
                      <Separator className="mx-4 flex-1" />
                    </div>
                    <Table>
                      <TableBody>
                        {renderFieldRow("Employer", employment.employer, `previousEmployments.${index}.employer`)}
                        {renderFieldRow("Job Title", employment.jobTitle, `previousEmployments.${index}.jobTitle`)}
                        {renderFieldRow("Start Date", employment.startDate, `previousEmployments.${index}.startDate`)}
                        {renderFieldRow("End Date", employment.endDate, `previousEmployments.${index}.endDate`)}
                        {renderFieldRow(
                          "Reason for Leaving",
                          employment.reasonForLeaving,
                          `previousEmployments.${index}.reasonForLeaving`,
                        )}
                        {renderFieldRow(
                          "Responsibilities",
                          employment.responsibilities,
                          `previousEmployments.${index}.responsibilities`,
                        )}
                        {renderFieldRow(
                          "Employment Gaps",
                          employment.hasEmploymentGaps,
                          `previousEmployments.${index}.hasEmploymentGaps`,
                        )}
                        {renderFieldRow(
                          "Gaps Explanation",
                          employment.employmentGapsExplanation,
                          `previousEmployments.${index}.employmentGapsExplanation`,
                        )}
                        
                      </TableBody>
                    </Table>
                  </div>
                ))}

                
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  )
}
