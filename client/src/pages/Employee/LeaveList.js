// LeaveList.js - Pure Logic & Architecture (Unchanged)
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  UserCheck,
  ArrowRight,
  Inbox
} from 'lucide-react';
import { getMyLeaves } from '../../services/leaveService';
import './LeaveList.css';

const LeaveList = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getMyLeaves();
        setLeaves(data);
      } catch (err) {
        console.error("Failed to fetch leaves", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getStatusStyles = (status) => {
    switch (status) {
      case 'approved':
        return {
          bg: 'ems-status-approved',
          text: 'ems-text-approved',
          border: 'ems-border-approved',
          icon: <CheckCircle2 size={14} />
        };
      case 'declined':
        return {
          bg: 'ems-status-declined',
          text: 'ems-text-declined',
          border: 'ems-border-declined',
          icon: <XCircle size={14} />
        };
      default:
        return {
          bg: 'ems-status-pending',
          text: 'ems-text-pending',
          border: 'ems-border-pending',
          icon: <Clock size={14} />
        };
    }
  };

  return (
    <div className="ems-page-container">
      <div className="ems-max-width">

        {/* Header */}
        <div className="ems-header-section">
          <div>
            <h1 className="ems-page-title">My Leaves</h1>
            <p className="ems-page-subtitle">History and status of your time-off requests.</p>
          </div>
          <Link
            to="/employee/leaves/apply"
            className="ems-primary-btn ems-apply-btn"
          >
            <Plus size={20} />
            Apply for Leave
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="ems-loading-skeleton">
            {[1, 2, 3].map((n) => (
              <div key={n} className="ems-skeleton-card" />
            ))}
          </div>
        ) : leaves.length === 0 ? (
          <div className="ems-empty-state">
            <div className="ems-empty-icon">
              <Inbox size={40} />
            </div>
            <h2 className="ems-empty-title">No leave requests yet</h2>
            <p className="ems-empty-subtitle">
              When you apply for time off, your requests and their approval status will appear here.
            </p>
            <Link
              to="/employee/leaves/apply"
              className="ems-secondary-btn ems-start-btn"
            >
              Start First Request <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="ems-leaves-grid">
            {leaves.map((l) => {
              const status = getStatusStyles(l.status);
              return (
                <div key={l._id} className="ems-leave-card">
                  <div className="ems-leave-content">

                    {/* Left: Info */}
                    <div className="ems-leave-info">
                      <div className="ems-leave-dates">
                        <div className="ems-date-icon">
                          <CalendarDays size={20} />
                        </div>
                        <span className="ems-date-range">
                          {new Date(l.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          <span className="ems-date-separator">—</span>
                          {new Date(l.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      {l.reason && (
                        <p className="ems-leave-reason">
                          "{l.reason}"
                        </p>
                      )}
                    </div>

                    {/* Right: Status & Metadata */}
                    <div className="ems-leave-status-section">
                      <div className={`ems-status-badge ${status.bg} ${status.text} ${status.border}`}>
                        {status.icon}
                        {l.status}
                      </div>

                      <div className="ems-leave-metadata">
                        <div className="ems-applied-date">
                          <HelpCircle size={12} />
                          Applied {new Date(l.appliedAt).toLocaleDateString()}
                        </div>

                        {l.decidedBy && (
                          <div className="ems-reviewed-by">
                            <UserCheck size={12} />
                            Reviewed by {l.decidedBy.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Re-apply Action for Declined Leaves */}
                  {l.status === 'declined' && (
                    <div className="ems-reapply-section">
                      <Link
                        to="/employee/leaves/apply"
                        className="ems-reapply-link"
                      >
                        Modify & Re-apply <ArrowRight size={14} />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Info */}
        <div className="ems-help-section">
          <div className="ems-help-icon">
            <HelpCircle size={18} />
          </div>
          <div>
            <h4 className="ems-help-title">Need help?</h4>
            <p className="ems-help-text">
              If your request is pending for more than 48 hours, please contact HR or your direct manager for a manual review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveList;
