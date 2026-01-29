import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('dashboard')
    async getDashboard() {
        return this.analyticsService.getDashboardMetrics();
    }

    @Get('trends')
    async getTrends() {
        return this.analyticsService.getWeeklyTrends();
    }

    @Get('students')
    async getStudentAnalytics() {
        return this.analyticsService.getStudentAnalytics();
    }
}
