import { SideNav } from '@/components/shared/side-nav';
import AutoLogout from '../shared/auto-logout';
import { Toaster } from '@/components/ui/toaster';
import { useSelector } from 'react-redux';
import VerifyPage from '@/pages/auth/verify';

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { user } = useSelector((state: any) => state.auth);

  if (user && user.isValided === false) {
    return <VerifyPage user={user} />;
  }

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-gray-50">
      <AutoLogout inactivityLimit={5 * 60 * 60 * 1000} />

      <SideNav />

    
      <div className="flex min-w-0 flex-1 flex-col pt-14 lg:pt-0 lg:pl-56">
        <main className="h-full w-full overflow-y-auto overflow-x-hidden p-2">
        
            {children}
 
        </main>
      </div>

      <Toaster />
    </div>
  );
}