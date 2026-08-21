import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { SavingsContributionsService } from './savings-contributions.service';
import { CreateSavingsContributionDto } from './dto/create-savings-contribution.dto';
import { UpdateSavingsContributionDto } from './dto/update-savings-contribution.dto';
import { UserId } from '../decorators/user-id.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('savings-contributions')
@UseGuards(JwtAuthGuard) // Protege todas las rutas
export class SavingsContributionsController {
  constructor(private readonly contributionsService: SavingsContributionsService) {}

  @Post()
  create(
    @Body() createDto: CreateSavingsContributionDto,
    @UserId() userId: string,
  ) {
    return this.contributionsService.create(createDto, userId);
  }

  @Get()
  findAll(@UserId() userId: string) {
    return this.contributionsService.findAllByUser(userId);
  }

  @Get('goal/:goalId')
  findByGoal(
    @Param('goalId') goalId: string,
    @UserId() userId: string,
  ) {
    return this.contributionsService.findByGoalForUser(goalId, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @UserId() userId: string) {
    return this.contributionsService.findOneForUser(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSavingsContributionDto,
    @UserId() userId: string,
  ) {
    return this.contributionsService.updateForUser(id, updateDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @UserId() userId: string) {
    return this.contributionsService.removeForUser(id, userId);
  }
}