import React, { useState, useEffect } from 'react';
import { getAllEmployees } from '../../services/adminService';
import EmployeeCard from './EmployeeCard';
import CreateEmployeeModal from './CreateEmployeeModal';
import './EmployeeList.css';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Payroll State
  const [payrollStatus, setPayrollStatus] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadEmployees();
    loadPayrollStatus();
  }, [currentMonth, currentYear]); // Reload when month/year changes

  useEffect(() => {
    filterEmployees();
  }, [searchQuery, employees]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await getAllEmployees();
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPayrollStatus = async () => {
    try {
      // Dynamic import to avoid circular dependencies
      const { getPayrollStatus } = await import('../../services/adminService');
      const data = await getPayrollStatus(currentMonth, currentYear);

      // Convert array to map: { employeeId: payrollRecord }
      const statusMap = {};
      data.forEach(record => {
        statusMap[record.employee] = record;
      });
      setPayrollStatus(statusMap);
    } catch (err) {
      console.error("Failed to load payroll status", err);
    }
  };

  const filterEmployees = () => {
    if (!searchQuery.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = employees.filter(employee =>
      (employee.name && employee.name.toLowerCase().includes(query)) ||
      (employee.email && employee.email.toLowerCase().includes(query)) ||
      (employee.employeeId && employee.employeeId.toLowerCase().includes(query)) ||
      (employee.department && employee.department.toLowerCase().includes(query)) ||
      (employee.designation && employee.designation.toLowerCase().includes(query))
    );
    setFilteredEmployees(filtered);
  };

  const handleEmployeeCreated = () => {
    setShowModal(false);
    loadEmployees();
  };

  // Callback when a salary is paid
  const handleSalaryPaid = (employeeId, record) => {
    setPayrollStatus(prev => ({
      ...prev,
      [employeeId]: record
    }));
  };



  if (loading && employees.length === 0) {
    return (
      <div className="employee-list loading-container">
        <div className="loading-spinner">Loading employees...</div>
      </div>
    );
  }

  return (
    <div className="employee-list">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Employee Management</h1>
          <p className="employee-count">{filteredEmployees.length} employees found</p>
        </div>

        <div className="header-controls">
          {/* Search Input */}
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn-primary add-employee-btn"
            disabled={loading}
          >
            <span className="btn-icon">+</span>
            Add Employee
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="employee-grid">
        {filteredEmployees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No employees found</h3>
            {searchQuery ? (
              <p>No employees match your search query "{searchQuery}"</p>
            ) : (
              <>
                <p>Add your first employee to get started</p>
                <button onClick={() => setShowModal(true)} className="btn-primary empty-btn">
                  Add First Employee
                </button>
              </>
            )}
          </div>
        ) : (
          filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee._id}
              employee={employee}
              onUpdate={loadEmployees}
              payrollContext={{ month: currentMonth, year: currentYear }}
              payrollStatus={payrollStatus[employee._id]}
              onSalaryPaid={handleSalaryPaid}
            />
          ))
        )}
      </div>

      {showModal && (
        <CreateEmployeeModal
          onClose={() => setShowModal(false)}
          onSuccess={handleEmployeeCreated}
        />
      )}
    </div>
  );
};

export default EmployeeList;