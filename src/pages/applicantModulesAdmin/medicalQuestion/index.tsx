import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoveLeft, Check, X, Download, Pen } from 'lucide-react';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import axiosInstance from '@/lib/axios';
import { PDFDownloadLink } from '@react-pdf/renderer';
import MedicalFormPdf from './components/MedicalFormPdf';

interface MedicalFormData {
  userId: string;
  firstName: string;
  lastName: string;
  address: string;
  postcode: string;
  dateOfBirth: string;
  positionApplied: string;
  sex: 'male' | 'female';
  daysSickness: string;
  workRestrictions: boolean;
  workRestrictionsDetails?: string;
  undueFatigue: boolean;
  undueFatigueDetails?: string;
  bronchitis: boolean;
  bronchitisDetails?: string;
  breathlessness: boolean;
  breathlessnessDetails?: string;
  allergies: boolean;
  allergiesDetails?: string;
  pneumonia: boolean;
  pneumoniaDetails?: string;
  hayFever: boolean;
  hayFeverDetails?: string;
  shortnessOfBreath: boolean;
  shortnessOfBreathDetails?: string;
  jaundice: boolean;
  jaundiceDetails?: string;
  stomachProblem: boolean;
  stomachProblemDetails?: string;
  stomachUlcer: boolean;
  stomachUlcerDetails?: string;
  hernias: boolean;
  herniasDetails?: string;
  bowelProblem: boolean;
  bowelProblemDetails?: string;
  diabetes: boolean;
  diabetesDetails?: string;
  nervousDisorder: boolean;
  nervousDisorderDetails?: string;
  dizziness: boolean;
  dizzinessDetails?: string;
  earProblems: boolean;
  earProblemsDetails?: string;
  hearingDefect: boolean;
  hearingDefectDetails?: string;
  epilepsy: boolean;
  epilepsyDetails?: string;
  eyeProblems: boolean;
  eyeProblemsDetails?: string;
  ppeAllergy: boolean;
  ppeAllergyDetails?: string;
  rheumaticFever: boolean;
  rheumaticFeverDetails?: string;
  highBP: boolean;
  highBPDetails?: string;
  lowBP: boolean;
  lowBPDetails?: string;
  palpitations: boolean;
  palpitationsDetails?: string;
  heartAttack: boolean;
  heartAttackDetails?: string;
  angina: boolean;
  anginaDetails?: string;
  asthma: boolean;
  asthmaDetails?: string;
  chronicLungProblems: boolean;
  chronicLungProblemsDetails?: string;
  stroke: boolean;
  strokeDetails?: string;
  heartMurmur: boolean;
  heartMurmurDetails?: string;
  backProblems: boolean;
  backProblemsDetails?: string;
  jointProblems: boolean;
  jointProblemsDetails?: string;
  swollenLegs: boolean;
  swollenLegsDetails?: string;
  varicoseVeins: boolean;
  varicoseVeinsDetails?: string;
  rheumatism: boolean;
  rheumatismDetails?: string;
  migraine: boolean;
  migraineDetails?: string;
  drugReaction: boolean;
  drugReactionDetails?: string;
  visionCorrection: boolean;
  visionCorrectionDetails?: string;
  skinConditions: boolean;
  skinConditionsDetails?: string;
  alcoholHealth: boolean;
  alcoholHealthDetails?: string;
  seriousIllnessHistory: boolean;
  seriousIllnessHistoryDetails?: string;
  recentIllHealth: boolean;
  recentIllHealthDetails?: string;
  attendingClinic: boolean;
  attendingClinicDetails?: string;
  chickenPox: boolean;
  chickenPoxDetails?: string;
  communicableDisease: boolean;
  communicableDiseaseDetails?: string;
  inocDiphtheria: boolean;
  inocHepB: boolean;
  inocTB: boolean;
  inocTBDetails?: string;
  inocRubella: boolean;
  inocRubellaDetails?: string;
  inocVaricella: boolean;
  inocVaricellaDetails?: string;
  inocPolio: boolean;
  inocPolioDetails?: string;
  inocTetanus: boolean;
  inocTetanusDetails?: string;
  hivTest: boolean;
  hivTestDetails?: string;
  inocOther: boolean;
  inocOtherDetails?: string;
  declTrueAccount: boolean;
  declDataProcessing: boolean;
  declVaccination: boolean;
  declTermination: boolean;
  createdAt?: string;
}

const formatDate = (dateStr?: string) =>
  dateStr ? new Date(dateStr).toLocaleDateString('en-GB') : '—';

export default function AdminMedicalForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MedicalFormData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedicalForm = async () => {
      if (!id) {
        setError('Invalid user ID');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/medical-form?userId=${id}`);
        const formData = res.data?.data?.result?.[0];
        if (!formData) {
          setError('No medical form found for this applicant.');
        } else {
          setData(formData);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load medical form data.');
      } finally {
        setLoading(false);
      }
    };
    fetchMedicalForm();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <Card className="w-full max-w-2xl p-8 text-center">
          <CardTitle className="text-3xl text-red-600">❌ Data Error</CardTitle>
          <CardDescription className="mt-2 text-lg">
            {error || 'Medical form not submitted.'}
          </CardDescription>
          <Button className="mt-6" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const personalInfo = [
    { label: 'First Name', value: `${data.firstName}` },
    { label: 'Last Name', value: `${data.lastName}` },
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
    { label: 'Serious illness / hospital admission / operation ≥5 days', value: data.seriousIllnessHistory, details: data.seriousIllnessHistoryDetails, section: 'History' },
    { label: 'Recent ill health?', value: data.recentIllHealth, details: data.recentIllHealthDetails, section: 'Specific' },
    { label: 'Currently attending a clinic / doctor?', value: data.attendingClinic, details: data.attendingClinicDetails, section: 'Specific' },
    { label: 'Had Chicken Pox?', value: data.chickenPox, details: data.chickenPoxDetails, section: 'Specific' },
    { label: 'Any other serious communicable disease?', value: data.communicableDisease, details: data.communicableDiseaseDetails, section: 'Specific' },
    { label: 'Advised against particular work?', value: data.workRestrictions, details: data.workRestrictionsDetails, section: 'Occupational' },
  ];

  const inoculations = [
    { label: 'Diphtheria', value: data.inocDiphtheria, details: data.inocDiphtheriaDetails },
    { label: 'Hepatitis B', value: data.inocHepB, details: data.inocHepBDetails },
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
    <div className="flex justify-center ">
      <Card className="w-full  shadow-xl border border-gray-100">
        <CardHeader className="border-b border-gray-300 ">
         <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">Medical Questionnaire - <span className='text-watney'>{data.firstName} {data.lastName}</span></CardTitle>
            </div>
            <div className="flex gap-2"> {/* Container for buttons */}
              {/* Back Button */}
              <Button
                onClick={() => navigate(-1)}
                >
                <MoveLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => navigate('edit')}
                >
                <Pen className="h-4 w-4 mr-2" />
                Edit
              </Button>
                  {/* PDF Download Link */}
                  {data && (
                    <PDFDownloadLink
                      document={<MedicalFormPdf data={data} />} // Pass data prop
                      fileName={`Medical_Form_${data.lastName}_${data.firstName}.pdf`}
                    >
                      {({ loading }) => (
                        <Button disabled={loading} variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          {loading ? 'Generating...' : 'Download PDF'}
                        </Button>
                      )}
                    </PDFDownloadLink>
                  )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 ">
          <SectionTable title="Personal Information" data={personalInfo} isKeyValue />

          <SectionTable title="Occupational & Specific Questions">
            {medicalConditions
              .filter(item => item.section === 'Occupational' || item.section === 'Specific')
              .map((item, index) => (
                <ConditionRow key={index} {...item} />
              ))}
          </SectionTable>

          <SectionTable title="Past Medical History">
            {medicalConditions
              .filter(item => !item.section)
              .map((item, index) => (
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

          {data.createdAt && (
            <div className="mt-8 pt-4 border-t border-gray-200 text-right">
              <p className="text-sm font-medium text-black/60">
                Submitted on: 
                <span className="font-semibold text-black ml-2">
                  {new Date(data.createdAt).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface TableDataRow {
  label: string;
  value: string | boolean;
  details?: string;
  section?: string;
}

interface SectionTableProps {
  title: string;
  data?: TableDataRow[];
  children?: React.ReactNode;
  isKeyValue?: boolean;
  borderClass?: string;
}

const SectionTable = ({ title, data, children, isKeyValue = false, borderClass = 'border-gray-200' }: SectionTableProps) => (
  <div className="mb-6">
    <h3 className={`mb-4 text-xl font-bold text-black border-b-2 ${borderClass} pb-2`}>
      {title}
    </h3>
    <div className={`border ${borderClass} rounded-none overflow-hidden`}>
      <table className="min-w-full divide-y divide-gray-200">
        <tbody>
          {isKeyValue && data && data.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-black w-1/3">
                {item.label}
              </td>
              <td className="px-6 py-3 text-sm text-black w-2/3">
                {item.value as string}
              </td>
            </tr>
          ))}
          {!isKeyValue && children}
        </tbody>
      </table>
    </div>
  </div>
);

const ConditionRow = ({ label, value, details }: { label: string; value: boolean; details?: string }) => (
  <tr className="border-b border-gray-300">
    <td className="px-6 py-3 text-sm font-medium text-black align-top w-1/2 border-r border-gray-300">{label}</td>
    <td className="px-6 py-3 text-sm align-top">
      <div className="flex justify-between items-center w-full">
        <span className="font-bold text-black">{value ? 'YES' : 'NO'}</span>
      </div>
      {value && details && (
        <div className="mt-1 pt-1 border-t border-gray-300 p-2 ">
          <p className="text-xs font-semibold text-black/80">Details Provided:</p>
          <p className="text-sm italic text-black/90">“{details}”</p>
        </div>
      )}
    </td>
  </tr>
);


const DeclarationRow = ({ label, value }: { label: string; value: boolean }) => {
  const Icon = value ? Check : X;
  return (
    <tr className="divide-x divide-gray-200 hover:bg-gray-100">
      <td className="px-6 py-3 text-sm font-medium text-black align-top w-full">
        <div className='flex items-center gap-3'>
          <Icon className="h-5 w-5 text-black flex-shrink-0" />
          {label}
        </div>
      </td>
      <td className="px-6 py-3 text-sm font-bold align-top">
        <span className="text-black">{value ? 'AGREED' : 'NOT AGREED'}</span>
      </td>
    </tr>
  );
};
