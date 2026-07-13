import { PeoplePlannerNav } from '@/components/shared/people-planner-nav';
import AutoLogout from '../shared/auto-logout';
import { Toaster } from '@/components/ui/toaster';
import { useSelector } from 'react-redux';
import VerifyPage from '@/pages/auth/verify';

export default function PeoplePlannerLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { user } = useSelector((state: any) => state.auth);
  if (user && user.isValided === false) {
    return <VerifyPage user={user} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AutoLogout inactivityLimit={30 * 60 * 1000} />
      <PeoplePlannerNav />

      <div className="lg:pl-64">
        <main className="mx-auto px-4 py-6 pt-16 lg:pt-6">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
