import apiRequest from './api';

/**
 * Record login time (clock in)
 */
export const recordLoginTime = async () => {
  return await apiRequest('/employee/login-time', {
    method: 'POST',
  });
};

/**
 * Record logout time (clock out)
 */
export const recordLogoutTime = async () => {
  return await apiRequest('/employee/logout-time', {
    method: 'POST',
  });
};

/**
 * Get employee dashboard data
 */
export const getDashboard = async () => {
  return await apiRequest('/employee/dashboard');
};

/**
 * Get employee tasks
 */
export const getTasks = async () => {
  return await apiRequest('/employee/tasks');
};

/**
 * Update task status
 */
export const updateTaskStatus = async (taskId, status) => {
  return await apiRequest(`/employee/tasks/${taskId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

/**
 * Get time entries
 */
export const getTimeEntries = async (month, year, startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate && endDate) {
    params.append('startDate', startDate);
    params.append('endDate', endDate);
  } else {
    if (month) params.append('month', month);
    if (year) params.append('year', year);
  }

  return await apiRequest(`/employee/time-entries?${params.toString()}`);
};

/**
 * Get salary data
 */
export const getSalaryData = async () => {
  return await apiRequest('/employee/salary');
};

/**
 * Get specific payslip
 */
export const getPayslip = async (month, year) => {
  return await apiRequest(`/employee/salary/${year}/${month}`);
};
