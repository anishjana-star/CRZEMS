import React from 'react';
import { Link } from 'react-router-dom';
import AttendanceStats from '../../components/admin/AttendanceStats';
import './AdminDashboard.css';

const AdminDashboard = () => {
    return (
        <div className="admin-dashboard">
            <h1 className="dashboard-title">Admin Dashboard</h1>

            <div className="dashboard-grid">
                {/* Stats Section */}
                <div className="stats-section">
                    <AttendanceStats />
                </div>

                {/* Quick Actions */}
                <div className="quick-actions-section">
                    <h2>Quick Actions</h2>
                    <div className="actions-grid">
                        <Link to="/admin/employees" className="action-card">
                            <span className="action-icon">👥</span>
                            <div className="action-text">
                                <span className="action-label">Manage Employees</span>
                                <span className="action-desc">Add, edit, or promote staff</span>
                            </div>
                        </Link>
                        <Link to="/admin/leaves" className="action-card">
                            <span className="action-icon">📅</span>
                            <div className="action-text">
                                <span className="action-label">Leave Requests</span>
                                <span className="action-desc">Approve or decline leaves</span>
                            </div>
                        </Link>
                        <Link to="/admin/tasks" className="action-card">
                            <span className="action-icon">✅</span>
                            <div className="action-text">
                                <span className="action-label">Task Management</span>
                                <span className="action-desc">Assign and track tasks</span>
                            </div>
                        </Link>
                        <Link to="/me/change-password" className="action-card">
                            <span className="action-icon">🔐</span>
                            <div className="action-text">
                                <span className="action-label">Change Password</span>
                                <span className="action-desc">Update your security</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
