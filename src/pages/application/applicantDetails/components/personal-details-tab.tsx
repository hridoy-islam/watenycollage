import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Application = any

interface PersonalDetailsTabProps {
  application: Application
  renderFieldRow: (label: string, value: any, fieldPath: string) => React.ReactNode
}

export function PersonalDetailsTab({ application, renderFieldRow }: PersonalDetailsTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Left Column */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-lg font-semibold">Personal Information</h3>
          <Table>
            <TableHeader>
              {/* <TableRow>
                <TableHead className="w-1/3 text-left">Field</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="w-10 text-right"></TableHead>
              </TableRow> */}
            </TableHeader>
            <TableBody>
              {renderFieldRow("Title", application.title, "title")}
              {renderFieldRow("First Name", application.firstName, "firstName")}
              {renderFieldRow("Last Name", application.lastName, "lastName")}
              {renderFieldRow("Other Name", application.otherName, "otherName")}
              {renderFieldRow("Initial", application.initial, "initial")}
              {renderFieldRow("Email", application.email, "email")}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Right Column */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-lg font-semibold">Additional Details</h3>
          <Table>
            <TableHeader>
              {/* <TableRow>
                <TableHead className="w-1/3 text-left">Field</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="w-10 text-right"></TableHead>
              </TableRow> */}
            </TableHeader>
            <TableBody>
              {renderFieldRow("Date of Birth", application.dateOfBirth, "dateOfBirth")}
              {renderFieldRow("Nationality", application.nationality, "nationality")}
              {renderFieldRow("Country of Residence", application.countryOfResidence, "countryOfResidence")}
              {renderFieldRow("Share Code", application.shareCode, "shareCode")}
              {renderFieldRow(
                "National Insurance Number",
                application.nationalInsuranceNumber,
                "nationalInsuranceNumber"
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  )
}
