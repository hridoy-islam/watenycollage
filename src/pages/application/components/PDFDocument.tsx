import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 15
  },
  subSectionHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5
  },
  table: {
    display: 'flex',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0
  },
  tableRow: {
    flexDirection: 'row'
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5
  },
  tableColHeader: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    fontWeight: 'bold'
  },
  footer: {
    position: 'absolute',
    fontSize: 8,
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: 'center',
    borderTop: '1px solid #ccc',
    paddingTop: 5
  },
  signatureLine: {
    marginTop: 30,
    borderBottom: '1px solid #000',
    width: 200
  },
  addressBlock: {
    marginTop: 20,
    fontSize: 9,
    textAlign: 'center'
  }
});

// Format date utility
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  } catch {
    return dateString;
  }
};

// Get today's date
const getTodaysDate = (): string => {
  return new Date().toLocaleDateString('en-GB');
};

// Capitalize first letter utility
const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Safe access to nested properties
const safeGet = (obj: any, path: string, defaultValue: string = ''): string => {
  if (!obj) return defaultValue;
  const keys = path.split('.');
  const result = keys.reduce(
    (acc, key) => (acc && acc[key] !== undefined ? acc[key] : defaultValue),
    obj
  );
  return typeof result === 'string'
    ? capitalizeFirstLetter(result)
    : String(result);
};

// Main PDF Component
interface ApplicationFormPDFProps {
  formData: any;
}

const ApplicationFormPDF: React.FC<ApplicationFormPDFProps> = ({
  formData
}) => {
  // Ensure formData is not undefined
  const data = formData || {};

  return (
    <Document>
      {/* Page 1 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>WATNEY COLLEGE</Text>
        <Text style={styles.sectionHeader}>APPLICATION FORM</Text>
        <Text style={styles.subSectionHeader}>SECTION A: PERSONAL DETAILS</Text>

        {/* Personal Details Table */}
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
              <Text>Home address:</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>
                First Line:{' '}
                {capitalizeFirstLetter(data.residentialAddressLine1 || '')}
              </Text>
              <Text>
                Road / Street:{' '}
                {capitalizeFirstLetter(data.residentialAddressLine2 || '')}
              </Text>
              <Text>
                City: {capitalizeFirstLetter(data.residentialCity || '')}
              </Text>
              <Text>County: </Text>
              <Text>
                Post Code: {(data.residentialPostCode || '').toUpperCase()}
              </Text>
              <Text>
                Country: {capitalizeFirstLetter(data.residentialCountry || '')}
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
                <>
                  <Text>
                    First Line:{' '}
                    {capitalizeFirstLetter(data.postalAddressLine1 || '')}
                  </Text>
                  <Text>
                    Road / Street:{' '}
                    {capitalizeFirstLetter(data.postalAddressLine2 || '')}
                  </Text>
                  <Text>
                    City: {capitalizeFirstLetter(data.postalCity || '')}
                  </Text>
                  <Text>County: </Text>
                  <Text>
                    Post Code: {(data.postalPostCode || '').toUpperCase()}
                  </Text>
                  <Text>
                    Country: {capitalizeFirstLetter(data.postalCountry || '')}
                  </Text>
                </>
              ) : (
                <Text>Same as home address</Text>
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
              <Text>Country Of Domicile:</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{capitalizeFirstLetter(data.countryOfDomicile || '')}</Text>
            </View>
          </View>
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
          )}

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
            </>
          )}
          {data.studentType === 'international' && (
            <>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '30%' }]}>
                  <Text>Do you require a visa to come to the UK?</Text>
                </View>
                <View style={[styles.tableCol, { width: '70%' }]}>
                  <Text>{capitalizeFirstLetter(data.requireVisa || '')}</Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '30%' }]}>
                  <Text>From where are you making your application?</Text>
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

        <Text style={styles.footer}>
          Application Form Page 1 of 4 - {getTodaysDate()}
        </Text>
      </Page>

      {/* Page 2 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>WATNEY COLLEGE</Text>

        {/* Section B */}
        <Text style={styles.sectionHeader}>
          SECTION B: QUALIFICATIONS OBTAINED
        </Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: '30%' }]}>
              <Text>Level / Qualification</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '20%' }]}>
              <Text>Award Date</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '30%' }]}>
              <Text>College/ University</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '20%' }]}>
              <Text>Results</Text>
            </View>
          </View>

          {Array.isArray(data.educationData) && data.educationData.length > 0
            ? data.educationData.map((edu: any, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '30%' }]}>
                    <Text>
                      {capitalizeFirstLetter(safeGet(edu, 'qualification'))}
                    </Text>
                  </View>
                  <View style={[styles.tableCol, { width: '20%' }]}>
                    <Text>{formatDate(safeGet(edu, 'awardDate'))}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '30%' }]}>
                    <Text>
                      {capitalizeFirstLetter(safeGet(edu, 'institution'))}
                    </Text>
                  </View>
                  <View style={[styles.tableCol, { width: '20%' }]}>
                    <Text>
                      {capitalizeFirstLetter(safeGet(edu, 'grade', ''))}
                    </Text>
                  </View>
                </View>
              ))
            : [...Array(3)].map((_, i) => (
                <View key={`empty-edu-${i}`} style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '30%' }]}>
                    <Text></Text>
                  </View>
                  <View style={[styles.tableCol, { width: '20%' }]}>
                    <Text></Text>
                  </View>
                  <View style={[styles.tableCol, { width: '30%' }]}>
                    <Text></Text>
                  </View>
                  <View style={[styles.tableCol, { width: '20%' }]}>
                    <Text></Text>
                  </View>
                </View>
              ))}
        </View>

        {/* Conditional rendering for English Qualification */}
        {data.studentType === 'international' && (
          <>
            <Text style={styles.sectionHeader}>ENGLISH QUALIFICATION</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <View style={[styles.tableColHeader, { width: '35%' }]}>
                  <Text>Test Type</Text>
                </View>
                <View style={[styles.tableColHeader, { width: '35%' }]}>
                  <Text>Score</Text>
                </View>
                <View style={[styles.tableColHeader, { width: '30%' }]}>
                  <Text>Test Date</Text>
                </View>
              </View>

              {/* Display English Qualification Data */}
              {data.englishQualification && data.englishQualification.type ? (
                <View style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '35%' }]}>
                    <Text>
                      {capitalizeFirstLetter(
                        data.englishQualification.englishTestType
                      )}
                    </Text>
                  </View>
                  <View style={[styles.tableCol, { width: '35%' }]}>
                    <Text>{data.englishQualification.englishTestScore}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '30%' }]}>
                    <Text>
                      {formatDate(data.englishQualification.englishTestDate)}
                    </Text>
                  </View>
                </View>
              ) : (
                // Empty row if no English qualification data
                <View style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '35%' }]}>
                    <Text></Text>
                  </View>
                  <View style={[styles.tableCol, { width: '35%' }]}>
                    <Text></Text>
                  </View>
                  <View style={[styles.tableCol, { width: '30%' }]}>
                    <Text></Text>
                  </View>
                </View>
              )}
            </View>
          </>
        )}
        {/* Section C */}
        <Text style={styles.sectionHeader}>
          SECTION C: PREVIOUS STUDY IN THE UK (Applicable to Overseas Students)
        </Text>
        <View style={styles.table}>
          {/* Row C1 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '80%' }]}>
              <Text>
                C1. Have you ever studied or made a visa application to study in
                the UK?
              </Text>
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text>{capitalizeFirstLetter(data.enteredUKBefore || '')}</Text>
            </View>
          </View>

          {/* Row C2 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '80%' }]}>
              <Text>
                C2. Have you previously received a visa refusal to study in the
                UK? If yes, please attach a copy and indicate the reason for
                this refusal.
              </Text>
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text>{capitalizeFirstLetter(data.visaRefusal || '')}</Text>
            </View>
          </View>
          {data?.visaRefusal === 'yes' && (
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: '80%' }]}>
                <Text>C3.1: Visa refusal Details </Text>
              </View>
              <View style={[styles.tableCol, { width: '20%' }]}>
                <Text>{capitalizeFirstLetter(data.visaRefusalDetail) || ''}</Text>
              </View>
            </View>
          )}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '80%' }]}>
              <Text>
                C1. Have you applied for Student Finance before? ?
              </Text>
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text>{capitalizeFirstLetter(data.studentFinance || '')}</Text>
            </View>
          </View>
        </View>

        {/* Section D */}
        <Text style={styles.sectionHeader}>
          SECTION D: EMPLOYMENT INFORMATION (IF APPLICABLE)
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
              <Text>From (mm/dd/yyyy)</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '20%' }]}>
              <Text>To (mm/dd/yyyy)</Text>
            </View>
          </View>

          {/* Current employment */}
          {data.currentEmployment && (
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: '25%' }]}>
                <Text>
                  {capitalizeFirstLetter(
                    safeGet(data.currentEmployment, 'jobTitle')
                  )}
                </Text>
              </View>
              <View style={[styles.tableCol, { width: '25%' }]}>
                <Text>
                  {capitalizeFirstLetter(
                    safeGet(data.currentEmployment, 'employer')
                  )}
                </Text>
              </View>
              <View style={[styles.tableCol, { width: '15%' }]}>
                <Text>
                  {capitalizeFirstLetter(
                    safeGet(data.currentEmployment, 'employmentType')
                  )}
                </Text>
              </View>
              <View style={[styles.tableCol, { width: '15%' }]}>
                <Text>
                  {formatDate(safeGet(data.currentEmployment, 'startDate'))}
                </Text>
              </View>
              <View style={[styles.tableCol, { width: '20%' }]}>
                <Text>Present</Text>
              </View>
            </View>
          )}

          {/* Previous employments */}
          {Array.isArray(data.previousEmployments) &&
            data.previousEmployments.map((job: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '25%' }]}>
                  <Text>{capitalizeFirstLetter(safeGet(job, 'jobTitle'))}</Text>
                </View>
                <View style={[styles.tableCol, { width: '25%' }]}>
                  <Text>{capitalizeFirstLetter(safeGet(job, 'employer'))}</Text>
                </View>
                <View style={[styles.tableCol, { width: '15%' }]}>
                  <Text>
                    {capitalizeFirstLetter(safeGet(job, 'employmentType'))}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: '15%' }]}>
                  <Text>{formatDate(safeGet(job, 'startDate'))}</Text>
                </View>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text>{formatDate(safeGet(job, 'endDate'))}</Text>
                </View>
              </View>
            ))}

          {/* Empty rows for remaining space */}
          {[
            ...Array(
              Math.max(
                0,
                3 -
                  ((data.previousEmployments?.length || 0) +
                    (data.currentEmployment ? 1 : 0))
              )
            )
          ].map((_, i) => (
            <View key={`empty-job-${i}`} style={styles.tableRow}>
              <View style={[styles.tableCol, { width: '25%' }]}>
                <Text></Text>
              </View>
              <View style={[styles.tableCol, { width: '25%' }]}>
                <Text></Text>
              </View>
              <View style={[styles.tableCol, { width: '15%' }]}>
                <Text></Text>
              </View>
              <View style={[styles.tableCol, { width: '15%' }]}>
                <Text></Text>
              </View>
              <View style={[styles.tableCol, { width: '20%' }]}>
                <Text></Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Application Form Page 2 of 4 - {getTodaysDate()}
        </Text>
      </Page>

      {/* Page 3 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>WATNEY COLLEGE</Text>

        {/* Section E */}
        <Text style={styles.sectionHeader}>SECTION E: EMERGENCY CONTACT</Text>
        <View style={[styles.table, { marginBottom: 15 }]}>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Full Name:</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{capitalizeFirstLetter(data.emergencyFullName || '')}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Relationship:</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>
                {capitalizeFirstLetter(data.emergencyRelationship || '')}
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Address:</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{capitalizeFirstLetter(data.emergencyAddress || '')}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Contact Number:</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{data.emergencyContactNumber || ''}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Email:</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{data.emergencyEmail || ''}</Text>
            </View>
          </View>
        </View>

        {/* Section F */}
        <Text style={styles.sectionHeader}>SECTION F: DISABILITIES</Text>
        <View style={{ marginBottom: 10 }}>
          <Text>
            Do you have any known disabilities?{' '}
            {capitalizeFirstLetter(data.disability || 'No')}
          </Text>
        </View>
        <View style={{ border: '1px solid #000', minHeight: 50, padding: 5 }}>
          <Text>{capitalizeFirstLetter(data.disabilityDetails || '')}</Text>
        </View>

        {/* Section G */}
        <Text style={styles.sectionHeader}>
          SECTION G: CRIMINAL CONVICTIONS
        </Text>
        <View style={{ marginBottom: 10 }}>
          <Text>
            Do you have any criminal convictions?{' '}
            {data.criminalConviction ? 'Yes' : 'No'}
          </Text>
        </View>
        <View style={{ border: '1px solid #000', minHeight: 50, padding: 5 }}>
          <Text>{capitalizeFirstLetter(data.convictionDetails || '')}</Text>
        </View>

        {/* Section H */}
        <Text style={styles.sectionHeader}>SECTION H: FUNDING INFORMATION</Text>
        <View style={[styles.table, { marginBottom: 15 }]}>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Funding Type:</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{capitalizeFirstLetter(data.fundingType || '')}</Text>
            </View>
          </View>
          {data.fundingType === 'Employer-sponsored' && (
            <>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '30%' }]}>
                  <Text>Company Name:</Text>
                </View>
                <View style={[styles.tableCol, { width: '70%' }]}>
                  <Text>
                    {capitalizeFirstLetter(data.fundingCompanyName || '')}
                  </Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '30%' }]}>
                  <Text>Contact Person:</Text>
                </View>
                <View style={[styles.tableCol, { width: '70%' }]}>
                  <Text>
                    {capitalizeFirstLetter(data.fundingContactPerson || '')}
                  </Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '30%' }]}>
                  <Text>Email:</Text>
                </View>
                <View style={[styles.tableCol, { width: '70%' }]}>
                  <Text>{data.fundingEmail || ''}</Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '30%' }]}>
                  <Text>Phone Number:</Text>
                </View>
                <View style={[styles.tableCol, { width: '70%' }]}>
                  <Text>{data.fundingPhoneNumber || ''}</Text>
                </View>
              </View>
            </>
          )}
        </View>
        <Text style={styles.footer}>
          Application Form Page 3 of 4 - {getTodaysDate()}
        </Text>
      </Page>

      {/* Page 4 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>WATNEY COLLEGE</Text>

        {/* Section I */}
        <Text style={styles.sectionHeader}>SECTION I: DECLARATION</Text>
        <View style={{ marginBottom: 10 }}>
          <Text>
            I confirm that the information given on this form is true, complete
            and accurate: {data.declaration ? 'Yes' : 'No'}
          </Text>
        </View>

        {/* Section J */}
        <Text style={styles.sectionHeader}>SECTION J: DATA PROTECTION</Text>
        <View style={{ marginBottom: 10 }}>
          <Text>
            I consent to Watney College processing my personal data for purposes
            related to my application:{' '}
            {data.acceptDataProcessing ? 'Yes' : 'No'}
          </Text>
        </View>

        {/* Signature */}
        <View style={{ marginTop: 30 }}>
          <Text>Signature: {capitalizeFirstLetter(data.initial || '')}</Text>
          <View style={styles.signatureLine}></View>
        </View>

        {/* Return address */}
        <View style={styles.addressBlock}>
          <Text>
            Thank you for completing this form. Once completed, please return it
            to the following address
          </Text>
          <Text style={{ fontWeight: 'bold', marginTop: 5 }}>
            Watney College
          </Text>
          <Text>80-82 Nelson Street, London, E1 2DY</Text>
          <Text>Email: admission@watneycollege.co.uk</Text>
          <Text>Phone: +44 (0)208 004 6463</Text>
        </View>

        <Text style={styles.footer}>
          Application Form Page 4 of 4 - {getTodaysDate()}
        </Text>
      </Page>
    </Document>
  );
};

export default ApplicationFormPDF;
