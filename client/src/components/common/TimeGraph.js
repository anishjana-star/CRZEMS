import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine
} from 'recharts';
import './TimeGraph.css';

const formatTimeAxis = (decimal) => {
    if (decimal === null || decimal === undefined) return '';
    const hours = Math.floor(decimal);
    const minutes = Math.round((decimal - hours) * 60);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours} ${ampm}`;
};

const CustomYAxisTick = (props) => {
    const { x, y, payload } = props;
    const isBold = payload.value === 10 || payload.value === 19; // 10 AM or 7 PM

    return (
        <g transform={`translate(${x},${y})`}>
            <text
                x={0}
                y={0}
                dy={4}
                textAnchor="end"
                fill={isBold ? "#1e3a8a" : "#64748b"}
                fontWeight={isBold ? "700" : "400"}
                fontSize={12}
            >
                {formatTimeAxis(payload.value)}
            </text>
        </g>
    );
};

const CustomBar = (props) => {
    const { fill, x, y, width, height, status } = props;
    if (!height || height === 0) return null;

    return (
        <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={fill}
            rx={4}
            ry={4}
            className={status === 'Active' ? 'blinking-bar' : ''}
        />
    );
};

const TimeGraph = ({ entries, startDate, endDate }) => {
    // Process data for the chart
    const processData = () => {
        if (!entries || entries.length === 0) return [];

        // Create a map of date -> entry
        const entryMap = new Map();
        entries.forEach(entry => {
            const dateStr = new Date(entry.date).toLocaleDateString();
            entryMap.set(dateStr, entry);
        });

        const data = [];
        let current = new Date(startDate);
        const end = new Date(endDate);

        // Fill in all days in the range
        while (current <= end) {
            const dateStr = current.toLocaleDateString();
            const entry = entryMap.get(dateStr);

            let clockInVal = null;
            let clockOutVal = null;
            let durationString = '--';

            if (entry) {
                const login = new Date(entry.loginTime);
                // Convert to decimal hours for Y-axis (e.g., 9:30 AM -> 9.5)
                clockInVal = login.getHours() + login.getMinutes() / 60;

                if (entry.logoutTime) {
                    const logout = new Date(entry.logoutTime);
                    clockOutVal = logout.getHours() + logout.getMinutes() / 60;
                } else if (dateStr === new Date().toLocaleDateString()) {
                    // If it's today and no logout, assume currently working (optional: max active bar)
                    const now = new Date();
                    clockOutVal = now.getHours() + now.getMinutes() / 60;
                }
            }

            // Calculate duration for display
            if (clockInVal !== null && clockOutVal !== null) {
                const dur = clockOutVal - clockInVal;
                const hours = Math.floor(dur);
                const minutes = Math.round((dur - hours) * 60);
                durationString = `${hours}h ${minutes}m`;
            }

            // Create range data [min, max]
            const timeRange = (clockInVal !== null && clockOutVal !== null) ? [clockInVal, clockOutVal] : null;

            data.push({
                date: current.getDate(),
                fullDate: current.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' }),
                timeRange: timeRange,
                clockInRaw: clockInVal,
                clockOutRaw: clockOutVal,
                durationDisplay: durationString,
                status: entry ? (entry.logoutTime ? 'Completed' : 'Active') : 'Absent'
            });

            current.setDate(current.getDate() + 1);
        }
        return data;
    };

    const data = processData();

    // Calculate minimum width to ensure bars are readable on mobile
    // Approx 35px per day + padding
    const minChartWidth = Math.max(600, data.length * 35);

    return (
        <div className="time-graph-container">
            <h3 className="time-graph-header">
                Attendance Timeline ({startDate.toLocaleDateString()} - {endDate.toLocaleDateString()})
            </h3>

            <div className="graph-scroll-wrapper">
                <div style={{ minWidth: `${minChartWidth}px`, height: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 0,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                type="number"
                                domain={[7, 21]} // Extended range to ensure 7 PM (19) fits comfortably
                                ticks={[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]}
                                interval={0} // Force show all ticks on all devices
                                tick={<CustomYAxisTick />}
                                axisLine={false}
                                tickLine={false}
                                allowDataOverflow={false}
                            />
                            <Tooltip content={<CustomTooltip formatTime={formatTimeAxis} />} cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }} />
                            <ReferenceLine y={10} stroke="#bbf7d0" strokeWidth={1} label="" />
                            <ReferenceLine y={19} stroke="#bbf7d0" strokeWidth={1} label="" />
                            <Bar
                                dataKey="timeRange"
                                barSize={20}
                                shape={<CustomBar />}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        // Always Green (#10b981) - Active will blink via class
                                        fill={entry.status === 'Absent' ? 'transparent' : '#10b981'}
                                        status={entry.status}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const CustomTooltip = ({ active, payload, label, formatTime }) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;

        // Helper specifically for tooltip details
        const formatTimeDetail = (decimal) => {
            if (decimal === null || decimal === undefined) return '--:--';
            const hours = Math.floor(decimal);
            const minutes = Math.round((decimal - hours) * 60);
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const formattedHours = hours % 12 || 12;
            return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        };

        // Don't show tooltip for empty data (Absent)
        if (!dataPoint.timeRange) return null;

        return (
            <div className="custom-tooltip">
                <div className="tooltip-date">{dataPoint.fullDate}</div>

                <div className="tooltip-row">
                    <span className="tooltip-label">Clock In:</span>
                    <span className="tooltip-value">{formatTimeDetail(dataPoint.clockInRaw)}</span>
                </div>

                {dataPoint.status !== 'Active' && (
                    <div className="tooltip-row">
                        <span className="tooltip-label">Clock Out:</span>
                        <span className="tooltip-value">{formatTimeDetail(dataPoint.clockOutRaw)}</span>
                    </div>
                )}

                <div className="tooltip-duration">
                    Total: {dataPoint.durationDisplay}
                </div>
                {dataPoint.status === 'Active' && (
                    <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '0.25rem', textAlign: 'right' }}>
                        Currently Working
                    </div>
                )}
            </div>
        );
    }
    return null;
};

export default TimeGraph;
