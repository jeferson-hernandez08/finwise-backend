import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { SavingsContributionsService } from './savings-contributions.service';
import { CreateSavingsContributionDto } from './dto/create-savings-contribution.dto';
import { UpdateSavingsContributionDto } from './dto/update-savings-contribution.dto';

@Controller('savings-contributions')
export class SavingsContributionsController {
  constructor(private readonly contributionsService: SavingsContributionsService) {}

  @Post()
  create(@Body() createDto: CreateSavingsContributionDto) {
    return this.contributionsService.create(createDto);
  }

  @Get()
  findAll() {
    return this.contributionsService.findAll();
  }

  @Get('goal/:goalId')
  findByGoal(@Param('goalId') goalId: string) {
    return this.contributionsService.findByGoal(goalId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contributionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateSavingsContributionDto) {
    return this.contributionsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.contributionsService.remove(id);
  }
}