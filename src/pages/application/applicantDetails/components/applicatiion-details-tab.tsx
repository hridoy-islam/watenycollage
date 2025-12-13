import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Application = any

interface ApplicationDetailsTabProps {
  application: Application
  renderFieldRow: (label: string, value: any, fieldPath: string) => React.ReactNode
}

export function ApplicationDetailsTab({ application, renderFieldRow }: ApplicationDetailsTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Left Column */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-lg font-semibold">Application Information</h3>
          <Table>
            <TableHeader>
              {/* <TableRow>
                <TableHead className="w-1/3 text-left">Field</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="w-10 text-right"></TableHead>
              </TableRow> */}
            </TableHeader>

            <TableBody>
              {renderFieldRow("Available From", application.availableFromDate, "availableFromDate")}
              {renderFieldRow("Source", application.source, "source")}

              {application.source === "referral" &&
                renderFieldRow("Referral Employee", application.referralEmployee, "referralEmployee")}

              {renderFieldRow("Is Student", application.isStudent, "isStudent")}
              {renderFieldRow("Under State Pension Age", application.isUnderStatePensionAge, "isUnderStatePensionAge")}
              {renderFieldRow("Over 18", application.isOver18, "isOver18")}
              {renderFieldRow(
                "Subject to Immigration Control",
                application.isSubjectToImmigrationControl,
                "isSubjectToImmigrationControl"
              )}
              {renderFieldRow("Can Work in UK", application.canWorkInUK, "canWorkInUK")}
              {renderFieldRow(
                "Competent in Other Language",
                application.competentInOtherLanguage,
                "competentInOtherLanguage"
              )}
              {renderFieldRow("Other Languages", application.otherLanguages?.join(", "), "otherLanguages")}
              {renderFieldRow("Driving License", application.drivingLicense, "drivingLicense")}
              {renderFieldRow("License Number", application.licenseNumber, "licenseNumber")}
              {renderFieldRow("Car Owner", application.carOwner, "carOwner")}
              {renderFieldRow("Travel Areas", application.travelAreas, "travelAreas")}
              {renderFieldRow("Solely for Everycare", application.solelyForEverycare, "solelyForEverycare")}
              {renderFieldRow("Other Employers", application.otherEmployers, "otherEmployers")}
              {renderFieldRow("Professional Body", application.professionalBody, "professionalBody")}
              {renderFieldRow(
                "Professional Body Details",
                application.professionalBodyDetails,
                "professionalBodyDetails"
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Right Column */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-lg font-semibold">Weekly Availability</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Day</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="w-10 text-right"></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {application.availability &&
                Object.entries(application.availability).map(([day, isAvailable]) =>
                  renderFieldRow(
                    day.charAt(0).toUpperCase() + day.slice(1),
                    isAvailable,
                    `availability.${day}`
                  )
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  )
}
