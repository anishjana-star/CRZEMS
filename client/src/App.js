import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import Layout from './components/common/Layout';
import Login from './components/auth/Login';
import EmployeeList from './components/admin/EmployeeList';
import TaskList from './components/admin/TaskList';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import EmployeeTasks from './components/employee/EmployeeTasks';
// Groups feature removed
import LeaveApply from './pages/Employee/LeaveApply';
import LeaveList from './pages/Employee/LeaveList';
import Meetings from './pages/Employee/Meetings';
import CreateMeetingEmployee from './pages/Employee/CreateMeeting';
import EmployeePayslipPrint from './pages/Employee/EmployeePayslipPrint';
import ChangePassword from './pages/Common/ChangePassword';

import LeavesAdmin from './pages/Admin/LeavesAdmin';
import MeetingsAdmin from './pages/Admin/MeetingsAdmin';
import CreateMeeting from './pages/Admin/CreateMeeting';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminEmployeeView from './pages/Admin/AdminEmployeeView';
import SalarySlipPrint from './pages/Admin/SalarySlipPrint';

import './App.css';

function App() {
  // Dev tools restriction removed as per user request

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute requiredRole="admin">
                <Layout>
                  <AdminDashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/employees"
            element={
              <PrivateRoute requiredRole="admin">
                <Layout>
                  <EmployeeList />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/employees/:id"
            element={
              <PrivateRoute requiredRole="admin">
                <Layout>
                  <AdminEmployeeView />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/leaves"
            element={
              <PrivateRoute requiredRole="admin">
                <Layout>
                  <LeavesAdmin />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/meetings"
            element={
              <PrivateRoute requiredRole="admin">
                <Layout>
                  <MeetingsAdmin />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/meetings/create"
            element={
              <PrivateRoute requiredRole="admin">
                <Layout>
                  <CreateMeeting />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/tasks"
            element={
              <PrivateRoute requiredRole="admin">
                <Layout>
                  <TaskList />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/dashboard"
            element={
              <PrivateRoute requiredRole="employee">
                <Layout>
                  <EmployeeDashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          {/* Groups routes removed */}
          <Route
            path="/employee/leaves/apply"
            element={
              <PrivateRoute requiredRole="employee">
                <Layout>
                  <LeaveApply />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/leaves"
            element={
              <PrivateRoute requiredRole="employee">
                <Layout>
                  <LeaveList />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/salary/print/:month/:year"
            element={
              <PrivateRoute requiredRole="employee">
                <EmployeePayslipPrint />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/meetings"
            element={
              <PrivateRoute requiredRole="employee">
                <Layout>
                  <Meetings />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/meetings/create"
            element={
              <PrivateRoute requiredRole="employee">
                <Layout>
                  <CreateMeetingEmployee />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/me/change-password"
            element={
              <PrivateRoute>
                <Layout>
                  <ChangePassword />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/tasks"
            element={
              <PrivateRoute requiredRole="employee">
                <Layout>
                  <EmployeeTasks />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/admin/print-slip/:employeeId/:month/:year"
            element={
              <PrivateRoute requiredRole="admin">
                <SalarySlipPrint />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
