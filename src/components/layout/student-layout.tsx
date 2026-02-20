import { SideNav } from '@/components/shared/side-nav';
import AutoLogout from '../shared/auto-logout';
import { Toaster } from '@/components/ui/toaster';
import { useSelector } from 'react-redux';
import VerifyPage from '@/pages/auth/verify';
import { TopNav } from '../shared/top-nav';

export default function StudentLayout({
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
      <AutoLogout inactivityLimit={5*60 * 60 * 1000} />
      <TopNav />
      {/* <SideNav /> */}

      <main className="mx-auto px-4 py-8 ">{children}</main>
      <Toaster />
    </div>
  );
}
