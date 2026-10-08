import { Link, useNavigate } from 'react-router-dom';
import { usePathname } from '@/routes/hooks';
import logo from '@/assets/imges/home/logo.png';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { logout } from '@/redux/features/authSlice';
import {
  LogOut,
  LayoutDashboard,
  Users,
  CalendarClock,
  Umbrella,
  Clock,
  BarChart3,
  X,
  Menu,
  User,
  ArrowLeft,
  ChevronDown,
  UserPlus,
  List,
  Settings,
  HeartHandshake,
  FileText
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  {
    icon: LayoutDashboard,
    label: 'Overview',
    href: '/dashboard/people-planner'
  },
  {
    icon: FileText,
    label: 'Assessment',
    href: '/dashboard/people-planner/serviceuser-assessment',
    
  },
  {
    icon: Users,
    label: 'Service Users',
    href: '/dashboard/people-planner/serviceuser',
    
  },
  {
    icon: Settings,
    label: 'Settings',
    subItems: [
      {
        icon:  HeartHandshake ,
        label: 'Need',
        href: '/dashboard/people-planner/need'
      },
     
    ]
  }
];

export function PeoplePlannerNav() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };
  const { user } = useSelector((state: any) => state.auth);

  const toggleSubmenu = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white">
      {user?.role == 'admin' && (
        <div className="flex h-16 items-center justify-between px-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm font-medium hover:text-watney"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      )}

      <div className="flex items-center justify-center px-4 py-2">
        <img src={logo} className="w-24" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {navItems.map((item) => (
          <div key={item.label}>
            {item.subItems ? (
              <>
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-watney/10 hover:text-watney"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform duration-200',
                      expandedItems.includes(item.label) && 'rotate-180'
                    )}
                  />
                </button>
                {expandedItems.includes(item.label) && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-4">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.label}
                        to={subItem.href}
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-watney/10 hover:text-watney"
                      >
                        <subItem.icon className="h-4 w-4" />
                        <span>{subItem.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-watney/10 hover:text-watney"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* <div className="border-t border-gray-200 px-3 py-2">
        <div className="mb-2 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700">
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
      </div> */}
    </div>
  );

  return (
    <>
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-md bg-white p-2 shadow-md lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 transform border-r border-gray-200 bg-white shadow-sm transition-transform duration-200 ease-in-out lg:block">
        {sidebarContent}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl animate-in slide-in-from-left">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}