import { useEffect, useState } from "react";
import { Pencil, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NewRefusalDialog } from "./new-refusal-dialog";
import type { RefusalHistory } from "@/types/index";
import moment from "moment";
import { Switch } from "@/components/ui/switch";

export function RefusalHistory({ student, onSave }) {
  const [visaNeed, setVisaNeed] = useState(student.visaNeed);
  const [hasRefusal, setHasRefusal] = useState(student.refusedPermission);
  const [refusalHistory, setRefusalHistory] = useState<RefusalHistory[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRefusal, setEditingRefusal] = useState<any>(null);

  const handleEditRefusal = (history) => {
    setEditingRefusal(history);
    setDialogOpen(true);
  };

  const handleAddRefusal = async (data) => {
    if (editingRefusal) {
      const updatedHistory = { ...data, id: editingRefusal.id };
      onSave({ refuseHistory: [updatedHistory] });
      setEditingRefusal(null);
    } else {
      onSave({ refuseHistory: [data] });
    }
  };

  useEffect(() => {
    if (Array.isArray(student.refuseHistory)) {
      setRefusalHistory(student.refuseHistory);
    }
  }, [student.refuseHistory]);

  const handlevisaNeed = (applied) => {
    if(student.visaNeed !== applied){
    setVisaNeed(applied);
    onSave({ visaNeed: applied });
  }
  };

  const handleRefusedPermission = (applied) => {
    if(student.refusedPermission !== applied){
      setHasRefusal(applied);
      onSave({refusedPermission: applied});
    }
  }

  const handleStatusChange = (id, currentStatus) => {
    // Toggle the status
    const newStatus = currentStatus === 1 ? 0 : 1;
    // Persist the change using onSave
    const updatedContact = refusalHistory.find(contact => contact.id === id);
    if (updatedContact) {
      const updatedContactWithStatus = { ...updatedContact, status: newStatus };
      onSave({ refuseHistory: [updatedContactWithStatus] });
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4 p-4 shadow-md rounded-md">
        <h2 className="text-lg font-semibold">Immigration History</h2>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <p>Does this student need a visa to stay in the UK?</p>
            <div className="flex gap-2">
              <Button
                onClick={() => handlevisaNeed(true)}
                className={visaNeed ? "bg-supperagent text-white hover:bg-supperagent/90" : "bg-white"}
              >
                Yes
              </Button>
              <Button
                onClick={() => handlevisaNeed(false)}
                className={!visaNeed ? "bg-supperagent text-white hover:bg-supperagent/90" : "bg-white"}
              >
                No
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <p>For the UK or any other country, has this student ever been refused a visa, refused permission to stay or remain, refused asylum, or deported?</p>
            <div className="flex gap-2">
              <Button
                className={hasRefusal ? "bg-supperagent text-white hover:bg-supperagent/90" : "bg-white"}
                onClick={() => handleRefusedPermission(true)}
              >
                Yes
              </Button>
              <Button
                onClick={() => handleRefusedPermission(false)}
                className={!hasRefusal ? "bg-supperagent text-white hover:bg-supperagent/90" : "bg-white"}
              >
                No
              </Button>
            </div>
          </div>

          {hasRefusal && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Please provide details of any visa refusals or immigration issues.
                </p>
                <Button
                  onClick={() => setDialogOpen(true)}
                  className={"bg-supperagent text-white hover:bg-supperagent/90"}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Refuse History
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    
                    <TableHead>Refusal Type</TableHead>
                    <TableHead>Refusal Date</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Visa Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {refusalHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        No matching records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    refusalHistory.map((history) => (
                      <TableRow key={history.id}>
                        
                        <TableCell>{history.refusalType}</TableCell>
                        <TableCell>{moment(history.refusalDate).format('DD-MM-YYYY')}</TableCell>
                        <TableCell>{history.details}</TableCell>
                        <TableCell>{history.country}</TableCell>
                        <TableCell>{history.visaType}</TableCell>
                        <TableCell>
                        <Switch
                            checked={parseInt(history.status) === 1}
                            onCheckedChange={(checked) => handleStatusChange(history.id, checked ? 0 : 1)}
                            className="mx-auto"
                          />

                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditRefusal(history)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <NewRefusalDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingRefusal(null);
        }}
        onSubmit={handleAddRefusal}
        initialData={editingRefusal}
      />
    </div>
  );
}
