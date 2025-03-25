import ManagerSideBar from './ManagerSideBar';
import ManagerHeader from './ManagerHeader';

export default function ManagerLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <ManagerSideBar />
      <div className="flex-1 flex flex-col ml-64 md:ml-0">
        <ManagerHeader/>
        <div>{children}</div>
      </div>
    </div>
  );
}
