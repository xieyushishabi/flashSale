import React, { useState, useEffect, useCallback } from 'react';

const getLogLevelColor = (level: string): string => {
  switch (level?.toUpperCase()) {
    case 'ERROR': return '#dc3545'; // Red
    case 'WARN': return '#ffc107';  // Yellow/Orange
    case 'INFO': return '#0d6efd';  // Blue
    case 'DEBUG': return '#198754'; // Green
    case 'RAW': return '#6c757d';   // Grey
    default: return '#212529'; // Black
  }
};

interface LogEntry {
  timestamp: string;
  level: string;
  category: string;
  hostname?: string;
  pid?: number;
  message: string;
  stack?: string;
  // 根据实际日志结构可以添加更多字段
}

interface LogsApiResponse {
  logs: LogEntry[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  message?: string; // For errors like 'Log file not found'
}

const LOG_LEVELS = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'RAW'] as const;
type LogLevel = typeof LOG_LEVELS[number];

const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLogLevels, setSelectedLogLevels] = useState<LogLevel[]>([]);
  const limit = 50; // Number of logs per page, matching backend default

  const fetchLogs = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      // IMPORTANT: Replace with your actual token retrieval logic
      const token = localStorage.getItem('auth_token'); // Get token from localStorage
      if (!token) {
        throw new Error('Authentication token not found. Please log in.');
      }

      const response = await fetch(`/api/secure/logs?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized. Please log in again.');
        if (response.status === 404) {
            const data: LogsApiResponse = await response.json();
            throw new Error(data.message || 'Log file not found on server.');
        }
        throw new Error(`Failed to fetch logs: ${response.statusText} (status: ${response.status})`);
      }

      const data: LogsApiResponse = await response.json();
      setLogs(data.logs);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      if (data.logs.length === 0 && data.totalItems > 0 && page > 1) {
        // If current page has no logs but there are logs in total, go to last available page
        setCurrentPage(data.totalPages > 0 ? data.totalPages : 1);
      } else if (data.logs.length === 0 && data.totalItems === 0) {
        setError('No logs found.');
      }

    } catch (err: any) {
      console.error('Error fetching logs:', err);
      setError(err.message || 'An unexpected error occurred.');
      setLogs([]); // Clear logs on error
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage, fetchLogs]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleLogLevelChange = (level: LogLevel) => {
    setSelectedLogLevels(prevLevels => 
      prevLevels.includes(level) 
        ? prevLevels.filter(l => l !== level)
        : [...prevLevels, level]
    );
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>系统日志</h2>

      {loading && <p>加载中...</p>}
      {error && <p style={{ color: 'red' }}>错误: {error}</p>}

      {!loading && !error && logs.length === 0 && <p>没有可显示的日志。</p>}

      {/* Log Level Filter UI */}
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #eee', borderRadius: '4px' }}>
        <h4 style={{ marginTop: 0, marginBottom: '10px' }}>按级别筛选:</h4>
        {LOG_LEVELS.map(level => (
          <label key={level} style={{ marginRight: '15px', cursor: 'pointer', userSelect: 'none' }}>
            <input 
              type="checkbox" 
              checked={selectedLogLevels.includes(level)}
              onChange={() => handleLogLevelChange(level)}
              style={{ marginRight: '5px' }}
            />
            <span style={{ color: getLogLevelColor(level), fontWeight: 'bold' }}>
              {level}
            </span>
          </label>
        ))}
        {selectedLogLevels.length > 0 && (
          <button 
            onClick={() => setSelectedLogLevels([])} 
            style={{ marginLeft: '20px', padding: '3px 8px', fontSize: '0.9em', cursor: 'pointer' }}
          >
            清除筛选
          </button>
        )}
      </div>

      {logs.length > 0 && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <button onClick={handlePrevPage} disabled={currentPage <= 1 || loading}>
              上一页
            </button>
            <span style={{ margin: '0 10px' }}>
              第 {currentPage} 页 / 共 {totalPages} 页
            </span>
            <button onClick={handleNextPage} disabled={currentPage >= totalPages || loading}>
              下一页
            </button>
          </div>

          <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', border: '1px solid #ccc', padding: '10px', maxHeight: '600px', overflowY: 'auto', fontSize: '0.9em' }}>
            {logs
              .filter(log => selectedLogLevels.length === 0 || selectedLogLevels.includes(log.level as LogLevel))
              .map((log, index) => (
              <div key={index} style={{
                marginBottom: '1rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid #dee2e6',
                lineHeight: '1.5'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    fontWeight: 'bold',
                    color: getLogLevelColor(log.level),
                    padding: '0.1rem 0.4rem',
                    borderRadius: '0.25rem',
                    backgroundColor: `${getLogLevelColor(log.level)}20`, // Light background for level
                    marginRight: '0.75rem',
                    fontSize: '0.85em'
                  }}>
                    {log.level?.toUpperCase()}
                  </span>
                  <span style={{ color: '#6c757d', marginRight: '0.75rem', fontSize: '0.85em' }}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'No Timestamp'}
                  </span>
                  <span style={{ fontStyle: 'italic', color: '#495057', marginRight: '0.75rem', fontSize: '0.85em' }}>
                    [{log.category}]
                  </span>
                  {log.hostname && <span style={{ color: '#6c757d', marginRight: '0.5rem', fontSize: '0.8em' }}>主机: {log.hostname}</span>}
                  {log.pid && <span style={{ color: '#6c757d', fontSize: '0.8em' }}>进程ID: {log.pid}</span>}
                </div>
                <div style={{
                  marginTop: '0.3rem',
                  paddingLeft: '0.5rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  color: '#212529'
                }}>
                  {typeof log.message === 'object' ? JSON.stringify(log.message, null, 2) : log.message}
                </div>
                {log.stack && (
                  <details style={{ marginTop: '0.3rem', marginLeft: '0.5rem' }}>
                    <summary style={{ cursor: 'pointer', color: '#007bff', fontSize: '0.9em' }}>
                      堆栈跟踪
                    </summary>
                    <pre style={{
                      fontFamily: 'monospace', // Ensure stack trace uses monospace
                      marginTop: '0.25rem',
                      padding: '0.75rem',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #dee2e6',
                      borderRadius: '0.25rem',
                      overflowX: 'auto',
                      fontSize: '0.85em',
                      color: '#212529'
                    }}>
                      {log.stack}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LogsPage;
