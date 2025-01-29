import { useEffect, useState } from 'react';
import { Pen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { EmailConfigDialog } from './components/email-config-dialog';
import { useToast } from '@/components/ui/use-toast';
import axiosInstance from '../../lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';

export default function EmailConfigPage() {
  const [emailConfigs, setEmailConfigs] = useState<any>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmailConfig, setEditingEmailConfig] = useState<any>();
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/email-configs`);
      setEmailConfigs(response.data.data.result);
    } catch (error) {
      console.error('Error fetching email configurations:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    if (editingEmailConfig) {
      await axiosInstance.put(`/email-configs/${editingEmailConfig?.id}`, data);
      toast({
        title: 'Email configuration updated successfully',
        className: 'bg-supperagent border-none text-white'
      });
      fetchData();
      setEditingEmailConfig(undefined);
    } else {
      await axiosInstance.post(`/email-configs`, data);
      toast({
        title: 'Email configuration created successfully',
        className: 'bg-supperagent border-none text-white'
      });
      fetchData();
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const updatedStatus = status ? '1' : '0';
      await axiosInstance.patch(`/email-configs/${id}`, {
        status: updatedStatus
      });
      toast({
        title: 'Email configuration updated successfully',
        className: 'bg-supperagent border-none text-white'
      });
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleEdit = (emailConfig) => {
    setEditingEmailConfig(emailConfig);
    setDialogOpen(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">All Email Configurations</h1>
        <Button
          className="bg-supperagent text-white hover:bg-supperagent/90"
          size={'sm'}
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Email Configuration
        </Button>
      </div>
      <div className="rounded-md bg-white p-4 shadow-2xl">
        {initialLoading ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-supperagent" />
          </div>
        ) : emailConfigs.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No records found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Port</TableHead>
                <TableHead>Encryption</TableHead>
                <TableHead>Authentication</TableHead>

                <TableHead className="w-32 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emailConfigs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell>{config.email}</TableCell>
                  <TableCell>{config.host}</TableCell>
                  <TableCell>{config.port}</TableCell>
                  <TableCell>{config.encryption}</TableCell>
                  <TableCell>
                    {config.authentication ? 'True' : 'False'}
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-supperagent text-white hover:bg-supperagent/90"
                      onClick={() => handleEdit(config)}
                    >
                      <Pen className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <EmailConfigDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingEmailConfig(undefined);
        }}
        onSubmit={handleSubmit}
        initialData={editingEmailConfig}
      />
    </div>
  );
}
