import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register font if needed (optional)
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
  ],
});

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 15,
  },
  subSectionHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  table: {
    display: 'flex',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableColHeader: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    fontWeight: 'bold',
  },
  checkbox: {
    width: 10,
    height: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    marginRight: 5,
  },
  footer: {
    position: 'absolute',
    fontSize: 8,
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: 'center',
    borderTop: '1px solid #ccc',
    paddingTop: 5,
  },
  signatureLine: {
    marginTop: 30,
    borderBottom: '1px solid #000',
    width: 200,
  },
  addressBlock: {
    marginTop: 20,
    fontSize: 9,
    textAlign: 'center',
  },
});

const ApplicationFormPDF = ({ formData }) => {
  // Helper function to format date

  console.log('Form Data:', formData); // Debugging line to check formData
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB');
    } catch {
      return dateString;
    }
  };

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
              <Text>A1. First Name(s):</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{formData?.personalDetailsData?.firstName || ''}</Text>
            </View>
          </View>
          
          {/* Row A2 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>A2. Surname/Family Name:</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{formData?.personalDetailsData?.lastName || ''}</Text>
            </View>
          </View>
          
          {/* Row A3 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>A3. Title: (Mr/Mrs/Ms)</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{formData?.personalDetailsData?.title || ''}</Text>
            </View>
          </View>
          
          {/* Row A4 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>A4. Nationality:</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{formData?.personalDetailsData?.nationality || ''}</Text>
            </View>
          </View>
          
          {/* Row A5 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>A5. Passport Number (if applicable):</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{formData?.documentsData?.passportNumber || ''}</Text>
            </View>
          </View>
          
          {/* Row A6 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>A6. Date Of Birth: (dd/mm/yyyy)</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{formatDate(formData?.personalDetailsData?.dateOfBirth) || ''}</Text>
            </View>
          </View>
          
          {/* Row A7 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>A7. Country Of Birth:</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{formData?.personalDetailsData?.countryOfBirth || ''}</Text>
            </View>
          </View>
          
          {/* Row A8 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>A8. Gender:</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%', flexDirection: 'row' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                <View style={styles.checkbox}>
                  {formData?.personalDetailsData?.gender === 'female' && <Text style={{ fontSize: 14, color: '#000' }}>X</Text>}
                </View>
                <Text> Female</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                <View style={styles.checkbox}>
                  {formData?.personalDetailsData?.gender === 'male' && <Text  style={{ fontSize: 14, color: '#000' }}>X</Text>}
                </View>
                <Text> Male</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10  }}>
                <View style={styles.checkbox}>
                  {formData?.personalDetailsData?.gender === 'other' && <Text  style={{ fontSize: 14, color: '#000' }}>X</Text>}
                </View>
                <Text> Other</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.checkbox}>
                  {formData?.personalDetailsData?.gender === 'Prefer not to say' && <Text  style={{ fontSize: 14, color: '#000' }}>X</Text>}
                </View>
                <Text> Prefer not to say</Text>
              </View>
            </View>
          </View>
          
          {/* Row A9 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>A9. Home address:</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>First Line: {formData?.addressData?.residentialAddressLine1 || ''}</Text>
              <Text>Road / Street: {formData?.addressData?.residentialAddressLine2 || ''}</Text>
              <Text>City: {formData?.addressData?.residentialCity || ''}</Text>
              <Text>County: </Text>
              <Text>Post Code: {formData?.addressData?.residentialPostCode || ''}</Text>
              <Text>Country: {formData?.addressData?.residentialCountry || ''}</Text>
            </View>
          </View>
          
          {/* Row A10 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>A10. Contact Address (if different)</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              {!formData?.addressData?.sameAsResidential ? (
                <>
                  <Text>First Line: {formData?.addressData?.postalAddressLine1 || ''}</Text>
                  <Text>Road / Street: {formData?.addressData?.postalAddressLine2 || ''}</Text>
                  <Text>City: {formData?.addressData?.postalCity || ''}</Text>
                  <Text>County: </Text>
                  <Text>Post Code: {formData?.addressData?.postalPostCode || ''}</Text>
                  <Text>Country: {formData?.addressData?.postalCountry || ''}</Text>
                </>
              ) : (
                <Text>Same as home address</Text>
              )}
            </View>
          </View>
          
          {/* Row A11 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>A11. Contact Number:</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{formData?.contactData?.contactNumber || ''}</Text>
            </View>
          </View>
          
          {/* Row A12 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>A12. Email Address:</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text>{formData?.contactData?.email || ''}</Text>
            </View>
          </View>
          
          {/* Row A13 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text>A13. How did you hear about Watney College?</Text>
            </View>
            <View style={[styles.tableCol, { width: '70%' }]}>
              <Text></Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Application Form    Page 1 of 3    June, 2024
        </Text>
      </Page>

      {/* Page 2 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>WATNEY COLLEGE</Text>
        
        {/* Section B */}
        <Text style={styles.sectionHeader}>SECTION B: QUALIFICATIONS OBTAINED</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: '20%' }]}>
              <Text>Level / Qualification</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '25%' }]}>
              <Text>Subject(s)</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '25%' }]}>
              <Text>Course Duration</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '15%' }]}>
              <Text>College/ University</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '15%' }]}>
              <Text>Results</Text>
            </View>
          </View>
          
          {formData?.educationData?.map((edu, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={[styles.tableCol, { width: '20%' }]}>
                <Text>{edu?.studyType || ''}</Text>
              </View>
              <View style={[styles.tableCol, { width: '25%' }]}>
                <Text>{edu?.qualification || ''}</Text>
              </View>
              <View style={[styles.tableCol, { width: '25%' }]}>
                <Text>{edu?.startDate ? formatDate(edu.startDate) : ''} - {edu?.endDate ? formatDate(edu.endDate) : ''}</Text>
              </View>
              <View style={[styles.tableCol, { width: '15%' }]}>
                <Text>{edu?.institution || ''}</Text>
              </View>
              <View style={[styles.tableCol, { width: '15%' }]}>
                <Text></Text>
              </View>
            </View>
          ))}
          
          {/* Empty rows for remaining space */}
          {[...Array(4 - (formData?.educationData?.length || 0))].map((_, i) => (
            <View key={`empty-${i}`} style={styles.tableRow}>
              <View style={[styles.tableCol, { width: '20%' }]}>
                <Text></Text>
              </View>
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
            </View>
          ))}
        </View>

        {/* Section C */}
        <Text style={styles.sectionHeader}>SECTION C: PREVIOUS STUDY IN THE UK</Text>
        <View style={styles.table}>
          {/* Row C1 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '80%' }]}>
              <Text>C1. Have you ever studied or made a visa application to study in the UK?</Text>
            </View>
            <View style={[styles.tableCol, { width: '20%', flexDirection: 'row' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                <View style={styles.checkbox}>
                  {formData?.complianceData?.previousUKStudy === 'Yes' && <Text>X</Text>}
                </View>
                <Text> Yes</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.checkbox}>
                  {formData?.complianceData?.previousUKStudy === 'No' && <Text>X</Text>}
                </View>
                <Text> No</Text>
              </View>
            </View>
          </View>
          
          {/* Row C2 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '80%' }]}>
              <Text>C2. Have you previously received a visa refusal to study in the UK? If yes, please attach a copy and indicate the reason for this refusal.</Text>
            </View>
            <View style={[styles.tableCol, { width: '20%', flexDirection: 'row' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                <View style={styles.checkbox}>
                  {formData?.complianceData?.visaRefusal === 'Yes' && <Text>X</Text>}
                </View>
                <Text> Yes</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.checkbox}>
                  {formData?.complianceData?.visaRefusal === 'No' && <Text>X</Text>}
                </View>
                <Text> No</Text>
              </View>
            </View>
          </View>
          
          {/* Row C3 */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '80%' }]}>
              <Text>C3. Date of first entry in UK (if applicable)</Text>
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text>{formatDate(formData?.complianceData?.startDateInUK) || ''}</Text>
            </View>
          </View>
        </View>

        {/* Section D */}
        <Text style={styles.sectionHeader}>SECTION D: EMPLOYMENT INFORMATION (IF APPLICABLE)</Text>
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
              <Text>From (mm/yy)</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '20%' }]}>
              <Text>To (mm/yy)</Text>
            </View>
          </View>
          
          {formData?.employmentData?.previousEmployments?.map((job, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={[styles.tableCol, { width: '25%' }]}>
                <Text>{job?.jobTitle || ''}</Text>
              </View>
              <View style={[styles.tableCol, { width: '25%' }]}>
                <Text>{job?.employer || ''}</Text>
              </View>
              <View style={[styles.tableCol, { width: '15%' }]}>
                <Text>{job?.employmentType || ''}</Text>
              </View>
              <View style={[styles.tableCol, { width: '15%' }]}>
                <Text>{job?.startDate ? formatDate(job.startDate) : ''}</Text>
              </View>
              <View style={[styles.tableCol, { width: '20%' }]}>
                <Text>{job?.endDate ? formatDate(job.endDate) : ''}</Text>
              </View>
            </View>
          ))}
          
          {/* Empty rows for remaining space */}
          {[...Array(3 - (formData?.employmentData?.previousEmployments?.length || 0))].map((_, i) => (
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
          Application Form    Page 2 of 3    June, 2024
        </Text>
      </Page>

      {/* Page 3 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>WATNEY COLLEGE</Text>
        
        {/* Section E */}
        <Text style={styles.sectionHeader}>SECTION E: REFEREE(S)</Text>
        <View style={[styles.table, { marginBottom: 15 }]}>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '50%' }]}>
              <Text>Referee 01</Text>
            </View>
            <View style={[styles.tableCol, { width: '50%' }]}>
              <Text>Referee 02</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '50%' }]}>
              <Text>Full Name</Text>
            </View>
            <View style={[styles.tableCol, { width: '50%' }]}>
              <Text>Full Name</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '50%' }]}>
              <Text>Address and Post code</Text>
            </View>
            <View style={[styles.tableCol, { width: '50%' }]}>
              <Text>Address and Post code</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '50%' }]}>
              <Text>Contact Number</Text>
            </View>
            <View style={[styles.tableCol, { width: '50%' }]}>
              <Text>Contact Number</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '50%' }]}>
              <Text>Email</Text>
            </View>
            <View style={[styles.tableCol, { width: '50%' }]}>
              <Text>Email</Text>
            </View>
          </View>
        </View>

        {/* Section F */}
        <Text style={styles.sectionHeader}>SECTION F: DISABILITIES</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <View style={styles.checkbox}>
            {formData?.complianceData?.disability === 'Yes' && <Text>X</Text>}
          </View>
          <Text> Do you have any known disabilities? (Please check 'X' if yes and provide details in the box below.)</Text>
        </View>
        <View style={{ border: '1px solid #000', minHeight: 50, padding: 5 }}>
          <Text>{formData?.complianceData?.disabilityDetails || ''}</Text>
        </View>

        {/* Section G */}
        <Text style={styles.sectionHeader}>SECTION G: DECLARATION</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <View style={styles.checkbox}>
            {formData?.termsData?.acceptTerms && <Text>X</Text>}
          </View>
          <Text>
            I confirm that the information given on this form is true, complete and accurate and that none of the information requested or other material information has been omitted. I accept that if it is discovered that I have supplied false, inaccurate or misleading information, WATNEY COLLEGE reserves the right to cancel my application, withdraw its offer of a place or terminate attendance at the College and I shall have no claim against WATNEY COLLEGE in relation thereto.
          </Text>
        </View>

        {/* Section H */}
        <Text style={styles.sectionHeader}>SECTION H: DATA PROTECTION ACT 1988</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <View style={styles.checkbox}>
            {formData?.termsData?.acceptDataProcessing && <Text>X</Text>}
          </View>
          <Text>
            I consent to Watney College processing my personal data for purposes related to my application, studies, health and safety, and compliance with College policies. This includes academic performance, learning support, disciplinary matters, CCTV usage, ID card photos, and data required by the Higher Education Statistics Agency (HESA) or other legitimate purposes. I consent to the disclosure of this data for academic references, further education, employment, council tax, or immigration matters, including verification with the UK Border Agency. I understand I can request a copy of my data and that details on HESA are available on the College's intranet.
          </Text>
        </View>

        {/* Signature */}
        <View style={{ marginTop: 30 }}>
          <Text>Signature</Text>
          <View style={styles.signatureLine}></View>
        </View>

        {/* Return address */}
        <View style={styles.addressBlock}>
          <Text>Thank you for completing this form. Once completed, please return it to the following address</Text>
          <Text style={{ fontWeight: 'bold', marginTop: 5 }}>Watney College</Text>
          <Text>80-82 Nelson Street, London, E1 2DY</Text>
          <Text>Email: admission@watneycollege.co.uk</Text>
          <Text>Phone: +44 (0)208 004 6463</Text>
        </View>

        <Text style={styles.footer}>
          Application Form    Page 3 of 3    June, 2024
        </Text>
      </Page>
    </Document>
  );
};

export default ApplicationFormPDF;