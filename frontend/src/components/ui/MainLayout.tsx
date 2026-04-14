
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import Header from "./header";

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-auto overflow-x-hidden">
        <Header />
        <main className="flex-1 p-4 md:p-6 w-full max-w-[100vw]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}