import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const MASTER_ACCESS_KEY = process.env.MASTER_ACCESS_KEY || '88BQWTUT9GCG16UVWQ09';

// Ensure JSON body parsing
app.use(express.json());

// Enable CORS for development flexibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Data Directory and JSON/SQLite Database initialization
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'subscribers.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

// Initialize database storage files if not existing
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
}

if (!fs.existsSync(ANALYTICS_FILE)) {
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// Helper functions for database reads and writes
const getSubscribers = () => {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) || [];
  } catch (err) {
    console.error('Error reading subscribers:', err);
    return [];
  }
};

const saveSubscribers = (list) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving subscribers:', err);
  }
};

const getAnalytics = () => {
  try {
    const raw = fs.readFileSync(ANALYTICS_FILE, 'utf-8');
    return JSON.parse(raw) || [];
  } catch (err) {
    return [];
  }
};

const saveAnalytics = (list) => {
  try {
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {}
};

// Brevo Welcome Email integration helper
const sendBrevoWelcomeEmail = async (email) => {
  const BREVO_API_KEY = process.env.BREVO_API_KEY || process.env.VITE_BREVO_API_KEY || '';
  if (!BREVO_API_KEY) return;

  try {
    // 1. Sync contact into Brevo List #6
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        listIds: [6],
        updateEnabled: true,
      }),
    }).catch((e) => console.warn('[Brevo Contact Sync Warn]:', e.message));

    // 2. Send Styled Welcome Template #4
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templateId: 4,
        to: [{ email }],
      }),
    });
    console.log('[Brevo Email Dispatch Status]:', response.status);
  } catch (err) {
    console.error('[Brevo Email Dispatch Error]:', err);
  }
};

// Brevo Delete Contact helper
const deleteBrevoContact = async (email) => {
  const BREVO_API_KEY = process.env.BREVO_API_KEY || process.env.VITE_BREVO_API_KEY || '';
  if (!BREVO_API_KEY || !email) return;

  try {
    const response = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers: {
        'api-key': BREVO_API_KEY,
      },
    });
    console.log(`[Brevo Delete Contact (${email}) Status]:`, response.status);
  } catch (err) {
    console.error('[Brevo Delete Contact Error]:', err);
  }
};

// --- API ENDPOINTS ---

// 1. Subscribe API
app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid email address.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ success: false, message: 'Invalid email format.' });
  }

  const subscribers = getSubscribers();
  const existing = subscribers.find((s) => s.email.toLowerCase() === cleanEmail);

  if (existing) {
    return res.json({
      success: true,
      isDuplicate: true,
      message: 'You are already following the signal.',
    });
  }

  const newSubscriber = {
    id: 'sub_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
    email: cleanEmail,
    created_at: new Date().toISOString(),
    status: 'active',
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
  };

  subscribers.unshift(newSubscriber);
  saveSubscribers(subscribers);

  // Send welcome email in background
  sendBrevoWelcomeEmail(cleanEmail);

  return res.json({
    success: true,
    message: 'Thank you for joining Paralife.',
    data: newSubscriber,
  });
});

// 2. Get Subscribers List (Admin)
app.get('/api/subscribers', (req, res) => {
  const subscribers = getSubscribers();
  res.json({
    success: true,
    count: subscribers.length,
    subscribers,
  });
});

// 2.1 Delete Subscriber (Admin + Brevo Sync)
app.delete('/api/subscribers/:id', (req, res) => {
  const { id } = req.params;
  let subscribers = getSubscribers();
  const target = subscribers.find((s) => s.id === id || s.email.toLowerCase() === id.toLowerCase());

  if (!target) {
    return res.status(404).json({ success: false, message: 'Subscriber not found.' });
  }

  // Remove from VPS storage
  subscribers = subscribers.filter((s) => s.id !== target.id && s.email.toLowerCase() !== target.email.toLowerCase());
  saveSubscribers(subscribers);

  // Sync deletion with Brevo Contacts
  deleteBrevoContact(target.email);

  return res.json({ success: true, message: 'Subscriber deleted successfully from VPS and Brevo.' });
});

// 3. Export CSV endpoint
app.get('/api/export-csv', (req, res) => {
  const subscribers = getSubscribers();
  let csv = 'ID,Email,Created At,Status,IP\n';
  subscribers.forEach((s) => {
    csv += `"${s.id}","${s.email}","${s.created_at}","${s.status}","${s.ip || ''}"\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=paralife_subscribers_${Date.now()}.csv`);
  res.send(csv);
});

// 4. Analytics Track View
app.post('/api/track', (req, res) => {
  const { visitorId, pageUrl } = req.body;
  const analytics = getAnalytics();

  const record = {
    id: 'evt_' + Math.random().toString(36).substring(2, 9),
    visitorId: visitorId || 'anon',
    pageUrl: pageUrl || '/',
    timestamp: Date.now(),
    date: new Date().toISOString().split('T')[0],
  };

  analytics.push(record);
  // Cap analytics entries to latest 50,000 for high performance
  if (analytics.length > 50000) {
    analytics.splice(0, analytics.length - 50000);
  }
  saveAnalytics(analytics);

  res.json({ success: true });
});

// 5. Analytics Summary
app.get('/api/analytics', (req, res) => {
  const subscribers = getSubscribers();
  const analytics = getAnalytics();
  const days = parseInt(req.query.days) || 14;

  const todayStr = new Date().toISOString().split('T')[0];
  const uniqueVisitorsSet = new Set(analytics.map((a) => a.visitorId));
  const todayVisits = analytics.filter((a) => a.date === todayStr).length;

  // Aggregate daily stats for chart
  const chartMap = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const shortDate = `${d.getDate()} ${d.toLocaleString('en', { month: 'short' })}`;
    chartMap[dateStr] = { date: shortDate, fullDate: dateStr, visits: 0, uniquesSet: new Set() };
  }

  analytics.forEach((a) => {
    if (chartMap[a.date]) {
      chartMap[a.date].visits += 1;
      chartMap[a.date].uniquesSet.add(a.visitorId);
    }
  });

  const chartData = Object.values(chartMap).map((c) => ({
    date: c.date,
    fullDate: c.fullDate,
    visits: c.visits,
    uniques: c.uniquesSet.size,
  }));

  res.json({
    totalVisits: analytics.length,
    uniqueVisitors: uniqueVisitorsSet.size,
    todayVisits,
    totalSubscribers: subscribers.length,
    conversionRate: uniqueVisitorsSet.size > 0 ? (subscribers.length / uniqueVisitorsSet.size) * 100 : 0,
    chartData,
    subscribers,
  });
});

// Serve frontend static files from dist
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA fallback to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n==============================================`);
  console.log(`⚡ PARALIFE Server running on port ${PORT}`);
  console.log(`📂 Database Directory: ${DATA_DIR}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`==============================================\n`);
});
