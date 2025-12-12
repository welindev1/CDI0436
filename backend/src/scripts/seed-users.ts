import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsuariosService } from 'modules/usuarios/usuarios.service';
import { RolUsuario } from 'modules/usuarios/usuario.entity';

async function seedUsers() {
  console.log('🚀 Iniciando seed de usuarios...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const usuariosService = app.get(UsuariosService);

  const users = [
    {
      nombre: 'Super Administrador',
      correo: 'admin@cdi.com',
      password: 'admin123',
      rol: RolUsuario.ADMINISTRADOR,
    },
    {
      nombre: 'Profesor Demo',
      correo: 'profesor@cdi.com',
      password: 'profesor123',
      rol: RolUsuario.PROFESOR,
    },
    {
      nombre: 'Tutor Líder Demo',
      correo: 'tutor.lider@cdi.com',
      password: 'tutor123',
      rol: RolUsuario.TUTOR_LIDER,
    },
    {
      nombre: 'Tutor Demo',
      correo: 'tutor@cdi.com',
      password: 'tutor123',
      rol: RolUsuario.TUTOR,
    },
  ];

  for (const userData of users) {
    try {
      // Verificar si ya existe
      const exists = await usuariosService.findByCorreo(userData.correo);
      if (exists) {
        console.log(`⚠️  Usuario ${userData.correo} ya existe - Actualizando rol a ${userData.rol}...`);
        // Actualizar el rol
        await usuariosService.update(exists.id, { rol: userData.rol });
        console.log(`✅ Rol actualizado para ${userData.correo}`);
        continue;
      }

      // Crear nuevo usuario
      const user = await usuariosService.create(userData);
      console.log(`✅ Usuario creado: ${user.nombre} (${user.correo}) - Rol: ${user.rol}`);
    } catch (error) {
      console.error(`❌ Error con usuario ${userData.correo}:`, error.message);
    }
  }

  console.log('\n✨ Seed completado!\n');
  console.log('📋 Usuarios disponibles:');
  console.log('┌──────────────────────────────┬──────────────┬───────────────┐');
  console.log('│ Correo                       │ Contraseña   │ Rol           │');
  console.log('├──────────────────────────────┼──────────────┼───────────────┤');
  console.log('│ admin@cdi.com                │ admin123     │ Administrador │');
  console.log('│ profesor@cdi.com             │ profesor123  │ Profesor      │');
  console.log('│ tutor.lider@cdi.com          │ tutor123     │ Tutor Líder   │');
  console.log('│ tutor@cdi.com                │ tutor123     │ Tutor         │');
  console.log('└──────────────────────────────┴──────────────┴───────────────┘\n');
  
  await app.close();
}

seedUsers().catch(error => {
  console.error('❌ Error en seed:', error);
  process.exit(1);
});