import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface ReportData {
  title: string;
  dateRange: string;
  stats: {
    avgDepth: string;
    totalMakes: number;
    avgWater: string;
    depthTrend: string;
    criticalDays: number;
    idealDays: number;
  };
  iceDepthData: Array<{
    date: string;
    fullDate: string;
    avgDepth: number;
    minDepth: number;
    maxDepth: number;
  }>;
  iceMakeData: Array<{
    date: string;
    fullDate: string;
    count: number;
    avgWater: number;
    avgSnow: number;
  }>;
}

interface CSVData {
  iceDepthData: Array<{
    date: string;
    fullDate: string;
    avgDepth: number;
    minDepth: number;
    maxDepth: number;
    rinkA?: number;
    rinkB?: number;
  }>;
  iceMakeData: Array<{
    date: string;
    fullDate: string;
    count: number;
    avgWater: number;
    avgSnow: number;
  }>;
}

export function exportReportToPDF(data: ReportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(30, 58, 95); // Navy
  doc.text(data.title, pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  const rangeText = data.dateRange === '7d' ? '7 Days' : data.dateRange === '30d' ? '30 Days' : '90 Days';
  doc.text(`Report Period: Last ${rangeText}`, pageWidth / 2, 28, { align: 'center' });
  doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, pageWidth / 2, 35, { align: 'center' });

  // Summary Stats
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 95);
  doc.text('Summary Statistics', 14, 50);

  const summaryData = [
    ['Average Ice Depth', `${data.stats.avgDepth} mm`],
    ['Depth Trend', `${parseFloat(data.stats.depthTrend) >= 0 ? '+' : ''}${data.stats.depthTrend}%`],
    ['Total Ice Makes', data.stats.totalMakes.toString()],
    ['Average Water Usage', `${data.stats.avgWater}%`],
    ['Days in Ideal Range', data.stats.idealDays.toString()],
    ['Critical Days', data.stats.criticalDays.toString()],
  ];

  autoTable(doc, {
    startY: 55,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [30, 58, 95] },
    margin: { left: 14, right: 14 },
  });

  // Ice Depth Table
  const depthTableY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 95);
  doc.text('Ice Depth Measurements', 14, depthTableY);

  const depthTableData = data.iceDepthData.slice(-10).map(d => [
    d.date,
    `${d.avgDepth.toFixed(1)} mm`,
    `${d.minDepth.toFixed(1)} mm`,
    `${d.maxDepth.toFixed(1)} mm`,
    d.avgDepth >= 25.4 && d.avgDepth <= 44.45 ? 'Ideal' : d.avgDepth < 25.4 ? 'Critical' : 'Warning',
  ]);

  autoTable(doc, {
    startY: depthTableY + 5,
    head: [['Date', 'Avg Depth', 'Min Depth', 'Max Depth', 'Status']],
    body: depthTableData,
    theme: 'striped',
    headStyles: { fillColor: [30, 58, 95] },
    margin: { left: 14, right: 14 },
  });

  // Ice Makes Table (new page if needed)
  const makesTableY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  if (makesTableY > 230) {
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 95);
    doc.text('Ice Make Activity', 14, 20);

    const makesTableData = data.iceMakeData.slice(-10).map(d => [
      d.date,
      d.count.toString(),
      `${d.avgWater.toFixed(0)}%`,
      `${d.avgSnow.toFixed(0)}%`,
    ]);

    autoTable(doc, {
      startY: 25,
      head: [['Date', 'Ice Makes', 'Avg Water', 'Avg Snow']],
      body: makesTableData,
      theme: 'striped',
      headStyles: { fillColor: [30, 58, 95] },
      margin: { left: 14, right: 14 },
    });
  } else {
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 95);
    doc.text('Ice Make Activity', 14, makesTableY);

    const makesTableData = data.iceMakeData.slice(-10).map(d => [
      d.date,
      d.count.toString(),
      `${d.avgWater.toFixed(0)}%`,
      `${d.avgSnow.toFixed(0)}%`,
    ]);

    autoTable(doc, {
      startY: makesTableY + 5,
      head: [['Date', 'Ice Makes', 'Avg Water', 'Avg Snow']],
      body: makesTableData,
      theme: 'striped',
      headStyles: { fillColor: [30, 58, 95] },
      margin: { left: 14, right: 14 },
    });
  }

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount} | MFO Ice Management System`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save
  const filename = `ice-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
}

export function exportReportToCSV(data: CSVData): void {
  // Ice Depth CSV
  const depthHeaders = ['Date', 'Avg Depth (mm)', 'Min Depth (mm)', 'Max Depth (mm)', 'Rink A (mm)', 'Rink B (mm)'];
  const depthRows = data.iceDepthData.map(d => [
    format(new Date(d.fullDate), 'yyyy-MM-dd'),
    d.avgDepth.toFixed(1),
    d.minDepth.toFixed(1),
    d.maxDepth.toFixed(1),
    d.rinkA?.toFixed(1) || '',
    d.rinkB?.toFixed(1) || '',
  ]);

  const depthCSV = [depthHeaders, ...depthRows].map(row => row.join(',')).join('\n');

  // Ice Makes CSV
  const makesHeaders = ['Date', 'Ice Makes', 'Avg Water (%)', 'Avg Snow (%)'];
  const makesRows = data.iceMakeData.map(d => [
    format(new Date(d.fullDate), 'yyyy-MM-dd'),
    d.count.toString(),
    d.avgWater.toFixed(0),
    d.avgSnow.toFixed(0),
  ]);

  const makesCSV = [makesHeaders, ...makesRows].map(row => row.join(',')).join('\n');

  // Combined CSV
  const combinedCSV = `ICE DEPTH MEASUREMENTS\n${depthCSV}\n\nICE MAKE ACTIVITY\n${makesCSV}`;

  // Download
  const blob = new Blob([combinedCSV], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `ice-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// Export individual records
export function exportIceDepthToCSV(measurements: Array<{
  id: string;
  rink_name: string;
  avg_depth: number;
  min_depth: number;
  max_depth: number;
  technician: string;
  checked_at: string;
}>): void {
  const headers = ['ID', 'Rink', 'Avg Depth (mm)', 'Min Depth (mm)', 'Max Depth (mm)', 'Technician', 'Date'];
  const rows = measurements.map(m => [
    m.id,
    m.rink_name,
    m.avg_depth.toFixed(1),
    m.min_depth.toFixed(1),
    m.max_depth.toFixed(1),
    m.technician,
    format(new Date(m.checked_at), 'yyyy-MM-dd HH:mm'),
  ]);

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `ice-depth-measurements-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function exportIceMakesToCSV(iceMakes: Array<{
  id: string;
  rink_name: string;
  resurfacer: string;
  operator: string;
  water_used: number;
  snow_level: number;
  cut_type: string;
  created_at: string;
}>): void {
  const headers = ['ID', 'Rink', 'Resurfacer', 'Operator', 'Water Used (%)', 'Snow Level (%)', 'Cut Type', 'Date'];
  const rows = iceMakes.map(m => [
    m.id,
    m.rink_name,
    m.resurfacer,
    m.operator,
    m.water_used.toString(),
    m.snow_level.toString(),
    m.cut_type,
    format(new Date(m.created_at), 'yyyy-MM-dd HH:mm'),
  ]);

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `ice-makes-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
