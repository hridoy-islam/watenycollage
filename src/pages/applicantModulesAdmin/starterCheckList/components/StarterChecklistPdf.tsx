import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// --- Types ---
export interface starterCheckList {
  employee: {
    lastName: string;
    firstName: string;
    gender: 'Male' | 'Female' | '';
    dob: string; // DD MM YYYY
    address: string;
    postcode: string;
    country: string;
    niNumber: string;
    startDate: string; // DD MM YYYY
  };
  statement: 'A' | 'B' | 'C' | null;
  studentLoan: {
    hasNoLoans: boolean;
    plan1: boolean;
    plan2: boolean;
    plan4: boolean;
    postgradLoan: boolean;
  };
  declaration: {
    fullName: string;
    date: string;
  };
}

// --- Styles ---
const styles = StyleSheet.create({
  page: {
    padding: 25,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#000',
    lineHeight: 1.2,
  },
  // Typography
  h1: { 
    fontSize: 16, 
    fontFamily: 'Helvetica-Bold', 
    marginBottom: 4 
  },
  h2: { 
    fontSize: 11, 
    fontFamily: 'Helvetica-Bold', 
    marginTop: 10, 
    marginBottom: 6, 
    backgroundColor: '#e6e6e6', 
    padding: 3, 
    borderTop: '0.5px solid #999', 
    borderBottom: '0.5px solid #999' 
  },
  h3: { 
    fontSize: 9, 
    fontFamily: 'Helvetica-Bold', 
    marginTop: 6,
    marginBottom: 3
  },
  bold: { 
    fontFamily: 'Helvetica-Bold' 
  },
  text: { 
    marginBottom: 3,
    fontSize: 8,
    lineHeight: 1.2
  },
  small: { 
    fontSize: 7, 
    lineHeight: 1.0 
  },
  italic: {
    fontStyle: 'italic'
  },
  
  // Layout
  row: { 
    flexDirection: 'row' 
  },
  col: { 
    flexDirection: 'column' 
  },
  half: { 
    width: '50%' 
  },
  
  // Components
  dataField: { 
    border: '0.5px solid #999', 
    minHeight: 14, 
    marginTop: 2, 
    marginBottom: 6, 
    backgroundColor: '#fff',
    padding: 2,
    paddingLeft: 4
  },
  inputLabel: {
    fontFamily: 'Helvetica-Bold', 
    fontSize: 8, 
    marginBottom: 1, 
  },
  
  // Header Specific
  headerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 12, 
    borderBottom: '0.5px solid #999', 
    paddingBottom: 6,
    alignItems: 'flex-end'
  },
  
  // Statement Table
  table: { 
    flexDirection: 'row', 
    border: '0.5px solid #999', 
    marginTop: 6,
    minHeight: 160
  },
  tableCol: { 
    flex: 1, 
    borderRight: '0.5px solid #999', 
    padding: 6
  },
  lastCol: { 
    borderRight: 'none' 
  },
  tableTitle: { 
    textAlign: 'center', 
    fontFamily: 'Helvetica-Bold', 
    marginBottom: 4,
    fontSize: 9
  },
  
  // Checkbox
  checkboxContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 3 
  },
  checkbox: { 
    width: 10, 
    height: 10, 
    border: '0.5px solid #999', 
    marginRight: 5, 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  checked: { 
    width: 6, 
    height: 6, 
    backgroundColor: '#000' 
  },

  // Footer
  pageFooter: { 
    position: 'absolute', 
    bottom: 20, 
    left: 25, 
    right: 25, 
    textAlign: 'center', 
    fontSize: 7,
    color: '#555'
  },
  
  // Student Loan Section
  loanSection: {
    marginTop: 8
  },
  loanOptions: {
    border: '0.5px solid #999',
    padding: 6,
    marginTop: 4
  }
});

// --- Helper Components ---

const Checkbox = ({ checked, label, style }: { checked: boolean; label?: string; style?: any }) => (
  <View style={[styles.checkboxContainer, style]}>
    <View style={styles.checkbox}>
      {checked && <View style={styles.checked} />}
    </View>
    {label && <Text style={styles.text}>{label}</Text>}
  </View>
);

const DataField = ({ label, value, width = '100%', smallLabel = false }: { label: string; value: string; width?: string | number, smallLabel?: boolean }) => (
  <View style={{ marginBottom: 6, width }}>
    <Text style={smallLabel ? [styles.small, styles.bold] : styles.inputLabel}>{label}</Text>
    <View style={styles.dataField}>
      <Text style={{ fontSize: 9 }}>{value || ' '}</Text>
    </View>
  </View>
);

// --- Main Document Component ---

export const StarterCheckListPdf = ({ data }: { data: starterCheckList }) => (
  <Document>
    {/* PAGE 1 */}
    <Page size="A4" style={styles.page}>
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.h1}>Starter checklist</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 7, color: '#555' }}>Starter checklist Page 1</Text>
          <Text style={{ fontSize: 7, color: '#555' }}>HMRC 02/21</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.row}>
        <View style={[styles.half, { paddingRight: 12 }]}>
          <Text style={styles.h3}>Instructions for employers</Text>
          <Text style={styles.text}>This Starter Checklist can be used to gather information about your new employee. You can use this information to help fill in your first Full Payment Submission (FPS) for this employee.</Text>
          <Text style={styles.text}>You need to keep the information recorded on the Starter Checklist record for the current and previous 3 tax years.</Text>
          <Text style={[styles.text, styles.bold, { marginTop: 4 }]}>Do not send this form to HM Revenue and Customs (HMRC).</Text>
        </View>
        <View style={styles.half}>
          <Text style={styles.h3}>Instructions for employees</Text>
          <Text style={styles.text}>As a new employee your employer needs the information on this form before your first payday to tell HMRC about you and help them use the correct tax code.</Text>
          <Text style={styles.text}>Fill in this form then give it to your employer. <Text style={styles.bold}>Do not send this form to HMRC.</Text></Text>
          <Text style={styles.text}>It's important that you choose the correct statement. If you do not choose the correct statement you may pay too much or too little tax.</Text>
          <Text style={styles.text}>For help filling in this form watch our short youtube video, go to www.youtube.com/hmrcgovuk</Text>
        </View>
      </View>

      {/* Personal Details Section */}
      <Text style={styles.h2}>Employee's personal details</Text>
      
      <View style={styles.row}>
        {/* Left Column (1-4) */}
        <View style={[styles.half, { paddingRight: 12 }]}>
          <DataField label="1 Last name" value={data.employee.lastName} />
          <DataField label="2 First names" value={data.employee.firstName} />
          <Text style={[styles.small, { marginTop: -4, marginBottom: 6 }]}>Do not enter initials or shortened names such as Jim for James or Liz for Elizabeth</Text>
          
          <View style={{ marginBottom: 8 }}>
            <Text style={styles.inputLabel}>3 Are you male or female?</Text>
            <View style={[styles.row, { marginTop: 3 }]}>
              <Checkbox checked={data.employee.gender === 'Male'} label="Male" />
              <View style={{ width: 15 }} />
              <Checkbox checked={data.employee.gender === 'Female'} label="Female" />
            </View>
          </View>

          <DataField label="4 Date of birth DD MM YYYY" value={data.employee.dob} />
        </View>

        {/* Right Column (5-7) */}
        <View style={styles.half}>
          <DataField label="5 Home address" value={data.employee.address} />
          <DataField label="Postcode" value={data.employee.postcode} width="60%" />
          <DataField label="Country" value={data.employee.country} width="60%" />
          
          <DataField label="6 National Insurance number if known" value={data.employee.niNumber} />
          <DataField label="7 Employment start date DD MM YYYY" value={data.employee.startDate} />
        </View>
      </View>

      {/* Employee Statement Section - Now properly fits on page 1 */}
      <Text style={styles.h2}>Employee statement</Text>
      <Text style={styles.text}>
        <Text style={styles.bold}>8 Choose the statement that applies to you,</Text> either A, B or C, and tick the appropriate box.
      </Text>

      <View style={styles.table}>
        {/* Statement A */}
        <View style={styles.tableCol}>
          <Text style={styles.tableTitle}>Statement A</Text>
          <Text style={[styles.small, styles.italic, { marginBottom: 6 }]}>
            Do not choose this statement if you're in receipt of a State, Works or Private Pension.
          </Text>
          <Text style={styles.text}>
            Choose this statement if the following applies.
          </Text>
          <Text style={styles.text}>
            This is my first job since 6 April and since the 6 April I've not received payments from any of the following:
          </Text>
          <View style={{ marginLeft: 4, marginTop: 3 }}>
            <Text style={styles.text}>• Jobseeker's Allowance</Text>
            <Text style={styles.text}>• Employment and Support Allowance</Text>
            <Text style={styles.text}>• Incapacity Benefit</Text>
          </View>
          <View style={{ marginTop: 'auto', paddingTop: 10 }}>
            <Checkbox checked={data.statement === 'A'} label="Statement A applies to me" />
          </View>
        </View>

        {/* Statement B */}
        <View style={styles.tableCol}>
          <Text style={styles.tableTitle}>Statement B</Text>
          <Text style={[styles.small, styles.italic, { marginBottom: 6 }]}>
            Do not choose this statement if you're in receipt of a State, Works or Private Pension.
          </Text>
          <Text style={styles.text}>
            Choose this statement if the following applies.
          </Text>
          <Text style={styles.text}>
            Since 6 April I have had another job but I do not have a P45. And/or since the 6 April I have received payments from any of the following:
          </Text>
          <View style={{ marginLeft: 4, marginTop: 3 }}>
            <Text style={styles.text}>• Jobseeker's Allowance</Text>
            <Text style={styles.text}>• Employment and Support Allowance</Text>
            <Text style={styles.text}>• Incapacity Benefit</Text>
          </View>
          <View style={{ marginTop: 'auto', paddingTop: 10 }}>
            <Checkbox checked={data.statement === 'B'} label="Statement B applies to me" />
          </View>
        </View>

        {/* Statement C */}
        <View style={[styles.tableCol, styles.lastCol]}>
          <Text style={styles.tableTitle}>Statement C</Text>
          <Text style={[styles.small, styles.italic, { marginBottom: 6 }]}>
            Choose this statement if:
          </Text>
          <Text style={styles.text}>• you have another job and/or</Text>
          <Text style={styles.text}>• you're in receipt of a State, Works or Private Pension</Text>
          <View style={{ marginTop: 'auto', paddingTop: 10 }}>
            <Checkbox checked={data.statement === 'C'} label="Statement C applies to me" />
          </View>
        </View>
      </View>

      <View style={styles.pageFooter}>
        <Text style={styles.small}>Starter checklist</Text>
        <Text style={styles.small}>Page 1</Text>
        <Text style={styles.small}>HMRC 02/21</Text>
      </View>
    </Page>

    {/* PAGE 2 */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.h2}>Student Loans</Text>
      
      {/* Q9 */}
      <Text style={styles.inputLabel}>9 Tell us if any of the following statements apply to you:</Text>
      <View style={{ marginLeft: 8, marginTop: 4, marginBottom: 6 }}>
        <Text style={styles.text}>• you do not have any Student or Postgraduate Loans</Text>
        <Text style={styles.text}>• you're still studying full-time on a course that your Student Loan relates to</Text>
        <Text style={styles.text}>• you completed or left your full-time course after the start of the current tax year, which started on 6 April</Text>
        <Text style={styles.text}>• you're already making regular direct debit repayments from your bank, as agreed with the Student Loans Company</Text>
      </View>

      <View style={{ flexDirection: 'row', marginTop: 8, marginBottom: 15 }}>
        <View style={{ width: 160, padding: 6, border: '0.5px solid #999', marginRight: 8 }}>
          <Checkbox checked={!data.studentLoan.hasNoLoans} label="If No, tick this box and go to question 10" />
        </View>
        <View style={{ width: 160, padding: 6, border: '0.5px solid #999' }}>
          <Checkbox checked={data.studentLoan.hasNoLoans} label="If Yes, tick this box and go straight to the Declaration" />
        </View>
      </View>

      <View style={styles.row}>
        {/* Q10 Selection */}
        <View style={[styles.half, { paddingRight: 8 }]}>
          <Text style={styles.inputLabel}>10 To avoid repaying more than you need to, tick the correct Student Loans that you have - use the guidance on the right to help you.</Text>
          <Text style={[styles.small, { marginBottom: 6, marginTop: 3 }]}>Please tick all that apply</Text>
          
          <View style={styles.loanOptions}>
            <View style={{ marginBottom: 4 }}><Checkbox checked={data.studentLoan.plan1} label="Plan 1" /></View>
            <View style={{ marginBottom: 4 }}><Checkbox checked={data.studentLoan.plan2} label="Plan 2" /></View>
            <View style={{ marginBottom: 4 }}><Checkbox checked={data.studentLoan.plan4} label="Plan 4" /></View>
            <View style={{ marginBottom: 4 }}><Checkbox checked={data.studentLoan.postgradLoan} label="Postgraduate Loan (England and Wales only)" /></View>
          </View>
        </View>

        {/* Plan Descriptions */}
        <View style={[styles.half, { paddingLeft: 8 }]}>
          <Text style={[styles.bold, { marginBottom: 4 }]}>Types of Student Loan</Text>
          
          <Text style={[styles.small, styles.bold, { marginTop: 6 }]}>You have Plan 1 if any of the following apply:</Text>
          <Text style={styles.small}>• you lived in Northern Ireland when you started your course</Text>
          <Text style={styles.small}>• you lived in England or Wales and started your course before 1 September 2012</Text>

          <Text style={[styles.small, styles.bold, { marginTop: 6 }]}>You have a Plan 2 if:</Text>
          <Text style={styles.small}>You lived in England or Wales and started your course on or after 1 September 2012.</Text>

          <Text style={[styles.small, styles.bold, { marginTop: 6 }]}>You have a Plan 4 if:</Text>
          <Text style={styles.small}>You lived in Scotland and applied through the Students Award Agency Scotland (SAAS) when you started your course.</Text>

          <Text style={[styles.small, styles.bold, { marginTop: 6 }]}>You have a Postgraduate Loan if any of the following apply:</Text>
          <Text style={styles.small}>• you lived in England and started your Postgraduate Master's course on or after 1 August 2016</Text>
          <Text style={styles.small}>• you lived in Wales and started your Postgraduate Master's course on or after 1 August 2017</Text>
          <Text style={styles.small}>• you lived in England or Wales and started your Postgraduate Doctoral course on or after 1 August 2018</Text>
        </View>
      </View>

      <View style={{ marginTop: 12 }}>
        <Text style={styles.small}>Employees, for more information about the type of loan you have, go to www.gov.uk/sign-in-to-manage-your-student-loan-balance</Text>
        <Text style={styles.small}>Employers, for guidance go to www.gov.uk/guidance/special-rules-for-student-loans</Text>
      </View>

      {/* Declaration */}
      <Text style={[styles.h2, { marginTop: 15 }]}>Declaration</Text>
      <Text style={styles.text}>I confirm that the information I've given on this form is correct.</Text>
      
      <View style={[styles.row, { marginTop: 15, alignItems: 'flex-end' }]}>
        <View style={{ width: '40%', marginRight: 15 }}>
          <Text style={styles.inputLabel}>Signature</Text>
          <View style={{ borderBottom: '0.5px solid #999', height: 16, marginBottom: 4 }} />
        </View>
        <View style={{ flex: 1 }}>
          <DataField label="Full name" value={data.declaration.fullName} smallLabel={true} />
        </View>
      </View>
      
      <View style={{ width: '40%', marginTop: 8 }}>
        <DataField label="Date DD MM YYYY" smallLabel={true} />
      </View>

      <View style={styles.pageFooter}>
        <Text>Page 2</Text>
      </View>
    </Page>
  </Document>
);

export default StarterCheckListPdf;