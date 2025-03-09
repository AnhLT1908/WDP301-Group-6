import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import ForgotPassword from './page/ForgotPassword.jsx';
import VerifyCodeForgotPassword from './page/VerifyCodeForgotPassword.jsx';
import HomePage from './page/HomePage.jsx';
import Login from './page/Login.jsx';
import ChangePassword from './page/ChangePassword.jsx';
import ManagerList from './page/ManagerList.jsx';
import UserProfile from './page/UserProfile';
import LodgerList from './page/LodgerList.jsx';
import AccountList from "./page/AccountList";
import SetNewPassword from "./page/SetNewPassword.jsx";
import HomePageAdmin from "./page/HomePageAdmin.jsx";
import InvoiceList from "./page/InvoiceList.jsx";
import HouseDetail from './page/HouseDetail.jsx';

function Dashboard() {
  return <div>Welcome to Dashboard</div>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path = "/manager/lodger-list" element = {<DashboardLayout><LodgerList /></DashboardLayout>}/>
        <Route path = "/manager/house-detail/:houseId" element = {<DashboardLayout><HouseDetail /></DashboardLayout>}/>
        <Route path="/admin" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
        <Route path="/admin/manager-list" element={<DashboardLayout><ManagerList /></DashboardLayout>} />
        <Route path="/manager/bill-list" element={<DashboardLayout><InvoiceList /></DashboardLayout>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/verify-code" element={<VerifyCodeForgotPassword />} />
        <Route path="/login" element={<Login />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/reset-password" element={<SetNewPassword />} />
      </Routes>
    </Router>
  );
}

export default App;