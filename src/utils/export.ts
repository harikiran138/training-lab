import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { ICRTWeeklyReport } from '@/models/CRTWeeklyReport';

// Define the shape of the data we're working with
// In a real app we might map this more strictly from the Mongoose model
interface ReportData {
    branch_code: string;
    week_no: number;
    semester: string;
    sessions: number;
    attendance: { avg_attendance_percent: number };
    tests: { avg_test_attendance_percent: number, avg_test_pass_percent: number };
    syllabus: { covered: number, total: number };
    computed: { overall_score: number };
    status: string;
}

export async function generatePDF(reports: ReportData[], title: string = 'Assessment Reports') {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableColumn = ["Branch", "Week", "Sem", "Sessions", "Attendance %", "Test Pass %", "Syllabus %", "Score", "Status"];
    const tableRows: any[] = [];

    reports.forEach(report => {
        const reportData = [
            report.branch_code,
            report.week_no,
            report.semester,
            report.sessions,
            report.attendance?.avg_attendance_percent || 0,
            report.tests?.avg_test_pass_percent || 0,
            ((report.syllabus?.covered / report.syllabus?.total) * 100).toFixed(1),
            report.computed?.overall_score?.toFixed(2) || 0,
            report.status
        ];
        tableRows.push(reportData);
    });

    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 35,
    });

    return doc;
}

export async function generateExcel(reports: ReportData[]) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reports');

    worksheet.columns = [
        { header: 'Branch', key: 'branch', width: 10 },
        { header: 'Week', key: 'week', width: 10 },
        { header: 'Semester', key: 'semester', width: 10 },
        { header: 'Sessions', key: 'sessions', width: 10 },
        { header: 'Attendance %', key: 'attendance', width: 15 },
        { header: 'Test Pass %', key: 'test_pass', width: 15 },
        { header: 'Syllabus Covered', key: 'syllabus_covered', width: 15 },
        { header: 'Syllabus Total', key: 'syllabus_total', width: 15 },
        { header: 'Overall Score', key: 'score', width: 15 },
        { header: 'Status', key: 'status', width: 10 },
    ];

    reports.forEach(report => {
        worksheet.addRow({
            branch: report.branch_code,
            week: report.week_no,
            semester: report.semester,
            sessions: report.sessions,
            attendance: report.attendance?.avg_attendance_percent || 0,
            test_pass: report.tests?.avg_test_pass_percent || 0,
            syllabus_covered: report.syllabus?.covered || 0,
            syllabus_total: report.syllabus?.total || 0,
            score: report.computed?.overall_score || 0,
            status: report.status
        });
    });

    return workbook;
}
