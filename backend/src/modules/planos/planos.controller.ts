import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PlanosService } from './planos.service';
import { CreatePlanoDto } from './dto/create-plano.dto';
import { UpdatePlanoDto } from './dto/update-plano.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Usuario } from '../usuarios/entities/usuario.entity';

@ApiTags('planos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('planos')
export class PlanosController {
  constructor(private readonly planosService: PlanosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo plano' })
  @ApiResponse({ status: 201, description: 'Plano criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createPlanoDto: CreatePlanoDto, @CurrentUser() user: Usuario) {
    return this.planosService.create(createPlanoDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os planos' })
  @ApiResponse({ status: 200, description: 'Lista de planos retornada com sucesso.' })
  findAll(@CurrentUser() user: Usuario, @Query('status') status?: string) {
    return this.planosService.findAll(user, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar plano por ID' })
  @ApiResponse({ status: 200, description: 'Plano encontrado.' })
  @ApiResponse({ status: 404, description: 'Plano não encontrado.' })
  findOne(@Param('id') id: string, @CurrentUser() user: Usuario) {
    return this.planosService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um plano' })
  @ApiResponse({ status: 200, description: 'Plano atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Plano não encontrado.' })
  update(
    @Param('id') id: string,
    @Body() updatePlanoDto: UpdatePlanoDto,
    @CurrentUser() user: Usuario,
  ) {
    return this.planosService.update(id, updatePlanoDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um plano' })
  @ApiResponse({ status: 200, description: 'Plano excluído com sucesso.' })
  @ApiResponse({ status: 404, description: 'Plano não encontrado.' })
  remove(@Param('id') id: string, @CurrentUser() user: Usuario) {
    return this.planosService.remove(id, user);
  }
}