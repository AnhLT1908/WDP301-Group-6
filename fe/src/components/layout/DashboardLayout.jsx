import DashboardHeader from './DashboardHeader';
import DashboardSideBar from './DashboardSideBar';
import Footer from './Footer';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <DashboardSideBar />
      <div className="flex-1 flex flex-col justify-between ml-64 md:ml-0">
        <DashboardHeader />
        <div>{children}</div>
        <Footer />
      </div>
    </div>
  );
}
