import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAssinaturaDto } from './dto/create-assinatura.dto';
import { UpdateAssinaturaDto } from './dto/update-assinatura.dto';
import { Assinatura, StatusAssinatura } from './entities/assinatura.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Plano } from '../planos/entities/plano.entity';

@Injectable()
export class AssinaturasService {
  constructor(
    @InjectRepository(Assinatura)
    private assinaturaRepository: Repository<Assinatura>,
    @InjectRepository(Plano)
    private planoRepository: Repository<Plano>,
  ) {}

  async create(createAssinaturaDto: CreateAssinaturaDto, user: Usuario): Promise<Assinatura> {
    const plano = await this.planoRepository.findOne({
      where: { id: createAssinaturaDto.planoId },
    });

    if (!plano) {
      throw new NotFoundException('Plano não encontrado');
    }

    const assinatura = this.assinaturaRepository.create({
      ...createAssinaturaDto,
      tenantId: user.tenantId,
      inicioEm: new Date(),
      status: StatusAssinatura.ATIVA,
    });

    return this.assinaturaRepository.save(assinatura);
  }

  async findAll(user: Usuario, status?: string): Promise<Assinatura[]> {
    const query = this.assinaturaRepository
      .createQueryBuilder('assinatura')
      .leftJoinAndSelect('assinatura.plano', 'plano')
      .where('assinatura.tenantId = :tenantId', { tenantId: user.tenantId });

    if (status) {
      query.andWhere('assinatura.status = :status', { status });
    }

    return query.getMany();
  }

  async findOne(id: string, user: Usuario): Promise<Assinatura> {
    const assinatura = await this.assinaturaRepository
      .createQueryBuilder('assinatura')
      .leftJoinAndSelect('assinatura.plano', 'plano')
      .where('assinatura.id = :id', { id })
      .andWhere('assinatura.tenantId = :tenantId', { tenantId: user.tenantId })
      .getOne();

    if (!assinatura) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    return assinatura;
  }

  async update(id: string, updateAssinaturaDto: UpdateAssinaturaDto, user: Usuario): Promise<Assinatura> {
    const assinatura = await this.findOne(id, user);

    if (updateAssinaturaDto.planoId) {
      const plano = await this.planoRepository.findOne({
        where: { id: updateAssinaturaDto.planoId },
      });

      if (!plano) {
        throw new NotFoundException('Plano não encontrado');
      }

      assinatura.planoId = updateAssinaturaDto.planoId;
    }

    Object.assign(assinatura, updateAssinaturaDto);
    return this.assinaturaRepository.save(assinatura);
  }

  async remove(id: string, user: Usuario): Promise<void> {
    const assinatura = await this.findOne(id, user);
    await this.assinaturaRepository.remove(assinatura);
  }

  async cancel(id: string, user: Usuario): Promise<Assinatura> {
    const assinatura = await this.findOne(id, user);
    
    if (assinatura.status === StatusAssinatura.CANCELADA) {
      throw new BadRequestException('Assinatura já está cancelada');
    }

    assinatura.status = StatusAssinatura.CANCELADA;
    assinatura.fimEm = new Date();
    
    return this.assinaturaRepository.save(assinatura);
  }
}