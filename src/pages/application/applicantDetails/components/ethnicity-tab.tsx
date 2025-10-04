import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Application = any

interface EthnicityTabProps {
  application: Application
  renderFieldRow: (label: string, value: any, fieldPath: string) => React.ReactNode
}

export function EthnicityTab({ application, renderFieldRow }: EthnicityTabProps) {
  return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

    <Card>
      <CardContent className="pt-6">
        <h3 className="mb-4 text-lg font-semibold">Ethnicity Information</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3 text-left">Field</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="w-10 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderFieldRow("Ethnicity Group", application.ethnicityGroup, "ethnicityGroup")}
            {renderFieldRow("Ethnicity Value", application.ethnicityValue, "ethnicityValue")}
            {renderFieldRow("Other Ethnicity", application.ethnicityOther, "ethnicityOther")}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </div>
  )
}
