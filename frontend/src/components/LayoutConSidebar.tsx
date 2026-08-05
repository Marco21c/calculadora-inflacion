import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'

export default function LayoutConSidebar() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 my-5 mx-auto max-w-7xl px-16 py-4">
        <Outlet />
      </div>
    </div>
  )
}
