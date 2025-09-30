import { UserProvider } from "@/hooks/user-provider";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <div className="min-h-screen max-h-screen flex flex-col !overflow-clip">
      <main className="min-h-screen max-h-screen w-full flex">
       <Suspense fallback={<div>Loading...</div>}>
          <UserProvider>
            <Outlet />
          </UserProvider>
        </Suspense>
      </main>
    </div>
  );
};

export default AppLayout;
