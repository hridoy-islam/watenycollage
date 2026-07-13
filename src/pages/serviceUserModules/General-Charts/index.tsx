import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // 🔁 Changed: from react-router-dom
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { Search, MoveLeft } from "lucide-react";

// Sample chart data
const chartData = [
  {
    id: "activities-social",
    name: "Activities & Social",
    category: "Lifestyle",
    lastUpdated: "2024-08-15",
    status: "active",
  },
  { id: "behaviour", name: "Behaviour", category: "Mental Health", lastUpdated: "2024-08-14", status: "active" },
  { id: "blood-glucose", name: "Blood Glucose", category: "Vitals", lastUpdated: "2024-08-15", status: "active" },
  { id: "blood-oxygen", name: "Blood Oxygen", category: "Vitals", lastUpdated: "2024-08-15", status: "active" },
  { id: "blood-pressure", name: "Blood Pressure", category: "Vitals", lastUpdated: "2024-08-14", status: "active" },
  { id: "body-maps", name: "Body Maps", category: "Physical", lastUpdated: "2024-08-13", status: "inactive" },
  { id: "fluids", name: "Fluids", category: "Nutrition", lastUpdated: "2024-08-15", status: "active" },
  { id: "food", name: "Food", category: "Nutrition", lastUpdated: "2024-08-15", status: "active" },
  { id: "health-visit", name: "Health Visit", category: "Medical", lastUpdated: "2024-08-12", status: "active" },
  { id: "heart-rate", name: "Heart Rate", category: "Vitals", lastUpdated: "2024-08-15", status: "active" },
  { id: "incident", name: "Incident", category: "Safety", lastUpdated: "2024-08-11", status: "inactive" },
  { id: "must", name: "MUST", category: "Assessment", lastUpdated: "2024-08-14", status: "active" },
  { id: "mobility", name: "Mobility", category: "Physical", lastUpdated: "2024-08-15", status: "active" },
  { id: "mood", name: "Mood", category: "Mental Health", lastUpdated: "2024-08-15", status: "active" },
  { id: "painchek", name: "PainChek", category: "Assessment", lastUpdated: "2024-08-14", status: "active" },
  { id: "re-positioning", name: "Re-positioning", category: "Care", lastUpdated: "2024-08-13", status: "active" },
  { id: "respiratory-rate", name: "Respiratory Rate", category: "Vitals", lastUpdated: "2024-08-15", status: "active" },
  { id: "seizure", name: "Seizure", category: "Medical", lastUpdated: "2024-08-10", status: "inactive" },
  { id: "stool", name: "Stool", category: "Physical", lastUpdated: "2024-08-14", status: "active" },
  { id: "temperature", name: "Temperature", category: "Vitals", lastUpdated: "2024-08-15", status: "active" },
  { id: "wash", name: "Wash", category: "Care", lastUpdated: "2024-08-15", status: "active" },
  { id: "waterlow", name: "Waterlow", category: "Assessment", lastUpdated: "2024-08-13", status: "active" },
  { id: "weight", name: "Weight", category: "Physical", lastUpdated: "2024-08-15", status: "active" },
];

export default function GeneralCharts() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCharts = chartData.filter(
    (chart) =>
      chart.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chart.category.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const navigate = useNavigate()
  return (
    <div className="">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold mb-2">Ridoy's General Charts</h1>
          <Button variant="default" onClick={() => window.history.back()}>
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <p className="text-muted-foreground mb-6">
          Service User charts are populated by logs made via the Carer App.{" "}
         
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search charts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Charts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Available Charts</CardTitle>
          <CardDescription>Click on any chart to view detailed data and logs</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chart Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCharts.map((chart) => (
                <TableRow
                  key={chart.id}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => navigate(`/admin/people-planner/charts/general-charts/${chart.id}`)} // Optional: handle row click
                >
                  <TableCell>
                    <Link
                      to={`${chart.id}`} // 🔁 Changed: use `to` instead of `href`
                      className="font-medium  hover:underline"
                    >
                      {chart.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-theme text-white hover:bg-theme/90">{chart.category}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{chart.lastUpdated}</TableCell>
                  <TableCell>
                    <Badge variant="default">
                      {chart.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}