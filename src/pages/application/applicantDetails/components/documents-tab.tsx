import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const PROOF_TYPE_LABELS: Record<string, string> = {
  bankStatement: 'Bank Statement',
  utilityBill: 'Utility Bill',
  drivingLicense: 'Driving License'
};

type Application = any

interface DocumentsTabProps {
  application: Application
  renderFieldRow: (label: string, value: any, fieldPath: string) => React.ReactNode
}

function isSatisfiedViaProofOfAddress(application: Application, field: string): boolean {
  if (field === 'utilityBills') {
    return (
      (application.proofOfAddress1Type === 'utilityBill' && !!application.proofOfAddress1) ||
      (application.proofOfAddress2Type === 'utilityBill' && !!application.proofOfAddress2)
    );
  }
  if (field === 'bankStatement') {
    return (
      (application.proofOfAddress1Type === 'bankStatement' && !!application.proofOfAddress1) ||
      (application.proofOfAddress2Type === 'bankStatement' && !!application.proofOfAddress2)
    );
  }
  return false;
}

export function DocumentsTab({ application, renderFieldRow }: DocumentsTabProps) {
  const showUtilityBills = !isSatisfiedViaProofOfAddress(application, 'utilityBills');
  const showBankStatement = !isSatisfiedViaProofOfAddress(application, 'bankStatement');

  const renderDocs = (label: string, value: any, fieldPrefix: string) => {
    if (Array.isArray(value)) {
      return value.map((url: string, index: number) =>
        renderFieldRow(label, url, `${fieldPrefix}[${index}]`)
      );
    }
    if (value) {
      return renderFieldRow(label, value, fieldPrefix);
    }
    return null;
  };

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
              {renderFieldRow(
                `Proof of Address 1${application.proofOfAddress1Type ? ` (${PROOF_TYPE_LABELS[application.proofOfAddress1Type] || application.proofOfAddress1Type})` : ''}`,
                application.proofOfAddress1,
                "proofOfAddress1"
              )}
              {renderFieldRow(
                `Proof of Address 2${application.proofOfAddress2Type ? ` (${PROOF_TYPE_LABELS[application.proofOfAddress2Type] || application.proofOfAddress2Type})` : ''}`,
                application.proofOfAddress2,
                "proofOfAddress2"
              )}
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
              {renderDocs("ID Document", application.idDocuments, "idDocuments")}

              {showUtilityBills && renderDocs("Utility Bill", application.utilityBills, "utilityBills")}

              {showBankStatement && renderDocs("Bank Statement", application.bankStatement, "bankStatement")}

              {renderDocs("Proof of NI", application.proofOfNI, "proofOfNI")}

              {renderDocs("Immigration Document", application.immigrationDocument, "immigrationDocument")}
              {renderDocs("Signature", application.signatureUrl, "signatureUrl")}

             
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  )
}
