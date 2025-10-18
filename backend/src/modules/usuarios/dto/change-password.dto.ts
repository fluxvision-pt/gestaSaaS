import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ 
    description: 'Senha atual (obrigatória quando o usuário altera a própria senha)',
    example: 'MinhaSenh@123',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Senha atual deve ser uma string' })
  @IsNotEmpty({ message: 'Senha atual é obrigatória' })
  senhaAtual?: string;

  @ApiProperty({ 
    description: 'Nova senha',
    example: 'NovaSenha@456'
  })
  @IsString({ message: 'Nova senha deve ser uma string' })
  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  @MinLength(8, { message: 'Nova senha deve ter pelo menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'
  })
  novaSenha: string;
}