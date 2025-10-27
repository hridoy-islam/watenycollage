import { Link, useNavigate } from 'react-router-dom';
import { UserNav } from './user-nav';
import logo from '@/assets/imges/home/logo.png';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { logout } from '@/redux/features/authSlice';
import { Edit, Edit2, LogOut } from 'lucide-react';
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

  // Dynamic navigation links configuration
  const navLinks = [
    { path: '/dashboard/student-applications', label: 'Student Applications' },
    // { path: '/dashboard/career-applications', label: 'Career Applications' },
    { path: '/dashboard/courses', label: 'Course' },
    { path: '/dashboard/terms', label: 'Term' },
    { path: '/dashboard/jobs', label: 'Job' },
    { path: '/dashboard/template', label: 'Template' },
    { path: '/dashboard/assignments-feedback', label: 'Assignment' },
    { path: '/dashboard/teachers', label: 'Teachers' },
    { path: '/dashboard/report', label: 'Report' }
  ];

  const navLinksForTeacher = [
    // { path: '/dashboard/career-applications', label: 'Career Applications' },
    { path: `/dashboard/teachers/courses/${user?._id}`, label: 'Courses' },
    { path: '/dashboard/teacher-assignments-feedback', label: 'Feedbacks' },
    { path: '/dashboard/teacher/student-applications', label: 'Students' }
  ];

  return (
    <div className="flex h-16 items-center justify-between bg-white px-4 shadow-sm">
      <div className="flex items-center space-x-4">
        {isCompleted ? (
          <Link to="/dashboard" className="flex items-center space-x-4">
            <img src={logo} className="w-12" />
            <span className="text-lg font-semibold text-black"></span>
          </Link>
        ) : (
          <div className="flex items-center space-x-4">
            <img src={logo} className="w-12" />
            <span className="text-lg font-semibold text-black"></span>
          </div>
        )}
      </div>

      {user?.role === 'admin' && (
        <div className="flex items-center space-x-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="rounded-sm px-2 py-1 text-sm font-semibold text-black transition-all hover:bg-watney hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {user?.role === 'teacher' && (
        <div className="flex items-center space-x-4">
          {navLinksForTeacher.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="rounded-sm px-2 py-1 text-sm font-semibold text-black transition-all hover:bg-watney hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center space-x-4">
        <div
          className={`flex flex-col items-start`}
          onClick={() => {
            if (isCompleted) navigate('/dashboard/profile');
          }}
        >
          <span className="text-sm font-semibold text-black max-md:hidden">
            {user?.name}
          </span>
          <div className="flex cursor-pointer flex-row items-center gap-4 text-[12px] font-medium text-black">
            <span className="max-md:hidden">{user?.email}</span>
            <span className="text-watney">My Profile</span>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          className="flex cursor-pointer items-center space-x-6 rounded-md bg-watney p-2 text-white hover:bg-watney/90"
        >
          <div className="flex flex-row items-center justify-center gap-1 rounded-md p-2">
            <LogOut className="h-4 w-4" />
            <span className="font-semibold  max-md:hidden">Log out</span>
          </div>
        </Button>
      </div>
    </div>
  );
}
