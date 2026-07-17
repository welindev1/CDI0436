import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AsistenciaPersonal, TurnoPersonal } from './asistencia-personal.entity';
import { Trabajador } from './trabajador.entity';
import PDFDocument from 'pdfkit';

const DIAS_ES = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles',
  'Jueves', 'Viernes', 'Sábado',
];

const MESES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

@Injectable()
export class ReportesAsistenciaService {
  constructor(
    @InjectRepository(AsistenciaPersonal)
    private readonly asistenciaRepo: Repository<AsistenciaPersonal>,
    @InjectRepository(Trabajador)
    private readonly trabajadorRepo: Repository<Trabajador>,
  ) {}

  async generarPdfDiario(fecha: string, turno?: TurnoPersonal): Promise<Buffer> {
    const fechaDate = new Date(`${fecha}T12:00:00`);
    const diaSemana = DIAS_ES[fechaDate.getDay()];
    const mes = MESES_ES[fechaDate.getMonth()];
    const anio = fechaDate.getFullYear();
    const dia = fechaDate.getDate();

    const where: any = { fecha: fechaDate };
    if (turno) where.turno = turno;

    const asistencias = await this.asistenciaRepo.find({
      where,
      relations: ['trabajador'],
      order: { hora_entrada: 'ASC' },
    });

    const todosTrabajadores = await this.trabajadorRepo.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });

    const turnoLabel = turno
      ? turno === TurnoPersonal.MATUTINO ? 'MATUTINO' : 'VESPERTINO'
      : 'MATUTINO / VESPERTINO';

    return this.generarPdf({
      titulo: 'CONTROL DE ASISTENCIA',
      subtitulo: `${diaSemana} ${dia} de ${mes} ${anio}`,
      turno: turnoLabel,
      trabajadores: todosTrabajadores,
      asistencias,
      fecha,
    });
  }

  async generarPdfSemana(fechaInicio: string, fechaFin: string): Promise<Buffer> {
    const inicio = new Date(`${fechaInicio}T00:00:00`);
    const fin = new Date(`${fechaFin}T23:59:59`);
    const mesInicio = MESES_ES[inicio.getMonth()];
    const mesFin = MESES_ES[fin.getMonth()];
    const anio = inicio.getFullYear();

    const asistencias = await this.asistenciaRepo.find({
      where: {
        fecha: Between(inicio, fin),
      },
      relations: ['trabajador'],
      order: { fecha: 'ASC', hora_entrada: 'ASC' },
    });

    const todosTrabajadores = await this.trabajadorRepo.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });

    const rangoMeses = mesInicio === mesFin
      ? `${mesInicio} ${anio}`
      : `${mesInicio} - ${mesFin} ${anio}`;

    return this.generarPdf({
      titulo: 'CONTROL DE ASISTENCIA - SEMANAL',
      subtitulo: `${fechaInicio} al ${fechaFin} (${rangoMeses})`,
      turno: 'TODOS',
      trabajadores: todosTrabajadores,
      asistencias,
      fecha: fechaInicio,
      esSemanal: true,
      fechaInicio,
      fechaFin,
    });
  }

  async generarPdfMes(mes: number, anio: number): Promise<Buffer> {
    const inicio = new Date(anio, mes - 1, 1);
    const fin = new Date(anio, mes, 0, 23, 59, 59);
    const nombreMes = MESES_ES[mes - 1];

    const asistencias = await this.asistenciaRepo.find({
      where: {
        fecha: Between(inicio, fin),
      },
      relations: ['trabajador'],
      order: { fecha: 'ASC', hora_entrada: 'ASC' },
    });

    const todosTrabajadores = await this.trabajadorRepo.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });

    return this.generarPdf({
      titulo: 'CONTROL DE ASISTENCIA - MENSUAL',
      subtitulo: `${nombreMes} ${anio}`,
      turno: 'TODOS',
      trabajadores: todosTrabajadores,
      asistencias,
      fecha: `${anio}-${String(mes).padStart(2, '0')}-01`,
      esMensual: true,
    });
  }

  private generarPdf(opts: {
    titulo: string;
    subtitulo: string;
    turno: string;
    trabajadores: Trabajador[];
    asistencias: AsistenciaPersonal[];
    fecha: string;
    esSemanal?: boolean;
    esMensual?: boolean;
    fechaInicio?: string;
    fechaFin?: string;
  }): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'letter',
        margins: { top: 40, bottom: 40, left: 50, right: 50 },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(16).font('Helvetica-Bold').text('CDI caminando con Jesús DR0436', {
        align: 'center',
      });
      doc.moveDown(0.3);
      doc.fontSize(14).text(opts.titulo, { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(11).font('Helvetica').text(opts.subtitulo, { align: 'center' });
      doc.moveDown(0.2);
      doc.text(`Turno: ${opts.turno}`, { align: 'center' });
      doc.moveDown(0.8);

      if (opts.esSemanal || opts.esMensual) {
        this.generarTablaSemanalMensual(doc, opts);
      } else {
        this.generarTablaDiaria(doc, opts);
      }

      doc.end();
    });
  }

  private generarTablaDiaria(
    doc: InstanceType<typeof PDFDocument>,
    opts: {
      trabajadores: Trabajador[];
      asistencias: AsistenciaPersonal[];
    },
  ) {
    const colNo = 40;
    const colNombre = 130;
    const colEntrada = 340;
    const colSalida = 420;
    const colFirma = 500;
    const startY = doc.y;

    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('No.', colNo, startY, { width: colNo });
    doc.text('NOMBRES', colNombre, startY, { width: 200 });
    doc.text('ENTRADA', colEntrada, startY, { width: 70 });
    doc.text('SALIDA', colSalida, startY, { width: 70 });
    doc.text('FIRMA', colFirma, startY, { width: 70 });

    doc.moveTo(50, startY + 14).lineTo(562, startY + 14).stroke();

    let y = startY + 20;
    doc.font('Helvetica').fontSize(9);

    opts.trabajadores.forEach((trabajador, index) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      const asistencia = opts.asistencias.find(
        (a) => a.trabajador?.id === trabajador.id,
      );

      doc.text(`${index + 1}`, colNo, y, { width: colNo });
      const nombreCompleto = trabajador.apellido
        ? `${trabajador.nombre} ${trabajador.apellido}`
        : trabajador.nombre;
      doc.text(nombreCompleto, colNombre, y, { width: 200 });
      doc.text(asistencia?.hora_entrada || '', colEntrada, y, { width: 70 });
      doc.text(asistencia?.hora_salida || '', colSalida, y, { width: 70 });

      doc.moveTo(colFirma, y + 10).lineTo(colFirma + 50, y + 10).stroke();

      y += 22;
    });

    const notasTrabajadores = opts.asistencias
      .filter((a) => a.notas)
      .map((a) => {
        const nombre = a.trabajador?.apellido
          ? `${a.trabajador.nombre} ${a.trabajador.apellido}`
          : a.trabajador?.nombre || '';
        return `${nombre}: ${a.notas}`;
      });

    if (notasTrabajadores.length > 0) {
      y += 15;
      doc.fontSize(10).font('Helvetica-Bold').text('OBSERVACIONES:', 50, y);
      y += 15;
      doc.font('Helvetica').fontSize(9);
      notasTrabajadores.forEach((nota) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
        doc.text(`• ${nota}`, 60, y, { width: 490 });
        y += 14;
      });
    }
  }

  private generarTablaSemanalMensual(
    doc: InstanceType<typeof PDFDocument>,
    opts: {
      trabajadores: Trabajador[];
      asistencias: AsistenciaPersonal[];
      esSemanal?: boolean;
      esMensual?: boolean;
    },
  ) {
    const colNo = 40;
    const colNombre = 90;
    const startY = doc.y;

    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('No.', colNo, startY, { width: 30 });
    doc.text('NOMBRE', colNombre, startY, { width: 130 });

    const diasUnicos = [...new Set(
      opts.asistencias.map((a) => {
        const d = new Date(a.fecha);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }),
    )].sort();

    const diasMes: { fecha: string; label: string; diaNum: number }[] = [];

    if (opts.esMensual) {
      const primerDia = new Date(diasUnicos[0] + 'T12:00:00');
      const anio = primerDia.getFullYear();
      const mes = primerDia.getMonth();
      const diasEnMes = new Date(anio, mes + 1, 0).getDate();
      for (let d = 1; d <= diasEnMes; d++) {
        const fecha = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const fechaDate = new Date(`${fecha}T12:00:00`);
        diasMes.push({
          fecha,
          label: `${d}`,
          diaNum: fechaDate.getDay(),
        });
      }
    } else {
      diasUnicos.forEach((fecha) => {
        const fechaDate = new Date(`${fecha}T12:00:00`);
        diasMes.push({
          fecha,
          label: `${fechaDate.getDate()}`,
          diaNum: fechaDate.getDay(),
        });
      });
    }

    let xPos = colNombre + 130;
    const colWidth = 28;
    const headersX: { x: number; label: string; esFin: boolean }[] = [];

    diasMes.forEach((dia) => {
      const esFinSemana = dia.diaNum === 0 || dia.diaNum === 6;
      if (!esFinSemana) {
        doc.text(dia.label, xPos, startY, { width: colWidth, align: 'center' });
        headersX.push({ x: xPos, label: dia.label, esFin: false });
      }
      xPos += colWidth;
    });

    const totalWidth = xPos - colNombre - 130 + 130;
    doc.moveTo(50, startY + 12).lineTo(50 + totalWidth, startY + 12).stroke();

    let y = startY + 18;
    doc.font('Helvetica').fontSize(8);

    opts.trabajadores.forEach((trabajador, index) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      doc.text(`${index + 1}`, colNo, y, { width: 30 });
      const nombreCorto = trabajador.apellido
        ? `${trabajador.nombre} ${trabajador.apellido}`
        : trabajador.nombre;
      doc.text(nombreCorto, colNombre, y, { width: 130 });

      let xData = colNombre + 130;
      diasMes.forEach((dia) => {
        const esFinSemana = dia.diaNum === 0 || dia.diaNum === 6;
        if (!esFinSemana) {
          const asistencia = opts.asistencias.find((a) => {
            const aFecha = new Date(a.fecha);
            const aFechaStr = `${aFecha.getFullYear()}-${String(aFecha.getMonth() + 1).padStart(2, '0')}-${String(aFecha.getDate()).padStart(2, '0')}`;
            return a.trabajador?.id === trabajador.id && aFechaStr === dia.fecha;
          });

          const marca = asistencia
            ? asistencia.hora_salida
              ? 'X'
              : 'P'
            : '';
          doc.text(marca, xData, y, { width: colWidth, align: 'center' });
        }
        xData += colWidth;
      });

      y += 16;
    });

    y += 8;
    doc.fontSize(8).font('Helvetica-Bold').text('LEYENDA:', 50, y);
    y += 12;
    doc.font('Helvetica').fontSize(8);
    doc.text('P = Presente (con entrada)    X = Jornada Completa (entrada + salida)    (vacío) = Ausente', 60, y);
  }
}
