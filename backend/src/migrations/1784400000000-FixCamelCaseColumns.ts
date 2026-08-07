import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Fix camelCase column names to snake_case.
 *
 * The production database was originally created with TypeORM synchronize:true
 * without a snake_case naming strategy, resulting in camelCase FK column names.
 * This migration renames them to the correct snake_case format expected by the entities.
 *
 * Affected columns:
 *   - clases.tutorId              → tutor_id
 *   - tutores.usuarioId           → usuario_id
 *   - asistencias.claseId         → clase_id
 *   - asistencias.beneficiarioId  → beneficiario_id
 *   - asistencias.registradoPorId → registrado_por_id
 *   - fotos_asistencia.claseId    → clase_id
 *   - reportes.generadoPorId      → generado_por_id
 */
export class FixCamelCaseColumns1784400000000 implements MigrationInterface {
  name = 'FixCamelCaseColumns1784400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Helper to check if a column exists
    const columnExists = async (
      table: string,
      column: string,
    ): Promise<boolean> => {
      const result = await queryRunner.query(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
        [table, column],
      );
      return result.length > 0;
    };

    // Helper to drop FK by finding it dynamically
    const dropFkIfExists = async (table: string, column: string) => {
      const result = await queryRunner.query(
        `
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = $1
          AND kcu.column_name = $2
      `,
        [table, column],
      );

      for (const row of result) {
        await queryRunner.query(
          `ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "${row.constraint_name}"`,
        );
        console.log(
          `[FixCamelCase] Dropped FK ${row.constraint_name} on ${table}.${column}`,
        );
      }
    };

    const renames: Array<{ table: string; from: string; to: string }> = [
      { table: 'clases', from: 'tutorId', to: 'tutor_id' },
      { table: 'tutores', from: 'usuarioId', to: 'usuario_id' },
      { table: 'asistencias', from: 'claseId', to: 'clase_id' },
      { table: 'asistencias', from: 'beneficiarioId', to: 'beneficiario_id' },
      {
        table: 'asistencias',
        from: 'registradoPorId',
        to: 'registrado_por_id',
      },
      { table: 'fotos_asistencia', from: 'claseId', to: 'clase_id' },
      { table: 'reportes', from: 'generadoPorId', to: 'generado_por_id' },
    ];

    for (const rename of renames) {
      const sourceExists = await columnExists(rename.table, rename.from);
      const targetExists = await columnExists(rename.table, rename.to);

      if (targetExists) {
        console.log(
          `[FixCamelCase] ${rename.table}.${rename.to} already correct, skipping.`,
        );
        continue;
      }

      if (!sourceExists) {
        console.log(
          `[FixCamelCase] ${rename.table}.${rename.from} not found, skipping.`,
        );
        continue;
      }

      // Drop any FK constraints using the camelCase column
      await dropFkIfExists(rename.table, rename.from);

      // Rename the column
      await queryRunner.query(
        `ALTER TABLE "${rename.table}" RENAME COLUMN "${rename.from}" TO "${rename.to}"`,
      );
      console.log(
        `[FixCamelCase] Renamed ${rename.table}.${rename.from} → ${rename.to}`,
      );
    }

    // Re-add FK constraints (using IF NOT EXISTS pattern via exception handling)
    const fks = [
      `ALTER TABLE "clases" ADD CONSTRAINT "FK_clases_tutor" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id")`,
      `ALTER TABLE "tutores" ADD CONSTRAINT "FK_tutores_usuario" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id")`,
      `ALTER TABLE "asistencias" ADD CONSTRAINT "FK_asistencias_clase" FOREIGN KEY ("clase_id") REFERENCES "clases"("id")`,
      `ALTER TABLE "asistencias" ADD CONSTRAINT "FK_asistencias_beneficiario" FOREIGN KEY ("beneficiario_id") REFERENCES "beneficiarios"("id")`,
      `ALTER TABLE "asistencias" ADD CONSTRAINT "FK_asistencias_registrado_por" FOREIGN KEY ("registrado_por_id") REFERENCES "usuarios"("id")`,
      `ALTER TABLE "fotos_asistencia" ADD CONSTRAINT "FK_fotos_asist_clase" FOREIGN KEY ("clase_id") REFERENCES "clases"("id") ON DELETE CASCADE`,
      `ALTER TABLE "reportes" ADD CONSTRAINT "FK_reportes_generado_por" FOREIGN KEY ("generado_por_id") REFERENCES "usuarios"("id")`,
    ];

    for (const fk of fks) {
      try {
        await queryRunner.query(fk);
      } catch {
        // FK already exists, skip
      }
    }

    console.log('[FixCamelCase] Migration complete.');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No-op: reverting camelCase would break the app
    void queryRunner;
    await Promise.resolve();
  }
}
