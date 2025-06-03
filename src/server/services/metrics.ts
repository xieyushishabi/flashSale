import client, { Gauge, Counter, Histogram, Summary, type MetricType } from 'prom-client';
import type { Context, Next } from 'hono';

import appLogger from '../utils/logger';

// Create a Registry to register the metrics
export const registry = new client.Registry();

// Enable default metrics collection (e.g., CPU, memory, event loop lag)
client.collectDefaultMetrics({ register: registry });

// Optional: Prefix all metrics with your app name
registry.setDefaultLabels({
  app: 'miaogou_flash_sale_system'
});

appLogger.info('[MetricsService] Default metrics collection enabled.');

// --- HTTP Metrics ---
export const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests processed',
  labelNames: ['method', 'path', 'status_code'],
  registers: [registry],
});

export const httpRequestDurationHistogram = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10], // Buckets in seconds
  registers: [registry],
});

export const httpRequestDurationSummary = new Summary({
  name: 'http_request_duration_summary_seconds',
  help: 'Summary of HTTP request duration in seconds (quantiles)',
  labelNames: ['method', 'path', 'status_code'],
  percentiles: [0.5, 0.9, 0.95, 0.99], // e.g., 50th, 90th, 95th, 99th percentiles
  registers: [registry],
});

appLogger.info('[MetricsService] HTTP request metrics (counter, histogram, summary) initialized.');

// --- Custom Business Metrics (Example) ---
// You can add more specific business metrics here
// For example, number of orders created, users registered, etc.
export const ordersCreatedCounter = new Counter({
  name: 'orders_created_total',
  help: 'Total number of orders created',
  registers: [registry],
});

// --- Metrics Endpoint Handler ---
export async function getMetrics(c: Context) {
  try {
    c.header('Content-Type', registry.contentType);
    return c.text(await registry.metrics());
  } catch (ex) {
    appLogger.error('[MetricsService] Error serving metrics:', ex);
    return c.text('Error serving metrics', 500);
  }
}

// --- HTTP Metrics Middleware for Hono ---
export async function metricsMiddleware(c: Context, next: Next) {
  const start = process.hrtime(); // More precise than Date.now()

  await next(); // Process the request

  const diff = process.hrtime(start);
  const durationInSeconds = diff[0] + diff[1] / 1e9; // Convert to seconds

  const path = c.req.routePath || c.req.path; // Use Hono's matched route path if available
  const method = c.req.method;
  const statusCode = c.res.status.toString();

  // Increment request counter
  httpRequestCounter.labels(method, path, statusCode).inc();

  // Observe request duration
  httpRequestDurationHistogram.labels(method, path, statusCode).observe(durationInSeconds);
  httpRequestDurationSummary.labels(method, path, statusCode).observe(durationInSeconds);
  
  // Log for debugging if needed
  // appLogger.debug(`[MetricsMiddleware] ${method} ${path} ${statusCode} - ${durationInSeconds.toFixed(4)}s`);
}

appLogger.info('[MetricsService] Metrics service initialized successfully.');

// Example of a custom gauge (can be set, incremented, decremented)
export const activeConnectionsGauge = new Gauge({
    name: 'active_websocket_connections',
    help: 'Number of active WebSocket connections',
    registers: [registry],
});

// Example of how to use it (you'd call this from your WebSocketService)
// activeConnectionsGauge.inc();
// activeConnectionsGauge.dec();
// activeConnectionsGauge.set(10);

// --- Metrics Summary for Frontend ---
interface MetricValue {
  value: number;
  labels?: Record<string, string | number>;
}

interface SimpleMetric {
  name: string;
  help: string;
  type: MetricType;
  values: MetricValue[];
}

export async function getMetricsSummaryData() {
  const metricsJson = await registry.getMetricsAsJSON() as SimpleMetric[];
  const summary: Record<string, any> = {
    processStartTimeSeconds: 0,
    cpuUsageSecondsTotal: 0,
    memoryUsageBytes: 0,
    httpRequestCounts: [],
    httpRequestDurationPercentiles: [],
  };

  try {
    const startTimeMetric = metricsJson.find(m => m.name === 'process_start_time_seconds');
    summary.processStartTimeSeconds = startTimeMetric && startTimeMetric.values && startTimeMetric.values.length > 0 ? startTimeMetric.values[0].value : 0;

    const cpuMetric = metricsJson.find(m => m.name === 'process_cpu_user_seconds_total');
    if (cpuMetric && cpuMetric.values.length > 0) {
      summary.cpuUsageSecondsTotal = cpuMetric.values[0].value;
    }

    const memoryMetric = metricsJson.find(m => m.name === 'process_resident_memory_bytes');
    if (memoryMetric && memoryMetric.values.length > 0) {
      summary.memoryUsageBytes = memoryMetric.values[0].value;
    }

    const requestsTotalMetric = metricsJson.find(m => m.name === 'http_requests_total');
    if (requestsTotalMetric) {
      summary.httpRequestCounts = requestsTotalMetric.values.map(v => ({ 
        count: v.value, 
        method: v.labels?.method, 
        path: v.labels?.path, 
        statusCode: v.labels?.status_code 
      }));
    }

    const durationSummaryMetric = metricsJson.find(m => m.name === 'http_request_duration_summary_seconds');
    if (durationSummaryMetric) {
      summary.httpRequestDurationPercentiles = durationSummaryMetric.values
        .filter(v => v.labels && v.labels.quantile !== undefined)
        .map(v => ({
          quantile: v.labels?.quantile,
          durationSeconds: v.value,
          method: v.labels?.method,
          path: v.labels?.path,
          statusCode: v.labels?.status_code,
        }));
    }

  } catch (error) {
    appLogger.error('[MetricsService] Error processing metrics for JSON summary:', error);
  }
  
  return summary;
}

export async function getMetricsSummary(c: Context) {
  try {
    const summaryData = await getMetricsSummaryData();
    return c.json(summaryData);
  } catch (ex) {
    appLogger.error('[MetricsService] Error serving metrics summary:', ex);
    return c.json({ error: 'Error serving metrics summary' }, 500);
  }
}
