/**
 * CRT Performance Analytics Metrics Calculation Service
 */

export const calculateSyllabusCompletion = (covered: number, total: number): number => {
  if (total === 0) return 0;
  return (covered / total) * 100;
};

export const calculateTestEffectiveness = (attendancePercent: number, passPercent: number): number => {
  return (attendancePercent * passPercent) / 100;
};

export const calculateLaptopImpact = (laptopHolders: number, totalStudents: number, attendancePercent: number): number => {
  if (totalStudents === 0) return 0;
  return (laptopHolders / totalStudents) * attendancePercent;
};

export const calculateOverallScore = (
  attendancePercent: number,
  testEffectiveness: number,
  syllabusCompletion: number
): number => {
  // Score = (Attendance Score * 0.4) + (Test Effectiveness * 0.4) + (Syllabus Completion * 0.2)
  return (attendancePercent * 0.4) + (testEffectiveness * 0.4) + (syllabusCompletion * 0.2);
};

export const getPerformanceGrade = (score: number): string => {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  return 'D';
};
