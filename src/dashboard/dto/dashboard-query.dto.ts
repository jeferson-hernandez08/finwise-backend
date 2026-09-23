import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/** ?year=&month= — si faltan se usa el mes en curso. */
export class DashboardQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'year debe ser un número entero' })
  @Min(2000, { message: 'year debe ser un año válido' })
  @Max(2100, { message: 'year debe ser un año válido' })
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'month debe ser un número entero' })
  @Min(1, { message: 'month debe estar entre 1 y 12' })
  @Max(12, { message: 'month debe estar entre 1 y 12' })
  month?: number;
}
