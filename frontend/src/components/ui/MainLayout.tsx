
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import Header from "./header";

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 h-full overflow-y-scroll overflow-x-hidden">
        <Header />
        <main className="p-4 md:p-6 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}