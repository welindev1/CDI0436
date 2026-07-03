import { NestFactory } from '@nestjs/core';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

// Importar módulo principal
import { AppModule } from '../app.module';

// Importar entidades con paths relativos
import { Usuario } from '../modules/usuarios/usuario.entity';
import { Rol } from '../modules/roles/entities/rol.entity';
import { Permiso } from '../modules/roles/entities/permiso.entity';
import { PERMISOS_SISTEMA } from '../modules/roles/permisos.service';

async function seedUsers() {
  console.log('🚀 Iniciando seed del sistema...\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  const usuarioRepo = app.get<Repository<Usuario>>(getRepositoryToken(Usuario));
  const rolRepo = app.get<Repository<Rol>>(getRepositoryToken(Rol));
  const permisoRepo = app.get<Repository<Permiso>>(getRepositoryToken(Permiso));

  // 1. Crear permisos si no existen
  console.log('📋 Verificando permisos del sistema...');
  for (const permisoData of PERMISOS_SISTEMA) {
    const existe = await permisoRepo.findOne({
      where: { codigo: permisoData.codigo },
    });

    if (!existe) {
      const permiso = permisoRepo.create(permisoData);
      await permisoRepo.save(permiso);
      console.log(`  ✅ Permiso creado: ${permisoData.codigo}`);
    }
  }
  console.log('');

  // 2. Crear rol Super Administrador si no existe
  console.log('👑 Verificando rol Super Administrador...');
  let rolSuperAdmin = await rolRepo.findOne({
    where: { es_super_admin: true },
    relations: ['permisos'],
  });

  if (!rolSuperAdmin) {
    // Obtener todos los permisos
    const todosLosPermisos = await permisoRepo.find();

    rolSuperAdmin = rolRepo.create({
      nombre: 'Super Administrador',
      descripcion: 'Acceso completo a todas las funcionalidades del sistema',
      es_super_admin: true,
      activo: true,
      permisos: todosLosPermisos,
    });

    rolSuperAdmin = await rolRepo.save(rolSuperAdmin);
    console.log('  ✅ Rol Super Administrador creado');
  } else {
    console.log('  ⚠️  Rol Super Administrador ya existe');
  }
  console.log('');

  // 3. Crear usuario administrador si no existe
  console.log('👤 Verificando usuario administrador...');
  const adminEmail = 'admin@cdi.com';
  const adminPassword = 'admin123';

  let adminUser = await usuarioRepo.findOne({
    where: { correo: adminEmail },
  });

  if (!adminUser) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    adminUser = usuarioRepo.create({
      nombre: 'Super Administrador',
      correo: adminEmail,
      password_hash: passwordHash,
      rol_id: rolSuperAdmin.id,
      activo: true,
    });

    await usuarioRepo.save(adminUser);
    console.log('  ✅ Usuario administrador creado');
  } else {
    // Actualizar rol si es necesario
    if (adminUser.rol_id !== rolSuperAdmin.id) {
      adminUser.rol_id = rolSuperAdmin.id;
      await usuarioRepo.save(adminUser);
      console.log('  ✅ Rol de administrador actualizado');
    } else {
      console.log('  ⚠️  Usuario administrador ya existe');
    }
  }

  console.log('\n✨ Seed completado!\n');
  console.log('📋 Credenciales del administrador:');
  console.log('┌──────────────────────────────┬──────────────┐');
  console.log('│ Correo                       │ Contraseña   │');
  console.log('├──────────────────────────────┼──────────────┤');
  console.log('│ admin@cdi.com                │ admin123     │');
  console.log('└──────────────────────────────┴──────────────┘');
  console.log(
    '\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login!\n',
  );

  await app.close();
}

seedUsers().catch((error) => {
  console.error('❌ Error en seed:', error);
  process.exit(1);
});
