import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1784300000000 implements MigrationInterface {
  name = 'InitialSchema1784300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enum types
    await queryRunner.query(`
      CREATE TYPE "public"."dia_semana_enum" AS ENUM('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."estado_asistencia_enum" AS ENUM('presente', 'ausente')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."tipo_reporte_enum" AS ENUM('asistencia_clase', 'asistencia_alumno', 'asistencia_periodo', 'asistencia_global')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."formato_reporte_enum" AS ENUM('pdf', 'excel', 'csv')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."tanda_nutricion_enum" AS ENUM('matutina', 'vespertina')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."ciclo_educativo_enum" AS ENUM('Primaria', 'Secundaria')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."tipo_ayuda_enum" AS ENUM('medica', 'alimentos', 'pequeno_negocio', 'educacion', 'otros')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."estado_ayuda_enum" AS ENUM('pendiente', 'aprobada', 'rechazada')
    `);

    // roles
    await queryRunner.query(`
      CREATE TABLE "roles" (
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
    await queryRunner.query(
      `CREATE INDEX "IDX_ROLES_ACTIVO" ON "roles" ("activo")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ROLES_SUPER_ADMIN" ON "roles" ("es_super_admin")`,
    );

    // permisos
    await queryRunner.query(`
      CREATE TABLE "permisos" (
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
    await queryRunner.query(
      `CREATE INDEX "IDX_PERMISOS_MODULO" ON "permisos" ("modulo")`,
    );

    // roles_permisos
    await queryRunner.query(`
      CREATE TABLE "roles_permisos" (
        "rol_id" uuid NOT NULL,
        "permiso_id" uuid NOT NULL,
        CONSTRAINT "PK_roles_permisos" PRIMARY KEY ("rol_id", "permiso_id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_roles_permisos_rol" ON "roles_permisos" ("rol_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_roles_permisos_permiso" ON "roles_permisos" ("permiso_id")`,
    );

    // usuarios
    await queryRunner.query(`
      CREATE TABLE "usuarios" (
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
    await queryRunner.query(
      `CREATE INDEX "IDX_USUARIOS_ROL_ID" ON "usuarios" ("rol_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_USUARIOS_ACTIVO" ON "usuarios" ("activo")`,
    );

    // tutores
    await queryRunner.query(`
      CREATE TABLE "tutores" (
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
    await queryRunner.query(
      `CREATE INDEX "IDX_TUTORES_CORREO" ON "tutores" ("correo")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_TUTORES_ACTIVO" ON "tutores" ("activo")`,
    );

    // horarios
    await queryRunner.query(`
      CREATE TABLE "horarios" (
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
    await queryRunner.query(
      `CREATE INDEX "IDX_HORARIOS_DIA" ON "horarios" ("dia")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_HORARIOS_ACTIVO" ON "horarios" ("activo")`,
    );

    // beneficiarios
    await queryRunner.query(`
      CREATE TABLE "beneficiarios" (
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
    await queryRunner.query(
      `CREATE INDEX "IDX_BENEFICIARIOS_ACTIVO" ON "beneficiarios" ("activo")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_BENEFICIARIOS_NOMBRE" ON "beneficiarios" ("nombre")`,
    );

    // beneficiario_expedientes
    await queryRunner.query(`
      CREATE TABLE "beneficiario_expedientes" (
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
    await queryRunner.query(
      `CREATE INDEX "IDX_EXPEDIENTES_BENEFICIARIO_ID" ON "beneficiario_expedientes" ("beneficiario_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_EXPEDIENTES_TIPO" ON "beneficiario_expedientes" ("tipo")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_EXPEDIENTES_FECHA_EVENTO" ON "beneficiario_expedientes" ("fecha_evento")`,
    );

    // clases
    await queryRunner.query(`
      CREATE TABLE "clases" (
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
    await queryRunner.query(
      `CREATE INDEX "IDX_CLASES_TUTOR_ID" ON "clases" ("tutor_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_CLASES_CODIGO" ON "clases" ("codigo")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_CLASES_ACTIVO" ON "clases" ("activo")`,
    );

    // clase_horario
    await queryRunner.query(`
      CREATE TABLE "clase_horario" (
        "clase_id" uuid NOT NULL,
        "horario_id" uuid NOT NULL,
        CONSTRAINT "PK_clase_horario" PRIMARY KEY ("clase_id", "horario_id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_clase_horario_clase" ON "clase_horario" ("clase_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_clase_horario_horario" ON "clase_horario" ("horario_id")`,
    );

    // clase_beneficiario
    await queryRunner.query(`
      CREATE TABLE "clase_beneficiario" (
        "clase_id" uuid NOT NULL,
        "beneficiario_id" uuid NOT NULL,
        CONSTRAINT "PK_clase_beneficiario" PRIMARY KEY ("clase_id", "beneficiario_id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_clase_beneficiario_clase" ON "clase_beneficiario" ("clase_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_clase_beneficiario_beneficiario" ON "clase_beneficiario" ("beneficiario_id")`,
    );

    // asistencias
    await queryRunner.query(`
      CREATE TABLE "asistencias" (
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
    await queryRunner.query(
      `CREATE INDEX "IDX_ASISTENCIAS_CLASE_ID" ON "asistencias" ("clase_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ASISTENCIAS_BENEFICIARIO_ID" ON "asistencias" ("beneficiario_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ASISTENCIAS_FECHA" ON "asistencias" ("fecha")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ASISTENCIAS_ESTADO" ON "asistencias" ("estado")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ASISTENCIAS_REGISTRADO_POR" ON "asistencias" ("registrado_por_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_ASISTENCIAS_UNICA" ON "asistencias" ("clase_id", "beneficiario_id", "fecha")`,
    );

    // fotos_asistencia
    await queryRunner.query(`
      CREATE TABLE "fotos_asistencia" (
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
    await queryRunner.query(
      `CREATE INDEX "IDX_FOTOS_ASIST_CLASE_FECHA" ON "fotos_asistencia" ("clase_id", "fecha")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FOTOS_ASIST_CLASE_ID" ON "fotos_asistencia" ("clase_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FOTOS_ASIST_FECHA" ON "fotos_asistencia" ("fecha")`,
    );

    // supervivencias
    await queryRunner.query(`
      CREATE TABLE "supervivencias" (
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
    await queryRunner.query(
      `CREATE INDEX "IDX_SUPERVIVENCIAS_TUTOR_ID" ON "supervivencias" ("tutor_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_SUPERVIVENCIAS_CODIGO" ON "supervivencias" ("codigo")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_SUPERVIVENCIAS_ACTIVO" ON "supervivencias" ("activo")`,
    );

    // supervivencia_beneficiario
    await queryRunner.query(`
      CREATE TABLE "supervivencia_beneficiario" (
        "supervivencia_id" uuid NOT NULL,
        "beneficiario_id" uuid NOT NULL,
        CONSTRAINT "PK_supervivencia_beneficiario" PRIMARY KEY ("supervivencia_id", "beneficiario_id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_superv_benef_superv" ON "supervivencia_beneficiario" ("supervivencia_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_superv_benef_benef" ON "supervivencia_beneficiario" ("beneficiario_id")`,
    );

    // asistencias_supervivencia
    await queryRunner.query(`
      CREATE TABLE "asistencias_supervivencia" (
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
    await queryRunner.query(
      `CREATE INDEX "IDX_ASIS_SUPERV_SUPERVIVENCIA_ID" ON "asistencias_supervivencia" ("supervivencia_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ASIS_SUPERV_BENEFICIARIO_ID" ON "asistencias_supervivencia" ("beneficiario_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ASIS_SUPERV_FECHA" ON "asistencias_supervivencia" ("fecha")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ASIS_SUPERV_COMPOSITE" ON "asistencias_supervivencia" ("supervivencia_id", "fecha")`,
    );

    // fotos_asistencia_supervivencia
    await queryRunner.query(`
      CREATE TABLE "fotos_asistencia_supervivencia" (
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
    await queryRunner.query(
      `CREATE INDEX "IDX_FOTOS_SUPERV_COMPOSITE" ON "fotos_asistencia_supervivencia" ("supervivencia_id", "fecha")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FOTOS_SUPERV_SUPERVIVENCIA_ID" ON "fotos_asistencia_supervivencia" ("supervivencia_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FOTOS_SUPERV_FECHA" ON "fotos_asistencia_supervivencia" ("fecha")`,
    );

    // reportes
    await queryRunner.query(`
      CREATE TABLE "reportes" (
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
    await queryRunner.query(
      `CREATE INDEX "IDX_REPORTES_TIPO" ON "reportes" ("tipo")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_REPORTES_FORMATO" ON "reportes" ("formato")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_REPORTES_GENERADO_POR_ID" ON "reportes" ("generado_por_id")`,
    );

    // menus_nutricion
    await queryRunner.query(`
      CREATE TABLE "menus_nutricion" (
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
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_menus_nutricion_fecha_tanda" ON "menus_nutricion" ("fecha", "tanda")`,
    );

    // periodos_merito
    await queryRunner.query(`
      CREATE TABLE "periodos_merito" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nombre" character varying(100) NOT NULL,
        "anio" integer NOT NULL,
        "estado" character varying NOT NULL DEFAULT 'activo',
        "creado_en" TIMESTAMP NOT NULL DEFAULT now(),
        "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_periodos_merito" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_PERIODOS_MERITO_ANIO" ON "periodos_merito" ("anio")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_PERIODOS_MERITO_ESTADO" ON "periodos_merito" ("estado")`,
    );

    // notas_merito
    await queryRunner.query(`
      CREATE TABLE "notas_merito" (
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
    await queryRunner.query(
      `CREATE INDEX "IDX_NOTAS_MERITO_PERIODO_ID" ON "notas_merito" ("periodo_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_NOTAS_MERITO_BENEFICIARIO_ID" ON "notas_merito" ("beneficiario_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_NOTAS_MERITO_CICLO" ON "notas_merito" ("ciclo")`,
    );

    // ayudas
    await queryRunner.query(`
      CREATE TABLE "ayudas" (
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
    await queryRunner.query(
      `CREATE INDEX "IDX_AYUDAS_CODIGO_BENEF" ON "ayudas" ("codigo_beneficiario")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_AYUDAS_TIPO" ON "ayudas" ("tipo")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_AYUDAS_ESTADO" ON "ayudas" ("estado")`,
    );

    // comentarios_ayuda
    await queryRunner.query(`
      CREATE TABLE "comentarios_ayuda" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "contenido" text NOT NULL,
        "autor" character varying(100) NOT NULL,
        "ayuda_id" uuid NOT NULL,
        "creado_en" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_comentarios_ayuda" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_COMENTARIOS_AYUDA_ID" ON "comentarios_ayuda" ("ayuda_id")`,
    );

    // Foreign keys
    await queryRunner.query(
      `ALTER TABLE "roles_permisos" ADD CONSTRAINT "FK_roles_permisos_rol" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles_permisos" ADD CONSTRAINT "FK_roles_permisos_permiso" FOREIGN KEY ("permiso_id") REFERENCES "permisos"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" ADD CONSTRAINT "FK_usuarios_rol" FOREIGN KEY ("rol_id") REFERENCES "roles"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "tutores" ADD CONSTRAINT "FK_tutores_usuario" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "beneficiario_expedientes" ADD CONSTRAINT "FK_expedientes_beneficiario" FOREIGN KEY ("beneficiario_id") REFERENCES "beneficiarios"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "clases" ADD CONSTRAINT "FK_clases_tutor" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "clase_horario" ADD CONSTRAINT "FK_clase_horario_clase" FOREIGN KEY ("clase_id") REFERENCES "clases"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "clase_horario" ADD CONSTRAINT "FK_clase_horario_horario" FOREIGN KEY ("horario_id") REFERENCES "horarios"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "clase_beneficiario" ADD CONSTRAINT "FK_clase_benef_clase" FOREIGN KEY ("clase_id") REFERENCES "clases"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "clase_beneficiario" ADD CONSTRAINT "FK_clase_benef_beneficiario" FOREIGN KEY ("beneficiario_id") REFERENCES "beneficiarios"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" ADD CONSTRAINT "FK_asistencias_clase" FOREIGN KEY ("clase_id") REFERENCES "clases"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" ADD CONSTRAINT "FK_asistencias_beneficiario" FOREIGN KEY ("beneficiario_id") REFERENCES "beneficiarios"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" ADD CONSTRAINT "FK_asistencias_registrado_por" FOREIGN KEY ("registrado_por_id") REFERENCES "usuarios"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "fotos_asistencia" ADD CONSTRAINT "FK_fotos_asist_clase" FOREIGN KEY ("clase_id") REFERENCES "clases"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervivencias" ADD CONSTRAINT "FK_supervivencias_tutor" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervivencia_beneficiario" ADD CONSTRAINT "FK_sb_supervivencia" FOREIGN KEY ("supervivencia_id") REFERENCES "supervivencias"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervivencia_beneficiario" ADD CONSTRAINT "FK_sb_beneficiario" FOREIGN KEY ("beneficiario_id") REFERENCES "beneficiarios"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias_supervivencia" ADD CONSTRAINT "FK_asuperv_supervivencia" FOREIGN KEY ("supervivencia_id") REFERENCES "supervivencias"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias_supervivencia" ADD CONSTRAINT "FK_asuperv_beneficiario" FOREIGN KEY ("beneficiario_id") REFERENCES "beneficiarios"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "fotos_asistencia_supervivencia" ADD CONSTRAINT "FK_fsuperv_supervivencia" FOREIGN KEY ("supervivencia_id") REFERENCES "supervivencias"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "reportes" ADD CONSTRAINT "FK_reportes_generado_por" FOREIGN KEY ("generado_por_id") REFERENCES "usuarios"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "notas_merito" ADD CONSTRAINT "FK_notas_merito_periodo" FOREIGN KEY ("periodo_id") REFERENCES "periodos_merito"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "notas_merito" ADD CONSTRAINT "FK_notas_merito_beneficiario" FOREIGN KEY ("beneficiario_id") REFERENCES "beneficiarios"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "comentarios_ayuda" ADD CONSTRAINT "FK_comentarios_ayuda" FOREIGN KEY ("ayuda_id") REFERENCES "ayudas"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comentarios_ayuda" DROP CONSTRAINT "FK_comentarios_ayuda"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notas_merito" DROP CONSTRAINT "FK_notas_merito_beneficiario"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notas_merito" DROP CONSTRAINT "FK_notas_merito_periodo"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reportes" DROP CONSTRAINT "FK_reportes_generado_por"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fotos_asistencia_supervivencia" DROP CONSTRAINT "FK_fsuperv_supervivencia"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias_supervivencia" DROP CONSTRAINT "FK_asuperv_beneficiario"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias_supervivencia" DROP CONSTRAINT "FK_asuperv_supervivencia"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervivencia_beneficiario" DROP CONSTRAINT "FK_sb_beneficiario"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervivencia_beneficiario" DROP CONSTRAINT "FK_sb_supervivencia"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervivencias" DROP CONSTRAINT "FK_supervivencias_tutor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fotos_asistencia" DROP CONSTRAINT "FK_fotos_asist_clase"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" DROP CONSTRAINT "FK_asistencias_registrado_por"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" DROP CONSTRAINT "FK_asistencias_beneficiario"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" DROP CONSTRAINT "FK_asistencias_clase"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clase_beneficiario" DROP CONSTRAINT "FK_clase_benef_beneficiario"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clase_beneficiario" DROP CONSTRAINT "FK_clase_benef_clase"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clase_horario" DROP CONSTRAINT "FK_clase_horario_horario"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clase_horario" DROP CONSTRAINT "FK_clase_horario_clase"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clases" DROP CONSTRAINT "FK_clases_tutor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "beneficiario_expedientes" DROP CONSTRAINT "FK_expedientes_beneficiario"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tutores" DROP CONSTRAINT "FK_tutores_usuario"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" DROP CONSTRAINT "FK_usuarios_rol"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles_permisos" DROP CONSTRAINT "FK_roles_permisos_permiso"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles_permisos" DROP CONSTRAINT "FK_roles_permisos_rol"`,
    );

    await queryRunner.query(`DROP TABLE "comentarios_ayuda"`);
    await queryRunner.query(`DROP TABLE "ayudas"`);
    await queryRunner.query(`DROP TABLE "notas_merito"`);
    await queryRunner.query(`DROP TABLE "periodos_merito"`);
    await queryRunner.query(`DROP TABLE "menus_nutricion"`);
    await queryRunner.query(`DROP TABLE "reportes"`);
    await queryRunner.query(`DROP TABLE "fotos_asistencia_supervivencia"`);
    await queryRunner.query(`DROP TABLE "asistencias_supervivencia"`);
    await queryRunner.query(`DROP TABLE "supervivencia_beneficiario"`);
    await queryRunner.query(`DROP TABLE "supervivencias"`);
    await queryRunner.query(`DROP TABLE "fotos_asistencia"`);
    await queryRunner.query(`DROP TABLE "asistencias"`);
    await queryRunner.query(`DROP TABLE "clase_beneficiario"`);
    await queryRunner.query(`DROP TABLE "clase_horario"`);
    await queryRunner.query(`DROP TABLE "clases"`);
    await queryRunner.query(`DROP TABLE "beneficiario_expedientes"`);
    await queryRunner.query(`DROP TABLE "beneficiarios"`);
    await queryRunner.query(`DROP TABLE "horarios"`);
    await queryRunner.query(`DROP TABLE "tutores"`);
    await queryRunner.query(`DROP TABLE "usuarios"`);
    await queryRunner.query(`DROP TABLE "roles_permisos"`);
    await queryRunner.query(`DROP TABLE "permisos"`);
    await queryRunner.query(`DROP TABLE "roles"`);

    await queryRunner.query(`DROP TYPE "public"."estado_ayuda_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tipo_ayuda_enum"`);
    await queryRunner.query(`DROP TYPE "public"."ciclo_educativo_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tanda_nutricion_enum"`);
    await queryRunner.query(`DROP TYPE "public"."formato_reporte_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tipo_reporte_enum"`);
    await queryRunner.query(`DROP TYPE "public"."estado_asistencia_enum"`);
    await queryRunner.query(`DROP TYPE "public"."dia_semana_enum"`);
  }
}
