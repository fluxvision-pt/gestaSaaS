import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { Usuario, PerfilUsuario, StatusUsuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto, currentUser?: Usuario): Promise<Usuario> {
    // Verificar se já existe usuário com o mesmo email
    const existingUser = await this.usuarioRepository.findOne({
      where: { email: createUsuarioDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Já existe um usuário com este email');
    }

    // Validar permissões para criação de usuário
    if (currentUser) {
      if (currentUser.perfil === PerfilUsuario.CLIENTE_USER) {
        throw new ForbiddenException('Usuários não podem criar outros usuários');
      }

      if (currentUser.perfil === PerfilUsuario.CLIENTE_ADMIN && createUsuarioDto.perfil === PerfilUsuario.SUPER_ADMIN) {
        throw new ForbiddenException('Admins de cliente não podem criar super admins');
      }

      if (currentUser.perfil === PerfilUsuario.CLIENTE_ADMIN && createUsuarioDto.tenantId !== currentUser.tenantId) {
        throw new ForbiddenException('Admins de cliente só podem criar usuários do próprio tenant');
      }
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(createUsuarioDto.senha, 12);

    const { senha, ...usuarioData } = createUsuarioDto;
    const usuario = this.usuarioRepository.create({
      ...usuarioData,
      senhaHash,
    });

    return this.usuarioRepository.save(usuario);
  }

  async findAll(currentUser: Usuario): Promise<Usuario[]> {
    const query = this.usuarioRepository.createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.tenant', 'tenant')
      .orderBy('usuario.criadoEm', 'DESC');

    // Super admin vê todos os usuários
    if (currentUser.perfil === PerfilUsuario.SUPER_ADMIN) {
      // Não adiciona filtro
    } 
    // Cliente admin vê apenas usuários do próprio tenant
    else if (currentUser.perfil === PerfilUsuario.CLIENTE_ADMIN) {
      query.where('usuario.tenantId = :tenantId', { tenantId: currentUser.tenantId });
    }
    // Cliente usuário não pode listar usuários
    else {
      throw new ForbiddenException('Usuários não podem listar outros usuários');
    }

    return query.getMany();
  }

  async findOne(id: string, currentUser: Usuario): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['tenant'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar permissões de acesso
    if (currentUser.perfil === PerfilUsuario.CLIENTE_ADMIN && usuario.tenantId !== currentUser.tenantId) {
      throw new ForbiddenException('Acesso negado a usuário de outro tenant');
    }

    if (currentUser.perfil === PerfilUsuario.CLIENTE_USER && usuario.id !== currentUser.id) {
      throw new ForbiddenException('Usuários só podem ver o próprio perfil');
    }

    return usuario;
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto, currentUser: Usuario): Promise<Usuario> {
    const usuario = await this.findOne(id, currentUser);

    // Verificar se o email não está sendo usado por outro usuário
    if (updateUsuarioDto.email && updateUsuarioDto.email !== usuario.email) {
      const existingUser = await this.usuarioRepository.findOne({
        where: { email: updateUsuarioDto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Já existe um usuário com este email');
      }
    }

    // Validar permissões para atualização
    if (currentUser.perfil === PerfilUsuario.CLIENTE_USER && usuario.id !== currentUser.id) {
      throw new ForbiddenException('Usuários só podem editar o próprio perfil');
    }

    if (currentUser.perfil === PerfilUsuario.CLIENTE_ADMIN && updateUsuarioDto.perfil === PerfilUsuario.SUPER_ADMIN) {
      throw new ForbiddenException('Admins de cliente não podem promover usuários a super admin');
    }

    // Hash da nova senha se fornecida
    if (updateUsuarioDto.senha) {
      updateUsuarioDto.senhaHash = await bcrypt.hash(updateUsuarioDto.senha, 12);
      delete updateUsuarioDto.senha;
    }

    Object.assign(usuario, updateUsuarioDto);
    return this.usuarioRepository.save(usuario);
  }

  async remove(id: string, currentUser: Usuario): Promise<void> {
    const usuario = await this.findOne(id, currentUser);

    // Validar permissões para exclusão
    if (currentUser.perfil === PerfilUsuario.CLIENTE_USER) {
      throw new ForbiddenException('Usuários não podem excluir contas');
    }

    if (currentUser.perfil === PerfilUsuario.CLIENTE_ADMIN && usuario.perfil === PerfilUsuario.SUPER_ADMIN) {
      throw new ForbiddenException('Admins de cliente não podem excluir super admins');
    }

    if (usuario.id === currentUser.id) {
      throw new ForbiddenException('Não é possível excluir a própria conta');
    }

    await this.usuarioRepository.remove(usuario);
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto, currentUser: Usuario): Promise<void> {
    const usuario = await this.findOne(id, currentUser);

    // Verificar se é o próprio usuário ou um admin
    if (usuario.id !== currentUser.id && currentUser.perfil === PerfilUsuario.CLIENTE_USER) {
      throw new ForbiddenException('Usuários só podem alterar a própria senha');
    }

    // Verificar senha atual se fornecida
    if (changePasswordDto.senhaAtual) {
      const senhaValida = await bcrypt.compare(changePasswordDto.senhaAtual, usuario.senhaHash);
      if (!senhaValida) {
        throw new ForbiddenException('Senha atual incorreta');
      }
    }

    // Hash da nova senha
    const novaSenhaHash = await bcrypt.hash(changePasswordDto.novaSenha, 12);
    
    usuario.senhaHash = novaSenhaHash;
    await this.usuarioRepository.save(usuario);
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { email },
      relations: ['tenant'],
    });
  }

  async activate(id: string, currentUser: Usuario): Promise<Usuario> {
    const usuario = await this.findOne(id, currentUser);
    
    if (currentUser.perfil === PerfilUsuario.CLIENTE_USER) {
      throw new ForbiddenException('Usuários não podem ativar contas');
    }

    usuario.status = StatusUsuario.ATIVO;
    return this.usuarioRepository.save(usuario);
  }

  async deactivate(id: string, currentUser: Usuario): Promise<Usuario> {
    const usuario = await this.findOne(id, currentUser);
    
    if (currentUser.perfil === PerfilUsuario.CLIENTE_USER) {
      throw new ForbiddenException('Usuários não podem desativar contas');
    }

    if (usuario.id === currentUser.id) {
      throw new ForbiddenException('Não é possível desativar a própria conta');
    }

    usuario.status = StatusUsuario.INATIVO;
    return this.usuarioRepository.save(usuario);
  }
}