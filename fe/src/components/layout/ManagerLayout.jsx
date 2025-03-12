import Header from './Header';
import ManagerSideBar from './ManagerSideBar';
import Footer from './Footer';

export default function ManagerLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <ManagerSideBar />
      <div className="flex-1 flex flex-col ml-64 md:ml-0">
        <Header />
        <div>{children}</div>
      </div>
    </div>
  );
}
