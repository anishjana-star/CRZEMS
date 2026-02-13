import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './BeautifulCalendar.css';

const BeautifulCalendar = ({ className }) => {
    const [value, onChange] = useState(new Date());

    const holidays = [
        { date: '2026-01-01', name: "New Year's Day" },
        { date: '2026-01-26', name: "Republic Day" },
        { date: '2026-03-04', name: "Holi (Colour Diwas)" },
        { date: '2026-08-15', name: "Independence Day" },
        { date: '2026-08-28', name: "Rakhi Bandhan" },
        { date: '2026-10-02', name: "Mahatma Gandhi Jayanti" },
        { date: '2026-10-18', name: "Durga Puja - Maha Saptami*" },
        { date: '2026-10-19', name: "Durga Puja - Maha Ashtami" },
        { date: '2026-10-20', name: "Durga Puja - Maha Navami" },
        { date: '2026-10-21', name: "Durga Puja - Vijaya Dashami" },
        { date: '2026-10-25', name: "Lakshmi Puja*" },
        { date: '2026-11-08', name: "Kali Puja / Diwali*" },
        { date: '2026-11-11', name: "Bhai Dooj (Bhatridwitiya)" },
        { date: '2026-11-15', name: "Chhath Puja*" },
    ];

    const getHoliday = (date) => {
        const dateString = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
        return holidays.find(h => h.date === dateString);
    };

    return (
        <div className={`beautiful-calendar-wrapper ${className || ''}`}>
            <Calendar
                onChange={onChange}
                value={value}
                className="beautiful-calendar"
                tileClassName={({ date, view }) => {
                    const classes = [];
                    // Add custom classes for weekends (Only Sunday is off)
                    if (view === 'month' && date.getDay() === 0) {
                        classes.push('weekend-date');
                    }
                    // Add class for holidays
                    if (view === 'month' && getHoliday(date)) {
                        classes.push('holiday-date');
                    }
                    return classes.join(' ');
                }}
                tileContent={({ date, view }) => {
                    if (view === 'month') {
                        const holiday = getHoliday(date);
                        if (holiday) {
                            return (
                                <div className="holiday-overlay" title={holiday.name}></div>
                            );
                        }
                    }
                }}
            />
        </div>
    );
};

export default BeautifulCalendar;
