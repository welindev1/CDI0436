import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    // Verificar si el correo ya existe
    const existe = await this.usuariosRepository.findOne({
      where: { correo: createUsuarioDto.correo }
    });

    if (existe) {
      throw new ConflictException('El correo ya está registrado');
    }

    // Hash del password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(createUsuarioDto.password, salt);

    const usuario = this.usuariosRepository.create({
      ...createUsuarioDto,
      password_hash: passwordHash
    });

    const savedUsuario = await this.usuariosRepository.save(usuario);
    
    // Retornar objeto sin password_hash (no usar `delete` sobre propiedades no-optional)
    const { password_hash, ...safeUsuario } = savedUsuario;
    return safeUsuario as Usuario;
  }

  async findAll(): Promise<Usuario[]> {
    const usuarios = await this.usuariosRepository.find({
      order: { nombre: 'ASC' }
    });

    // Eliminar passwords sin usar `delete`
    return usuarios.map(u => {
      const { password_hash, ...safe } = u;
      return safe as Usuario;
    });
  }

  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id }
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const { password_hash, ...safeUsuario } = usuario;
    return safeUsuario as Usuario;
  }

  // findByCorreo puede devolver null si no existe
  async findByCorreo(correo: string): Promise<Usuario | null> {
    return await this.usuariosRepository.findOne({
      where: { correo }
    });
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id }
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Si se intenta cambiar el correo, verificar que no exista
    if (updateUsuarioDto.correo && updateUsuarioDto.correo !== usuario.correo) {
      const existe = await this.usuariosRepository.findOne({
        where: { correo: updateUsuarioDto.correo }
      });

      if (existe) {
        throw new ConflictException('El correo ya está registrado');
      }
    }

    Object.assign(usuario, updateUsuarioDto);
    const updated = await this.usuariosRepository.save(usuario);
    
    const { password_hash, ...safeUpdated } = updated;
    return safeUpdated as Usuario;
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id }
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Verificar password actual
    const isValid = await bcrypt.compare(changePasswordDto.passwordActual, usuario.password_hash);
    if (!isValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    // Hash del nuevo password
    const salt = await bcrypt.genSalt(10);
    usuario.password_hash = await bcrypt.hash(changePasswordDto.passwordNueva, salt);

    await this.usuariosRepository.save(usuario);
  }

  async remove(id: string): Promise<void> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id }
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.usuariosRepository.remove(usuario);
  }

  async softDelete(id: string): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id }
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    usuario.activo = false;
    const updated = await this.usuariosRepository.save(usuario);

    const { password_hash, ...safeUpdated } = updated;
    return safeUpdated as Usuario;
  }

  async validateUser(correo: string, password: string): Promise<Usuario | null> {
    const usuario = await this.findByCorreo(correo);

    if (!usuario || !usuario.activo) {
      return null;
    }

    const isValid = await bcrypt.compare(password, usuario.password_hash);
    if (!isValid) {
      return null;
    }

    return usuario;
  }
}
