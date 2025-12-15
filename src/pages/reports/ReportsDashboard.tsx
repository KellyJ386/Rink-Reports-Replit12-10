import { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Card, CardHeader, CardContent, Button
} from '../../components/ui';
import {
  Download, FileText, Calendar, TrendingUp, TrendingDown,
  Droplet, Ruler, Clock, Filter
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { exportReportToPDF, exportReportToCSV } from '../../lib/report-export';

// Demo data - will be replaced with real data from Supabase
const generateDemoData = () => {
  const days = 30;
  const iceDepthData = [];
  const iceMakeData = [];

  for (let i = days; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'MMM dd');

    iceDepthData.push({
      date: dateStr,
      fullDate: date.toISOString(),
      avgDepth: 30 + Math.random() * 10,
      minDepth: 25 + Math.random() * 5,
      maxDepth: 38 + Math.random() * 8,
      rinkA: 32 + Math.random() * 6,
      rinkB: 28 + Math.random() * 8,
    });

    iceMakeData.push({
      date: dateStr,
      fullDate: date.toISOString(),
      count: Math.floor(8 + Math.random() * 6),
      avgWater: 60 + Math.random() * 25,
      avgSnow: 40 + Math.random() * 30,
    });
  }

  return { iceDepthData, iceMakeData };
};

export function ReportsDashboard() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedRink, setSelectedRink] = useState<'all' | 'rink-a' | 'rink-b'>('all');

  const { iceDepthData, iceMakeData } = useMemo(() => generateDemoData(), []);

  // Calculate summary stats
  const stats = useMemo(() => {
    const filteredDepth = iceDepthData.slice(-parseInt(dateRange));
    const filteredMakes = iceMakeData.slice(-parseInt(dateRange));

    const avgDepth = filteredDepth.reduce((sum, d) => sum + d.avgDepth, 0) / filteredDepth.length;
    const totalMakes = filteredMakes.reduce((sum, d) => sum + d.count, 0);
    const avgWater = filteredMakes.reduce((sum, d) => sum + d.avgWater, 0) / filteredMakes.length;

    // Trend calculation (comparing first half to second half)
    const midpoint = Math.floor(filteredDepth.length / 2);
    const firstHalf = filteredDepth.slice(0, midpoint);
    const secondHalf = filteredDepth.slice(midpoint);
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.avgDepth, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.avgDepth, 0) / secondHalf.length;
    const depthTrend = ((secondAvg - firstAvg) / firstAvg) * 100;

    return {
      avgDepth: avgDepth.toFixed(1),
      totalMakes,
      avgWater: avgWater.toFixed(0),
      depthTrend: depthTrend.toFixed(1),
      criticalDays: filteredDepth.filter(d => d.minDepth < 25.4).length,
      idealDays: filteredDepth.filter(d => d.avgDepth >= 25.4 && d.avgDepth <= 44.45).length,
    };
  }, [iceDepthData, iceMakeData, dateRange]);

  // Distribution data for pie chart
  const distributionData = useMemo(() => {
    const filteredDepth = iceDepthData.slice(-parseInt(dateRange));
    let critical = 0, warning = 0, ideal = 0;

    filteredDepth.forEach(d => {
      if (d.avgDepth < 25.4) critical++;
      else if (d.avgDepth > 44.45) warning++;
      else ideal++;
    });

    return [
      { name: 'Ideal', value: ideal, color: '#10b981' },
      { name: 'Warning', value: warning, color: '#f59e0b' },
      { name: 'Critical', value: critical, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [iceDepthData, dateRange]);

  const handleExportPDF = () => {
    exportReportToPDF({
      title: 'Ice Operations Report',
      dateRange,
      stats,
      iceDepthData: iceDepthData.slice(-parseInt(dateRange)),
      iceMakeData: iceMakeData.slice(-parseInt(dateRange)),
    });
  };

  const handleExportCSV = () => {
    exportReportToCSV({
      iceDepthData: iceDepthData.slice(-parseInt(dateRange)),
      iceMakeData: iceMakeData.slice(-parseInt(dateRange)),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy">Reports & Analytics</h1>
          <p className="text-wolf-600 mt-1">Track trends and export operational data</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            leftIcon={<FileText className="h-4 w-4" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
          <Button
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleExportPDF}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-wolf-500" />
              <span className="text-sm text-wolf-600">Date Range:</span>
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    dateRange === range
                      ? 'bg-navy text-white'
                      : 'bg-wolf-100 text-wolf-600 hover:bg-wolf-200'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-wolf-500" />
              <span className="text-sm text-wolf-600">Rink:</span>
              {(['all', 'rink-a', 'rink-b'] as const).map((rink) => (
                <button
                  key={rink}
                  onClick={() => setSelectedRink(rink)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedRink === rink
                      ? 'bg-navy text-white'
                      : 'bg-wolf-100 text-wolf-600 hover:bg-wolf-200'
                  }`}
                >
                  {rink === 'all' ? 'All Rinks' : rink === 'rink-a' ? 'Rink A' : 'Rink B'}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-wolf-600">Avg Ice Depth</p>
                <p className="text-2xl font-bold text-navy">{stats.avgDepth}mm</p>
                <div className="flex items-center gap-1 mt-1">
                  {parseFloat(stats.depthTrend) >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-action" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-danger" />
                  )}
                  <span className={`text-xs ${parseFloat(stats.depthTrend) >= 0 ? 'text-action' : 'text-danger'}`}>
                    {stats.depthTrend}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Ruler className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-wolf-600">Total Ice Makes</p>
                <p className="text-2xl font-bold text-navy">{stats.totalMakes}</p>
                <p className="text-xs text-wolf-500 mt-1">
                  {(stats.totalMakes / parseInt(dateRange)).toFixed(1)} per day
                </p>
              </div>
              <div className="p-3 bg-action-100 rounded-lg">
                <Droplet className="h-6 w-6 text-action" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-wolf-600">Avg Water Used</p>
                <p className="text-2xl font-bold text-navy">{stats.avgWater}%</p>
                <p className="text-xs text-wolf-500 mt-1">per ice make</p>
              </div>
              <div className="p-3 bg-cyan-100 rounded-lg">
                <Droplet className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-wolf-600">Days in Ideal Range</p>
                <p className="text-2xl font-bold text-navy">{stats.idealDays}</p>
                <p className="text-xs text-wolf-500 mt-1">
                  {((stats.idealDays / parseInt(dateRange)) * 100).toFixed(0)}% of period
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ice Depth Trend */}
        <Card>
          <CardHeader title="Ice Depth Trend" description="Average depth over time" />
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={iceDepthData.slice(-parseInt(dateRange))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[20, 50]}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    label={{ value: 'mm', angle: -90, position: 'insideLeft', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  {selectedRink === 'all' ? (
                    <>
                      <Line
                        type="monotone"
                        dataKey="rinkA"
                        name="Rink A"
                        stroke="#1e3a5f"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="rinkB"
                        name="Rink B"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                      />
                    </>
                  ) : (
                    <Line
                      type="monotone"
                      dataKey={selectedRink === 'rink-a' ? 'rinkA' : 'rinkB'}
                      name={selectedRink === 'rink-a' ? 'Rink A' : 'Rink B'}
                      stroke="#1e3a5f"
                      strokeWidth={2}
                      dot={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Ice Makes per Day */}
        <Card>
          <CardHeader title="Daily Ice Makes" description="Resurfacing activity" />
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={iceMakeData.slice(-parseInt(dateRange))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Ice Makes"
                    fill="#1e3a5f"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Depth Distribution */}
        <Card>
          <CardHeader title="Depth Status Distribution" description="Days by status" />
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Water Usage Trend */}
        <Card className="lg:col-span-2">
          <CardHeader title="Resource Usage" description="Water and snow tank levels" />
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={iceMakeData.slice(-parseInt(dateRange))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    label={{ value: '%', angle: -90, position: 'insideLeft', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avgWater"
                    name="Avg Water Used"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgSnow"
                    name="Avg Snow Level"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader
          title="Period Summary"
          description={`Last ${dateRange === '7d' ? '7 days' : dateRange === '30d' ? '30 days' : '90 days'}`}
        />
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-wolf-50 rounded-lg">
              <p className="text-sm text-wolf-600">Total Measurements</p>
              <p className="text-xl font-bold text-navy">{parseInt(dateRange)}</p>
            </div>
            <div className="p-4 bg-wolf-50 rounded-lg">
              <p className="text-sm text-wolf-600">Critical Alerts</p>
              <p className="text-xl font-bold text-danger">{stats.criticalDays}</p>
            </div>
            <div className="p-4 bg-wolf-50 rounded-lg">
              <p className="text-sm text-wolf-600">Blade Changes</p>
              <p className="text-xl font-bold text-navy">2</p>
            </div>
            <div className="p-4 bg-wolf-50 rounded-lg">
              <p className="text-sm text-wolf-600">Circle Checks</p>
              <p className="text-xl font-bold text-navy">{stats.totalMakes}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
