import { UserProvider } from "@/hooks/user-provider"
import { Suspense } from "react"
import { Outlet } from "react-router-dom"

const AppLayout = () => {
  return (
    <div className="w-screen h-screen overflow-y-auto">
      <main className="w-full h-full">
        <Suspense fallback={<div>Loading...</div>}>
          <UserProvider>
            <Outlet />
          </UserProvider>
        </Suspense>
      </main>
    </div>
  )
}


export default AppLayout
