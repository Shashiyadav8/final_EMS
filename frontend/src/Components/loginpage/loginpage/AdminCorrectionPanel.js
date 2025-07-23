// src/Components/AdminCorrectionPanel.js
import React, { useEffect, useState, useCallback } from 'react';
import './AdminDashboard.css';
import { authFetch } from './utils/authFetch';

function AdminCorrectionPanel() {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [modalData, setModalData] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await authFetch(`${process.env.REACT_APP_API_URL}/api/corrections`);
      if (!res || !res.ok) throw new Error('Failed to fetch corrections');
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error('❌ Failed to fetch corrections:', err);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const formatDateTime = (dt) => {
    if (!dt) return '-';
    const d = new Date(dt);
    return isNaN(d) ? '-' : d.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      hour12: true
    });
  };

  const formatDate = (d) => {
    if (!d) return '-';
    const dt = new Date(d);
    return isNaN(dt) ? '-' : dt.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const openModal = (req, actionType) => {
    setModalData({ ...req, actionType });
  };

  const handleModalSubmit = async () => {
    const { id, actionType, admin_comment } = modalData;
    try {
      const res = await authFetch(`${process.env.REACT_APP_API_URL}/api/corrections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: actionType, admin_comment })
      });
      if (!res || !res.ok) throw new Error('Update failed');
      setModalData(null);
      fetchRequests();
    } catch (err) {
      console.error('❌ Failed to update correction:', err);
      alert('Update failed');
    }
  };

  const filteredRequests = requests.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) && (!filter || r.status === filter)
  );

  return (
    <div className="correction-panel">
      <h3>🛠️ Correction Requests</h3>

      <div className="correction-filters">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Original</th>
            <th>Requested</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredRequests.map(r => (
            <tr key={r.id}>
              <td data-label="User">{r.name}</td>
              <td data-label="Original">
                {formatDateTime(r.original_punch_in)} / {formatDateTime(r.original_punch_out)}
              </td>
              <td data-label="Requested">
                {formatDateTime(r.requested_punch_in)} / {formatDateTime(r.requested_punch_out)}
              </td>
              <td data-label="Reason">{r.reason}</td>
              <td data-label="Status">{r.status}</td>
              <td data-label="Action">
                {r.status === 'pending' ? (
                  <>
                    <button className="approve-btn" onClick={() => openModal(r, 'approved')}>✅</button>
                    <button className="reject-btn" onClick={() => openModal(r, 'rejected')}>❌</button>
                  </>
                ) : (
                  '-'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalData && (
        <div className="correction-modal-overlay">
          <div className="correction-modal">
            <h4>{modalData.actionType === 'approved' ? 'Approve' : 'Reject'} Correction</h4>
            <p><strong>User:</strong> {modalData.name}</p>
            <p><strong>Correction Date:</strong> {formatDate(modalData.correction_date)}</p>
            <p><strong>Original:</strong> {formatDateTime(modalData.original_punch_in)} / {formatDateTime(modalData.original_punch_out)}</p>
            <p><strong>Requested:</strong> {formatDateTime(modalData.requested_punch_in)} / {formatDateTime(modalData.requested_punch_out)}</p>
            <p><strong>Reason:</strong> {modalData.reason}</p>

            <textarea
              rows={4}
              placeholder="Admin comment..."
              value={modalData.admin_comment}
              onChange={e => setModalData({ ...modalData, admin_comment: e.target.value })}
            />

            <div className="modal-buttons">
              <button className="submit-btn" onClick={handleModalSubmit}>
                {modalData.actionType === 'approved' ? 'Confirm Approve' : 'Confirm Reject'}
              </button>
              <button className="cancel-btn" onClick={() => setModalData(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCorrectionPanel;
