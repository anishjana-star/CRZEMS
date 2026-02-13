import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployeeById, getPayrollStatus, paySalary, terminateEmployee, getEmployeeTimeEntries, promoteEmployee } from '../../services/adminService';
import { showConfirm, showSuccess, showError, showToast } from '../../utils/sweetAlert';
import { formatCurrency } from '../../utils/format';
import TimeGraph from '../../components/common/TimeGraph';
import SalarySlipModal from '../../components/admin/SalarySlipModal';
import PromotionModal from '../../components/admin/PromotionModal';
import './AdminEmployeeView.css';

const AdminEmployeeView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Payroll State
    const [payrollStatus, setPayrollStatus] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [showSlipModal, setShowSlipModal] = useState(false);
    const [paying, setPaying] = useState(false);

    // Graph State
    const [graphEntries, setGraphEntries] = useState([]);
    const [graphRange, setGraphRange] = useState({ start: new Date(), end: new Date() });

    // Actions State
    const [showTerminate, setShowTerminate] = useState(false);
    const [terminationReason, setTerminationReason] = useState('');
    const [showPromotionModal, setShowPromotionModal] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, currentMonth, currentYear]);

    const loadData = async () => {
        try {
            setLoading(true);
            // Load Employee
            const empData = await getEmployeeById(id);
            setEmployee(empData);

            // Load Payroll
            const payrollData = await getPayrollStatus(currentMonth, currentYear);
            // Filter for this employee
            const status = payrollData.find(p => p.employee === id);
            setPayrollStatus(status);

            // Load Graph (Mid month to mid month cycle)
            const { start, end } = calculateDateRange();
            setGraphRange({ start, end });
            const entries = await getEmployeeTimeEntries(id, null, null, start.toISOString(), end.toISOString());
            setGraphEntries(entries);

        } catch (err) {
            setError(err.message || 'Failed to load employee data');
        } finally {
            setLoading(false);
        }
    };

    const calculateDateRange = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        return { start, end };
    };

    const handlePaySalary = async () => {
        const confirmed = await showConfirm(
            'Confirm Pay Salary?',
            `Are you sure you want to pay salary for ${employee.name}?`,
            'question',
            'Yes, Pay Salary'
        );
        if (!confirmed) return;

        setPaying(true);
        try {
            await paySalary({
                employeeId: employee._id,
                month: currentMonth,
                year: currentYear,
                basicSalary: employee.salary,
                allowances: 0,
                deductions: 0
            });
            loadData(); // Reload to get status
            showSuccess('Payment Successful', 'Salary has been paid successfully!');
        } catch (err) {
            showError('Payment Failed', err.message);
        } finally {
            setPaying(false);
        }
    };

    const handleTerminate = async () => {
        if (!terminationReason.trim()) return showError('Error', 'Reason is required for termination');

        const confirmed = await showConfirm(
            'Terminate Employee?',
            'Are you sure you want to terminate this employee? This action cannot be undone easily.',
            'warning',
            'Yes, Terminate'
        );
        if (!confirmed) return;

        setUpdating(true);
        try {
            await terminateEmployee(employee._id, terminationReason);
            setShowTerminate(false);
            loadData();
            showSuccess('Terminated', 'Employee has been terminated successfully.');
        } catch (err) {
            showError('Termination Failed', err.message);
        } finally {
            setUpdating(false);
        }
    };

    const handlePromote = async (employeeId, designation) => {
        try {
            await promoteEmployee(employeeId, designation);
            setShowPromotionModal(false);
            loadData();
            showToast('Employee promoted successfully!', 'success');
        } catch (err) {
            showError('Promotion Failed', err.message);
        }
    };

    if (loading) return <div className="loading-state">Loading employee details...</div>;
    if (!employee) return <div className="error-state">Employee not found</div>;

    return (
        <div className="admin-employee-view">
            <div className="view-header">
                <button onClick={() => navigate('/admin/employees')} className="btn-back">
                    ← Back to List
                </button>
                <div className="header-content">
                    <h1>{employee.name}</h1>
                    <span className={`status-badge ${employee.status}`}>{employee.status}</span>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Card 1: Personal Info */}
                <div className="dashboard-card info-card">
                    <h2>Personal Information</h2>
                    <div className="info-list">
                        <div className="info-item">
                            <span className="label">Employee ID</span>
                            <span className="value">{employee._id.substring(0, 8).toUpperCase()}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Email</span>
                            <span className="value">{employee.email}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Designation</span>
                            <span className="value">{employee.designation || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Salary</span>
                            <span className="value">{formatCurrency(employee.salary)}</span>
                        </div>
                        {employee.status === 'terminated' && (
                            <div className="info-item error">
                                <span className="label">Terminated</span>
                                <span className="value">{employee.terminationReason}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Card 2: Actions & Payroll */}
                <div className="dashboard-card actions-card">
                    <h2>Actions & Payroll</h2>

                    <div className="month-selector">
                        <label>Pay Period</label>
                        <div className="month-inputs">
                            <select value={currentMonth} onChange={(e) => setCurrentMonth(parseInt(e.target.value))}>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'short' })}</option>
                                ))}
                            </select>
                            <select value={currentYear} onChange={(e) => setCurrentYear(parseInt(e.target.value))}>
                                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="action-buttons">
                        {payrollStatus ? (
                            <button className="btn-action btn-slip" onClick={() => setShowSlipModal(true)}>
                                📄 View Payslip
                            </button>
                        ) : (
                            <button
                                className="btn-action btn-pay"
                                onClick={handlePaySalary}
                                disabled={employee.status !== 'active' || paying}
                            >
                                💰 Pay Salary
                            </button>
                        )}

                        <button className="btn-action btn-promote" onClick={() => setShowPromotionModal(true)}>
                            ⭐ Promote
                        </button>

                        {employee.status === 'active' && (
                            <button className="btn-action btn-terminate" onClick={() => setShowTerminate(true)}>
                                ⚠️ Terminate
                            </button>
                        )}
                    </div>

                    {showTerminate && (
                        <div className="terminate-box">
                            <input
                                type="text"
                                placeholder="Enter termination reason..."
                                value={terminationReason}
                                onChange={(e) => setTerminationReason(e.target.value)}
                            />
                            <div className="t-actions">
                                <button onClick={handleTerminate} disabled={updating} className="btn-danger-sm">Confirm Terminate</button>
                                <button onClick={() => setShowTerminate(false)} className="btn-sec-sm">Cancel</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Card 3: Attendance Graph */}
                <div className="dashboard-card graph-card-large">
                    <h2>Attendance Overview</h2>
                    <TimeGraph
                        entries={graphEntries}
                        startDate={graphRange.start}
                        endDate={graphRange.end}
                    />
                </div>
            </div>

            {showSlipModal && payrollStatus && (
                <SalarySlipModal
                    employee={employee}
                    payroll={{
                        ...payrollStatus,
                        month: currentMonth,
                        year: currentYear
                    }}
                    onClose={() => setShowSlipModal(false)}
                />
            )}

            {showPromotionModal && (
                <PromotionModal
                    employee={employee}
                    onClose={() => setShowPromotionModal(false)}
                    onPromote={handlePromote}
                />
            )}
        </div>
    );
};

export default AdminEmployeeView;
