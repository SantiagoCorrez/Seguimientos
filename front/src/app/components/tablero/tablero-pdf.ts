// src/app/components/tablero/tablero-pdf.ts
// Genera el informe PDF del tablero con la información visible en el momento de la descarga.

import { ESTADOS, FilaResumen, Registro, Resumen, formatoMoneda, porcentaje } from './tablero-logic';

export interface DatosInforme {
    resumen: Resumen;
    detalle: Registro[];
    filtros: { provincia: string; municipio: string; entidad: string; busqueda: string };
    /** false: el informe solo incluye el resumen (útil cuando el detalle tiene miles de registros). */
    incluirDetalle: boolean;
}

const AZUL: [number, number, number] = [11, 58, 110];
const AZUL_CLARO: [number, number, number] = [231, 238, 246];
const GRIS_TEXTO: [number, number, number] = [55, 65, 81];

export async function generarInformePdf(d: DatosInforme): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const { autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const M = 12;
    const ahora = new Date();
    const fecha = ahora.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
    const hora = ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const { total, conteos } = d.resumen;
    const pct = (n: number) => porcentaje(n, total);
    const num = (n: number) => n.toLocaleString('es-CO');

    // --- Encabezado ---
    doc.setFillColor(...AZUL);
    doc.rect(0, 0, W, 30, 'F');
    const franjas = ['#1F7CE0', '#F5C21B', '#E5262E'];
    franjas.forEach((c, i) => {
        doc.setFillColor(c);
        doc.rect((W / 3) * i, 30, W / 3, 1.5, 'F');
    });

    const logo = await cargarImagen('/assets/logo_gobernacion_header.png');
    let xTitulo = M;
    if (logo) {
        const alto = 16;
        const ancho = (logo.width / logo.height) * alto;
        doc.addImage(logo.dataUrl, 'PNG', M, 7, ancho, alto);
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.3);
        doc.line(M + ancho + 6, 6, M + ancho + 6, 24);
        xTitulo = M + ancho + 12;
    }
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Seguimiento de Compromisos', xTitulo, 13);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Departamento de Cundinamarca · Más desarrollo, más bienestar', xTitulo, 20);
    doc.setFontSize(9);
    doc.text(`Generado el ${fecha}, ${hora}`, W - M, 13, { align: 'right' });
    doc.text('Fuente: Matriz seguimiento compromisos', W - M, 19, { align: 'right' });

    // --- Filtros aplicados ---
    let y = 38;
    const filtros = [
        `Provincia: ${d.filtros.provincia || 'Todas'}`,
        `Municipio: ${d.filtros.municipio || 'Todos'}`,
        `Entidad líder: ${d.filtros.entidad || 'Todas'}`
    ];
    if (d.filtros.busqueda) filtros.push(`Búsqueda: "${d.filtros.busqueda}"`);
    doc.setFillColor(...AZUL_CLARO);
    doc.roundedRect(M, y - 4.5, W - 2 * M, 7, 1.5, 1.5, 'F');
    doc.setTextColor(...AZUL);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Filtros aplicados:', M + 3, y);
    doc.setFont('helvetica', 'normal');
    doc.text(filtros.join('     |     '), M + 31, y);

    // --- Tarjetas KPI ---
    y += 6;
    const kpis = [
        { label: 'Total compromisos', valor: total, color: '#0B3A6E', pct: null as string | null },
        ...ESTADOS.map(e => ({ label: e.label, valor: conteos[e.key], color: e.color, pct: pct(conteos[e.key]) }))
    ];
    const gap = 3;
    const kw = (W - 2 * M - gap * (kpis.length - 1)) / kpis.length;
    const kh = 25;
    kpis.forEach((k, i) => {
        const x = M + i * (kw + gap);
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(220, 226, 234);
        doc.setLineWidth(0.3);
        doc.roundedRect(x, y, kw, kh, 2, 2, 'FD');
        doc.setFillColor(k.color);
        doc.roundedRect(x, y, 2.5, kh, 1, 1, 'F');
        doc.setTextColor(...AZUL);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(k.label, x + 6, y + 6);
        doc.setFontSize(18);
        doc.text(num(k.valor), x + 6, y + 14.5);
        if (k.pct !== null) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`${k.pct} %`, x + 6, y + 21);
        }
    });

    // Detalle de "Otros estados": se conservan con su valor original
    if (d.resumen.otrosDetalle.length) {
        y += kh + 4;
        doc.setFontSize(7.5);
        doc.setTextColor(...GRIS_TEXTO);
        doc.setFont('helvetica', 'bold');
        doc.text('Otros estados:', M, y);
        doc.setFont('helvetica', 'normal');
        const texto = d.resumen.otrosDetalle.map(o => `${o.estado} (${num(o.cantidad)})`).join('  ·  ');
        doc.text(doc.splitTextToSize(texto, W - 2 * M - 22), M + 20, y);
        y -= kh + 4;
    }

    // --- Distribución por estado (dona) ---
    y += kh + (d.resumen.otrosDetalle.length ? 13 : 8);
    seccion(doc, 'Distribución por estado', M, y);
    const dona = dibujarDona(d.resumen);
    const tamDona = 48;
    if (dona) doc.addImage(dona, 'PNG', M + 4, y + 4, tamDona, tamDona);
    let ly = y + 10;
    ESTADOS.forEach(e => {
        doc.setFillColor(e.color);
        doc.circle(M + tamDona + 12, ly - 1.2, 2, 'F');
        doc.setTextColor(...GRIS_TEXTO);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.text(e.label.toUpperCase(), M + tamDona + 17, ly);
        doc.setFont('helvetica', 'bold');
        doc.text(`${num(conteos[e.key])}  (${pct(conteos[e.key])} %)`, M + tamDona + 58, ly);
        ly += 7.5;
    });

    // --- Resumen por entidad líder (al lado de la dona) ---
    const xEnt = M + 142;
    seccion(doc, 'Compromisos por entidad líder y estado', xEnt, y);
    autoTable(doc, {
        ...estiloResumen(d.resumen, d.resumen.porEntidad, 'Entidad líder'),
        startY: y + 3,
        margin: { left: xEnt, right: M, top: 15, bottom: 15 }
    });

    // --- Resumen por municipio ---
    y = Math.max(y + tamDona + 8, (doc as any).lastAutoTable.finalY + 8);
    if (y > H - 40) { doc.addPage(); y = 20; }
    seccion(doc, 'Compromisos por municipio y estado', M, y);
    autoTable(doc, {
        ...estiloResumen(d.resumen, d.resumen.porMunicipio, 'Municipio'),
        startY: y + 3,
        margin: { left: M, right: M, top: 15, bottom: 15 }
    });
    if (d.resumen.multimunicipio) {
        doc.setFontSize(7.5);
        doc.setTextColor(...GRIS_TEXTO);
        doc.setFont('helvetica', 'italic');
        doc.text(`${d.resumen.multimunicipio} compromiso(s) abarcan varios municipios y se cuentan en cada uno.`,
            M, (doc as any).lastAutoTable.finalY + 4);
    }

    // --- Detalle de compromisos ---
    if (!d.incluirDetalle) {
        const yNota = (doc as any).lastAutoTable.finalY + (d.resumen.multimunicipio ? 9 : 5);
        doc.setFontSize(8);
        doc.setTextColor(...GRIS_TEXTO);
        doc.setFont('helvetica', 'italic');
        doc.text(`Detalle de compromisos no incluido (${num(d.detalle.length)} registros). Aplique filtros para incluirlo en el informe.`, M, yNota);
    } else {
        doc.addPage();
        y = 20;
        seccion(doc, `Detalle de compromisos (${num(d.detalle.length)} registros)`, M, y);
        autoTable(doc, {
            startY: y + 3,
            margin: { left: M, right: M, top: 15, bottom: 15 },
            head: [['Código', 'Municipio', 'Entidad líder', 'Compromiso específico', 'Valor inicial',
                'Detalle específico', 'Valor contrato / convenio', 'Estado', 'Observaciones']],
            body: d.detalle.map(r => [
                r.c.codigo ?? '', r.c.municipio ?? '', r.entidad, r.c.compromiso_especifico ?? '',
                formatoMoneda(r.c.valor_total), r.c.detalle_especifico ?? '', formatoMoneda(r.c.valor_documento),
                r.estado, r.c.observaciones ?? ''
            ]),
            theme: 'grid',
            styles: { fontSize: 6.5, cellPadding: 1.5, textColor: GRIS_TEXTO, lineColor: [226, 230, 236], lineWidth: 0.2, valign: 'middle', overflow: 'linebreak' },
            headStyles: { fillColor: AZUL, textColor: 255, fontStyle: 'bold', halign: 'center', fontSize: 7 },
            alternateRowStyles: { fillColor: [247, 249, 252] },
            columnStyles: {
                0: { cellWidth: 18 },
                1: { cellWidth: 22 },
                2: { cellWidth: 32 },
                3: { cellWidth: 42 },
                4: { cellWidth: 22, halign: 'right' },
                5: { cellWidth: 48 },
                6: { cellWidth: 24, halign: 'right' },
                7: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
                8: { cellWidth: 'auto' }
            },
            didParseCell: (data: any) => {
                if (data.section === 'body' && data.column.index === 7) {
                    const key = d.detalle[data.row.index].estadoKey;
                    const def = ESTADOS.find(e => e.key === key)!;
                    data.cell.styles.fillColor = def.color;
                    data.cell.styles.textColor = key === 'ejecucion' ? [26, 26, 26] : [255, 255, 255];
                }
            }
        });
    }

    // --- Pie de página en todas las hojas ---
    const paginas = doc.getNumberOfPages();
    for (let i = 1; i <= paginas; i++) {
        doc.setPage(i);
        doc.setDrawColor(...AZUL);
        doc.setLineWidth(0.4);
        doc.line(M, H - 10, W - M, H - 10);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...GRIS_TEXTO);
        doc.text('Gobernación de Cundinamarca · Seguimiento de Compromisos', M, H - 6);
        doc.text(`Página ${i} de ${paginas}`, W - M, H - 6, { align: 'right' });
    }

    const stamp = ahora.toISOString().slice(0, 10);
    doc.save(`informe-compromisos-${stamp}.pdf`);
}

function seccion(doc: any, titulo: string, x: number, y: number): void {
    doc.setTextColor(...AZUL);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(titulo, x, y);
}

function estiloResumen(r: Resumen, filas: FilaResumen[], primera: string): any {
    const n = (v: number) => v.toLocaleString('es-CO');
    return {
        head: [[primera, ...ESTADOS.map(e => e.label), 'Total']],
        body: filas.map(f => [f.nombre, ...ESTADOS.map(e => n(f.conteos[e.key])), n(f.total)]),
        foot: [['Total compromisos', ...ESTADOS.map(e => n(r.conteos[e.key])), n(r.total)]],
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1.2, halign: 'center', textColor: GRIS_TEXTO, lineColor: [226, 230, 236], lineWidth: 0.2 },
        headStyles: { fillColor: AZUL, textColor: 255, fontStyle: 'bold', valign: 'middle' },
        footStyles: { fillColor: AZUL_CLARO, textColor: AZUL, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [247, 249, 252] },
        columnStyles: { 0: { halign: 'left', cellWidth: 'auto' }, [ESTADOS.length + 1]: { fontStyle: 'bold' } },
        showFoot: 'lastPage'
    };
}

/** Dibuja la dona en un canvas y devuelve un PNG en base64. */
function dibujarDona(r: Resumen): string | null {
    const size = 520;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const c = size / 2;
    const rExt = size / 2 - 4;
    const rInt = rExt * 0.5;
    const total = r.total;

    if (!total) {
        ctx.fillStyle = '#E5E7EB';
        ctx.beginPath();
        ctx.arc(c, c, rExt, 0, 2 * Math.PI);
        ctx.arc(c, c, rInt, 0, 2 * Math.PI, true);
        ctx.fill();
        return canvas.toDataURL('image/png');
    }

    let ang = -Math.PI / 2;
    for (const e of ESTADOS) {
        const v = r.conteos[e.key];
        if (!v) continue;
        const delta = (v / total) * 2 * Math.PI;
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(c, c, rExt, ang, ang + delta);
        ctx.arc(c, c, rInt, ang + delta, ang, true);
        ctx.closePath();
        ctx.fill();

        if (v / total >= 0.05) {
            const medio = ang + delta / 2;
            const rr = (rExt + rInt) / 2;
            const x = c + Math.cos(medio) * rr;
            const y = c + Math.sin(medio) * rr;
            ctx.fillStyle = e.key === 'ejecucion' ? '#0B3A6E' : '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.font = 'bold 34px Helvetica, Arial, sans-serif';
            ctx.fillText(v.toLocaleString('es-CO'), x, y);
            ctx.font = 'bold 22px Helvetica, Arial, sans-serif';
            ctx.fillText(`(${((v / total) * 100).toLocaleString('es-CO', { maximumFractionDigits: 1, minimumFractionDigits: 1 })} %)`, x, y + 28);
        }
        ang += delta;
    }
    return canvas.toDataURL('image/png');
}

async function cargarImagen(url: string): Promise<{ dataUrl: string; width: number; height: number } | null> {
    try {
        const blob = await (await fetch(url)).blob();
        const dataUrl = await new Promise<string>((res, rej) => {
            const r = new FileReader();
            r.onload = () => res(r.result as string);
            r.onerror = rej;
            r.readAsDataURL(blob);
        });
        const img = await new Promise<HTMLImageElement>((res, rej) => {
            const i = new Image();
            i.onload = () => res(i);
            i.onerror = rej;
            i.src = dataUrl;
        });
        return { dataUrl, width: img.naturalWidth, height: img.naturalHeight };
    } catch {
        return null;
    }
}
