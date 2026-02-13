import React, { useState, useEffect } from 'react';
import { getAttendanceStats } from '../../services/adminService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AttendanceStats.css';

const AttendanceStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await getAttendanceStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading Stats...</div>;
    if (!stats) return <div>No stats available.</div>;

    return (
        <div className="stats-container">
            <div className="daily-stats">
                <h3>Today's Attendance</h3>
                <div className="stats-cards">
                    <div className="stat-card total">
                        <span className="label">Total Employees</span>
                        <span className="value">{stats.daily.total}</span>
                    </div>
                    <div className="stat-card present">
                        <span className="label">Present</span>
                        <span className="value">{stats.daily.present}</span>
                    </div>
                    <div className="stat-card absent">
                        <span className="label">Absent</span>
                        <span className="value">{stats.daily.absent}</span>
                    </div>
                </div>
            </div>

            <div className="monthly-stats mt-6">
                <h3>Monthly Attendance Trends (Hours Worked)</h3>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.monthly}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" label={{ value: 'Day', position: 'insideBottom', offset: -5 }} />
                            <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="totalHours" name="Total Hours Worked" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AttendanceStats;
