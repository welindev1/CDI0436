import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1784300000000 implements MigrationInterface {
  name = 'InitialSchema1784300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Skip if tables already exist (production DB was created with synchronize)
    const result = await queryRunner.query(
      `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usuarios'`,
    );
    if (parseInt(result[0].count) > 0) {
      console.log('[Migration] Tables already exist, skipping InitialSchema.');
      return;
    }

    // Enum types (use IF NOT EXISTS pattern via DO block)
    const enums = [
      {
        name: 'dia_semana_enum',
        values:
          "'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'",
      },
      { name: 'estado_asistencia_enum', values: "'presente', 'ausente'" },
      {
        name: 'tipo_reporte_enum',
        values:
          "'asistencia_clase', 'asistencia_alumno', 'asistencia_periodo', 'asistencia_global'",
      },
      { name: 'formato_reporte_enum', values: "'pdf', 'excel', 'csv'" },
      { name: 'tanda_nutricion_enum', values: "'matutina', 'vespertina'" },
      { name: 'ciclo_educativo_enum', values: "'Primaria', 'Secundaria'" },
      {
        name: 'tipo_ayuda_enum',
        values:
          "'medica', 'alimentos', 'pequeno_negocio', 'educacion', 'otros'",
      },
      {
        name: 'estado_ayuda_enum',
        values: "'pendiente', 'aprobada', 'rechazada'",
      },
    ];

    for (const e of enums) {
      await queryRunner.query(`
        DO $$ BEGIN
          CREATE TYPE "public"."${e.name}" AS ENUM(${e.values});
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);
    }

    // Tables with IF NOT EXISTS via DO blocks
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nombre" character varying(100) NOT NULL,
        "descripcion" character varying(255),
        "es_super_admin" boolean NOT NULL DEFAULT false,
        "activo" boolean NOT NULL DEFAULT true,
        "creado_en" TIMESTAMP NOT NULL DEFAULT now(),
        "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_roles_nombre" UNIQUE ("nombre"),
        CONSTRAINT "PK_roles" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "permisos" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "codigo" character varying(100) NOT NULL,
        "nombre" character varying(100) NOT NULL,
        "modulo" character varying(50) NOT NULL,
        "accion" character varying(50) NOT NULL,
        "descripcion" character varying(255),
        CONSTRAINT "UQ_permisos_codigo" UNIQUE ("codigo"),
        CONSTRAINT "PK_permisos" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "roles_permisos" (
        "rol_id" uuid NOT NULL,
        "permiso_id" uuid NOT NULL,
        CONSTRAINT "PK_roles_permisos" PRIMARY KEY ("rol_id", "permiso_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "usuarios" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nombre" character varying(100) NOT NULL,
        "correo" character varying(100) NOT NULL,
        "password_hash" character varying NOT NULL,
        "rol_id" uuid,
        "activo" boolean NOT NULL DEFAULT true,
        "primer_login" boolean NOT NULL DEFAULT true,
        "creado_en" TIMESTAMP NOT NULL DEFAULT now(),
        "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_usuarios_correo" UNIQUE ("correo"),
        CONSTRAINT "PK_usuarios" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tutores" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nombre" character varying(100) NOT NULL,
        "apellido" character varying(100),
        "telefono" character varying(20),
        "correo" character varying(100),
        "especialidad" text,
        "usuario_id" uuid,
        "activo" boolean NOT NULL DEFAULT true,
        "creado_en" TIMESTAMP NOT NULL DEFAULT now(),
        "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tutores" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "horarios" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "dia" "public"."dia_semana_enum" NOT NULL,
        "hora_inicio" TIME NOT NULL,
        "hora_fin" TIME NOT NULL,
        "descripcion" text,
        "activo" boolean NOT NULL DEFAULT true,
        "creado_en" TIMESTAMP NOT NULL DEFAULT now(),
        "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_horarios" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "beneficiarios" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "codigo" character varying(20) NOT NULL,
        "nombre" character varying(100) NOT NULL,
        "apellido" character varying(100),
        "direccion" text,
        "telefono" character varying(20),
        "padre_tutor" character varying(100),
        "fecha_nacimiento" date,
        "foto_url" text,
        "correo" character varying(100),
        "activo" boolean NOT NULL DEFAULT true,
        "creado_en" TIMESTAMP NOT NULL DEFAULT now(),
        "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_beneficiarios_codigo" UNIQUE ("codigo"),
        CONSTRAINT "PK_beneficiarios" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "beneficiario_expedientes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "beneficiario_id" uuid NOT NULL,
        "tipo" character varying(50) NOT NULL DEFAULT 'libre',
        "titulo" character varying(255),
        "mostrar_titulo" boolean NOT NULL DEFAULT true,
        "contenido" text,
        "fecha_evento" date,
        "imagen_base64" text,
        "imagenes_galeria" jsonb,
        "pdfs" jsonb,
        "etiqueta_color" character varying(20),
        "creado_en" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_beneficiario_expedientes" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "clases" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nombre" character varying(100) NOT NULL,
        "descripcion" text,
        "codigo" character varying(50),
        "tutor_id" uuid,
        "capacidad_maxima" integer NOT NULL DEFAULT 0,
        "activo" boolean NOT NULL DEFAULT true,
        "creado_en" TIMESTAMP NOT NULL DEFAULT now(),
        "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_clases" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "clase_horario" (
        "clase_id" uuid NOT NULL,
        "horario_id" uuid NOT NULL,
        CONSTRAINT "PK_clase_horario" PRIMARY KEY ("clase_id", "horario_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "clase_beneficiario" (
        "clase_id" uuid NOT NULL,
        "beneficiario_id" uuid NOT NULL,
        CONSTRAINT "PK_clase_beneficiario" PRIMARY KEY ("clase_id", "beneficiario_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "asistencias" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "clase_id" uuid,
        "beneficiario_id" uuid,
        "fecha" date NOT NULL,
        "estado" "public"."estado_asistencia_enum" NOT NULL DEFAULT 'ausente',
        "observaciones" text,
        "hora_registro" TIME,
        "registrado_por_id" uuid,
        "sincronizado" boolean NOT NULL DEFAULT false,
        "creado_en" TIMESTAMP NOT NULL DEFAULT now(),
        "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_asistencias" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "fotos_asistencia" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "clase_id" uuid,
        "fecha" date NOT NULL,
        "imagen_url" text NOT NULL,
        "nombre_original" character varying(255),
        "creado_en" TIMESTAMP NOT NULL DEFAULT now(),
        "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_fotos_asistencia" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "supervivencias" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nombre" character varying(100) NOT NULL,
        "descripcion" text,
        "codigo" character varying(50),
        "tutor_id" uuid,
        "capacidad_maxima" integer NOT NULL DEFAULT 0,
        "activo" boolean NOT NULL DEFAULT true,
        "creado_en" TIMESTAMP NOT NULL DEFAULT now(),
        "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_supervivencias" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "supervivencia_beneficiario" (
        "supervivencia_id" uuid NOT NULL,
        "beneficiario_id" uuid NOT NULL,
        CONSTRAINT "PK_supervivencia_beneficiario" PRIMARY KEY ("supervivencia_id", "beneficiario_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "asistencias_supervivencia" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "supervivencia_id" uuid NOT NULL,
        "beneficiario_id" uuid NOT NULL,
        "fecha" date NOT NULL,
        "presente" boolean NOT NULL DEFAULT false,
        "observaciones" text,
        "creado_en" TIMESTAMP NOT NULL DEFAULT now(),
        "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_asistencias_supervivencia" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "fotos_asistencia_supervivencia" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "supervivencia_id" uuid NOT NULL,
        "fecha" date NOT NULL,
        "imagen_url" text NOT NULL,
        "nombre_original" character varying(255),
        "creado_en" TIMESTAMP NOT NULL DEFAULT now(),
        "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_fotos_asistencia_supervivencia" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "reportes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tipo" "public"."tipo_reporte_enum" NOT NULL,
        "formato" "public"."formato_reporte_enum" NOT NULL,
        "filtros" json NOT NULL,
        "ruta_archivo" text,
        "generado_por_id" uuid,
        "fecha_inicio" date,
        "fecha_fin" date,
        "creado_en" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reportes" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "menus_nutricion" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "fecha" date NOT NULL,
        "tanda" "public"."tanda_nutricion_enum" NOT NULL,
        "titulo_menu" character varying(255) NOT NULL,
        "meriendas_servidas" integer,
        "observaciones" text,
        "creado_en" TIMESTAMP NOT NULL DEFAULT now(),
        "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_menus_nutricion" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "periodos_merito" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nombre" character varying(100) NOT NULL,
        "anio" integer NOT NULL,
        "estado" character varying NOT NULL DEFAULT 'activo',
        "creado_en" TIMESTAMP NOT NULL DEFAULT now(),
        "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_periodos_merito" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notas_merito" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "periodo_id" uuid NOT NULL,
        "beneficiario_id" uuid NOT NULL,
        "ciclo" "public"."ciclo_educativo_enum" NOT NULL,
        "curso" integer NOT NULL DEFAULT 1,
        "matematicas" numeric(5,2) NOT NULL DEFAULT 0,
        "lengua_espanola" numeric(5,2) NOT NULL DEFAULT 0,
        "naturales" numeric(5,2) NOT NULL DEFAULT 0,
        "sociales" numeric(5,2) NOT NULL DEFAULT 0,
        "promedio" numeric(5,2) NOT NULL DEFAULT 0,
        "creado_en" TIMESTAMP NOT NULL DEFAULT now(),
        "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notas_merito" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ayudas" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nombre_beneficiario" character varying NOT NULL,
        "codigo_beneficiario" character varying NOT NULL,
        "nombre_madre" character varying NOT NULL,
        "nombre_tutor" character varying NOT NULL,
        "tipo" "public"."tipo_ayuda_enum" NOT NULL,
        "tipo_especificacion" character varying,
        "telefono" character varying(20),
        "detalle" text NOT NULL,
        "foto_url" text,
        "foto_entrega_url" text,
        "estado" "public"."estado_ayuda_enum" NOT NULL DEFAULT 'pendiente',
        "creado_en" TIMESTAMP NOT NULL DEFAULT now(),
        "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ayudas" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "comentarios_ayuda" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "contenido" text NOT NULL,
        "autor" character varying(100) NOT NULL,
        "ayuda_id" uuid NOT NULL,
        "creado_en" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_comentarios_ayuda" PRIMARY KEY ("id")
      )
    `);

    // Indexes (use IF NOT EXISTS via DO block)
    const indexes = [
      `CREATE INDEX IF NOT EXISTS "IDX_ROLES_ACTIVO" ON "roles" ("activo")`,
      `CREATE INDEX IF NOT EXISTS "IDX_ROLES_SUPER_ADMIN" ON "roles" ("es_super_admin")`,
      `CREATE INDEX IF NOT EXISTS "IDX_PERMISOS_MODULO" ON "permisos" ("modulo")`,
      `CREATE INDEX IF NOT EXISTS "IDX_roles_permisos_rol" ON "roles_permisos" ("rol_id")`,
      `CREATE INDEX IF NOT EXISTS "IDX_roles_permisos_permiso" ON "roles_permisos" ("permiso_id")`,
      `CREATE INDEX IF NOT EXISTS "IDX_USUARIOS_ROL_ID" ON "usuarios" ("rol_id")`,
      `CREATE INDEX IF NOT EXISTS "IDX_USUARIOS_ACTIVO" ON "usuarios" ("activo")`,
      `CREATE INDEX IF NOT EXISTS "IDX_TUTORES_CORREO" ON "tutores" ("correo")`,
      `CREATE INDEX IF NOT EXISTS "IDX_TUTORES_ACTIVO" ON "tutores" ("activo")`,
      `CREATE INDEX IF NOT EXISTS "IDX_HORARIOS_DIA" ON "horarios" ("dia")`,
      `CREATE INDEX IF NOT EXISTS "IDX_HORARIOS_ACTIVO" ON "horarios" ("activo")`,
      `CREATE INDEX IF NOT EXISTS "IDX_BENEFICIARIOS_ACTIVO" ON "beneficiarios" ("activo")`,
      `CREATE INDEX IF NOT EXISTS "IDX_BENEFICIARIOS_NOMBRE" ON "beneficiarios" ("nombre")`,
      `CREATE INDEX IF NOT EXISTS "IDX_EXPEDIENTES_BENEFICIARIO_ID" ON "beneficiario_expedientes" ("beneficiario_id")`,
      `CREATE INDEX IF NOT EXISTS "IDX_EXPEDIENTES_TIPO" ON "beneficiario_expedientes" ("tipo")`,
      `CREATE INDEX IF NOT EXISTS "IDX_EXPEDIENTES_FECHA_EVENTO" ON "beneficiario_expedientes" ("fecha_evento")`,
      `CREATE INDEX IF NOT EXISTS "IDX_CLASES_TUTOR_ID" ON "clases" ("tutor_id")`,
      `CREATE INDEX IF NOT EXISTS "IDX_CLASES_CODIGO" ON "clases" ("codigo")`,
      `CREATE INDEX IF NOT EXISTS "IDX_CLASES_ACTIVO" ON "clases" ("activo")`,
      `CREATE INDEX IF NOT EXISTS "IDX_clase_horario_clase" ON "clase_horario" ("clase_id")`,
      `CREATE INDEX IF NOT EXISTS "IDX_clase_horario_horario" ON "clase_horario" ("horario_id")`,
      `CREATE INDEX IF NOT EXISTS "IDX_clase_beneficiario_clase" ON "clase_beneficiario" ("clase_id")`,
      `CREATE INDEX IF NOT EXISTS "IDX_clase_beneficiario_beneficiario" ON "clase_beneficiario" ("beneficiario_id")`,
      `CREATE INDEX IF NOT EXISTS "IDX_ASISTENCIAS_CLASE_ID" ON "asistencias" ("clase_id")`,
      `CREATE INDEX IF NOT EXISTS "IDX_ASISTENCIAS_BENEFICIARIO_ID" ON "asistencias" ("beneficiario_id")`,
      `CREATE INDEX IF NOT EXISTS "IDX_ASISTENCIAS_FECHA" ON "asistencias" ("fecha")`,
      `CREATE INDEX IF NOT EXISTS "IDX_ASISTENCIAS_ESTADO" ON "asistencias" ("estado")`,
      `CREATE INDEX IF NOT EXISTS "IDX_ASISTENCIAS_REGISTRADO_POR" ON "asistencias" ("registrado_por_id")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_ASISTENCIAS_UNICA" ON "asistencias" ("clase_id", "beneficiario_id", "fecha")`,
      `CREATE INDEX IF NOT EXISTS "IDX_FOTOS_ASIST_CLASE_FECHA" ON "fotos_asistencia" ("clase_id", "fecha")`,
      `CREATE INDEX IF NOT EXISTS "IDX_FOTOS_ASIST_CLASE_ID" ON "fotos_asistencia" ("clase_id")`,
      `CREATE INDEX IF NOT EXISTS "IDX_FOTOS_ASIST_FECHA" ON "fotos_asistencia" ("fecha")`,
      `CREATE INDEX IF NOT EXISTS "IDX_SUPERVIVENCIAS_TUTOR_ID" ON "supervivencias" ("tutor_id")`,
      `CREATE INDEX IF NOT EXISTS "IDX_SUPERVIVENCIAS_CODIGO" ON "supervivencias" ("codigo")`,
      `CREATE INDEX IF NOT EXISTS "IDX_SUPERVIVENCIAS_ACTIVO" ON "supervivencias" ("activo")`,
      `CREATE INDEX IF NOT EXISTS "IDX_superv_benef_superv" ON "supervivencia_beneficiario" ("supervivencia_id")`,
      `CREATE INDEX IF NOT EXISTS "IDX_superv_benef_benef" ON "supervivencia_beneficiario" ("beneficiario_id")`,
      `CREATE INDEX IF NOT EXISTS "IDX_ASIS_SUPERV_SUPERVIVENCIA_ID" ON "asistencias_supervivencia" ("supervivencia_id")`,
      `CREATE INDEX IF NOT EXISTS "IDX_ASIS_SUPERV_BENEFICIARIO_ID" ON "asistencias_supervivencia" ("beneficiario_id")`,
      `CREATE INDEX IF NOT EXISTS "IDX_ASIS_SUPERV_FECHA" ON "asistencias_supervivencia" ("fecha")`,
      `CREATE INDEX IF NOT EXISTS "IDX_ASIS_SUPERV_COMPOSITE" ON "asistencias_supervivencia" ("supervivencia_id", "fecha")`,
      `CREATE INDEX IF NOT EXISTS "IDX_FOTOS_SUPERV_COMPOSITE" ON "fotos_asistencia_supervivencia" ("supervivencia_id", "fecha")`,
      `CREATE INDEX IF NOT EXISTS "IDX_FOTOS_SUPERV_SUPERVIVENCIA_ID" ON "fotos_asistencia_supervivencia" ("supervivencia_id")`,
      `CREATE INDEX IF NOT EXISTS "IDX_FOTOS_SUPERV_FECHA" ON "fotos_asistencia_supervivencia" ("fecha")`,
      `CREATE INDEX IF NOT EXISTS "IDX_REPORTES_TIPO" ON "reportes" ("tipo")`,
      `CREATE INDEX IF NOT EXISTS "IDX_REPORTES_FORMATO" ON "reportes" ("formato")`,
      `CREATE INDEX IF NOT EXISTS "IDX_REPORTES_GENERADO_POR_ID" ON "reportes" ("generado_por_id")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_menus_nutricion_fecha_tanda" ON "menus_nutricion" ("fecha", "tanda")`,
      `CREATE INDEX IF NOT EXISTS "IDX_PERIODOS_MERITO_ANIO" ON "periodos_merito" ("anio")`,
      `CREATE INDEX IF NOT EXISTS "IDX_PERIODOS_MERITO_ESTADO" ON "periodos_merito" ("estado")`,
      `CREATE INDEX IF NOT EXISTS "IDX_NOTAS_MERITO_PERIODO_ID" ON "notas_merito" ("periodo_id")`,
      `CREATE INDEX IF NOT EXISTS "IDX_NOTAS_MERITO_BENEFICIARIO_ID" ON "notas_merito" ("beneficiario_id")`,
      `CREATE INDEX IF NOT EXISTS "IDX_NOTAS_MERITO_CICLO" ON "notas_merito" ("ciclo")`,
      `CREATE INDEX IF NOT EXISTS "IDX_AYUDAS_CODIGO_BENEF" ON "ayudas" ("codigo_beneficiario")`,
      `CREATE INDEX IF NOT EXISTS "IDX_AYUDAS_TIPO" ON "ayudas" ("tipo")`,
      `CREATE INDEX IF NOT EXISTS "IDX_AYUDAS_ESTADO" ON "ayudas" ("estado")`,
      `CREATE INDEX IF NOT EXISTS "IDX_COMENTARIOS_AYUDA_ID" ON "comentarios_ayuda" ("ayuda_id")`,
    ];

    for (const idx of indexes) {
      await queryRunner.query(idx);
    }

    // Foreign keys (skip if already exist using exception handling)
    const fks = [
      `ALTER TABLE "roles_permisos" ADD CONSTRAINT IF NOT EXISTS "FK_roles_permisos_rol" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE CASCADE`,
      `ALTER TABLE "roles_permisos" ADD CONSTRAINT IF NOT EXISTS "FK_roles_permisos_permiso" FOREIGN KEY ("permiso_id") REFERENCES "permisos"("id") ON DELETE CASCADE`,
      `ALTER TABLE "usuarios" ADD CONSTRAINT IF NOT EXISTS "FK_usuarios_rol" FOREIGN KEY ("rol_id") REFERENCES "roles"("id")`,
      `ALTER TABLE "tutores" ADD CONSTRAINT IF NOT EXISTS "FK_tutores_usuario" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id")`,
      `ALTER TABLE "beneficiario_expedientes" ADD CONSTRAINT IF NOT EXISTS "FK_expedientes_beneficiario" FOREIGN KEY ("beneficiario_id") REFERENCES "beneficiarios"("id") ON DELETE CASCADE`,
      `ALTER TABLE "clases" ADD CONSTRAINT IF NOT EXISTS "FK_clases_tutor" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id")`,
      `ALTER TABLE "clase_horario" ADD CONSTRAINT IF NOT EXISTS "FK_clase_horario_clase" FOREIGN KEY ("clase_id") REFERENCES "clases"("id") ON DELETE CASCADE`,
      `ALTER TABLE "clase_horario" ADD CONSTRAINT IF NOT EXISTS "FK_clase_horario_horario" FOREIGN KEY ("horario_id") REFERENCES "horarios"("id") ON DELETE CASCADE`,
      `ALTER TABLE "clase_beneficiario" ADD CONSTRAINT IF NOT EXISTS "FK_clase_benef_clase" FOREIGN KEY ("clase_id") REFERENCES "clases"("id") ON DELETE CASCADE`,
      `ALTER TABLE "clase_beneficiario" ADD CONSTRAINT IF NOT EXISTS "FK_clase_benef_beneficiario" FOREIGN KEY ("beneficiario_id") REFERENCES "beneficiarios"("id") ON DELETE CASCADE`,
      `ALTER TABLE "asistencias" ADD CONSTRAINT IF NOT EXISTS "FK_asistencias_clase" FOREIGN KEY ("clase_id") REFERENCES "clases"("id")`,
      `ALTER TABLE "asistencias" ADD CONSTRAINT IF NOT EXISTS "FK_asistencias_beneficiario" FOREIGN KEY ("beneficiario_id") REFERENCES "beneficiarios"("id")`,
      `ALTER TABLE "asistencias" ADD CONSTRAINT IF NOT EXISTS "FK_asistencias_registrado_por" FOREIGN KEY ("registrado_por_id") REFERENCES "usuarios"("id")`,
      `ALTER TABLE "fotos_asistencia" ADD CONSTRAINT IF NOT EXISTS "FK_fotos_asist_clase" FOREIGN KEY ("clase_id") REFERENCES "clases"("id") ON DELETE CASCADE`,
      `ALTER TABLE "supervivencias" ADD CONSTRAINT IF NOT EXISTS "FK_supervivencias_tutor" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id")`,
      `ALTER TABLE "supervivencia_beneficiario" ADD CONSTRAINT IF NOT EXISTS "FK_sb_supervivencia" FOREIGN KEY ("supervivencia_id") REFERENCES "supervivencias"("id") ON DELETE CASCADE`,
      `ALTER TABLE "supervivencia_beneficiario" ADD CONSTRAINT IF NOT EXISTS "FK_sb_beneficiario" FOREIGN KEY ("beneficiario_id") REFERENCES "beneficiarios"("id") ON DELETE CASCADE`,
      `ALTER TABLE "asistencias_supervivencia" ADD CONSTRAINT IF NOT EXISTS "FK_asuperv_supervivencia" FOREIGN KEY ("supervivencia_id") REFERENCES "supervivencias"("id")`,
      `ALTER TABLE "asistencias_supervivencia" ADD CONSTRAINT IF NOT EXISTS "FK_asuperv_beneficiario" FOREIGN KEY ("beneficiario_id") REFERENCES "beneficiarios"("id")`,
      `ALTER TABLE "fotos_asistencia_supervivencia" ADD CONSTRAINT IF NOT EXISTS "FK_fsuperv_supervivencia" FOREIGN KEY ("supervivencia_id") REFERENCES "supervivencias"("id") ON DELETE CASCADE`,
      `ALTER TABLE "reportes" ADD CONSTRAINT IF NOT EXISTS "FK_reportes_generado_por" FOREIGN KEY ("generado_por_id") REFERENCES "usuarios"("id")`,
      `ALTER TABLE "notas_merito" ADD CONSTRAINT IF NOT EXISTS "FK_notas_merito_periodo" FOREIGN KEY ("periodo_id") REFERENCES "periodos_merito"("id") ON DELETE CASCADE`,
      `ALTER TABLE "notas_merito" ADD CONSTRAINT IF NOT EXISTS "FK_notas_merito_beneficiario" FOREIGN KEY ("beneficiario_id") REFERENCES "beneficiarios"("id") ON DELETE CASCADE`,
      `ALTER TABLE "comentarios_ayuda" ADD CONSTRAINT IF NOT EXISTS "FK_comentarios_ayuda" FOREIGN KEY ("ayuda_id") REFERENCES "ayudas"("id") ON DELETE CASCADE`,
    ];

    for (const fk of fks) {
      try {
        await queryRunner.query(fk);
      } catch {
        // Constraint already exists, skip
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No-op for safety
    void queryRunner;
    await Promise.resolve();
  }
}
