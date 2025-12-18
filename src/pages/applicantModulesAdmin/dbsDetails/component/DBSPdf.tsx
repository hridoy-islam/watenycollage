// src/components/pdf/DBSPdf.tsx
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    lineHeight: 1.5,
    fontFamily: 'Helvetica', // default font
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#999',
  },
  headerLeft: {
    width: '30%',
    fontSize: 9,
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
  linkText: {
    color: 'blue',
    textDecoration: 'underline',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  col: {
    width: '30%',
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#555',
    marginBottom: 2,
  },
  value: {
    fontSize: 12,
  },
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#999',
    fontSize: 10,
    color: '#666',
  },
});

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

interface DBSPdfProps {
  dbsDetails: any;
}

const DBSPdf = ({ dbsDetails }: DBSPdfProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <HeaderComponent />

      <View>
        <Text style={styles.sectionTitle}>DBS Certificate Details</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Applicant Name</Text>
          <Text style={styles.value}>{dbsDetails.name || '—'}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Applied For</Text>
          <Text style={styles.value}>{dbsDetails.jobPost || '—'}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Disclosure Number</Text>
          <Text style={styles.value}>{dbsDetails.disclosureNumber || '—'}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Date of Issue</Text>
          <Text style={styles.value}>
            {dbsDetails.dateOfIssue
              ? new Date(dbsDetails.dateOfIssue).toLocaleDateString('en-GB')
              : '—'}
          </Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Expiry Date</Text>
          <Text style={styles.value}>
            {dbsDetails.expiryDate
              ? new Date(dbsDetails.expiryDate).toLocaleDateString('en-GB')
              : '—'}
          </Text>
        </View>
        <View style={styles.col} />
      </View>

      
    </Page>
  </Document>
);

export default DBSPdf;