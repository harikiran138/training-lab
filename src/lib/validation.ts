import { NextResponse } from 'next/server';

export function validateAttendance(attended: number, strength: number, label: string = 'Branch') {
  if (attended < 0) {
    return { error: `Negative Telemetry: ${label} attendance cannot be negative.`, status: 400 };
  }
  if (attended > strength) {
    return { error: `Data Corruption: ${label} attendance (${attended}) exceeds strength (${strength}).`, status: 400 };
  }
  return null;
}

export function validatePlacement(selected: number, appeared: number, label: string = 'Company') {
  if (selected < 0 || appeared < 0) {
    return { error: `Negative Telemetry: ${label} counts cannot be negative.`, status: 400 };
  }
  if (selected > appeared) {
    return { error: `Validation Error: ${label} selected (${selected}) exceeds appeared (${appeared}).`, status: 400 };
  }
  return null;
}

export function errorResponse(msg: string, status: number = 400) {
  return NextResponse.json({ error: msg }, { status });
}
