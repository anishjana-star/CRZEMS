import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getAllEmployees, getAttendanceStats } from '../../services/adminService';
import EmployeeCard from './EmployeeCard';
import CreateEmployeeModal from './CreateEmployeeModal';
import './EmployeeList.css';


const EmployeeList = () => {
  const location = useLocation();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // New State for Filtering
  const [attendanceData, setAttendanceData] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'present', 'absent'

  // Payroll State
  const [payrollStatus, setPayrollStatus] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // Check for navigation state filter
    if (location.state?.filter) {
      setActiveFilter(location.state.filter);
      // Clear state so refresh doesn't stick? Or keep it? keeping is fine.
    }
  }, [location.state]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadEmployees(), loadAttendanceData(), loadPayrollStatus()]);
      setLoading(false);
    };
    init();
  }, [currentMonth, currentYear]);

  // Re-run filter when these change
  useEffect(() => {
    filterEmployees();
  }, [searchQuery, employees, activeFilter, attendanceData]);

  const loadAttendanceData = async () => {
    try {
      const stats = await getAttendanceStats();
      setAttendanceData(stats);
    } catch (err) {
      console.error("Failed to load attendance stats", err);
    }
  };

  const loadEmployees = async () => {
    try {
      // setLoading(true); // Handled in init
      const data = await getAllEmployees();
      setEmployees(data);
      // setFilteredEmployees(data); // Handled in filterEmployees
    } catch (err) {
      setError(err.message);
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
    let result = [...employees];

    // 1. Apply Dashboard Filter (Present/Absent)
    if (activeFilter !== 'all' && attendanceData) {
      const presentIds = new Set(attendanceData.daily.presentEmployeeIds);

      if (activeFilter === 'present') {
        result = result.filter(emp => presentIds.has(emp._id));
      } else if (activeFilter === 'absent') {
        result = result.filter(emp => !presentIds.has(emp._id));

        // Sort by Highest Absences (Least Days Present)
        // Create a lookup for days present
        const daysPresentMap = {};
        if (attendanceData.employeeStats) {
          attendanceData.employeeStats.forEach(stat => {
            daysPresentMap[stat._id] = stat.daysPresent;
          });
        }

        // Sort ascending (0 days present = most absent)
        result.sort((a, b) => {
          const daysA = daysPresentMap[a._id] || 0;
          const daysB = daysPresentMap[b._id] || 0;
          return daysA - daysB;
        });
      }
    }

    // 2. Apply Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(employee =>
        (employee.name && employee.name.toLowerCase().includes(query)) ||
        (employee.email && employee.email.toLowerCase().includes(query)) ||
        (employee.employeeId && employee.employeeId.toLowerCase().includes(query)) ||
        (employee.department && employee.department.toLowerCase().includes(query)) ||
        (employee.designation && employee.designation.toLowerCase().includes(query))
      );
    }

    setFilteredEmployees(result);
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
          <div className="header-stats-row">
            <p className="employee-count">{filteredEmployees.length} employees found</p>
            {activeFilter !== 'all' && (
              <div className="active-filter-badge">
                <span>
                  Filtering by: <strong>{activeFilter === 'present' ? 'Present Today' : 'Absent Today'}</strong>
                </span>
                <button
                  className="btn-clear-filter"
                  onClick={() => setActiveFilter('all')}
                  title="Clear Filter"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
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