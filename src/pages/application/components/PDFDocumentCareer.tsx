import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image
} from '@react-pdf/renderer';
import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
// Define styles for the PDF
const BORDER_WIDTH = 0.25;
const BORDER_COLOR = '#999';

const CheckboxView = ({ checked }: { checked: boolean | undefined }) => (
  <View style={{
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: '#000',
    marginTop: 1,
    flexShrink: 0,
    backgroundColor: checked === true ? '#000' : 'transparent'
  }} />
);

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10
  },

  header: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8
  },

  logo: {
    width: 50,
    height: 60,
    marginBottom: 20,
    paddingBottom: 10
  },

  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 8
  },

  subSectionHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
    paddingTop: 10
  },

  table: {
    display: 'flex',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: BORDER_WIDTH,
    borderColor: BORDER_COLOR,
    borderRightWidth: 0,
    borderBottomWidth: 0
  },

  tableRow: {
    flexDirection: 'row'
  },

  tableCol: {
    borderStyle: 'solid',
    borderWidth: BORDER_WIDTH,
    borderColor: BORDER_COLOR,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5
  },

  tableColHeader: {
    borderStyle: 'solid',
    borderWidth: BORDER_WIDTH,
    borderColor: BORDER_COLOR,
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
    borderTopWidth: BORDER_WIDTH,
    borderTopColor: BORDER_COLOR,
    paddingTop: 5
  },

  signatureLine: {
    marginTop: 30,
    borderBottomWidth: BORDER_WIDTH,
    borderBottomColor: BORDER_COLOR,
    width: 200
  },

  addressBlock: {
    marginTop: -10,
    fontSize: 9,
    textAlign: 'center'
  },

  noBorderCol: {
    padding: 5,
    width: '30%'
  }
});
// Format date utility
const formatDate = (dateString: string): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US');
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
  applicationJob: any;
}

const ApplicationFormPDF: React.FC<ApplicationFormPDFProps> = ({
  formData,
  applicationJob
}) => {
  // Ensure formData is not undefined
  const data = formData || {};
  const totalPages = 3;
  const PDFooter = ({
    pageNumber,
    totalPages
  }: {
    pageNumber: number;
    totalPages: number;
  }) => (
    <Text style={styles.footer}>
      Application Form Page {pageNumber} of {totalPages} - {getTodaysDate()}
    </Text>
  );

  const logoPath = import.meta.env.VITE_LOGO;

  return (
    <Document>
      {/* Page 1 */}
      <Page size="A4" style={styles.page}>
        <View
          style={{
            position: 'relative',
            height: 120,
            marginBottom: 0,
            justifyContent: 'flex-start'
          }}
        >
          {/* Left: Logo */}
          <View style={{ position: 'absolute', left: 0, top: -10 }}>
            <Image style={styles.logo} src='/logo.png' />
          </View>

          {/* Right: Passport Photo */}
          {data?.image && (
            <View style={{ position: 'absolute', right: 0, top: -20 }}>
              <Image
                style={{
                  width: 80,
                  height: 90,
                  borderWidth: 1,
                  borderColor: '#000'
                }}
                src={data.image}
              />
            </View>
          )}

          {/* Center: Header */}
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'flex-start',
              height: '100%'
            }}
          >
            <Text style={styles.header}>APPLICATION FORM</Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            marginTop: -60
          }}
        >
          <View style={{ width: '70%' }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 6,

                backgroundColor: '#fff'
              }}
            >
              {/* Label */}
              <View style={{ width: '30%' }}>
                <Text style={{ fontWeight: '600' }}>POST APPLIED FOR:</Text>
              </View>

              {/* Value */}
              <View style={{ width: '70%' }}>
                <Text>{applicationJob?.jobId?.jobTitle}</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.subSectionHeader}>PERSONAL DETAILS</Text>

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
              <Text>First Name</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{capitalizeFirstLetter(data.firstName || '')}</Text>
            </View>
          </View>

          {/* Row A2 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Middle Name</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{capitalizeFirstLetter(data.initial || '')}</Text>
            </View>
          </View>

          {/* Row A3 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Last Name</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{capitalizeFirstLetter(data.lastName || '')}</Text>
            </View>
          </View>

          {data.studentType === 'eu' && (
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: '30%' }]}>
                <Text>Nationality</Text>
              </View>
              <View style={[styles.tableCol, { width: '70%' }]}>
                <Text>{capitalizeFirstLetter(data.nationality || '')}</Text>
              </View>
            </View>
          )}

          {/* Row A6 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Date Of Birth(mm/dd/yyyy)</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{formatDate(data.dateOfBirth)}</Text>
            </View>
          </View>

          {/* Row A7 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Country of Residence:</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>
                {capitalizeFirstLetter(data.countryOfResidence || '')}
              </Text>
            </View>
          </View>

          {/* Row A9 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Home address</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>
                First Line:{' '}
                {capitalizeFirstLetter(data.postalAddressLine1 || '')}, Road /
                Street: {capitalizeFirstLetter(data.postalAddressLine2 || '')},
                City: {capitalizeFirstLetter(data.postalCity || '')}, Post Code:{' '}
                {(data.postalPostCode || '').toUpperCase()}, Country:{' '}
                {capitalizeFirstLetter(data.postalCountry || '')}
              </Text>
            </View>
          </View>

          {/* Row A10 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>
                Previous Address (if you have lived at your present address for
                less than 12 months)
              </Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>
                First Line:{' '}
                {capitalizeFirstLetter(data.prevPostalAddressLine1 || '')}, Road
                / Street:{' '}
                {capitalizeFirstLetter(data.prevPostalAddressLine2 || '')},
                City: {capitalizeFirstLetter(data.prevPostalCity || '')}, Post
                Code: {(data.prevPostalPostCode || '').toUpperCase()}, Country:{' '}
                {capitalizeFirstLetter(data.prevPostalCountry || '')}
              </Text>
            </View>
          </View>

          {/* Row A11 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Contact Number</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{data.phone || ''}</Text>
            </View>
          </View>

          {/* Row A12 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Email Address</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{data.email || ''}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>National Insurance Number</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{data.nationalInsuranceNumber || ''}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>
                Are you aged 18 or over (required for regulatory purposes)
              </Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{data.isOver18 ? 'Yes' : 'No'}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>Are you subject to immigration control?</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{data.isSubjectToImmigrationControl ? 'Yes' : 'No'}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>
                Are you free to remain and take up employment in the UK?
              </Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{data.canWorkInUK ? 'Yes' : 'No'}</Text>
            </View>
          </View>
        </View>

        <>
          <Text style={styles.sectionHeader}>
            PRESENT OR MOST RECENT EMPLOYER
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

            {/* Employment Rows */}
            {data.currentEmployment ? (
              <>
                {/* Current Employment */}
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
                        {formatDate(
                          safeGet(data.currentEmployment, 'startDate')
                        )}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, { width: '20%' }]}>
                      <Text>Present</Text>
                    </View>
                  </View>
                )}
              </>
            ) : (
              Array.from({ length: 2 }).map((_, idx) => (
                <View key={`empty-row-${idx}`} style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '25%' }]}>
                    <Text>&nbsp;</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '25%' }]}>
                    <Text>&nbsp;</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '15%' }]}>
                    <Text>&nbsp;</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '15%' }]}>
                    <Text>&nbsp;</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '20%' }]}>
                    <Text>&nbsp;</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </>

        <>
          {/* Section D */}
          <Text style={[styles.sectionHeader, { marginBottom: 0 }]}>
            PAST EMPLOYMENT RECORDS
          </Text>
          <Text style={styles.subSectionHeader}>
            Please cover the last 5 years (if possible) starting with the most
            recent employer and explain any age gaps in your employment
          </Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={[styles.tableColHeader, { width: '30%' }]}>
                <Text>Nature of work/training</Text>
              </View>
              <View style={[styles.tableColHeader, { width: '30%' }]}>
                <Text>Name of organisation</Text>
              </View>

              <View style={[styles.tableColHeader, { width: '20%' }]}>
                <Text>From (mm/dd/yyyy)</Text>
              </View>
              <View style={[styles.tableColHeader, { width: '20%' }]}>
                <Text>To (mm/dd/yyyy)</Text>
              </View>
            </View>

            {/* Employment Rows */}
            {Array.isArray(data.previousEmployments) &&
            data.previousEmployments.length > 0 ? (
              <>
                {/* Previous Employments */}
                {Array.isArray(data.previousEmployments) &&
                  data.previousEmployments.map((job: any, index: number) => (
                    <View key={`prev-job-${index}`} style={styles.tableRow}>
                      <View style={[styles.tableCol, { width: '30%' }]}>
                        <Text>
                          {capitalizeFirstLetter(safeGet(job, 'jobTitle'))}
                        </Text>
                      </View>
                      <View style={[styles.tableCol, { width: '30%' }]}>
                        <Text>
                          {capitalizeFirstLetter(safeGet(job, 'employer'))}
                        </Text>
                      </View>

                      <View style={[styles.tableCol, { width: '20%' }]}>
                        <Text>{formatDate(safeGet(job, 'startDate'))}</Text>
                      </View>
                      <View style={[styles.tableCol, { width: '20%' }]}>
                        <Text>{formatDate(safeGet(job, 'endDate'))}</Text>
                      </View>
                    </View>
                  ))}
              </>
            ) : (
              Array.from({ length: 2 }).map((_, idx) => (
                <View key={`empty-row-${idx}`} style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '30%' }]}>
                    <Text>&nbsp;</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '30%' }]}>
                    <Text>&nbsp;</Text>
                  </View>

                  <View style={[styles.tableCol, { width: '20%' }]}>
                    <Text>&nbsp;</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '20%' }]}>
                    <Text>&nbsp;</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </>

        <Text style={styles.footer}>
          Application Form Page{' '}
          <PDFooter pageNumber={1} totalPages={totalPages} /> -{' '}
          {getTodaysDate()}
        </Text>
      </Page>

      {/* Page 2 */}
      <Page size="A4" style={styles.page}>
        {/* Education  */}
        <Text style={[styles.sectionHeader, { marginBottom: 0 }]}>
          QUALIFICATIONS OBTAINED
        </Text>
        <Text style={styles.subSectionHeader}>
          Qualifications obtained from schools/colleges/universities including
          any relevant professional qualifications.
        </Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: '30%' }]}>
              <Text>Level / Qualification</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '20%' }]}>
              <Text>Award Date (mm/dd/yyyy)</Text>
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

        <Text style={styles.sectionHeader}>REFERENCES</Text>
        <Text style={styles.subSectionHeader}>
          We will obtain references covering your last 3 years employment after
          the interview from at least 2 previous employers, should you be
          successfully short-listed. We may consider an academic referee along
          with a character referee (non-relative) if you have never been in paid
          employment.
        </Text>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          {data.professionalReferee1 && (
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', marginTop: 8, marginBottom: 2 }}>Professional Referee 1</Text>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '35%' }]}><Text>Full Name</Text></View>
                  <View style={[styles.tableCol, { width: '65%' }]}><Text>{capitalizeFirstLetter(data.professionalReferee1?.name || '')}</Text></View>
                </View>
                <View style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '35%' }]}><Text>Position</Text></View>
                  <View style={[styles.tableCol, { width: '65%' }]}><Text>{capitalizeFirstLetter(data.professionalReferee1?.position || '')}</Text></View>
                </View>
                <View style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '35%' }]}><Text>Relationship</Text></View>
                  <View style={[styles.tableCol, { width: '65%' }]}><Text>{capitalizeFirstLetter(data.professionalReferee1?.relationship || '')}</Text></View>
                </View>
                <View style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '35%' }]}><Text>Organisation</Text></View>
                  <View style={[styles.tableCol, { width: '65%' }]}><Text>{capitalizeFirstLetter(data.professionalReferee1?.organisation || '')}</Text></View>
                </View>
                <View style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '35%' }]}><Text>Address</Text></View>
                  <View style={[styles.tableCol, { width: '65%' }]}><Text>{capitalizeFirstLetter(data.professionalReferee1?.address || '')}</Text></View>
                </View>
                <View style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '35%' }]}><Text>Tel No</Text></View>
                  <View style={[styles.tableCol, { width: '65%' }]}><Text>{data.professionalReferee1?.tel || ''}</Text></View>
                </View>
                <View style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '35%' }]}><Text>Fax</Text></View>
                  <View style={[styles.tableCol, { width: '65%' }]}><Text>{data.professionalReferee1?.fax || ''}</Text></View>
                </View>
                <View style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '35%' }]}><Text>Email</Text></View>
                  <View style={[styles.tableCol, { width: '65%' }]}><Text>{data.professionalReferee1?.email || ''}</Text></View>
                </View>
              </View>
            </View>
          )}

          {data.professionalReferee2 && (
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', marginTop: 8, marginBottom: 2 }}>Professional Referee 2</Text>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '35%' }]}><Text>Full Name</Text></View>
                  <View style={[styles.tableCol, { width: '65%' }]}><Text>{capitalizeFirstLetter(data.professionalReferee2?.name || '')}</Text></View>
                </View>
                <View style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '35%' }]}><Text>Position</Text></View>
                  <View style={[styles.tableCol, { width: '65%' }]}><Text>{capitalizeFirstLetter(data.professionalReferee2?.position || '')}</Text></View>
                </View>
                <View style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '35%' }]}><Text>Relationship</Text></View>
                  <View style={[styles.tableCol, { width: '65%' }]}><Text>{capitalizeFirstLetter(data.professionalReferee2?.relationship || '')}</Text></View>
                </View>
                <View style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '35%' }]}><Text>Organisation</Text></View>
                  <View style={[styles.tableCol, { width: '65%' }]}><Text>{capitalizeFirstLetter(data.professionalReferee2?.organisation || '')}</Text></View>
                </View>
                <View style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '35%' }]}><Text>Address</Text></View>
                  <View style={[styles.tableCol, { width: '65%' }]}><Text>{capitalizeFirstLetter(data.professionalReferee2?.address || '')}</Text></View>
                </View>
                <View style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '35%' }]}><Text>Tel No</Text></View>
                  <View style={[styles.tableCol, { width: '65%' }]}><Text>{data.professionalReferee2?.tel || ''}</Text></View>
                </View>
                <View style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '35%' }]}><Text>Fax</Text></View>
                  <View style={[styles.tableCol, { width: '65%' }]}><Text>{data.professionalReferee2?.fax || ''}</Text></View>
                </View>
                <View style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '35%' }]}><Text>Email</Text></View>
                  <View style={[styles.tableCol, { width: '65%' }]}><Text>{data.professionalReferee2?.email || ''}</Text></View>
                </View>
              </View>
            </View>
          )}
        </View>

        {data.personalReferee && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 2 }}>Personal Referee</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '30%' }]}><Text>Full Name</Text></View>
                <View style={[styles.tableCol, { width: '70%' }]}><Text>{capitalizeFirstLetter(data.personalReferee?.name || '')}</Text></View>
              </View>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '30%' }]}><Text>Position</Text></View>
                <View style={[styles.tableCol, { width: '70%' }]}><Text>{capitalizeFirstLetter(data.personalReferee?.position || '')}</Text></View>
              </View>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '30%' }]}><Text>Relationship</Text></View>
                <View style={[styles.tableCol, { width: '70%' }]}><Text>{capitalizeFirstLetter(data.personalReferee?.relationship || '')}</Text></View>
              </View>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '30%' }]}><Text>Organisation</Text></View>
                <View style={[styles.tableCol, { width: '70%' }]}><Text>{capitalizeFirstLetter(data.personalReferee?.organisation || '')}</Text></View>
              </View>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '30%' }]}><Text>Address</Text></View>
                <View style={[styles.tableCol, { width: '70%' }]}><Text>{capitalizeFirstLetter(data.personalReferee?.address || '')}</Text></View>
              </View>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '30%' }]}><Text>Tel No</Text></View>
                <View style={[styles.tableCol, { width: '70%' }]}><Text>{data.personalReferee?.tel || ''}</Text></View>
              </View>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '30%' }]}><Text>Fax</Text></View>
                <View style={[styles.tableCol, { width: '70%' }]}><Text>{data.personalReferee?.fax || ''}</Text></View>
              </View>
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '30%' }]}><Text>Email</Text></View>
                <View style={[styles.tableCol, { width: '70%' }]}><Text>{data.personalReferee?.email || ''}</Text></View>
              </View>
            </View>
          </View>
        )}

        {/* Section E */}
        <Text style={styles.sectionHeader}>EMERGENCY CONTACT</Text>
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

       

        <Text style={styles.footer}>
          Application Form Page{' '}
          <PDFooter pageNumber={1} totalPages={totalPages} /> -{' '}
          {getTodaysDate()}
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>

         {/* Section F */}
        <Text style={styles.sectionHeader}>DISABILITIES</Text>
        <View style={{ marginBottom: 10 }}>
          <Text>
            Do you have any known disability?{' '}
            {capitalizeFirstLetter(data.hasDisability ? 'Yes' : 'No')}
          </Text>
        </View>
        <View style={{ border: '0.5px solid #999', minHeight: 30, padding: 5 }}>
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
        <View style={{ border: '0.5px solid #999', minHeight: 30, padding: 5 }}>
          <Text>{capitalizeFirstLetter(data.convictionDetails || '')}</Text>
        </View>

        
        <Text style={styles.sectionHeader}>DECLARATION</Text>
        <View style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start' }}>
          <CheckboxView checked={data.termsAccepted} />
          <View style={{ marginLeft: 6, flex: 1 }}>
            <Text>
              I confirm that the information given on this form is true, complete
              and accurate and that none of the information requested or other
              material information has been omitted. I accept that if it is
              discovered that I have supplied false, inaccurate or misleading
              information, Everycare Romford reserves the right to cancel my
              application, withdraw its offer of a place or terminate attendance
              at the College and I shall have no claim against Everycare Romford in
              relation thereto.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>DATA PROTECTION</Text>
        <View style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start' }}>
          <CheckboxView checked={data.dataProcessingAccepted} />
          <View style={{ marginLeft: 6, flex: 1 }}>
            <Text>
              I consent to Everycare Romford processing my personal data for purposes
              related to my application, studies, health and safety, and
              compliance with College policies. This includes academic
              performance, learning support, disciplinary matters, CCTV usage, ID
              card photos, and data required by the Higher Education Statistics
              Agency (HESA) or other legitimate purposes. I consent to the
              disclosure of this data for academic references, further education,
              employment, council tax, or immigration matters, including
              verification with the UK Border Agency. I understand I can request a
              copy of my data and that details on HESA are available on the
              College's intranet.
            </Text>
          </View>
        </View>

        {/* Signature */}
        {/* Signature Table */}
        <View style={[styles.table, { marginTop: 30, marginBottom: 20 }]}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: '70%' }]}>
              <Text>Signature</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '30%' }]}>
              <Text>Date (mm/dd/yyyy)</Text>
            </View>
          </View>
          <View style={[styles.tableRow, { minHeight: 50 }]}>
            <View style={[styles.tableCol, { width: '70%' }]}>
              {data.signatureUrl ? (
                <Image src={data.signatureUrl} style={{ width: 180, height: 45 }} />
              ) : (
                <Text>&nbsp;</Text>
              )}
            </View>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>{data.createdAt ? formatDate(data.createdAt) : ''}</Text>
            </View>
          </View>
        </View>

        {/* Return address */}
        <View style={styles.addressBlock}>
          <Text>
            Thank you for completing this form. Once completed, please return it
            to the following address
          </Text>
          <Text style={{ fontWeight: 'bold', marginTop: 5 }}>
            Everycare Romford
          </Text>
          <Text>37 High St, Romford RM1 1JL, United Kingdom</Text>
          <Text>Email: admin@everycareromford.co.uk</Text>
          <Text>Phone: +44 1708 693057</Text>
        </View>

        <Text style={styles.footer}>
          Application Form Page{' '}
          <PDFooter pageNumber={1} totalPages={totalPages} /> -{' '}
          {getTodaysDate()}
        </Text>
      </Page>
    </Document>
  );
};

export default ApplicationFormPDF;
