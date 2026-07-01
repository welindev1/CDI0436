/**
 * Script de ejecución de migraciones para TypeORM
 *
 * Uso:
 *   npx ts-node src/scripts/run-migration.ts          # Ejecuta migraciones pendientes
 *   npx ts-node src/scripts/run-migration.ts revert    # Revierte la última migración
 *
 * Para GENERAR una migración desde las entidades:
 *   npx typeorm-ts-node-commonjs migration:generate src/migrations/MigracionInicial -d src/scripts/data-source.ts
 *
 * Para CREAR una migración vacía:
 *   npx typeorm-ts-node-commonjs migration:create src/migrations/NombreMigracion
 */

import { AppDataSource } from './data-source';

async function runMigrations() {
  const action = process.argv[2]; // 'revert' o undefined

  try {
    await AppDataSource.initialize();
    console.log('📦 Conexión a la base de datos establecida.\n');

    if (action === 'revert') {
      console.log('⏪ Revirtiendo la última migración...');
      await AppDataSource.undoLastMigration();
      console.log('✅ Migración revertida correctamente.');
    } else {
      console.log('▶️  Ejecutando migraciones pendientes...');
      const migrations = await AppDataSource.runMigrations();
      if (migrations.length === 0) {
        console.log('✅ No hay migraciones pendientes.');
      } else {
        console.log(`✅ ${migrations.length} migración(es) ejecutada(s):`);
        migrations.forEach((m) => console.log(`   - ${m.name}`));
      }
    }

    await AppDataSource.destroy();
    console.log('\n🔌 Conexión cerrada.');
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    process.exit(1);
  }
}

runMigrations();
