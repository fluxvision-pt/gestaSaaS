import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { StatusTenant } from './entities/tenant.entity';

@Injectable()
export class TenancyService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Verificar se já existe tenant com o mesmo documento
    const existingTenant = await this.tenantRepository.findOne({
      where: { documento: createTenantDto.documento },
    });

    if (existingTenant) {
      throw new ConflictException('Já existe um tenant com este documento');
    }

    // Verificar se já existe tenant com o mesmo email
    const existingEmail = await this.tenantRepository.findOne({
      where: { email: createTenantDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Já existe um tenant com este email');
    }

    const tenant = this.tenantRepository.create(createTenantDto);
    return this.tenantRepository.save(tenant);
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find({
      order: { criadoEm: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
      relations: ['usuarios', 'assinaturas'],
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);

    // Verificar se o documento não está sendo usado por outro tenant
    if (updateTenantDto.documento && updateTenantDto.documento !== tenant.documento) {
      const existingTenant = await this.tenantRepository.findOne({
        where: { documento: updateTenantDto.documento },
      });

      if (existingTenant && existingTenant.id !== id) {
        throw new ConflictException('Já existe um tenant com este documento');
      }
    }

    // Verificar se o email não está sendo usado por outro tenant
    if (updateTenantDto.email && updateTenantDto.email !== tenant.email) {
      const existingEmail = await this.tenantRepository.findOne({
        where: { email: updateTenantDto.email },
      });

      if (existingEmail && existingEmail.id !== id) {
        throw new ConflictException('Já existe um tenant com este email');
      }
    }

    Object.assign(tenant, updateTenantDto);
    return this.tenantRepository.save(tenant);
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    await this.tenantRepository.remove(tenant);
  }

  async findByDocument(documento: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({
      where: { documento },
    });
  }

  async findByEmail(email: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({
      where: { email },
    });
  }

  async activate(id: string): Promise<Tenant> {
    const tenant = await this.findOne(id);
    tenant.status = StatusTenant.ATIVO;
    return this.tenantRepository.save(tenant);
  }

  async deactivate(id: string): Promise<Tenant> {
    const tenant = await this.findOne(id);
    tenant.status = StatusTenant.CANCELADO;
    return this.tenantRepository.save(tenant);
  }

  async suspend(id: string): Promise<Tenant> {
    const tenant = await this.findOne(id);
    tenant.status = StatusTenant.SUSPENSO;
    return this.tenantRepository.save(tenant);
  }
}