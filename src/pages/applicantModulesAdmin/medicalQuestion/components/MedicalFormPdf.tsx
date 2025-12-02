import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// IMPORTANT: Define or import the interface for MedicalFormData
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

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10
  },
  header: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 10
  },
  infoText: {
    fontSize: 8,
    marginBottom: 5
  },

  // --- START of New Table Styles (Flexbox) ---
  tableContainer: {
    width: '100%',
    marginBottom: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000000'
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 18
  },
  tableBodyRow: {
    flexDirection: 'row',
    borderTopColor: '#000000',
    borderTopWidth: 1,
    alignItems: 'stretch'
  },
  tableHeaderCell: {
    backgroundColor: '#EEEEEE',
    textAlign: 'center',
    padding: 3,
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightColor: '#000000',
    borderRightWidth: 1
  },
  tableCell: {
    padding: 3,
    borderRightColor: '#000000',
    borderRightWidth: 1,
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  col1: { width: '45%' }, // Question/Condition
  col2: { width: '10%' }, // YES
  col3: { width: '10%' }, // NO
  col4: { width: '35%', borderRightWidth: 0 }, // Details/Comments

  // --- New 90%/10% Styles for final Declaration ---
  colDecl: { width: '90%' },
  colAccept: { width: '10%', textAlign: 'center', alignItems: 'center' },
  // --- END of New Table Styles (Flexbox) ---

  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  flexItem: {
    width: '48%'
  },
  line: {
    borderBottom: '1px dashed black',
    width: '60%'
  },
  
  // Header Component Styles
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Align vertically center
    marginBottom: 20,
    width: '100%'
  },
  headerLeft: {
    width: '35%',
    fontSize: 9
  },
  headerCenter: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerRight: {
    width: '35%',
    fontSize: 9,
    alignItems: 'flex-end',
    textAlign: 'right'
  },
  linkText: {
    color: 'blue',
    textDecoration: 'underline'
  }
});

// --- NEW REUSABLE HEADER COMPONENT ---
const HeaderComponent = () => (
  <View style={styles.headerContainer}>
    {/* Left Column */}
    <View style={styles.headerLeft}>
      <Text>Everycare Romford</Text>
      <Text>37 High Street, Romford,RM1 1JL</Text>
      <Text>Tel: 0170 8690 3057</Text>
    </View>

    {/* Center Column - Logo */}
    <View style={styles.headerCenter}>
      <Image 
        src="/logo.png" 
        style={{ width: 100, height: 'auto' }} 
      />
    </View>

    {/* Right Column */}
    <View style={styles.headerRight}>
      <Text>Email: <Text style={styles.linkText}>romford@everycare.co.uk</Text></Text>
      <Text>Website: <Text style={styles.linkText}>www.everycare.co.uk/romford</Text></Text>
      <Text>Registered by CQC</Text>
    </View>
  </View>
);

// Helper component for a common table header row
const StandardHeader = ({ col1, col4 }: { col1: string; col4: string }) => (
  <View style={styles.tableRow}>
    <View style={[styles.tableHeaderCell, styles.col1]}>
      <Text>{col1}</Text>
    </View>
    <View style={[styles.tableHeaderCell, styles.col2]}>
      <Text>YES</Text>
    </View>
    <View style={[styles.tableHeaderCell, styles.col3]}>
      <Text>NO</Text>
    </View>
    <View style={[styles.tableHeaderCell, styles.col4]}>
      <Text>{col4}</Text>
    </View>
  </View>
);

// Helper component for common table data rows
const MedicalConditionRow = ({
  label,
  value,
  details
}: {
  label: string;
  value: boolean;
  details?: string;
}) => (
  <View style={styles.tableBodyRow}>
    <View style={[styles.tableCell, styles.col1]}>
      <Text>{label}</Text>
    </View>
    <View
      style={[
        styles.tableCell,
        styles.col2,
        { textAlign: 'center', alignItems: 'center' }
      ]}
    >
      <Text>{value ? 'YES' : ''}</Text>
    </View>
    <View
      style={[
        styles.tableCell,
        styles.col3,
        { textAlign: 'center', alignItems: 'center' }
      ]}
    >
      <Text>{!value ? 'NO' : ''}</Text>
    </View>
    <View style={[styles.tableCell, styles.col4]}>
      <Text>{details || ''}</Text>
    </View>
  </View>
);

const SectionHeader = ({ title }: { title: string }) => (
  <View style={{ marginTop: 10, marginBottom: 5 }}>
    <Text
      style={{
        fontWeight: 'bold',
        fontSize: 10,
        borderBottom: '1px solid black',
        paddingBottom: 2
      }}
    >
      {title}
    </Text>
  </View>
);

const formatDate = (dateStr?: string) =>
  dateStr ? new Date(dateStr).toLocaleDateString('en-GB') : '';

const MedicalFormPdf = ({ data }: { data: MedicalFormData }) => {
  const occupationalHistory = [
    {
      label:
        'Have you ever been advised for medical reasons not to do any particular kind of work?',
      value: data.workRestrictions,
      details: data.workRestrictionsDetails
    }
  ];

  const pastMedicalHistoryPage1 = [
    {
      label: 'Undue Fatigue',
      value: data.undueFatigue,
      details: data.undueFatigueDetails
    },
    {
      label: 'Bronchitis',
      value: data.bronchitis,
      details: data.bronchitisDetails
    },
    {
      label: 'Breathlessness',
      value: data.breathlessness,
      details: data.breathlessnessDetails
    },
    {
      label: 'Allergies (please detail)',
      value: data.allergies,
      details: data.allergiesDetails
    },
    {
      label: 'Pneumonia',
      value: data.pneumonia,
      details: data.pneumoniaDetails
    },
    { label: 'Hay Fever', value: data.hayFever, details: data.hayFeverDetails },
    {
      label: 'Shortness of breath/persistent cough/wheeze',
      value: data.shortnessOfBreath,
      details: data.shortnessOfBreathDetails
    },
    { label: 'Jundice', value: data.jaundice, details: data.jaundiceDetails },
    {
      label: 'Stomach problem/vomiting Diarrhoea',
      value: data.stomachProblem,
      details: data.stomachProblemDetails
    },
    {
      label: 'Stomach ulcer',
      value: data.stomachUlcer,
      details: data.stomachUlcerDetails
    },
    { label: 'Hernias', value: data.hernias, details: data.herniasDetails },
    {
      label: 'Bowel problem',
      value: data.bowelProblem,
      details: data.bowelProblemDetails
    },
    {
      label: 'Diabetes Mellitus',
      value: data.diabetes,
      details: data.diabetesDetails
    },
    {
      label:
        'Nervous disorder/mental illness, nerves anxiety/depression/phobias/stress',
      value: data.nervousDisorder,
      details: data.nervousDisorderDetails
    },
    {
      label: 'Dizziness/fainting attacks',
      value: data.dizziness,
      details: data.dizzinessDetails
    },
    {
      label: 'Ear problems i.e. chronic ear infection/ perforated ear drum',
      value: data.earProblems,
      details: data.earProblemsDetails
    },
    {
      label: 'Hearing defect',
      value: data.hearingDefect,
      details: data.hearingDefectDetails
    },
    {
      label: 'Epilepsy/fits/blackouts',
      value: data.epilepsy,
      details: data.epilepsyDetails
    },
    {
      label: 'Eye problems/infections/irritations',
      value: data.eyeProblems,
      details: data.eyeProblemsDetails
    },
    {
      label:
        'Allergic reaction to personal protective equipment eg gloves, masks, latex allergy',
      value: data.ppeAllergy,
      details: data.ppeAllergyDetails
    }
  ];

  const pastMedicalHistoryPage2 = [
    {
      label: 'Rheumatic fever',
      value: data.rheumaticFever,
      details: data.rheumaticFeverDetails
    },
    {
      label: 'High blood pressure',
      value: data.highBP,
      details: data.highBPDetails
    },
    {
      label: 'Low blood pressure',
      value: data.lowBP,
      details: data.lowBPDetails
    },
    {
      label: 'Palpitations',
      value: data.palpitations,
      details: data.palpitationsDetails
    },
    {
      label: 'Heart attack',
      value: data.heartAttack,
      details: data.heartAttackDetails
    },
    { label: 'Angina', value: data.angina, details: data.anginaDetails },
    { label: 'Asthma', value: data.asthma, details: data.asthmaDetails },
    {
      label: 'Other long standing chronic lung problems',
      value: data.chronicLungProblems,
      details: data.chronicLungProblemsDetails
    },
    { label: 'Stroke or TIA', value: data.stroke, details: data.strokeDetails },
    {
      label: 'Heart murmur',
      value: data.heartMurmur,
      details: data.heartMurmurDetails
    },
    {
      label: 'Back problems',
      value: data.backProblems,
      details: data.backProblemsDetails
    },
    {
      label: 'Joint problems',
      value: data.jointProblems,
      details: data.jointProblemsDetails
    },
    {
      label: 'Swollen legs/leg ulcers/deep vein thrombosis',
      value: data.swollenLegs,
      details: data.swollenLegsDetails
    },
    {
      label: 'Varicose veins',
      value: data.varicoseVeins,
      details: data.varicoseVeinsDetails
    },
    {
      label: 'Rheumatism',
      value: data.rheumatism,
      details: data.rheumatismDetails
    },
    { label: 'Migraine', value: data.migraine, details: data.migraineDetails },
    {
      label: 'Adverse reaction to drugs',
      value: data.drugReaction,
      details: data.drugReactionDetails
    },
    {
      label: 'Glasses/contact lenses for sight purposes',
      value: data.visionCorrection,
      details: data.visionCorrectionDetails
    },
    {
      label:
        'Skin conditions i.e. contact dermatitis/skin irritation/areas of damaged or broken skin e.g. psoriasis/eczema/acne',
      value: data.skinConditions,
      details: data.skinConditionsDetails
    },
    {
      label: 'Alcohol related health problems',
      value: data.alcoholHealth,
      details: data.alcoholHealthDetails
    }
  ];

  const specificQuestions = [
    {
      label: 'Have you had any recent ill health?',
      value: data.recentIllHealth,
      details: data.recentIllHealthDetails
    },
    {
      label:
        'Are you attending a hospital clinic or doctor at the present time?',
      value: data.attendingClinic,
      details: data.attendingClinicDetails
    },
    {
      label: 'Have you had Varicella (Chicken pox)?',
      value: data.chickenPox,
      details: data.chickenPoxDetails
    },
    {
      label:
        'Have you had any other serious communicable disease? If so, please give details',
      value: data.communicableDisease,
      details: data.communicableDiseaseDetails
    }
  ];

  const inoculationsData = [
    { label: 'Diphtheria', value: data.inocDiphtheria, details: '' },
    { label: 'Hepatitis B', value: data.inocHepB, details: '' },
    {
      label: 'Tuberculosis (BCG)',
      value: data.inocTB,
      details: data.inocTBDetails
    },
    {
      label: 'Rubella (German Measles)',
      value: data.inocRubella,
      details: data.inocRubellaDetails
    },
    {
      label: 'Varicella (Chicken Pox)',
      value: data.inocVaricella,
      details: data.inocVaricellaDetails
    },
    { label: 'Polio', value: data.inocPolio, details: data.inocPolioDetails },
    {
      label: 'Tetanus',
      value: data.inocTetanus,
      details: data.inocTetanusDetails
    }
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Page 1 Header - UPDATED */}
        <HeaderComponent />

        {/* Page 1 Title and Disclaimer - Remained after header update */}
        <View style={{ marginBottom: 15 }}>
          <Text
            style={[
              styles.header,
              { borderBottom: '1px solid black', paddingBottom: 5 }
            ]}
          >
            Post-Employment Medical Questionnaire
          </Text>

          <Text style={{ fontSize: 8, marginTop: 5 }}>
            Please read carefully before completing. The information contained
            within the completed questionnaire will remain confidential. However
            Everycare Romford may disclose the data to its occupational health
            provider and any false information given may render you liable to a
            summary dismissal.
          </Text>
        </View>

        {/* Personal Details */}
        <View style={{ marginBottom: 15 }}>
          <View style={styles.flexRow}>
            <Text style={styles.flexItem}>
              Employee Forename:
              <Text style={styles.line}>{" "}{data.firstName}</Text>
            </Text>

            <Text style={styles.flexItem}>
              Employee Surname: <Text style={styles.line}>{" "}{data.lastName}</Text>
            </Text>
          </View>

          <View style={styles.flexRow}>
            <Text style={styles.flexItem}>
              Employee Address: <Text style={styles.line}>{" "}{data.address}</Text>
            </Text>

            <Text style={styles.flexItem}>
              Date of Birth:
              <Text style={styles.line}>{" "}{formatDate(data.dateOfBirth)}</Text>
            </Text>
          </View>

          <View style={styles.flexRow}>
            <Text style={styles.flexItem}>
              Postcode: <Text style={styles.line}>{" "}{data.postcode}</Text>
            </Text>

            <Text style={styles.flexItem}>
              Position applied for:
              <Text style={styles.line}>{" "}{data.positionApplied}</Text>
            </Text>
          </View>

          <View style={styles.flexRow}>

            <Text style={styles.flexItem}>
              Sex M/F:
              <Text style={styles.line}>{" "}{data.sex === 'male' ? 'Male' : 'Female'}</Text>
            </Text>
          </View>
        </View>

        {/* Occupational History Table */}
        <SectionHeader title="Occupational History" />
        <View style={styles.tableContainer}>
          <StandardHeader col1="Question" col4="Comments" />
          {occupationalHistory.map((item, index) => (
            <MedicalConditionRow key={index} {...item} />
          ))}
        </View>

        {/* Past Medical History Table (Page 1) */}
        <SectionHeader title="Past Medical History: (Please answer yes/no if you have suffered from any of these conditions & give details if necessary)" />

        <View style={styles.tableContainer}>
          <StandardHeader col1="Medical Condition" col4="Details" />
          {pastMedicalHistoryPage1.map((item, index) => (
            <MedicalConditionRow key={index} {...item} />
          ))}
        </View>
      </Page>

      {/* Page 2 */}
      <Page size="A4" style={styles.page}>
        {/* Page 2 Header - UPDATED */}
        <HeaderComponent />

        {/* Past Medical History Table (Cont.) */}
        <SectionHeader title="Past Medical History:" />

        <View style={styles.tableContainer}>
          <StandardHeader col1="Medical Condition" col4="Details" />
          {pastMedicalHistoryPage2.map((item, index) => (
            <MedicalConditionRow key={index} {...item} />
          ))}
        </View>

        {/* Serious Illness Detail */}
        <View style={{ marginTop: 15 }}>
          <Text style={{ fontSize: 10 }}>
            Please detail of any serious illness, hospital admission, operation
            or accident that has caused you to have five or more days off work
            in the last five years:
          </Text>

          <View
            style={{
              border: '1px dashed black',
              minHeight: 40,
              padding: 5,
              marginTop: 5
            }}
          >
            <Text>{data.seriousIllnessHistoryDetails}</Text>
          </View>
        </View>

        {/* Specific Questions Table */}
        <SectionHeader title="Specific Questions" />
        <View style={styles.tableContainer}>
          <StandardHeader col1="Question" col4="Comment" />
          {specificQuestions.map((item, index) => (
            <MedicalConditionRow
              key={index}
              label={item.label}
              value={item.value}
              details={item.details}
            />
          ))}
        </View>
      </Page>

      {/* Page 3 */}
      <Page size="A4" style={styles.page}>
        {/* Page 3 Header - UPDATED */}
        <HeaderComponent />

        {/* Inoculations Section */}
        <SectionHeader title="Inoculations" />
        <View style={styles.tableContainer}>
          <StandardHeader
            col1="Have you ever been inoculated against the following:"
            col4="Comment"
          />

          {inoculationsData.map((item, index) => (
            <MedicalConditionRow key={index} {...item} />
          ))}
          {/* HIV Test */}
          <MedicalConditionRow
            label="Have you ever undergone a test for HIV?"
            value={data.hivTest}
            details={data.hivTestDetails}
          />
          {/* Other */}
          <MedicalConditionRow
            label="Other please specify:"
            value={data.inocOther}
            details={data.inocOtherDetails}
          />
        </View>

        {/* Additional Information */}
        <SectionHeader title="Additional Information" />
        <View style={styles.tableContainer}>
          <View style={styles.tableRow}>
            <View style={[styles.tableHeaderCell, { width: '45%' }]}>
              <Text>Question</Text>
            </View>
            <View
              style={[
                styles.tableHeaderCell,
                { width: '55%', borderRightWidth: 0 }
              ]}
            >
              <Text>Details</Text>
            </View>
          </View>
          <View style={styles.tableBodyRow}>
            <View style={[styles.tableCell, { width: '45%' }]}>
              <Text>
                Number of days sickness in the past year (i.e. In the last 12
                months)
              </Text>
            </View>

            <View
              style={[styles.tableCell, { width: '55%', borderRightWidth: 0 }]}
            >
              <Text>{data.daysSickness}</Text>
            </View>
          </View>
        </View>

        {/* Night Working */}
        <View style={{ marginTop: 15 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 10 }}>
            Night Working:
          </Text>

          <Text style={{ fontSize: 8, marginTop: 2 }}>
            Employees who are regularly required to work more than three hours a
            shift between 11.00 p.m. and 6.00 a.m. are entitled to a regular
            assessment of their suitability to work nights. If you would like
            the opportunity to have a free health assessment, you must contact
            management at any time.
          </Text>
        </View>

        {/* Consent & Declaration */}
        <SectionHeader title="Consent & Declaration" />
        <View style={{ fontSize: 9, marginTop: 5 }}>
          <Text style={{ marginBottom: 5 }}>
            I declare that the information I have given on this document, is to
            the best of my knowledge, a true and complete account of my medical
            history.{' '}
            <Text style={{ fontWeight: 'bold' }}>
              {data.declTrueAccount ? 'Yes' : 'No'}
            </Text>
          </Text>

          <Text style={{ marginBottom: 5 }}>
            I consent that this information may be held and processed by
            Everycare Romfrord under the Data Protection Act 1998.
            <Text style={{ fontWeight: 'bold' }}>
              {data.declDataProcessing ? 'Yes' : 'No'}
            </Text>
          </Text>

          <Text style={{ marginBottom: 5 }}>
            Further to the company's risk assessment on infectious diseases it
            has been identified that it is necessary from a health & safety
            perspective that all staff are vaccinated against Hepatitis B,
            Tuberculosis and Rubella for both their own safety and the safety of
            our patients.{' '}
            <Text style={{ fontWeight: 'bold' }}>
              {data.declVaccination ? 'Yes' : 'No'}
            </Text>
          </Text>

          <Text style={{ marginBottom: 5 }}>
            I understand and accept that it will be a condition of my contract
            of employment to be fully immunised (if not already) against
            Hepatitis B, Tuberculosis and Rubella within the first three months
            of my employment and remain regularly immunised.{' '}
            <Text style={{ fontWeight: 'bold' }}>
              {data.declVaccination ? 'Yes' : 'No'}
            </Text>
          </Text>

          <Text style={{ marginBottom: 5 }}>
            I understand and accept that if I do not comply with the above
            obligations or should any information come to light following my
            employment with Everycare Romford which shows that medical
            information disclosed by myself was misleading or false,
            Everycare Romford may terminate my employment.{' '}
            <Text style={{ fontWeight: 'bold' }}>
              {data.declTermination ? 'Yes' : 'No'}
            </Text>
          </Text>
        </View>

        {/* Signature Block */}
        <View style={[styles.flexRow, { marginTop: 40 }]}>
          <Text style={styles.flexItem}>
            Signed (Applicant):
            <Text style={[styles.line, { width: 'auto', flexGrow: 1 }]}> </Text>
          </Text>

          <Text style={styles.flexItem}>
            Date:
            <Text style={[styles.line, { width: 'auto', flexGrow: 1 }]}>
            </Text>
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default MedicalFormPdf;