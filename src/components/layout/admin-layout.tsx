import { TopNav } from "@/components/shared/top-nav"
import { SideNav } from "@/components/shared/side-nav"

export default function AdminLayout({
    children
  }: {
    children: React.ReactNode;
  })  {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <SideNav />

      <main className="px-4 mx-auto py-6">
      {children}
      </main>
    </div>
  )
}
