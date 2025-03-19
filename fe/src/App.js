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
import SetNewPassword from "./page/SetNewPassword.jsx";
import HomePageAdmin from "./page/HomePageAdmin.jsx";
import InvoiceList from "./page/InvoiceList.jsx";
import HouseDetail from "./page/HouseDetail.jsx";
import InvoiceDetail from "./page/InvoiceDetail.jsx";
import UserProfile from "./page/UserProfile.jsx";
import LodgerList from "./page/LodgerList.jsx";
import LodgerAccountList from "./page/LodgerAccountList.jsx";
import ManagerLayout from "./components/layout/ManagerLayout.jsx";
import CreateLodgerAccount from "./page/CreateLodgerAccount.jsx";
import HouseList from "./page/HouseList.jsx";
import RoomDetail from "./page/RoomDetail.jsx";
import NewInvoice from "./page/NewInvoice.jsx";
import RoomList from "./page/RoomList.jsx";
import LodgerInvoice from "./page/LodgerInvoice.jsx";
import UpdateLodgerAccount from "./page/UpdateLodgerAccount.jsx";
//import NotFound from "./page/NotFound.jsx";
import Dashboard from "./page/Dashboard.jsx";

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
              path="/house-list"
              element={
                <ManagerLayout>
                  <HouseList />
                </ManagerLayout>
              }
            />
            <Route
              path="/room-detail"
              element={
                <ManagerLayout>
                  <RoomDetail />
                </ManagerLayout>
              }
            />
            <Route path="/lodger-invoice/:billId" element={<LodgerInvoice />} />
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
            <Route
              path="/admin/house-list"
              element={
                <DashboardLayout>
                  <HouseList />
                </DashboardLayout>
              }
            />
          </>
        ) : (
          <Route path="/admin/*" element={<Navigate to="/login" replace />} />
        )}

        {accountType === "Manager" ? (
          <>
            <Route
              path="/manager/invoice-list"
              element={
                <ManagerLayout>
                  <InvoiceList />
                </ManagerLayout>
              }
            />
            <Route
              path="/manager/create-lodger-account"
              element={
                <ManagerLayout>
                  <CreateLodgerAccount accountType={accountType} />
                </ManagerLayout>
              }
            />
            <Route
              path="/manager/lodger-list"
              element={
                <ManagerLayout>
                  <LodgerAccountList />
                </ManagerLayout>
              }
            />
            <Route
              path="/manager/update-lodger-account/:lodgerAccounId"
              element={
                <ManagerLayout>
                  <UpdateLodgerAccount />
                </ManagerLayout>
              }
            />
            <Route
              path="manager/house-detail"
              element={
                <ManagerLayout>
                  <HouseDetail />
                </ManagerLayout>
              }
            />
            <Route
              path="manager/invoice-detail"
              element={
                <ManagerLayout>
                  <InvoiceDetail />
                </ManagerLayout>
              }
            />
            <Route
              path="manager/invoice/new-invoice"
              element={
                <ManagerLayout>
                  <NewInvoice />
                </ManagerLayout>
              }
            />
            <Route
              path="manager/room/rooms-list"
              element={
                <ManagerLayout>
                  <RoomList />
                </ManagerLayout>
              }
            />

            <Route
              path="manager/room/room-detail/:roomId"
              element={
                <ManagerLayout>
                  <RoomDetail />
                </ManagerLayout>
              }
            />
          <Route
            path = "manager/room/rooms-list"
            element = {
              <DashboardLayout>
                <RoomList />
              </DashboardLayout>
            }
          />

          <Route
            path = "manager/room/room-detail/:roomId"
            element = {
              <DashboardLayout>
                <RoomDetail />
              </DashboardLayout>
            }
          />
          </>
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
