import React, { useState, useEffect } from 'react';
import { getEmployeeTimeEntries, getHolidays } from '../../services/adminService';
import './AttendanceModal.css';

const AttendanceModal = ({ employee, onClose }) => {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [attendanceData, setAttendanceData] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [month, year]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch Time Entries
            const entries = await getEmployeeTimeEntries(employee._id, month, year);

            // Fetch Holidays
            const holidayList = await getHolidays();
            setHolidays(holidayList);

            setAttendanceData(entries);
        } catch (error) {
            console.error("Failed to fetch attendance data", error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (m, y) => {
        return new Date(y, m, 0).getDate();
    };

    const generateCalendarRows = () => {
        const daysInMonth = getDaysInMonth(month, year);
        const rows = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            const dateString = date.toLocaleDateString(); // e.g., "M/D/YYYY" or depending on locale
            const dayOfWeek = date.getDay(); // 0 = Sunday

            // Format date for display YYYY-MM-DD for simpler comparison/display
            const displayDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            // Find entry for this day
            // entries usually have 'date' field. We need to match it.
            // API returns ISO strings usually.
            const entry = attendanceData.find(e => {
                const eDate = new Date(e.date);
                return eDate.getDate() === day && eDate.getMonth() === (month - 1) && eDate.getFullYear() === year;
            });

            // Check Holiday
            const holiday = holidays.find(h => {
                const hDate = new Date(h.date);
                return hDate.getDate() === day && hDate.getMonth() === (month - 1) && hDate.getFullYear() === year;
            });

            // Future Date Check
            const now = new Date();
            now.setHours(0, 0, 0, 0); // Normalize today
            const currentRowDate = new Date(year, month - 1, day);
            const isFuture = currentRowDate > now;

            // Determine Main Status Text (Time or Absent or Empty)
            // If entry exists -> Time
            // If future -> '-'
            // If Sunday/Holiday -> '' (Empty, unless we want to say "Off")
            // Else -> 'Absent' (Red)

            let timeInText = 'Absent';
            let timeOutText = 'Absent';
            let isAbsent = false;

            if (entry) {
                timeInText = formatTime(entry.loginTime);
                timeOutText = formatTime(entry.logoutTime);
            } else {
                if (isFuture) {
                    timeInText = '-';
                    timeOutText = '-';
                } else if (dayOfWeek === 0 || holiday) {
                    timeInText = ''; // Don't show Absent for Sunday/Holiday
                    timeOutText = '';
                } else {
                    isAbsent = true; // Mark as true absent to apply red style
                }
            }

            let rowContent = {
                date: displayDate,
                dayNum: day,
                isSunday: dayOfWeek === 0,
                isHoliday: !!holiday,
                holidayName: holiday ? holiday.name : '',
                clockIn: timeInText,
                clockOut: timeOutText,
                isAbsent: isAbsent,
                hasEntry: !!entry
            };

            rows.push(rowContent);
        }
        return rows;
    };

    const formatTime = (isoString) => {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const rows = generateCalendarRows();
    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

    return (
        <div className="attendance-modal-overlay">
            <div className="attendance-modal-content">
                <div className="attendance-modal-header">
                    <h2>Attendance for {employee.name}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="controls-section">
                    <div className="control-group">
                        <label>Month:</label>
                        <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                    </div>
                    <div className="control-group">
                        <label>Year:</label>
                        <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                <div className="attendance-table-container">
                    <table className="attendance-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Clock In</th>
                                <th>Clock Out</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                            ) : (
                                rows.map(row => {
                                    // Row Style
                                    let rowStyle = {};
                                    if (row.isSunday) rowStyle = { backgroundColor: '#fee2e2' }; // Light Red
                                    if (row.isHoliday) rowStyle = { backgroundColor: '#fef3c7' }; // Light Yellow

                                    return (
                                        <tr key={row.dayNum} style={rowStyle}>
                                            <td>{row.date}</td>
                                            <td>
                                                {/* Main Content */}
                                                {row.isAbsent ? (
                                                    <span className="status-absent" style={{ color: 'red', fontWeight: 'bold' }}>Absent</span>
                                                ) : (
                                                    <span className="time-val">{row.clockIn}</span>
                                                )}

                                                {/* Sub Label */}
                                                {row.isSunday && <div style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 'bold' }}>Sunday</div>}
                                                {row.isHoliday && <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 'bold' }}>National Holiday ({row.holidayName})</div>}
                                            </td>
                                            <td>
                                                {/* Main Content */}
                                                {row.isAbsent ? (
                                                    <span className="status-absent" style={{ color: 'red', fontWeight: 'bold' }}>Absent</span>
                                                ) : (
                                                    <span className="time-val">{row.clockOut}</span>
                                                )}

                                                {/* Sub Label */}
                                                {row.isSunday && <div style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 'bold' }}>Sunday</div>}
                                                {row.isHoliday && <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 'bold' }}>National Holiday</div>}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="modal-footer">
                    <button className="btn-close" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default AttendanceModal;
