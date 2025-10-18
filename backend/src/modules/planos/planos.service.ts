import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlanoDto } from './dto/create-plano.dto';
import { UpdatePlanoDto } from './dto/update-plano.dto';
import { Plano, StatusPlano } from './entities/plano.entity';
import { Usuario, PerfilUsuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class PlanosService {
  constructor(
    @InjectRepository(Plano)
    private planoRepository: Repository<Plano>,
  ) {}

  async create(createPlanoDto: CreatePlanoDto, user: Usuario): Promise<Plano> {
    // Apenas super admins podem criar planos
    if (user.perfil !== PerfilUsuario.SUPER_ADMIN) {
      throw new ForbiddenException('Apenas super administradores podem criar planos');
    }

    const plano = this.planoRepository.create({
      ...createPlanoDto,
      status: createPlanoDto.status || StatusPlano.ATIVO,
    });

    return this.planoRepository.save(plano);
  }

  async findAll(user: Usuario, status?: string): Promise<Plano[]> {
    const query = this.planoRepository.createQueryBuilder('plano')
      .leftJoinAndSelect('plano.planoRecursos', 'planoRecursos')
      .leftJoinAndSelect('planoRecursos.recurso', 'recurso');

    if (status) {
      query.where('plano.status = :status', { status });
    }

    // Para usuários não super admin, mostrar apenas planos ativos
    if (user.perfil !== PerfilUsuario.SUPER_ADMIN) {
      query.andWhere('plano.status = :ativo', { ativo: StatusPlano.ATIVO });
    }

    return query.getMany();
  }

  async findOne(id: string, user: Usuario): Promise<Plano> {
    const query = this.planoRepository.createQueryBuilder('plano')
      .leftJoinAndSelect('plano.planoRecursos', 'planoRecursos')
      .leftJoinAndSelect('planoRecursos.recurso', 'recurso')
      .where('plano.id = :id', { id });

    // Para usuários não super admin, mostrar apenas planos ativos
    if (user.perfil !== PerfilUsuario.SUPER_ADMIN) {
      query.andWhere('plano.status = :ativo', { ativo: StatusPlano.ATIVO });
    }

    const plano = await query.getOne();

    if (!plano) {
      throw new NotFoundException(`Plano com ID ${id} não encontrado`);
    }

    return plano;
  }

  async update(id: string, updatePlanoDto: UpdatePlanoDto, user: Usuario): Promise<Plano> {
    // Apenas super admins podem atualizar planos
    if (user.perfil !== PerfilUsuario.SUPER_ADMIN) {
      throw new ForbiddenException('Apenas super administradores podem atualizar planos');
    }

    const plano = await this.findOne(id, user);
    
    Object.assign(plano, updatePlanoDto);
    
    return this.planoRepository.save(plano);
  }

  async remove(id: string, user: Usuario): Promise<void> {
    // Apenas super admins podem excluir planos
    if (user.perfil !== PerfilUsuario.SUPER_ADMIN) {
      throw new ForbiddenException('Apenas super administradores podem excluir planos');
    }

    const plano = await this.findOne(id, user);
    
    // Em vez de excluir, marcar como inativo
    plano.status = StatusPlano.INATIVO;
    await this.planoRepository.save(plano);
  }
}