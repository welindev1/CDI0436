import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBonosRegalo1720000000000 implements MigrationInterface {
  name = 'AddBonosRegalo1720000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "bonos_regalo" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "codigo" varchar(50) NOT NULL,
        "beneficiario_nombre" varchar(200) NOT NULL,
        "padre_nombre" varchar(200),
        "cedula" varchar(20),
        "monto" decimal(10,2) NOT NULL,
        "mes" varchar(100) NOT NULL,
        "expira" date,
        "entregado" boolean NOT NULL DEFAULT false,
        "foto_entrega" varchar,
        "beneficiario_id" uuid,
        "registrado_por_id" uuid,
        "entregado_por_id" uuid,
        "creado_en" TIMESTAMP NOT NULL DEFAULT now(),
        "actualizado_en" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_BONO_REGALO_BENEFICIARIO" ON "bonos_regalo" ("beneficiario_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_BONO_REGALO_ENTREGADO" ON "bonos_regalo" ("entregado")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_BONO_REGALO_MES" ON "bonos_regalo" ("mes")
    `);

    await queryRunner.query(`
      ALTER TABLE "bonos_regalo"
      ADD CONSTRAINT "FK_BONO_REGALO_BENEFICIARIO"
      FOREIGN KEY ("beneficiario_id") REFERENCES "beneficiarios"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "bonos_regalo"
      ADD CONSTRAINT "FK_BONO_REGALO_REGISTRADO_POR"
      FOREIGN KEY ("registrado_por_id") REFERENCES "usuarios"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "bonos_regalo"
      ADD CONSTRAINT "FK_BONO_REGALO_ENTREGADO_POR"
      FOREIGN KEY ("entregado_por_id") REFERENCES "usuarios"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bonos_regalo" DROP CONSTRAINT "FK_BONO_REGALO_ENTREGADO_POR"`);
    await queryRunner.query(`ALTER TABLE "bonos_regalo" DROP CONSTRAINT "FK_BONO_REGALO_REGISTRADO_POR"`);
    await queryRunner.query(`ALTER TABLE "bonos_regalo" DROP CONSTRAINT "FK_BONO_REGALO_BENEFICIARIO"`);
    await queryRunner.query(`DROP INDEX "IDX_BONO_REGALO_MES"`);
    await queryRunner.query(`DROP INDEX "IDX_BONO_REGALO_ENTREGADO"`);
    await queryRunner.query(`DROP INDEX "IDX_BONO_REGALO_BENEFICIARIO"`);
    await queryRunner.query(`DROP TABLE "bonos_regalo"`);
  }
}
