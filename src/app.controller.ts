import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Pública: sirve para comprobar de un vistazo que la API está levantada.
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
