// LeavesAdmin.js - Pure Logic & Architecture
import React, { useEffect, useState, useMemo } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar as CalendarIcon,
  User,
  ChevronRight,
  Loader2,
  Inbox
} from 'lucide-react';
import { getAllLeaves, decideLeave } from '../../services/leaveService';
import BeautifulCalendar from '../../components/common/BeautifulCalendar';
import './LeavesAdmin.css';

const LeavesAdmin = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, declined
  const [processingId, setProcessingId] = useState(null);


  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllLeaves();
      setLeaves(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const decide = async (id, status) => {
    setProcessingId(id);
    try {
      await decideLeave(id, status);
      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredLeaves = useMemo(() => {
    if (activeTab === 'all') return leaves;
    return leaves.filter(l => l.status === activeTab);
  }, [leaves, activeTab]);

  const StatusBadge = ({ status }) => {
    const styles = {
      pending: "ems-status-pending",
      approved: "ems-status-approved",
      declined: "ems-status-declined"
    };
    return (
      <span className={`ems-status-badge ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="ems-admin-page">
      <div className="ems-admin-container">

        {/* Header Section */}
        <div className="ems-header-section">
          <div>
            <h1 className="ems-page-title">Leave Requests</h1>
            <p className="ems-page-subtitle">Review and manage employee absence applications.</p>
          </div>



          {/* Tab Navigation */}
          <div className="ems-tab-nav">
            {['pending', 'approved', 'declined'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`ems-tab-btn ${activeTab === tab ? 'ems-tab-active' : 'ems-tab-inactive'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content Layout */}
        <div className="ems-content-layout">
          {/* Left Sidebar: Calendar */}
          <div className="ems-calendar-sidebar">
            <BeautifulCalendar />
          </div>

          {/* Right Content: Leaves List */}
          <div className="ems-leaves-list">
            {loading ? (
              <div className="ems-loading-state">
                <Loader2 />
                <p>Fetching requests...</p>
              </div>
            ) : filteredLeaves.length > 0 ? (
              <div className="ems-leaves-grid">
                {filteredLeaves.map((l) => (
                  <div key={l._id} className="ems-leave-card">
                    <div className="ems-card-content">

                      {/* Employee & Date Info */}
                      <div className="ems-employee-info">
                        <div className="ems-avatar">
                          <User />
                        </div>
                        <div>
                          <div className="ems-employee-header">
                            <h3 className="ems-employee-name">{l.employee?.name}</h3>
                            <StatusBadge status={l.status} />
                          </div>
                          <p className="ems-employee-email">{l.employee?.email}</p>

                          <div className="ems-date-info">
                            <div className="ems-date-range">
                              <CalendarIcon />
                              <span>{new Date(l.startDate).toLocaleDateString()} — {new Date(l.endDate).toLocaleDateString()}</span>
                            </div>
                            <div className="ems-applied-date">
                              <Clock />
                              <span>Applied {new Date(l.appliedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Reason Section */}
                      <div className="ems-reason-section">
                        <p className="ems-reason-text">
                          "{l.reason || 'No reason provided.'}"
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="ems-actions">
                        {l.status === 'pending' ? (
                          <>
                            <button
                              disabled={processingId === l._id}
                              onClick={() => decide(l._id, 'declined')}
                              className="ems-decline-btn"
                            >
                              <XCircle /> Decline
                            </button>
                            <button
                              disabled={processingId === l._id}
                              onClick={() => decide(l._id, 'approved')}
                              className="ems-approve-btn"
                            >
                              {processingId === l._id ? (
                                <Loader2 />
                              ) : (
                                <CheckCircle />
                              )}
                              Approve
                            </button>
                          </>
                        ) : (
                          <div className="ems-processed-state">
                            Processed <ChevronRight />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ems-empty-state">
                <div className="ems-empty-icon">
                  <Inbox />
                </div>
                <h3>No {activeTab} requests</h3>
                <p>Everything is up to date in this category.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeavesAdmin;