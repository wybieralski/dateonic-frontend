import React, { useState, useRef } from 'react';
import {
  Upload, Database, Webhook, Home, BarChart2, Settings, Users, HelpCircle,
  Download, Share
} from 'lucide-react';
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import logo from './Dateonic_logo.png';


// Paleta kolorów
const COLORS = [
  '#3B82F6', // jasny niebieski
  '#06B6D4', // turkusowy
  '#F97316', // pomarańczowy
  '#06B6D4', // turkusowy
  '#FBBF24', // żółty
  '#8B5CF6'  // fioletowy
];

// Kolory dla hover states
const HOVER_COLORS = {
  upload: 'hover:bg-blue-50 hover:text-blue-600',
  api: 'hover:bg-cyan-50 hover:text-cyan-600',
  database: 'hover:bg-violet-50 hover:text-violet-600'
};

// Kolory dla ikon w kartach
const ICON_BG_COLORS = {
  upload: 'bg-blue-100 text-blue-600',
  api: 'bg-cyan-100 text-cyan-600',
  database: 'bg-violet-100 text-violet-600'
};

// Komponent przycisku eksportu
const ExportButton = ({ onClick, type, loading }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`
      flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium
      ${loading ? 'bg-gray-200 text-gray-500' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}
      transition-colors duration-200
    `}
  >
    {loading ? (
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
    ) : (
      <Download size={16} />
    )}
    <span>Export as {type}</span>
  </button>
);

// Komponent wykresu
const ChartComponent = ({ chart }) => {
  switch (chart.type) {
    case 'line':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey={chart.data_columns[0]} />
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '6px' }} />
            <Legend />
            {chart.data_columns.slice(1).map((column, i) => (
              <Line
                key={column}
                type="monotone"
                dataKey={column}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ fill: COLORS[i % COLORS.length], r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );

    case 'bar':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey={chart.data_columns[0]} />
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '6px' }} />
            <Legend />
            {chart.data_columns.slice(1).map((column, i) => (
              <Bar
                key={column}
                dataKey={column}
                fill={COLORS[i % COLORS.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );

    case 'pie':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chart.data}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={80}
              dataKey="value"
            >
              {chart.data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '6px' }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );

    default:
      return null;
  }
};

// Główny komponent Dashboard
const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [exportingPNG, setExportingPNG] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const dashboardRef = useRef(null);



  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (option) => {
    document.getElementById('fileInput').click();
  };

  const exportAsPNG = async () => {
    if (!dashboardRef.current || !analysis) return;

    setExportingPNG(true);
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        backgroundColor: '#F9FAFB',
        logging: false,
        windowWidth: dashboardRef.current.scrollWidth,
        windowHeight: dashboardRef.current.scrollHeight
      });

      const link = document.createElement('a');
      link.download = 'dateonic-dashboard.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Export PNG failed:', error);
    } finally {
      setExportingPNG(false);
    }
  };

  const exportAsPDF = async () => {
    if (!dashboardRef.current || !analysis) return;

    setExportingPDF(true);
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        backgroundColor: '#F9FAFB',
        logging: false
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
        unit: 'mm'
      });

      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        0,
        imgWidth,
        imgHeight
      );

      pdf.save('dateonic-dashboard.pdf');
    } catch (error) {
      console.error('Export PDF failed:', error);
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <input
        type="file"
        id="fileInput"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Sidebar */}
      <div className="w-52 bg-white border-r border-gray-200 min-h-screen flex flex-col shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <img
            src={logo}
            alt="Company Logo"
            className="h-6 object-contain"
          />
        </div>

        <nav className="p-2 flex-1">
          {/* Import Options */}
          <div className="space-y-1 mb-6">
            <div
              className={`flex items-center text-sm space-x-3 p-2 text-gray-600 ${HOVER_COLORS.upload} rounded-md cursor-pointer transition-colors`}
              onClick={() => handleOptionClick('upload')}
            >
              <Upload size={18} />
              <span className="font-medium">Upload Files</span>
            </div>
            <div
              className={`flex items-center text-sm space-x-3 p-2 text-gray-600 ${HOVER_COLORS.api} rounded-md cursor-pointer transition-colors`}
              onClick={() => handleOptionClick('api')}
            >
              <Webhook size={18} />
              <span className="font-medium">Connect API</span>
            </div>
            <div
              className={`flex items-center text-sm space-x-3 p-2 text-gray-600 ${HOVER_COLORS.database} rounded-md cursor-pointer transition-colors`}
              onClick={() => handleOptionClick('database')}
            >
              <Database size={18} />
              <span className="font-medium">Connect Database</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-4"></div>

          {/* Menu Items */}
          <div className="space-y-1">
            <div className="flex items-center text-sm space-x-3 p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md cursor-pointer transition-colors">
              <Home size={18} />
              <span className="font-medium">Dashboard</span>
            </div>
            <div className="flex items-center text-sm space-x-3 p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md cursor-pointer transition-colors">
              <BarChart2 size={18} />
              <span className="font-medium">Analytics</span>
            </div>
            <div className="flex items-center text-sm space-x-3 p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md cursor-pointer transition-colors">
              <Users size={18} />
              <span className="font-medium">Team</span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100">
            <div className="space-y-1">
              <div className="flex items-center text-sm space-x-3 p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md cursor-pointer transition-colors">
                <Settings size={18} />
                <span className="font-medium">Settings</span>
              </div>
              <div className="flex items-center text-sm space-x-3 p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md cursor-pointer transition-colors">
                <HelpCircle size={18} />
                <span className="font-medium">Help</span>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Wersja testowa BETA 1.0</h1>

          {analysis && (
            <div className="flex space-x-3">
                    <button
                onClick={() => alert('Share functionality coming soon!')}
                className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200"
              >
                <Share size={16} />
                <span>Share</span>
              </button>
              <ExportButton
                onClick={exportAsPNG}
                type="PNG"
                loading={exportingPNG}
              />
              <ExportButton
                onClick={exportAsPDF}
                type="PDF"
                loading={exportingPDF}
              />
            </div>
          )}
        </div>

        {!analysis && (
          <div className="space-y-4 max-w-xl">
            {/* Upload Card */}
            <div
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100"
              onClick={() => handleOptionClick('upload')}
            >
              <div className="flex items-center space-x-4">
                <div className={`h-14 w-14 rounded-full ${ICON_BG_COLORS.upload} flex items-center justify-center transition-colors`}>
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Upload Files</h3>
                  <p className="text-sm text-gray-600">
                    Drag and drop your data files or click to browse
                  </p>
                </div>
              </div>
            </div>

            {/* API Card */}
            <div
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100"
              onClick={() => handleOptionClick('api')}
            >
              <div className="flex items-center space-x-4">
                <div className={`h-14 w-14 rounded-full ${ICON_BG_COLORS.api} flex items-center justify-center transition-colors`}>
                  <Webhook className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Connect with API</h3>
                  <p className="text-sm text-gray-600">
                    Connect your data source via API
                  </p>
                </div>
              </div>
            </div>

            {/* Database Card */}
            <div
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100"
              onClick={() => handleOptionClick('database')}
            >
              <div className="flex items-center space-x-4">
                <div className={`h-14 w-14 rounded-full ${ICON_BG_COLORS.database} flex items-center justify-center transition-colors`}>
                  <Database className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Connect Database</h3>
                  <p className="text-sm text-gray-600">
                    Connect directly to your database
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}


        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6" ref={dashboardRef}>
            {/* Key Insights */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Key Insights</h2>
              <ul className="list-disc pl-4 space-y-2">
                {analysis.key_insights?.map((insight, index) => (
                  <li key={index} className="text-gray-700">{insight}</li>
                ))}
              </ul>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6">
              {analysis.suggested_charts?.map((chart, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold mb-2">{chart.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{chart.description}</p>
                  <div className="h-80">
                    <ChartComponent chart={chart} />
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Analysis */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Suggested Additional Analysis</h2>
              <ul className="list-disc pl-4 space-y-2">
                {analysis.additional_analysis_suggested?.map((suggestion, index) => (
                  <li key={index} className="text-gray-700">{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
