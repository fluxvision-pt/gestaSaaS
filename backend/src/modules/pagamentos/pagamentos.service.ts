import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pagamento } from './entities/pagamento.entity';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';
import { UpdatePagamentoDto } from './dto/update-pagamento.dto';
import { PerfilUsuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class PagamentosService {
  constructor(
    @InjectRepository(Pagamento)
    private pagamentoRepository: Repository<Pagamento>,
  ) {}

  async create(createPagamentoDto: CreatePagamentoDto, tenantId: string, perfil: PerfilUsuario): Promise<Pagamento> {
    // Verificar permissões
    if (perfil !== PerfilUsuario.SUPER_ADMIN && perfil !== PerfilUsuario.CLIENTE_ADMIN) {
      throw new ForbiddenException('Acesso negado');
    }

    const pagamento = this.pagamentoRepository.create(createPagamentoDto);
    return await this.pagamentoRepository.save(pagamento);
  }

  async findAll(tenantId: string, perfil: PerfilUsuario): Promise<Pagamento[]> {
    // Verificar permissões
    if (perfil !== PerfilUsuario.SUPER_ADMIN && perfil !== PerfilUsuario.CLIENTE_ADMIN) {
      throw new ForbiddenException('Acesso negado');
    }

    const queryBuilder = this.pagamentoRepository
      .createQueryBuilder('pagamento')
      .leftJoinAndSelect('pagamento.assinatura', 'assinatura')
      .leftJoinAndSelect('assinatura.tenant', 'tenant')
      .leftJoinAndSelect('assinatura.plano', 'plano')
      .leftJoinAndSelect('pagamento.gateway', 'gateway');

    // Se não for super admin, filtrar por tenant
    if (perfil !== PerfilUsuario.SUPER_ADMIN) {
      queryBuilder.where('tenant.id = :tenantId', { tenantId });
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string, tenantId: string, perfil: PerfilUsuario): Promise<Pagamento> {
    // Verificar permissões
    if (perfil !== PerfilUsuario.SUPER_ADMIN && perfil !== PerfilUsuario.CLIENTE_ADMIN) {
      throw new ForbiddenException('Acesso negado');
    }

    const queryBuilder = this.pagamentoRepository
      .createQueryBuilder('pagamento')
      .leftJoinAndSelect('pagamento.assinatura', 'assinatura')
      .leftJoinAndSelect('assinatura.tenant', 'tenant')
      .leftJoinAndSelect('assinatura.plano', 'plano')
      .leftJoinAndSelect('pagamento.gateway', 'gateway')
      .where('pagamento.id = :id', { id });

    // Se não for super admin, filtrar por tenant
    if (perfil !== PerfilUsuario.SUPER_ADMIN) {
      queryBuilder.andWhere('tenant.id = :tenantId', { tenantId });
    }

    const pagamento = await queryBuilder.getOne();

    if (!pagamento) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    return pagamento;
  }

  async update(id: string, updatePagamentoDto: UpdatePagamentoDto, tenantId: string, perfil: PerfilUsuario): Promise<Pagamento> {
    // Verificar permissões
    if (perfil !== PerfilUsuario.SUPER_ADMIN && perfil !== PerfilUsuario.CLIENTE_ADMIN) {
      throw new ForbiddenException('Acesso negado');
    }

    const pagamento = await this.findOne(id, tenantId, perfil);
    
    Object.assign(pagamento, updatePagamentoDto);
    return await this.pagamentoRepository.save(pagamento);
  }

  async remove(id: string, tenantId: string, perfil: PerfilUsuario): Promise<void> {
    // Verificar permissões
    if (perfil !== PerfilUsuario.SUPER_ADMIN && perfil !== PerfilUsuario.CLIENTE_ADMIN) {
      throw new ForbiddenException('Acesso negado');
    }

    const pagamento = await this.findOne(id, tenantId, perfil);
    await this.pagamentoRepository.remove(pagamento);
  }
}