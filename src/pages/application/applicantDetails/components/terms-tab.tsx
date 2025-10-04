import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Application = any;

interface TermTabProps {
  application: Application;
  renderFieldRow: (label: string, value: any, fieldPath: string) => React.ReactNode;
}

export function TermTab({ application, renderFieldRow }: TermTabProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-lg font-semibold">Consent & Declarations</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3 text-left">Declaration</TableHead>
                <TableHead className="text-right">Response</TableHead>
                <TableHead className="w-10 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Core Declarations */}
              {renderFieldRow(
                "I confirm all uploaded documents and information are correct and authentic",
                application.declarationCorrectUpload,
                "declarationCorrectUpload"
              )}

              {renderFieldRow(
                "I authorize Everycare Romford to contact my referees as part of the recruitment process",
                application.declarationContactReferee,
                "declarationContactReferee"
              )}

         
              {renderFieldRow(
                "I have previously applied to this organisation",
                application.appliedBefore,
                "appliedBefore"
              )}

              {/* Disciplinary & Abuse Investigations */}
              {renderFieldRow(
                "I have been subject to a disciplinary investigation by an employer",
                application.disciplinaryInvestigation,
                "disciplinaryInvestigation"
              )}

              {application.disciplinaryInvestigation && renderFieldRow(
                "Disciplinary investigation details",
                application.disciplinaryInvestigationDetails,
                "disciplinaryInvestigationDetails"
              )}

              {renderFieldRow(
                "I have been involved in an investigation regarding abuse or inappropriate behaviour",
                application.abuseInvestigation,
                "abuseInvestigation"
              )}

              {application.abuseInvestigation && renderFieldRow(
                "Abuse investigation details",
                application.abuseInvestigationDetails,
                "abuseInvestigationDetails"
              )}

              {/* ROA Declaration */}
              {renderFieldRow(
                "I have received a caution, conviction, or have pending prosecutions (Rehabilitation of Offenders Act 1974)",
                application.roaDeclaration,
                "roaDeclaration"
              )}

              {application.roaDeclaration && renderFieldRow(
                "Details of offences (type, number, dates)",
                application.roaDeclarationDetails,
                "roaDeclarationDetails"
              )}

              {/* Consents */}
              {renderFieldRow(
                "I accept the terms and conditions of this application",
                application.termsAccepted,
                "termsAccepted"
              )}

              {renderFieldRow(
                "I consent to the processing of my personal data under UK GDPR and the Data Protection Act 2018",
                application.dataProcessingAccepted,
                "dataProcessingAccepted"
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}