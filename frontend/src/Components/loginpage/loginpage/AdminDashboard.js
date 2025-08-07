import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboardLayout = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { key: '', label: 'Home' },
    { key: 'employeeprofileviewer', label: 'Employee Profiles' },
    { key: 'adminsettings', label: 'Settings' },
    { key: 'punchioncorrection', label: 'Punch Correction' },
    { key: 'leavemanagement', label: 'Leave Management' },
    { key: 'taskoverview', label: 'Task Overview' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'attendancesummary', label: 'Attendance Summary' },
  ];

  const handleNavigate = (key) => {
    navigate(`/admin-dashboard/${key}`);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <>
      <nav className="admin-navbar">
        <div className="admin-navbar-brand">ISAR EMS - Admin</div>
        <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>☰</div>
        <ul className={`admin-navbar-links ${menuOpen ? 'open' : ''}`}>
          {navItems.map(link => (
            <li key={link.key}>
              <button className="nav-button" onClick={() => handleNavigate(link.key)}>{link.label}</button>
            </li>
          ))}
          <li>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </nav>

      <div className="admin-dashboard-content">
        <Outlet />
      </div>
    </>
  );
};

export default AdminDashboardLayout;
