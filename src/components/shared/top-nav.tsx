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

  return (
    <div className="flex h-16 items-center justify-between bg-white px-4 shadow-sm">
      <div className="flex items-center space-x-4">
        <Link
          to="/dashboard"
          className="flex items-center space-x-4 text-white"
        >
          <img src={logo} className="w-12" />
          <span className="text-lg font-semibold text-black"></span>
        </Link>
      </div>
<div className="flex items-center space-x-4">


      <div className='flex flex-col items-start '>
      <span className="text-sm font-semibold text-black">{user?.name}</span>
      <span className="text-[12px] font-medium text-black">{user?.email}</span>
      </div>
      <Button
        onClick={handleLogout}
        className="flex cursor-pointer items-center space-x-6 rounded-md p-2 bg-watney text-white  hover:bg-watney/90 "
      >
        {/* <UserNav /> */}
        
        <div className='flex flex-row items-center justify-center gap-1  p-2 rounded-md'>
          <LogOut className=" h-4 w-4" />
          <span className="font-semibold">Log out</span>
        </div>
      </Button>
      </div>
    </div>
  );
}
