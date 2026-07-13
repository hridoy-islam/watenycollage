import { Link, useNavigate } from 'react-router-dom';
import { usePathname } from '@/routes/hooks';
import logo from '@/assets/imges/home/logo.png';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { logout } from '@/redux/features/authSlice';
import { LogOut, User } from 'lucide-react';
import { Button } from '../ui/button';

export function DashboardTopNav() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const isCompleted = user?.isCompleted;

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  return (
    <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      <div className="flex items-center gap-4">
        {isCompleted ? (
          <Link to="/dashboard">
            <img src={logo} className="w-16" />
          </Link>
        ) : (
          <img src={logo} className="w-16" />
        )}
      </div>

      <div className="flex items-center gap-4">
        <div
          className="flex cursor-pointer flex-col items-end"
          onClick={() => isCompleted && navigate('/dashboard/profile')}
        >
          <span className="text-sm font-semibold text-black">{user?.name}</span>
          <span className="text-xs text-gray-500">{user?.email}</span>
          <span className="font-semibold text-xs  hover:underline cursor-pointer">Profile</span>
        </div>
        <Button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-md bg-watney px-3 py-2 text-sm font-medium text-white hover:bg-watney/90"
        >
          <LogOut className="h-4 w-4" />
          <span className="max-md:hidden">Log out</span>
        </Button>
      </div>
    </div>
  );
}
