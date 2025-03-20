import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import moment from "moment";

// Define styles to match the image exactly
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Helvetica",
  },
  logo: {
    width: 150,
    height: 60,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 11,
    color: "#00a185",
    fontWeight: "bold",
    marginBottom: 5,
  },
  twoColumnContainer: {
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 20,
  },
  leftColumn: {
    width: "50%",
  },
  rightColumn: {
    width: "50%",
    alignItems: "flex-end",
  },
  label: {
    fontSize: 11,
    fontWeight: "bold",
  },
  value: {
    fontSize: 11,
    marginBottom: 3,
  },
  addressValue: {
    fontSize: 11,
    width: "70%",
  },
  table: {
    display: "table",
    width: "100%",
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#00a185",
  },
  tableHeaderCell: {
    padding: 5,
    fontSize: 10,
    fontWeight: "bold",
    color: "white",
    textAlign: "left",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    borderBottomStyle: "solid",
  },
  tableCell: {
    padding: 5,
    fontSize: 9,
  },
  slColumn: {
    width: "5%",
  },
  referenceColumn: {
    width: "15%",
  },
  nameColumn: {
    width: "60%",
  },
  amountColumn: {
    width: "20%",
  },
  courseDetails: {
    fontSize: 8,
    color: "#555555",
    marginTop: 2,
  },
  totalRow: {
    flexDirection: "row",
    backgroundColor: "#00a185",
  },
  totalLabel: {
    width: "80%",
    padding: 5,
    fontSize: 10,
    fontWeight: "bold",
    color: "white",
    textAlign: "right",
  },
  totalValue: {
    width: "20%",
    padding: 5,
    fontSize: 10,
    fontWeight: "bold",
    color: "white",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  infoLabel: {
    width: "30%",
    fontSize: 11,
    fontWeight: "bold",
  },
  infoValue: {
    width: "70%",
    fontSize: 11,
  },
  rightInfoRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 3,
  },
  rightInfoLabel: {
    width: "40%",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "right",
    paddingRight: 10,
  },
  rightInfoValue: {
    width: "30%",
    fontSize: 11,
    textAlign: "right",
  },
});

// InvoicePDF component
const InvoicePDF = ({ invoice = {} }) => {
  // Provide default values for invoice and its nested properties
  const {
    remitTo = { name: "", email: "", address: "" },
    paymentInfo = { sortCode: "", accountNo: "", beneficiary: "" },
    reference = "",
    date = new Date(),
    semester = "",
    noOfStudents = 0,
    students = [], // Default to an empty array
    totalAmount = 0,
  } = invoice;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* College Logo */}
        <Image 
          src="https://cdn.logo.com/hotlink-ok/logo-social.png" 
          style={styles.logo} 
        />

        {/* Two Column Layout for REMIT TO and REMIT REPORT */}
        <View style={styles.twoColumnContainer}>
          {/* Left Column - REMIT TO */}
          <View style={styles.leftColumn}>
            <Text style={styles.sectionTitle}>REMIT TO</Text>
            <Text style={styles.label}>{remitTo.name}</Text>
            <Text style={styles.value}>{remitTo.email}</Text>
            <Text style={styles.addressValue}>Address{remitTo.address}</Text>
          </View>

          {/* Right Column - REMIT REPORT */}
          <View style={styles.rightColumn}>
            <Text style={styles.sectionTitle}>REMIT REPORT</Text>
            <View style={styles.rightInfoRow}>
              <Text style={styles.rightInfoLabel}>Reference</Text>
              <Text style={styles.rightInfoValue}>#{reference}</Text>
            </View>
            <View style={styles.rightInfoRow}>
              <Text style={styles.rightInfoLabel}>Date</Text>
              <Text style={styles.rightInfoValue}>{moment(date).format("Do MMM, YYYY")}</Text>
            </View>
            <View style={styles.rightInfoRow}>
              <Text style={styles.rightInfoLabel}>Semester</Text>
              <Text style={styles.rightInfoValue}>{semester}</Text>
            </View>
            <View style={styles.rightInfoRow}>
              <Text style={styles.rightInfoLabel}>No of Student</Text>
              <Text style={styles.rightInfoValue}>{noOfStudents}</Text>
            </View>
          </View>
        </View>

        {/* Payment Information Section */}
        <View>
          <Text style={styles.sectionTitle}>PAYMENT INFORMATION</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sort Code</Text>
            <Text style={styles.infoValue}>{paymentInfo.sortCode}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account No</Text>
            <Text style={styles.infoValue}>{paymentInfo.accountNo}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Beneficiary</Text>
            <Text style={styles.infoValue}>{paymentInfo.beneficiary}</Text>
          </View>
        </View>

        {/* Students Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <View style={[styles.tableHeaderCell, styles.slColumn]}>
              <Text>SL</Text>
            </View>
            <View style={[styles.tableHeaderCell, styles.referenceColumn]}>
              <Text>REFERENCE</Text>
            </View>
            <View style={[styles.tableHeaderCell, styles.nameColumn]}>
              <Text>NAME</Text>
            </View>
            <View style={[styles.tableHeaderCell, styles.amountColumn]}>
              <Text>AMOUNT</Text>
            </View>
          </View>

          {/* Table Rows */}
          {students.map((student, index) => (
            <View style={styles.tableRow} key={student.reference || index}>
              <View style={[styles.tableCell, styles.slColumn]}>
                <Text>{index + 1}</Text>
              </View>
              <View style={[styles.tableCell, styles.referenceColumn]}>
                <Text>{student.reference}</Text>
                <Text>{student.collegeId}</Text>
              </View>
              <View style={[styles.tableCell, styles.nameColumn]}>
                <Text>{student.title} {student.name}</Text>
                <Text style={styles.courseDetails}>{student.course}</Text>
              </View>
              <View style={[styles.tableCell, styles.amountColumn]}>
                <Text>£{student.amount?.toFixed(2)}</Text>
              </View>
            </View>
          ))}

          {/* Total Row */}
          <View style={styles.totalRow}>
            <View style={styles.totalLabel}>
              <Text>TOTAL</Text>
            </View>
            <View style={styles.totalValue}>
              <Text>£{totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
