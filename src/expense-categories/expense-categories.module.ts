import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpenseCategoriesService } from './expense-categories.service';
import { ExpenseCategoriesController } from './expense-categories.controller';
import { ExpenseCategory, ExpenseCategorySchema } from '../schemas/expense-category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExpenseCategory.name, schema: ExpenseCategorySchema }
    ])
  ],
  controllers: [ExpenseCategoriesController],
  providers: [ExpenseCategoriesService],
})
export class ExpenseCategoriesModule implements OnModuleInit {
  constructor(private readonly expenseCategoriesService: ExpenseCategoriesService) {}

  async onModuleInit() {
    // Al iniciar el módulo, sembramos las categorías por defecto
    await this.expenseCategoriesService.seedDefaultCategories();
  }
}
