import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Application = any

interface DocumentsTabProps {
  application: Application
  renderFieldRow: (label: string, value: any, fieldPath: string) => React.ReactNode
}

export function DocumentsTab({ application, renderFieldRow }: DocumentsTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* LEFT COLUMN */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-lg font-semibold">Documents</h3>

          <Table>
            <TableHeader>
              {/* <TableRow>
                <TableHead className="w-1/3 text-left">Document Type</TableHead>
                <TableHead className="text-right">Files</TableHead>
                <TableHead className="w-10 text-right"></TableHead>
              </TableRow> */}
            </TableHeader>

            <TableBody>
              {renderFieldRow("CV / Resume", application.cvResume, "cvResume")}
              {renderFieldRow("Proof of Address 1", application.proofOfAddress1, "proofOfAddress1")}
              {renderFieldRow("Proof of Address 2", application.proofOfAddress2, "proofOfAddress2")}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* RIGHT COLUMN */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-lg font-semibold">Additional Documents</h3>

          <Table>
            <TableHeader>
              {/* <TableRow>
                <TableHead className="w-1/3 text-left">Document Type</TableHead>
                <TableHead className="text-right">Files</TableHead>
                <TableHead className="w-10 text-right"></TableHead>
              </TableRow> */}
            </TableHeader>

            <TableBody>
              {application.idDocuments?.map((url: string, index: number) =>
                renderFieldRow("ID Document", url, `idDocuments[${index}]`)
              )}

              {application.utilityBills?.map((url: string, index: number) =>
                renderFieldRow("Utility Bill", url, `utilityBills[${index}]`)
              )}

              {application.bankStatement?.map((url: string, index: number) =>
                renderFieldRow("Bank Statement", url, `bankStatement[${index}]`)
              )}

              {application.proofOfNI?.map((url: string, index: number) =>
                renderFieldRow("Proof of NI", url, `proofOfNI[${index}]`)
              )}

              {application.immigrationDocument?.map((url: string, index: number) =>
                renderFieldRow("Immigration Document", url, `immigrationDocument[${index}]`)
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  )
}
