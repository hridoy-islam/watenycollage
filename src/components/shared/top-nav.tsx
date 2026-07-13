import { Link, useNavigate } from 'react-router-dom';
import { usePathname } from '@/routes/hooks';
import logo from '@/assets/imges/home/logo.png';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { logout } from '@/redux/features/authSlice';
import {
  LogOut,
  ChevronDown,
  Settings,
  LayoutDashboard,
  Briefcase,
  Users,
  X,
  Menu,
  User,
  FileText,
  Stamp,
  BookTemplate,
  GraduationCap
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { icon: Briefcase, label: 'Jobs', href: '/dashboard/recruitment/jobs' },
  { icon: Users, label: 'Employee', href: '/dashboard/recruitment/employee' },
  {
    icon: Settings,
    label: 'Settings',
    href: '#',
    subItems: [
      { icon: FileText, label: 'Designation', href: '/dashboard/recruitment/designation' },
      { icon: BookTemplate, label: 'Contract Type Template', href: '/dashboard/recruitment/contract-type-template' },
      { icon: GraduationCap, label: 'Training', href: '/dashboard/recruitment/ecerts' },
      { icon: Stamp, label: 'Template', href: '/dashboard/recruitment/template' }
    ]
  }
];

export function TopNav() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };
  const { user } = useSelector((state: any) => state.auth);
  const isCompleted = user?.isCompleted;

  const isActive = (href: string) => {
    if (href === '#') return false;
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const toggleSubMenu = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

  // Check if we should show nav items (hide only on exact /dashboard route)
  const showNavItems = pathname !== '/dashboard';

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-16 items-center justify-center pt-4">
        {isCompleted ? (
          <Link to="/dashboard" className="flex items-center space-x-3" onClick={() => setSidebarOpen(false)}>
            <img src={logo} className="w-24" />
          </Link>
        ) : (
          <div className="flex items-center space-x-3">
            <img src={logo} className="w-24" />
          </div>
        )}
      </div>

      {/* Only show nav items when not on /dashboard route */}
      {showNavItems && (
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            if (item.subItems) {
              const isExpanded = expandedMenu === item.label;
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleSubMenu(item.label)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      'text-gray-700 hover:bg-watney/10 hover:text-watney'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        isExpanded && 'rotate-180'
                      )}
                    />
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-watney/20 pl-3">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.href}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            isActive(sub.href)
                              ? 'bg-watney text-white'
                              : 'text-gray-600 hover:bg-watney/10 hover:text-watney'
                          )}
                        >
                          <sub.icon className="h-4 w-4" />
                          <span>{sub.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-watney text-white'
                    : 'text-gray-700 hover:bg-watney/10 hover:text-watney'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Add flex-1 to push user section to bottom when nav items are hidden */}
      {!showNavItems && <div className="flex-1" />}

      <div className="border-t px-3 py-2 border-gray-200">
        <div
          className="mb-2 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 "
          // onClick={() => {
          //   if (isCompleted) {
          //     navigate('/dashboard/profile');
          //     setSidebarOpen(false);
          //   }
          // }}
        >
          <User className="h-5 w-5 text-gray-500" />
          <div className="flex flex-col">
            <span className="font-semibold">{user?.name}</span>
            <span className="text-xs text-gray-500">{user?.email}</span>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Only show mobile menu button when nav items are visible */}
      {showNavItems && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed left-4 top-4 z-40 rounded-md bg-white p-2 shadow-md lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 transform border-r border-gray-200 bg-white shadow-sm transition-transform duration-200 ease-in-out lg:block">
        {sidebarContent}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 animate-in slide-in-from-left bg-white shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}