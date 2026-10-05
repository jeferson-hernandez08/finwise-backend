import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El correo electronico no es valido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'La contrasena es requerida' })
  password: string;
}
