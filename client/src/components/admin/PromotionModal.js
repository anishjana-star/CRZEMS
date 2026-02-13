import React, { useState, useEffect } from 'react';
import './PromotionModal.css';

const PromotionModal = ({ employee, onClose, onPromote }) => {
    const [designation, setDesignation] = useState(employee.designation || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 👈 NEW: Promotion paths based on current designation
    const getPromotionOptions = (currentDesignation) => {
        const lowerDesignation = currentDesignation.toLowerCase();

        if (lowerDesignation.includes('intern') || lowerDesignation.includes('trainee')) {
            return [
                'Junior ' + currentDesignation.replace(/Intern|Trainee/i, ''),
                currentDesignation.replace(/Intern|Trainee/i, ''),
                'Senior ' + currentDesignation.replace(/Intern|Trainee/i, ''),
                'Lead ' + currentDesignation.replace(/Intern|Trainee/i, '')
            ];
        }

        if (lowerDesignation.includes('software engineer') || lowerDesignation.includes('developer')) {
            return [
                'Software Engineer',
                'Senior Software Engineer',
                'Staff Software Engineer',
                'Principal Engineer'
            ];
        }

        if (lowerDesignation.includes('data analyst')) {
            return [
                'Junior Data Analyst',
                'Data Analyst',
                'Senior Data Analyst',
                'Lead Analyst'
            ];
        }

        if (lowerDesignation.includes('junior')) {
            return [
                currentDesignation.replace('Junior ', ''),
                'Senior ' + currentDesignation.replace('Junior ', ''),
                'Lead ' + currentDesignation.replace('Junior ', ''),
                'Principal ' + currentDesignation.replace('Junior ', '')
            ];
        }

        // Generic promotion path
        return [
            currentDesignation,
            'Senior ' + currentDesignation,
            'Lead ' + currentDesignation,
            'Principal ' + currentDesignation
        ];
    };

    // 👈 NEW: Set first promotion option automatically
    useEffect(() => {
        if (employee.designation && !designation) {
            const options = getPromotionOptions(employee.designation);
            setDesignation(options[0] || '');
        }
    }, [employee.designation]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!designation.trim()) {
            setError('Designation is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await onPromote(employee._id, designation);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to promote employee');
            setLoading(false);
        }
    };

    const promotionOptions = getPromotionOptions(employee.designation || '');

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Promote Employee</h2>
                <p className="mb-4">Promoting: <strong>{employee.name}</strong></p>

                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Current Designation</label>
                        <input
                            type="text"
                            value={employee.designation || 'N/A'}
                            disabled
                            className="bg-gray-100"
                        />
                    </div>

                    {/* 👈 CHANGED: Input → Select with auto-options */}
                    <div className="form-group">
                        <label>New Designation *</label>
                        <select
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            className="form-select"
                            required
                            autoFocus
                        >
                            {promotionOptions.map((option, index) => (
                                <option key={index} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Promoting...' : 'Promote'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PromotionModal;
