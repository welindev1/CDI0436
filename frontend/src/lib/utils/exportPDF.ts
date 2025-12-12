import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReporteData {
  titulo: string;
  subtitulo?: string;
  fecha: string;
  datos: any[];
  columnas: string[];
  headers: string[];
  totales?: { label: string; value: string | number }[];
}

export const exportToPDF = (data: ReporteData) => {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(data.titulo, 14, 20);
  
  // Subtítulo
  if (data.subtitulo) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(data.subtitulo, 14, 28);
  }
  
  // Fecha
  doc.setFontSize(10);
  doc.text(`Fecha: ${data.fecha}`, 14, data.subtitulo ? 35 : 28);
  
  // Tabla
  const tableData = data.datos.map(item => 
    data.columnas.map(col => {
      const value = col.split('.').reduce((obj, key) => obj?.[key], item);
      return value || '-';
    })
  );
  
  autoTable(doc, {
    startY: data.subtitulo ? 40 : 33,
    head: [data.headers],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  });
  
  // Totales
  if (data.totales && data.totales.length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    
    data.totales.forEach((total, index) => {
      doc.text(`${total.label}: ${total.value}`, 14, finalY + (index * 7));
    });
  }
  
  // Guardar
  doc.save(`${data.titulo.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
};