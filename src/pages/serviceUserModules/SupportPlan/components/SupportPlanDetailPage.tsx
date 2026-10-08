import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MoveLeft } from "lucide-react";

export default function SupportPlanDetailPage() {
  const { id } = useParams();

  // Initial plan data
  const initialData = {
    title: "Behaviour",
    user: "Ainna Begum Khan Zadran",
    dob: "3rd July 1971",
    age: 54,
    status: "Active",
    strengths: "",
    needs: "",
    risks: "",
    documents: "",
    nextReview: "No date set",
  };

  const [isEditing, setIsEditing] = useState(false);
  const [planData, setPlanData] = useState(initialData);

  const handleEdit = () => setIsEditing(true);

  const handleSave = () => {
    // Here you might call an API to save changes
    console.log("Saving updated plan:", planData);
    setIsEditing(false);
    // Optionally show a toast/success message
  };

  const handleChange = (field, value) => {
    setPlanData((prev) => ({ ...prev, [field]: value }));
  };
const navigate = useNavigate()
  return (
    <div className="space-y-6 ">
      {/* Header with Action Buttons */}
      <div className="flex justify-between items-center">
  {/* Back Button + Title */}
  <div className="flex items-center gap-3">
    <Button
      variant="outline"
      
      onClick={() => navigate(-1)} // Goes back to previous page
      className="flex items-center gap-2 bg-watney hover:bg-watney/90 text-white"
    >
      <MoveLeft className="w-4 h-4"/>
      back
    </Button>
    {isEditing ? (
      <Input
        value={planData.title}
        onChange={(e) => handleChange("title", e.target.value)}
        className="text-xl font-bold max-w-xs"
      />
    ) : (
      <h1 className="text-xl font-bold">{planData.title}</h1>
    )}
  </div>

  {/* Action Buttons */}
  <div className="flex gap-2">
    <Button variant="outline" size="sm">
      History
    </Button>
    <Button variant="outline" size="sm">
      Download PDF
    </Button>
    {!isEditing && (
      <Button
        size="sm"
        onClick={handleEdit}
        className="bg-watney hover:bg-watney/90 text-white"
      >
        Review Support Plan
      </Button>
    )}
    {isEditing && (
      <Button
        size="sm"
        onClick={handleSave}
        className="bg-watney hover:bg-watney/90 text-white"
      >
        Save Changes
      </Button>
    )}
  </div>
</div>
      {/* Last Review */}
      <Card>
        <CardHeader>
          <CardTitle>Last Review</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No reviews yet</p>
        </CardContent>
      </Card>

      {/* Desired Outcomes */}
      <Card>
        <CardHeader>
          <CardTitle>Desired Outcomes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src="/placeholder.svg" alt="User" />
              <AvatarFallback>{planData.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{planData.user}</p>
              <p className="text-sm text-muted-foreground">
                {planData.dob} ({planData.age}) • {planData.status}
              </p>
            </div>
            <span className="ml-auto bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">DNACPR</span>
          </div>
        </CardContent>
      </Card>

      {/* Editable Fields */}
      {["Strengths", "Needs", "Risks", "Documents"].map((field) => (
        <Card key={field}>
          <CardHeader>
            <CardTitle>{field}</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={planData[field.toLowerCase()]}
                onChange={(e) => handleChange(field.toLowerCase(), e.target.value)}
                placeholder={`Enter ${field.toLowerCase()}...`}
                className="min-h-24"
              />
            ) : (
              <p className="text-muted-foreground">
                {planData[field.toLowerCase()] || `None added yet.`}
              </p>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Next Review */}
      <Card>
        <CardHeader>
          <CardTitle>Next Review</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Input
              type="date"
              value={
                planData.nextReview && planData.nextReview !== "No date set"
                  ? planData.nextReview.split('.').reverse().join('-') // Convert DD-MM-YYYY → YYYY-MM-DD
                  : ""
              }
              onChange={(e) => {
                const date = e.target.value;
                const formatted = date ? new Date(date).toLocaleDateString('en-GB') : "No date set";
                handleChange("nextReview", formatted);
              }}
            />
          ) : (
            <p className="text-muted-foreground">{planData.nextReview}</p>
          )}
        </CardContent>
      </Card>

      {/* Signatures */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Signatures</h2>
        <div className="flex justify-end">
          <Button disabled={!isEditing} className={isEditing ? "" : "opacity-50"}>
            Sign Support Plan
          </Button>
        </div>
      </div>
    </div>
  );
}