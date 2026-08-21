import React, { useState, useEffect } from 'react';
import { getAnalyticsSummary, AnalyticsSummary } from '../utils/analytics';
import logoImg from '../assets/images/logo.png';
import { PARALIFE_META } from '../data/paralifeData';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [daysRange, setDaysRange] = useState<number>(14);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<{
    x: number;
    y: number;
    date: string;
    fullDate: string;
    visits: number;
    uniques: number;
  } | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    date: string;
    fullDate: string;
    visits: number;
    uniques: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'subscribers'>('overview');

  const loadData = async (range: number) => {
    setLoading(true);
    const summary = await getAnalyticsSummary(range);
    setData(summary);
    setLoading(false);
  };

  useEffect(() => {
    loadData(daysRange);
  }, [daysRange]);

  const handleExportCSV = () => {
    if (!data || !data.subscribers.length) return;
    const csvHeader = 'ID,Email,Created At,Status\n';
    const csvRows = data.subscribers
      .map((s) => `"${s.id}","${s.email}","${s.created_at}","${s.status}"`)
      .join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `paralife_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteSubscriber = async (id: string, email: string) => {
    if (!window.confirm(`Удалить подписчика ${email}?`)) return;

    try {
      // 1. Send delete request to VPS API
      await fetch(`/api/subscribers/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }).catch(() => {});

      // 2. Optimistically update local state
      setData((prev) => {
        if (!prev) return prev;
        const filtered = prev.subscribers.filter((s) => s.id !== id && s.email !== email);
        return {
          ...prev,
          totalSubscribers: filtered.length,
          subscribers: filtered,
          conversionRate:
            prev.uniqueVisitors > 0
              ? Number(((filtered.length / prev.uniqueVisitors) * 100).toFixed(1))
              : 0,
        };
      });
    } catch (err) {
      console.error('Delete subscriber error:', err);
    }
  };

  // SVG Chart Dimensions (Taller & more expressive on mobile & desktop)
  const chartWidth = 840;
  const chartHeight = 340;
  const paddingX = 45;
  const paddingY = 40;

  const chartData = data?.chartData || [];
  const maxVisits = Math.max(...chartData.map((d) => d.visits), 4);

  const points = chartData.map((d, index) => {
    const x = paddingX + (index / Math.max(chartData.length - 1, 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (d.visits / maxVisits) * (chartHeight - paddingY * 2);
    return { x, y, ...d };
  });

  const linePath = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[i - 1];
    const cx1 = prev.x + (point.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (point.x - prev.x) / 2;
    const cy2 = point.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${point.x} ${point.y}`;
  }, '');

  const areaPath = linePath
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${
        chartHeight - paddingY
      } Z`
    : '';

  const activePoint = selectedPoint || hoveredPoint || (points.length > 0 ? points[points.length - 1] : null);

  return (
    <div className="min-h-screen w-full bg-[#121316] text-[#F2EEE8] selection:bg-[#FF2D85]/30">
      
      {/* Top Brand Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#121316]/95 backdrop-blur-md border-b border-[#F2EEE8]/10 py-3 sm:py-5 px-4 sm:px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          
          <div className="flex items-center space-x-3 sm:space-x-6">
            <a href="/" className="hover:opacity-80 transition-opacity">
              <img
                src={logoImg}
                alt={PARALIFE_META.brandName}
                className="h-6 sm:h-8 md:h-10 w-auto object-contain max-w-[110px] sm:max-w-[180px]"
              />
            </a>
            <span className="section-label text-[#FF2D85] cursor-default hidden md:inline-block">
              +control panel
            </span>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-6">
            {/* Desktop Range Filters */}
            <div className="hidden sm:flex items-center space-x-2 text-[11px] sm:text-[12px] uppercase tracking-[0.1em] bg-[#16171d] p-1 rounded-sm border border-[#F2EEE8]/10">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => setDaysRange(days)}
                  className={`py-1 px-2.5 rounded-xs transition-colors cursor-pointer text-[11px] ${
                    daysRange === days ? 'bg-[#FF2D85] text-white font-bold' : 'text-[#F2EEE8]/60 hover:text-[#F2EEE8]'
                  }`}
                >
                  +{days}d
                </button>
              ))}
            </div>

            {/* Exit to Site */}
            <button
              onClick={onClose}
              className="text-[11px] sm:text-[12px] uppercase tracking-[0.1em] text-[#F2EEE8]/80 hover:text-[#FF2D85] transition-colors cursor-pointer font-medium min-h-[36px] px-2.5 sm:px-3 flex items-center border border-[#F2EEE8]/15 hover:border-[#FF2D85]/60 rounded-sm"
            >
              ← return
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 pt-20 sm:pt-28 md:pt-32 pb-16 sm:pb-20 flex flex-col space-y-8 sm:space-y-12">
        
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-6 sm:space-x-10 border-b border-[#F2EEE8]/10 pb-3 sm:pb-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`text-[12px] sm:text-[13px] tracking-[0.12em] uppercase transition-colors cursor-pointer font-semibold py-1 border-b-2 ${
              activeTab === 'overview' ? 'text-[#FF2D85] border-[#FF2D85]' : 'text-[#F2EEE8]/52 hover:text-[#F2EEE8] border-transparent'
            }`}
          >
            +analytics
          </button>
          
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`text-[12px] sm:text-[13px] tracking-[0.12em] uppercase transition-colors cursor-pointer font-semibold py-1 border-b-2 flex items-center space-x-2 ${
              activeTab === 'subscribers' ? 'text-[#FF2D85] border-[#FF2D85]' : 'text-[#F2EEE8]/52 hover:text-[#F2EEE8] border-transparent'
            }`}
          >
            <span>+subscribers</span>
            {data && data.totalSubscribers > 0 && (
              <span className="text-[10px] bg-[#FF2D85] text-white px-1.5 py-0.2 rounded-full font-mono font-bold">
                {data.totalSubscribers}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: OVERVIEW & CHARTS */}
        {activeTab === 'overview' && (
          <div className="flex flex-col space-y-6 sm:space-y-12 animate-fade-in">
            
            {/* Mobile Period Selector (Only in Analytics) */}
            <div className="flex sm:hidden items-center justify-between bg-[#16171d] p-1.5 rounded-sm border border-[#F2EEE8]/10 w-full">
              <span className="text-[10px] uppercase tracking-wider text-[#F2EEE8]/50 px-2 font-medium">Период:</span>
              <div className="flex items-center space-x-1">
                {[7, 14, 30].map((days) => (
                  <button
                    key={days}
                    onClick={() => setDaysRange(days)}
                    className={`py-1 px-3 rounded-xs text-[11px] font-semibold tracking-wider uppercase transition-all ${
                      daysRange === days ? 'bg-[#FF2D85] text-white' : 'text-[#F2EEE8]/60 hover:text-white'
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            </div>

            {/* Metric Grid (Cards on Mobile, 4-cols on Desktop) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
              
              <div className="bg-[#16171d] border border-[#F2EEE8]/8 p-3.5 sm:p-5 rounded-sm flex flex-col space-y-1.5 sm:space-y-2">
                <span className="text-[9px] sm:text-[11px] tracking-[0.14em] uppercase text-[#F2EEE8]/52 font-medium">
                  UNIQUE DEVICES
                </span>
                <span className="text-2xl sm:text-4xl md:text-5xl font-light tracking-tight text-[#F2EEE8]">
                  {loading ? '...' : data?.uniqueVisitors.toLocaleString()}
                </span>
                <span className="text-[10px] sm:text-[12px] tracking-[0.04em] text-[#F2EEE8]/40 uppercase">
                  1 visit per device
                </span>
              </div>

              <div className="bg-[#16171d] border border-[#F2EEE8]/8 p-3.5 sm:p-5 rounded-sm flex flex-col space-y-1.5 sm:space-y-2">
                <span className="text-[9px] sm:text-[11px] tracking-[0.14em] uppercase text-[#F2EEE8]/52 font-medium">
                  TODAY'S DEVICES
                </span>
                <span className="text-2xl sm:text-4xl md:text-5xl font-light tracking-tight text-[#F2EEE8]">
                  {loading ? '...' : data?.todayVisits.toLocaleString()}
                </span>
                <span className="text-[10px] sm:text-[12px] tracking-[0.04em] text-[#F2EEE8]/40 uppercase">
                  New devices today
                </span>
              </div>

              <div className="bg-[#16171d] border border-[#FF2D85]/20 p-3.5 sm:p-5 rounded-sm flex flex-col space-y-1.5 sm:space-y-2">
                <span className="text-[9px] sm:text-[11px] tracking-[0.14em] uppercase text-[#FF2D85]/80 font-medium">
                  SIGNAL SUBSCRIBERS
                </span>
                <span className="text-2xl sm:text-4xl md:text-5xl font-light tracking-tight text-[#FF2D85]">
                  {loading ? '...' : data?.totalSubscribers.toLocaleString()}
                </span>
                <span className="text-[10px] sm:text-[12px] tracking-[0.04em] text-[#00FF88] uppercase">
                  Real records
                </span>
              </div>

              <div className="bg-[#16171d] border border-[#F2EEE8]/8 p-3.5 sm:p-5 rounded-sm flex flex-col space-y-1.5 sm:space-y-2">
                <span className="text-[9px] sm:text-[11px] tracking-[0.14em] uppercase text-[#F2EEE8]/52 font-medium">
                  CONVERSION RATE
                </span>
                <span className="text-2xl sm:text-4xl md:text-5xl font-light tracking-tight text-[#F2EEE8]">
                  {loading ? '...' : `${data?.conversionRate}%`}
                </span>
                <span className="text-[10px] sm:text-[12px] tracking-[0.04em] text-[#F2EEE8]/40 uppercase">
                  Subscribers / Devices
                </span>
              </div>

            </div>

            {/* TRAFFIC ACTIVITY CHART */}
            <div className="flex flex-col space-y-3 sm:space-y-5">
              
              {/* Header with live inline detail HUD */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#F2EEE8]/10 pb-3 gap-2">
                <div>
                  <span className="section-label text-[#F2EEE8]/52">
                    +signal activity
                  </span>
                  <h3 className="text-[18px] sm:text-[24px] md:text-[28px] text-[#F2EEE8] font-normal tracking-tight mt-1">
                    Device Activity Trajectory
                  </h3>
                </div>

                {/* Integrated live data read-out */}
                {activePoint && (
                  <div className="flex items-center space-x-2 text-[11px] sm:text-[13px]">
                    <span className="text-[#F2EEE8]/52 uppercase tracking-wider">
                      {activePoint.fullDate || activePoint.date}:
                    </span>
                    <span className="text-[#FF2D85] font-semibold tracking-wide">
                      {activePoint.visits} {activePoint.visits === 1 ? 'device' : 'devices'}
                    </span>
                  </div>
                )}
              </div>

              {/* Seamless Responsive Chart Area (No Horizontal Scrollbar on Mobile) */}
              <div className="w-full bg-[#15161b] border border-[#F2EEE8]/10 p-2 sm:p-6 relative rounded-sm overflow-hidden">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-auto block"
                >
                  <defs>
                    <linearGradient id="paralifeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF2D85" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#FF2D85" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>

                  {/* Subtle Hairline Grid */}
                  {[0, 0.5, 1].map((ratio) => {
                    const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
                    const val = Math.round(ratio * maxVisits);
                    return (
                      <g key={ratio}>
                        <line
                          x1={paddingX}
                          y1={y}
                          x2={chartWidth - paddingX}
                          y2={y}
                          stroke="rgba(242, 238, 232, 0.05)"
                        />
                        <text
                          x={paddingX - 8}
                          y={y + 3}
                          fill="rgba(242, 238, 232, 0.3)"
                          fontSize="10"
                          textAnchor="end"
                          className="font-mono"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Gradient Area Fill */}
                  {areaPath && <path d={areaPath} fill="url(#paralifeGradient)" />}

                  {/* Active Point Vertical Guideline */}
                  {activePoint && (
                    <line
                      x1={activePoint.x}
                      y1={activePoint.y}
                      x2={activePoint.x}
                      y2={chartHeight - paddingY}
                      stroke="#FF2D85"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      opacity="0.8"
                    />
                  )}

                  {/* Neon Curve */}
                  {linePath && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#FF2D85"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Interactive Touch Nodes */}
                  {points.map((p, idx) => {
                    const isSelected = activePoint?.x === p.x;
                    return (
                      <g key={idx} className="cursor-pointer">
                        {/* Large invisible touch hit area (easy finger tap on phone) */}
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="26"
                          fill="transparent"
                          onClick={() => setSelectedPoint(p)}
                          onTouchStart={() => setSelectedPoint(p)}
                          onMouseEnter={() => setHoveredPoint(p)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />

                        {/* Outer Glowing Ring when Selected / Tapped */}
                        {isSelected && (
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="11"
                            fill="#FF2D85"
                            fillOpacity="0.25"
                            stroke="#FF2D85"
                            strokeWidth="2"
                          />
                        )}

                        {/* Visible Node Circle */}
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={isSelected ? '6' : '4.5'}
                          fill={isSelected ? '#FF2D85' : '#121316'}
                          stroke={isSelected ? '#FFFFFF' : '#FF2D85'}
                          strokeWidth="2"
                          className="transition-all duration-150 pointer-events-none"
                        />

                        {/* Dates on bottom axis */}
                        {(idx === 0 ||
                          idx === Math.floor(points.length / 2) ||
                          idx === points.length - 1) && (
                          <text
                            x={p.x}
                            y={chartHeight - 10}
                            fill="rgba(242, 238, 232, 0.5)"
                            fontSize="11"
                            textAnchor="middle"
                            className="uppercase tracking-wider font-mono pointer-events-none"
                          >
                            {p.date}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Direct Floating Tooltip Badge Over Selected Node */}
                  {activePoint && (
                    <g
                      className="transition-all duration-150 pointer-events-none"
                      transform={`translate(${Math.max(15, Math.min(chartWidth - 135, activePoint.x - 60))}, ${Math.max(
                        10,
                        activePoint.y - 60
                      )})`}
                    >
                      <rect
                        width="120"
                        height="44"
                        rx="6"
                        fill="#181920"
                        stroke="#FF2D85"
                        strokeWidth="1.5"
                        filter="drop-shadow(0 6px 12px rgba(255, 45, 133, 0.35))"
                      />
                      <text
                        x="60"
                        y="20"
                        fill="#F2EEE8"
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                        letterSpacing="0.04em"
                      >
                        {activePoint.visits} {activePoint.visits === 1 ? 'ДЕВАЙС' : 'ДЕВАЙСОВ'}
                      </text>
                      <text
                        x="60"
                        y="35"
                        fill="rgba(242, 238, 232, 0.6)"
                        fontSize="10"
                        textAnchor="middle"
                        className="font-mono uppercase tracking-wider"
                      >
                        {activePoint.date}
                      </text>
                    </g>
                  )}
                </svg>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: SUBSCRIBERS TABLE */}
        {activeTab === 'subscribers' && (
          <div className="flex flex-col space-y-4 sm:space-y-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#F2EEE8]/10 pb-3 sm:pb-5 gap-3">
              <div>
                <span className="section-label text-[#F2EEE8]/52 text-[10px] sm:text-[11px]">+database</span>
                <h3 className="text-[17px] sm:text-[24px] md:text-[28px] text-[#F2EEE8] font-normal tracking-tight mt-0.5">
                  Signal Subscribers
                </h3>
              </div>
              <button
                type="button"
                onClick={handleExportCSV}
                disabled={!data || data.subscribers.length === 0}
                className={`py-2 px-3.5 sm:px-6 text-[11px] sm:text-[12px] tracking-[0.08em] sm:tracking-[0.1em] uppercase font-medium transition-all duration-150 min-h-[36px] sm:min-h-[44px] flex items-center justify-center whitespace-nowrap rounded-xs ${
                  data && data.subscribers.length > 0
                    ? 'bg-[#FF2D85] hover:bg-[#ff1275] active:bg-[#ff1275] text-white cursor-pointer shadow-lg shadow-[#FF2D85]/20'
                    : 'bg-[#1c1d24] text-[#F2EEE8]/30 border border-[#F2EEE8]/10 cursor-not-allowed opacity-60'
                }`}
              >
                +export csv
              </button>
            </div>

            {data?.subscribers.length === 0 ? (
              <div className="py-20 text-center text-[#F2EEE8]/40 text-[13px] tracking-wider uppercase">
                No active subscribers in database.
              </div>
            ) : (
              <>
                {/* Desktop & Tablet Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-[13px] tracking-wide">
                    <thead>
                      <tr className="border-b border-[#F2EEE8]/10 text-[#F2EEE8]/40 uppercase text-[11px] tracking-[0.14em]">
                        <th className="py-3 px-4 font-normal">#</th>
                        <th className="py-3 px-4 font-normal">Email Address</th>
                        <th className="py-3 px-4 font-normal">Timestamp</th>
                        <th className="py-3 px-4 font-normal">Status</th>
                        <th className="py-3 px-4 font-normal text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.subscribers.map((sub, idx) => (
                        <tr
                          key={sub.id || idx}
                          className="border-b border-[#F2EEE8]/6 hover:bg-[#18191f] transition-colors group"
                        >
                          <td className="py-3.5 px-4 text-[#F2EEE8]/40 font-mono">{idx + 1}</td>
                          <td className="py-3.5 px-4 text-[#F2EEE8] font-medium">{sub.email}</td>
                          <td className="py-3.5 px-4 text-[#F2EEE8]/60 font-mono text-[12px]">
                            {new Date(sub.created_at).toLocaleString('ru-RU')}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[11px] tracking-[0.1em] text-[#00FF88] uppercase font-medium">
                              +{sub.status || 'active'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                              className="text-[11px] tracking-[0.08em] uppercase text-[#F2EEE8]/40 hover:text-[#FF4D88] active:text-[#FF4D88] transition-colors cursor-pointer py-1 px-2.5 hover:bg-[#FF4D88]/10 rounded-sm font-medium"
                              title="Удалить подписчика"
                            >
                              ✕ delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="sm:hidden flex flex-col space-y-3">
                  {data?.subscribers.map((sub, idx) => (
                    <div
                      key={sub.id || idx}
                      className="bg-[#16171d] border border-[#F2EEE8]/10 p-4 rounded-sm flex flex-col space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[#F2EEE8]/40 font-mono">#{idx + 1}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] tracking-[0.1em] text-[#00FF88] uppercase font-medium bg-[#00FF88]/10 px-2 py-0.5 rounded-sm">
                            +{sub.status || 'active'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                            className="text-[10px] tracking-[0.08em] uppercase text-[#FF4D88] hover:text-[#ff1275] bg-[#FF4D88]/10 hover:bg-[#FF4D88]/20 px-2 py-0.5 rounded-sm font-medium transition-colors"
                          >
                            ✕ delete
                          </button>
                        </div>
                      </div>
                      <span className="text-[14px] text-[#F2EEE8] font-medium break-all select-all">
                        {sub.email}
                      </span>
                      <span className="text-[11px] text-[#F2EEE8]/52 font-mono">
                        {new Date(sub.created_at).toLocaleString('ru-RU')}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

      </main>

      {/* Admin Footer */}
      <footer className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 py-8 sm:py-12 border-t border-[#F2EEE8]/10 flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-[12px] tracking-[0.1em] text-[#F2EEE8]/40 uppercase gap-3">
        <span>© PARALIFE // CONTROL</span>
        <span>Less Noise. More Life.</span>
      </footer>

    </div>
  );
};
