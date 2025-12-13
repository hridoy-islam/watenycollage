import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"

type Application = any

interface EducationTabProps {
  application: Application
  renderFieldRow: (label: string, value: any, fieldPath: string) => React.ReactNode
}

export function EducationTab({ application, renderFieldRow }: EducationTabProps) {
  const { educationData } = application

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">Education History</h3>

      {!educationData || educationData.length === 0 ? (
        <p className="italic text-muted-foreground">No education history provided</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {educationData.map((education: any, index: number) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="mb-2 flex items-center">
                  <h4 className="font-medium">Education {index + 1}</h4>
                  <Separator className="mx-4 flex-1" />
                </div>

                <Table>
                  <TableBody>
                    {renderFieldRow(
                      "Institution",
                      education.institution,
                      `educationData.${index}.institution`
                    )}
                    {renderFieldRow(
                      "Qualification",
                      education.qualification,
                      `educationData.${index}.qualification`
                    )}
                    {renderFieldRow(
                      "Award Date",
                      education.awardDate,
                      `educationData.${index}.awardDate`
                    )}
                    {renderFieldRow(
                      "Grade",
                      education.grade,
                      `educationData.${index}.grade`
                    )}
                    {renderFieldRow(
                      "Certificate",
                      education.certificate,
                      `educationData.${index}.certificate`
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
