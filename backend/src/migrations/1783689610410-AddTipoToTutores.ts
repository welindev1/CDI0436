import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTipoToTutores1783689610410 implements MigrationInterface {
  name = 'AddTipoToTutores1783689610410';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."tutores_tipo_enum" AS ENUM('clase', 'club', 'ambos')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tutores" ADD COLUMN "tipo" "public"."tutores_tipo_enum" NOT NULL DEFAULT 'clase'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_TUTORES_TIPO" ON "tutores" ("tipo")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_TUTORES_TIPO"`);
    await queryRunner.query(`ALTER TABLE "tutores" DROP COLUMN "tipo"`);
    await queryRunner.query(`DROP TYPE "public"."tutores_tipo_enum"`);
  }
}
