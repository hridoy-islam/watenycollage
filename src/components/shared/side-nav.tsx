import { HomeIcon, UsersIcon, Settings2Icon, FileTextIcon, UserIcon, ClipboardListIcon, ShieldIcon, ChevronDown, Settings2, CalendarCheck, RefreshCw, BookOpenCheck, Landmark, Users, CircleUser, Link2 } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Link } from 'react-router-dom'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '../ui/dropdown-menu'

const navItems = [
  { icon: HomeIcon, label: "Dashboard", href: "/admin" },
  {
    icon: ClipboardListIcon, label: "Management", href: "/management",
    subItems: [
      { icon: Users, label: "Agents", href: "agents" },
      { icon: Link2 , label: "Course Relation", href: "course-fee" },
      
    ]
  },
  { icon: UsersIcon, label: "Students", href: "students" },
  { icon: UserIcon, label: "Enrolled", href: "#" },
  { icon: FileTextIcon, label: "Invoices", href: "#" },
  {
    icon: Settings2Icon,
    label: "Settings",
    href: "/settings",
    subItems: [
      {
        icon: Settings2, label: "Perameters", href: "/settings/",
        subItems: [
          { icon: Landmark, label: "Institution", href: "institution" },
          { icon: BookOpenCheck, label: "Courses", href: "courses" },
          { icon: RefreshCw, label: "Terms", href: "terms" },
          { icon: CalendarCheck, label: "Academic Year", href: "academic-year" },
        ]
      },
      { icon: CircleUser, label: "Staff", href: "staff" },
    ]
  },
]
const NavItem = ({ item, depth = 0 }) => {
  if (item.subItems) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="flex w-full items-center justify-between cursor-pointer">
          <div className="flex items-center space-x-2">
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </div>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className='bg-supperagent border-none'>
          {item.subItems.map((subItem) => (
            <NavItem key={subItem.href} item={subItem} depth={depth + 1} />
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    )
  }

  return (
    <DropdownMenuItem asChild>
      <Link
        to={item.href}
        className="flex w-full items-center space-x-2 text-sm font-medium text-white hover:text-supperagent cursor-pointer"
      >
        <item.icon className="h-5 w-5" />
        <span>{item.label}</span>
      </Link>
    </DropdownMenuItem>
  )
}

export function SideNav() {
  return (
    <nav className="flex space-x-6 shadow-sm bg-white px-4 py-4">
      {navItems.map((item) => (
        <div key={item.href}>
          {item.subItems ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-supperagent cursor-pointer">
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-supperagent border-none">
                {item.subItems.map((subItem) => (
                  <NavItem key={subItem.href} item={subItem} />
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to={item.href}
              className={cn(
                "flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-supperagent cursor-pointer",
                item.href === "/students" && "text-supperagent"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}