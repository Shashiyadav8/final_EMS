import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import LoginPage from './Components/loginpage/loginpage/LoginPage';

// Employee imports
import EmployeeDashboardLayout from './Components/loginpage/loginpage/EmployeeDashboard';
import ProfileSection from './Components/loginpage/loginpage/ProfileSection';
import LeaveSection from './Components/loginpage/loginpage/LeaveSection';
import TaskSection from './Components/loginpage/loginpage/TaskSection';
import EmployeeCorrectionRequest from './Components/loginpage/loginpage/EmployeeCorrectionRequest';
import EmployeeHome from './Components/loginpage/loginpage/employeehome';

// Admin imports
import AdminDashboardLayout from './Components/loginpage/loginpage/AdminDashboard';
import AdminHome from './Components/loginpage/loginpage/adminhome';
import EmployeeProfileViewer from './Components/loginpage/loginpage/EmployeeProfileViewer';
import AdminSettings from './Components/loginpage/loginpage/AdminSettingsSection';
import AdminCorrectionPanel from './Components/loginpage/loginpage/AdminCorrectionPanel';
import LeaveManagementSection from './Components/loginpage/loginpage/LeaveManagementSection';
import TaskOverviewSection from './Components/loginpage/loginpage/TaskOverviewSection';
import AnalyticsSection from './Components/loginpage/loginpage/AnalyticsSection';
import AdminAttendanceSummary from './Components/loginpage/loginpage/AdminAttendanceSummary'; // ✅ Make sure path is correct

function App() {
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });

  useEffect(() => {
    document.title = "ISAR EMS";
    AOS.init({ duration: 1000 });
  }, []);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
    const u = localStorage.getItem('user');
    setUser(u ? JSON.parse(u) : null);
  }, [location]);

  return (
    <Routes>
      {/* Login */}
      <Route path="/" element={<LoginPage />} />

      {/* Employee Protected Routes */}
      <Route
        path="/employee-dashboard/*"
        element={
          token && user?.role === 'employee' ? <EmployeeDashboardLayout /> : <Navigate to="/" replace />
        }
      >
        <Route index element={<EmployeeHome />} />
        <Route path="profile" element={<ProfileSection />} />
        <Route path="leave" element={<LeaveSection />} />
        <Route path="tasks" element={<TaskSection />} />
        <Route path="correction" element={<EmployeeCorrectionRequest />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route
        path="/admin-dashboard/*"
        element={
          token && user?.role === 'admin' ? <AdminDashboardLayout /> : <Navigate to="/" replace />
        }
      >
        <Route index element={<AdminHome />} />
        <Route path="employeeprofileviewer" element={<EmployeeProfileViewer />} />
        <Route path="adminsettings" element={<AdminSettings />} />
        <Route path="punchioncorrection" element={<AdminCorrectionPanel />} />
        <Route path="leavemanagement" element={<LeaveManagementSection />} />
        <Route path="taskoverview" element={<TaskOverviewSection />} />
        <Route path="analytics" element={<AnalyticsSection />} />
        <Route path="attendancesummary" element={<AdminAttendanceSummary />} /> {/* ✅ Fixed path */}
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
