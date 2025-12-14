import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { IceDepthMeasurement } from '../types';
import { getTemplate, getHeatMapColor, type MeasurementPoint } from '../components/ice-depth';
import { formatDepth, getIceDepthStatus, formatDate } from '../lib/utils';

// Extend jsPDF type for autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      head?: string[][];
      body?: (string | number)[][];
      startY?: number;
      margin?: { left?: number; right?: number };
      styles?: { fontSize?: number; cellPadding?: number };
      headStyles?: { fillColor?: number[] };
      theme?: string;
    }) => jsPDF;
    lastAutoTable?: { finalY: number };
  }
}

// MFO Brand Colors
const COLORS = {
  navy: [0, 34, 68] as [number, number, number],
  action: [105, 190, 40] as [number, number, number],
  wolf: [165, 172, 175] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  critical: [239, 68, 68] as [number, number, number],
};

interface ReportOptions {
  measurement: IceDepthMeasurement;
  rinkName: string;
  technicianName: string;
  facilityName: string;
  includeHeatMap?: boolean;
}

/**
 * Generate a professional PDF report for ice depth measurement
 */
export async function generateIceDepthReport(options: ReportOptions): Promise<Blob> {
  const { measurement, rinkName, technicianName, facilityName, includeHeatMap = true } = options;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // Header
  doc.setFillColor(...COLORS.navy);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ICE DEPTH REPORT', margin, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(facilityName, margin, 28);
  doc.text(formatDate(measurement.checked_at), pageWidth - margin, 28, { align: 'right' });

  yPos = 45;

  // Summary Box
  doc.setTextColor(...COLORS.navy);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Measurement Summary', margin, yPos);

  yPos += 8;

  // Summary table
  const summaryData = [
    ['Rink', rinkName],
    ['Template', measurement.template_id],
    ['Technician', technicianName],
    ['Date/Time', formatDate(measurement.checked_at)],
  ];

  doc.autoTable({
    body: summaryData,
    startY: yPos,
    margin: { left: margin, right: pageWidth / 2 + 5 },
    styles: { fontSize: 9, cellPadding: 2 },
    theme: 'plain',
  });

  // Statistics Box (right side)
  const status = getIceDepthStatus(measurement.avg_depth);
  const statsStartY = yPos;

  doc.setFillColor(
    status === 'ideal' ? COLORS.action[0] : status === 'warning' ? COLORS.warning[0] : COLORS.critical[0],
    status === 'ideal' ? COLORS.action[1] : status === 'warning' ? COLORS.warning[1] : COLORS.critical[1],
    status === 'ideal' ? COLORS.action[2] : status === 'warning' ? COLORS.warning[2] : COLORS.critical[2]
  );
  doc.roundedRect(pageWidth / 2 + 5, statsStartY - 3, pageWidth / 2 - margin - 5, 35, 3, 3, 'F');

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(10);
  doc.text('Average Depth', pageWidth / 2 + 12, statsStartY + 5);

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(formatDepth(measurement.avg_depth, 'mm'), pageWidth / 2 + 12, statsStartY + 17);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Min: ${formatDepth(measurement.min_depth, 'mm')}  |  Max: ${formatDepth(measurement.max_depth, 'mm')}`, pageWidth / 2 + 12, statsStartY + 26);

  yPos = (doc.lastAutoTable?.finalY || yPos) + 15;

  // Environmental Conditions
  doc.setTextColor(...COLORS.navy);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Environmental Conditions', margin, yPos);

  yPos += 8;

  doc.autoTable({
    head: [['Air Temp', 'Ice Temp', 'Humidity']],
    body: [[
      `${measurement.air_temp_c}°C`,
      `${measurement.ice_temp_c}°C`,
      `${measurement.humidity}%`,
    ]],
    startY: yPos,
    margin: { left: margin, right: margin },
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: COLORS.navy },
    theme: 'striped',
  });

  yPos = (doc.lastAutoTable?.finalY || yPos) + 15;

  // Heat Map Visualization
  if (includeHeatMap) {
    doc.setTextColor(...COLORS.navy);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Ice Depth Heat Map', margin, yPos);

    yPos += 5;

    // Draw rink outline
    const rinkWidth = pageWidth - margin * 2;
    const rinkHeight = rinkWidth * 0.425; // Approximate 200:85 ratio
    const rinkX = margin;
    const rinkY = yPos;

    // Rink background
    doc.setFillColor(240, 248, 255); // Light ice blue
    doc.setDrawColor(...COLORS.navy);
    doc.setLineWidth(0.5);
    doc.roundedRect(rinkX, rinkY, rinkWidth, rinkHeight, 5, 5, 'FD');

    // Center line
    doc.setDrawColor(200, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(rinkX + rinkWidth / 2, rinkY, rinkX + rinkWidth / 2, rinkY + rinkHeight);

    // Blue lines
    doc.setDrawColor(0, 50, 150);
    doc.line(rinkX + rinkWidth * 0.3, rinkY, rinkX + rinkWidth * 0.3, rinkY + rinkHeight);
    doc.line(rinkX + rinkWidth * 0.7, rinkY, rinkX + rinkWidth * 0.7, rinkY + rinkHeight);

    // Goal lines
    doc.setDrawColor(200, 0, 0);
    doc.line(rinkX + rinkWidth * 0.055, rinkY, rinkX + rinkWidth * 0.055, rinkY + rinkHeight);
    doc.line(rinkX + rinkWidth * 0.945, rinkY, rinkX + rinkWidth * 0.945, rinkY + rinkHeight);

    // Draw measurement points with heat map colors
    const template = getTemplate(measurement.template_id);
    const pointRadius = 3;

    template.forEach((point: MeasurementPoint) => {
      const px = rinkX + (point.x / 100) * rinkWidth;
      const py = rinkY + (point.y / 100) * rinkHeight;
      const depth = measurement.measurements[point.id];

      if (depth !== undefined) {
        const color = getHeatMapColor(depth);
        // Parse hex color
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);

        doc.setFillColor(r, g, b);
        doc.circle(px, py, pointRadius, 'F');

        // Point number
        doc.setFontSize(5);
        doc.setTextColor(0, 0, 0);
        doc.text(point.order.toString(), px, py + 1, { align: 'center' });
      } else {
        doc.setFillColor(200, 200, 200);
        doc.circle(px, py, pointRadius, 'F');
      }
    });

    // Legend
    yPos = rinkY + rinkHeight + 8;

    doc.setFontSize(8);
    doc.setTextColor(...COLORS.navy);

    const legendItems = [
      { label: 'Critical (<22mm)', color: '#EF4444' },
      { label: 'Warning', color: '#F59E0B' },
      { label: 'Ideal (25-44mm)', color: '#69BE28' },
      { label: 'High', color: '#3B82F6' },
      { label: 'Excessive (>50mm)', color: '#1E3A8A' },
    ];

    let legendX = margin;
    legendItems.forEach((item) => {
      const r = parseInt(item.color.slice(1, 3), 16);
      const g = parseInt(item.color.slice(3, 5), 16);
      const b = parseInt(item.color.slice(5, 7), 16);

      doc.setFillColor(r, g, b);
      doc.circle(legendX + 2, yPos, 2, 'F');
      doc.text(item.label, legendX + 6, yPos + 1);
      legendX += 35;
    });

    yPos += 15;
  }

  // Detailed Measurements Table
  if (yPos > pageHeight - 80) {
    doc.addPage();
    yPos = margin;
  }

  doc.setTextColor(...COLORS.navy);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Measurements', margin, yPos);

  yPos += 8;

  const template = getTemplate(measurement.template_id);
  const measurementRows = template.map((point: MeasurementPoint) => {
    const depth = measurement.measurements[point.id];
    const method = measurement.measurement_methods?.[point.id] || 'manual';
    const status = depth !== undefined ? getIceDepthStatus(depth) : '-';

    return [
      point.order.toString(),
      point.zone.replace('_', ' ').toUpperCase(),
      depth !== undefined ? formatDepth(depth, 'mm') : 'N/A',
      depth !== undefined ? formatDepth(depth, 'in') : 'N/A',
      typeof status === 'string' ? status.charAt(0).toUpperCase() + status.slice(1) : '-',
      method.charAt(0).toUpperCase() + method.slice(1),
    ];
  });

  doc.autoTable({
    head: [['#', 'Zone', 'Depth (mm)', 'Depth (in)', 'Status', 'Method']],
    body: measurementRows,
    startY: yPos,
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: COLORS.navy },
    theme: 'striped',
  });

  yPos = (doc.lastAutoTable?.finalY || yPos) + 15;

  // Notes
  if (measurement.notes) {
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = margin;
    }

    doc.setTextColor(...COLORS.navy);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes', margin, yPos);

    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(measurement.notes, pageWidth - margin * 2);
    doc.text(splitNotes, margin, yPos);
  }

  // Footer
  const footerY = pageHeight - 10;
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.wolf);
  doc.text('Generated by MFO Ice Management System', margin, footerY);
  doc.text(`Page 1 of ${doc.getNumberOfPages()}`, pageWidth - margin, footerY, { align: 'right' });

  // Return as blob
  return doc.output('blob');
}

/**
 * Download the PDF report
 */
export async function downloadIceDepthReport(options: ReportOptions, filename?: string): Promise<void> {
  const blob = await generateIceDepthReport(options);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `ice-depth-report-${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate a summary report for multiple measurements
 */
export async function generateSummaryReport(
  measurements: IceDepthMeasurement[],
  facilityName: string,
  dateRange: { start: string; end: string }
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = margin;

  // Header
  doc.setFillColor(...COLORS.navy);
  doc.rect(0, 0, pageWidth, 30, 'F');

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ICE DEPTH SUMMARY REPORT', margin, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(facilityName, margin, 24);
  doc.text(`${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`, pageWidth - margin, 24, { align: 'right' });

  yPos = 40;

  // Summary statistics
  const avgDepths = measurements.map((m) => m.avg_depth);
  const overallAvg = avgDepths.reduce((a, b) => a + b, 0) / avgDepths.length;
  const overallMin = Math.min(...measurements.map((m) => m.min_depth));
  const overallMax = Math.max(...measurements.map((m) => m.max_depth));

  doc.setTextColor(...COLORS.navy);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary Statistics', margin, yPos);

  yPos += 8;

  doc.autoTable({
    head: [['Total Measurements', 'Average Depth', 'Min Depth', 'Max Depth']],
    body: [[
      measurements.length.toString(),
      formatDepth(overallAvg, 'mm'),
      formatDepth(overallMin, 'mm'),
      formatDepth(overallMax, 'mm'),
    ]],
    startY: yPos,
    margin: { left: margin, right: margin },
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: COLORS.navy },
    theme: 'striped',
  });

  yPos = (doc.lastAutoTable?.finalY || yPos) + 15;

  // Measurements table
  doc.setTextColor(...COLORS.navy);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Measurement History', margin, yPos);

  yPos += 8;

  const tableData = measurements.map((m) => [
    formatDate(m.checked_at),
    m.template_id,
    formatDepth(m.avg_depth, 'mm'),
    formatDepth(m.min_depth, 'mm'),
    formatDepth(m.max_depth, 'mm'),
    getIceDepthStatus(m.avg_depth).toUpperCase(),
  ]);

  doc.autoTable({
    head: [['Date', 'Template', 'Avg Depth', 'Min', 'Max', 'Status']],
    body: tableData,
    startY: yPos,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: COLORS.navy },
    theme: 'striped',
  });

  return doc.output('blob');
}
