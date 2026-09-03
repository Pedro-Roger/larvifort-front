import { Outlet } from 'react-router-dom'
import AppSidebar from './AppSidebar'

export default function MainLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[hsl(210,40%,98%)] dark:bg-[hsl(222,47%,11%)]">
      <AppSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
