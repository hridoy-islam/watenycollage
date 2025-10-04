import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Application = any

interface ReferenceTabProps {
  application: Application
  renderFieldRow: (label: string, value: any, fieldPath: string) => React.ReactNode
}

export function ReferenceTab({ application, renderFieldRow }: ReferenceTabProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {application.professionalReferee1 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-lg font-semibold">Professional Reference 1</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3 text-left">Field</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="w-10 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderFieldRow("Name", application.professionalReferee1.name, "professionalReferee1.name")}
                {renderFieldRow("Position", application.professionalReferee1.position, "professionalReferee1.position")}
                {renderFieldRow(
                  "Relationship",
                  application.professionalReferee1.relationship,
                  "professionalReferee1.relationship",
                )}
                {renderFieldRow(
                  "Organisation",
                  application.professionalReferee1.organisation,
                  "professionalReferee1.organisation",
                )}
                {renderFieldRow("Address", application.professionalReferee1.address, "professionalReferee1.address")}
                {renderFieldRow("Phone", application.professionalReferee1.tel, "professionalReferee1.tel")}
                {renderFieldRow("Fax", application.professionalReferee1.fax, "professionalReferee1.fax")}
                {renderFieldRow("Email", application.professionalReferee1.email, "professionalReferee1.email")}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {application.professionalReferee2 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-lg font-semibold">Professional Reference 2</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3 text-left">Field</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="w-10 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderFieldRow("Name", application.professionalReferee2.name, "professionalReferee2.name")}
                {renderFieldRow("Position", application.professionalReferee2.position, "professionalReferee2.position")}
                {renderFieldRow(
                  "Relationship",
                  application.professionalReferee2.relationship,
                  "professionalReferee2.relationship",
                )}
                {renderFieldRow(
                  "Organisation",
                  application.professionalReferee2.organisation,
                  "professionalReferee2.organisation",
                )}
                {renderFieldRow("Address", application.professionalReferee2.address, "professionalReferee2.address")}
                {renderFieldRow("Phone", application.professionalReferee2.tel, "professionalReferee2.tel")}
                {renderFieldRow("Fax", application.professionalReferee2.fax, "professionalReferee2.fax")}
                {renderFieldRow("Email", application.professionalReferee2.email, "professionalReferee2.email")}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {application.personalReferee && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-lg font-semibold">Personal Reference</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3 text-left">Field</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="w-10 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderFieldRow("Name", application.personalReferee.name, "personalReferee.name")}
                {renderFieldRow("Position", application.personalReferee.position, "personalReferee.position")}
                {renderFieldRow(
                  "Relationship",
                  application.personalReferee.relationship,
                  "personalReferee.relationship",
                )}
                {renderFieldRow(
                  "Organisation",
                  application.personalReferee.organisation,
                  "personalReferee.organisation",
                )}
                {renderFieldRow("Address", application.personalReferee.address, "personalReferee.address")}
                {renderFieldRow("Phone", application.personalReferee.tel, "personalReferee.tel")}
                {renderFieldRow("Fax", application.personalReferee.fax, "personalReferee.fax")}
                {renderFieldRow("Email", application.personalReferee.email, "personalReferee.email")}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
