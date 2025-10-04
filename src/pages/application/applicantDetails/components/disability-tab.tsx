import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Application = any

interface DisabilityTabProps {
  application: Application
  renderFieldRow: (label: string, value: any, fieldPath: string) => React.ReactNode
}

export function DisabilityTab({ application, renderFieldRow }: DisabilityTabProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-lg font-semibold">Disability Information</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3 text-left">Field</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="w-10 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderFieldRow("Has Disability", application.hasDisability, "hasDisability")}
              {renderFieldRow("Disability Details", application.disabilityDetails, "disabilityDetails")}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-lg font-semibold">Reasonable Adjustment</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3 text-left">Field</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="w-10 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderFieldRow(
                "Needs Reasonable Adjustment",
                application.needsReasonableAdjustment,
                "needsReasonableAdjustment",
              )}
              {renderFieldRow(
                "Adjustment Details",
                application.reasonableAdjustmentDetails,
                "reasonableAdjustmentDetails",
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
