import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { UpdateTransacaoDto } from './dto/update-transacao.dto';
import { Transacao, TipoTransacao, CategoriaTransacao } from './entities/transacao.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class FinanceiroService {
  constructor(
    @InjectRepository(Transacao)
    private readonly transacaoRepository: Repository<Transacao>,
  ) {}

  async create(createTransacaoDto: CreateTransacaoDto, usuario: Usuario): Promise<Transacao> {
    // Mapear tipos do DTO para a entidade
    const tipoMapeado = createTransacaoDto.tipo === 'receita' ? TipoTransacao.ENTRADA : TipoTransacao.SAIDA;
    
    const transacao = this.transacaoRepository.create({
      tenantId: usuario.tenantId,
      usuarioId: usuario.id,
      tipo: tipoMapeado,
      categoria: createTransacaoDto.categoria as CategoriaTransacao,
      descricao: createTransacaoDto.descricao,
      data: new Date(createTransacaoDto.data),
      valorCents: Math.round(createTransacaoDto.valor * 100), // Converter para centavos
    });

    return await this.transacaoRepository.save(transacao);
  }

  async findAll(
    usuario: Usuario,
    options: {
      page?: number;
      limit?: number;
      tipo?: string;
      categoria?: string;
    } = {},
  ): Promise<{ data: Transacao[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, tipo, categoria } = options;
    
    const queryBuilder = this.transacaoRepository
      .createQueryBuilder('transacao')
      .where('transacao.tenantId = :tenantId', { tenantId: usuario.tenantId });

    if (tipo) {
      queryBuilder.andWhere('transacao.tipo = :tipo', { tipo });
    }

    if (categoria) {
      queryBuilder.andWhere('transacao.categoria = :categoria', { categoria });
    }

    queryBuilder
      .orderBy('transacao.data', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, usuario: Usuario): Promise<Transacao> {
    const transacao = await this.transacaoRepository.findOne({
      where: { 
        id, 
        tenantId: usuario.tenantId 
      },
    });

    if (!transacao) {
      throw new NotFoundException('Transação não encontrada');
    }

    return transacao;
  }

  async update(id: string, updateTransacaoDto: UpdateTransacaoDto, usuario: Usuario): Promise<Transacao> {
    const transacao = await this.findOne(id, usuario);

    // Mapear campos se necessário
    if (updateTransacaoDto.tipo) {
      transacao.tipo = updateTransacaoDto.tipo === 'receita' ? TipoTransacao.ENTRADA : TipoTransacao.SAIDA;
    }
    
    if (updateTransacaoDto.categoria) {
      transacao.categoria = updateTransacaoDto.categoria;
    }
    
    if (updateTransacaoDto.descricao !== undefined) {
      transacao.descricao = updateTransacaoDto.descricao;
    }
    
    if (updateTransacaoDto.valor) {
      transacao.valorCents = Math.round(updateTransacaoDto.valor * 100);
    }
    
    if (updateTransacaoDto.data) {
      transacao.data = new Date(updateTransacaoDto.data);
    }

    return await this.transacaoRepository.save(transacao);
  }

  async remove(id: string, usuario: Usuario): Promise<void> {
    const transacao = await this.findOne(id, usuario);
    await this.transacaoRepository.remove(transacao);
  }

  async getCategorias(usuario: Usuario): Promise<string[]> {
    const categorias = await this.transacaoRepository
      .createQueryBuilder('transacao')
      .select('DISTINCT transacao.categoria', 'categoria')
      .where('transacao.tenantId = :tenantId', { tenantId: usuario.tenantId })
      .getRawMany();

    return categorias.map(c => c.categoria);
  }

  async createCategoria(createCategoriaDto: any, usuario: Usuario): Promise<any> {
    // Implementar lógica para criar categoria personalizada
    // Por enquanto, retorna um placeholder
    return {
      message: 'Categoria personalizada criada com sucesso',
      categoria: createCategoriaDto.nome,
    };
  }

  async buscaAvancada(usuario: Usuario, filtros: any): Promise<Transacao[]> {
    const queryBuilder = this.transacaoRepository
      .createQueryBuilder('transacao')
      .where('transacao.tenantId = :tenantId', { tenantId: usuario.tenantId });

    // Implementar filtros avançados baseados nos parâmetros
    if (filtros.dataInicio) {
      queryBuilder.andWhere('transacao.data >= :dataInicio', { dataInicio: filtros.dataInicio });
    }

    if (filtros.dataFim) {
      queryBuilder.andWhere('transacao.data <= :dataFim', { dataFim: filtros.dataFim });
    }

    if (filtros.valorMin) {
      queryBuilder.andWhere('transacao.valor >= :valorMin', { valorMin: filtros.valorMin });
    }

    if (filtros.valorMax) {
      queryBuilder.andWhere('transacao.valor <= :valorMax', { valorMax: filtros.valorMax });
    }

    if (filtros.tags) {
      queryBuilder.andWhere('transacao.tags && :tags', { tags: filtros.tags });
    }

    return await queryBuilder.getMany();
  }

  async importarTransacoes(importData: any, usuario: Usuario): Promise<any> {
    // Implementar lógica de importação automática
    // Por enquanto, retorna um placeholder
    return {
      message: 'Transações importadas com sucesso',
      importadas: importData.transacoes?.length || 0,
    };
  }

  async adicionarAnexo(transacaoId: string, anexoData: any, usuario: Usuario): Promise<any> {
    const transacao = await this.findOne(transacaoId, usuario);
    
    // Implementar lógica para adicionar anexo
    // Por enquanto, retorna um placeholder
    return {
      message: 'Anexo adicionado com sucesso',
      transacaoId: transacao.id,
      anexo: anexoData.nome,
    };
  }

  async adicionarTags(transacaoId: string, tagsData: any, usuario: Usuario): Promise<any> {
    const transacao = await this.findOne(transacaoId, usuario);
    
    // Implementar lógica para adicionar tags
    // Por enquanto, retorna um placeholder
    return {
      message: 'Tags adicionadas com sucesso',
      transacaoId: transacao.id,
      tags: tagsData.tags,
    };
  }

  // Métodos específicos para o Dashboard Financeiro
  async getDashboardData(usuario: Usuario): Promise<any> {
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);
    const inicioMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
    const fimMesAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0);

    // Buscar dados do mês atual
    const [saldoAtual, receitasMes, despesasMes, transacoesRecentes] = await Promise.all([
      this.getSaldoAtual(usuario),
      this.getReceitasMes(usuario, inicioMes, fimMes),
      this.getDespesasMes(usuario, inicioMes, fimMes),
      this.getTransacoesRecentes(usuario, 5)
    ]);

    // Buscar dados do mês anterior para comparação
    const [receitasMesAnterior, despesasMesAnterior] = await Promise.all([
      this.getReceitasMes(usuario, inicioMesAnterior, fimMesAnterior),
      this.getDespesasMes(usuario, inicioMesAnterior, fimMesAnterior)
    ]);

    // Calcular percentuais de variação
    const variacaoReceitas = receitasMesAnterior.total > 0 
      ? ((receitasMes.total - receitasMesAnterior.total) / receitasMesAnterior.total) * 100 
      : 0;
    
    const variacaoDespesas = despesasMesAnterior.total > 0 
      ? ((despesasMes.total - despesasMesAnterior.total) / despesasMesAnterior.total) * 100 
      : 0;

    return {
      saldoAtual: {
        valor: saldoAtual,
        variacao: variacaoReceitas - variacaoDespesas // Simplificado
      },
      receitasMes: {
        ...receitasMes,
        variacao: variacaoReceitas
      },
      despesasMes: {
        ...despesasMes,
        variacao: variacaoDespesas
      },
      transacoesRecentes,
      indicadores: await this.getIndicadores(usuario)
    };
  }

  async getSaldoAtual(usuario: Usuario): Promise<number> {
    const result = await this.transacaoRepository
      .createQueryBuilder('transacao')
      .select('SUM(CASE WHEN transacao.tipo = :entrada THEN transacao.valorCents ELSE -transacao.valorCents END)', 'saldo')
      .where('transacao.tenantId = :tenantId', { tenantId: usuario.tenantId })
      .setParameter('entrada', TipoTransacao.ENTRADA)
      .getRawOne();

    return (result?.saldo || 0) / 100; // Converter de centavos para reais
  }

  async getReceitasMes(usuario: Usuario, inicio: Date, fim: Date): Promise<{ total: number; quantidade: number }> {
    const result = await this.transacaoRepository
      .createQueryBuilder('transacao')
      .select([
        'SUM(transacao.valorCents) as total',
        'COUNT(*) as quantidade'
      ])
      .where('transacao.tenantId = :tenantId', { tenantId: usuario.tenantId })
      .andWhere('transacao.tipo = :tipo', { tipo: TipoTransacao.ENTRADA })
      .andWhere('transacao.data >= :inicio', { inicio })
      .andWhere('transacao.data <= :fim', { fim })
      .getRawOne();

    return {
      total: (result?.total || 0) / 100,
      quantidade: parseInt(result?.quantidade || '0')
    };
  }

  async getDespesasMes(usuario: Usuario, inicio: Date, fim: Date): Promise<{ total: number; quantidade: number }> {
    const result = await this.transacaoRepository
      .createQueryBuilder('transacao')
      .select([
        'SUM(transacao.valorCents) as total',
        'COUNT(*) as quantidade'
      ])
      .where('transacao.tenantId = :tenantId', { tenantId: usuario.tenantId })
      .andWhere('transacao.tipo = :tipo', { tipo: TipoTransacao.SAIDA })
      .andWhere('transacao.data >= :inicio', { inicio })
      .andWhere('transacao.data <= :fim', { fim })
      .getRawOne();

    return {
      total: (result?.total || 0) / 100,
      quantidade: parseInt(result?.quantidade || '0')
    };
  }

  async getTransacoesRecentes(usuario: Usuario, limite: number = 5): Promise<Transacao[]> {
    return await this.transacaoRepository
      .createQueryBuilder('transacao')
      .where('transacao.tenantId = :tenantId', { tenantId: usuario.tenantId })
      .orderBy('transacao.data', 'DESC')
      .addOrderBy('transacao.criadoEm', 'DESC')
      .take(limite)
      .getMany();
  }

  async getIndicadores(usuario: Usuario): Promise<any> {
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);

    // Melhor dia da semana (baseado em receitas)
    const melhorDia = await this.transacaoRepository
      .createQueryBuilder('transacao')
      .select([
        'EXTRACT(DOW FROM transacao.data) as dia_semana',
        'SUM(transacao.valorCents) as total'
      ])
      .where('transacao.tenantId = :tenantId', { tenantId: usuario.tenantId })
      .andWhere('transacao.tipo = :tipo', { tipo: TipoTransacao.ENTRADA })
      .andWhere('transacao.data >= :inicio', { inicio: inicioMes })
      .andWhere('transacao.data <= :fim', { fim: fimMes })
      .groupBy('EXTRACT(DOW FROM transacao.data)')
      .orderBy('total', 'DESC')
      .limit(1)
      .getRawOne();

    // KM/€ Médio (se houver dados de KM)
    const kmEuroMedio = await this.transacaoRepository
      .createQueryBuilder('transacao')
      .select([
        'AVG(transacao.valorCents / NULLIF(transacao.km, 0)) as km_euro_medio'
      ])
      .where('transacao.tenantId = :tenantId', { tenantId: usuario.tenantId })
      .andWhere('transacao.tipo = :tipo', { tipo: TipoTransacao.ENTRADA })
      .andWhere('transacao.km IS NOT NULL')
      .andWhere('transacao.km > 0')
      .andWhere('transacao.data >= :inicio', { inicio: inicioMes })
      .andWhere('transacao.data <= :fim', { fim: fimMes })
      .getRawOne();

    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    return {
      melhorDiaSemana: melhorDia ? diasSemana[melhorDia.dia_semana] : 'N/A',
      kmEuroMedio: kmEuroMedio?.km_euro_medio ? (kmEuroMedio.km_euro_medio / 100).toFixed(2) : 'N/A',
      metaMensal: 2000, // Valor fixo por enquanto, pode ser configurável
      proximaManutencao: 15 // Dias até próxima manutenção, pode ser calculado baseado em dados reais
    };
  }

  async getGraficoReceitasDespesas(usuario: Usuario, meses: number = 6): Promise<any[]> {
    const dados = [];
    const agora = new Date();

    for (let i = meses - 1; i >= 0; i--) {
      const mes = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      const fimMes = new Date(agora.getFullYear(), agora.getMonth() - i + 1, 0);

      const [receitas, despesas] = await Promise.all([
        this.getReceitasMes(usuario, mes, fimMes),
        this.getDespesasMes(usuario, mes, fimMes)
      ]);

      dados.push({
        mes: mes.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        receitas: receitas.total,
        despesas: despesas.total
      });
    }

    return dados;
  }
}