import React, { useState, useEffect, useRef } from 'react';
import { getAllTasks, assignTask, getAllEmployees } from '../../services/adminService';
import { formatDate } from '../../utils/format';
import './TaskList.css';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: [], // Changed to array for multiple selection
    dueDate: '',
    role: ''
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for custom dropdown
  const dropdownRef = useRef(null); // Ref for closing dropdown on click outside

  const roles = [
    'Web Developer',
    'Application Developer',
    'Tester',
    'DevOps Engineer',
    'UI/UX Designer',
    'Data Analyst',
    'Backend Developer',
    'Frontend Developer',
    'Full Stack Developer',
    'QA Engineer',
    'Business Analyst',
    'Project Manager'
  ];
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, employeesData] = await Promise.all([
        getAllTasks(),
        getAllEmployees()
      ]);
      setTasks(tasksData);
      setEmployees(employeesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleMultiSelectChange = (employeeId) => {
    setFormData((prev) => {
      const isSelected = prev.assignedTo.includes(employeeId);
      if (isSelected) {
        return {
          ...prev,
          assignedTo: prev.assignedTo.filter((id) => id !== employeeId)
        };
      } else {
        return {
          ...prev,
          assignedTo: [...prev.assignedTo, employeeId]
        };
      }
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submission
    setError('');

    if (formData.assignedTo.length === 0) {
      setError('Please select at least one employee');
      return;
    }

    try {
      setIsSubmitting(true); // Start submission
      await assignTask({
        title: formData.title,
        description: formData.description,
        assignedTo: formData.assignedTo,
        dueDate: formData.dueDate || null,
        role: formData.role || null
      });
      setShowModal(false);
      setFormData({ title: '', description: '', assignedTo: [], dueDate: '', role: '' });
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false); // End submission
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#27ae60';
      case 'in-progress':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  };

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  return (
    <div className="task-list">
      <div className="page-header">
        <h1>Task Management</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          Assign Task
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tasks-container">
        {tasks.length === 0 ? (
          <p className="no-tasks">No tasks assigned yet.</p>
        ) : (
          <div className="table-wrapper">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Assigned To</th>
                  <th>Role</th>
                  <th>Assigned By</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id}>
                    <td>{task.title}</td>
                    <td>{task.description || '-'}</td>
                    <td>{task.assignedTo?.name || '-'}</td>
                    <td>{task.role || '-'}</td>
                    <td>{task.assignedBy?.name || '-'}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(task.status) }}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td>{task.dueDate ? formatDate(task.dueDate) : '-'}</td>
                    <td>{formatDate(task.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Assign New Task</h2>
            <form onSubmit={handleSubmit} className="task-modal-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-body">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Task title"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Task description"
                    rows="4"
                  />
                </div>
                <div className="form-group" ref={dropdownRef}>
                  <label>Assign To *</label>
                  <div
                    className="multi-select-container"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <div className="multi-select-trigger">
                      {formData.assignedTo.length > 0
                        ? `${formData.assignedTo.length} selected`
                        : 'Select employees'}
                    </div>
                    <div className={`multi-select-dropdown ${isDropdownOpen ? 'open' : ''}`}>
                      {employees.map((emp) => (
                        <div
                          key={emp._id}
                          className="checkbox-option"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMultiSelectChange(emp._id);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={formData.assignedTo.includes(emp._id)}
                            onChange={() => { }} // Handled by div click
                          />
                          <label>{emp.name} ({emp.email})</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="">Select role (optional)</option>
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;