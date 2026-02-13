// LeaveApply.js - Pure Logic & Architecture
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  FileText,
  Send,
  ArrowLeft,
  Info,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CalendarDays
} from 'lucide-react';
import { applyLeave } from '../../services/leaveService';
import BeautifulCalendar from '../../components/common/BeautifulCalendar';
import './LeaveApply.css';

const LeaveApply = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  // Logic to calculate days for the UI
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 0;
  };

  const submit = async () => {
    setError(null);
    setMessage(null);

    if (!startDate || !endDate) {
      return setError('Please select both start and end dates');
    }
    if (new Date(startDate) > new Date(endDate)) {
      return setError('Start date cannot be later than end date');
    }

    try {
      setSubmitting(true);
      await applyLeave({ startDate, endDate, reason });
      setMessage('Your request has been submitted successfully!');

      // Reset form
      setStartDate(''); setEndDate(''); setReason('');

      setTimeout(() => navigate('/employee/leaves'), 1200);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ems-apply-page">
      <div className="ems-apply-container">

        {/* Navigation Header */}
        <div className="ems-nav-header">
          <button
            onClick={() => navigate(-1)}
            className="ems-back-btn"
          >
            <ArrowLeft size={18} /> Back to Leave History
          </button>
          <h1 className="ems-page-title">Request Time Off</h1>
          <p className="ems-page-subtitle">Submit your leave request for manager approval.</p>
        </div>

        {/* TOP SECTION: Information & Context */}
        <div className="ems-leaves-top-grid">

          {/* LEFT: Notes & Calendar */}
          <div className="ems-leaves-left-col">
            {/* CL Note */}
            <div className="cl-entitlement-note">
              <Info size={18} />
              <span>Note: You are entitled to <strong>1 Casual Leave (CL)</strong> per month.</span>
            </div>

            {/* Calendar */}
            <div className="ems-sidebar-calendar-card">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Holiday Calendar</h3>
              <BeautifulCalendar />
            </div>
          </div>

          {/* RIGHT: Summary & Tips */}
          <div className="ems-leaves-right-col">
            {/* Request Summary */}
            <div className="ems-summary-card">
              <CalendarDays />
              <h3>Request Summary</h3>
              <div className="ems-summary-content">
                <div className="ems-duration-row">
                  <span>Total Duration</span>
                  <span>{calculateDays()} Days</span>
                </div>
                <div className="ems-info-box">
                  <Info />
                  <p>
                    Your request will be sent to your immediate supervisor for approval. You'll receive a notification once a decision is made.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="ems-tips-card">
              <h4>
                <Info /> Quick Tips
              </h4>
              <ul className="ems-tips-list">
                <li>Apply at least 2 days in advance.</li>
                <li>Include a specific reason for faster approval.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Application Form */}
        <div className="ems-leaves-bottom-section">
          <div className="ems-form-card">

            <h2 className="ems-card-title">Apply Leave</h2>

            {/* Feedback States */}
            {message && (
              <div className="ems-success-msg">
                <CheckCircle2 size={20} />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="ems-error-msg">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <div className="ems-form-content">
              {/* Date Selection Row */}
              <div className="ems-date-row">
                <div className="ems-date-field">
                  <label className="ems-field-label ems-start-label">
                    <Calendar /> Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="ems-date-input"
                  />
                </div>

                <div className="ems-date-field">
                  <label className="ems-field-label ems-end-label">
                    <Calendar /> End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="ems-date-input"
                  />
                </div>
              </div>

              {/* Reason Field */}
              <div className="ems-reason-field">
                <label className="ems-field-label">
                  <FileText /> Reason for Leave
                </label>
                <textarea
                  rows={4}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Briefly describe the reason for your absence..."
                  className="ems-textarea"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={submit}
                disabled={submitting}
                className="ems-submit-btn"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Send size={20} />
                )}
                {submitting ? 'Processing Request...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LeaveApply;
