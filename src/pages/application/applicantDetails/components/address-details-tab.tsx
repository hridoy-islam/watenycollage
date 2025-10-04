import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Application = any

interface AddressDetailsTabProps {
  application: Application
  renderFieldRow: (label: string, value: any, fieldPath: string) => React.ReactNode
}

export function AddressDetailsTab({ application, renderFieldRow }: AddressDetailsTabProps) {
  return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

    <Card>
      <CardContent className="pt-6">
        <h3 className="mb-4 text-lg font-semibold">Postal Address</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3 text-left">Field</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="w-10 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderFieldRow("Address Line 1", application.postalAddressLine1, "postalAddressLine1")}
            {renderFieldRow("Address Line 2", application.postalAddressLine2, "postalAddressLine2")}
            {renderFieldRow("City", application.postalCity, "postalCity")}
            {renderFieldRow("Post Code", application.postalPostCode, "postalPostCode")}
            {renderFieldRow("Country", application.postalCountry, "postalCountry")}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </div>
  )
}
