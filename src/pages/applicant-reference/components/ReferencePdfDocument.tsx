import React from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import moment from 'moment';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.3,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  headerText: {
    fontSize: 8,
    color: '#444',
    textAlign: 'left',
  },
  titleBox: {
    border: '0.25px solid #000',
    padding: 5,
    textAlign: 'center',
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    marginBottom: 0,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  // Table Styles
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 0.25,
    borderColor: '#000',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.25,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  tableColLabel: {
    width: '40%',
    borderRightWidth: 0.25,
    borderRightColor: '#000',
    borderRightStyle: 'solid',
    padding: 4,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
  },
  tableColContent: {
    width: '60%',
    padding: 4,
    justifyContent: 'center',
  },
  // Grid Table for Ratings
  gridHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  gridRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.25,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    minHeight: 20,
    alignItems: 'center',
  },
  colTrait: {
    width: '55%',
    padding: 4,
    borderRightWidth: 0.25,
    borderColor: '#000',
    minHeight: 20,
    borderRightStyle: 'solid',
  },
  colRating: {
    width: '15%',
    padding: 4,
    borderRightWidth: 0.25,
    borderColor: '#000',
    borderRightStyle: 'solid',
    minHeight: 20,
    textAlign: 'center',
  },
  colRatingLast: {
    width: '15%',
    padding: 4,
    minHeight: 20,
    textAlign: 'center',
  },
  // Personal Reference Specific
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingRight: 20,
  },
  dottedLine: {
    borderBottomWidth: 0.25,
    borderBottomColor: '#999',
    marginTop: 15,
    marginBottom: 5,
    height: 10,
    width: '100%',
  },
  officeBox: {
    marginTop: 20,
    border: '0.25px solid #000',
    backgroundColor: '#e0e0e0',
    padding: 10,
  },
});

// --- Helpers ---

const CheckBox = ({ label, checked }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
    <View
      style={{
        width: 10,
        height: 10,
        borderWidth: 1,
        borderColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 4,
      }}
    >
      <Text style={{ fontSize: 7, fontWeight: 'bold' }}>
        {checked ? 'X' : ''}
      </Text>
    </View>
    <Text>{label}</Text>
  </View>
);

const SquareOption = ({
  label,
  selected,
}: {
  label: string;
  selected: boolean;
}) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
    <Text style={{ marginRight: 5 }}>{label}</Text>
    <View
      style={{
        width: 14,
        height: 14,
        borderWidth: 1,
        borderColor: '#000',
        backgroundColor: selected ? '#000' : '#FFF',
      }}
    />
  </View>
);

const TextOrLine = ({
  text,
  style = {},
  numLines = 1,
}: {
  text?: string | null;
  style?: object;
  numLines?: number;
}) => {
  const isTextAvailable = text && String(text).trim().length > 0;
  if (isTextAvailable) {
    return (
      <Text
        style={{
          fontSize: 9,
          marginTop: 2,
          fontWeight: 'medium',
          ...style,
        }}
      >
        {text}
      </Text>
    );
  }
  const lines = [];
  for (let i = 0; i < numLines; i++) {
    lines.push(<View key={i} style={styles.dottedLine} />);
  }
  return <View>{lines}</View>;
};

// --- Logic Helpers ---
const fmtDate = (d: string) => (d ? moment(d).format('DD/MM/YYYY') : '');
const isRating = (actual: string, target: string) =>
  String(actual || '')
    .toLowerCase()
    .replace('_', ' ') === target.toLowerCase();
const isYes = (val: any) =>
  String(val || '').toLowerCase() === 'yes' ||
  val === true ||
  String(val || '').toLowerCase() === 'true';
const isNo = (val: any) =>
  String(val || '').toLowerCase() === 'no' ||
  val === false ||
  String(val || '').toLowerCase() === 'false';

// --- Page Components (Moved OUTSIDE main component) ---

const ProfessionalPage = ({ data }) => {
  // Safe data access
  const safeData = data || {}; 

  return (
    <Page style={styles.page}>
      <View style={styles.headerContainer}>
        <View style={{ width: '33%' }}>
          <Text style={styles.headerText}>Everycare Romford</Text>
          <Text style={styles.headerText}>
            Office 37 High Street, Romford, Essex, RM1 1JL
          </Text>
          <Text style={styles.headerText}>Tel: 0170 8690 3057</Text>
        </View>
        <View
          style={{
            width: '33%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* NOTE: Ensure this image path is valid. If 404, PDF crashes. */}
           <Image
            src="/logo.png"
            style={{
              width: 140,
              height: 40,
              marginTop: 4,
              objectFit: 'contain',
            }}
          />
        </View>
        <View style={{ width: '33%', alignItems: 'flex-end' }}>
          <Text style={styles.headerText}>Email: romford@everycare.co.uk</Text>
          <Text style={styles.headerText}>
            Website: www.everycare.co.uk/romford
          </Text>
          <Text style={styles.headerText}>Registered by CQC</Text>
        </View>
      </View>

      <Text style={styles.titleBox}>REFERENCE FORM</Text>

      {/* Main Info Table */}
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableColLabel}>Name of applicant:</Text>
          <Text style={styles.tableColContent}>{safeData.applicantName}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableColLabel}>Position applied for:</Text>
          <Text style={styles.tableColContent}>
            {safeData.positionApplied || ''}
          </Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableColLabel}>
            How long have you known the applicant?
          </Text>
          <Text style={styles.tableColContent}>{safeData.howLongKnown}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableColLabel}>Relationship to applicant:</Text>
          <Text style={styles.tableColContent}>{safeData.relationship}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableColLabel}>Employment Period</Text>
          <View
            style={[
              styles.tableColContent,
              { flexDirection: 'row', alignItems: 'center' },
            ]}
          >
            <Text style={{ marginRight: 5, fontSize: 9 }}>From:</Text>
            <Text style={{ marginRight: 20, fontWeight: 'bold' }}>
              {fmtDate(safeData.employmentFrom) || 'N/A'}
            </Text>
            <Text style={{ marginRight: 5, fontSize: 9 }}>Till:</Text>
            <Text style={{ fontWeight: 'bold' }}>
              {fmtDate(safeData.employmentTill) || 'Present'}
            </Text>
          </View>
        </View>
        <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.tableColLabel}>Reason for leaving:</Text>
          <Text style={styles.tableColContent}>
            {safeData.reasonForLeaving}
          </Text>
        </View>
      </View>

      <View style={{ padding: 5, marginBottom: 5 }}>
        <Text
          style={{
            fontSize: 9,
            color: '#2c5282',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          Our Points of Culture are based on "Being Courteous, Promoting
          Independence and Developing Trust"
        </Text>
      </View>

      {/* Characteristics Grid */}
      <View style={[styles.table, { borderWidth: 0.25 }]}>
        <View style={[styles.gridRow, styles.gridHeader]}>
          <Text style={styles.colTrait}>
            Applicant's general ability / Characteristics
          </Text>
          <Text style={styles.colRating}>Very Good</Text>
          <Text style={styles.colRating}>Good</Text>
          <Text style={styles.colRatingLast}>Poor</Text>
        </View>
        {[
          {
            label: '1. Quality and organization of work',
            key: 'qualityOrganization',
          },
          { label: '2. Courteous and polite', key: 'courteousPolite' },
          {
            label: '3. Willingness to follow policies',
            key: 'willingnessFollowPolicies',
          },
          { label: '4. Integrity and trust', key: 'integrityTrust' },
          {
            label: '5. Attitude towards equal opportunities',
            key: 'attitudeEqualOpportunities',
          },
          { label: '6. Emotional Control', key: 'emotionalControl' },
          { label: '7. Pro-active approach to work', key: 'proactiveApproach' },
          { label: '8. Respect to and from team', key: 'respectTeam' },
          {
            label: '9. Empathy towards service user / clients',
            key: 'empathyClients',
          },
          {
            label: '10. Attitudes towards criticism',
            key: 'attitudesCriticism',
          },
          { label: '11. Grooming and Appearance', key: 'groomingAppearance' },
          {
            label: '12. Attendance / Punctuality',
            key: 'attendancePunctuality',
          },
        ].map((item, idx) => {
          const val = safeData[item.key];
          return (
            <View style={styles.gridRow} key={idx}>
              <Text style={styles.colTrait}>{item.label}</Text>
              <Text style={styles.colRating}>
                {isRating(val, 'very good') ? 'X' : ''}
              </Text>
              <Text style={styles.colRating}>
                {isRating(val, 'good') ? 'X' : ''}
              </Text>
              <Text style={styles.colRatingLast}>
                {isRating(val, 'poor') ? 'X' : ''}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Footer Questions */}
      <View style={[styles.table, { padding: 5 }]}>
        <Text>
          Do you know any reason(s) why, including health, which would make this
          applicant unsuitable for employment?
        </Text>
        <TextOrLine text={safeData.unsuitableReason} />
        <View
          style={{
            flexDirection: 'row',
            marginTop: 10,
            marginBottom: 5,
            alignItems: 'center',
          }}
        >
          <Text style={{ flex: 1 }}>Would you re-employ this applicant?</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SquareOption
              label="Yes"
              selected={isYes(safeData.wouldReemploy)}
            />
            <SquareOption label="No" selected={isNo(safeData.wouldReemploy)} />
          </View>
        </View>
        <Text>If 'No' please state the reason.</Text>
        <TextOrLine text={safeData.noReemployReason} />
        <Text style={{ marginTop: 10 }}>
          Please give your opinion of the applicant's suitability for the post
          applied for
        </Text>
        <TextOrLine text={safeData.suitabilityOpinion} />
      </View>

      {/* Signature Section */}
      <View
        style={[
          styles.table,
          {
            flexDirection: 'row',
            flexWrap: 'wrap',
            padding: 5,
            borderBottomWidth: 0.25,
          },
        ]}
      >
        <View style={{ width: '50%', padding: 3 }}>
          <Text>
            Position:
            <Text style={{ fontFamily: 'Helvetica-Bold', marginLeft: 6 }}>
              {' '}
              {safeData.refereePosition}
            </Text>
          </Text>
        </View>

        <View style={{ width: '50%', padding: 3 }}>
          <Text>
            Sign:
            <Text
              style={{ fontFamily: 'Helvetica-Bold', marginLeft: 6 }}
            ></Text>
          </Text>
        </View>

        <View style={{ width: '50%', padding: 3 }}>
          <Text>
            Name:
            <Text style={{ fontFamily: 'Helvetica-Bold', marginLeft: 6 }}>
              {' '}
              {safeData.refereeName}
            </Text>
          </Text>
        </View>

        <View style={{ width: '50%', padding: 3 }}>
          <Text>
            Date:
            <Text style={{ fontFamily: 'Helvetica-Bold', marginLeft: 6 }}>
              {' '}
              {fmtDate(safeData.refereeDate || safeData.createdAt)}
            </Text>
          </Text>
        </View>
      </View>
    </Page>
  );
};

const PersonalPage = ({ data }) => {
  const safeData = data || {};

  // Helper: normalize string comparison (optional but safer)
  const isSelected = (value: any, expected: string | boolean): boolean => {
    if (typeof expected === 'boolean') {
      return value === expected;
    }
    if (typeof value === 'string' && typeof expected === 'string') {
      return value.toLowerCase() === expected.toLowerCase();
    }
    return false;
  };

  return (
    <Page style={styles.page}>
      <View style={{ alignItems: 'center', marginBottom: 15 }}>
        <Image
          src="/logo.png"
          style={{
            width: 140,
            height: 40,
            marginTop: 4,
            objectFit: 'contain',
          }}
        />
      </View>

      <Text style={{ fontWeight: 'bold', fontSize: 11, marginBottom: 10 }}>
        CHARACTER REFERENCE QUESTIONNAIRE - Please answer all questions.
      </Text>

      <View style={{ marginBottom: 15 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 5,
          }}
        >
          <Text>Post Applied for: {safeData.positionApplied || ''}</Text>
          <Text>Based in: The community</Text>
        </View>
        <Text style={{ marginBottom: 5 }}>
          Name of applicant: {safeData.applicantName}
        </Text>
        <Text style={{ marginBottom: 5 }}>
          Relationship to applicant: {safeData.relationship}
        </Text>
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: '#000',
            marginVertical: 5,
          }}
        />
      </View>

      {/* Q1 */}
      <View style={styles.questionRow}>
        <Text>1. How long has the applicant been known to you?</Text>
        <Text style={{ fontWeight: 'bold', marginRight:20 }}>{safeData.howLongKnown}</Text>
      </View>

      {/* Q2 */}
      <View style={styles.questionRow}>
        <Text>
          2. Does the applicant suffer from any serious or recurring illness?
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <SquareOption
            label="YES"
            selected={isSelected(safeData.seriousIllness, 'yes') || safeData.seriousIllness === true}
          />
          <SquareOption
            label="NO"
            selected={isSelected(safeData.seriousIllness, 'no') || safeData.seriousIllness === false}
          />
        </View>
      </View>

      {/* Q3 */}
      <View style={styles.questionRow}>
        <Text>
          3. Was the applicant to your personal knowledge dependent upon drugs?
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <SquareOption
            label="YES"
            selected={isSelected(safeData.drugsDependency, 'yes') || safeData.drugsDependency === true}
          />
          <SquareOption
            label="NO"
            selected={isSelected(safeData.drugsDependency, 'no') || safeData.drugsDependency === false}
          />
        </View>
      </View>

      {/* Q4 Traits */}
      <View style={{ marginTop: 10 }}>
        <Text style={{ marginBottom: 5 }}>
          4. From what you know of the applicant, would you consider them to be:
        </Text>
        {[
          { label: 'Reliable', key: 'reliable' },
          { label: 'Punctual', key: 'punctual' },
          { label: 'Trustworthy', key: 'trustworthy' },
          { label: 'Approachable', key: 'approachable' },
          { label: 'Tactful', key: 'tactful' },
          { label: 'Discreet', key: 'discreet' },
          { label: 'Self motivated', key: 'selfMotivated' },
          { label: 'Able to work alone', key: 'ableToWorkAlone' },
        ].map((item) => (
          <View key={item.key} style={[styles.questionRow, { paddingLeft: 20 }]}>
            <Text>{item.label}</Text>
            <View style={{ flexDirection: 'row' }}>
              <SquareOption
                label="YES"
                selected={isSelected(safeData[item.key], 'yes') || safeData[item.key] === true}
              />
              <SquareOption
                label="NO"
                selected={isSelected(safeData[item.key], 'no') || safeData[item.key] === false}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Q5 Ratings */}
      <View style={{ marginTop: 10 }}>
        <Text style={{ marginBottom: 5 }}>
          5. Bearing in mind that the applicant will deal with a variety of
          situations, how would you rate their level of:
        </Text>
        {['Competency', 'Common sense'].map((label) => {
          const key = label === 'Competency' ? 'competency' : 'commonSense';
          const val = safeData[key];
          return (
            <View
              key={label}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 5,
                paddingLeft: 20,
              }}
            >
              <Text style={{ width: 100 }}>{label}</Text>
              <SquareOption label="Very good" selected={isSelected(val, 'very good')} />
              <SquareOption label="Good" selected={isSelected(val, 'good')} />
              <SquareOption label="Satisfactory" selected={isSelected(val, 'satisfactory')} />
              <SquareOption label="Poor" selected={isSelected(val, 'poor')} />
            </View>
          );
        })}
      </View>

      {/* Q6 Service Users */}
      <View style={{ marginTop: 10 }}>
        <Text style={{ marginBottom: 5 }}>
          6. Do you consider that the applicant relates well with / would relate
          well with service users in their care:
        </Text>
        <View style={{ flexDirection: 'row', paddingLeft: 40 }}>
          <SquareOption label="Yes" selected={isSelected(safeData.relatesWell, 'yes')} />
          <SquareOption label="No" selected={isSelected(safeData.relatesWell, 'no')} />
          <SquareOption label="Unsure" selected={isSelected(safeData.relatesWell, 'unsure')} />
        </View>
      </View>

      {/* Criminal Record Question */}
      <View style={{ marginTop: 15 }}>
        <Text style={{ fontSize: 9 }}>
          This position is exempted from the rehabilitation of offenders Act
          1974, and any convictions must be declared. Are you aware of any
          cautions, convictions or pending prosecutions held by the applicant?
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 5,
          }}
        >
          <SquareOption
            label="Yes"
            selected={isSelected(safeData.cautionsConvictions, 'yes') || safeData.cautionsConvictions === true}
          />
          <SquareOption
            label="No"
            selected={isSelected(safeData.cautionsConvictions, 'no') || safeData.cautionsConvictions === false}
          />
        </View>
      </View>

      {/* Additional Comments */}
      <View style={{ marginTop: 15 }}>
        <Text>
          Would you like to make any other comments about the suitability of the
          applicant for this post?
        </Text>
        <TextOrLine text={safeData.additionalComments} numLines={3} />
      </View>

      {/* Referee Details */}
      <View style={{ marginTop: 20 }}>
        <Text>Name: {safeData.refereeName}</Text>
        <TextOrLine text={safeData.refereeName} style={{ height: 1 }} />

        <Text style={{ marginTop: 5 }}>Signed:  </Text>
        <TextOrLine text={safeData.refereeName} style={{ height: 1 }} />

        <Text style={{ marginTop: 5 }}>
          Position held: {safeData.refereePosition}
        </Text>
        <TextOrLine text={safeData.refereePosition} style={{ height: 1 }} />

        <Text style={{ marginTop: 5 }}>
          Date: {fmtDate(safeData.refereeDate || safeData.createdAt)}
        </Text>
        <TextOrLine
          text={fmtDate(safeData.refereeDate || safeData.createdAt)}
          style={{ height: 1 }}
        />
      </View>

      <Text style={{ marginTop: 50, fontWeight: 'bold' }}>
        Thank you for completing this reference questionnaire.
      </Text>

      {/* Office Use Only */}
      <View style={styles.officeBox}>
  <Text
    style={{
      fontWeight: 'bold',
      textDecoration: 'underline',
      marginBottom: 15,
      marginTop: 10,
    }}
  >
    OFFICE USE ONLY PLEASE
  </Text>

  <View style={{ flexDirection: 'row', marginBottom: 15 }}>
    <Text style={{ marginRight: 20 }}>Reference Suitable:</Text>
    <SquareOption label="Yes" selected={false} />
    <SquareOption label="No" selected={false} />
  </View>

  <Text style={{ marginBottom: 15 }}>
    Comments: _____________________________________________
  </Text>

  <Text style={{ marginTop: 10, marginBottom: 15 }}>
    Reference Checked & Verified by: Manager Name: _________________
  </Text>

  <Text style={{ marginBottom: 15 }}>
    Signature: ______________________
  </Text>
</View>

    </Page>
  );
};

// --- Main Export ---

interface PdfProps {
  type: 'professional' | 'personal';
  data: any;
  refereeData?: any; // Marked optional to be safe
  logoUrl?: string;
}

export const ReferencePdfDocument = ({
  type,
  data,
}: PdfProps) => {
  // Ensure we have a valid object to prevent crashes if 'data' is undefined/null
  const safeData = data || {};

  return (
    <Document>
      {type === 'professional' ? (
        <ProfessionalPage data={safeData} />
      ) : (
        <PersonalPage data={safeData} />
      )}
    </Document>
  );
};