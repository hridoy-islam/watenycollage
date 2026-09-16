import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ReferenceDeclarationPdf } from "./reference-declaration-pdf";

type Application = any;

interface TermTabProps {
  application: Application;
  applicationJob?: any;
  renderFieldRow: (label: string, value: any, fieldPath: string) => React.ReactNode;
}

export function TermTab({ application, applicationJob, renderFieldRow }: TermTabProps) {
  // Only the name parts that were actually supplied make it into the declaration
  const applicantName = [
    application?.title,
    application?.firstName,
    application?.initial,
    application?.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const refereeDeclarationGiven =
    application?.declarationContactReferee === true ||
    application?.declarationContactReferee === "true";

  const refereeDeclarationMissing =
    application?.declarationContactReferee === undefined ||
    application?.declarationContactReferee === null ||
    application?.declarationContactReferee === "";

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

              {/* Rendered inline rather than via renderFieldRow so the PDF
                  download can sit next to the response */}
              <TableRow className="hover:bg-muted/10">
                <TableCell className="font-medium">
                  I authorize Everycare Romford to contact my referees as part of the recruitment process
                </TableCell>
                <TableCell className="text-left">
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        refereeDeclarationMissing ? "italic text-muted-foreground" : undefined
                      }
                    >
                      {refereeDeclarationMissing
                        ? "Not provided"
                        : refereeDeclarationGiven
                          ? "Yes"
                          : "No"}
                    </span>
                    {refereeDeclarationGiven && (
                      <PDFDownloadLink
                        document={
                          <ReferenceDeclarationPdf
                            name={applicantName}
                            signatureUrl={application?.signatureUrl}
                            date={applicationJob?.createdAt}
                          />
                        }
                        fileName={`declaration-reference-gdpr-${
                          applicantName.replace(/\s+/g, "_") || "applicant"
                        }.pdf`}
                      >
                        {({ loading: pdfLoading }) => (
                          <Button size="sm" variant="outline" disabled={pdfLoading}>
                            <Download className="mr-1 h-3 w-3" />
                            {pdfLoading ? "Preparing..." : "Download PDF"}
                          </Button>
                        )}
                      </PDFDownloadLink>
                    )}
                  </div>
                </TableCell>
                <TableCell className="w-10 text-right" />
              </TableRow>

         
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