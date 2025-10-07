import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"

type Application = any

interface TrainingTabProps {
  application: Application
  renderFieldRow: (label: string, value: any, fieldPath: string) => React.ReactNode
}

export function TrainingTab({ application, renderFieldRow }: TrainingTabProps) {
  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">Training History</h3>
      {!application.trainingData || application.trainingData.length === 0 ? (
        <p className="italic text-muted-foreground">No training history provided</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 ">
          {application.trainingData.map((training: any, index: number) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="mb-2 flex items-center">
                  <h4 className="font-medium">Training {index + 1}</h4>
                  <Separator className="mx-4 flex-1" />
                </div>
                <Table>
                  <TableBody>
                    {renderFieldRow("Training Name", training.trainingName, `trainingData.${index}.trainingName`)}
                    {renderFieldRow("Awarding Body", training.awardingBody, `trainingData.${index}.awardingBody`)}
                    {renderFieldRow("Completion Date", training.completionDate, `trainingData.${index}.completionDate`)}
                    {renderFieldRow("Certificate", training.certificate, `trainingData.${index}.certificate`)}
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
