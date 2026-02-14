import React, { useState, useEffect } from 'react';
import './PromotionModal.css';

const PromotionModal = ({ employee, onClose, onPromote }) => {
    const [designation, setDesignation] = useState(employee.designation || '');
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 👈 NEW: Autocomplete State
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

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

    const promotionOptions = getPromotionOptions(employee.designation || '');

    // 👈 NEW: Handle Input Change
    const handleInputChange = (e) => {
        const val = e.target.value;
        setDesignation(val);

        if (val.trim()) {
            const filtered = promotionOptions.filter(opt =>
                opt.toLowerCase().includes(val.toLowerCase())
            );
            setFilteredOptions(filtered);
            setShowSuggestions(true);
        } else {
            setFilteredOptions(promotionOptions); // Show all if empty? Or hide? Let's show all relevant
            setShowSuggestions(true);
        }
    };

    const handleSuggestionClick = (val) => {
        setDesignation(val);
        setShowSuggestions(false);
    };

    // 👈 NEW: Set first promotion option automatically
    useEffect(() => {
        if (employee.designation && !designation) {
            const options = getPromotionOptions(employee.designation);
            setDesignation(options[0] || '');
            setFilteredOptions(options);
        } else if (!designation && promotionOptions.length > 0) {
            setFilteredOptions(promotionOptions);
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
            await onPromote(employee._id, designation, remarks);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to promote employee');
            setLoading(false);
        }
    };

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
                    <div className="form-group" style={{ position: 'relative' }}>
                        <label>New Designation *</label>
                        <input
                            type="text"
                            value={designation}
                            onChange={handleInputChange}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            className="form-control"
                            required
                            autoFocus
                            placeholder="Select or Type New Designation"
                            autoComplete="off"
                        />
                        {showSuggestions && filteredOptions.length > 0 && (
                            <ul className="suggestions-list">
                                {filteredOptions.map((option, index) => (
                                    <li key={index} onClick={() => handleSuggestionClick(option)}>
                                        {option}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Remarks / Promotion Message</label>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="form-control"
                            placeholder="Enter the promotion message to be displayed to the employee..."
                            rows="3"
                        />
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
