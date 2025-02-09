import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Link } from "react-router-dom"

const demoInvoices = [
  { id: "INV001", date: "2023-05-01", amount: 300, studentCount: 3 },
  { id: "INV002", date: "2023-05-15", amount: 500, studentCount: 5 },
  { id: "INV003", date: "2023-06-01", amount: 200, studentCount: 2 },
]

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState(demoInvoices)

  const handleEdit = (invoiceId: string) => {
    console.log(invoiceId)
  }

  const handleDownload = (invoiceId: string) => {
    console.log(`Downloading invoice ${invoiceId}`)
    // In a real application, you would trigger the download here
  }

  return (
    <div className="mx-auto py-1">
      <div className="flex justify-between">
      <h1 className="text-2xl font-bold mb-6">Invoices</h1>
      <Link to='students'><Button className="bg-supperagent text-white hover:bg-supperagent">Students</Button></Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Generated Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.id}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.amount} GBP</TableCell>
                  <TableCell>{invoice.studentCount}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => handleEdit(invoice.id)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDownload(invoice.id)}>
                        Download
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

