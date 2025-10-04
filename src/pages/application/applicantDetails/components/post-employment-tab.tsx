import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface PostEmploymentTabProps {
  application: any;
  renderFieldRow: (label: string, value: any, fieldPath: string) => React.ReactNode;
}

export function PostEmploymentTab({ application, renderFieldRow }: PostEmploymentTabProps) {
  return (
    <Tabs defaultValue="personalRole" className="space-y-4">
      {/* Tab Headers */}
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <TabsTrigger value="personalRole">Personal & Role</TabsTrigger>
        <TabsTrigger value="medicalRestriction">Medical Work Restriction</TabsTrigger>
        <TabsTrigger value="medicalConditions">Medical Conditions</TabsTrigger>
        <TabsTrigger value="additionalHealth">Additional Health Info</TabsTrigger>
        <TabsTrigger value="vaccination">Vaccination History</TabsTrigger>
        <TabsTrigger value="declarations">Declarations & Consent</TabsTrigger>
      </TabsList>

      {/* Personal & Role */}
      <TabsContent value="personalRole">
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-lg font-semibold">Personal & Role</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3 text-left">Field</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="w-10 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderFieldRow("Sex", application.sex, "sex")}
                {renderFieldRow("Job Role", application.jobRole, "jobRole")}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Medical Work Restriction */}
      <TabsContent value="medicalRestriction">
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-lg font-semibold">Medical Work Restriction</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3 text-left">Field</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="w-10 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderFieldRow(
                  "Advised Medical Work Restriction",
                  application.advisedMedicalWorkRestriction ? "Yes" : "No",
                  "advisedMedicalWorkRestriction"
                )}
                {application.advisedMedicalWorkRestriction &&
                  renderFieldRow(
                    "Restriction Comment",
                    application.advisedMedicalWorkRestrictionComment,
                    "advisedMedicalWorkRestrictionComment"
                  )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Medical Conditions */}
      <TabsContent value="medicalConditions">
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-lg font-semibold">Medical Conditions</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3 text-left">Condition</TableHead>
                  <TableHead className="text-right">Affected</TableHead>
                  <TableHead className="w-10 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  "undueFatigue",
                  "bronchitis",
                  "breathlessness",
                  "allergies",
                  "pneumonia",
                  "hayFever",
                  "shortnessOfBreath",
                  "jundice",
                  "stomachProblems",
                  "stomachUlcer",
                  "hernias",
                  "bowelProblem",
                  "diabetesMellitus",
                  "nervousDisorder",
                  "dizziness",
                  "earProblems",
                  "hearingDefect",
                  "epilepsy",
                  "eyeProblems",
                  "ppeAllergy",
                  "rheumaticFever",
                  "highBloodPressure",
                  "lowBloodPressure",
                  "palpitations",
                  "heartAttack",
                  "angina",
                  "asthma",
                  "chronicLungProblems",
                  "stroke",
                  "heartMurmur",
                  "backProblems",
                  "jointProblems",
                  "swollenLegs",
                  "varicoseVeins",
                  "rheumatism",
                  "migraine",
                  "drugReaction",
                  "visionCorrection",
                  "skinConditions",
                  "alcoholHealthProblems",
                ].map((field) => (
                  <React.Fragment key={field}>
                    {renderFieldRow(
                      field
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase()),
                      application[field] ? "Yes" : "No",
                      field
                    )}
                    {application[field] &&
                      renderFieldRow(
                        `${field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())} Details`,
                        application[`${field}Details`],
                        `${field}Details`
                      )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Additional Health Info */}
      <TabsContent value="additionalHealth">
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-lg font-semibold">Additional Health Information</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3 text-left">Field</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="w-10 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderFieldRow("Serious Illness (Not Listed)", application.seriousIllnessDetails, "seriousIllnessDetails")}
                {renderFieldRow("Recent Ill Health", application.recentIllHealth ? "Yes" : "No", "recentIllHealth")}
                {application.recentIllHealth &&
                  renderFieldRow("Recent Ill Health Comment", application.recentIllHealthComment, "recentIllHealthComment")}
                {renderFieldRow("Attending Clinic", application.attendingClinic ? "Yes" : "No", "attendingClinic")}
                {application.attendingClinic &&
                  renderFieldRow("Clinic Comment", application.attendingClinicComment, "attendingClinicComment")}
                {renderFieldRow("Had Chicken Pox", application.hadChickenPox ? "Yes" : "No", "hadChickenPox")}
                {application.hadChickenPox &&
                  renderFieldRow("Chicken Pox Comment", application.hadChickenPoxComment, "hadChickenPoxComment")}
                {renderFieldRow(
                  "Other Communicable Disease",
                  application.otherCommunicableDisease ? "Yes" : "No",
                  "otherCommunicableDisease"
                )}
                {application.otherCommunicableDisease &&
                  renderFieldRow(
                    "Disease Comment",
                    application.otherCommunicableDiseaseComment,
                    "otherCommunicableDiseaseComment"
                  )}
                {renderFieldRow("Days Sick Last Year", application.daysSickLastYear, "daysSickLastYear")}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Vaccination History */}
      <TabsContent value="vaccination">
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-lg font-semibold">Vaccination History</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3 text-left">Vaccination</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  <TableHead className="w-10 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  "inocDiphtheria",
                  "inocHepatitisB",
                  "inocTuberculosis",
                  "inocRubella",
                  "inocVaricella",
                  "inocPolio",
                  "inocTetanus",
                  "testedHIV",
                  "inocOther",
                ].map((field) => (
                  <React.Fragment key={field}>
                    {renderFieldRow(
                      field.replace(/^inoc/, "").replace(/^./, (str) => str.toUpperCase()),
                      application[field] ? "Yes" : "No",
                      field
                    )}
                    {application[field] &&
                      renderFieldRow(
                        `${field.replace(/^inoc/, "").replace(/^./, (str) => str.toUpperCase())} Comment`,
                        application[`${field}Comment`],
                        `${field}Comment`
                      )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Declarations & Consent */}
      <TabsContent value="declarations">
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-lg font-semibold">Declarations & Consent</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3 text-left">Declaration</TableHead>
                  <TableHead className="text-right">Consent Given</TableHead>
                  <TableHead className="w-10 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderFieldRow("I confirm that the information provided is true and accurate to the best of my knowledge. I understand that any false information may result in termination of employment.", application.consentMedicalDeclaration ? "Yes" : "No", "consentMedicalDeclaration")}
                {renderFieldRow("I consent to vaccination requirements as per company policy.", application.consentVaccination ? "Yes" : "No", "consentVaccination")}
                {renderFieldRow("I agree that providing false medical information may lead to termination of employment.", application.consentTerminationClause ? "Yes" : "No", "consentTerminationClause")}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
