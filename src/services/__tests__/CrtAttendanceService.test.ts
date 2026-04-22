import { describe, it, expect } from 'vitest';
import { CrtAttendanceService } from '@/services/CrtAttendanceService';

describe('CrtAttendanceService', () => {
  it('should calculate percentages correctly', () => {
    const input = [{
      branch_code: 'CSE',
      strength: 100,
      daily: [80, 90, 70, 85, 95, 100] as (number | "No CRT")[]
    }];

    const results = CrtAttendanceService.processData(input);
    expect(results[0].weekly_average_percent).toBe(87);
    expect(results[0].risk_flag).toBe('GREEN');
  });

  it('should flag RED if attendance is < 75%', () => {
    const input = [{
      branch_code: 'ECE',
      strength: 100,
      daily: [60, 70, 65, 50, 55, 60] as (number | "No CRT")[]
    }];

    const results = CrtAttendanceService.processData(input);
    expect(results[0].weekly_average_percent).toBe(60);
    expect(results[0].risk_flag).toBe('RED');
  });

  it('should throw error if attended > strength', () => {
    const input = [{
      branch_code: 'MECH',
      strength: 60,
      daily: [110, 40, 50, 40, 50, 40] as (number | "No CRT")[]
    }];

    expect(() => CrtAttendanceService.processData(input)).toThrow('Data Corruption Detected');
  });

  it('should handle "No CRT" days', () => {
    const input = [{
      branch_code: 'CIVIL',
      strength: 60,
      daily: [30, "No CRT", 40, "No CRT", 50, 60] as (number | "No CRT")[]
    }];

    const results = CrtAttendanceService.processData(input);
    expect(results[0].no_crt_days).toBe(2);
    expect(results[0].weekly_average_percent).toBe(75); // (50+67+83+100)/4 = 75
  });
});
