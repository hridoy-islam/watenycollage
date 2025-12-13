import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Application = any

interface NextOfKinTabProps {
  application: Application
  renderFieldRow: (label: string, value: any, fieldPath: string) => React.ReactNode
}

export function NextOfKinTab({ application, renderFieldRow }: NextOfKinTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* Left Column */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-lg font-semibold">Emergency Contact / Next of Kin</h3>
          <Table>
            <TableHeader>
              {/* <TableRow>
                <TableHead className="w-1/3 text-left">Field</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="w-10 text-right"></TableHead>
              </TableRow> */}
            </TableHeader>
            <TableBody>
              {renderFieldRow("Full Name", application.emergencyFullName, "emergencyFullName")}
              {renderFieldRow("Relationship", application.emergencyRelationship, "emergencyRelationship")}
              {renderFieldRow("Contact Number", application.emergencyContactNumber, "emergencyContactNumber")}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Right Column */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-lg font-semibold">Emergency Contact / Next of Kin (cont.)</h3>
          <Table>
            <TableHeader>
              {/* <TableRow>
                <TableHead className="w-1/3 text-left">Field</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="w-10 text-right"></TableHead>
              </TableRow> */}
            </TableHeader>
            <TableBody>
              {renderFieldRow("Email", application.emergencyEmail, "emergencyEmail")}
              {renderFieldRow("Address", application.emergencyAddress, "emergencyAddress")}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  )
}
