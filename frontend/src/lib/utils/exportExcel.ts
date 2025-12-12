import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ExcelData {
  nombreArchivo: string;
  hojas: {
    nombre: string;
    datos: any[];
    columnas?: string[];
  }[];
}

export const exportToExcel = (data: ExcelData) => {
  const workbook = XLSX.utils.book_new();
  
  data.hojas.forEach(hoja => {
    const worksheet = XLSX.utils.json_to_sheet(hoja.datos);
    XLSX.utils.book_append_sheet(workbook, worksheet, hoja.nombre);
  });
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${data.nombreArchivo}_${new Date().getTime()}.xlsx`);
};