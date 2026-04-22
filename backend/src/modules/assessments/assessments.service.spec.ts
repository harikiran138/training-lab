import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentsService } from './assessments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Assessment } from './assessment.entity';
import { AssessmentEntry } from './assessment-entry.entity';
import { AuditService } from '../audit/audit.service';
import { DataSource } from 'typeorm';

describe('AssessmentsService', () => {
  let service: AssessmentsService;

  const mockAssessmentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockEntryRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockAuditService = {
    logChange: jest.fn(),
  };

  const mockDataSource = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssessmentsService,
        {
          provide: getRepositoryToken(Assessment),
          useValue: mockAssessmentRepository,
        },
        {
          provide: getRepositoryToken(AssessmentEntry),
          useValue: mockEntryRepository,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<AssessmentsService>(AssessmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error when updating finalized assessment', async () => {
    mockAssessmentRepository.findOne.mockResolvedValue({ id: 1, status: 'finalized' });
    
    await expect(service.updateWeeklyAssessment(1, { title: 'New Title' }))
      .rejects.toThrow('Finalized reports cannot be edited');
  });
});
