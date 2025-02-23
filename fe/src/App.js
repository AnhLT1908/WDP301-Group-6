import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import ForgotPassword from './page/ForgotPassword.jsx';
import VerifyCodeForgotPassword from './page/VerifyCodeForgotPassword.jsx';
import HomePage from './page/HomePage.jsx';
import Login from './page/Login.jsx';
import ChangePassword from './page/ChangePassword.jsx';
import AccountList from './page/AccountList';

function Dashboard() {
  return <div>Welcome to Dashboard</div>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/admin"
          element={<DashboardLayout><Dashboard /></DashboardLayout>} />
        <Route
          path="/admin/account-list"
          element={<DashboardLayout><AccountList /></DashboardLayout>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-code" element={<VerifyCodeForgotPassword />} />
        <Route path="/login" element={<Login />} />
        <Route path="/change-password" element={<ChangePassword />} />
      </Routes>
    </Router>
  );
}

export default App;