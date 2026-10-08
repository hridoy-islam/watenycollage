import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { KeyRound, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';

const SettingTab = () => {
  const { sid } = useParams();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isValid = password.length >= 6;

  const handleResetPassword = async () => {
    if (!isValid || !sid) return;
    setLoading(true);
    setMessage(null);
    try {
      await axiosInstance.patch(`/users/${sid}`, { password });
      setMessage({ type: 'success', text: 'Password reset successfully.' });
      setPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to reset password.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setPassword('');
    setMessage(null);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 border-b border-gray-200 pb-3 text-lg font-semibold text-gray-900">
          Settings
        </h3>

        <Button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-watney hover:bg-watney/90"
        >
          <KeyRound className="h-4 w-4" />
          Reset Password
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Set a new password for this user. Minimum 6 characters.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="h-12 pr-10"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && password.length < 6 && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  Minimum 6 characters required
                </p>
              )}

              {message && (
                <div
                  className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
                    message.type === 'success'
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-red-200 bg-red-50 text-red-700'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {message.text}
                </div>
              )}
            </div>

            <DialogFooter className="sm:justify-between">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleResetPassword}
                disabled={!isValid || loading}
                className="flex items-center gap-2 bg-watney hover:bg-watney/90"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                Reset Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SettingTab;
