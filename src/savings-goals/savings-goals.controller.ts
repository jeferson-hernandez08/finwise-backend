import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { SavingsGoalsService } from './savings-goals.service';
import { CreateSavingsGoalDto } from './dto/create-savings-goal.dto';
import { UpdateSavingsGoalDto } from './dto/update-savings-goal.dto';
import { UserId } from '../decorators/user-id.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('savings-goals')
@UseGuards(JwtAuthGuard) // Protege todas las rutas
export class SavingsGoalsController {
  constructor(private readonly savingsGoalsService: SavingsGoalsService) {}

  @Post()
  create(@Body() createSavingsGoalDto: CreateSavingsGoalDto, @UserId() userId: string) {
    createSavingsGoalDto.user_id = userId; // Asignar user_id desde el token
    return this.savingsGoalsService.create(createSavingsGoalDto);
  }

  @Get()
  findAll(@UserId() userId: string) {
    return this.savingsGoalsService.findAllByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @UserId() userId: string) {
    return this.savingsGoalsService.findOneForUser(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSavingsGoalDto: UpdateSavingsGoalDto,
    @UserId() userId: string,
  ) {
    return this.savingsGoalsService.updateForUser(id, updateSavingsGoalDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @UserId() userId: string) {
    return this.savingsGoalsService.removeForUser(id, userId);
  }
}