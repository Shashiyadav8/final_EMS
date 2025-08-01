// src/Components/EmployeeCorrectionRequest.js
import React, { useState } from 'react';
import './EmployeeCorrectionRequest.css';
import { authFetch } from './utils/authFetch';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

function EmployeeCorrectionRequest({ token }) {
  const [form, setForm] = useState({
    date: '',
    requested_punch_in: '',
    requested_punch_out: '',
    reason: ''
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const convertToUTC = (date, time) => {
    return dayjs.tz(`${date}T${time}`, 'Asia/Kolkata').utc().toISOString();
  };

  const handleSubmit = async () => {
    setMessage('');

    if (!form.date || !form.reason) {
      setMessage('❌ Please fill date and reason.');
      return;
    }

    if (!form.requested_punch_in && !form.requested_punch_out) {
      setMessage('❌ Enter at least one time (Punch In or Punch Out).');
      return;
    }

    let requestedPunchIn = null;
    let requestedPunchOut = null;

    try {
      if (form.requested_punch_in) {
        requestedPunchIn = convertToUTC(form.date, form.requested_punch_in);
      }

      if (form.requested_punch_out) {
        requestedPunchOut = convertToUTC(form.date, form.requested_punch_out);
      }
    } catch (error) {
      setMessage('❌ Invalid date/time format.');
      return;
    }

    const payload = {
      correction_date: form.date,
      requested_punch_in: requestedPunchIn,
      requested_punch_out: requestedPunchOut,
      reason: form.reason,
      original_punch_in: null,
      original_punch_out: null
    };

    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE}/api/corrections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Submission failed');
      }

      setMessage('✅ Correction request submitted successfully!');
      setForm({
        date: '',
        requested_punch_in: '',
        requested_punch_out: '',
        reason: ''
      });
    } catch (err) {
      console.error('❌ Correction request error:', err);
      setMessage('❌ Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="correction-request">
      <h3>📝 Punch Correction Request</h3>

      <label>Date of Correction</label>
      <input
        type="date"
        name="date"
        value={form.date}
        onChange={handleChange}
        required
      />

      <label>Correct Punch In Time (optional)</label>
      <input
        type="time"
        name="requested_punch_in"
        value={form.requested_punch_in}
        onChange={handleChange}
      />

      <label>Correct Punch Out Time (optional)</label>
      <input
        type="time"
        name="requested_punch_out"
        value={form.requested_punch_out}
        onChange={handleChange}
      />

      <label>Reason for Correction</label>
      <textarea
        name="reason"
        placeholder="Explain the correction..."
        value={form.reason}
        onChange={handleChange}
        required
      />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Correction'}
      </button>

      {message && <p className="status-message">{message}</p>}
    </div>
  );
}

export default EmployeeCorrectionRequest;
