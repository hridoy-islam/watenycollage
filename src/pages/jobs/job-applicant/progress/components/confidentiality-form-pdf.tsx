import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 11,
    lineHeight: 1.5,
    fontFamily: 'Helvetica',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 6,
  },
  headerCenter: {
    alignItems: 'center',
  },
  linkText: {
    color: 'blue',
    textDecoration: 'underline',
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  paragraph: {
    marginBottom: 6,
    textAlign: 'justify',
    fontSize: 11,
  },
  bulletList: {
    marginBottom: 6,
    paddingLeft: 12,
  },
  bulletItem: {
    marginBottom: 2,
    textAlign: 'justify',
    fontSize: 11,
  },
  signatureSection: {
    marginTop: 12,
    paddingTop: 8,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signatureField: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  signatureImage: {
    width: 100,
    height: 30,
    objectFit: 'contain',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#555',
  },
  fieldValue: {
    fontSize: 11,
  },
  alsoRefer: {
    marginTop: 8,
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
});

const HeaderComponent = () => (
  <View style={styles.headerContainer}>
    <View style={styles.headerCenter}>
      <Image src="/logo.png" style={{ width: 100, height: 'auto' }} />
      
    </View>
  </View>
);

const bulletPoints = [
  'Mention another service user or member of staff, even their name in front of another person other than in the course of the performance of their duties.',
  'Discuss another member of staff or anything that another member of staff has done with any other person other than in the course of the performance of their duties.',
  'Discuss anything that goes on in the Everycare office with any other person other than in the course of the performance of their duties.',
  'No employee should place any comment or information (whether specific or implied) on social networking sites that could be misunderstood or misinterpreted by any person (whether or not they are associated with Everycare or its associated companies or franchised offices) that would reflect in any way on Everycare, its Business, Directors, Managers, Employees or Service Users. A breach of this may constitute gross misconduct.',
];

interface ConfidentialityFormPdfProps {
  name: string;
  signatureUrl?: string;
  createdAt?: string;
}

export const ConfidentialityFormPdf = ({ name, signatureUrl, createdAt }: ConfidentialityFormPdfProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <HeaderComponent />

      <Text style={styles.title}>Confidentiality Undertaking</Text>

      <Text style={styles.paragraph}>
        In accordance with the Care Standards & Data Protection Acts and Everycare's Policies & Procedures, staff must respect and treat in complete confidence and in the best interests of the service user all information given by service users or their representatives.
      </Text>

      <Text style={styles.paragraph}>
        Service users and their relatives or representatives know that their personal information is handled appropriately and that their personal confidences are respected. In addition, service users have summaries of Everycare's policies and procedures on confidentiality which specifies the circumstances under which confidentiality may be breached and includes the process for dealing with inappropriate breaches of confidentiality.
      </Text>

      <Text style={styles.paragraph}>
        Staff know when information given to them in confidence must be shared with their manager and other staff.
      </Text>

      <Text style={styles.paragraph}>
        The principles of confidentiality are observed in discussion with colleagues and your manager, particularly when undertaking training or group supervision sessions.
      </Text>

      <Text style={styles.paragraph}>
        On no account should a member of staff do any of the following:
      </Text>

      <View style={styles.bulletList}>
        {bulletPoints.map((point, i) => (
          <Text key={i} style={styles.bulletItem}>{i + 1}. {point}</Text>
        ))}
      </View>

      <Text style={styles.paragraph}>
        If it comes to Everycare's attention that any of the above has been breached, the offending member of staff will be subject to disciplinary procedures.
      </Text>

      <Text style={styles.paragraph}>
        It must be appreciated that neither service user nor staff members are happy about the possibility of their affairs being made public. For some people even the issue that they receive services at all is something they would not wish others to know.
      </Text>

      <Text style={styles.paragraph}>
        I give an undertaking not to disclose anything about any service user, a service user's establishment, a member of staff to any other person or outsider, including the name or address of a service user, other than in the course of your duties. I undertake to maintain the strictest confidentiality in all matters related to Everycare and to abide by all the instructions contained in the Everycare Confidentiality Policy, both during the time of my employment at Everycare and after I have left.
      </Text>

      <View style={styles.signatureSection}>
        <View style={styles.signatureRow}>
          <View style={styles.signatureField}>
            <Text style={styles.fieldLabel}>Name: </Text>
            <Text style={styles.fieldValue}>{name || '________________'}</Text>
          </View>
          
          <View style={styles.signatureField}>
            <Text style={styles.fieldLabel}>Signed: </Text>
            {signatureUrl ? (
              <Image src={signatureUrl} style={styles.signatureImage} />
            ) : (
              <Text style={styles.fieldValue}>________________</Text>
            )}
          </View>
          
          <View style={styles.signatureField}>
            <Text style={styles.fieldLabel}>Date: </Text>
            <Text style={styles.fieldValue}>
              {createdAt ? format(new Date(createdAt), 'MM/dd/yyyy') : '___/___/____'}
            </Text>
          </View>
        </View>
      </View>

      {/* <View style={styles.alsoRefer}>
  <Text>Also refer to:</Text>
  <Text>Policy & Procedure - Confidentiality</Text>
  <Text>Policy & Procedure - Data Protection</Text>
</View> */}
    </Page>
  </Document>
);