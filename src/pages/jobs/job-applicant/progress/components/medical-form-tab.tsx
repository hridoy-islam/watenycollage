import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Download, Pen, Check, X } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { PDFDownloadLink } from '@react-pdf/renderer';
import MedicalFormPdf from '@/pages/applicantModulesAdmin/medicalQuestion/components/MedicalFormPdf';

interface MedicalFormData {
  signatureUrl?: string;
  [key: string]: any;
}

interface Props {
  userId: string;
}

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";

  try {
    return new Date(dateString).toLocaleDateString("en-GB", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};
export function MedicalFormTab({ userId }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MedicalFormData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/medical-form?userId=${userId}`);
        const result = res.data?.data?.result?.[0];
        setData(result || null);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 rounded-full bg-gray-100 p-4">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Medical Questionnaire Not Submitted</h3>
          <p className="mt-1 text-sm text-gray-500">The applicant has not yet submitted the medical questionnaire form.</p>
        </CardContent>
      </Card>
    );
  }

  const personalInfo = [
    { label: 'First Name', value: data.firstName },
    { label: 'Last Name', value: data.lastName },
    { label: 'Position Applied For', value: data.positionApplied },
    { label: 'Date of Birth', value: formatDate(data.dateOfBirth) },
    { label: 'Sex', value: data.sex === 'male' ? 'Male' : 'Female' },
    { label: 'Address', value: data.address },
    { label: 'Postcode', value: data.postcode },
    { label: 'Days Sick (Past Year)', value: data.daysSickness },
  ];

  const medicalConditions = [
    { label: 'Undue Fatigue', value: data.undueFatigue, details: data.undueFatigueDetails },
    { label: 'Bronchitis', value: data.bronchitis, details: data.bronchitisDetails },
    { label: 'Breathlessness', value: data.breathlessness, details: data.breathlessnessDetails },
    { label: 'Allergies', value: data.allergies, details: data.allergiesDetails },
    { label: 'Pneumonia', value: data.pneumonia, details: data.pneumoniaDetails },
    { label: 'Hay Fever', value: data.hayFever, details: data.hayFeverDetails },
    { label: 'Shortness of breath / persistent cough / wheeze', value: data.shortnessOfBreath, details: data.shortnessOfBreathDetails },
    { label: 'Jaundice', value: data.jaundice, details: data.jaundiceDetails },
    { label: 'Stomach problem / vomiting / Diarrhoea', value: data.stomachProblem, details: data.stomachProblemDetails },
    { label: 'Stomach ulcer', value: data.stomachUlcer, details: data.stomachUlcerDetails },
    { label: 'Hernias', value: data.hernias, details: data.herniasDetails },
    { label: 'Bowel problem', value: data.bowelProblem, details: data.bowelProblemDetails },
    { label: 'Diabetes Mellitus', value: data.diabetes, details: data.diabetesDetails },
    { label: 'Nervous disorder / mental illness / anxiety / depression / phobias / stress', value: data.nervousDisorder, details: data.nervousDisorderDetails },
    { label: 'Dizziness / fainting attacks', value: data.dizziness, details: data.dizzinessDetails },
    { label: 'Ear problems', value: data.earProblems, details: data.earProblemsDetails },
    { label: 'Hearing defect', value: data.hearingDefect, details: data.hearingDefectDetails },
    { label: 'Epilepsy / fits / blackouts', value: data.epilepsy, details: data.epilepsyDetails },
    { label: 'Eye problems', value: data.eyeProblems, details: data.eyeProblemsDetails },
    { label: 'Allergic reaction to PPE', value: data.ppeAllergy, details: data.ppeAllergyDetails },
    { label: 'Rheumatic fever', value: data.rheumaticFever, details: data.rheumaticFeverDetails },
    { label: 'High blood pressure', value: data.highBP, details: data.highBPDetails },
    { label: 'Low blood pressure', value: data.lowBP, details: data.lowBPDetails },
    { label: 'Palpitations', value: data.palpitations, details: data.palpitationsDetails },
    { label: 'Heart attack', value: data.heartAttack, details: data.heartAttackDetails },
    { label: 'Angina', value: data.angina, details: data.anginaDetails },
    { label: 'Asthma', value: data.asthma, details: data.asthmaDetails },
    { label: 'Other chronic lung problems', value: data.chronicLungProblems, details: data.chronicLungProblemsDetails },
    { label: 'Stroke or TIA', value: data.stroke, details: data.strokeDetails },
    { label: 'Heart murmur', value: data.heartMurmur, details: data.heartMurmurDetails },
    { label: 'Back problems', value: data.backProblems, details: data.backProblemsDetails },
    { label: 'Joint problems', value: data.jointProblems, details: data.jointProblemsDetails },
    { label: 'Swollen legs / leg ulcers / DVT', value: data.swollenLegs, details: data.swollenLegsDetails },
    { label: 'Varicose veins', value: data.varicoseVeins, details: data.varicoseVeinsDetails },
    { label: 'Rheumatism', value: data.rheumatism, details: data.rheumatismDetails },
    { label: 'Migraine', value: data.migraine, details: data.migraineDetails },
    { label: 'Adverse reaction to drugs', value: data.drugReaction, details: data.drugReactionDetails },
    { label: 'Glasses / contact lenses', value: data.visionCorrection, details: data.visionCorrectionDetails },
    { label: 'Skin conditions', value: data.skinConditions, details: data.skinConditionsDetails },
    { label: 'Alcohol-related health problems', value: data.alcoholHealth, details: data.alcoholHealthDetails },
    { label: 'Serious illness / hospital admission / operation ≥5 days', value: data.seriousIllnessHistory, details: data.seriousIllnessHistoryDetails },
    { label: 'Recent ill health?', value: data.recentIllHealth, details: data.recentIllHealthDetails },
    { label: 'Currently attending a clinic / doctor?', value: data.attendingClinic, details: data.attendingClinicDetails },
    { label: 'Had Chicken Pox?', value: data.chickenPox, details: data.chickenPoxDetails },
    { label: 'Any other serious communicable disease?', value: data.communicableDisease, details: data.communicableDiseaseDetails },
    { label: 'Advised against particular work?', value: data.workRestrictions, details: data.workRestrictionsDetails },
  ];

  const inoculations = [
    { label: 'Diphtheria', value: data.inocDiphtheria },
    { label: 'Hepatitis B', value: data.inocHepB },
    { label: 'Tuberculosis (BCG)', value: data.inocTB, details: data.inocTBDetails },
    { label: 'Rubella (German Measles)', value: data.inocRubella, details: data.inocRubellaDetails },
    { label: 'Varicella (Chicken Pox)', value: data.inocVaricella, details: data.inocVaricellaDetails },
    { label: 'Polio', value: data.inocPolio, details: data.inocPolioDetails },
    { label: 'Tetanus', value: data.inocTetanus, details: data.inocTetanusDetails },
    { label: 'HIV test?', value: data.hivTest, details: data.hivTestDetails },
    { label: 'Other', value: data.inocOther, details: data.inocOtherDetails },
  ];

  const declarations = [
    { label: 'Information is true and complete', value: data.declTrueAccount },
    { label: 'Consent to data processing', value: data.declDataProcessing },
    { label: 'Must be immunised against Hep B, TB, Rubella', value: data.declVaccination },
    { label: 'Understand employment may be terminated for false/misleading info', value: data.declTermination },
  ];

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Medical Questionnaire</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Submitted
            </Badge>
            <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/recruitment/admin/medical-form/${userId}/edit`)}>
              <Pen className="mr-1 h-3 w-3" />
              Edit
            </Button>
            {data && (
              <PDFDownloadLink
                document={<MedicalFormPdf data={data} />}
                fileName={`Medical_Form_${data.lastName}_${data.firstName}.pdf`}
              >
                {({ loading: pdfLoading }) => (
                  <Button size="sm" variant="outline" disabled={pdfLoading}>
                    <Download className="mr-1 h-3 w-3" />
                    {pdfLoading ? 'Generating...' : 'PDF'}
                  </Button>
                )}
              </PDFDownloadLink>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-6">
        <SectionTable title="Personal Information" data={personalInfo} isKeyValue />
        <SectionTable title="Medical Conditions">
          {medicalConditions.map((item, index) => (
            <ConditionRow key={index} {...item} />
          ))}
        </SectionTable>
        <SectionTable title="Inoculations">
          {inoculations.map((item, index) => (
            <ConditionRow key={index} {...item} />
          ))}
        </SectionTable>
        <SectionTable title="Declarations & Consent">
          {declarations.map((item, index) => (
            <DeclarationRow key={index} {...item} />
          ))}
        </SectionTable>
        {data.signatureUrl && (
          <div className="border-t pt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Signature</p>
            <img src={data.signatureUrl} alt="Signature" className="h-12 rounded border border-gray-200" />
          </div>
        )}
        {data.createdAt && (
          <p className="text-xs text-gray-400 pt-2 border-t">
            Submitted: {new Date(data.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function SectionTable({ title, data, children, isKeyValue }: { title: string; data?: any[]; children?: React.ReactNode; isKeyValue?: boolean }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-gray-700 border-b pb-1 mb-2">{title}</h4>
      <div className="border rounded overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <tbody>
            {isKeyValue && data && data.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-4 py-2 text-xs font-medium text-gray-700 w-1/3 border-r">{item.label}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{item.value || '—'}</td>
              </tr>
            ))}
            {!isKeyValue && children}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ConditionRow({ label, value, details }: { label: string; value: boolean; details?: string }) {
  return (
    <tr className="border-b border-gray-200">
      <td className="px-4 py-2 text-xs text-gray-700 align-top w-1/2 border-r">{label}</td>
      <td className="px-4 py-2 text-xs align-top">
        <span className={`font-bold ${value ? 'text-green-700' : 'text-red-700'}`}>{value ? 'YES' : 'NO'}</span>
        {value && details && (
          <p className="mt-1 text-xs italic text-gray-500">“{details}”</p>
        )}
      </td>
    </tr>
  );
}

function DeclarationRow({ label, value }: { label: string; value: boolean }) {
  const Icon = value ? Check : X;
  return (
    <tr className="border-b border-gray-200">
      <td className="px-4 py-2 text-xs text-gray-700 align-top w-full">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${value ? 'text-green-600' : 'text-red-600'}`} />
          {label}
        </div>
      </td>
      <td className="px-4 py-2 text-xs font-bold text-gray-900 align-top">
        {value ? 'AGREED' : 'NOT AGREED'}
      </td>
    </tr>
  );
}
