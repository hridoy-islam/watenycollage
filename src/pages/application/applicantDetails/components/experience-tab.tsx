import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Application = any

interface ExperienceTabProps {
  application: Application
  renderFieldRow: (label: string, value: any, fieldPath: string) => React.ReactNode
}

export function ExperienceTab({ application, renderFieldRow }: ExperienceTabProps) {
  return (
    <div className="grid grid-cols-1 gap-6 ">
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-lg font-semibold">Experience Details</h3>
          <Table>
            <TableHeader>
              {/* <TableRow>
                <TableHead className="w-1/3 text-left">Field</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="w-10 text-right"></TableHead>
              </TableRow> */}
            </TableHeader>
            <TableBody>
              {renderFieldRow("Life Skills & Interests", application.lifeSkillsAndInterests, "lifeSkillsAndInterests")}
              {renderFieldRow("Relevant Experience", application.relevantExperience, "relevantExperience")}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
