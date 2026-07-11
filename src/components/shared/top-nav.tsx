import { Link, useNavigate } from 'react-router-dom';
import { usePathname } from '@/routes/hooks';
import logo from '@/assets/imges/home/logo.png';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { logout } from '@/redux/features/authSlice';
import { LogOut, ChevronDown, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';

export function TopNav() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const pathname = usePathname();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };
  const { user } = useSelector((state: any) => state.auth);
  const isCompleted = user?.isCompleted;
  const isDashboardRoot = pathname === '/dashboard';

  return (
    <div className="flex h-16 items-center justify-between bg-white px-4 shadow-sm">
      <div className="flex items-center space-x-4">
        {isCompleted ? (
          <Link to="/dashboard" className="flex items-center space-x-4">
            <img src={logo} className="w-16" />
          </Link>
        ) : (
          <div className="flex items-center space-x-4">
            <img src={logo} className="w-16" />
          </div>
        )}
      </div>

      {user?.role === 'admin' && !isDashboardRoot && (
        <div className="flex items-center space-x-6">
          <Link
            to="/dashboard/recruitment/jobs"
            className="text-black font-semibold py-1 px-2 hover:bg-watney hover:text-white rounded-sm transition-all"
          >
            Jobs
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex cursor-pointer items-center gap-1 text-black font-semibold py-1 px-2 hover:bg-watney hover:text-white rounded-sm transition-all">
                <Settings className="h-4 w-4" />
                Setting
                <ChevronDown className="h-4 w-4" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-auto border-gray-300">
              <DropdownMenuItem asChild>
                <Link to="/dashboard/recruitment/designation" className="cursor-pointer">
                  Designation
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/recruitment/contract-type-template" className="cursor-pointer">
                  Contract Type Template
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/recruitment/ecerts" className="cursor-pointer">
                  Training
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/recruitment/template" className="cursor-pointer">
                  Template
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <div
          className={`flex flex-col items-start`}
          onClick={() => {
            if (isCompleted) navigate('/dashboard/profile');
          }}
        >
          <span className="text-sm font-semibold text-black max-md:hidden">{user?.name}</span>
          <div className="text-[12px] gap-4 cursor-pointer flex flex-row items-center font-medium text-black">
            <span className='max-md:hidden'>{user?.email}</span>
            <span className='text-watney'>My Profile</span>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          className="flex cursor-pointer items-center space-x-6 rounded-md bg-watney p-2 text-white hover:bg-watney/90"
        >
          <div className="flex flex-row items-center justify-center gap-1 rounded-md p-2">
            <LogOut className="h-4 w-4" />
            <span className="font-semibold max-md:hidden">Log out</span>
          </div>
        </Button>
      </div>
    </div>
  );
}
