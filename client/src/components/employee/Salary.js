import React, { useState, useEffect } from 'react';
import { getSalaryData, getPayslip } from '../../services/employeeService';
import { formatDate } from '../../utils/format';
import './Salary.css';

const Salary = () => {
    const [salaryData, setSalaryData] = useState({
        payslips: [],
        promotions: [],
        termination: null,
        currentSalary: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for manual check
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        loadSalaryData();
    }, []);

    const loadSalaryData = async () => {
        try {
            setLoading(true);
            const data = await getSalaryData();
            setSalaryData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = (month, year) => {
        const url = `/employee/salary/print/${month}/${year}`;

        // Remove existing print iframe if any
        const existingIframe = document.getElementById('print-iframe');
        if (existingIframe) {
            document.body.removeChild(existingIframe);
        }

        const iframe = document.createElement('iframe');
        iframe.id = 'print-iframe';
        iframe.style.position = 'absolute';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';
        iframe.src = url;

        document.body.appendChild(iframe);
    };

    const handleCheckPayslip = () => {
        handlePrint(selectedMonth, selectedYear);
    };

    const formatPayslipName = (payslip) => payslip.name || '';

    if (loading) {
        return <div className="loading">Loading salary information...</div>;
    }

    return (
        <div className="salary-section">
            {error && <div className="error-message">{error}</div>}

            {/* Current Salary Card */}
            {salaryData.currentSalary && (
                <div className="salary-overview-card">
                    <div className="salary-header">
                        <h2>Current Monthly Salary</h2>
                        <div className="salary-amount">
                            ₹{salaryData.currentSalary.amount?.toLocaleString()}
                        </div>
                    </div>
                    <div className="salary-meta">
                        <span className="meta-item">
                            Position: <strong>{salaryData.currentSalary.position}</strong>
                        </span>
                        <span className="meta-item">
                            Effective from: {formatDate(salaryData.currentSalary.effectiveDate)}
                        </span>
                    </div>
                </div>
            )}

            {/* Manual Payslip Check Section */}
            <div className="salary-section-card" style={{ marginBottom: '20px' }}>
                <div className="section-header">
                    <h3>View Past Payslip</h3>
                </div>
                <div className="check-payslip-controls" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        {[...Array(5)].map((_, i) => {
                            const year = new Date().getFullYear() - i;
                            return <option key={year} value={year}>{year}</option>;
                        })}
                    </select>

                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>
                                {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleCheckPayslip}
                        style={{
                            padding: '8px 16px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        View Payslip
                    </button>
                    {/* Error handling removed as we open in new tab now */}
                </div>
            </div>



            <div className="salary-grid">
                {/* Payslips Section */}
                <div className="salary-section-card">
                    <div className="section-header">
                        <h3>Payslips</h3>
                        {salaryData.payslips.length === 0 && (
                            <span className="no-data">No payslips generated yet</span>
                        )}
                    </div>

                    {salaryData.payslips.length > 0 ? (
                        <div className="payslips-list">
                            {salaryData.payslips.map((payslip) => (
                                <div key={payslip._id} className="payslip-item">
                                    <div className="payslip-info">
                                        <h4>{formatPayslipName(payslip)}</h4>
                                        <span className="payslip-date">{formatDate(payslip.month)}</span>
                                    </div>
                                    <button
                                        className="view-payslip-btn"
                                        onClick={() => handlePrint(new Date(payslip.month).getMonth() + 1, new Date(payslip.month).getFullYear())}
                                    >
                                        View Payslip
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-data-container">
                            <p>Your first payslip will appear here once generated by admin.</p>
                        </div>
                    )}
                </div>

                {/* Promotions Section */}
                <div className="salary-section-card">
                    <div className="section-header">
                        <h3>Promotions</h3>
                        {salaryData.promotions.length === 0 && (
                            <span className="no-data">No promotions yet</span>
                        )}
                    </div>

                    {salaryData.promotions.length > 0 ? (
                        <div className="promotions-list">
                            {salaryData.promotions.map((promotion) => (
                                <div key={promotion._id} className="promotion-item">
                                    <div className="promotion-details">
                                        <h4>{promotion.title}</h4>
                                        <div className="promotion-meta">
                                            <span>Date: {formatDate(promotion.date)}</span>
                                            <span>Salary: ₹{promotion.newSalary?.toLocaleString()}</span>
                                            {promotion.position && (
                                                <span>Position: {promotion.position}</span>
                                            )}
                                        </div>
                                        {promotion.reason && (
                                            <p className="promotion-reason">{promotion.reason}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-data-container">
                            <p>You'll see your promotion history here.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Termination Section */}
            {salaryData.termination && (
                <div className="termination-section">
                    <div className="section-header">
                        <h3>Employment Status</h3>
                    </div>
                    <div className="termination-card">
                        <div className="termination-icon">⚠️</div>
                        <div className="termination-details">
                            <h4>Terminated</h4>
                            <p className="termination-reason">
                                Reason: <strong>{salaryData.termination.reason}</strong>
                            </p>
                            <p className="termination-date">
                                Date: {formatDate(salaryData.termination.date)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Salary;
