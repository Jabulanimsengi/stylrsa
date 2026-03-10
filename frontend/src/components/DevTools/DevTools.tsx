'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import styles from './DevTools.module.css';

interface HealthStatus {
  backend: 'checking' | 'connected' | 'disconnected' | 'error';
  database: 'checking' | 'connected' | 'disconnected' | 'error';
  websocket: 'checking' | 'connected' | 'disconnected' | 'error';
  latency: number | null;
  lastCheck: Date | null;
  errorMessage?: string;
}

interface ApiLog {
  id: string;
  timestamp: Date;
  method: string;
  url: string;
  status: number | 'pending' | 'error';
  duration: number | null;
  error?: string;
}

interface SeoStats {
  totalUrls: number;
  totalSitemaps: number;
  cachedUrls: number;
  lastGenerated: string | null;
  keywords?: number;
  locations?: number;
}

const MAX_LOGS = 50;
const POSITION_KEY = 'devtools-position';

export default function DevTools() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'health' | 'logs' | 'env' | 'seo'>('health');
  const [health, setHealth] = useState<HealthStatus>({
    backend: 'checking',
    database: 'checking',
    websocket: 'checking',
    latency: null,
    lastCheck: null,
  });
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [seoStats, setSeoStats] = useState<SeoStats | null>(null);
  const [isSeoLoading, setIsSeoLoading] = useState(false);
  
  // Drag state
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Load saved position
  useEffect(() => {
    if (!isDevelopment) return;
    try {
      const saved = localStorage.getItem(POSITION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPosition(parsed);
      }
    } catch {}
  }, [isDevelopment]);

  // Save position when it changes
  useEffect(() => {
    if (!isDevelopment) return;
    try {
      localStorage.setItem(POSITION_KEY, JSON.stringify(position));
    } catch {}
  }, [isDevelopment, position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
  };

  useEffect(() => {
    if (!isDevelopment) return;
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      
      // Since we use 'right' and 'bottom' positioning, we need to SUBTRACT the delta
      // Dragging left (negative deltaX) should decrease 'right' value (move element left)
      // Dragging up (negative deltaY) should decrease 'bottom' value (move element up)
      const newX = Math.max(10, Math.min(window.innerWidth - 50, dragRef.current.startPosX - deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 50, dragRef.current.startPosY - deltaY));
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDevelopment, isDragging]);

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch('/api/health', { 
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeout);
      
      const latency = Date.now() - startTime;
      
      if (res.ok) {
        const data = await res.json();
        setHealth({
          backend: 'connected',
          database: data.database === 'ok' ? 'connected' : 'error',
          websocket: 'checking',
          latency,
          lastCheck: new Date(),
        });
      } else {
        setHealth(prev => ({
          ...prev,
          backend: 'error',
          latency,
          lastCheck: new Date(),
          errorMessage: `HTTP ${res.status}`,
        }));
      }
    } catch (error: unknown) {
      const errorName = error instanceof Error ? error.name : '';
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setHealth(prev => ({
        ...prev,
        backend: 'disconnected',
        database: 'disconnected',
        latency: null,
        lastCheck: new Date(),
        errorMessage: errorName === 'AbortError' ? 'Timeout' : errorMessage,
      }));
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    const initialCheck = setTimeout(checkHealth, 1000);
    const interval = setInterval(checkHealth, 30000);
    return () => {
      clearTimeout(initialCheck);
      clearInterval(interval);
    };
  }, [checkHealth]);

  // Fetch SEO stats
  const fetchSeoStats = useCallback(async () => {
    if (isSeoLoading) return; // Prevent duplicate calls
    setIsSeoLoading(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      const res = await fetch('/api/seo/sitemap-stats', { 
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      
      if (res.ok) {
        const data = await res.json();
        setSeoStats(data);
      }
    } catch (error: unknown) {
      if (!(error instanceof Error) || error.name !== 'AbortError') {
        console.error('Failed to fetch SEO stats:', error);
      }
    } finally {
      setIsSeoLoading(false);
    }
  }, [isSeoLoading]);

  // Load SEO stats when tab is opened (only once)
  useEffect(() => {
    if (!isDevelopment) return;
    if (activeTab === 'seo' && !seoStats && !isSeoLoading) {
      fetchSeoStats();
    }
  }, [activeTab, fetchSeoStats, isDevelopment, isSeoLoading, seoStats]);

  // Intercept fetch for logging
  useEffect(() => {
    if (!isDevelopment) return;
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [input, init] = args;
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
      
      if (!url.includes('/api/')) {
        return originalFetch(...args);
      }

      const logId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const method = init?.method || 'GET';
      const startTime = Date.now();

      setApiLogs(prev => [{
        id: logId,
        timestamp: new Date(),
        method,
        url: url.replace(window.location.origin, ''),
        status: 'pending' as const,
        duration: null,
      }, ...prev].slice(0, MAX_LOGS));

      try {
        const res = await originalFetch(...args);
        const duration = Date.now() - startTime;

        setApiLogs(prev => prev.map(log => 
          log.id === logId 
            ? { ...log, status: res.status, duration }
            : log
        ));

        return res;
      } catch (error: unknown) {
        const duration = Date.now() - startTime;
        const message = error instanceof Error ? error.message : 'Unknown error';
        
        setApiLogs(prev => prev.map(log => 
          log.id === logId 
            ? { ...log, status: 'error', duration, error: message }
            : log
        ));

        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [isDevelopment]);

  if (!isDevelopment) {
    return null;
  }

  const copyLogs = async () => {
    const logsText = apiLogs.map(log => 
      `[${log.timestamp.toLocaleTimeString()}] ${log.method} ${log.url} → ${log.status} (${log.duration || '?'}ms)${log.error ? ` ERROR: ${log.error}` : ''}`
    ).join('\n');
    
    try {
      await navigator.clipboard.writeText(logsText || 'No logs to copy');
      toast.success('Logs copied to clipboard');
    } catch {
      toast.error('Failed to copy logs');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return '#10b981';
      case 'disconnected': return '#ef4444';
      case 'error': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '✓';
      case 'disconnected': return '✗';
      case 'error': return '⚠';
      default: return '○';
    }
  };

  return (
    <>
      {/* Draggable floating button */}
      <button
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onClick={(e) => {
          // Only toggle if not dragging
          if (!isDragging) setIsOpen(!isOpen);
        }}
        className={styles.floatingButton}
        style={{
          right: position.x,
          bottom: position.y,
          cursor: isDragging ? 'grabbing' : 'grab',
          background: health.backend === 'connected' ? '#10b981' : 
                      health.backend === 'disconnected' ? '#ef4444' : '#f59e0b',
        }}
        title={`Backend: ${health.backend}${health.latency ? ` (${health.latency}ms)` : ''} • Drag to move`}
      >
        {health.backend === 'checking' ? '...' : 
         health.backend === 'connected' ? '✓' : '!'}
      </button>

      {/* Panel */}
      {isOpen && (
        <div 
          className={styles.panel}
          style={{
            right: position.x,
            bottom: position.y + 50,
          }}
        >
          <div className={styles.header}>
            <h3>🛠 Dev Tools</h3>
            <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>×</button>
          </div>

          <div className={styles.tabs}>
            <button 
              onClick={() => setActiveTab('health')}
              className={activeTab === 'health' ? styles.activeTab : ''}
            >
              Health
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              className={activeTab === 'logs' ? styles.activeTab : ''}
            >
              Logs ({apiLogs.length})
            </button>
            <button 
              onClick={() => setActiveTab('seo')}
              className={activeTab === 'seo' ? styles.activeTab : ''}
            >
              SEO
            </button>
            <button 
              onClick={() => setActiveTab('env')}
              className={activeTab === 'env' ? styles.activeTab : ''}
            >
              Env
            </button>
          </div>

          <div className={styles.content}>
            {activeTab === 'health' && (
              <div className={styles.healthTab}>
                <div className={styles.healthItem}>
                  <span style={{ color: getStatusColor(health.backend) }}>
                    {getStatusIcon(health.backend)}
                  </span>
                  <span>Backend API</span>
                  <span className={styles.healthValue}>
                    {health.backend}
                    {health.latency && ` (${health.latency}ms)`}
                  </span>
                </div>
                <div className={styles.healthItem}>
                  <span style={{ color: getStatusColor(health.database) }}>
                    {getStatusIcon(health.database)}
                  </span>
                  <span>Database</span>
                  <span className={styles.healthValue}>{health.database}</span>
                </div>
                <div className={styles.healthItem}>
                  <span style={{ color: getStatusColor(health.websocket) }}>
                    {getStatusIcon(health.websocket)}
                  </span>
                  <span>WebSocket</span>
                  <span className={styles.healthValue}>{health.websocket}</span>
                </div>
                
                {health.errorMessage && (
                  <div className={styles.errorBox}>
                    <strong>Error:</strong> {health.errorMessage}
                  </div>
                )}

                <div className={styles.actions}>
                  <button 
                    onClick={checkHealth} 
                    disabled={isChecking}
                    className={styles.refreshBtn}
                  >
                    {isChecking ? 'Checking...' : 'Refresh'}
                  </button>
                  {health.lastCheck && (
                    <span className={styles.lastCheck}>
                      Last: {health.lastCheck.toLocaleTimeString()}
                    </span>
                  )}
                </div>

                {health.backend === 'disconnected' && (
                  <div className={styles.helpBox}>
                    <strong>Backend not running!</strong>
                    <p>Start the backend server:</p>
                    <code>cd backend && npm run start:dev</code>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'logs' && (
              <div className={styles.logsTab}>
                {apiLogs.length === 0 ? (
                  <p className={styles.emptyLogs}>No API calls yet</p>
                ) : (
                  <div className={styles.logsList}>
                    {apiLogs.map(log => (
                      <div key={log.id} className={styles.logItem}>
                        <span className={styles.logMethod} data-method={log.method}>
                          {log.method}
                        </span>
                        <span className={styles.logUrl} title={log.url}>
                          {log.url.length > 35 ? log.url.slice(0, 35) + '...' : log.url}
                        </span>
                        <span 
                          className={styles.logStatus}
                          style={{
                            color: log.status === 'pending' ? '#6b7280' :
                                   log.status === 'error' ? '#ef4444' :
                                   (log.status as number) < 300 ? '#10b981' :
                                   (log.status as number) < 400 ? '#f59e0b' : '#ef4444'
                          }}
                        >
                          {log.status}
                        </span>
                        <span className={styles.logDuration}>
                          {log.duration ? `${log.duration}ms` : '...'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className={styles.logActions}>
                  <button onClick={copyLogs} className={styles.copyBtn}>
                    📋 Copy Logs
                  </button>
                  <button onClick={() => setApiLogs([])} className={styles.clearBtn}>
                    Clear
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className={styles.seoTab}>
                {isSeoLoading ? (
                  <p className={styles.emptyLogs}>Loading SEO stats...</p>
                ) : seoStats ? (
                  <>
                    <div className={styles.seoHeader}>
                      <span>📊 Sitemap Statistics</span>
                    </div>
                    <div className={styles.seoGrid}>
                      <div className={styles.seoCard}>
                        <span className={styles.seoValue}>{seoStats.totalUrls.toLocaleString()}</span>
                        <span className={styles.seoLabel}>Total URLs</span>
                      </div>
                      <div className={styles.seoCard}>
                        <span className={styles.seoValue}>{seoStats.totalSitemaps}</span>
                        <span className={styles.seoLabel}>Sitemaps</span>
                      </div>
                      <div className={styles.seoCard}>
                        <span className={styles.seoValue}>{seoStats.cachedUrls.toLocaleString()}</span>
                        <span className={styles.seoLabel}>Cached Pages</span>
                      </div>
                    </div>
                    
                    <div className={styles.seoInfo}>
                      <div className={styles.seoInfoItem}>
                        <span>Last Generated</span>
                        <span>{seoStats.lastGenerated ? new Date(seoStats.lastGenerated).toLocaleString() : 'Never'}</span>
                      </div>
                      <div className={styles.seoInfoItem}>
                        <span>URLs per Sitemap</span>
                        <span>50,000 max</span>
                      </div>
                    </div>

                    <div className={styles.seoLinks}>
                      <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className={styles.seoLink}>
                        📄 View Sitemap Index
                      </a>
                      <a href="/api/seo/sitemap-stats" target="_blank" rel="noopener noreferrer" className={styles.seoLink}>
                        📈 Raw Stats API
                      </a>
                    </div>

                    <div className={styles.actions}>
                      <button onClick={fetchSeoStats} className={styles.refreshBtn}>
                        Refresh Stats
                      </button>
                    </div>
                  </>
                ) : (
                  <div className={styles.helpBox}>
                    <strong>SEO stats unavailable</strong>
                    <p>Make sure the backend is running and the SEO module is configured.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'env' && (
              <div className={styles.envTab}>
                <div className={styles.envItem}>
                  <span>API URL</span>
                  <code>{process.env.NEXT_PUBLIC_API_URL || 'not set'}</code>
                </div>
                <div className={styles.envItem}>
                  <span>WS URL</span>
                  <code>{process.env.NEXT_PUBLIC_WS_URL || 'not set'}</code>
                </div>
                <div className={styles.envItem}>
                  <span>Site URL</span>
                  <code>{process.env.NEXT_PUBLIC_SITE_URL || 'not set'}</code>
                </div>
                <div className={styles.envItem}>
                  <span>Node Env</span>
                  <code>{process.env.NODE_ENV}</code>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
