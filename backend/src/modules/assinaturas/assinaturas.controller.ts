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
import { AssinaturasService } from './assinaturas.service';
import { CreateAssinaturaDto } from './dto/create-assinatura.dto';
import { UpdateAssinaturaDto } from './dto/update-assinatura.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Usuario } from '../usuarios/entities/usuario.entity';

@ApiTags('assinaturas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assinaturas')
export class AssinaturasController {
  constructor(private readonly assinaturasService: AssinaturasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova assinatura' })
  @ApiResponse({ status: 201, description: 'Assinatura criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createAssinaturaDto: CreateAssinaturaDto, @CurrentUser() user: Usuario) {
    return this.assinaturasService.create(createAssinaturaDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as assinaturas' })
  @ApiResponse({ status: 200, description: 'Lista de assinaturas retornada com sucesso.' })
  findAll(@CurrentUser() user: Usuario, @Query('status') status?: string) {
    return this.assinaturasService.findAll(user, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar assinatura por ID' })
  @ApiResponse({ status: 200, description: 'Assinatura encontrada.' })
  @ApiResponse({ status: 404, description: 'Assinatura não encontrada.' })
  findOne(@Param('id') id: string, @CurrentUser() user: Usuario) {
    return this.assinaturasService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma assinatura' })
  @ApiResponse({ status: 200, description: 'Assinatura atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Assinatura não encontrada.' })
  update(@Param('id') id: string, @Body() updateAssinaturaDto: UpdateAssinaturaDto, @CurrentUser() user: Usuario) {
    return this.assinaturasService.update(id, updateAssinaturaDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma assinatura' })
  @ApiResponse({ status: 200, description: 'Assinatura excluída com sucesso.' })
  @ApiResponse({ status: 404, description: 'Assinatura não encontrada.' })
  remove(@Param('id') id: string, @CurrentUser() user: Usuario) {
    return this.assinaturasService.remove(id, user);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar uma assinatura' })
  @ApiResponse({ status: 200, description: 'Assinatura cancelada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Assinatura não encontrada.' })
  cancel(@Param('id') id: string, @CurrentUser() user: Usuario) {
    return this.assinaturasService.cancel(id, user);
  }
}