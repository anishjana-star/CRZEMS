import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getEmployeeById, getPayrollStatus } from '../../services/adminService';
import logo from '../../logo.svg';
import './SalarySlipPrint.css';

const SalarySlipPrint = () => {
    const { employeeId, month, year } = useParams();
    const location = useLocation();
    const [employee, setEmployee] = useState(null);
    const [payroll, setPayroll] = useState(null);
    const [loading, setLoading] = useState(true);

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    useEffect(() => {
        const loadData = async () => {
            try {
                const emp = await getEmployeeById(employeeId);
                const payrolls = await getPayrollStatus(month, year);
                const record = payrolls.find(p => p.employee === employeeId);

                setEmployee(emp);
                setPayroll(record);
            } catch (err) {
                console.error("Failed to load slip data", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [employeeId, month, year]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const isPreview = queryParams.get('preview') === 'true';

        if (!loading && employee && payroll && !isPreview) {
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [loading, employee, payroll, location.search]);

    if (loading) return <div>Loading slip...</div>;
    if (!employee || !payroll) return <div>Data not found</div>;

    const convertNumberToWords = (amount) => {
        return "Rupees " + amount.toLocaleString() + " Only";
    };

    return (
        <div className="salary-slip-container">

            {/* Top Header: Logo & Company Name */}
            <div className="company-header-top">
                <div className="header-logo-container">
                    <img src={logo} alt="Company Logo" className="company-logo" />
                    <h1 className="company-name">
                        CRZ Academic Review Pvt Ltd
                    </h1>
                </div>
            </div>

            {/* Info Strip: GSTIN & Payslip Box */}
            <div className="slip-header-info">
                {/* Left: GSTIN & CIN */}
                <div className="header-left">
                    <div>GSTIN:--------</div>
                    <div>CIN: -----------</div>
                </div>

                {/* Right: Payslip Box */}
                <div className="header-right">
                    <div className="payslip-box">
                        Payslip for {monthNames[payroll.month - 1]} {payroll.year}
                    </div>
                </div>
            </div>

            <hr className="separator-line" />

            {/* Employee Details */}
            <div className="employee-details-grid">
                <div className="detail-row">
                    <span className="label-bold">Employee Name:</span>
                    <span>{employee.name}</span>
                </div>
                <div className="detail-row">
                    <span className="label-bold">Employee ID:</span>
                    <span>{employee._id.substring(0, 8).toUpperCase()}</span>
                </div>
                <div className="detail-row">
                    <span className="label-bold">Designation:</span>
                    <span>{employee.designation || 'N/A'}</span>
                </div>
                <div className="detail-row">
                    <span className="label-bold">Employee Type:</span>
                    <span>{employee.employeeType || 'Full Time'}</span>
                </div>
                <div className="detail-row">
                    <span className="label-bold">Payment Date:</span>
                    <span>{new Date(payroll.paidAt).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                    <span className="label-bold">Bank Account:</span>
                    <span>XXXX-XXXX-XXXX</span>
                </div>
            </div>

            {/* Salary Breakdown Table */}
            <div className="salary-table-container">
                <table className="salary-table">
                    <thead>
                        <tr>
                            <th className="text-left" style={{ width: '35%' }}>Earnings</th>
                            <th className="text-right" style={{ width: '15%' }}>Amount</th>
                            <th className="text-left" style={{ width: '35%' }}>Deductions</th>
                            <th className="text-right" style={{ width: '15%' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Basic Salary</td>
                            <td className="text-right">₹{payroll.basicSalary.toLocaleString()}</td>
                            <td>Tax / Provident Fund</td>
                            <td className="text-right">₹{payroll.deductions.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td>Allowances (HRA, etc.)</td>
                            <td className="text-right">₹{payroll.allowances.toLocaleString()}</td>
                            <td>Other Deductions</td>
                            <td className="text-right">₹0</td>
                        </tr>
                        {/* Spacer Rows to maintain height if needed */}
                        <tr>
                            <td>&nbsp;</td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr className="total-row">
                            <td>Total Earnings</td>
                            <td className="text-right">₹{(payroll.basicSalary + payroll.allowances).toLocaleString()}</td>
                            <td>Total Deductions</td>
                            <td className="text-right">₹{payroll.deductions.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Footer Section: Net Pay & Signatures */}
            <div className="footer-section">

                {/* Director Signature Section */}
                <div className="director-sign-box">
                    {/* Stamp */}
                    <div className="stamp-container">
                        {/* Placeholder for Stamp */}
                        <div className="stamp-placeholder">
                            CollegeReviewZ<br />Stamp
                        </div>
                    </div>

                    {/* Signature Image Placeholder */}
                    <div className="signature-space">
                        <div style={{ fontFamily: 'Cursive, serif', fontSize: '20px', color: '#000' }}>Krishna Kant Jha</div>
                    </div>

                    <div className="director-name">
                        Krishna Kant Jha
                    </div>
                    <div className="director-title">
                        Managing Director
                    </div>
                </div>

                {/* Net Pay Box */}
                <div className="net-pay-box">
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Net Salary Payable:</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6' }}>₹{payroll.netSalary.toLocaleString()}</div>
                    <div style={{ fontSize: '14px', fontStyle: 'italic', marginTop: '5px' }}>(In words: {convertNumberToWords(payroll.netSalary)})</div>
                </div>
            </div>
        </div>
    );
};

export default SalarySlipPrint;
