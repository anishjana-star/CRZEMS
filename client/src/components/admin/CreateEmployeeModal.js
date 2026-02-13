
import React, { useState } from 'react';
import { createEmployee } from '../../services/adminService';
import './CreateEmployeeModal.css';

const CreateEmployeeModal = ({ onClose, onSuccess }) => {
  // Comprehensive list of all organization roles
  const allDesignations = [
    // Engineering
    "Intern",
    "Trainee",
    "Junior Software Engineer",
    "Software Engineer",
    "Senior Software Engineer",
    "Lead Software Engineer",
    "Staff Software Engineer",
    "Principal Engineer",
    "Engineering Manager",
    "Senior Engineering Manager",
    "Director of Engineering",
    "VP of Engineering",

    // Data
    "Junior Data Analyst",
    "Data Analyst",
    "Senior Data Analyst",
    "Lead Analyst",
    "Analytics Manager",
    "Principal Data Analyst",

    // Product
    "Associate Product Manager",
    "Product Manager",
    "Senior Product Manager",
    "Group Product Manager",
    "Director of Product",
    "VP of Product",

    // Design
    "Junior UI/UX Designer",
    "UI/UX Designer",
    "Senior UI/UX Designer",
    "Lead UI/UX Designer",
    "Design Manager",

    // HR
    "HR Intern",
    "HR Executive",
    "Senior HR Executive",
    "HR Generalist",
    "HR Manager",
    "Senior HR Manager",
    "Director of HR",

    // Marketing & Sales
    "Marketing Intern",
    "Marketing Associate",
    "Marketing Executive",
    "Senior Marketing Executive",
    "Marketing Manager",
    "Sales Intern",
    "Sales Executive",
    "Senior Sales Executive",
    "Sales Manager",
    "Regional Sales Manager"
  ].sort();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    salary: '',
    workHours: '',
    employeeType: 'Full Time',
    designation: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdEmployee, setCreatedEmployee] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await createEmployee({
        name: formData.name,
        email: formData.email,
        salary: formData.salary ? parseFloat(formData.salary) : 0,
        workHours: formData.workHours ? parseFloat(formData.workHours) : 8,
        employeeType: formData.employeeType,
        designation: formData.designation
      });
      setCreatedEmployee(result.employee);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (createdEmployee) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>Employee Created Successfully!</h2>
          <div className="employee-credentials">
            <p><strong>Name:</strong> {createdEmployee.name}</p>
            <p><strong>Email:</strong> {createdEmployee.email}</p>
            <p><strong>Password:</strong> <span className="password-display">{createdEmployee.password}</span></p>
            <p className="warning">⚠️ Please save this password. It won't be shown again!</p>
          </div>
          <div className="modal-actions">
            <button onClick={onSuccess} className="btn-primary">Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Create New Employee</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-body">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Employee name"
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="employee@example.com"
              />
            </div>
            <div className="form-group">
              <label>Salary</label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Work Hours (per day)</label>
              <input
                type="number"
                name="workHours"
                value={formData.workHours}
                onChange={handleChange}
                placeholder="8"
                min="0"
                max="24"
                step="0.5"
              />
            </div>
            <div className="form-group">
              <label>Employee Type</label>
              <select
                name="employeeType"
                value={formData.employeeType}
                onChange={handleChange}
              >
                <option value="Full Time">Full Time</option>
                <option value="Intern">Intern</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div className="form-group">
              <label>Designation *</label>
              <select
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select Designation</option>
                {allDesignations.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating...' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEmployeeModal;