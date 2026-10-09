import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import moment from "moment";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 50,
    fontSize: 12,
    lineHeight: 1.6,
    fontFamily: "Helvetica",
    color: "#000000",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: "auto",
  },
  title: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    textDecoration: "underline",
    marginBottom: 40,
  },
  // One flowing paragraph: the name sits inline so nothing breaks after it
  bodyParagraph: {
    fontSize: 12,
    textAlign: "justify",
    marginBottom: 50,
  },
  nameValue: {
    fontFamily: "Helvetica-Bold",
    textDecoration: "underline",
  },
  signatureSection: {
    marginTop: 20,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 26,
  },
  fieldLabel: {
    fontSize: 12,
    width: 80,
  },
  fieldLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    borderBottomStyle: "solid",
    minWidth: 240,
    minHeight: 18,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 2,
  },
  signatureImage: {
    width: 140,
    height: 45,
    objectFit: "contain",
  },
  fieldValue: {
    fontSize: 12,
  },
});

export interface ReferenceDeclarationPdfProps {
  /** Applicant name, already assembled from the parts that exist */
  name?: string;
  signatureUrl?: string;
  /** Job application createdAt */
  date?: string;
}

const DOTS = "................................................";

export const ReferenceDeclarationPdf = ({
  name,
  signatureUrl,
  date,
}: ReferenceDeclarationPdfProps) => (
  <Document title="Declaration - Reference - GDPR">
    <Page size="A4" style={styles.page}>
      <View style={styles.headerContainer}>
        <Image src="/logo.png" style={styles.logo} />
      </View>

      <Text style={styles.title}>DECLARATION</Text>

      <Text style={styles.bodyParagraph}>
        I, <Text style={styles.nameValue}>{name || DOTS}</Text> hereby authorize
        Medicare Link to contact the mentioned referees to avail my reference
        as a part of the recruitment process.
      </Text>

      <View style={styles.signatureSection}>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Signature</Text>
          <View style={styles.fieldLine}>
            {signatureUrl ? (
              <Image src={signatureUrl} style={styles.signatureImage} />
            ) : (
              <Text style={styles.fieldValue}>{DOTS}</Text>
            )}
          </View>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Date</Text>
          <View style={styles.fieldLine}>
            <Text style={styles.fieldValue}>
              {date ? moment(date).format("DD/MM/YYYY") : DOTS}
            </Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

export default ReferenceDeclarationPdf;
