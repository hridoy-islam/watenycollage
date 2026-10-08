import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    paddingTop: 40,
    fontSize: 11,
    lineHeight: 1.5,
    fontFamily: 'Helvetica',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 140,
    height: 45,
    objectFit: 'contain',
  },
  verticalDivider: {
    fontSize: 16,
    marginTop: 4,
    marginBottom: 25,
    textAlign: 'center',
    color: '#000',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 35,
    paddingTop:20
  },
  title: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    textDecoration: 'underline',
  },
  paragraph: {
    marginBottom: 40,
    textAlign: 'center',
    fontSize: 12,
  },
  companyName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 50,
  },
  signatureSection: {
    marginTop: 10,
    width: '40%',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 11,
    width: 65,
  },
  valueText: {
    fontSize: 11,
  },
  signatureImage: {
    width: 140,
    height: 40,
    objectFit: 'contain',
  },
});

interface StatementOfUnderstandingPdfProps {
  name?: string;
  signatureUrl?: string;
  createdAt?: string;
}

export const StatementOfUnderstandingPdf = ({
  name,
  signatureUrl,
  createdAt,
}: StatementOfUnderstandingPdfProps) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      {/* Logo Section */}
      <View style={styles.headerContainer}>
        <Image src="/logo.png" style={styles.logo} />
      </View>

      {/* Underlined Centered Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Statement of Understanding</Text>
      </View>

      {/* Body Text */}
      <Text style={styles.paragraph}>
        I hereby confirm that I have received, read and understand the Medication Policy of
      </Text>

      {/* Company Name */}
      <Text style={styles.companyName}>EVERYCARE ROMFORD</Text>

      {/* Stacked Signature Fields on Left */}
      <View style={styles.signatureSection}>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Name:</Text>
          <Text style={styles.valueText}>
            {name || '..........................................................'}
          </Text>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Signature:</Text>
          {signatureUrl ? (
            <Image src={signatureUrl} style={styles.signatureImage} />
          ) : (
            <Text style={styles.valueText}>
              ..........................................................
            </Text>
          )}
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Date:</Text>
          <Text style={styles.valueText}>
            {createdAt
              ? format(new Date(createdAt), 'dd/MM/yyyy')
              : '..........................................................'}
          </Text>
        </View>
      </View>
    </Page>
  </Document>
);