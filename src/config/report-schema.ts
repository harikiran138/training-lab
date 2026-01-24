
export const reportSchema = [
    { key: 'branch_code', label: 'Branch Code', required: true, type: 'string' },
    { key: 'week_no', label: 'Week Number', required: true, type: 'number' },
    { key: 'sessions', label: 'Sessions Held', type: 'number', min: 0 },
    { key: 'attendance.avg_attendance_percent', label: 'Avg Attendance %', type: 'number', min: 0, max: 100 },
    { key: 'tests.avg_test_attendance_percent', label: 'Test Attendance %', type: 'number', min: 0, max: 100 },
    { key: 'tests.avg_test_pass_percent', label: 'Test Pass %', type: 'number', min: 0, max: 100 },
    { key: 'syllabus.covered', label: 'Syllabus Covered', type: 'number' },
    { key: 'syllabus.total', label: 'Total Syllabus', type: 'number' }
];
