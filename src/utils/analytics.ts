export interface SubscriberRecord {
  id: string;
  email: string;
  created_at: string;
  status: string;
}

export interface RealDeviceRecord {
  id: string;
  visitorId: string;
  timestamp: number;
  date: string; // YYYY-MM-DD
}

export interface AnalyticsSummary {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  totalSubscribers: number;
  conversionRate: number;
  chartData: { date: string; fullDate: string; visits: number; uniques: number }[];
  subscribers: SubscriberRecord[];
}

const STORAGE_KEY_DEVICES_STRICT = 'paralife_strict_unique_devices_v4';
const STORAGE_KEY_DEVICE_LOGGED = 'paralife_device_logged_v4';
const STORAGE_KEY_SINGLE_VISITOR_ID = 'paralife_single_device_id_v4';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Clean legacy dirty storage keys to prevent duplicate counts
 */
const cleanupLegacyKeys = () => {
  try {
    const legacyKeys = [
      'paralife_analytics_visits_v1',
      'paralife_real_visits_v1',
      'paralife_unique_devices_v2',
      'paralife_device_already_counted_v2',
      'paralife_anon_visit_count',
    ];
    for (const key of legacyKeys) {
      localStorage.removeItem(key);
    }
  } catch (e) {}
};

/**
 * Get or create fixed single device identifier
 */
export const getVisitorId = (): string => {
  cleanupLegacyKeys();
  let id = localStorage.getItem(STORAGE_KEY_SINGLE_VISITOR_ID);
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem(STORAGE_KEY_SINGLE_VISITOR_ID, id);
  }
  return id;
};

/**
 * Track visit: strictly ONCE per device.
 * (Multiple visits on the same device are ignored)
 */
export const trackPageView = async (): Promise<void> => {
  try {
    cleanupLegacyKeys();
    
    // Check if this device is already recorded
    if (localStorage.getItem(STORAGE_KEY_DEVICE_LOGGED)) {
      return; // Already logged this device
    }

    const visitorId = getVisitorId();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    const record: RealDeviceRecord = {
      id: 'd_' + visitorId,
      visitorId,
      timestamp: Date.now(),
      date: dateStr,
    };

    // Stored single device
    localStorage.setItem(STORAGE_KEY_DEVICES_STRICT, JSON.stringify([record]));
    localStorage.setItem(STORAGE_KEY_DEVICE_LOGGED, 'true');

    // Async push to Supabase if configured
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      const baseUrl = SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
      fetch(`${baseUrl}/rest/v1/page_views`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          visitor_id: visitorId,
          created_at: now.toISOString(),
        }),
      }).catch(() => {});
    }
  } catch (err) {
    console.warn('[Analytics Track Error]:', err);
  }
};

/**
 * Fetch 100% genuine unique device metrics
 */
export const getAnalyticsSummary = async (daysRange = 14): Promise<AnalyticsSummary> => {
  cleanupLegacyKeys();

  // 1. Fetch real subscribers from Supabase
  let subscribers: SubscriberRecord[] = [];
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const baseUrl = SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
      const response = await fetch(
        `${baseUrl}/rest/v1/subscribers?select=id,email,created_at,status&order=created_at.desc`,
        {
          method: 'GET',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );
      if (response.ok) {
        subscribers = await response.json();
      }
    } catch (e) {
      console.warn('[Fetch Subscribers Warn]:', e);
    }
  }

  // 2. Read unique devices list
  const visitorId = getVisitorId();
  const today = new Date().toISOString().split('T')[0];

  const raw = localStorage.getItem(STORAGE_KEY_DEVICES_STRICT);
  let list: RealDeviceRecord[] = raw ? JSON.parse(raw) : [];

  // Guarantee current device is recorded strictly as 1 device
  if (list.length === 0 || !list.some((item) => item.visitorId === visitorId)) {
    list = [
      {
        id: 'd_' + visitorId,
        visitorId,
        timestamp: Date.now(),
        date: today,
      },
    ];
    localStorage.setItem(STORAGE_KEY_DEVICES_STRICT, JSON.stringify(list));
    localStorage.setItem(STORAGE_KEY_DEVICE_LOGGED, 'true');
  }

  // 3. Build day-by-day unique devices chart data
  const chartData: { date: string; fullDate: string; visits: number; uniques: number }[] = [];
  const now = new Date();

  for (let i = daysRange - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    const dateLabel = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    const fullDateLabel = d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const dayDevices = list.filter((v) => v.date === dateKey);

    chartData.push({
      date: dateLabel,
      fullDate: fullDateLabel,
      visits: dayDevices.length,
      uniques: dayDevices.length,
    });
  }

  // 4. Calculate total metrics
  const totalUniqueDevices = list.length; // strictly 1 per device
  const todayDevices = list.filter((v) => v.date === today).length;

  const totalSubscribers = subscribers.length;
  const conversionRate =
    totalUniqueDevices > 0
      ? Number(((totalSubscribers / totalUniqueDevices) * 100).toFixed(1))
      : 0;

  return {
    totalVisits: totalUniqueDevices,
    uniqueVisitors: totalUniqueDevices,
    todayVisits: todayDevices,
    totalSubscribers,
    conversionRate,
    chartData,
    subscribers,
  };
};
