import { TopNav } from '@/components/shared/top-nav';
import { DashboardTopNav } from '@/components/shared/dashboard-top-nav';
import { usePathname } from '@/routes/hooks';
import AutoLogout from '../shared/auto-logout';
import { Toaster } from '@/components/ui/toaster';
import { useSelector } from 'react-redux';
import VerifyPage from '@/pages/auth/verify';

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboardRoot = pathname === '/dashboard';
  const { user } = useSelector((state: any) => state.auth);
  const useTopNav = isDashboardRoot || user?.role === 'applicant';

  if (user && user.isValided === false) {
    return <VerifyPage user={user} />;
  }

  if (useTopNav) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AutoLogout inactivityLimit={30 * 60 * 1000} />
        <DashboardTopNav />
        <main className="mx-auto px-4 py-6">{children}</main>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AutoLogout inactivityLimit={30 * 60 * 1000} />
      <TopNav />

      <div className="lg:pl-64">
        <main className="mx-auto px-4 py-6 pt-16 lg:pt-6">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
