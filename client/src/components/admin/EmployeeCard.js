import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateEmployeeSalary, updateEmployeeWorkHours } from '../../services/adminService';
import { showToast, showError } from '../../utils/sweetAlert';
import { formatCurrency } from '../../utils/format';
import './EmployeeCard.css';

const EmployeeCard = ({ employee, onUpdate }) => {
  const navigate = useNavigate();
  const [salary, setSalary] = useState(employee.salary);
  const [workHours, setWorkHours] = useState(employee.workHours);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (field) => {
    try {
      setLoading(true);

      if (field === 'salary') {
        await updateEmployeeSalary(employee._id, salary);
      } else if (field === 'workHours') {
        await updateEmployeeWorkHours(employee._id, workHours);
      }

      onUpdate(); // Refresh list
      showToast(`${field === 'salary' ? 'Salary' : 'Work Hours'} updated successfully!`);
    } catch (error) {
      showError('Update Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-card-new">
      <div className="card-header-new">
        <h3>{employee.name}</h3>
        <p className="employee-email">{employee.email}</p>
        {employee.status === 'terminated' && (
          <span className="status-badge terminated">Terminated</span>
        )}
      </div>

      <div className="card-body-new">
        {/* Salary Section */}
        <div className="input-group">
          <label>Salary</label>
          <div className="input-row">
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              disabled={loading}
            />
            <button
              className="btn-update"
              onClick={() => handleUpdate('salary')}
              disabled={loading || salary == employee.salary}
            >
              Update
            </button>
          </div>
          <small className="current-val">Current: {formatCurrency(employee.salary)}</small>
        </div>

        {/* Work Hours Section */}
        <div className="input-group">
          <label>Work Hours (per day)</label>
          <div className="input-row">
            <input
              type="number"
              value={workHours}
              onChange={(e) => setWorkHours(e.target.value)}
              disabled={loading}
            />
            <button
              className="btn-update"
              onClick={() => handleUpdate('workHours')}
              disabled={loading || workHours == employee.workHours}
            >
              Update
            </button>
          </div>
          <small className="current-val">Current: {employee.workHours} hrs/day</small>
        </div>
      </div>

      <div className="card-footer-new">
        <button
          className="btn-manage"
          onClick={() => navigate(`/admin/employees/${employee._id}`)}
        >
          Manage Employee & View Details
        </button>
      </div>
    </div>
  );
};

export default EmployeeCard;
