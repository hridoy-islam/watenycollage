import { Link, useNavigate } from 'react-router-dom';
import { UserNav } from './user-nav';
import logo from '@/assets/imges/home/logo.png';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { logout } from '@/redux/features/authSlice';
import { LogOut } from 'lucide-react';
import { Button } from '../ui/button';

export function TopNav() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };
  const { user } = useSelector((state: any) => state.auth);
  const isCompleted = user?.isCompleted;
  return (
    <div className="flex h-16 items-center justify-between bg-white px-4 shadow-sm">
      <div className="flex items-center space-x-4">
        {isCompleted ? (
          <Link to="/dashboard" className="flex items-center space-x-4">
            <img src={logo} className="w-12" />
            <span className="text-lg font-semibold text-black"></span>
          </Link>
        ) : (
          <div className="flex  items-center space-x-4 ">
            <img src={logo} className="w-12" />
            <span className="text-lg font-semibold text-black"></span>
          </div>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <div
          className={`flex flex-col items-start`}
          onClick={() => {
            if (isCompleted) navigate('/dashboard/profile');
          }}
        >
          <span className="text-sm font-semibold text-black">{user?.name}</span>
          <span className="text-[12px] font-medium text-black">
            {user?.email}
          </span>
        </div>
        <Button
          onClick={handleLogout}
          className="flex cursor-pointer items-center space-x-6 rounded-md bg-watney p-2 text-white hover:bg-watney/90"
        >
          <div className="flex flex-row items-center justify-center gap-1 rounded-md p-2">
            <LogOut className="h-4 w-4" />
            <span className="font-semibold">Log out</span>
          </div>
        </Button>
      </div>
    </div>
  );
}
