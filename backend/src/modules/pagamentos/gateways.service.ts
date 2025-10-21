import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gateway } from './entities/gateway.entity';
import { CredencialGateway } from './entities/credencial-gateway.entity';
import { CreateGatewayDto } from './dto/create-gateway.dto';
import { UpdateGatewayDto } from './dto/update-gateway.dto';
import { CreateCredencialGatewayDto } from './dto/create-credencial-gateway.dto';
import { UpdateCredencialGatewayDto } from './dto/update-credencial-gateway.dto';
import { PerfilUsuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class GatewaysService {
  constructor(
    @InjectRepository(Gateway)
    private gatewayRepository: Repository<Gateway>,
    @InjectRepository(CredencialGateway)
    private credencialGatewayRepository: Repository<CredencialGateway>,
  ) {}

  // CRUD para Gateways
  async createGateway(createGatewayDto: CreateGatewayDto, perfil: PerfilUsuario): Promise<Gateway> {
    // Apenas super admin pode criar gateways
    if (perfil !== PerfilUsuario.SUPER_ADMIN) {
      throw new ForbiddenException('Apenas super administradores podem criar gateways');
    }

    // Verificar se já existe um gateway com o mesmo nome
    const existingGateway = await this.gatewayRepository.findOne({
      where: { nome: createGatewayDto.nome }
    });

    if (existingGateway) {
      throw new ConflictException('Já existe um gateway com este nome');
    }

    const gateway = this.gatewayRepository.create(createGatewayDto);
    return await this.gatewayRepository.save(gateway);
  }

  async findAllGateways(perfil: PerfilUsuario): Promise<Gateway[]> {
    // Verificar permissões
    if (perfil !== PerfilUsuario.SUPER_ADMIN && perfil !== PerfilUsuario.CLIENTE_ADMIN) {
      throw new ForbiddenException('Acesso negado');
    }

    return await this.gatewayRepository.find({
      relations: ['credenciais'],
      order: { criadoEm: 'DESC' }
    });
  }

  async findOneGateway(id: string, perfil: PerfilUsuario): Promise<Gateway> {
    // Verificar permissões
    if (perfil !== PerfilUsuario.SUPER_ADMIN && perfil !== PerfilUsuario.CLIENTE_ADMIN) {
      throw new ForbiddenException('Acesso negado');
    }

    const gateway = await this.gatewayRepository.findOne({
      where: { id },
      relations: ['credenciais']
    });

    if (!gateway) {
      throw new NotFoundException('Gateway não encontrado');
    }

    return gateway;
  }

  async updateGateway(id: string, updateGatewayDto: UpdateGatewayDto, perfil: PerfilUsuario): Promise<Gateway> {
    // Apenas super admin pode atualizar gateways
    if (perfil !== PerfilUsuario.SUPER_ADMIN) {
      throw new ForbiddenException('Apenas super administradores podem atualizar gateways');
    }

    const gateway = await this.findOneGateway(id, perfil);
    
    // Verificar se o novo nome já existe (se estiver sendo alterado)
    if (updateGatewayDto.nome && updateGatewayDto.nome !== gateway.nome) {
      const existingGateway = await this.gatewayRepository.findOne({
        where: { nome: updateGatewayDto.nome }
      });

      if (existingGateway) {
        throw new ConflictException('Já existe um gateway com este nome');
      }
    }

    Object.assign(gateway, updateGatewayDto);
    return await this.gatewayRepository.save(gateway);
  }

  async removeGateway(id: string, perfil: PerfilUsuario): Promise<void> {
    // Apenas super admin pode remover gateways
    if (perfil !== PerfilUsuario.SUPER_ADMIN) {
      throw new ForbiddenException('Apenas super administradores podem remover gateways');
    }

    const gateway = await this.findOneGateway(id, perfil);
    
    // Verificar se o gateway tem pagamentos associados
    const pagamentosCount = await this.gatewayRepository
      .createQueryBuilder('gateway')
      .leftJoin('gateway.pagamentos', 'pagamento')
      .where('gateway.id = :id', { id })
      .getCount();

    if (pagamentosCount > 0) {
      throw new ConflictException('Não é possível remover um gateway que possui pagamentos associados');
    }

    await this.gatewayRepository.remove(gateway);
  }

  // CRUD para Credenciais de Gateway
  async createCredencial(createCredencialDto: CreateCredencialGatewayDto, perfil: PerfilUsuario): Promise<CredencialGateway> {
    // Apenas super admin pode criar credenciais
    if (perfil !== PerfilUsuario.SUPER_ADMIN) {
      throw new ForbiddenException('Apenas super administradores podem criar credenciais');
    }

    // Verificar se o gateway existe
    const gateway = await this.findOneGateway(createCredencialDto.gatewayId, perfil);

    // Verificar se já existe uma credencial com a mesma chave para este gateway
    const existingCredencial = await this.credencialGatewayRepository.findOne({
      where: { 
        gatewayId: createCredencialDto.gatewayId,
        chave: createCredencialDto.chave 
      }
    });

    if (existingCredencial) {
      throw new ConflictException('Já existe uma credencial com esta chave para este gateway');
    }

    const credencial = this.credencialGatewayRepository.create(createCredencialDto);
    return await this.credencialGatewayRepository.save(credencial);
  }

  async findAllCredenciais(gatewayId: string, perfil: PerfilUsuario): Promise<CredencialGateway[]> {
    // Verificar permissões
    if (perfil !== PerfilUsuario.SUPER_ADMIN && perfil !== PerfilUsuario.CLIENTE_ADMIN) {
      throw new ForbiddenException('Acesso negado');
    }

    // Verificar se o gateway existe
    await this.findOneGateway(gatewayId, perfil);

    return await this.credencialGatewayRepository.find({
      where: { gatewayId },
      relations: ['gateway']
    });
  }

  async findOneCredencial(id: string, perfil: PerfilUsuario): Promise<CredencialGateway> {
    // Verificar permissões
    if (perfil !== PerfilUsuario.SUPER_ADMIN && perfil !== PerfilUsuario.CLIENTE_ADMIN) {
      throw new ForbiddenException('Acesso negado');
    }

    const credencial = await this.credencialGatewayRepository.findOne({
      where: { id },
      relations: ['gateway']
    });

    if (!credencial) {
      throw new NotFoundException('Credencial não encontrada');
    }

    return credencial;
  }

  async updateCredencial(id: string, updateCredencialDto: UpdateCredencialGatewayDto, perfil: PerfilUsuario): Promise<CredencialGateway> {
    // Apenas super admin pode atualizar credenciais
    if (perfil !== PerfilUsuario.SUPER_ADMIN) {
      throw new ForbiddenException('Apenas super administradores podem atualizar credenciais');
    }

    const credencial = await this.findOneCredencial(id, perfil);
    
    // Verificar se a nova chave já existe para o mesmo gateway (se estiver sendo alterada)
    if (updateCredencialDto.chave && updateCredencialDto.chave !== credencial.chave) {
      const existingCredencial = await this.credencialGatewayRepository.findOne({
        where: { 
          gatewayId: credencial.gatewayId,
          chave: updateCredencialDto.chave 
        }
      });

      if (existingCredencial) {
        throw new ConflictException('Já existe uma credencial com esta chave para este gateway');
      }
    }

    Object.assign(credencial, updateCredencialDto);
    return await this.credencialGatewayRepository.save(credencial);
  }

  async removeCredencial(id: string, perfil: PerfilUsuario): Promise<void> {
    // Apenas super admin pode remover credenciais
    if (perfil !== PerfilUsuario.SUPER_ADMIN) {
      throw new ForbiddenException('Apenas super administradores podem remover credenciais');
    }

    const credencial = await this.findOneCredencial(id, perfil);
    await this.credencialGatewayRepository.remove(credencial);
  }

  // Métodos auxiliares
  async getGatewayByNome(nome: string): Promise<Gateway | null> {
    return await this.gatewayRepository.findOne({
      where: { nome, ativo: true },
      relations: ['credenciais']
    });
  }

  async getCredencialByChave(gatewayId: string, chave: string): Promise<string | null> {
    const credencial = await this.credencialGatewayRepository.findOne({
      where: { gatewayId, chave }
    });

    return credencial ? credencial.valor : null;
  }
}