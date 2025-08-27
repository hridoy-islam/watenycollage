import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer"
import moment from "moment"

// Mock data to replace variables
const MOCK_DATA = {
  name: "John Smith",
  dob: moment("1990-05-15").format("DD MMM, YYYY"),
  email: "john.smith@example.com",
  countryOfBirth: "United States",
  nationality: "American",
  dateOfBirth: moment("1990-05-15").format("DD MMM, YYYY"),
  admin: "Watney",
  adminEmail: "info@watneycollege.co.uk",
}

// PDF styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  subject: {
    fontSize: 16,
    marginBottom: 15,
    fontWeight: "bold",
  },
  body: {
    fontSize: 12,
    lineHeight: 1.5,
    textAlign: "justify",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#666666",
  },
})

// Replace variables in text with mock data
const replaceVariables = (text: string): string => {
  let replacedText = text
  Object.entries(MOCK_DATA).forEach(([key, value]) => {
    const regex = new RegExp(`\\[${key}\\]`, "g")
    replacedText = replacedText.replace(regex, value)
  })
  return replacedText
}

// PDF Document component
const EmailPDF = ({ subject, body }: { subject: string; body: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        {/* <Text style={styles.title}>Email Template</Text> */}
        <Text style={styles.subject}>Subject: {replaceVariables(subject)}</Text>
        <Text style={styles.body}>{replaceVariables(body)}</Text>
      </View>
      <Text style={styles.footer}>
        Generated on {moment().format("DD MMM, YYYY")} at {moment().format("HH:mm")}
      </Text>
    </Page>
  </Document>
)

// Function to generate and download PDF
export const downloadEmailPDF = async (subject: string, body: string) => {
  try {
    const blob = await pdf(<EmailPDF subject={subject} body={body} />).toBlob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `email-template-${moment().format("YYYY-MM-DD-HHmm")}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  }
}
