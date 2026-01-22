import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Polyline,
  Svg
} from '@react-pdf/renderer';

// Standardized constants for Professional Look
const BORDER_COLOR = '#bfbfbf';
const BORDER_WIDTH = 0.25;
const FONT_SIZE = 9;
const HEADER_SIZE = 10;

const styles = StyleSheet.create({
  page: {
    padding: 25,
    fontFamily: 'Helvetica',
    fontSize: FONT_SIZE,
    paddingBottom: 40,
    color: '#000'
  },
  header: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5
  },
  sectionHeader: {
    fontSize: HEADER_SIZE,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: '#f2f2f2',
    padding: 3,
    borderTop: `${BORDER_WIDTH} solid ${BORDER_COLOR}`,
    borderBottom: `${BORDER_WIDTH} solid ${BORDER_COLOR}`
  },
  subSectionHeader: {
    fontSize: FONT_SIZE,
    fontWeight: 'bold',
    marginBottom: 2,
    marginTop: 4,
    textDecoration: 'underline'
  },
  logo: {
    width: 40,
    height: 40,
    position: 'absolute',
    top: -15,
    right: 25
  },
  table: {
    display: 'flex',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: BORDER_WIDTH,
    borderColor: BORDER_COLOR,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: BORDER_WIDTH,
    marginBottom: 5
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 14,
    borderBottom: `${BORDER_WIDTH} solid ${BORDER_COLOR}` // Ensure row borders
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: BORDER_WIDTH,
    borderColor: BORDER_COLOR,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0, // Handled by row
    padding: 3,
    justifyContent: 'center'
  },
  tableColHeader: {
    borderStyle: 'solid',
    borderWidth: BORDER_WIDTH,
    borderColor: BORDER_COLOR,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    padding: 3,
    fontWeight: 'bold',
    backgroundColor: '#f9f9f9',
    justifyContent: 'center'
  },
  footer: {
    position: 'absolute',
    fontSize: 7,
    bottom: 15,
    left: 25,
    right: 25,
    textAlign: 'center',
    borderTop: `${BORDER_WIDTH} solid ${BORDER_COLOR}`,
    paddingTop: 4,
    color: '#666'
  },
  signatureLine: {
    marginTop: 35,
    borderBottom: `${BORDER_WIDTH} solid ${BORDER_COLOR}`,
    width: 180
  },
  textBlock: {
    marginBottom: 4,
    textAlign: 'justify'
  },
  checkbox: {
    width: 8,
    height: 8,
    border: `${BORDER_WIDTH} solid ${BORDER_COLOR}`,
    marginRight: 5
  }
});

// Helper functions
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('en-GB');
  } catch {
    return dateString;
  }
};

const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const safeGet = (obj: any, path: string) => {
  const res = path
    .split('.')
    .reduce((acc, k) => (acc && acc[k] ? acc[k] : ''), obj);
  return typeof res === 'string' ? capitalizeFirstLetter(res) : res;
};

interface Props {
  formData: any;
}

const ApplicationFormPDF: React.FC<Props> = ({ formData }) => {
  const data = formData || {};
  const totalPages = 3;

  const PDFooter = ({ page }: { page: number }) => (
    <Text style={styles.footer}>
      Page {page} of {totalPages} - {new Date().toLocaleDateString('en-GB')}
    </Text>
  );

  const HeaderLogo = () => (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.header}>WATNEY COLLEGE</Text>
      <Image style={styles.logo} src="/logo.png" />
    </View>
  );

  return (
    <Document>
      {/* ================= PAGE 1: Sections A, B, C ================= */}
      <Page size="A4" style={styles.page}>
        <HeaderLogo />

        {/* SECTION A: PERSONAL DETAILS (Updated with User Request) */}
        <Text style={styles.sectionHeader}>SECTION A: PERSONAL DETAILS</Text>
        <View style={styles.table}>
          {/* Row A1 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Title: (Mr/Mrs/Ms)</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{capitalizeFirstLetter(data.title || '')}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>First Name:</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{capitalizeFirstLetter(data.firstName || '')}</Text>
            </View>
          </View>

          {/* Row A2 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Middle Name:</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{capitalizeFirstLetter(data.initial || '')}</Text>
            </View>
          </View>

          {/* Row A3 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Last Name:</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{capitalizeFirstLetter(data.lastName || '')}</Text>
            </View>
          </View>

          {data.studentType === 'eu' && (
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: '30%' }]}>
                <Text>Nationality:</Text>
              </View>
              <View style={[styles.tableCol, { width: '70%' }]}>
                <Text>{capitalizeFirstLetter(data.nationality || '')}</Text>
              </View>
            </View>
          )}

          {/* Row A6 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Date Of Birth: (dd/mm/yyyy)</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{formatDate(data.dateOfBirth)}</Text>
            </View>
          </View>

          {/* Row A7 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Country Of Birth:</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{capitalizeFirstLetter(data.countryOfBirth || '')}</Text>
            </View>
          </View>

          {/* Row A8 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Gender:</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{capitalizeFirstLetter(data.gender || '')}</Text>
            </View>
          </View>

          {/* Row A9 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Home Address:</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>
                First Line:{' '}
                {capitalizeFirstLetter(data.residentialAddressLine1 || '')},
                Road / Street:{' '}
                {capitalizeFirstLetter(data.residentialAddressLine2 || '')},
                City: {capitalizeFirstLetter(data.residentialCity || '')}, Post
                Code: {(data.residentialPostCode || '').toUpperCase()}, Country:{' '}
                {capitalizeFirstLetter(data.residentialCountry || '')}
              </Text>
            </View>
          </View>

          {/* Row A10 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Contact Address (if different)</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              {!data.sameAsResidential ? (
                <Text>
                  First Line:{' '}
                  {capitalizeFirstLetter(data.postalAddressLine1 || '')}, Road /
                  Street: {capitalizeFirstLetter(data.postalAddressLine2 || '')}
                  , City: {capitalizeFirstLetter(data.postalCity || '')}, Post
                  Code: {(data.postalPostCode || '').toUpperCase()}, Country:{' '}
                  {capitalizeFirstLetter(data.postalCountry || '')}
                </Text>
              ) : (
                <Text>Same As Home Address</Text>
              )}
            </View>
          </View>

          {/* Row A11 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Contact Number:</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{data.phone || ''}</Text>
            </View>
          </View>

          {/* Row A12 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Email Address:</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{data.email || ''}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Country Of Residence:</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>
                {capitalizeFirstLetter(data.countryOfResidence || '')}
              </Text>
            </View>
          </View>
          {/* 
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Ethnicity:</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{capitalizeFirstLetter(data.ethnicity || '')}</Text>
            </View>
          </View>

          {data.ethnicity === 'other' && (
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: '30%' }]}>
                <Text>Specify Ethnicity:</Text>
              </View>
              <View style={[styles.tableCol, { width: '70%' }]}>
                <Text>{capitalizeFirstLetter(data.customEthnicity || '')}</Text>
              </View>
            </View>
          )} */}

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Marital Status</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{capitalizeFirstLetter(data.maritalStatus || '')}</Text>
            </View>
          </View>

          {data.studentType === 'eu' && (
            <>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '30%' }]}>
                  <Text>Immigration Status</Text>
                </View>
                <View style={[styles.tableCol, { width: '70%' }]}>
                  <Text>
                    {capitalizeFirstLetter(data.immigrationStatus || '')}
                  </Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '30%' }]}>
                  <Text>Please provide your LTR (Leave to Remain) Code</Text>
                </View>
                <View style={[styles.tableCol, { width: '70%' }]}>
                  <Text>{(data.ltrCode || '').toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '30%' }]}>
                  <Text>National Insurance (NI) Number </Text>
                </View>
                <View style={[styles.tableCol, { width: '70%' }]}>
                  <Text>{(data.niNumber || '').toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '30%' }]}>
                  <Text>Have You Applied For Student Finance Before?</Text>
                </View>
                <View style={[styles.tableCol, { width: '70%' }]}>
                  <Text>
                    {capitalizeFirstLetter(data.studentFinance || '')}
                  </Text>
                </View>
              </View>
            </>
          )}

          {data.studentType === 'international' && (
            <>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '30%' }]}>
                  <Text>Do You Require A Visa To Come To The UK?</Text>
                </View>
                <View style={[styles.tableCol, { width: '70%' }]}>
                  <Text>{capitalizeFirstLetter(data.visaRequired || '')}</Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '30%' }]}>
                  <Text>From Where Are You Making Your Application?</Text>
                </View>
                <View style={[styles.tableCol, { width: '70%' }]}>
                  <Text>
                    {capitalizeFirstLetter(data.applicationLocation || '')}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* SECTION B */}
        <Text style={styles.sectionHeader}>
          SECTION B: QUALIFICATIONS OBTAINED
        </Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: '30%' }]}>
              <Text>Qualification</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '20%' }]}>
              <Text>Award Date</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '30%' }]}>
              <Text>College/ University</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '20%' }]}>
              <Text>Grade</Text>
            </View>
          </View>

          {/* LOGIC: Use real data if it exists, otherwise use 3 empty objects */}
          {(data.educationData && data.educationData.length > 0 
              ? data.educationData 
              : [{}, {}, {}, {}, {}]
            )
            .slice(0, 5)
            .map((edu: any, i: number) => (
              <View key={i} style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '30%' }]}>
                  <Text>{capitalizeFirstLetter(edu.qualification)}</Text>
                </View>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text>{formatDate(edu.awardDate)}</Text>
                </View>
                <View style={[styles.tableCol, { width: '30%' }]}>
                  <Text>{capitalizeFirstLetter(edu.institution)}</Text>
                </View>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text>{capitalizeFirstLetter(edu.grade)}</Text>
                </View>
              </View>
            ))}
        </View>

        {/* SECTION C */}
        <Text style={styles.sectionHeader}>
          SECTION C: PREVIOUS STUDY IN UK
        </Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '85%' }]}>
              <Text>Have you studied or applied to study in the UK?</Text>
            </View>
            <View style={[styles.tableCol, { width: '15%' }]}>
              <Text>{capitalizeFirstLetter(data.enteredUKBefore)}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '85%' }]}>
              <Text>Have you received a visa refusal?</Text>
            </View>
            <View style={[styles.tableCol, { width: '15%' }]}>
              <Text>{capitalizeFirstLetter(data.visaRefusal)}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '85%' }]}>
              <Text>Date of first entry (if applicable)</Text>
            </View>
            <View style={[styles.tableCol, { width: '15%' }]}>
              <Text>{formatDate(data.firstEnterDate)}</Text>
            </View>
          </View>
        </View>

        {/* SECTION D */}
       {/* SECTION D: EMPLOYMENT INFORMATION */}
        <Text style={styles.sectionHeader}>
          SECTION D: EMPLOYMENT INFORMATION
        </Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: '25%' }]}>
              <Text>Nature of work/training</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '25%' }]}>
              <Text>Name of organisation</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '15%' }]}>
              <Text>Full-time or Part-time</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '15%' }]}>
              <Text>From</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '20%' }]}>
              <Text>To</Text>
            </View>
          </View>

          {(() => {
            // 1. Merge Current and Previous jobs into one array
            const allJobs = [];
            if (data.currentEmployment) {
              allJobs.push({ ...data.currentEmployment, isCurrent: true });
            }
            if (data.previousEmployments && data.previousEmployments.length > 0) {
              allJobs.push(...data.previousEmployments);
            }

            // 2. Determine render list: Real data OR 3 empty placeholders
            const renderList = allJobs.length > 0 ? allJobs : [{}, {}, {}, {}, {}];

            // 3. Render (Slicing to 3 ensures we don't overflow if that's a requirement, remove slice if you want all jobs)
            return renderList.slice(0, 5).map((job: any, i: number) => (
              <View key={i} style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '25%' }]}>
                  <Text>{capitalizeFirstLetter(job.jobTitle)}</Text>
                </View>
                <View style={[styles.tableCol, { width: '25%' }]}>
                  <Text>{capitalizeFirstLetter(job.employer)}</Text>
                </View>
                <View style={[styles.tableCol, { width: '15%' }]}>
                  <Text>{capitalizeFirstLetter(job.employmentType)}</Text>
                </View>
                <View style={[styles.tableCol, { width: '15%' }]}>
                  <Text>{formatDate(job.startDate)}</Text>
                </View>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text>
                    {/* Logic: If it's the current job, show 'Present', otherwise show End Date */}
                    {job.isCurrent ? 'Present' : formatDate(job.endDate)}
                  </Text>
                </View>
              </View>
            ));
          })()}
        </View>

        <PDFooter page={1} />
      </Page>

      {/* ================= PAGE 2: Sections D, E, F ================= */}
      <Page size="A4" style={styles.page}>
        <HeaderLogo />

        {/* SECTION E */}
        <Text style={styles.sectionHeader}>
          SECTION E: Diversity and Equality Policy Statement
        </Text>
        <Text style={styles.textBlock}>
          Watney College is committed to equality of opportunity and to a
          pro-active and inclusive approach to equality, which supports and
          encourages all under-represented groups, promotes an inclusive
          culture, and values diversity. In pursuit of this it is essential that
          no person shall experience more or less favourable treatment on the
          grounds of disability, gender, gender expression and identity, sexual
          orientation, marital or parental status, age, race, colour, ethnic
          origin, nationality, trade union membership and activity, political or
          religious beliefs, socio-economic background and any other
          distinction. Protected groups are defined in the Equality Act 2010 as
          regarding gender, gender re-assignment, marriage or civil partnership,
          pregnancy or maternity, race (including ethnic or national origin,
          nationality or colour), disability, sexual orientation, age, or
          religion or belief In order to ensure the effective implementation of
          this policy, the WC will monitor its employment related policies,
          practices and procedures on a continuing basis. Where appropriate,
          action will be taken to address any matters arising from monitoring.
          As an approved user of the disability symbol we are committed to
          employing disabled people and will interview all applicants with a
          disability recognised within the definition of the Equality Act 2010,
          who meet the minimum criteria for a job vacancy and consider them on
          their abilities. The Act defines disability as a physical or mental
          impairment, which has a substantial and long-term adverse effect on a
          person’s ability to carry out normal day to day activities. Long term
          is taken to mean lasting for a period greater than twelve months or
          where the total period is likely to last at least twelve months. If
          you are in any doubt about whether you meet this definition please
          contact Human Resources. Please complete all relevant questions on the
          form below. This information is confidential and will be stored
          electronically and manually in Human Resources for monitoring purposes
          only. This form will not be passed on to those making a selection
          decision.
        </Text>

        <Text style={styles.sectionHeader}>
          SECTION F: EQUALITY AND DIVERSITY MONITORING
        </Text>

        {/* Logic to determine if a field is selected */}
        {(() => {
          // Normalize input for comparison
          const check = (
            field: string,
            targetValues: string | string[]
          ): boolean => {
            const value = data[field];
            if (!value) return false;
            const normalizedInput = value.toLowerCase().trim();

            if (Array.isArray(targetValues)) {
              return targetValues.some(
                (v) => v.toLowerCase().trim() === normalizedInput
              );
            }
            return normalizedInput === targetValues.toLowerCase().trim();
          };

          // Helper to render the Tick (Using SVG)
          // Accepts optional style/width overrides
          const RenderTick = ({
            field,
            match,
            style,
            noBorderRight
          }: {
            field: string;
            match: string | string[];
            style?: any;
            noBorderRight?: boolean;
          }) => (
            <View
              style={[
                styles.tableCol,
                { alignItems: 'center', justifyContent: 'center' },
                style, // Apply width overrides
                noBorderRight ? { borderRightWidth: 0 } : {}
              ]}
            >
              {check(field, match) ? (
                <Svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
                  <Polyline
                    points="20 6 9 17 4 12"
                    stroke="black"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              ) : null}
            </View>
          );

          // Helper to render a 4-column Row for Ethnicity/Religion
          const DoubleRow = (
            label1: string,
            match1: string | string[],
            label2: string,
            match2: string | string[],
            field: string = 'ethnicityValue'
          ) => (
            <View style={styles.tableRow}>
              {/* Col 1 */}
              <View style={[styles.tableCol, { width: '40%' }]}>
                <Text>{label1}</Text>
              </View>
              <RenderTick
                field={field}
                match={match1}
                style={{ width: '10%' }}
              />

              {/* Col 2 */}
              <View style={[styles.tableCol, { width: '40%' }]}>
                <Text>{label2}</Text>
              </View>
              <RenderTick
                field={field}
                match={match2}
                style={{ width: '10%', borderRightWidth: 0 }}
              />
            </View>
          );

          return (
            <>
              <Text
                style={[
                  styles.subSectionHeader,
                  { marginTop: 5, marginBottom: 5 }
                ]}
              >
                Ethnicity
              </Text>
              <View style={styles.table}>
                {DoubleRow(
                  'White',
                  ['english', 'scottish', 'welsh', 'irish', 'other_white'],
                  'Other Asian background',
                  'other_asian'
                )}
                {DoubleRow(
                  'Gypsy or Traveller',
                  'gypsy_traveller',
                  'Mixed – White and Black Caribbean',
                  'white_black_caribbean'
                )}
                {DoubleRow(
                  'Black or Black British - Caribbean',
                  'caribbean',
                  'Mixed – White and Black African',
                  'white_black_african'
                )}
                {DoubleRow(
                  'Black or Black British – African',
                  'african',
                  'Mixed – White and Asian',
                  'white_asian'
                )}
                {DoubleRow(
                  'Other Black background',
                  'other_black',
                  'Other mixed background',
                  'other_mixed'
                )}
                {DoubleRow(
                  'Asian or Asian British – Indian',
                  'indian',
                  'Arab',
                  'arab'
                )}
                {DoubleRow(
                  'Asian or Asian British – Sri Lankan',
                  'sri_lankan',
                  'Other ethnic background',
                  'other_ethnic'
                )}
                {DoubleRow(
                  'Asian or Asian British - Nepali',
                  'nepali',
                  'Prefer Not to Say/ Information Refused',
                  'prefer_not_to_say'
                )}
                {/* Final partial row for Chinese */}
                <View style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '40%' }]}>
                    <Text>Chinese</Text>
                  </View>
                  <RenderTick
                    field="ethnicityValue"
                    match="chinese"
                    style={{ width: '10%' }}
                  />
                  <View
                    style={[
                      styles.tableCol,
                      { width: '50%', borderRightWidth: 0 }
                    ]}
                  />
                </View>
              </View>

              {/* --- RELIGION TABLE --- */}
              <Text
                style={[
                  styles.subSectionHeader,
                  { marginTop: 5, marginBottom: 5 }
                ]}
              >
                Religion or Belief
              </Text>
              <View style={styles.table}>
                {DoubleRow(
                  'No Religion',
                  'no_religion',
                  'Christian – Other Denomination',
                  'christian_other',
                  'religion'
                )}
                {DoubleRow(
                  'Buddhist',
                  'buddhist',
                  'Hindu',
                  'hindu',
                  'religion'
                )}
                {DoubleRow(
                  'Christian',
                  'christian',
                  'Jewish',
                  'jewish',
                  'religion'
                )}
                {DoubleRow(
                  'Christian – Church of Scotland',
                  'christian_church_of_scotland',
                  'Muslim',
                  'muslim',
                  'religion'
                )}
                {DoubleRow(
                  'Christian – Roman Catholic',
                  'christian_roman_catholic',
                  'Sikh',
                  'sikh',
                  'religion'
                )}
                {DoubleRow(
                  'Christian – Presbyterian Church in Ireland',
                  'christian_presbyterian',
                  'Spiritual',
                  'spiritual',
                  'religion'
                )}
                {DoubleRow(
                  'Christian – Church of Ireland',
                  'christian_church_of_ireland',
                  'Any other Religion or Belief',
                  'other_religion',
                  'religion'
                )}
                {DoubleRow(
                  'Christian – Methodist Church in Ireland',
                  'christian_methodist',
                  'Prefer Not to Say/ Information Refused',
                  'prefer_not_to_say',
                  'religion'
                )}
              </View>

              {/* --- SECTION 10 & 11 HEADER --- */}
              <View style={{ flexDirection: 'row', width: '100%' }}>
                <View style={{ width: '50%' }}>
                  <Text
                    style={[
                      styles.subSectionHeader,
                      { marginTop: 5, marginBottom: 5 }
                    ]}
                  >
                    Sexual Orientation
                  </Text>
                </View>
                <View style={{ width: '50%', paddingLeft: 5 }}>
                  <Text
                    style={[
                      styles.subSectionHeader,
                      { marginTop: 5, marginBottom: 5 }
                    ]}
                  >
                    Gender Identity
                  </Text>
                </View>
              </View>

              {/* --- SPLIT TABLE (Section 10 Left | Section 11 Right) --- */}
              <View
                style={[
                  styles.table,
                  {
                    borderRightWidth: BORDER_WIDTH,
                    borderBottomWidth: BORDER_WIDTH
                  }
                ]}
              >
                <View style={{ flexDirection: 'row' }}>
                  {/* LEFT COLUMN: Section 10 (Sexual Orientation) - STRICTLY 2 COLUMNS */}
                  <View
                    style={{
                      width: '50%',
                      borderRight: `${BORDER_WIDTH} solid ${BORDER_COLOR}`
                    }}
                  >
                    {[
                      { l: 'Bisexual', v: 'bisexual' },
                      { l: 'Gay Man', v: 'gay_man' },
                      { l: 'Gay Woman/Lesbian', v: 'gay_woman_lesbian' },
                      { l: 'Heterosexual', v: 'heterosexual' },
                      { l: 'Other', v: 'other' }
                    ].map((item) => (
                      <View
                        key={item.v}
                        style={[
                          styles.tableRow,
                          {
                            borderBottom: `${BORDER_WIDTH} solid ${BORDER_COLOR}`
                          }
                        ]}
                      >
                        {/* Label Column: 85% */}
                        <View style={[styles.tableCol, { width: '85%' }]}>
                          <Text>{item.l}</Text>
                        </View>
                        {/* Tick Column: 15% (No Right Border to align with container) */}
                        <RenderTick
                          field="sexualOrientation"
                          match={item.v}
                          style={{ width: '15%' }}
                          noBorderRight={true}
                        />
                      </View>
                    ))}

                    {/* Prefer Not to Say Row */}
                    <View style={[styles.tableRow, { borderBottom: 0 }]}>
                      <View style={[styles.tableCol, { width: '85%' }]}>
                        <Text>Prefer Not to Say/ Information Refused</Text>
                      </View>
                      <RenderTick
                        field="sexualOrientation"
                        match="prefer_not_to_say"
                        style={{ width: '15%' }}
                        noBorderRight={true}
                      />
                    </View>
                  </View>

                  {/* RIGHT COLUMN: Section 11 (Gender Identity) */}
                  <View style={{ width: '50%' }}>
                    <View
                      style={{
                        padding: 3,
                        borderBottom: `${BORDER_WIDTH} solid ${BORDER_COLOR}`,
                        flexGrow: 1
                      }}
                    >
                      <Text style={{ marginBottom: 10 }}>
                        Is your gender identity the same gender as you were
                        originally assigned at birth?
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-around',
                          alignItems: 'center',
                          marginBottom: 15
                        }}
                      >
                        {/* YES Box */}
                        <View
                          style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                          <Text style={{ marginRight: 5 }}>Yes</Text>
                          <View
                            style={{
                              width: 24,
                              height: 24,
                              border: `1px solid ${BORDER_COLOR}`,
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {check('genderIdentitySameAtBirth', [
                              'yes',
                              'true'
                            ]) && (
                              <Svg
                                viewBox="0 0 24 24"
                                style={{ width: 18, height: 18 }}
                              >
                                <Polyline
                                  points="20 6 9 17 4 12"
                                  stroke="black"
                                  strokeWidth={3}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </Svg>
                            )}
                          </View>
                        </View>
                        {/* NO Box */}
                        <View
                          style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                          <Text style={{ marginRight: 5 }}>No</Text>
                          <View
                            style={{
                              width: 24,
                              height: 24,
                              border: `1px solid ${BORDER_COLOR}`,
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {check('genderIdentitySameAtBirth', [
                              'no',
                              'false'
                            ]) && (
                              <Svg
                                viewBox="0 0 24 24"
                                style={{ width: 18, height: 18 }}
                              >
                                <Polyline
                                  points="20 6 9 17 4 12"
                                  stroke="black"
                                  strokeWidth={3}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </Svg>
                            )}
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Prefer Not to Say (Section 11) */}
                    <View style={[styles.tableRow, { borderBottom: 0 }]}>
                      <View style={[styles.tableCol, { width: '85%' }]}>
                        <Text>Prefer Not to Say/ Information Refused</Text>
                      </View>
                      <RenderTick
                        field="genderIdentitySameAtBirth"
                        match="prefer_not_to_say"
                        style={{ width: '15%' }}
                        noBorderRight={true}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </>
          );
        })()}

        <PDFooter page={2} />
      </Page>

      {/* ================= PAGE 3: Sections I, G ================= */}
      {/* <Page size="A4" style={styles.page}>
        <HeaderLogo />
        
       
        <PDFooter page={3} />
      </Page> */}

      <Page size="A4" style={styles.page}>
        {/* SECTION F */}
        <Text style={styles.sectionHeader}>SECTION G: DISABILITY</Text>
        <Text style={styles.textBlock}>
          Watney College is committed to equality of opportunity and to creating
          an inclusive environment. No applicant will be treated less favourably
          on the grounds of any protected characteristic as defined by the
          Equality Act 2010, including age, disability, gender reassignment,
          marriage or civil partnership, pregnancy or maternity, race, religion
          or belief, sex, or sexual orientation. Watney College is a Disability
          Confident employer and will offer an interview to disabled applicants
          who meet the minimum criteria for the role.
        </Text>
        <Text style={styles.textBlock}>
          The Equality Act 2010 defines disability as a physical or mental
          impairment that has a substantial and long-term adverse effect on a
          person’s ability to carry out normal day-to-day activities.
          Information provided on this form is confidential, used for monitoring
          purposes only, and will not be shared with those involved in selection
          decisions.
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 5
          }}
        >
          <Text style={{ marginRight: 10 }}>
            Do you consider yourself to be disabled within the definition of the
            Equality Act 2010?
          </Text>
          <Text
            style={{ fontWeight: 'bold', border: `1px solid #000`, padding: 2 }}
          >
            {' '}
            {data.disability === 'yes' ? 'YES' : 'NO'}{' '}
          </Text>
        </View>
        <Text style={{ marginBottom: 2 }}>
          If you wish please give further details here{' '}
        </Text>
        <View
          style={{
            border: `${BORDER_WIDTH} solid ${BORDER_COLOR}`,
            height: 40,
            padding: 3,
            margin: 3
          }}
        >
          <Text>{capitalizeFirstLetter(data.disabilityDetails)}</Text>
        </View>
        <Text style={styles.textBlock}>
          You are not obliged to declare a disability and the EQAC recognises
          that many people who may be considered disabled under the terms of the
          (Disability and Discrimination Act (DDA) do not require any assistance
          or support. However for those who may, equipment, computer software,
          flexible working, other support or reasonable adjustment may be
          available, so an individual’s impairment would have little or no
          bearing on their capability to realise their employment potential.
        </Text>

        {/* SECTION G */}
        {/* SECTION G: REFEREES */}

        <Text style={styles.sectionHeader}>SECTION H: REFEREES</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {[data.referee1, data.referee2].map((ref, idx) => (
            <View
              key={idx}
              style={[
                styles.table,
                {
                  width: '49%',
                  borderRightWidth: BORDER_WIDTH,
                  borderBottomWidth: BORDER_WIDTH
                }
              ]}
            >
              <View style={styles.tableColHeader}>
                <Text>Referee {idx + 1}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>Name: {ref?.name || ''}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>Phone: {ref?.phone || ''}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>Email: {ref?.email || ''}</Text>
              </View>
              {/* Added styles.tableCol here to ensure the bottom border appears */}
              <View style={styles.tableCol}>
                <Text>
                  Address And Post Code:{' '}
                  {[ref?.address, ref?.postCode].filter(Boolean).join(', ')}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* SECTION H */}
        <Text style={styles.sectionHeader}>
          SECTION I: CONSENT & DATA PROTECTION
        </Text>
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          {/* Checkbox Column */}
          <View style={{ width: '7%', paddingTop: 30 }}>
            <View
              style={[
                styles.checkbox,
                {
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 26,
                  height: 26
                }
              ]}
            >
              {(data.acceptDataProcessing === true ||
                data.acceptDataProcessing === 'yes') && (
                <Svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
                  <Polyline
                    points="20 6 9 17 4 12"
                    stroke="black"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              )}
            </View>
          </View>

          <View style={{ width: '95%' }}>
            <Text style={styles.textBlock}>
              I confirm that I have read and understood how Watney College will
              use and process my personal data for purposes related to my
              application, enrolment, studies, student support, health and
              safety, and compliance with College policies and legal
              obligations. This includes academic records, learning support
              information, disciplinary matters, CCTV images, ID card
              photographs, and statutory data returns to the Higher Education
              Statistics Agency (HESA) and other relevant authorities.
            </Text>{' '}
            <Text style={styles.textBlock}>
              I understand that my personal data may be shared where necessary
              for academic references, further or higher education, employment
              verification, council tax purposes, or immigration compliance,
              including verification with the UK Home Office.
            </Text>

             <Text style={styles.textBlock}>
              I understand that my data will be processed in accordance with UK
              GDPR and the Data Protection Act 2018, and that I have the right
              to request access to my personal data.
            </Text>
          </View>

         
        </View>

        <Text style={styles.sectionHeader}>SECTION J: DECLARATION</Text>
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          {/* Checkbox Column */}
          <View style={{ width: '6%', paddingTop: 2 }}>
            <View
              style={[
                styles.checkbox,
                {
                  width: 26,
                  height: 26,
                  alignItems: 'center',
                  justifyContent: 'center'
                }
              ]}
            >
              {(data.acceptTerms === true || data.acceptTerms === 'yes') && (
                <Svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
                  <Polyline
                    points="20 6 9 17 4 12"
                    stroke="black"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              )}
            </View>
          </View>

          <View style={{ width: '95%' }}>
            <Text style={{ textAlign: 'justify' }}>
              I confirm that the information given on this form is true,
              complete and accurate and that none of the information requested
              or other material information has been omitted. I accept that if
              it is discovered that I have supplied false, inaccurate or
              misleading information, WATNEY COLLEGE reserves the right to
              cancel my application, withdraw its offer of a place or terminate
              attendance at the College and I shall have no claim against WATNEY
              COLLEGE in relation thereto.
            </Text>
          </View>
        </View>
        <View
          style={{
            marginTop: 30,
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          <View>
            <Text>Applicant Signature</Text>
            <View style={styles.signatureLine} />
          </View>
          <View>
            <Text>Date</Text>
            <View style={styles.signatureLine} />
          </View>
        </View>
        <Text style={{ marginBottom: 5, marginTop: 35 }}>
          Thank you for completing this form. Once completed, please return it
          to the following address
        </Text>
        <View>
          <Text style={{ fontWeight: 'bold' }}>Watney College</Text>
          <Text>80-82 Nelson Street, London, E1 2DY</Text>
          <Text>
            Email: admission@watneycollege.co.uk | Phone: +44 (0)208 004 6463
          </Text>
        </View>
        <PDFooter page={3} />
      </Page>

      {/* <Page size="A4" style={styles.page}>
        <HeaderLogo />

        <Text style={styles.sectionHeader}>SECTION J: DECLARATION</Text>
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          <View style={{ width: '6%', paddingTop: 2 }}>
            <View
              style={[
                styles.checkbox,
                {
                  width: 26,
                  height: 26,
                  alignItems: 'center',
                  justifyContent: 'center'
                }
              ]}
            >
              {(data.acceptTerms === true || data.acceptTerms === 'yes') && (
                <Svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
                  <Polyline
                    points="20 6 9 17 4 12"
                    stroke="black"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              )}
            </View>
          </View>

          <View style={{ width: '95%' }}>
            <Text style={{ textAlign: 'justify' }}>
              I confirm that the information given on this form is true,
              complete and accurate and that none of the information requested
              or other material information has been omitted. I accept that if
              it is discovered that I have supplied false, inaccurate or
              misleading information, WATNEY COLLEGE reserves the right to
              cancel my application, withdraw its offer of a place or terminate
              attendance at the College and I shall have no claim against WATNEY
              COLLEGE in relation thereto.
            </Text>
          </View>
        </View>
        <View
          style={{
            marginTop: 30,
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          <View>
            <Text>Applicant Signature</Text>
            <View style={styles.signatureLine} />
          </View>
          <View>
            <Text>Date</Text>
            <View style={styles.signatureLine} />
          </View>
        </View>
        <Text style={{ marginBottom: 5, marginTop: 35 }}>
          Thank you for completing this form. Once completed, please return it
          to the following address
        </Text>
        <View>
          <Text style={{ fontWeight: 'bold' }}>Watney College</Text>
          <Text>80-82 Nelson Street, London, E1 2DY</Text>
          <Text>
            Email: admission@watneycollege.co.uk | Phone: +44 (0)208 004 6463
          </Text>
        </View>

        <PDFooter page={4} />
      </Page> */}
    </Document>
  );
};

export default ApplicationFormPDF;
