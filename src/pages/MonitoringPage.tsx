import React, { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HCMore from 'highcharts/highcharts-more'; // For specific chart types if needed
import HCSolidGauge from 'highcharts/modules/solid-gauge'; // For gauges if needed

if (typeof Highcharts === 'object') {
  HCMore(Highcharts); // Initialize HCMore
  HCSolidGauge(Highcharts); // Initialize HCSolidGauge
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface MetricCount {
  count: number;
  method?: string;
  path?: string;
  statusCode?: number;
}

interface MetricPercentile {
  quantile?: number;
  durationSeconds?: number;
  method?: string;
  path?: string;
  statusCode?: number;
}

interface MetricsSummary {
  processStartTimeSeconds: number;
  cpuUsageSecondsTotal: number;
  memoryUsageBytes: number;
  httpRequestCounts: MetricCount[];
  httpRequestDurationPercentiles: MetricPercentile[];
}

const MAX_DATA_POINTS = 30; // Keep last 30 data points for charts

const MonitoringPage: React.FC = () => {
  const [memoryHistory, setMemoryHistory] = useState<[number, number][]>([]);
  const [cpuHistory, setCpuHistory] = useState<[number, number][]>([]);

  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const { data, error } = useSWR<MetricsSummary>('/api/metrics/summary', fetcher, {
    refreshInterval: 5000, // Refresh every 5 seconds
  });

  useEffect(() => {
    if (data) {
      const now = new Date().getTime();
      
      // Memory History
      const memoryMb = parseFloat((data.memoryUsageBytes / 1024 / 1024).toFixed(2));
      setMemoryHistory(prev => {
        const newHistory = [...prev, [now, memoryMb] as [number, number]];
        return newHistory.length > MAX_DATA_POINTS ? newHistory.slice(newHistory.length - MAX_DATA_POINTS) : newHistory;
      });

      // CPU History (using current value as a point, assuming it's a cumulative counter)
      // For a true CPU utilization chart over time, backend would need to provide periodic CPU % or we'd calculate diffs
      const cpuTotal = parseFloat(data.cpuUsageSecondsTotal.toFixed(2));
      setCpuHistory(prev => {
        const newHistory = [...prev, [now, cpuTotal] as [number, number]];
        // If it's a counter, showing its raw value over time might not be % utilization
        // but can show activity. For actual % this needs more work.
        return newHistory.length > MAX_DATA_POINTS ? newHistory.slice(newHistory.length - MAX_DATA_POINTS) : newHistory;
      });

    }
  }, [data]);

  if (error) return <div>加载失败: {error.message}</div>;
  if (!data) return <div>加载中...</div>;

  return (
    <div className="p-4 space-y-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-400">应用监控面板</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-300">服务启动时间</h2>
          {data.processStartTimeSeconds ? (
            <p className="text-2xl text-green-400">
              {new Date(data.processStartTimeSeconds * 1000).toLocaleString()}
            </p>
          ) : (
            <p className="text-sm text-yellow-400">启动时间 N/A</p>
          )}
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-300">CPU 使用 (总计)</h2>
          <p className="text-2xl text-blue-400">{data.cpuUsageSecondsTotal.toFixed(2)} 秒</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-300">内存使用</h2>
          <p className="text-2xl text-purple-400">{(data.memoryUsageBytes / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3 text-gray-300">HTTP 请求统计</h2>
        {data.httpRequestCounts.length > 0 ? (
          <ul className="space-y-2">
            {data.httpRequestCounts.map((req, index) => (
              <li key={index} className="p-2 bg-gray-700 rounded">
                路径: {req.path || 'N/A'}, 方法: {req.method || 'N/A'}, 状态码: {req.statusCode || 'N/A'} - 次数: {req.count}
              </li>
            ))}
          </ul>
        ) : (
          <p>暂无 HTTP 请求数据。</p>
        )}
      </div>

      {/* Highcharts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3 text-gray-300">内存使用趋势 (MB)</h2>
          {memoryHistory.length > 0 ? (
            <HighchartsReact
              highcharts={Highcharts}
              options={{
                chart: { type: 'spline', backgroundColor: '#1f2937' },
                title: { text: '', style: { color: '#e5e7eb' } },
                xAxis: { type: 'datetime', labels: { style: { color: '#9ca3af' } } },
                yAxis: { title: { text: '内存 (MB)', style: { color: '#9ca3af' } }, labels: { style: { color: '#9ca3af' } }, gridLineColor: '#374151' },
                legend: { enabled: false },
                credits: { enabled: false },
                series: [{ name: '内存使用', data: memoryHistory, color: '#8b5cf6' }],
                time: { useUTC: false },
              }}
              ref={chartComponentRef}
            />
          ) : <p>正在收集内存数据...</p>}
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3 text-gray-300">HTTP 请求分布</h2>
          {data && data.httpRequestCounts.length > 0 ? (
            <HighchartsReact
              highcharts={Highcharts}
              options={{
                chart: { type: 'column', backgroundColor: '#1f2937' },
                title: { text: '', style: { color: '#e5e7eb' } },
                xAxis: {
                  categories: data.httpRequestCounts.map(req => `${req.method} ${req.path}`),
                  labels: { style: { color: '#9ca3af' } }
                },
                yAxis: { title: { text: '请求次数', style: { color: '#9ca3af' } }, labels: { style: { color: '#9ca3af' } }, gridLineColor: '#374151', allowDecimals: false },
                legend: { enabled: false },
                credits: { enabled: false },
                series: [{
                  name: '请求次数',
                  data: data.httpRequestCounts.map(req => req.count),
                  colorByPoint: true,
                  colors: ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#6366f1', '#ec4899']
                }],
              }}
            />
          ) : <p>暂无HTTP请求数据绘制图表。</p>}
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3 text-gray-300">HTTP 请求延迟 (P95)</h2>
        {data.httpRequestDurationPercentiles.filter(p => p.quantile === 0.95).length > 0 ? (
          <ul className="space-y-2">
            {data.httpRequestDurationPercentiles
              .filter(p => p.quantile === 0.95)
              .map((p, index) => (
                <li key={index} className="p-2 bg-gray-700 rounded">
                  路径: {p.path || 'N/A'}, 方法: {p.method || 'N/A'}, 状态码: {p.statusCode || 'N/A'} - 耗时: {(p.durationSeconds! * 1000).toFixed(2)} ms
                </li>
              ))}
          </ul>
        ) : (
          <p>暂无 P95 请求延迟数据。</p>
        )}
      </div>
    </div>
  );
};

export default MonitoringPage;
