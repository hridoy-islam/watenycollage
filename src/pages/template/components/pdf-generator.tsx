import { Document, Page, Text, View, StyleSheet, pdf, Image } from "@react-pdf/renderer"
import moment from "moment"

// Mock data to replace variables
const MOCK_DATA = {
  name: 'Jane Doe',
  title: 'Ms',
  firstName: 'Jane',
  lastName: 'Doe',
  phone: '+1 (555) 123-4567',
  dateOfBirth: moment('1990-05-15').format('DD MMM, YYYY'),
  email: 'jane.doe@example.com',
  countryOfBirth: 'United States',
  nationality: 'American',
  countryOfResidence: 'Canada',
  ethnicity: 'Hispanic',
  gender: 'Female',
  postalAddressLine1: '123 Main St',
  postalAddressLine2: 'Apt 4B',
  postalCity: 'New York',
  postalCountry: 'USA',
  postalPostCode: '10001',
  residentialAddressLine1: '456 Oak Ave',
  residentialAddressLine2: '',
  residentialCity: 'Toronto',
  residentialCountry: 'Canada',
  residentialPostCode: 'M5V 3L9',
  emergencyAddress: '789 Pine Rd, Vancouver, CA',
  emergencyContactNumber: '+1 (555) 987-6543',
  emergencyEmail: 'emergency.contact@example.com',
  emergencyFullName: 'John Smith',
  emergencyRelationship: 'Brother',
  admin: 'Watney College',
  adminEmail: 'info@watneycollege.co.uk',
  applicationLocation: 'Online Portal',
  courseName: 'Exam Preparation Courses',
  intake:'September 2025',
  applicationStatus:'applied',
  applicationDate:'2025-05-15'
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
  logoContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    
  },
  logo: {
    width: 60,
    height: 60,
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
      {/* Logo Top Right */}
      <View style={styles.logoContainer}>
        <Image src="/logo.png" style={styles.logo} />
      </View>

      <View style={styles.section}>
        {/* <Text style={styles.title}>Email Template</Text> */}
        {/* <Text style={styles.subject}>Subject: {replaceVariables(subject)}</Text> */}
        <Text style={styles.body}>{replaceVariables(body)}</Text>
      </View>

      {/* <Text style={styles.footer}>
        Generated on {moment().format("DD MMM, YYYY")} at {moment().format("HH:mm")}
      </Text> */}
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
