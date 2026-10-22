// src/app/components/tablero/tablero-excel.ts
// Exporta a Excel la matriz de detalle visible en el tablero (mismas columnas del informe PDF).
// Solo la matriz: fila de nombres de columna + datos, sin título ni encabezado institucional.

import { Registro, aNumero } from './tablero-logic';

const COLUMNAS: { titulo: string; ancho: number; valor: (r: Registro) => unknown; moneda?: boolean }[] = [
    { titulo: 'Código', ancho: 14, valor: r => r.c.codigo },
    { titulo: 'Municipio', ancho: 24, valor: r => r.c.municipio },
    { titulo: 'Entidad Líder', ancho: 22, valor: r => r.entidad },
    { titulo: 'Compromiso Específico', ancho: 45, valor: r => r.c.compromiso_especifico },
    { titulo: 'Valor Inicial', ancho: 18, valor: r => r.c.valor_total, moneda: true },
    { titulo: 'Detalle Específico', ancho: 55, valor: r => r.c.detalle_especifico },
    { titulo: 'Valor Contrato', ancho: 18, valor: r => r.c.valor_documento, moneda: true },
    { titulo: 'Estado', ancho: 20, valor: r => r.estado },
    { titulo: 'Observaciones', ancho: 50, valor: r => r.c.observaciones }
];

const FORMATO_MONEDA = '"$" #,##0';

export async function generarReporteExcel(detalle: Registro[]): Promise<void> {
    const ExcelJS = (await import('exceljs')).default;
    const libro = new ExcelJS.Workbook();
    libro.creator = 'Gobernación de Cundinamarca - Seguimiento de Compromisos';
    libro.created = new Date();

    const hoja = libro.addWorksheet('Compromisos', { views: [{ state: 'frozen', ySplit: 1 }] });
    hoja.columns = COLUMNAS.map(c => ({ header: c.titulo, width: c.ancho }));

    for (const r of detalle) {
        hoja.addRow(COLUMNAS.map(c => {
            const v = c.valor(r);
            if (v === null || v === undefined) return null;
            // Los valores numéricos quedan como número (sumables en Excel); textos como "SIN DEFINIR" se conservan.
            if (c.moneda) return aNumero(v) ?? String(v);
            return String(v);
        }));
    }

    const encabezado = hoja.getRow(1);
    encabezado.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    encabezado.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B3A6E' } };
    encabezado.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    encabezado.height = 30;

    COLUMNAS.forEach((c, i) => {
        const col = hoja.getColumn(i + 1);
        if (c.moneda) {
            col.numFmt = FORMATO_MONEDA;
            col.alignment = { vertical: 'top', horizontal: 'right' };
        } else {
            col.alignment = { vertical: 'top', wrapText: true };
        }
    });
    encabezado.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    hoja.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: COLUMNAS.length } };

    const buffer = await libro.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-compromisos-${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
