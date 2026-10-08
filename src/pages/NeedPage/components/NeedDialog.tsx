import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Select from 'react-select';
import axiosInstance from '@/lib/axios';

interface OptionType {
  value: string;
  label: string;
}

interface NeedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { NeedTitle: string; parentNeedId?: string }) => void;
  initialData?: any;
}

export function NeedDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData
}: NeedDialogProps) {
  const [needTitle, setNeedTitle] = useState('');
  const [parentNeedId, setParentNeedId] = useState<OptionType | null>(null);
  const [parentOptions, setParentOptions] = useState<OptionType[]>([]);

  useEffect(() => {
    if (open) {
      setNeedTitle(initialData?.NeedTitle || '');
      setParentNeedId(
        initialData?.parentNeedId
          ? { value: initialData.parentNeedId._id || initialData.parentNeedId, label: initialData.parentNeedId.NeedTitle || '' }
          : null
      );
    }
  }, [initialData, open]);

  useEffect(() => {
    if (!open) return;
    const fetchParents = async () => {
      try {
        const res = await axiosInstance.get('/needs', {
          params: { limit: 'all' }
        });
        const allNeeds = res.data.data.result || [];
        const parents = allNeeds.filter(
          (n: any) => !n.parentNeedId && n._id !== initialData?._id
        );
        setParentOptions(
          parents.map((n: any) => ({
            value: n._id,
            label: n.NeedTitle
          }))
        );
      } catch (error) {
        console.error('Failed to load parent needs:', error);
      }
    };
    fetchParents();
  }, [open, initialData?._id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      NeedTitle: needTitle,
      ...(parentNeedId ? { parentNeedId: parentNeedId.value } : {})
    });
    onOpenChange(false);
    setNeedTitle('');
    setParentNeedId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit' : 'Add'} Need
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="NeedTitle">
              Need Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="NeedTitle"
              value={needTitle}
              onChange={(e) => setNeedTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentNeedId">Parent Need</Label>
            <Select
              options={parentOptions}
              value={parentNeedId}
              onChange={(value) => setParentNeedId(value)}
              placeholder="Select parent need..."
              isClearable
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                control: (base, state) => ({
                  ...base,
                  borderRadius: '16px',
                  borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
                  boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
                  '&:hover': {
                    borderColor: state.isFocused ? '#3b82f6' : '#9ca3af'
                  },
                  minHeight: '40px',
                  paddingLeft: '4px'
                }),
                valueContainer: (base) => ({
                  ...base,
                  padding: '2px 8px'
                }),
                indicatorsContainer: (base) => ({
                  ...base,
                  paddingRight: '8px'
                }),
                menu: (base) => ({
                  ...base,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  zIndex: 9999
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected
                    ? '#3b82f6'
                    : state.isFocused
                      ? '#eff6ff'
                      : 'transparent',
                  color: state.isSelected ? 'white' : '#374151',
                  cursor: 'pointer'
                })
              }}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="border-none bg-watney text-white hover:bg-watney/90"
            >
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
