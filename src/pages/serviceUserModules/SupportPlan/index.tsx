import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon, EditIcon, ChevronRightIcon, MoveLeft } from "lucide-react";

// Mock Data: Initial Support Plans
const initialPlans = [
  {
    id: "behaviour",
    title: "Behaviour",
    created: "29-04-2025",
    time: "17:37",
    createdBy: "Yasmin Calasow",
    reviewed: "27-06-2025",
    reviewer: "Kishour Zadid",
    dueDate: "27-09-2025",
    status: "active",
  },
  {
    id: "choice-communication",
    title: "Choice & Communication",
    created: "29-04-2025",
    time: "17:37",
    createdBy: "Yasmin Calasow",
    reviewed: "27-06-2025",
    reviewer: "Kishour Zadid",
    dueDate: "27-09-2025",
    status: "active",
  },
  {
    id: "community-learning",
    title: "Community, Learning & Leisure",
    created: "29-04-2025",
    time: "17:37",
    createdBy: "Yasmin Calasow",
    status: "active",
  },
  {
    id: "continence",
    title: "Continence",
    created: "29-04-2025",
    time: "17:37",
    createdBy: "Yasmin Calasow",
    status: "active",
  },
  {
    id: "daily-routine",
    title: "Daily Routine",
    created: "29-04-2025",
    time: "17:37",
    createdBy: "Yasmin Calasow",
    status: "active",
  },
  {
    id: "health-medication",
    title: "Health & Medication",
    created: "29-04-2025",
    time: "17:37",
    createdBy: "Yasmin Calasow",
    status: "active",
  },
  {
    id: "living-safely",
    title: "Living Safely & Taking Risks",
    created: "29-04-2025",
    time: "17:37",
    createdBy: "Yasmin Calasow",
    status: "active",
  },
  {
    id: "personal-care",
    title: "Personal Care",
    created: "29-04-2025",
    time: "17:37",
    createdBy: "Yasmin Calasow",
    status: "active",
  },
  {
    id: "skin",
    title: "Skin",
    created: "29-04-2025",
    time: "17:37",
    createdBy: "Yasmin Calasow",
    status: "active",
  },
];

export default function SupportPlanPage() {
  const [plans, setPlans] = useState(initialPlans);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState("");
  const navigate = useNavigate();

  // Handle adding a new plan
  const handleAddPlan = () => {
    if (!newPlanTitle.trim()) return;

    const newPlan = {
      id: newPlanTitle.toLowerCase().replace(/\s+/g, "-"),
      title: newPlanTitle,
      created: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdBy: "Yasmin Calasow",
      status: "active",
    };

    setPlans((prev) => [...prev, newPlan]);
    setNewPlanTitle("");
    setIsDialogOpen(false);
  };

  

  
  const handleViewPlan = (planId) => {
    navigate(`${planId}`);
  };

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Ainna Begum Khan Zadran's Support Plan</h1>
          <div className="flex gap-3">
            <Button variant="default" onClick={() => window.history.back()}>
              <MoveLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className=" text-white ">
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Support Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Support Plan</DialogTitle>
                <DialogDescription>
                  Enter the title for the new support plan.
                </DialogDescription>
              </DialogHeader>
              <Input
                placeholder="Enter plan title"
                value={newPlanTitle}
                onChange={(e) => setNewPlanTitle(e.target.value)}
                className="mb-4"
              />
              <DialogFooter>
                <Button onClick={handleAddPlan}>Create Plan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      
      {/* List of Plans */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Plan</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead className="hidden md:table-cell">Reviewed</TableHead>
                <TableHead className="hidden md:table-cell">Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow
                  key={plan.id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleViewPlan(plan.id)}
                >
                  <TableCell className="pl-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                        {plan.title[0]}
                      </div>
                      <div>
                        <div className="font-medium">{plan.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {plan.created} • {plan.time} • {plan.createdBy}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {plan.reviewed ? `${plan.reviewed} • ${plan.reviewer}` : "No review yet"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {plan.dueDate && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{plan.dueDate}</span>
                        <span className="text-green-500 text-xs">✓</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {plan.dueDate ? plan.dueDate : "No date set"}
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