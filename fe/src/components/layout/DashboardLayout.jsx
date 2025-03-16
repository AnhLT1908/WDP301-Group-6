import DashboardHeader from './DashboardHeader';
import DashboardSideBar from './DashboardSideBar';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }) {
  const [Height, setHeight] = useState("100vh");
  useEffect(() => {
    const updateHeight = () => {
      const contentHeight = document.body.scrollHeight;
      setHeight(`${contentHeight}px`);
    }

    updateHeight();

    window.addEventListener("resize", updateHeight);
    window.addEventListener("scroll", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("scroll", updateHeight);
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-100" style={{ height: Height }}>
      <DashboardSideBar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
