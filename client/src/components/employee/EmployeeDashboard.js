import React, { useState, useEffect } from 'react';
import { getDashboard, recordLoginTime, recordLogoutTime, getTimeEntries } from '../../services/employeeService';
import { formatCurrency, formatHours } from '../../utils/format';
import { formatDate } from '../../utils/format';
import TimeGraph from '../common/TimeGraph';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clocking, setClocking] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);

  // Graph state
  const [graphEntries, setGraphEntries] = useState([]);
  const [graphRange, setGraphRange] = useState({ start: new Date(), end: new Date() });

  useEffect(() => {
    loadDashboard();
    loadGraphData();
  }, []);

  const calculateDateRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return { start, end };
  };

  const loadGraphData = async () => {
    try {
      const { start, end } = calculateDateRange();
      setGraphRange({ start, end });
      const entries = await getTimeEntries(null, null, start.toISOString(), end.toISOString());
      setGraphEntries(entries);
    } catch (err) {
      console.error('Failed to load graph data:', err);
    }
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await getDashboard();
      setDashboardData(data);
      // derive clock status from API (activeEntry)
      if (data && data.activeEntry && !data.activeEntry.logoutTime) {
        setIsClockedIn(true);
      } else {
        setIsClockedIn(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      setClocking(true);
      setError('');
      await recordLoginTime();
      setIsClockedIn(true);
      loadDashboard();
      loadGraphData();
    } catch (err) {
      setError(err.message);
    } finally {
      setClocking(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setClocking(true);
      setError('');
      await recordLogoutTime();
      setIsClockedIn(false);
      loadDashboard();
      loadGraphData();
    } catch (err) {
      setError(err.message);
    } finally {
      setClocking(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!dashboardData) {
    return <div className="error-message">Failed to load dashboard data</div>;
  }

  const { employee, monthlyStats, tasks } = dashboardData;

  return (
    <div className="employee-dashboard">
      <h1>Employee Dashboard</h1>

      {error && <div className="error-message">{error}</div>}

      {/* TOP ROW - 3 EQUAL COLUMNS: Personal | Time | Stats */}
      <div className="top-row">
        {/* Personal Information */}
        <div className="dashboard-card info-card">
          <h2>Personal Information</h2>
          <div className="info-item">
            <span className="info-label">Name:</span>
            <span className="info-value">{employee.name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Email:</span>
            <span className="info-value">{employee.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Salary:</span>
            <span className="info-value">{formatCurrency(employee.salary)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Work Hours/Day:</span>
            <span className="info-value">{employee.workHours} hrs</span>
          </div>
        </div>

        {/* Time Tracking */}
        <div className="dashboard-card clock-card">
          <h2>Time Tracking</h2>
          <iframe
            src="https://free.timeanddate.com/clock/ia9v6q4x/n54/szw110/szh110/hoc09f/hbw0/hfc09f/cf100/hnce1ead6/fas30/fdi66/mqc000/mql15/mqw4/mqd98/mhc000/mhl15/mhw4/mhd98/mmc000/mml10/mmw1/mmd98/hhs2/hms2/hsv0"
            frameBorder="0"
            width="110"
            height="110"
          />
          <div className="clock-status">
            {isClockedIn ? (
              <div className="clocked-in">
                <p className="status-text">You are currently clocked in</p>
                <button
                  onClick={handleClockOut}
                  disabled={clocking}
                  className="btn-clock-out"
                >
                  {clocking ? 'Clocking out...' : 'Clock Out'}
                </button>
              </div>
            ) : (
              <div className="clocked-out">
                <p className="status-text">You are currently clocked out</p>
                <button
                  onClick={handleClockIn}
                  disabled={clocking}
                  className="btn-clock-in"
                >
                  {clocking ? 'Clocking in...' : 'Clock In'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Statistics */}
        <div className="dashboard-card stats-card">
          <h2>Monthly Statistics</h2>
          <div className="stat-item">
            <span className="stat-label">Total Hours Worked:</span>
            <span className="stat-value">{formatHours(monthlyStats.totalHours)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Days Worked:</span>
            <span className="stat-value">{monthlyStats.daysWorked} days</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Month:</span>
            <span className="stat-value">
              {new Date(monthlyStats.currentYear, monthlyStats.currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW - Full Width Tasks */}
      <div className="bottom-row">
        <div className="dashboard-card tasks-card">
          <h2>Recent Tasks</h2>
          {tasks && tasks.length > 0 ? (
            <ul className="tasks-list">
              {tasks.slice(0, 5).map((task) => (
                <li key={task._id} className="task-item">
                  <div className="task-title">{task.title}</div>
                  <div className="task-meta">
                    <span className={`task-status status-${task.status}`}>
                      {task.status}
                    </span>
                    {task.dueDate && (
                      <span className="task-due">
                        Due: {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-tasks">No tasks assigned</p>
          )}
        </div>
      </div>

      {/* Time Graph Section */}
      <TimeGraph
        entries={graphEntries}
        startDate={graphRange.start}
        endDate={graphRange.end}
      />
    </div>
  );
};

export default EmployeeDashboard;
