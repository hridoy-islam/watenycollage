import type React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image
} from '@react-pdf/renderer';

// STEP 1: Define base styles WITHOUT referencing any extended styles
const baseStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontSize: 10,
    fontFamily: 'Helvetica'
  },
  header: {
    alignItems: 'flex-start'
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 10
  },
  logoContainer: {
    textAlign: 'center',
    flex: 1,
    maxWidth: '33.33%'
  },
  logo: {
    width: 100,
    height: 60
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center'
  },
  companyInfoLeft: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
    textAlign: 'left',
    maxWidth: '33.33%',
    marginRight: 20
  },
  vision: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'left',
    marginTop: 10
  },
  culture: {
    fontSize: 8,
    textAlign: 'left',
    marginBottom: 5
  },
  candidateInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  candidateField: {
    flex: 1,
    marginRight: 10
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2
  },
  fieldValue: {
    fontSize: 10,

  },
  scoreGuide: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  table: {
    width: '100%',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: '#000000',
    borderLeftWidth: 1,
    borderLeftStyle: 'solid',
    borderLeftColor: '#000000',
    marginBottom: 20
  },
  tableRow: {
    flexDirection: 'row',
    margin: 0,
    width: '100%'
  },
  // General cell styles
  tableColHeader: {
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: '#000000',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#000000',
    backgroundColor: '#F0F0F0',
    padding: 5,
    textAlign: 'center'
  },
  tableCol: {
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: '#000000',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#000000',
    padding: 5
  },
  tableCellHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  tableCell: {
    fontSize: 8,
    textAlign: 'center'
  },
  tableCellLeft: {
    fontSize: 8,
    textAlign: 'left',
    lineHeight: 1.2
  },

  // Column widths (equal distribution for 3-column layout)
  tableCol1: { width: '33.33%' }, // REJECT
  tableCol2: { width: '33.33%' }, // APPOINTED
  tableCol3: { width: '33.33%' }, // SECOND CHOICE

  // Assessment Table Columns
  tableColHeaderA: { width: '25%' }, // Person specification
  tableColHeaderB: { width: '11%' }, // Management
  tableColHeaderC: { width: '11%' }, // Senior Support
  tableColHeaderD: { width: '11%' }, // Support Worker
  tableColHeaderE: { width: '12%' }, // Panel Score
  tableColHeaderF: { width: '30%' }, // Comments

  tableCellA: { width: '25%' },
  tableCellB: { width: '11%' },
  tableCellC: { width: '11%' },
  tableCellD: { width: '11%' },
  tableCellE: { width: '12%' },
  tableCellF: { width: '30%' },

  checkbox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    marginRight: 3,
    marginBottom: 2
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3
  }
});

// STEP 2: Now safely extend baseStyles using the already-defined object
const styles = StyleSheet.create({
  ...baseStyles,

  // Extended styles using baseStyles (now safe!)
  tableColHeader1: { ...baseStyles.tableColHeader, ...baseStyles.tableCol1 },
  tableColHeader2: { ...baseStyles.tableColHeader, ...baseStyles.tableCol2 },
  tableColHeader3: { ...baseStyles.tableColHeader, ...baseStyles.tableCol3 },

  tableCell1: { ...baseStyles.tableCol, ...baseStyles.tableCol1 },
  tableCell2: { ...baseStyles.tableCol, ...baseStyles.tableCol2 },
  tableCell3: { ...baseStyles.tableCol, ...baseStyles.tableCol3 },

  // Apply base styling to assessment columns (with widths)
  tableColHeaderA: {
    ...baseStyles.tableColHeader,
    ...baseStyles.tableColHeaderA
  },
  tableColHeaderB: {
    ...baseStyles.tableColHeader,
    ...baseStyles.tableColHeaderB
  },
  tableColHeaderC: {
    ...baseStyles.tableColHeader,
    ...baseStyles.tableColHeaderC
  },
  tableColHeaderD: {
    ...baseStyles.tableColHeader,
    ...baseStyles.tableColHeaderD
  },
  tableColHeaderE: {
    ...baseStyles.tableColHeader,
    ...baseStyles.tableColHeaderE
  },
  tableColHeaderF: {
    ...baseStyles.tableColHeader,
    ...baseStyles.tableColHeaderF
  },

  tableCellA: { ...baseStyles.tableCol, ...baseStyles.tableCellA },
  tableCellB: { ...baseStyles.tableCol, ...baseStyles.tableCellB },
  tableCellC: { ...baseStyles.tableCol, ...baseStyles.tableCellC },
  tableCellD: { ...baseStyles.tableCol, ...baseStyles.tableCellD },
  tableCellE: { ...baseStyles.tableCol, ...baseStyles.tableCellE },
  tableCellF: { ...baseStyles.tableCol, ...baseStyles.tableCellF },

  // Decision & signature section styles
  decisionSection: {
    marginTop: 5,
    marginBottom: 20
  },
  nameSignSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 10
  },
  nameSignBox: {
    width: '45%',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    paddingBottom: 2,
    minHeight: 20
  }
});

interface PDFProps {
  candidateName: string;
  jobTitle: string;
  interviewDate: Date;
  interviewerName: string;
  assessments: Record<string, { score: number; comment: string }>;
  decision: string;
  decisionReason: string;
  candidateAdvised: string;
}

const assessmentCriteria = [
  {
    id: 'values',
    name: '1. Values – People that are honest, respectful and will work by our points of culture above.',
    managementReq: 'High',
    seniorSupportReq: 'High',
    supportWorkerReq: 'High'
  },
  {
    id: 'workEthic',
    name: '2. Work Ethic – Team members who work hard and are proactive and do not just do things when told to.',
    managementReq: 'High',
    seniorSupportReq: 'High',
    supportWorkerReq: 'High'
  },
  {
    id: 'qualifications',
    name: '3. Qualifications – Having the necessary qualifications to carry out their duties accordingly.',
    managementReq: 'RQF/QCF/ NVQ4/ RGN Or equivalent',
    seniorSupportReq: 'RQF/NVQ / QCF 3 Or equivalent',
    supportWorkerReq: 'Willing to Do RQF/NVQ / QCF 2'
  },
  {
    id: 'problemSolving',
    name: '4. Problem Solving –Being diplomatic with service users, their family, team members and other care professionals, finding suitable resolutions in line with CQC and our policies and procedures.',
    managementReq: 'High (Dig deep with scenarios)',
    seniorSupportReq: 'Intermediate (Push further in scenarios)',
    supportWorkerReq: 'Basic'
  },
  {
    id: 'cqcKnowledge',
    name: '5. CQC Knowledge – Having the required knowledge for the role so that decisions made are influenced by understanding CQC regulations.',
    managementReq: 'High (Dig deep with questions)',
    seniorSupportReq: 'Intermediate (Dig deeper with questions)',
    supportWorkerReq: 'Basic'
  },
  {
    id: 'experience',
    name: '6. Experience – Having the necessary experience to carry out their duties accordingly',
    managementReq: '2 years team leading',
    seniorSupportReq: '2 years',
    supportWorkerReq: 'Less than 2 years'
  },
  {
    id: 'reportWriting',
    name: '7. Report Writing/I.C.T Skills Having the necessary skills to carry out their duties accordingly',
    managementReq: 'High',
    seniorSupportReq: 'Intermediate',
    supportWorkerReq: 'Basic'
  }
];

const InterviewPDF: React.FC<PDFProps> = ({
  candidateName,
  jobTitle,
  interviewDate,
  interviewerName,
  assessments,
  decision,
  decisionReason,
  candidateAdvised
}) => {
  

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {/* Left: Company Contact Info */}
            <View style={styles.companyInfoLeft}>
              <Text>Everycare Romford</Text>
              <Text>37 High Street, Romford, Essex, RM1 1JL</Text>
              <Text>Tel: 0170 8690 3057</Text>
            </View>

            {/* Center: Logo + Company Name */}
            <View style={styles.logoContainer}>
              <Image style={styles.logo} src="/logo.png" />
            </View>

            {/* Right: Contact Details */}
            <View style={{ flex: 1, fontSize: 9, textAlign: 'right' }}>
              <Text>Email: romford@everycare.co.uk</Text>
              <Text>Website: www.everycare.co.uk/romford</Text>
              <Text>Registered by CQC</Text>
            </View>
          </View>
        </View>

        {/* Candidate Information */}
        <View style={styles.candidateInfo}>
          <View style={styles.candidateField}>
            <Text style={styles.fieldLabel}>Name of candidate:</Text>
            <Text style={styles.fieldValue}>{candidateName}</Text>
          </View>
          <View style={styles.candidateField}>
            <Text style={styles.fieldLabel}>Date and time:</Text>
            <Text style={styles.fieldValue}>
              {interviewDate.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
          <View style={styles.candidateField}>
            <Text style={styles.fieldLabel}>Post:</Text>
            <Text style={styles.fieldValue}>{jobTitle}</Text>
          </View>
        </View>

        {/* Vision & Culture */}
        <View style={styles.header}>
          <Text style={styles.vision}>
            Our vision is: To Be Recognised as The Leading Care Provider and To
            Change Quality of Life
          </Text>
          <Text style={styles.culture}>
            Our Points of Culture are based on “Being Courteous, Promoting
            Independence and Developing Trust”
          </Text>
          <Text style={styles.culture}>
            Communication, Continuous Improvement, Personalisation, Systems,
            Enjoyment, Excellence, Integrity, Accountability, Commitment,
            Empathy, Teamwork.
          </Text>
          <Text> </Text>
        </View>

        {/* Score Guide */}
        <Text style={styles.scoreGuide}>
          High 8-9 | Intermediate 4-7 | Poor 0-3
        </Text>

        {/* Assessment Table */}
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableRow}>
            <View style={styles.tableColHeaderA}>
              <Text style={styles.tableCellHeader}>
                Person specification requirements (Found in last page of
                relevant job description)
              </Text>
            </View>
            <View style={styles.tableColHeaderB}>
              <Text style={styles.tableCellHeader}>Management Requirement</Text>
            </View>
            <View style={styles.tableColHeaderC}>
              <Text style={styles.tableCellHeader}>
                Senior Support Requirement
              </Text>
            </View>
            <View style={styles.tableColHeaderD}>
              <Text style={styles.tableCellHeader}>
                Support Worker Requirement
              </Text>
            </View>
            <View style={styles.tableColHeaderE}>
              <Text style={styles.tableCellHeader}>
                Panel Assessment Out Of 10
              </Text>
            </View>
            <View style={styles.tableColHeaderF}>
              <Text style={styles.tableCellHeader}>
                Comments Justifying Assessment
              </Text>
            </View>
          </View>

          {/* Data Rows */}
          {assessmentCriteria.map((criteria) => (
            <View key={criteria.id} style={styles.tableRow}>
              <View style={styles.tableCellA}>
                <Text style={styles.tableCellLeft}>{criteria.name}</Text>
              </View>
              <View style={styles.tableCellB}>
                <Text style={styles.tableCell}>{criteria.managementReq}</Text>
              </View>
              <View style={styles.tableCellC}>
                <Text style={styles.tableCell}>
                  {criteria.seniorSupportReq}
                </Text>
              </View>
              <View style={styles.tableCellD}>
                <Text style={styles.tableCell}>
                  {criteria.supportWorkerReq}
                </Text>
              </View>
              <View style={styles.tableCellE}>
                <Text style={styles.tableCell}>
                  {assessments[criteria.id]?.score || 0}
                </Text>
              </View>
              <View style={styles.tableCellF}>
                <Text style={styles.tableCellLeft}>
                  {assessments[criteria.id]?.comment || ''}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Professional Decision & Signature Table (3 Equal Columns) */}
        <View style={[styles.table, styles.decisionSection]}>
          {/* Row 1: Decision Headers */}
          {/* Row 1: Decision Headers with filled squares on same line */}
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader1}>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <Text style={styles.tableCellHeader}>REJECT</Text>
                {decision === 'reject' && (
                  <View
                    style={{
                      width: 9,
                      height: 9,
                      backgroundColor: '#000',
                      borderWidth: 0.7,
                      borderColor: '#000',
                      borderStyle: 'solid'
                    }}
                  />
                )}
              </View>
            </View>

            <View style={styles.tableColHeader2}>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <Text style={styles.tableCellHeader}>APPOINTED</Text>
                {decision === 'appointed' && (
                  <View
                    style={{
                      width: 9,
                      height: 9,
                      backgroundColor: '#000',
                      borderWidth: 0.7,
                      borderColor: '#000',
                      borderStyle: 'solid'
                    }}
                  />
                )}
              </View>
            </View>

            <View style={styles.tableColHeader3}>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <Text style={styles.tableCellHeader}>
                  HELD AS SECOND CHOICE
                </Text>
                {decision === 'second-choice' && (
                  <View
                    style={{
                      width: 9,
                      height: 9,
                      backgroundColor: '#000',
                      borderWidth: 0.7,
                      borderColor: '#000',
                      borderStyle: 'solid'
                    }}
                  />
                )}
              </View>
            </View>
          </View>

          {/* Row 2: Reasons */}
          <View style={styles.tableRow}>
            <View style={styles.tableCell1}>
              <Text style={styles.tableCellLeft}>Reason:</Text>
              <Text style={styles.tableCellLeft}>
                {decision === 'reject' ? decisionReason : ''}
              </Text>
            </View>
            <View style={styles.tableCell2}>
              <Text style={styles.tableCellLeft}>Reason:</Text>
              <Text style={styles.tableCellLeft}>
                {decision === 'appointed' ? decisionReason : ''}
              </Text>
            </View>
            <View style={styles.tableCell3}>
              <Text style={styles.tableCellLeft}>Reason:</Text>
              <Text style={styles.tableCellLeft}>
                {decision === 'second-choice' ? decisionReason : ''}
              </Text>
            </View>
          </View>

          {/* Row 3: Candidate Advised + Name + Sign */}
          <View style={styles.tableRow}>
            <View style={styles.tableCell1}>
              <Text style={styles.tableCellLeft}>
                Candidate Advised of Decision Verbally:
              </Text>
              <View style={styles.checkboxRow}>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderWidth: 1,
                    borderColor: '#000',
                    borderStyle: 'solid',
                    marginRight: 3,
                    marginBottom: 2,
                    backgroundColor:
                      candidateAdvised === 'yes' ? '#000' : 'transparent'
                  }}
                />
                <Text style={styles.tableCellLeft}>YES</Text>
              </View>
              <View style={styles.checkboxRow}>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderWidth: 1,
                    borderColor: '#000',
                    borderStyle: 'solid',
                    marginRight: 3,
                    marginBottom: 2,
                    backgroundColor:
                      candidateAdvised === 'no' ? '#000' : 'transparent'
                  }}
                />
                <Text style={styles.tableCellLeft}>NO</Text>
              </View>
            </View>
            <View style={styles.tableCell2}>
              <Text style={styles.fieldLabel}>NAME:</Text>
              
              <Text >{interviewerName}</Text>
            </View>
            <View style={styles.tableCell3}>
              <Text style={styles.fieldLabel}>SIGNATURE:</Text>
            </View>
          </View>
        </View>

      </Page>
    </Document>
  );
};

export default InterviewPDF;
