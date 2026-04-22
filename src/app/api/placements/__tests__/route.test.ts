import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, PUT } from '@/app/api/placements/route';
import PlacementDrive from '@/models/PlacementDrive';
import dbConnect from '@/lib/mongodb';

vi.mock('@/lib/mongodb', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/PlacementDrive', () => ({
  default: {
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

describe('Placements API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST should fail if selected > appeared', async () => {
    const req = {
      json: async () => ({
        company_name: 'Test Corp',
        appeared_count: 10,
        selected_count: 15,
      }),
    } as any;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Selected count cannot exceed appeared count');
  });

  it('POST should succeed with valid data', async () => {
    const mockDrive = { id: '123', company_name: 'Test Corp' };
    (PlacementDrive.create as any).mockResolvedValue(mockDrive);

    const req = {
      json: async () => ({
        company_name: 'Test Corp',
        appeared_count: 100,
        selected_count: 10,
        academic_year: '2025-26',
        drive_date: new Date()
      }),
    } as any;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.id).toBe('123');
  });
});
