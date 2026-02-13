import React from 'react';
import { X, Printer } from 'lucide-react';
// import { useReactToPrint } from 'react-to-print';
import './SalarySlipModal.css';

const SalarySlipModal = ({ employee, payroll, onClose }) => {
    const handlePrint = () => {
        // Open the dedicated print route in a new window/tab
        const url = `/admin/print-slip/${employee._id}/${payroll.month}/${payroll.year}`;
        window.open(url, '_blank');
    };

    return (
        <div className="salary-modal-overlay">
            <div className="salary-modal-content">
                <div className="salary-modal-header">
                    <h2>Salary Slip</h2>
                    <div className="header-actions">
                        <button onClick={handlePrint} className="print-btn" title="Print / Save as PDF">
                            <Printer size={20} /> Print
                        </button>
                        <button onClick={onClose} className="close-btn">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="salary-slip-preview">
                    <iframe
                        title="Salary Slip Preview"
                        src={`/admin/print-slip/${employee._id}/${payroll.month}/${payroll.year}?preview=true`}
                        className="preview-iframe"
                    />
                </div>
            </div>
        </div>
    );
};

export default SalarySlipModal;
