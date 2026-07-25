import React from "react"
import { Page, Text, View, Document, StyleSheet, Link } from "@react-pdf/renderer"
import moment from "moment"

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
    lineHeight: 1.2,
  },
  topHeader: {
    fontWeight: "bold",
    fontSize: 11,
    color: "#000000",
    marginBottom: 8,
  },
  topDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    marginBottom: 16,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  headerLabel: {
    width: 70,
    fontWeight: "bold",
    color: "#4b5563",
  },
  headerValue: {
    flex: 1,
    color: "#111827",
  },
  bodyContainer: {
    marginTop: 10,
  },
  paragraph: {
    marginBottom: 10,
    textAlign: "left",
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 6,
    paddingLeft: 10,
  },
  bulletPoint: {
    fontSize: 10,
    marginRight: 8, // Added margin right for the bullet point
    color: "#1a1a1a",
  },
  bulletContent: {
    flex: 1,
  },
  link: {
    color: "#2563eb", // Blue color
    textDecoration: "underline",
  },
  footerText: {
    marginTop: 24,
    fontSize: 8,
    color: "#6b7280",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
})

interface PDFProps {
  fromEmail?: string
  toEmail?: string
  sentDate?: string
  subject?: string
  bodyText: string
}

export function EmailPDF({
  fromEmail = "admin@everycareromford.co.uk",
  toEmail = "",
  sentDate,
  subject = "",
  bodyText = "",
}: PDFProps) {
  const lines = bodyText
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0)

  // Helper to parse links inside string fragments
  const renderFormattedText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g
    const parts = text.split(urlRegex)

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        const href = part.startsWith("http") ? part : `https://${part}`
        return (
          <Link key={index} src={href} style={styles.link}>
            {part}
          </Link>
        )
      }
      return <Text key={index}>{part}</Text>
    })
  }

  // Helper to detect bullet points and render them with margin
  const renderLine = (line: string, index: number) => {
    // Regex matches common bullet characters: •, -, *, or numbered lists like "1."
    const bulletRegex = /^([•\-*]|(\d+\.))\s+(.*)/
    const match = line.match(bulletRegex)

    if (match) {
      const bulletSymbol = match[1]
      const content = match[3]

      return (
        <View key={index} style={styles.bulletRow}>
          <Text style={styles.bulletPoint}>{bulletSymbol}</Text>
          <Text style={styles.bulletContent}>{renderFormattedText(content)}</Text>
        </View>
      )
    }

    return (
      <Text key={index} style={styles.paragraph}>
        {renderFormattedText(line)}
      </Text>
    )
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Very top email title */}
        <Text style={styles.topHeader}>{fromEmail}</Text>

        {/* Top border line */}
        <View style={styles.topDivider} />

        {/* Header Metadata Container */}
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.headerLabel}>From:</Text>
            <Text style={styles.headerValue}>{fromEmail}</Text>
          </View>
          <View style={styles.headerRow}>
            <Text style={styles.headerLabel}>Sent:</Text>
            <Text style={styles.headerValue}>
              {sentDate
                ? moment(sentDate).format("DD MMMM YYYY HH:mm")
                : moment().format("DD MMMM YYYY HH:mm")}
            </Text>
          </View>
          <View style={styles.headerRow}>
            <Text style={styles.headerLabel}>To:</Text>
            <Text style={styles.headerValue}>{toEmail || "—"}</Text>
          </View>
          <View style={styles.headerRow}>
            <Text style={styles.headerLabel}>Subject:</Text>
            <Text style={styles.headerValue}>{subject || "—"}</Text>
          </View>
        </View>

        {/* Body Paragraphs & Bullet Points */}
        <View style={styles.bodyContainer}>
          {lines.map((line, index) => renderLine(line, index))}
        </View>

        {/* Footer Text */}
        <View style={styles.footerText}>
          <Text>
            This email and its attachments may be confidential and are intended solely for the use of the individual to
            whom it is addressed. Any views or opinions expressed are solely those of the author and do not necessarily
            represent those of Everycare. Access, disclosure, copying, distribution, or reliance on any of it by anyone
            outside the intended recipient organisation is prohibited.
          </Text>
        </View>
      </Page>
    </Document>
  )
}