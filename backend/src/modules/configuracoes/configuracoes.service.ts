import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateConfiguracaoDto } from './dto/create-configuracao.dto';
import { UpdateConfiguracaoDto } from './dto/update-configuracao.dto';
import { Configuracao } from './entities/configuracao.entity';
import { Usuario, PerfilUsuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class ConfiguracoesService {
  constructor(
    @InjectRepository(Configuracao)
    private configuracaoRepository: Repository<Configuracao>,
  ) {}

  async create(createConfiguracaoDto: CreateConfiguracaoDto, user: Usuario): Promise<Configuracao> {
    // Verificar permissões
    await this.verificarPermissoes(createConfiguracaoDto.tenantId, user);

    // Verificar se a configuração já existe
    const existente = await this.configuracaoRepository.findOne({
      where: {
        chave: createConfiguracaoDto.chave,
        tenantId: createConfiguracaoDto.tenantId || null,
      },
    });

    if (existente) {
      throw new ConflictException(`Configuração '${createConfiguracaoDto.chave}' já existe`);
    }

    const configuracao = this.configuracaoRepository.create({
      ...createConfiguracaoDto,
      tenantId: createConfiguracaoDto.tenantId || null,
    });

    return this.configuracaoRepository.save(configuracao);
  }

  async findAll(user: Usuario, tenantId?: string): Promise<Configuracao[]> {
    // Verificar permissões
    await this.verificarPermissoes(tenantId, user);

    const query = this.configuracaoRepository.createQueryBuilder('configuracao');

    if (tenantId !== undefined) {
      // Buscar configurações específicas do tenant ou globais
      query.where('configuracao.tenantId = :tenantId OR configuracao.tenantId IS NULL', { tenantId });
    } else if (user.perfil === PerfilUsuario.SUPER_ADMIN) {
      // Super admin pode ver todas as configurações
      // Não adicionar filtro
    } else {
      // Usuários normais só veem configurações do seu tenant
      query.where('configuracao.tenantId = :userTenantId OR configuracao.tenantId IS NULL', { 
        userTenantId: user.tenantId 
      });
    }

    return query.orderBy('configuracao.chave', 'ASC').getMany();
  }

  async findOne(id: string, user: Usuario): Promise<Configuracao> {
    const configuracao = await this.configuracaoRepository.findOne({
      where: { id },
    });

    if (!configuracao) {
      throw new NotFoundException(`Configuração com ID ${id} não encontrada`);
    }

    // Verificar permissões
    await this.verificarPermissoes(configuracao.tenantId, user);

    return configuracao;
  }

  async findByChave(chave: string, tenantId?: string): Promise<Configuracao | null> {
    // Primeiro tenta buscar configuração específica do tenant
    if (tenantId) {
      const configuracaoTenant = await this.configuracaoRepository.findOne({
        where: { chave, tenantId },
      });
      if (configuracaoTenant) {
        return configuracaoTenant;
      }
    }

    // Se não encontrou ou não tem tenant, busca configuração global
    return this.configuracaoRepository.findOne({
      where: { chave, tenantId: null },
    });
  }

  async update(id: string, updateConfiguracaoDto: UpdateConfiguracaoDto, user: Usuario): Promise<Configuracao> {
    const configuracao = await this.findOne(id, user);

    // Verificar se está tentando alterar a chave para uma que já existe
    if (updateConfiguracaoDto.chave && updateConfiguracaoDto.chave !== configuracao.chave) {
      const existente = await this.configuracaoRepository.findOne({
        where: {
          chave: updateConfiguracaoDto.chave,
          tenantId: configuracao.tenantId,
        },
      });

      if (existente) {
        throw new ConflictException(`Configuração '${updateConfiguracaoDto.chave}' já existe`);
      }
    }

    Object.assign(configuracao, updateConfiguracaoDto);
    
    return this.configuracaoRepository.save(configuracao);
  }

  async remove(id: string, user: Usuario): Promise<void> {
    const configuracao = await this.findOne(id, user);
    await this.configuracaoRepository.remove(configuracao);
  }

  async setConfiguracao(chave: string, valor: string, tenantId?: string): Promise<Configuracao> {
    const existente = await this.configuracaoRepository.findOne({
      where: { chave, tenantId: tenantId || null },
    });

    if (existente) {
      existente.valor = valor;
      return this.configuracaoRepository.save(existente);
    } else {
      const nova = this.configuracaoRepository.create({
        chave,
        valor,
        tenantId: tenantId || null,
      });
      return this.configuracaoRepository.save(nova);
    }
  }

  async getConfiguracao(chave: string, tenantId?: string, valorPadrao?: string): Promise<string | null> {
    const configuracao = await this.findByChave(chave, tenantId);
    return configuracao?.valor || valorPadrao || null;
  }

  private async verificarPermissoes(tenantId: string | null | undefined, user: Usuario): Promise<void> {
    // Super admin pode acessar qualquer configuração
    if (user.perfil === PerfilUsuario.SUPER_ADMIN) {
      return;
    }

    // Configurações globais (tenantId null) só podem ser acessadas por super admin
    if (tenantId === null || tenantId === undefined) {
      throw new ForbiddenException('Apenas super administradores podem acessar configurações globais');
    }

    // Usuários só podem acessar configurações do próprio tenant
    if (tenantId !== user.tenantId) {
      throw new ForbiddenException('Acesso negado a configurações de outro tenant');
    }
  }
}