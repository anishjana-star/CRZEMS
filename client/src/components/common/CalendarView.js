import React, { useState, useEffect } from 'react';
import { getHolidays } from '../../services/adminService';
import './CalendarView.css';

const CalendarView = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        try {
            const data = await getHolidays();
            setHolidays(data);
        } catch (error) {
            console.error('Failed to fetch holidays:', error);
        } finally {
            setLoading(false);
        }
    };

    const daysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getDayHolidays = (day) => {
        return holidays.filter(h => {
            const hDate = new Date(h.date);
            return hDate.getDate() === day &&
                hDate.getMonth() === currentDate.getMonth() &&
                hDate.getFullYear() === currentDate.getFullYear();
        });
    };

    const renderCalendarDays = () => {
        const totalDays = daysInMonth(currentDate);
        const startDay = firstDayOfMonth(currentDate);
        const days = [];

        // Empty cells for days before start of month
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Days of the month
        for (let i = 1; i <= totalDays; i++) {
            const dayHolidays = getDayHolidays(i);
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), i).toDateString();

            days.push(
                <div key={i} className={`calendar-day ${isToday ? 'today' : ''} ${dayHolidays.length > 0 ? 'has-holiday' : ''}`}>
                    <span className="day-number">{i}</span>
                    {dayHolidays.map((h, index) => (
                        <div key={index} className="holiday-marker" title={h.name}>
                            {h.name}
                        </div>
                    ))}
                </div>
            );
        }

        return days;
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    if (loading) return <div>Loading Calendar...</div>;

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <button onClick={prevMonth}>&lt;</button>
                <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                <button onClick={nextMonth}>&gt;</button>
            </div>
            <div className="calendar-grid">
                <div className="weekday">Sun</div>
                <div className="weekday">Mon</div>
                <div className="weekday">Tue</div>
                <div className="weekday">Wed</div>
                <div className="weekday">Thu</div>
                <div className="weekday">Fri</div>
                <div className="weekday">Sat</div>
                {renderCalendarDays()}
            </div>

            <div className="holiday-list mt-4">
                <h3>Holidays this month</h3>
                <ul>
                    {holidays.filter(h => {
                        const hDate = new Date(h.date);
                        return hDate.getMonth() === currentDate.getMonth() && hDate.getFullYear() === currentDate.getFullYear();
                    }).map(h => (
                        <li key={h._id}>
                            <strong>{new Date(h.date).getDate()} {monthNames[new Date(h.date).getMonth()]}</strong>: {h.name}
                        </li>
                    ))}
                    {holidays.filter(h => {
                        const hDate = new Date(h.date);
                        return hDate.getMonth() === currentDate.getMonth() && hDate.getFullYear() === currentDate.getFullYear();
                    }).length === 0 && <p className="text-gray-500">No holidays this month.</p>}
                </ul>
            </div>
        </div>
    );
};

export default CalendarView;
