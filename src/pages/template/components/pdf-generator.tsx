import { Document, Page, Text, View, StyleSheet, pdf, Image } from "@react-pdf/renderer"
import moment from "moment"

// Mock data to replace variables and placeholders
const MOCK_DATA: Record<string, string> = {
  name: "Jane Doe",
  title: "Ms",
  firstName: "Jane",
  lastName: "Doe",
  phone: "+1 (555) 123-4567",
  dateOfBirth: moment("1990-05-15").format("DD MMM, YYYY"),
  email: "jane.doe@example.com",
  countryOfBirth: "United States",
  nationality: "American",
  countryOfResidence: "Canada",
  ethnicity: "Hispanic",
  gender: "Female",
  postalAddressLine1: "123 Main St",
  postalAddressLine2: "Apt 4B",
  postalCity: "New York",
  postalCountry: "USA",
  postalPostCode: "10001",
  residentialAddressLine1: "456 Oak Ave",
  residentialAddressLine2: "",
  residentialCity: "Toronto",
  residentialCountry: "Canada",
  residentialPostCode: "M5V 3L9",
  emergencyAddress: "789 Pine Rd, Vancouver, CA",
  emergencyContactNumber: "+1 (555) 987-6543",
  emergencyEmail: "emergency.contact@example.com",
  emergencyFullName: "John Smith",
  emergencyRelationship: "Brother",
  admin: "Watney College",
  adminEmail: "info@watneycollege.co.uk",
  applicationLocation: "Online Portal",
  courseName: "Exam Preparation Courses",
  intake: "September 2025",
  applicationStatus: "applied",
  applicationDate: "2025-05-15",
  'signature id="1"': "/demosign.png", // 👈 will be rendered as an Image
  'courseCode="1"': "Computer Science",
  todayDate: moment().format("DD MMM, YYYY"),
  studentId:'WC250603001'
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
    justifyContent: "flex-start",
  },
  logo: {
    width: 50,
    height: 50,
    marginLeft: 20,
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
    marginBottom: 6,
  },
  signature: {
    width: 120,
    height: 60,
    marginVertical: 10,
    objectFit: "contain",
  },
})

// Function to render body text with placeholders
const renderBody = (body: string) => {
  const lines = body.split("\n")

  return lines.map((line, i) => {
    const placeholderRegex = /\[([^\]]+)\]/g
    const parts: (string | JSX.Element)[] = []
    let lastIndex = 0
    let match

    while ((match = placeholderRegex.exec(line)) !== null) {
      const key = match[1]
      const value = MOCK_DATA[key]

      // Add text before placeholder
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index))
      }

      if (value) {
        if (key.startsWith("signature")) {
          // 👇 Render Image for signatures
          parts.push(<Image key={`${i}-${key}`} src={value} style={styles.signature} />)
        } else if (value.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
          // 👇 Render Image if placeholder points to any image file
          parts.push(<Image key={`${i}-${key}`} src={value} style={styles.signature} />)
        } else {
          // 👇 Render text replacement
          parts.push(
            <Text key={`${i}-${key}`} style={styles.body}>
              {value}
            </Text>
          )
        }
      }

      lastIndex = match.index + match[0].length
    }

    // Add remaining text after last placeholder
    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex))
    }

    return (
      <Text key={i} style={styles.body}>
        {parts}
      </Text>
    )
  })
}

// PDF Document component
const EmailPDF = ({ subject, body }: { subject: string; body: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Logo Top Left */}
      <View style={styles.logoContainer}>
        <Image src="/logo.png" style={styles.logo} />
      </View>

      <View style={styles.section}>
        {/* <Text style={styles.subject}>Subject: {subject}</Text> */}
        {renderBody(body)}
      </View>
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
