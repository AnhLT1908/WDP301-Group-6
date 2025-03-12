import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "./components/layout/DashboardLayout";
import ForgotPassword from "./page/ForgotPassword.jsx";
import VerifyCodeForgotPassword from "./page/VerifyCodeForgotPassword.jsx";
import HomePage from "./page/HomePage.jsx";
import Login from "./page/Login.jsx";
import ChangePassword from "./page/ChangePassword.jsx";
import AccountList from "./page/AccountList";
import UserProfile from "./page/UserProfile";
import SetNewPassword from "./page/SetNewPassword.jsx";
import HomePageAdmin from "./page/HomePageAdmin.jsx";
import LodgerAccountList from "./page/LodgerAccountList.jsx";
import ManagerLayout from "./components/layout/ManagerLayout.jsx";
import CreateLodgerAccount from "./page/CreateLodgerAccount.jsx";
import HouseList from "./page/HouseList.jsx";
//import NotFound from "./page/NotFound.jsx";

function Dashboard() {
  return <div>Welcome to Dashboard</div>;
}

function App() {
  const [accountType, setAccountType] = useState(
    localStorage.getItem("accountType")
  );

  useEffect(() => {
    const storedAccountType = localStorage.getItem("accountType");
    setAccountType(storedAccountType);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          path="/login"
          element={<Login setAccountType={setAccountType} />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/verify-code" element={<VerifyCodeForgotPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/reset-password" element={<SetNewPassword />} />

        {accountType === "Lodger" ? (
          <>
            <Route path="/home" element={<HomePage />} />
            <Route
              path="/lodger-account-list"
              element={
                <ManagerLayout>
                  <LodgerAccountList />
                </ManagerLayout>
              }
            />
            <Route
              path="/create-lodger-account"
              element={
                <ManagerLayout>
                  <CreateLodgerAccount />
                </ManagerLayout>
              }
            />
            <Route
              path="/house-list"
              element={
                <ManagerLayout>
                  <HouseList />
                </ManagerLayout>
              }
            />
          </>
        ) : (
          <Route path="/home" element={<Navigate to="/login" replace />} />
        )}

        {accountType === "Admin" ? (
          <>
            <Route
              path="/admin"
              element={
                <DashboardLayout>
                  <HomePageAdmin />
                </DashboardLayout>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              }
            />
            <Route
              path="/admin/account-list"
              element={
                <DashboardLayout>
                  <AccountList />
                </DashboardLayout>
              }
            />
          </>
        ) : (
          <Route path="/admin/*" element={<Navigate to="/login" replace />} />
        )}

        {accountType === "Manager" ? (
          <Route path="/manager/lodger-account-list" element={""} />
        ) : (
          <Route path="/manager/*" element={<Navigate to="/login" replace />} />
        )}

        <Route path="/404" element={""} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
