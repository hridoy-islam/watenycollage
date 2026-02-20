import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { logout } from '@/redux/features/authSlice';
import logo from '@/assets/imges/home/logo.png';
import {
  Users,
  BookOpen,
  Calendar,
  Briefcase,
  LayoutTemplate,
  ClipboardList,
  GraduationCap,
  BarChart2,
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  MessageSquare,
  UserCheck,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const adminLinks = [
  { path: '/dashboard/student-applications', label: 'Student Applications', icon: Users },
  { path: '/dashboard/courses', label: 'Course', icon: BookOpen },
  { path: '/dashboard/assignments-feedback', label: 'Assignment', icon: ClipboardList },
  { path: '/dashboard/teachers', label: 'Teachers', icon: GraduationCap },
  { path: '/dashboard/terms', label: 'Term', icon: Calendar },
  { path: '/dashboard/jobs', label: 'Job', icon: Briefcase },
  { path: '/dashboard/report', label: 'Report', icon: BarChart2 },
  { path: '/dashboard/template', label: 'Template', icon: LayoutTemplate },
  { path: '/dashboard/verification', label: 'Verification', icon: ShieldCheck },
];

export function SideNav() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const isCompleted = user?.isCompleted;
  const [mobileOpen, setMobileOpen] = useState(false);

  const teacherLinks = [
    { path: `/dashboard/teachers/courses/${user?._id}`, label: 'Courses', icon: BookOpen },
    { path: '/dashboard/teacher-assignments-feedback', label: 'Feedbacks', icon: MessageSquare },
    { path: '/dashboard/teacher/student-applications', label: 'Students', icon: Users },
    { path: '/dashboard/attendance', label: 'Attendance', icon: UserCheck },
  ];

  const navItems = [
    ...(isCompleted ? [{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    ...(user?.role === 'admin' ? adminLinks : user?.role === 'teacher' ? teacherLinks : []),
  ];

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  const sidebarContent = (
    // ✅ w-56 = 224px — must match lg:pl-56 in AdminLayout
    <aside className="flex h-full w-56 flex-col border-r border-gray-100 bg-white shadow-lg">
      {/* Header / Logo */}
      <div className="flex h-16 flex-shrink-0 items-center gap-3 border-b border-gray-100 px-5">
        {isCompleted ? (
          <a href="/dashboard" className="flex items-center gap-3">
            <img src={logo} className="h-10 w-10 object-contain" alt="Logo" />
          </a>
        ) : (
          <div className="flex items-center gap-3">
            <img src={logo} className="h-10 w-10 object-contain" alt="Logo" />
            <span className="text-base font-bold text-gray-800 tracking-tight">Dashboard</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-thin scrollbar-thumb-gray-100 hover:scrollbar-thumb-gray-200">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/dashboard'}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all  hover:bg-watney hover:text-white group"
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer / User Info */}
      <div className="flex-shrink-0 border-t border-gray-100 p-4 space-y-3 bg-white">
        <div
          className={cn('flex flex-col gap-0.5', isCompleted && 'cursor-pointer group')}
          onClick={() => {
            if (isCompleted) {
              navigate('/dashboard/profile');
              setMobileOpen(false);
            }
          }}
        >
          <span className="text-sm font-semibold text-gray-800 truncate group-hover:text-watney transition-colors">
            {user?.name}
          </span>
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-gray-500 truncate max-w-[130px]">{user?.email}</span>
            {isCompleted && (
              <span className="text-[11px] font-medium text-watney hover:underline">
                My Profile
              </span>
            )}
          </div>
        </div>

        <Button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-watney text-white hover:bg-watney/90 rounded-lg py-2 text-sm font-semibold transition-all shadow-sm"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-gray-100 bg-white px-4 shadow-sm lg:hidden">
        <a href="/dashboard" className="flex items-center gap-2">
          <img src={logo} className="h-8 w-8 object-contain" alt="Logo" />
          <span className="text-base font-bold text-gray-800 tracking-tight">Dashboard</span>
        </a>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          {/* ✅ Mobile drawer matches w-56 of sidebarContent */}
          <div
            className="absolute inset-y-0 left-0 flex w-56 flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 z-10 rounded-md p-1.5  hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 hidden lg:flex">
        {sidebarContent}
      </div>
    </>
  );
}