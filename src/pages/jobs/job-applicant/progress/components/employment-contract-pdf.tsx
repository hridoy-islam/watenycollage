import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet
} from '@react-pdf/renderer';
import { format } from 'date-fns';

const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    fontSize: 10,
    lineHeight: 1.2,
    fontFamily: 'Helvetica'
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  headerLeft: {
    width: '30%',
    fontSize: 8
  },
  headerCenter: {
    width: '30%',
    alignItems: 'center'
  },
  headerRight: {
    width: '30%',
    alignItems: 'flex-end',
    fontSize: 8
  },
  title: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
    textTransform: 'uppercase'
  },
  subtitle: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
    textTransform: 'uppercase'
  },
  paragraph: {
    textAlign: 'justify',
    marginBottom: 2,
    fontSize: 9
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: 'bold',
    marginTop: 6,
    marginBottom: 4
  },
  signatureSection: {
    marginTop: 8
  },
  signatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  // ---- Signature image: floats above the inline line, right-aligned,
  // same row height as Name/Date so all three lines stay level ----
  signatureImage: {
    width: 55,
    height: 18,
    objectFit: 'contain',
    position: 'absolute',
    bottom: 2,
    right: 6
  },
  fieldLabel: {
    fontSize: 9.5,
    fontWeight: 'bold',
    width: 55
  },
  fieldValue: {
    fontSize: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    minWidth: 180,
    paddingBottom: 1
  },
  fieldValueShort: {
    fontSize: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    minWidth: 100,
    paddingBottom: 1
  },
  alsoRefer: {
    marginTop: 8,
    fontSize: 9,
    fontStyle: 'italic'
  },
  footer: {
    position: 'absolute',
    bottom: 12,
    left: 20,
    right: 20,
    textAlign: 'center',
    fontSize: 9,
    color: '#666'
  },
  undertakingItem: {
    marginBottom: 2,
    textAlign: 'justify',
    fontSize: 9
  },
  bulletItem: {
    flexDirection: 'row',
    textAlign: 'justify',
    fontSize: 9,
    marginBottom: 2
  },
  bulletNumber: {
    width: 20,
    fontWeight: 'bold'
  },
  bulletContent: {
    flex: 1
  },
  bulletContentNoIndent: {
    flex: 1,
    marginLeft: -20
  },
  underlinedValue: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 1,
    minWidth: 80
  },
  noticeSection: {
    marginTop: 4,
    marginBottom: 4
  },
  noticeLine: {
    flexDirection: 'row',
    marginBottom: 1,
    fontSize: 9,
    width: '100%'
  },
  noticeLabel: {
    width: '100%'
  },
  noticeText: {
    flex: 1
  },
  italicText: {
    fontSize: 9,
    fontStyle: 'italic',
    marginTop: 2
  },
  // ---- Row-wise signature layout ----
  signatureBlockContainer: {
    marginTop: 6
  },
  // Inline "Label ............." field: label and line sit on the same row
  inlineFieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  inlineFieldLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 4
  },
  inlineFieldLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    height: 14,
    position: 'relative'
  },
  signatureFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0
  },
  signatureFieldCol: {
    width: '48%'
  },
  signatureFieldColThird: {
    width: '31%'
  },
  signatureLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 1
  },
  signatureUnderline: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    height: 12,
    position: 'relative'
  },
  signatureUnderlineShort: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    height: 12,
    position: 'relative'
  },
  signatureDateText: {
    fontSize: 9,
    color: '#333',
    position: 'absolute',
    bottom: 2,
    left: 2
  },
  signatureNameText: {
    fontSize: 9,
    color: '#333',
    position: 'absolute',
    bottom: 2,
    left: 2
  },
  noticeBlock: {
    marginVertical: 1
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  nameLabel: {
    fontSize: 9,
    fontWeight: 'bold'
  },
  nameUnderline: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    height: 18,
    marginLeft: 4
  },
  nameText: {
    fontSize: 9,
    paddingLeft: 4,
    paddingTop: 2
  }
});

const HeaderComponent = () => (
  <View style={styles.headerContainer}>
    <View style={styles.headerLeft} />
    <View style={styles.headerCenter}>
      <Image src="/logo.png" style={{ width: 60, height: 'auto' }} />
    </View>
    <View style={styles.headerRight} />
  </View>
);

// Items 16-34 (continues numbering from page 1's items 1-15)
const undertakings = [
  'Adhere to all national codes and standards of the industry at all times.',
  'Agree to records relating to your employment being kept in accordance with the statutory minimum requirements.',
  "That you have given Everycare the authority to store a photographic image of you electronically on Everycare's computer and in your personal file and permit Everycare to pass on a copy if requested by the contractor or service user for identification verification.",
  "Abide strictly to Everycare's policies in relation to 'Confidentiality' and 'Data Protection'.",
  'Maintain confidentiality of all Everycare copyright documents, materials, intellectual property, operating systems not to disclose their contents or make any copies.',
  "Always carry out responsibilities with due regard to Everycare's Equal Opportunities Policy.",
  'Always abide by the Health and Safety at Work Act 1974, to ensure that the agreed Health and Safety procedures are carried out to maintain a safe working environment for all including the service user yourself and your colleagues.',
  'Notify Everycare management of any employment whatsoever taken up concurrent with your employment at Everycare, not disclosed on your application form.',
  'That you have declared all information relating to your criminal record and that you will notify Everycare immediately of any conviction or police caution received whilst employed by Everycare. You will be required to obtain a satisfactory Enhanced Criminal Records Bureau disclosure and have it renewed every three years.',
  'That you have never been dismissed from any post involving care services or been involved in any disciplinary process involving gross misconduct or any Safeguarding investigation taken against you, whether or not this resulted in dismissal, that you have not declared and to notify Everycare immediately of any disciplinary or Safeguarding action taking against you whilst employed by Everycare.',
  'To inform your insurance company if you are using your car in connection with your job, to provide evidence of adequate insurance to Everycare and inform Everycare of any change in your vehicle insurance status.',
  'Notify Everycare immediately of any driving convictions or penalties (except parking) whilst employed by Everycare.',
  'That the information provided by yourself concerning your experience, personal details and history and your physical and mental health shall be true and accurate to the best of your knowledge.',
  'Notify Everycare of any change in your physical or psychological status and that Everycare may contact your GP and obtain information on your health status if and when required and that if you work regular nights you will comply with the required annual health screening and complete the annual Health Declaration Questionnaire and that you will do so in any case if requested by management.',
  'Undergo such supervision / appraisal as Everycare shall supply and specify at its sole discretion.',
  "Be prepared to undergo such training as Everycare shall supply and specify at its sole discretion, the cost of which is recoverable from the employee under the terms of the 'Everycare Training Agreements'.",
  'To be prepared to perform reasonable on call duties.',
  'To be and remain contactable by telephone.',
  "That you agree to the recovery from your weekly wages, the weekly agreed amount of any advances or loans that have been made to you at the organisations sole discretion and that any outstanding amount may be recovered from your final weeks pay or remaining money in your 'Personal Holiday Fund'."
];

const employerNotice = [
  "Under 1 month's service - Nil",
  '1 month up to successful completion of your probationary period - 1 week',
  "On successful completion of probationary period but less than 5 years' service - 4 weeks",
  '5 years service or more - 1 week for each completed year of service to a maximum of 12 weeks after 12 years'
];

const employeeNotice = [
  "Under 1 month's service - Nil",
  '1 month up to successful completion of your probationary period - 1 week',
  'On successful completion of your probationary period - 4 weeks'
];

interface EmploymentContractPdfProps {
  name: string;
  jobStartDate?: string;
  signatureUrl?: string;
  createdAt?: any;
  employerName?: string;
  employerDesignate?: string;
  employerSignatureUrl?: string;
  employerSignatureDate?: string;
}

export const EmploymentContractPdf = ({
  name,
  jobStartDate,
  signatureUrl,
  createdAt,
  employerName = '',
  employerDesignate = '',
  employerSignatureUrl = '',
  employerSignatureDate = ''
}: EmploymentContractPdfProps) => (
  <Document>
    {/* ---------------- PAGE 1 ---------------- */}
    <Page size="A4" style={styles.page}>
      <HeaderComponent />

      <Text style={styles.title}>
        CONTRACT OF EMPLOYMENT STATEMENT & WRITTEN PARTICULARS OF MAIN TERMS OF
        EMPLOYMENT
      </Text>
      <Text style={styles.subtitle}>
        Health & Social Care Assistant / Health Care Assistant
      </Text>

      <Text style={styles.paragraph}>
        This statement dated{' '}
        {createdAt
          ? format(new Date(createdAt), 'MM/dd/yyyy')
          : '___/___/___'}{' '}
        sets out certain particulars of the terms and conditions which, in
        conjunction with the Staff Handbook, Policies & Procedures, Job
        Description and any other operating procedures, form part of the
        Contract of Employment on which Everycare employs. In your employment,
        Everycare is acting as an employment business.
      </Text>

      <View style={{ flexDirection: 'row', marginBottom: 4 }}>
        <Text style={{ fontSize: 9 }}>NAME: </Text>
        <Text
          style={{
            borderBottomWidth: 1,
            borderBottomColor: '#333',
            minWidth: 90,
            fontSize: 9
          }}
        >
          {name || '______________'}{' '}
        </Text>
        <Text style={styles.paragraph}>
          Any changes or amendments to this will be confirmed in writing within
          one month of them occurring.
        </Text>
      </View>

      <View>
        <View style={styles.bulletItem}>
          <Text style={styles.bulletNumber}>1.</Text>
          <Text style={styles.bulletContent}>
            Your employment began on{' '}
            <Text
              style={{
                borderBottomWidth: 1,
                borderBottomColor: '#333',
                minWidth: 90,
                fontSize: 9
              }}
            >
              {jobStartDate
                ? format(new Date(jobStartDate), 'MM/dd/yyyy')
                : '___/___/___'}
            </Text>{' '}
            (i.e. the day you undertook your first assignment). Employment with
            your previous employer does not count as part of your continuous
            period of employment.
          </Text>
        </View>

        <View style={styles.bulletItem}>
          <Text style={styles.bulletNumber}>2.</Text>
          <Text style={styles.bulletContent}>
            You are employed as a Health and Social Care Assistant/Health Care
            Assistant. As a predominantly domiciliary based worker you will
            organise your duties from your home base. You will not be entitled
            to any expenses or payment from Everycare towards the operation of
            your home-based office.
          </Text>
        </View>

        <View style={styles.bulletItem}>
          <Text style={styles.bulletNumber}>3.</Text>
          <Text style={styles.bulletContent}>
            You are employed subject to the satisfactory completion of a
            three-month probationary period during which time your work will be
            assessed.
          </Text>
        </View>

        <View style={styles.bulletItem}>
          <Text style={styles.bulletNumber}>4.</Text>
          <Text style={styles.bulletContent}>
            The duties of this post are specified in your job description which
            accompanies these terms of employment. Everycare's full personnel
            system is found in the Staff Handbooks and Policies & Procedures
            available on-line at{' '}
            <Text style={{ color: 'blue', textDecoration: 'underline' }}>
              www.everycare.co.uk
            </Text>
            . Everycare reserves the right to require you to perform other
            duties and work in various locations or geographical areas from time
            to time and it is a condition of your employment that you are
            prepared to do this. You will not be required to work outside the UK
            for a period or periods exceeding one month.
          </Text>
        </View>

        <View style={styles.bulletItem}>
          <Text style={styles.bulletNumber}>5.</Text>
          <Text style={styles.bulletContent}>
            Your salary will be paid at weekly intervals by credit transfer in
            arrears (except during public holiday weeks). Details of your salary
            level have been notified to you. You will be paid in respect of the
            work that you have undertaken as instructed by Everycare whether or
            not it is paid by the hirer in respect of that work.
          </Text>
        </View>

        <View style={styles.bulletItem}>
          <Text style={styles.bulletNumber}>6.</Text>
          <Text style={styles.bulletContent}>
            Your hours of work will be as per your personal variable rota for
            the week and will be in accordance with the job's requirements. You
            may be requested to work hours in addition to those published on
            your personal rota when authorised and as necessitated by the needs
            of the business. If there is a temporary shortage of work for any
            reason, we will try to maintain your continuity of employment even
            if this necessitates placing you on short time working. If you are
            placed on short time working, your pay will be reduced according to
            the time actually worked. (OPTION a) Alternatively you may be placed
            on lay off. If you are placed on lay off, you will receive no pay
            other than statutory guarantee 'Lay off' Pay'. (OPTION b) However
            there are no guaranteed hours of work attached to this post.
          </Text>
        </View>

        <View style={styles.bulletItem}>
          <Text style={styles.bulletNumber}>7.</Text>
          <Text style={styles.bulletContent}>
            Your holiday year begins 1st April and ends 31st March each year.
            There is an entitlement to paid holidays of 5.6 weeks per annum (pro
            rata to the hours worked) attached to this post, accruing from the
            commencement of employment. Payment for Bank Holidays will be made
            in accordance with rates notified to you.
          </Text>
        </View>

        <View style={styles.bulletItem}>
          <Text style={styles.bulletNumber}>8.</Text>
          <Text style={styles.bulletContent}>
            Payment for periods of absence due to authorised sickness will be
            made in accordance with the current Statutory Sick Pay Schedule. You
            accept that under our contractual terms with local authorities and
            private funded service users that we are obliged to provide a
            continuous service and service users have the right to retain the
            services of care staff introduced during periods of sickness. We
            cannot therefore guarantee that assignments with particular service
            users will continue on your return from sick leave. We therefore
            cannot guarantee any of your work hours in this circumstance or in
            the event of loss of a contract, hospitalisation or death of a
            service user that you are assigned to. In these circumstances we
            will make every effort to provide you with alternative care work.
          </Text>
        </View>

        <View style={styles.bulletItem}>
          <Text style={styles.bulletNumber}>9.</Text>
          <Text style={styles.bulletContent}>
            It is a condition of employment that you maintain a high level of
            physical and mental fitness whilst employed by Everycare.
          </Text>
        </View>

        <View style={styles.bulletItem}>
          <Text style={styles.bulletNumber}>10.</Text>
          <Text style={styles.bulletContent}>
            Everycare rules and personnel policies and procedures form part of
            your conditions of employment. It is your responsibility to
            familiarise yourself with these and observe them at all times.
          </Text>
        </View>

        <View style={styles.bulletItem}>
          <Text style={styles.bulletNumber}>11.</Text>
          <Text style={styles.bulletContent}>
            Once initial training & assessment has been provided you are
            required to work for a minimum period of thirteen weeks under this
            contract. Failure to fulfil this requirement will render you liable
            to repay <Text style={styles.underlinedValue}>£100.00</Text> for
            training costs to Everycare, which will be deducted from your final
            salary and / or money in your personal holiday fund. The cost of any
            future training will be covered by 'Everycare's Training Agreement'
            and dealt with similarly.
          </Text>
        </View>

        <View style={styles.bulletItem}>
          <Text style={styles.bulletNumber}>12.</Text>
          <Text style={styles.bulletContent}>
            All items loaned to you to assist in the carrying out of your duties
            are the property of Everycare and must be returned on termination of
            your employment. The final week's salary and any amount of money in
            your holiday fund will be held at the Everycare office for
            collection upon the return of all Everycare property, settlement of
            any money due in accordance with 'Everycare Training Agreements' and
            repayment of any loans or wages advances made at the organisation's
            sole discretion.
          </Text>
        </View>

        <View style={styles.bulletItem}>
          <Text style={styles.bulletNumber}>13.</Text>
          <Text style={styles.bulletContent}>
            If you wish to raise any grievance relating to your employment, you
            should do so in accordance with the Grievance Policy & Procedure.
          </Text>
        </View>

        <View style={styles.bulletItem}>
          <Text style={styles.bulletNumber}>14.</Text>
          <Text style={styles.bulletContent}>
            If whilst an employee of the Everycare company at the head of this
            contract you take up employment with another private health & social
            care organisation, you must inform Everycare immediately. If you
            enter into any private arrangement to provide services to an
            Everycare Service User disciplinary action may be considered against
            you which may include dismissal.
          </Text>
        </View>

        <View style={styles.bulletItem}>
          <Text style={styles.bulletNumber}>15.</Text>
          <Text style={styles.bulletContent}>
            It is also a condition of your employment, that for a period of{' '}
            <Text style={styles.underlinedValue}>12 months</Text> immediately
            following the termination of your employment for any reason
            whatsoever, you will not, whether directly or indirectly as
            principal, agent, employee, director, partner or otherwise howsoever
            approach any individual or organisation who has during your period
            of employment been a customer of an Everycare Franchise or of
            Everycare (UK) Limited, if the purpose for such an approach is to
            solicit business which could have been undertaken by them. Neither
            shall you set up a business in any capacity, in direct competition
            with an Everycare Franchise or Everycare (UK) Limited within a{' '}
            <Text style={styles.underlinedValue}>5 mile</Text> radius of any of
            their 'Territories' or duties, within the same{' '}
            <Text style={styles.underlinedValue}>12 month</Text> period.
          </Text>
        </View>
      </View>

      <Text style={styles.footer} fixed>
        Page 1
      </Text>
    </Page>

    {/* ---------------- PAGE 2 ---------------- */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>
        In accepting this contract of employment, you acknowledge that you give
        an undertaking to:
      </Text>
      <View>
        {undertakings.map((item, i) => (
          <View key={i} style={styles.bulletItem}>
            <Text style={styles.bulletNumber}>{i + 16}.</Text>
            <Text style={styles.bulletContent}>{item}</Text>
          </View>
        ))}
      </View>
      
      {/* NOTICE OF TERMINATION TO BE GIVEN BY EMPLOYER */}
      <Text style={styles.sectionTitle}>
        Notice of Termination to be Given by Employer
      </Text>
      <View style={styles.noticeBlock}>
        {employerNotice.map((item, i) => (
          <Text key={i} style={styles.noticeLine}>
            {item}
          </Text>
        ))}
      </View>
      <Text style={styles.italicText}>
        We reserve the contractual right to give pay in lieu of all or any part
        of the above notice by either party.
      </Text>
      
      {/* NOTICE OF TERMINATION TO BE GIVEN BY EMPLOYEE */}
      <Text style={styles.sectionTitle}>
        Notice of Termination to be Given by Employee
      </Text>
      <View style={styles.noticeBlock}>
        {employeeNotice.map((item, i) => (
          <Text key={i} style={styles.noticeLine}>
            {item}
          </Text>
        ))}
      </View>
      <Text style={styles.italicText}>
        We reserve the contractual right to give pay in lieu of all or any part
        of the above notice by either party.
      </Text>
      
      <Text style={[styles.paragraph, { marginTop: 6 }]}>
        I give an undertaking that I am able to satisfy all the above conditions
        and agree to all the terms imposed above as a condition of my employment
        with Everycare. Should it prove that I have made any false statement
        relative to the above, I accept that this may result in the exercise of
        Everycare's Disciplinary & Dismissal Policy.
      </Text>

      {/* SIGNATURE SECTION - no section labels */}

      {/* Employee: Name ..... Signature ..... Date ..... in one inline row */}
      <View style={styles.signatureBlockContainer}>
        <View style={styles.signatureFieldRow}>
          <View style={styles.signatureFieldColThird}>
            <View style={styles.inlineFieldRow}>
              <Text style={styles.inlineFieldLabel}>Name</Text>
              <View style={styles.inlineFieldLine}>
                {name && (
                  <Text style={styles.signatureNameText}>{name}</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.signatureFieldColThird}>
            <View style={styles.inlineFieldRow}>
              <Text style={styles.inlineFieldLabel}>Signature</Text>
              <View style={styles.inlineFieldLine}>
                {signatureUrl && (
                  <Image src={signatureUrl} style={styles.signatureImage} />
                )}
              </View>
            </View>
          </View>

          <View style={styles.signatureFieldColThird}>
            <View style={styles.inlineFieldRow}>
              <Text style={styles.inlineFieldLabel}>Date</Text>
              <View style={styles.inlineFieldLine}>
                {createdAt && (
                  <Text style={styles.signatureDateText}>
                    {format(new Date(createdAt), 'MM/dd/yyyy')}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Employer: Name ..... Signature ..... in one row, Designate ..... Date ..... below */}
      <View style={[styles.signatureBlockContainer, { marginTop: 14 }]}>
        <View style={styles.signatureFieldRow}>
          <View style={styles.signatureFieldCol}>
            <View style={styles.inlineFieldRow}>
              <Text style={styles.inlineFieldLabel}>Name</Text>
              <View style={styles.inlineFieldLine}>
                {employerName && (
                  <Text style={styles.signatureNameText}>{employerName}</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.signatureFieldCol}>
            <View style={styles.inlineFieldRow}>
              <Text style={styles.inlineFieldLabel}>Signature</Text>
              <View style={styles.inlineFieldLine}>
                {employerSignatureUrl && (
                  <Image
                    src={employerSignatureUrl}
                    style={styles.signatureImage}
                  />
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.signatureFieldRow, { marginTop: 8 }]}>
          <View style={styles.signatureFieldCol}>
            <View style={styles.inlineFieldRow}>
              <Text style={styles.inlineFieldLabel}>Designate</Text>
              <View style={styles.inlineFieldLine}>
                {employerDesignate && (
                  <Text style={styles.signatureNameText}>{employerDesignate}</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.signatureFieldCol}>
            <View style={styles.inlineFieldRow}>
              <Text style={styles.inlineFieldLabel}>Date</Text>
              <View style={styles.inlineFieldLine}>
                {employerSignatureDate && (
                  <Text style={styles.signatureDateText}>
                    {format(new Date(employerSignatureDate), 'MM/dd/yyyy')}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.alsoRefer}>
        <Text>
          Also refer to: Policy & Procedure - Employment Rights - Main Terms &
          Conditions of Employment.
        </Text>
      </View>
      
      <Text style={styles.footer} fixed>
        Page 2
      </Text>
    </Page>
  </Document>
);