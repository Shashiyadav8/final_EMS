import React, { useEffect, useState, useCallback } from 'react';
import './EmployeeDashboard.css';
import { useNavigate } from 'react-router-dom';
import LeaveSection from './LeaveSection';
import ProfileSection from './ProfileSection';
import TaskSection from './TaskSection';
import ChangePasswordSection from './ChangePasswordSection';
import EmployeeCorrectionRequest from './EmployeeCorrectionRequest';
import { getLocalIP } from './utils/getLocalIP';
import { authFetch } from './utils/authFetch';

function EmployeeDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const API_BASE = process.env.REACT_APP_API_URL;

  const [status, setStatus] = useState({ punch_in: null, punch_out: null });
  const [clock, setClock] = useState(new Date());
  const [error, setError] = useState('');
  const [ip, setIp] = useState('');
  const [wifiAllowed, setWifiAllowed] = useState(false);
  const [deviceAllowed, setDeviceAllowed] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [workDuration, setWorkDuration] = useState('00h 00m 00s');

  useEffect(() => {
    if (!token || !user) navigate('/');
  }, [token, user, navigate]);

  useEffect(() => {
    const interval = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/attendance/status`);
      if (!res) return;
      const data = await res.json();
      setStatus(data);
      setError('');
    } catch (err) {
      console.error('Status fetch failed:', err);
      setError('Unable to fetch status. Please login again.');
    }
  }, [API_BASE]);

  const verifyIPs = useCallback(async () => {
    if (!user) return;

    const normalizeIP = (ip = '') =>
      ip.replace(/\s+/g, '').replace('::ffff:', '').replace('::1', '127.0.0.1');

    try {
      const ipRes = await authFetch(`${API_BASE}/api/ip/client-ip`);
      const ipData = await ipRes.json();
      const rawIPs = (ipData.ip || '').split(',');
      const primaryIP = normalizeIP(rawIPs[0]);
      setIp(rawIPs.map(normalizeIP).join(', '));

      const wifiRes = await authFetch(`${API_BASE}/api/ip/wifi-ips`);
      const wifiData = await wifiRes.json();
      setWifiAllowed(wifiData.map(normalizeIP).includes(primaryIP));

      const deviceRes = await authFetch(`${API_BASE}/api/ip/device-ips/${user._id}`);
      const deviceData = await deviceRes.json();
      setDeviceAllowed(deviceData.map(normalizeIP).includes(primaryIP));
    } catch (err) {
      console.error('IP verification failed:', err);
      setIp('Error fetching IP');
      setWifiAllowed(false);
      setDeviceAllowed(false);
    }
  }, [API_BASE, user]);

  useEffect(() => {
    fetchStatus();
    verifyIPs();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus, verifyIPs]);

  useEffect(() => {
    let interval = null;
    if (status.punch_in && !status.punch_out) {
      interval = setInterval(() => {
        const start = new Date(status.punch_in);
        const now = new Date();
        const diff = now - start;
        const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
        const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
        const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
        setWorkDuration(`${hours}h ${minutes}m ${seconds}s`);
      }, 1000);
    } else {
      setWorkDuration('00h 00m 00s');
    }
    return () => clearInterval(interval);
  }, [status.punch_in, status.punch_out]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const calculateWorkingHours = () => {
    if (status.punch_in && status.punch_out) {
      const diff = new Date(status.punch_out) - new Date(status.punch_in);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      return `${hours}h ${minutes}m`;
    }
    return 'N/A';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
  };

  const handlePunchIn = async () => {
    if (!wifiAllowed || !deviceAllowed) {
      alert("❌ You're not on allowed WiFi or device.");
      return;
    }
    if (!photo) {
      alert("❌ Photo is required for Punch In.");
      return;
    }

    try {
      const localIP = await getLocalIP();
      const formData = new FormData();
      formData.append('photo', photo);
      formData.append('localIP', localIP);

      const res = await authFetch(`${API_BASE}/api/attendance/punch`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      alert(`✅ ${data.message}`);
      fetchStatus();
      setPhoto(null);
    } catch (err) {
      console.error('Punch In error:', err);
      alert('❌ Punch In failed');
    }
  };

  const handlePunchOut = async () => {
    if (!wifiAllowed || !deviceAllowed) {
      alert("❌ You're not on allowed WiFi or device.");
      return;
    }

    const punchInTime = new Date(status.punch_in);
    const now = new Date();
    const timeDiff = (now - punchInTime) / (1000 * 60 * 60); // in hours

    if (timeDiff < 1) {
      alert("❌ Minimum 1 hour must pass before Punch Out.");
      return;
    }

    try {
      const localIP = await getLocalIP();
      const formData = new FormData();
      formData.append('localIP', localIP);

      const res = await authFetch(`${API_BASE}/api/attendance/punch`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      alert(`✅ ${data.message}`);
      fetchStatus();
    } catch (err) {
      console.error('Punch Out error:', err);
      alert('❌ Punch Out failed');
    }
  };

  const handleDownloadAttendance = async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/attendance/export`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance.csv');
      link.click();
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleDownloadLeaves = async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/leaves/export`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leaves.csv');
      link.click();
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome Employee</h2>
        <div className="clock">{clock.toLocaleTimeString()}</div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="dashboard-card">
        <p><strong>Your IP(s):</strong> {ip || 'Fetching...'}</p>
        <p><strong>WiFi Allowed:</strong> {wifiAllowed ? '✅' : '❌'}</p>
        <p><strong>Device Allowed:</strong> {deviceAllowed ? '✅' : '❌'}</p>

        {!status.punch_in && (
          <div className="photo-upload">
            <label>Upload Photo for Punch In:</label>
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
            <p>{photo ? '✅ Photo uploaded' : '❌ No photo selected'}</p>
          </div>
        )}

        <div className="punch-status">
          <h3>Attendance Status (Today)</h3>
          {!status.punch_in && <p>❌ Not yet punched in</p>}
          {status.punch_in && !status.punch_out && (
            <p>✅ Punched In at {formatTime(status.punch_in)}</p>
          )}
          {status.punch_in && status.punch_out && (
            <p>✅ Punched In at {formatTime(status.punch_in)}, Out at {formatTime(status.punch_out)}</p>
          )}
        </div>

        {status.punch_in && !status.punch_out && (
          <p><strong>Live Timer:</strong> {workDuration}</p>
        )}

        {status.punch_in && status.punch_out && (
          <p><strong>Total Duration:</strong> {calculateWorkingHours()}</p>
        )}

        <div className="punch-buttons">
          <button onClick={handlePunchIn} disabled={!!status.punch_in}>
            Punch In
          </button>
          <button onClick={handlePunchOut} disabled={!status.punch_in || !!status.punch_out}>
            Punch Out
          </button>
        </div>

        <div className="download-buttons">
          <h3>Download Reports</h3>
          <button onClick={handleDownloadAttendance}>Attendance CSV</button>
          <button onClick={handleDownloadLeaves}>Leave CSV</button>
        </div>

        {error && <p className="error">{error}</p>}
      </div>

      
      <ProfileSection />
      <ChangePasswordSection />
      <EmployeeCorrectionRequest token={token} />
      <TaskSection />
      <LeaveSection token={token} />
    </div>
  );
}

export default EmployeeDashboard;
