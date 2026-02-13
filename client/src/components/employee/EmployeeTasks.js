import React, { useState, useEffect } from 'react';
import { getTasks, updateTaskStatus } from '../../services/employeeService';
import { formatDate } from '../../utils/format';
import Salary from './Salary'; // Import Salary component
import './EmployeeTasks.css';

const EmployeeTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('tasks'); // Default tab
  const [searchQuery, setSearchQuery] = useState(''); // Search State

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setError('');
      // Optimistic update
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );
      await updateTaskStatus(taskId, newStatus);
      loadTasks(); // Reload to ensure consistency
    } catch (err) {
      setError(err.message);
      loadTasks(); // Revert on error
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

  const renderTasks = () => {
    if (loading) {
      return <div className="loading">Loading tasks...</div>;
    }

    // Filter tasks based on search query
    const filteredTasks = tasks.filter(task => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        (task.title && task.title.toLowerCase().includes(query)) ||
        (task.description && task.description.toLowerCase().includes(query)) ||
        (task.role && task.role.toLowerCase().includes(query)) ||
        (task.status && task.status.toLowerCase().includes(query))
      );
    });

    if (filteredTasks.length === 0) {
      return (
        <div className="no-tasks">
          <p>{searchQuery ? `No tasks match "${searchQuery}"` : "No tasks assigned to you yet."}</p>
        </div>
      );
    }

    return (
      <div className="ems-tasks-scroll-container">
        <div className="tasks-container">
          {filteredTasks.map((task) => (
            <div key={task._id} className="task-card">
              <div className="task-header">
                <h3>{task.title}</h3>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(task.status) }}
                >
                  {task.status}
                </span>
              </div>

              {task.description && (
                <p className="task-description">{task.description}</p>
              )}

              <div className="task-meta">
                <div className="meta-item">
                  <span className="meta-label">Assigned by:</span>
                  <span className="meta-value">
                    {task.assignedBy?.name || 'Admin'}
                  </span>
                </div>
                {task.role && (
                  <div className="meta-item">
                    <span className="meta-label">Role:</span>
                    <span className="meta-value">{task.role}</span>
                  </div>
                )}
                {task.dueDate && (
                  <div className="meta-item">
                    <span className="meta-label">Due date:</span>
                    <span className="meta-value">{formatDate(task.dueDate)}</span>
                  </div>
                )}
                <div className="meta-item">
                  <span className="meta-label">Created:</span>
                  <span className="meta-value">{formatDate(task.createdAt)}</span>
                </div>
              </div>

              <div className="task-actions">
                <label>Update Status:</label>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="employee-tasks-page">
      <div className="page-header">
        <h1>{activeTab === 'tasks' ? 'My Tasks' : 'Salary & Career'}</h1>

        <div className="header-controls">
          {activeTab === 'tasks' && (
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          )}

          <div className="tabs-controls">
            <button
              className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('tasks')}
            >
              My Tasks
            </button>
            <button
              className={`tab-btn ${activeTab === 'salary' ? 'active' : ''}`}
              onClick={() => setActiveTab('salary')}
            >
              Salary & Career
            </button>
          </div>
        </div>
      </div>

      <div className="tab-content">
        {error && <div className="error-message">{error}</div>}

        {activeTab === 'tasks' ? renderTasks() : <Salary />}
      </div>
    </div>
  );
};

export default EmployeeTasks;
