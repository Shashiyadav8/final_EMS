import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import './EmployeeDashboard.css';

const EmployeeDashboardLayout = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { key: '', label: 'Dashboard' },
    { key: 'profile', label: 'Profile' },
    { key: 'leave', label: 'Leave Management' },
    { key: 'tasks', label: 'Task Tracking' },
    { key: 'correction', label: 'Punch Correction' },
  ];

  const handleNavigate = (key) => {
    navigate(`/employee-dashboard/${key}`);
    setMenuOpen(false); // Close menu on navigation
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">ISAR EMS - Employee</div>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {navItems.map(link => (
            <li key={link.key}>
              <button onClick={() => handleNavigate(link.key)}>{link.label}</button>
            </li>
          ))}
          <li>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </nav>
      <div className="dashboard-content">
        <Outlet />
      </div>
    </>
  );
};

export default EmployeeDashboardLayout;
