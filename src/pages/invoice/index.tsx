"use client"

import { useEffect, useState } from "react"
import axiosInstance from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Link, useNavigate } from "react-router-dom"
import moment from "moment"
import { pdf } from "@react-pdf/renderer"
import InvoicePDF from "./pdf"

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const navigate = useNavigate()
  
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axiosInstance.get("/invoice")
        setInvoices(response.data?.data?.result)
      } catch (error) {
        console.error("Error fetching invoices:", error)
      }
    }

    fetchInvoices()
  }, [])

  const handleEdit = (invoiceId: string) => {
    navigate(`/admin/invoice/students/${invoiceId}`) 
  }

  const handleDownload = async (invoiceId: string) => {
    try {
      const response = await axiosInstance.get(`/invoice/${invoiceId}`)
      const invoiceData = response.data?.data

      const pdfDoc = <InvoicePDF invoice={invoiceData} />
      const blob = await pdf(pdfDoc).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `invoice_${invoiceData.reference}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating PDF:", error)
    }
  }

  return (
    <div className="mx-auto py-1">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-6">Invoices</h1>
        <Link to="students">
          <Button className="bg-supperagent text-white hover:bg-supperagent">Create Invoice</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Generated Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Remit To</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Students</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <TableRow key={invoice._id}>
                    <TableCell>{moment(invoice.date).format("DD MMM YYYY")}</TableCell>
                    <TableCell>{invoice.reference}</TableCell>
                    <TableCell>{invoice.remitTo?.name}</TableCell>
                    <TableCell>{invoice.totalAmount} GBP</TableCell>
                    <TableCell>{invoice.noOfStudents}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2 justify-end">
                        <Button size="sm" onClick={() => handleEdit(invoice._id)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDownload(invoice._id)}>
                          Download
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No invoices found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

