import DashboardHeader from './DashboardHeader';
import DashboardSideBar from './DashboardSideBar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSideBar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
