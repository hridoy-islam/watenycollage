import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Define the interface (reuse or import from your types file)
export interface BankDetailsData {
  userId: string;
  name: string;
  jobPost: string;
  address: string;
  postcode: string;
  houseNumber: string;
  bankName: string;
  bankAddress: string;
  accountName: string;
  sortCode: string;
  accountNumber: string;
  buildingSocietyRollNumber?: string;
  createdAt?: string;
}

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#000',
  },
   headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
    headerCenter: {
    width: '30%',
    alignItems: 'center',
  },
  headerRight: {
    width: '30%',
    alignItems: 'flex-end',
    fontSize: 9,
  },
    headerLeft: {
    width: '30%',
    fontSize: 9,
  },
  linkText: {
    color: 'blue',
    textDecoration: 'underline',
  },
  logo: {
    width: 150, // Adjust based on your actual logo aspect ratio
    height: 50,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textDecoration: 'underline',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 5,
  },
  // Form Row Styles
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  label: {
    width: 130, // Fixed width for labels to align lines
    fontSize: 11,
  },
  inputLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 2,
    marginLeft: 5,
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  // Checkbox Section
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  checkboxGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    marginLeft: 15,
    marginRight: 5,
  },
  checkboxBox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    width: 8,
    height: 8,
    backgroundColor: '#000', // Simple fill for checked
  },
  // Section Headers
  sectionHeader: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginTop: 20,
    marginBottom: 15,
  },
  // Specific spacing for Sort Code / Account Number
  spacedText: {
    letterSpacing: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
});

// Helper component for standard Label + Underline
const FormRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputLine}>
      <Text>{value || ''}</Text>
    </View>
  </View>
);

// Helper for Checkbox
const Checkbox = ({ label, checked }: { label: string; checked: boolean }) => (
  <View style={styles.checkboxGroup}>
    <Text style={styles.checkboxLabel}>{label}</Text>
    <View style={styles.checkboxBox}>
      {checked && <View style={styles.checked} />}
    </View>
  </View>
);


const HeaderComponent = () => (
  <View style={styles.headerContainer}>
    <View style={styles.headerLeft}>
      <Text>Everycare Romford</Text>
      <Text>37 High Street, Romford, RM1 1JL</Text>
      <Text>Tel: 0170 8690 3057</Text>
    </View>

    <View style={styles.headerCenter}>
      <Image
        src="/logo.png"
        style={{ width: 80, height: 'auto' }}
      />
    </View>

    <View style={styles.headerRight}>
      <Text>
        Email: <Text style={styles.linkText}>romford@everycare.co.uk</Text>
      </Text>
      <Text>
        Website: <Text style={styles.linkText}>www.everycare.co.uk/romford</Text>
      </Text>
      <Text>Registered by CQC</Text>
    </View>
  </View>
);



// Helper for Job Role Logic
const JobRoleSection = ({ role }: { role: string }) => {
  const normalizedRole = role?.toLowerCase() || '';
  
  return (
    <View style={styles.checkboxRow}>
      <Text style={{ width: 130 }}>Job Role:</Text>
      <Checkbox label="RN" checked={normalizedRole.includes('rn') || normalizedRole.includes('nurse')} />
      <Checkbox label="HCA" checked={normalizedRole.includes('hca')} />
      <Checkbox label="H&SCA" checked={normalizedRole.includes('h&sca')} />
      <Checkbox label="Other" checked={!['rn', 'hca', 'h&sca'].some(r => normalizedRole.includes(r))} />
      
      {/* Line for 'Other' details */}
      <View style={{ 
        borderBottomWidth: 1, 
        borderBottomColor: '#000', 
        width: 100, 
        marginLeft: 10,
        alignSelf: 'flex-end'
      }}>
         {/* If other, print the role here */}
         <Text style={{ fontSize: 10 }}>
           {!['rn', 'hca', 'h&sca'].some(r => normalizedRole.includes(r)) ? role : ''}
         </Text>
      </View>
    </View>
  );
};

export const BankDetailsPdf = ({ data }: { data: BankDetailsData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
           <HeaderComponent />


      <Text style={styles.title}>PAYMENT DETAILS FOR WAGES</Text>

      {/* Personal Info Section */}
      <FormRow label="Name:" value={data.name} />
      <FormRow label="House Number/Name:" value={data.houseNumber} />
      <FormRow label="Post Code:" value={data.postcode} />
      
      {/* Job Role Section with Checkboxes */}
      <JobRoleSection role={data.jobPost} />

      {/* Bank Details Section */}
      <Text style={styles.sectionHeader}>Bank/Building Society Details</Text>

      {/* Account Number with wide spacing to simulate boxes */}
      <View style={styles.row}>
        <Text style={styles.label}>Account Number:</Text>
        <View style={styles.inputLine}>
           <Text style={styles.spacedText}>{data.accountNumber}</Text>
        </View>
      </View>

      {/* Sort Code */}
      <View style={styles.row}>
        <Text style={styles.label}>Sort Code:</Text>
        <View style={{...styles.inputLine, maxWidth: 200}}>
           <Text style={styles.spacedText}>{data.sortCode}</Text>
        </View>
      </View>

      <FormRow label="Bank Name:" value={data.bankName} />
      <FormRow label="Branch Name:" value={data.bankAddress} />
      <FormRow label="Building Society roll No." value={data.buildingSocietyRollNumber || ''} />

      {/* Footer */}
      <Text style={styles.footer}>Please hand this completed form to Payroll</Text>

    </Page>
  </Document>
);