import React from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Heart, Stethoscope, Activity, Shield, Syringe, FileCheck } from 'lucide-react';

interface PostEmploymentTabProps {
  application: any;
  renderFieldRow: (label: string, value: any, fieldPath: string) => React.ReactNode;
}

const postEmploymentTabs = [
  { id: "personalRole", label: "Personal & Role", icon: <Heart className="w-4 h-4" /> },
  { id: "medicalRestriction", label: "Medical Work Restriction", icon: <Stethoscope className="w-4 h-4" /> },
  { id: "medicalConditions", label: "Medical Conditions", icon: <Activity className="w-4 h-4" /> },
  { id: "additionalHealth", label: "Additional Health Info", icon: <Shield className="w-4 h-4" /> },
  { id: "vaccination", label: "Vaccination History", icon: <Syringe className="w-4 h-4" /> },
  { id: "declarations", label: "Declarations & Consent", icon: <FileCheck className="w-4 h-4" /> },
];

export function PostEmploymentTab({ application, renderFieldRow }: PostEmploymentTabProps) {
  const [activeTab, setActiveTab] = React.useState("personalRole");

  const renderTabContent = () => {
    switch (activeTab) {
      case "personalRole":
        return (
          <div>
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
          </div>
        );

      case "medicalRestriction":
        return (
          <div>
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
          </div>
        );

      case "medicalConditions":
        return (
          <div>
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
          </div>
        );

      case "additionalHealth":
        return (
          <div>
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
          </div>
        );

      case "vaccination":
        return (
          <div>
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
          </div>
        );

      case "declarations":
        return (
          <div>
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
                {renderFieldRow(
                  "I confirm that the information provided is true and accurate to the best of my knowledge. I understand that any false information may result in termination of employment.",
                  application.consentMedicalDeclaration ? "Yes" : "No",
                  "consentMedicalDeclaration"
                )}
                {renderFieldRow(
                  "I consent to vaccination requirements as per company policy.",
                  application.consentVaccination ? "Yes" : "No",
                  "consentVaccination"
                )}
                {renderFieldRow(
                  "I agree that providing false medical information may lead to termination of employment.",
                  application.consentTerminationClause ? "Yes" : "No",
                  "consentTerminationClause"
                )}
              </TableBody>
            </Table>
          </div>
        );

      default:
        return (
          <div>
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
          </div>
        );
    }
  };

  return (
    <Card className="p-6">
      <div className="flex gap-6 h-full">
        {/* Vertical Tab List */}
        <aside className="w-64 flex-shrink-0">
          <nav className="bg-white rounded-lg shadow-lg overflow-hidden sticky top-4">
            <div className="py-2">
              {postEmploymentTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left transition-all
                    hover:bg-gray-50
                    ${
                      activeTab === tab.id
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'text-gray-700'
                    }
                  `}
                >
                  {tab.icon}
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </aside>

        {/* Tab Content */}
        <main className="flex-1 bg-white rounded-lg shadow-lg p-6 overflow-auto">
          {renderTabContent()}
        </main>
      </div>
    </Card>
  );
}