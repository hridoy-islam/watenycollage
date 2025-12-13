import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Application = any

interface ReferenceTabProps {
  application: Application
  renderFieldRow: (label: string, value: any, fieldPath: string) => React.ReactNode
}

// Configuration for fields to ensure consistency across all tables
const REFERENCE_FIELDS = [
  { label: "Name", key: "name" },
  { label: "Position", key: "position" },
  { label: "Relationship", key: "relationship" },
  { label: "Organisation", key: "organisation" },
  { label: "Address", key: "address" },
  { label: "Phone", key: "tel" },
  { label: "Fax", key: "fax" },
  { label: "Email", key: "email" },
]

export function ReferenceTab({ application, renderFieldRow }: ReferenceTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ReferenceSection
        title="Professional Reference 1"
        data={application.professionalReferee1}
        pathPrefix="professionalReferee1"
        renderFieldRow={renderFieldRow}
      />

      <ReferenceSection
        title="Professional Reference 2"
        data={application.professionalReferee2}
        pathPrefix="professionalReferee2"
        renderFieldRow={renderFieldRow}
      />

      <ReferenceSection
        title="Personal Reference"
        data={application.personalReferee}
        pathPrefix="personalReferee"
        renderFieldRow={renderFieldRow}
      />
    </div>
  )
}

// ----------------------------------------------------------------------
// Reusable Sub-component
// ----------------------------------------------------------------------

interface ReferenceSectionProps {
  title: string
  data: any // The specific referee object (e.g., application.professionalReferee1)
  pathPrefix: string // The string path (e.g., "professionalReferee1")
  renderFieldRow: (label: string, value: any, fieldPath: string) => React.ReactNode
}

function ReferenceSection({ title, data, pathPrefix, renderFieldRow }: ReferenceSectionProps) {
  // If the specific referee data doesn't exist, do not render the Card
  if (!data) return null

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="mb-4 text-lg font-semibold">{title}</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3 text-left">Field</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="w-10 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {REFERENCE_FIELDS.map((field) =>
              renderFieldRow(
                field.label,
                data[field.key],
                `${pathPrefix}.${field.key}`
              )
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}