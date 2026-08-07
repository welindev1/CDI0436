import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClubsModule1783687669938 implements MigrationInterface {
  name = 'AddClubsModule1783687669938';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "permisos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "codigo" character varying(100) NOT NULL, "nombre" character varying(100) NOT NULL, "modulo" character varying(50) NOT NULL, "accion" character varying(50) NOT NULL, "descripcion" character varying(255), CONSTRAINT "UQ_40d964f2742b2f4e3f379d3f460" UNIQUE ("codigo"), CONSTRAINT "PK_3127bd9cfeb13ae76186d0d9b38" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_PERMISOS_MODULO" ON "permisos" ("modulo") `,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying(100) NOT NULL, "descripcion" character varying(255), "es_super_admin" boolean NOT NULL DEFAULT false, "activo" boolean NOT NULL DEFAULT true, "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a5be7aa67e759e347b1c6464e10" UNIQUE ("nombre"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ROLES_SUPER_ADMIN" ON "roles" ("es_super_admin") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ROLES_ACTIVO" ON "roles" ("activo") `,
    );
    await queryRunner.query(
      `CREATE TABLE "usuarios" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying(100) NOT NULL, "correo" character varying(100) NOT NULL, "password_hash" character varying NOT NULL, "rol_id" uuid, "activo" boolean NOT NULL DEFAULT true, "primer_login" boolean NOT NULL DEFAULT true, "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_63665765c1a778a770c9bd585d3" UNIQUE ("correo"), CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_USUARIOS_ACTIVO" ON "usuarios" ("activo") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_USUARIOS_ROL_ID" ON "usuarios" ("rol_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."horarios_dia_enum" AS ENUM('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')`,
    );
    await queryRunner.query(
      `CREATE TABLE "horarios" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dia" "public"."horarios_dia_enum" NOT NULL, "hora_inicio" TIME NOT NULL, "hora_fin" TIME NOT NULL, "descripcion" text, "activo" boolean NOT NULL DEFAULT true, "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c69b602fc8441125f1310a4858d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_HORARIOS_ACTIVO" ON "horarios" ("activo") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_HORARIOS_DIA" ON "horarios" ("dia") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."asistencias_estado_enum" AS ENUM('presente', 'ausente')`,
    );
    await queryRunner.query(
      `CREATE TABLE "asistencias" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fecha" date NOT NULL, "estado" "public"."asistencias_estado_enum" NOT NULL DEFAULT 'ausente', "observaciones" text, "hora_registro" TIME, "sincronizado" boolean NOT NULL DEFAULT false, "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(), "claseId" uuid, "beneficiarioId" uuid, "registradoPorId" uuid, CONSTRAINT "PK_f7eb09d44d6c7dd4ccc6eb29af8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ASISTENCIAS_REGISTRADO_POR" ON "asistencias" ("registradoPorId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ASISTENCIAS_ESTADO" ON "asistencias" ("estado") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ASISTENCIAS_FECHA" ON "asistencias" ("fecha") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ASISTENCIAS_BENEFICIARIO_ID" ON "asistencias" ("beneficiarioId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ASISTENCIAS_CLASE_ID" ON "asistencias" ("claseId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_ASISTENCIAS_UNICA" ON "asistencias" ("claseId", "beneficiarioId", "fecha") `,
    );
    await queryRunner.query(
      `CREATE TABLE "supervivencias" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying(100) NOT NULL, "descripcion" text, "codigo" character varying(50), "capacidad_maxima" integer NOT NULL DEFAULT '0', "activo" boolean NOT NULL DEFAULT true, "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(), "tutor_id" uuid, CONSTRAINT "PK_51907775e4947bbea94d0f53fc3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_SUPERVIVENCIAS_ACTIVO" ON "supervivencias" ("activo") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_SUPERVIVENCIAS_CODIGO" ON "supervivencias" ("codigo") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_SUPERVIVENCIAS_TUTOR_ID" ON "supervivencias" ("tutor_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "asistencias_club" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fecha" date NOT NULL, "presente" boolean NOT NULL DEFAULT false, "observaciones" text, "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(), "club_id" uuid NOT NULL, "beneficiario_id" uuid NOT NULL, CONSTRAINT "PK_e33348cae231c2fb0c5d916c95e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ASIS_CLUB_COMPOSITE" ON "asistencias_club" ("club_id", "fecha") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ASIS_CLUB_FECHA" ON "asistencias_club" ("fecha") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ASIS_CLUB_BENEFICIARIO_ID" ON "asistencias_club" ("beneficiario_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ASIS_CLUB_CLUB_ID" ON "asistencias_club" ("club_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "clubes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying(100) NOT NULL, "descripcion" text, "codigo" character varying(50), "capacidad_maxima" integer NOT NULL DEFAULT '0', "activo" boolean NOT NULL DEFAULT true, "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(), "tutor_id" uuid, CONSTRAINT "PK_fb4807a2b8fe43f7bd7b80cf146" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_CLUBES_ACTIVO" ON "clubes" ("activo") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_CLUBES_CODIGO" ON "clubes" ("codigo") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_CLUBES_TUTOR_ID" ON "clubes" ("tutor_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "beneficiario_expedientes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tipo" character varying(50) NOT NULL DEFAULT 'libre', "titulo" character varying(255), "mostrar_titulo" boolean NOT NULL DEFAULT true, "contenido" text, "fecha_evento" date, "imagen_base64" text, "imagenes_galeria" jsonb, "pdfs" jsonb, "etiqueta_color" character varying(20), "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "beneficiario_id" uuid, CONSTRAINT "PK_c54b4f56bee0c2c4920630d9069" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_EXPEDIENTES_FECHA_EVENTO" ON "beneficiario_expedientes" ("fecha_evento") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_EXPEDIENTES_TIPO" ON "beneficiario_expedientes" ("tipo") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_EXPEDIENTES_BENEFICIARIO_ID" ON "beneficiario_expedientes" ("beneficiario_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "beneficiarios" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "codigo" character varying(20) NOT NULL, "nombre" character varying(100) NOT NULL, "apellido" character varying(100), "direccion" text, "telefono" character varying(20), "padre_tutor" character varying(100), "fecha_nacimiento" date, "foto_url" text, "correo" character varying(100), "activo" boolean NOT NULL DEFAULT true, "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ee111c148d8586bb0e1b887254a" UNIQUE ("codigo"), CONSTRAINT "PK_73127f865de22f696665a5bc541" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_BENEFICIARIOS_NOMBRE" ON "beneficiarios" ("nombre") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_BENEFICIARIOS_ACTIVO" ON "beneficiarios" ("activo") `,
    );
    await queryRunner.query(
      `CREATE TABLE "clases" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying(100) NOT NULL, "descripcion" text, "codigo" character varying(50), "capacidad_maxima" integer NOT NULL DEFAULT '0', "activo" boolean NOT NULL DEFAULT true, "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(), "tutorId" uuid, CONSTRAINT "PK_c903e73c1efeb60c60fe9193b0b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_CLASES_ACTIVO" ON "clases" ("activo") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_CLASES_CODIGO" ON "clases" ("codigo") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_CLASES_TUTOR_ID" ON "clases" ("tutorId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "tutores" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying(100) NOT NULL, "apellido" character varying(100), "telefono" character varying(20), "correo" character varying(100), "especialidad" text, "activo" boolean NOT NULL DEFAULT true, "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(), "usuarioId" uuid, CONSTRAINT "REL_2cd1b40dea7dcf73fbd737c1fb" UNIQUE ("usuarioId"), CONSTRAINT "PK_fdb2e70ac9a26d6a5095c87b681" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_TUTORES_USUARIO_ID" ON "tutores" ("usuarioId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_TUTORES_ACTIVO" ON "tutores" ("activo") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_TUTORES_CORREO" ON "tutores" ("correo") `,
    );
    await queryRunner.query(
      `CREATE TABLE "fotos_asistencia" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fecha" date NOT NULL, "imagen_url" text NOT NULL, "nombre_original" character varying(255), "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(), "claseId" uuid, CONSTRAINT "PK_9299e3a4952052bd87a19742f62" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FOTOS_ASIST_FECHA" ON "fotos_asistencia" ("fecha") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FOTOS_ASIST_CLASE_ID" ON "fotos_asistencia" ("claseId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FOTOS_ASIST_CLASE_FECHA" ON "fotos_asistencia" ("claseId", "fecha") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reportes_tipo_enum" AS ENUM('asistencia_clase', 'asistencia_alumno', 'asistencia_periodo', 'asistencia_global')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reportes_formato_enum" AS ENUM('pdf', 'excel', 'csv')`,
    );
    await queryRunner.query(
      `CREATE TABLE "reportes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tipo" "public"."reportes_tipo_enum" NOT NULL, "formato" "public"."reportes_formato_enum" NOT NULL, "filtros" json NOT NULL, "ruta_archivo" text, "fecha_inicio" date, "fecha_fin" date, "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "generadoPorId" uuid, CONSTRAINT "PK_4204634633cb4099bc06b27a17e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_REPORTES_GENERADO_POR_ID" ON "reportes" ("generadoPorId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_REPORTES_FORMATO" ON "reportes" ("formato") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_REPORTES_TIPO" ON "reportes" ("tipo") `,
    );
    await queryRunner.query(
      `CREATE TABLE "asistencias_supervivencia" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fecha" date NOT NULL, "presente" boolean NOT NULL DEFAULT false, "observaciones" text, "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(), "supervivencia_id" uuid NOT NULL, "beneficiario_id" uuid NOT NULL, CONSTRAINT "PK_a58f7cccbd3ae45dc664f7f74d8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ASIS_SUPERV_COMPOSITE" ON "asistencias_supervivencia" ("supervivencia_id", "fecha") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ASIS_SUPERV_FECHA" ON "asistencias_supervivencia" ("fecha") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ASIS_SUPERV_BENEFICIARIO_ID" ON "asistencias_supervivencia" ("beneficiario_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ASIS_SUPERV_SUPERVIVENCIA_ID" ON "asistencias_supervivencia" ("supervivencia_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "fotos_asistencia_supervivencia" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fecha" date NOT NULL, "imagen_url" text NOT NULL, "nombre_original" character varying(255), "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(), "supervivencia_id" uuid, CONSTRAINT "PK_976a2a53ccbe916be4b70ddf9f3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FOTOS_SUPERV_FECHA" ON "fotos_asistencia_supervivencia" ("fecha") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FOTOS_SUPERV_SUPERVIVENCIA_ID" ON "fotos_asistencia_supervivencia" ("supervivencia_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FOTOS_SUPERV_COMPOSITE" ON "fotos_asistencia_supervivencia" ("supervivencia_id", "fecha") `,
    );
    await queryRunner.query(
      `CREATE TABLE "fotos_asistencia_club" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fecha" date NOT NULL, "imagen_url" text NOT NULL, "nombre_original" character varying(255), "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(), "club_id" uuid, CONSTRAINT "PK_88e3253a7d3b25a779f2eac0a35" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FOTOS_CLUB_FECHA" ON "fotos_asistencia_club" ("fecha") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FOTOS_CLUB_CLUB_ID" ON "fotos_asistencia_club" ("club_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FOTOS_CLUB_COMPOSITE" ON "fotos_asistencia_club" ("club_id", "fecha") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."menus_nutricion_tanda_enum" AS ENUM('matutina', 'vespertina')`,
    );
    await queryRunner.query(
      `CREATE TABLE "menus_nutricion" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fecha" date NOT NULL, "tanda" "public"."menus_nutricion_tanda_enum" NOT NULL, "titulo_menu" character varying(255) NOT NULL, "meriendas_servidas" integer, "observaciones" text, "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_05dfca509a54475493e128c22cd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_92e65934d4455abc9f50cb1089" ON "menus_nutricion" ("fecha", "tanda") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notas_merito_ciclo_enum" AS ENUM('Primaria', 'Secundaria')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notas_merito" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ciclo" "public"."notas_merito_ciclo_enum" NOT NULL, "curso" integer NOT NULL DEFAULT '1', "matematicas" numeric(5,2) NOT NULL DEFAULT '0', "lengua_espanola" numeric(5,2) NOT NULL DEFAULT '0', "naturales" numeric(5,2) NOT NULL DEFAULT '0', "sociales" numeric(5,2) NOT NULL DEFAULT '0', "promedio" numeric(5,2) NOT NULL DEFAULT '0', "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(), "periodo_id" uuid, "beneficiario_id" uuid, CONSTRAINT "PK_1de575a4aed0304d5475f3f341b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_NOTAS_MERITO_CICLO" ON "notas_merito" ("ciclo") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_NOTAS_MERITO_BENEFICIARIO_ID" ON "notas_merito" ("beneficiario_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_NOTAS_MERITO_PERIODO_ID" ON "notas_merito" ("periodo_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "periodos_merito" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying(100) NOT NULL, "anio" integer NOT NULL, "estado" character varying NOT NULL DEFAULT 'activo', "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_911c67964e2f0540d6dd9597b7a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_PERIODOS_MERITO_ESTADO" ON "periodos_merito" ("estado") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_PERIODOS_MERITO_ANIO" ON "periodos_merito" ("anio") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ayudas_tipo_enum" AS ENUM('medica', 'alimentos', 'pequeno_negocio', 'educacion', 'otros')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ayudas_estado_enum" AS ENUM('pendiente', 'aprobada', 'rechazada')`,
    );
    await queryRunner.query(
      `CREATE TABLE "ayudas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre_beneficiario" character varying NOT NULL, "codigo_beneficiario" character varying NOT NULL, "nombre_madre" character varying NOT NULL, "nombre_tutor" character varying NOT NULL, "tipo" "public"."ayudas_tipo_enum" NOT NULL, "tipo_especificacion" character varying, "telefono" character varying(20), "detalle" text NOT NULL, "foto_url" text, "foto_entrega_url" text, "estado" "public"."ayudas_estado_enum" NOT NULL DEFAULT 'pendiente', "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_504a167345144ab48200d89262c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_AYUDAS_ESTADO" ON "ayudas" ("estado") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_AYUDAS_TIPO" ON "ayudas" ("tipo") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_AYUDAS_CODIGO_BENEF" ON "ayudas" ("codigo_beneficiario") `,
    );
    await queryRunner.query(
      `CREATE TABLE "comentarios_ayuda" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "contenido" text NOT NULL, "autor" character varying(100) NOT NULL, "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "ayuda_id" uuid, CONSTRAINT "PK_faa7ff37c01bd798dcc1f508e68" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_COMENTARIOS_AYUDA_ID" ON "comentarios_ayuda" ("ayuda_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "roles_permisos" ("rol_id" uuid NOT NULL, "permiso_id" uuid NOT NULL, CONSTRAINT "PK_0e1dbe0449ae37ef1b31b0d9474" PRIMARY KEY ("rol_id", "permiso_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dc3cfbcce511233d4bef92d7e3" ON "roles_permisos" ("rol_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ef10d9983fcb45f0024cc7000d" ON "roles_permisos" ("permiso_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "supervivencia_beneficiario" ("supervivencia_id" uuid NOT NULL, "beneficiario_id" uuid NOT NULL, CONSTRAINT "PK_978ad53c0280d5504b692fd9180" PRIMARY KEY ("supervivencia_id", "beneficiario_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_89a9fc433cf0bd43455231b7ca" ON "supervivencia_beneficiario" ("supervivencia_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3d36559529efa9897b3a38cb49" ON "supervivencia_beneficiario" ("beneficiario_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "club_beneficiario" ("club_id" uuid NOT NULL, "beneficiario_id" uuid NOT NULL, CONSTRAINT "PK_1592b0a495ee3f4bbea4d11e85c" PRIMARY KEY ("club_id", "beneficiario_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e95e8db3deac56aa8cc6a25b41" ON "club_beneficiario" ("club_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_538ff4c620f8cc04aed88f744b" ON "club_beneficiario" ("beneficiario_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "clase_horario" ("clase_id" uuid NOT NULL, "horario_id" uuid NOT NULL, CONSTRAINT "PK_8635bd9dfe1902bda3783a28695" PRIMARY KEY ("clase_id", "horario_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3c20c677b0c3879bba978a51d8" ON "clase_horario" ("clase_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2562a357f93f0c00ba0b2a3c19" ON "clase_horario" ("horario_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "clase_beneficiario" ("clase_id" uuid NOT NULL, "beneficiario_id" uuid NOT NULL, CONSTRAINT "PK_e4df5be85dd078fe3f0cf0b4fa2" PRIMARY KEY ("clase_id", "beneficiario_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7f7656be038afbc52540bc40fb" ON "clase_beneficiario" ("clase_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d3c88878bfab8b7b6aacafaa56" ON "clase_beneficiario" ("beneficiario_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" ADD CONSTRAINT "FK_9e519760a660751f4fa21453d3e" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" ADD CONSTRAINT "FK_89fa299e063f84e7915033d24ff" FOREIGN KEY ("claseId") REFERENCES "clases"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" ADD CONSTRAINT "FK_f79354c7ff1bb313e4309d662a7" FOREIGN KEY ("beneficiarioId") REFERENCES "beneficiarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" ADD CONSTRAINT "FK_d528b8072832ed1c486afd5a53c" FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervivencias" ADD CONSTRAINT "FK_28de2d97ddcde9d046144edb488" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias_club" ADD CONSTRAINT "FK_d033d2d8b66ae38094f7dacad9e" FOREIGN KEY ("club_id") REFERENCES "clubes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias_club" ADD CONSTRAINT "FK_87b7df5778b1fa1f1d014197854" FOREIGN KEY ("beneficiario_id") REFERENCES "beneficiarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "clubes" ADD CONSTRAINT "FK_de83ab9b83db4631481c08ddaa1" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "beneficiario_expedientes" ADD CONSTRAINT "FK_aa7bdf389808038a4baebac0c02" FOREIGN KEY ("beneficiario_id") REFERENCES "beneficiarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "clases" ADD CONSTRAINT "FK_d198464173f1e2c0c4f6ab02045" FOREIGN KEY ("tutorId") REFERENCES "tutores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tutores" ADD CONSTRAINT "FK_2cd1b40dea7dcf73fbd737c1fb6" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fotos_asistencia" ADD CONSTRAINT "FK_9c006101f9cf75b713bd7b7ff01" FOREIGN KEY ("claseId") REFERENCES "clases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reportes" ADD CONSTRAINT "FK_a8cb294a9e1c05cb5214eddfcb3" FOREIGN KEY ("generadoPorId") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias_supervivencia" ADD CONSTRAINT "FK_3d6c638c82bfc8f7e8a9a3f4958" FOREIGN KEY ("supervivencia_id") REFERENCES "supervivencias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias_supervivencia" ADD CONSTRAINT "FK_155dfad83fdab997da701fee411" FOREIGN KEY ("beneficiario_id") REFERENCES "beneficiarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fotos_asistencia_supervivencia" ADD CONSTRAINT "FK_d8aedc4aa2dfe2c9fe2bfb7f2cf" FOREIGN KEY ("supervivencia_id") REFERENCES "supervivencias"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fotos_asistencia_club" ADD CONSTRAINT "FK_d39b6d0960afcf6f01c7eaaa8a7" FOREIGN KEY ("club_id") REFERENCES "clubes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notas_merito" ADD CONSTRAINT "FK_c0eba8ae0dce03fe43d57abaf40" FOREIGN KEY ("periodo_id") REFERENCES "periodos_merito"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notas_merito" ADD CONSTRAINT "FK_5598848995573555a8592eaf7c0" FOREIGN KEY ("beneficiario_id") REFERENCES "beneficiarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comentarios_ayuda" ADD CONSTRAINT "FK_61d74bf0423c3468957fed8b79e" FOREIGN KEY ("ayuda_id") REFERENCES "ayudas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles_permisos" ADD CONSTRAINT "FK_dc3cfbcce511233d4bef92d7e3b" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles_permisos" ADD CONSTRAINT "FK_ef10d9983fcb45f0024cc7000d3" FOREIGN KEY ("permiso_id") REFERENCES "permisos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervivencia_beneficiario" ADD CONSTRAINT "FK_89a9fc433cf0bd43455231b7ca8" FOREIGN KEY ("supervivencia_id") REFERENCES "supervivencias"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervivencia_beneficiario" ADD CONSTRAINT "FK_3d36559529efa9897b3a38cb495" FOREIGN KEY ("beneficiario_id") REFERENCES "beneficiarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "club_beneficiario" ADD CONSTRAINT "FK_e95e8db3deac56aa8cc6a25b41a" FOREIGN KEY ("club_id") REFERENCES "clubes"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "club_beneficiario" ADD CONSTRAINT "FK_538ff4c620f8cc04aed88f744b9" FOREIGN KEY ("beneficiario_id") REFERENCES "beneficiarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "clase_horario" ADD CONSTRAINT "FK_3c20c677b0c3879bba978a51d81" FOREIGN KEY ("clase_id") REFERENCES "clases"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "clase_horario" ADD CONSTRAINT "FK_2562a357f93f0c00ba0b2a3c195" FOREIGN KEY ("horario_id") REFERENCES "horarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "clase_beneficiario" ADD CONSTRAINT "FK_7f7656be038afbc52540bc40fb6" FOREIGN KEY ("clase_id") REFERENCES "clases"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "clase_beneficiario" ADD CONSTRAINT "FK_d3c88878bfab8b7b6aacafaa562" FOREIGN KEY ("beneficiario_id") REFERENCES "beneficiarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "clase_beneficiario" DROP CONSTRAINT "FK_d3c88878bfab8b7b6aacafaa562"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clase_beneficiario" DROP CONSTRAINT "FK_7f7656be038afbc52540bc40fb6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clase_horario" DROP CONSTRAINT "FK_2562a357f93f0c00ba0b2a3c195"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clase_horario" DROP CONSTRAINT "FK_3c20c677b0c3879bba978a51d81"`,
    );
    await queryRunner.query(
      `ALTER TABLE "club_beneficiario" DROP CONSTRAINT "FK_538ff4c620f8cc04aed88f744b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "club_beneficiario" DROP CONSTRAINT "FK_e95e8db3deac56aa8cc6a25b41a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervivencia_beneficiario" DROP CONSTRAINT "FK_3d36559529efa9897b3a38cb495"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervivencia_beneficiario" DROP CONSTRAINT "FK_89a9fc433cf0bd43455231b7ca8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles_permisos" DROP CONSTRAINT "FK_ef10d9983fcb45f0024cc7000d3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles_permisos" DROP CONSTRAINT "FK_dc3cfbcce511233d4bef92d7e3b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comentarios_ayuda" DROP CONSTRAINT "FK_61d74bf0423c3468957fed8b79e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notas_merito" DROP CONSTRAINT "FK_5598848995573555a8592eaf7c0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notas_merito" DROP CONSTRAINT "FK_c0eba8ae0dce03fe43d57abaf40"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fotos_asistencia_club" DROP CONSTRAINT "FK_d39b6d0960afcf6f01c7eaaa8a7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fotos_asistencia_supervivencia" DROP CONSTRAINT "FK_d8aedc4aa2dfe2c9fe2bfb7f2cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias_supervivencia" DROP CONSTRAINT "FK_155dfad83fdab997da701fee411"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias_supervivencia" DROP CONSTRAINT "FK_3d6c638c82bfc8f7e8a9a3f4958"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reportes" DROP CONSTRAINT "FK_a8cb294a9e1c05cb5214eddfcb3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fotos_asistencia" DROP CONSTRAINT "FK_9c006101f9cf75b713bd7b7ff01"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tutores" DROP CONSTRAINT "FK_2cd1b40dea7dcf73fbd737c1fb6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clases" DROP CONSTRAINT "FK_d198464173f1e2c0c4f6ab02045"`,
    );
    await queryRunner.query(
      `ALTER TABLE "beneficiario_expedientes" DROP CONSTRAINT "FK_aa7bdf389808038a4baebac0c02"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clubes" DROP CONSTRAINT "FK_de83ab9b83db4631481c08ddaa1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias_club" DROP CONSTRAINT "FK_87b7df5778b1fa1f1d014197854"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias_club" DROP CONSTRAINT "FK_d033d2d8b66ae38094f7dacad9e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supervivencias" DROP CONSTRAINT "FK_28de2d97ddcde9d046144edb488"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" DROP CONSTRAINT "FK_d528b8072832ed1c486afd5a53c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" DROP CONSTRAINT "FK_f79354c7ff1bb313e4309d662a7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asistencias" DROP CONSTRAINT "FK_89fa299e063f84e7915033d24ff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios" DROP CONSTRAINT "FK_9e519760a660751f4fa21453d3e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d3c88878bfab8b7b6aacafaa56"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7f7656be038afbc52540bc40fb"`,
    );
    await queryRunner.query(`DROP TABLE "clase_beneficiario"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2562a357f93f0c00ba0b2a3c19"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3c20c677b0c3879bba978a51d8"`,
    );
    await queryRunner.query(`DROP TABLE "clase_horario"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_538ff4c620f8cc04aed88f744b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e95e8db3deac56aa8cc6a25b41"`,
    );
    await queryRunner.query(`DROP TABLE "club_beneficiario"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3d36559529efa9897b3a38cb49"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_89a9fc433cf0bd43455231b7ca"`,
    );
    await queryRunner.query(`DROP TABLE "supervivencia_beneficiario"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ef10d9983fcb45f0024cc7000d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dc3cfbcce511233d4bef92d7e3"`,
    );
    await queryRunner.query(`DROP TABLE "roles_permisos"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_COMENTARIOS_AYUDA_ID"`);
    await queryRunner.query(`DROP TABLE "comentarios_ayuda"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_AYUDAS_CODIGO_BENEF"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_AYUDAS_TIPO"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_AYUDAS_ESTADO"`);
    await queryRunner.query(`DROP TABLE "ayudas"`);
    await queryRunner.query(`DROP TYPE "public"."ayudas_estado_enum"`);
    await queryRunner.query(`DROP TYPE "public"."ayudas_tipo_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_PERIODOS_MERITO_ANIO"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_PERIODOS_MERITO_ESTADO"`);
    await queryRunner.query(`DROP TABLE "periodos_merito"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_NOTAS_MERITO_PERIODO_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_NOTAS_MERITO_BENEFICIARIO_ID"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_NOTAS_MERITO_CICLO"`);
    await queryRunner.query(`DROP TABLE "notas_merito"`);
    await queryRunner.query(`DROP TYPE "public"."notas_merito_ciclo_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_92e65934d4455abc9f50cb1089"`,
    );
    await queryRunner.query(`DROP TABLE "menus_nutricion"`);
    await queryRunner.query(`DROP TYPE "public"."menus_nutricion_tanda_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_FOTOS_CLUB_COMPOSITE"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_FOTOS_CLUB_CLUB_ID"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_FOTOS_CLUB_FECHA"`);
    await queryRunner.query(`DROP TABLE "fotos_asistencia_club"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_FOTOS_SUPERV_COMPOSITE"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_FOTOS_SUPERV_SUPERVIVENCIA_ID"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_FOTOS_SUPERV_FECHA"`);
    await queryRunner.query(`DROP TABLE "fotos_asistencia_supervivencia"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ASIS_SUPERV_SUPERVIVENCIA_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ASIS_SUPERV_BENEFICIARIO_ID"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_ASIS_SUPERV_FECHA"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ASIS_SUPERV_COMPOSITE"`);
    await queryRunner.query(`DROP TABLE "asistencias_supervivencia"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_REPORTES_TIPO"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_REPORTES_FORMATO"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_REPORTES_GENERADO_POR_ID"`,
    );
    await queryRunner.query(`DROP TABLE "reportes"`);
    await queryRunner.query(`DROP TYPE "public"."reportes_formato_enum"`);
    await queryRunner.query(`DROP TYPE "public"."reportes_tipo_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_FOTOS_ASIST_CLASE_FECHA"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_FOTOS_ASIST_CLASE_ID"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_FOTOS_ASIST_FECHA"`);
    await queryRunner.query(`DROP TABLE "fotos_asistencia"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_TUTORES_CORREO"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_TUTORES_ACTIVO"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_TUTORES_USUARIO_ID"`);
    await queryRunner.query(`DROP TABLE "tutores"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_CLASES_TUTOR_ID"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_CLASES_CODIGO"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_CLASES_ACTIVO"`);
    await queryRunner.query(`DROP TABLE "clases"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_BENEFICIARIOS_ACTIVO"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_BENEFICIARIOS_NOMBRE"`);
    await queryRunner.query(`DROP TABLE "beneficiarios"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_EXPEDIENTES_BENEFICIARIO_ID"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_EXPEDIENTES_TIPO"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_EXPEDIENTES_FECHA_EVENTO"`,
    );
    await queryRunner.query(`DROP TABLE "beneficiario_expedientes"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_CLUBES_TUTOR_ID"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_CLUBES_CODIGO"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_CLUBES_ACTIVO"`);
    await queryRunner.query(`DROP TABLE "clubes"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ASIS_CLUB_CLUB_ID"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ASIS_CLUB_BENEFICIARIO_ID"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_ASIS_CLUB_FECHA"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ASIS_CLUB_COMPOSITE"`);
    await queryRunner.query(`DROP TABLE "asistencias_club"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_SUPERVIVENCIAS_TUTOR_ID"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_SUPERVIVENCIAS_CODIGO"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_SUPERVIVENCIAS_ACTIVO"`);
    await queryRunner.query(`DROP TABLE "supervivencias"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ASISTENCIAS_UNICA"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ASISTENCIAS_CLASE_ID"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ASISTENCIAS_BENEFICIARIO_ID"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_ASISTENCIAS_FECHA"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ASISTENCIAS_ESTADO"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ASISTENCIAS_REGISTRADO_POR"`,
    );
    await queryRunner.query(`DROP TABLE "asistencias"`);
    await queryRunner.query(`DROP TYPE "public"."asistencias_estado_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_HORARIOS_DIA"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_HORARIOS_ACTIVO"`);
    await queryRunner.query(`DROP TABLE "horarios"`);
    await queryRunner.query(`DROP TYPE "public"."horarios_dia_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_USUARIOS_ROL_ID"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_USUARIOS_ACTIVO"`);
    await queryRunner.query(`DROP TABLE "usuarios"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ROLES_ACTIVO"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ROLES_SUPER_ADMIN"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_PERMISOS_MODULO"`);
    await queryRunner.query(`DROP TABLE "permisos"`);
  }
}
