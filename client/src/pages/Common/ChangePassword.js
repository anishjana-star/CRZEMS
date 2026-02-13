// ChangePassword.js - Pure Logic & Architecture (100% Preserved)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, EyeOff, Loader2, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { changeMyPassword, updateMyEmail } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import './ChangePassword.css';

const InputField = ({ label, placeholder, value, setter, type = "password" }) => {
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="ems-input-group">
      <label className="ems-label">{label}</label>
      <div className="ems-input-wrapper">
        <div className="ems-input-icon">
          <Lock size={18} />
        </div>
        <input
          type={showPass ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={e => setter(e.target.value)}
          className="ems-input-field"
        />
        <button
          type="button"
          onClick={() => setShowPass(!showPass)}
          className="ems-toggle-btn"
        >
          {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
};

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const navigate = useNavigate();

  const submit = async () => {
    setMsg({ type: '', text: '' });

    if (!oldPassword || !newPassword) {
      return setMsg({ type: 'error', text: 'All fields are required' });
    }
    if (newPassword !== confirm) {
      return setMsg({ type: 'error', text: 'Passwords do not match' });
    }
    if (newPassword.length < 6) {
      return setMsg({ type: 'error', text: 'New password must be at least 6 characters' });
    }

    try {
      setIsSubmitting(true);
      await changeMyPassword(oldPassword, newPassword);
      setMsg({ type: 'success', text: 'Security updated! Redirecting to home...' });
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Verification failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ems-password-page">
      <div className={`ems-password-container ${user?.role === 'admin' ? 'ems-container-wide' : ''}`}>

        <div className="ems-back-btn-wrapper">
          <button className="ems-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>

        <div className="ems-security-grid">
          <div className="ems-password-card">
            {/* Header Banner */}
            <div className="ems-header-banner">
              <div className="ems-header-bg-icon">
                <ShieldCheck size={160} />
              </div>
              <div className="ems-header-content">
                <div className="ems-shield-badge">
                  <Lock size={32} />
                </div>
                <h2 className="ems-header-title">Security Update</h2>
                <p className="ems-header-subtitle">Keep your account safe and secure</p>
              </div>
            </div>

            <div className="ems-form-section">
              {/* Alert Messages */}
              {msg.text && (
                <div className={`ems-alert ems-alert-${msg.type}`}>
                  {msg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                  <span>{msg.text}</span>
                </div>
              )}

              <div className="ems-fields-container">
                <InputField
                  label="Current Password"
                  placeholder="••••••••"
                  value={oldPassword}
                  setter={setOldPassword}
                />

                <div className="ems-divider" />

                <InputField
                  label="New Password"
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  setter={setNewPassword}
                />
                <InputField
                  label="Confirm New Password"
                  placeholder="Repeat new password"
                  value={confirm}
                  setter={setConfirm}
                />
              </div>

              <div className="ems-submit-section">
                <button
                  onClick={submit}
                  disabled={isSubmitting}
                  className="ems-submit-btn"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : null}
                  {isSubmitting ? 'Updating Security...' : 'Update Password'}
                </button>
              </div>

              <p className="ems-footer-text">
                Logged in as {user?.role || 'user'}. Last change: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Change Email Section - Only for Admin */}
          <EmailUpdateSection />
        </div>

      </div>
    </div>
  );
};

const EmailUpdateSection = () => {
  const { user } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  if (!user || user.role !== 'admin') return null;

  const handleUpdateEmail = async () => {
    setMsg({ type: '', text: '' });
    if (!newEmail || !password) {
      return setMsg({ type: 'error', text: 'Email and password are required' });
    }

    try {
      setIsSubmitting(true);
      await updateMyEmail(newEmail, password);
      setMsg({ type: 'success', text: 'Email updated successfully!' });
      setNewEmail('');
      setPassword('');
    } catch (error) {
      setMsg({ type: 'error', text: error.message || 'Failed to update email' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ems-password-card">
      {/* Header Banner - Same Style as Upgrade */}
      <div className="ems-header-banner" style={{ background: 'linear-gradient(135deg, #4a90e2 0%, #003973 100%)' }}>
        <div className="ems-header-bg-icon">
          <ShieldCheck size={160} />
        </div>
        <div className="ems-header-content">
          <div className="ems-shield-badge">
            <ShieldCheck size={32} />
          </div>
          <h2 className="ems-header-title">Update Admin Email</h2>
          <p className="ems-header-subtitle">Securely update your contact email</p>
        </div>
      </div>

      <div className="ems-form-section">
        {/* Alert Messages */}
        {msg.text && (
          <div className={`ems-alert ems-alert-${msg.type}`}>
            {msg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{msg.text}</span>
          </div>
        )}

        <div className="ems-fields-container">
          <InputField
            label="New Email Address"
            placeholder="admin@example.com"
            value={newEmail}
            setter={setNewEmail}
            type="email"
          />
          <InputField
            label="Confirm with Password"
            placeholder="Current Password"
            value={password}
            setter={setPassword}
            type="password"
          />
        </div>
        <div className="ems-submit-section">
          <button
            onClick={handleUpdateEmail}
            disabled={isSubmitting}
            className="ems-submit-btn"
            style={{ backgroundColor: '#4a90e2' }}
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : null}
            {isSubmitting ? 'Updating Email...' : 'Update Email'}
          </button>
        </div>
        <p className="ems-footer-text">
          This action is restricted to Administrators only.
        </p>
      </div>
    </div>
  );
};

export default ChangePassword;
