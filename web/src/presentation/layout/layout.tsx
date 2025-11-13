import React from "react"
import { Suspense } from "react"
import { Outlet } from "react-router-dom"

const AppLayout = () => {
  return (
    <div className="w-screen h-screen overflow-y-auto">
      <main className="w-full h-full">
        <Suspense fallback={<div>Loading...</div>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}


export default AppLayout
