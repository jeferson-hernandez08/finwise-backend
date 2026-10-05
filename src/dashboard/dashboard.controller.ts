import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { UserId } from '../decorators/user-id.decorator';
import { DashboardSummary } from './dashboard.types';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // Resumen del mes del usuario del token (protegido por el guard global).
  @Get('summary')
  summary(
    @UserId() userId: string,
    @Query() query: DashboardQueryDto,
  ): Promise<DashboardSummary> {
    const today = new Date();
    const year = query.year ?? today.getFullYear();
    const month = query.month ?? today.getMonth() + 1;
    return this.dashboardService.summary(userId, year, month);
  }
}
