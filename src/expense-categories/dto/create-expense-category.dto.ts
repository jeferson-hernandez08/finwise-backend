import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateExpenseCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la categoría es requerido' })
  @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
  name: string;
}