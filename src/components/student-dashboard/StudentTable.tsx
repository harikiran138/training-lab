"use client";

import { MoreHorizontal, Search, Filter, Download } from 'lucide-react';

const students = [
    { id: "S001", name: "Alice Johnson", major: "Computer Science", gpa: "3.8", status: "Active", date: "2024-01-15" },
    { id: "S002", name: "Bob Smith", major: "Engineering", gpa: "3.2", status: "Probation", date: "2024-01-20" },
    { id: "S003", name: "Charlie Brown", major: "Arts", gpa: "3.9", status: "Active", date: "2024-01-22" },
    { id: "S004", name: "David Wilson", major: "Business", gpa: "2.5", status: "Warning", date: "2024-01-25" },
    { id: "S005", name: "Eva Davis", major: "Computer Science", gpa: "4.0", status: "Honors", date: "2024-01-28" },
];

const statusStyles = {
    Active: "bg-green-500/10 text-green-500 border border-green-500/20",
    Probation: "bg-red-500/10 text-red-500 border border-red-500/20",
    Warning: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
    Honors: "bg-purple-500/10 text-purple-500 border border-purple-500/20"
} as const;


export function StudentTable() {
    return (
        <div className="p-6 rounded-3xl bg-[#0F1115] text-white">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">Student List</h3>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">1,200 Total</span>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="w-full bg-[#1A1D24] border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <button className="p-2 border border-gray-700 rounded-xl hover:bg-gray-800 text-gray-400">
                        <Filter className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                            <th className="px-4 py-3 font-medium">Student ID</th>
                            <th className="px-4 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">Major</th>
                            <th className="px-4 py-3 font-medium">GPA</th>
                            <th className="px-4 py-3 font-medium">Last Active</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {students.map((student) => (
                            <tr key={student.id} className="group border-b border-gray-800/50 hover:bg-[#1A1D24]/50 transition-colors">
                                <td className="px-4 py-4 text-gray-400 font-mono">{student.id}</td>
                                <td className="px-4 py-4 font-medium text-white">{student.name}</td>
                                <td className="px-4 py-4 text-gray-400">{student.major}</td>
                                <td className="px-4 py-4 font-bold text-white">{student.gpa}</td>
                                <td className="px-4 py-4 text-gray-400">{student.date}</td>
                                <td className="px-4 py-4">
                                    <span className={cn("px-2.5 py-1 rounded-md text-xs font-medium", statusStyles[student.status as keyof typeof statusStyles] || statusStyles.Active)}>
                                        {student.status}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <button className="p-1.5 hover:bg-gray-700/50 rounded-lg text-gray-400 transition-colors">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                <p>Showing 5 of 1,200 students</p>
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-[#1A1D24] rounded-lg hover:bg-gray-800 disabled:opacity-50">Previous</button>
                    <button className="px-3 py-1 bg-[#1A1D24] rounded-lg hover:bg-gray-800">Next</button>
                </div>
            </div>
        </div>
    );
}
