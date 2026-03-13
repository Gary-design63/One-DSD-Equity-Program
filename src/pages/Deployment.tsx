import React, { useState } from 'react';
import {
  Server, CheckCircle2, ChevronDown, ChevronRight,
  Cpu, HardDrive, Wifi, Shield, RefreshCw, BarChart2,
  Copy, Check, DollarSign, Key, Globe, AlertTriangle,
} from 'lucide-react';

// ── Data ────────────────────────────────────────────────────────────────────

const PLANS = [
  { name: 'KVM 1', price: '$6.49/mo', cpu: '1', ram: '4 GB', storage: '50 GB', bandwidth: '1 TB', verdict: 'Technically sufficient — tight on headroom', recommended: false },
  { name: 'KVM 2', price: '$8.99/mo', cpu: '2', ram: '8 GB', storage: '100 GB', bandwidth: '2 TB', verdict: 'Recommended — production + growth headroom', recommended: true },
  { name: 'KVM 4', price: '$12.99/mo', cpu: '4', ram: '16 GB', storage: '200 GB', bandwidth: '4 TB', verdict: 'Overkill for this use case', recommended: false },
  { name: 'KVM 8', price: '$25.99/mo', cpu: '8', ram: '32 GB', storage: '400 GB', bandwidth: '8 TB', verdict: 'Enterprise-scale — not needed', recommended: false },
];

const VPS_RESPONSIBILITIES = [
  { task: 'Node.js + Express server', cost: '~150 MB RAM' },
  { task: 'WebSocket connections (per client)', cost: '~few KB each' },
  { task: 'Anthropic API calls (HTTPS)', cost: 'Network I/O only — no local compute' },
  { task: 'SQLite database', cost: '~50–200 MB storage / year' },
  { task: 'PM2 + Nginx', cost: '~70 MB RAM' },
  { task: 'Total realistic usage', cost: '~500 MB–1.5 GB RAM, < 5 GB storage', bold: true },
];

const COSTS = [
  { item: 'Frontend hosting (GitHub Pages)', cost: 'Free', highlight: false },
  { item: 'Backend VPS — Hostinger KVM 2', cost: '$8.99/mo', highlight: false },
  { item: 'Anthropic API — light use (1–2 queries/day)', cost: '~$20–40/mo', highlight: false },
  { item: 'Anthropic API — moderate use (5–10 queries/day)', cost: '~$80–150/mo', highlight: false },
  { item: 'Anthropic API — heavy use (20+ queries/day)', cost: '~$200–400/mo', highlight: false },
  { item: 'Total at moderate use', cost: '~$90–160/mo', highlight: true },
];

const SECURITY_CHECKLIST = [
  'Never commit .env to git (already in .gitignore)',
  'Rotate your Anthropic API key every 90 days via console.anthropic.com',
  'Back up the SQLite database weekly (contains conversation history)',
  'Enable Hostinger\'s built-in firewall in addition to UFW',
  'Monitor Anthropic API usage costs weekly',
  'Run apt update && apt upgrade monthly on the VPS',
  'Use a dedicated non-root user (equity) for all app operations',
  'CORS_ORIGINS in .env should only list your exact GitHub Pages URL',
];

// ── Command Block Component ──────────────────────────────────────────────────

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 my-3">
      {label && (
        <div className="bg-gray-700 text-gray-300 text-xs px-3 py-1.5 font-mono flex justify-between items-center">
          <span>{label}</span>
          <button onClick={copy} className="flex items-center gap-1 hover:text-white transition-colors">
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      )}
      {!label && (
        <div className="bg-gray-700 flex justify-end px-3 py-1.5">
          <button onClick={copy} className="flex items-center gap-1 text-gray-400 hover:text-white text-xs transition-colors">
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      )}
      <pre className="bg-gray-900 text-gray-100 p-4 text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed">
        {code.trim()}
      </pre>
    </div>
  );
}

// ── Expandable Section ───────────────────────────────────────────────────────

function Section({
  number, icon: Icon, iconBg, iconColor, title, subtitle, defaultOpen = false, children
}: {
  number: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${iconBg}`}>
          {number}
        </div>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg} bg-opacity-15`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900">{title}</div>
          <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>
        </div>
        {open
          ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
          : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 text-sm text-gray-700">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Deployment() {
  return (
    <div className="page-content p-6 space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
          <Server className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Hostinger Deployment Guide</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Complete setup guide for deploying the AI agent backend on Hostinger KVM VPS
          </p>
        </div>
      </div>

      {/* Recommendation Banner */}
      <div className="rounded-xl p-5 border-2 border-orange-400 bg-orange-50">
        <div className="flex items-start gap-4">
          <div className="text-3xl shrink-0">🏆</div>
          <div>
            <h2 className="text-lg font-bold text-orange-900">Recommendation: Hostinger KVM 2 — $8.99/mo</h2>
            <p className="text-sm text-orange-800 mt-1">
              All AI computation runs on Anthropic's servers — not your VPS. The VPS only runs Node.js + SQLite
              as a lightweight coordinator. KVM 2 gives you double the headroom of KVM 1 for just{' '}
              <strong>$2.50/month more</strong>, covering growth and future features without a disruptive migration.
            </p>
          </div>
        </div>
      </div>

      {/* Architecture Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: '🌐', label: 'Frontend', value: 'GitHub Pages', sub: 'Static SPA — Free' },
          { icon: '🖥️', label: 'Backend', value: 'Hostinger KVM 2', sub: '$8.99/month' },
          { icon: '🤖', label: 'AI Engine', value: 'Anthropic Claude', sub: 'API calls — per use' },
        ].map(c => (
          <div key={c.label} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm text-center">
            <div className="text-2xl mb-1">{c.icon}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">{c.label}</div>
            <div className="font-semibold text-gray-900 mt-0.5">{c.value}</div>
            <div className="text-xs text-gray-500">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* What the VPS does */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-gray-500" /> What the VPS Actually Does
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">All AI runs on Anthropic's infrastructure — your VPS is just a lightweight coordinator</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
              <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase">Resource Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {VPS_RESPONSIBILITIES.map(r => (
              <tr key={r.task} className={r.bold ? 'bg-blue-50' : ''}>
                <td className={`px-5 py-2.5 ${r.bold ? 'font-semibold text-blue-900' : 'text-gray-700'}`}>{r.task}</td>
                <td className={`px-5 py-2.5 ${r.bold ? 'font-semibold text-blue-900' : 'text-gray-600'}`}>{r.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Plan Comparison */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-gray-500" /> Hostinger KVM Plan Comparison
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Plan', 'Price', 'vCPU', 'RAM', 'NVMe', 'Bandwidth', 'Verdict'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {PLANS.map(p => (
                <tr key={p.name} className={p.recommended ? 'bg-green-50 border-l-4 border-l-green-500' : ''}>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      {p.recommended && <span className="text-green-700 text-xs font-bold bg-green-100 px-1.5 py-0.5 rounded whitespace-nowrap">★ Best</span>}
                      {p.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{p.price}</td>
                  <td className="px-4 py-3 text-gray-600">{p.cpu}</td>
                  <td className="px-4 py-3 text-gray-600">{p.ram}</td>
                  <td className="px-4 py-3 text-gray-600">{p.storage}</td>
                  <td className="px-4 py-3 text-gray-600">{p.bandwidth}</td>
                  <td className={`px-4 py-3 text-xs ${p.recommended ? 'text-green-700 font-medium' : 'text-gray-500'}`}>{p.verdict}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* $2.50 decision box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <DollarSign className="w-4 h-4" /> The $2.50/Month Decision
        </h3>
        <p className="text-sm text-blue-800">
          KVM 1 → KVM 2 costs <strong>$2.50/month more ($30/year)</strong> and doubles every resource spec:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-blue-800 list-disc list-inside">
          <li>Phase 2 features (n8n automation, additional agents) will require more RAM</li>
          <li>Multiple simultaneous staff connections are handled more smoothly with 2 vCPU</li>
          <li>SQLite + Node.js + PM2 + Nginx fits in 8 GB RAM with comfortable headroom</li>
          <li>Migrating KVM 1 → KVM 2 mid-deployment requires a new VPS + data migration</li>
        </ul>
        <div className="mt-3 bg-blue-100 rounded px-3 py-2 text-sm font-semibold text-blue-900">
          Start with KVM 2. The $30/year insurance is worth it.
        </div>
      </div>

      {/* ── Step-by-Step Setup ────────────────────────────────────────────── */}
      <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2 pt-2">
        <Wifi className="w-5 h-5 text-blue-600" /> Step-by-Step Setup
      </h2>

      <div className="space-y-3">

        {/* Step 1 */}
        <Section number={1} icon={Server} iconBg="bg-blue-600" iconColor="text-blue-600"
          title="Provision the VPS on Hostinger"
          subtitle="Order KVM 2, choose Ubuntu 22.04 LTS, select United States region"
          defaultOpen={true}>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Log into <strong>hpanel.hostinger.com</strong> → VPS → Order New</li>
            <li>Select plan: <strong className="text-green-700">KVM 2 — $8.99/mo</strong></li>
            <li>Operating system: <strong>Ubuntu 22.04 LTS</strong></li>
            <li>Server region: <strong>United States</strong> (lowest latency from Minnesota DHS)</li>
            <li>Set a strong root password and note your VPS IP address</li>
          </ol>
          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-800 flex gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-yellow-600" />
            <span>The VPS will be ready in 2–5 minutes. Your IP address is shown on the VPS dashboard.</span>
          </div>
        </Section>

        {/* Step 2 */}
        <Section number={2} icon={Shield} iconBg="bg-purple-600" iconColor="text-purple-600"
          title="Initial Server Setup"
          subtitle="SSH in, update packages, install Node.js 20 LTS, PM2, Git, create app user">
          <p className="mb-2 text-gray-600">SSH into your VPS and run:</p>
          <CodeBlock label="bash — initial setup" code={`# SSH into your new VPS
ssh root@YOUR_VPS_IP

# Update all packages
apt update && apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify
node --version   # should be v20.x
npm --version

# Install PM2 (process manager — keeps the server running across reboots)
npm install -g pm2

# Install Git
apt install -y git

# Create a dedicated non-root app user (security best practice)
adduser equity
usermod -aG sudo equity

# Switch to the app user for all remaining steps
su - equity`} />
        </Section>

        {/* Step 3 */}
        <Section number={3} icon={HardDrive} iconBg="bg-green-600" iconColor="text-green-600"
          title="Deploy the Backend"
          subtitle="Clone the repo, install dependencies, configure environment variables">
          <CodeBlock label="bash — clone and configure" code={`# Clone the repository
git clone https://github.com/Gary-design63/One-DSD-Equity-Program.git
cd One-DSD-Equity-Program/backend

# Install Node.js dependencies
npm install

# Create the .env file from the example
cp .env.example .env
nano .env`} />
          <p className="mt-3 mb-2 font-medium text-gray-800">Fill in your <code className="bg-gray-100 px-1 rounded text-xs">.env</code> values:</p>
          <CodeBlock label=".env" code={`ANTHROPIC_API_KEY=sk-ant-your-key-here
CORS_ORIGINS=https://gary-design63.github.io
PORT=3000
HOST=0.0.0.0

# Optional — model overrides (defaults shown)
COORDINATOR_MODEL=claude-opus-4-6
SPECIALIST_MODEL=claude-sonnet-4-6
AGENT_MAX_TOKENS=4096

# Optional — cron schedule for risk monitoring (default: weekdays 8am)
MONITOR_CRON=0 8 * * 1-5`} />
          <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-800 flex gap-2 mt-3">
            <Key className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              Get your Anthropic API key at <strong>console.anthropic.com</strong> → API Keys → Create Key.
              Never share this key or commit it to git.
            </span>
          </div>
        </Section>

        {/* Step 4 */}
        <Section number={4} icon={RefreshCw} iconBg="bg-indigo-600" iconColor="text-indigo-600"
          title="Start with PM2"
          subtitle="Launch the server, enable auto-restart on reboot, verify it's running">
          <CodeBlock label="bash — PM2 setup" code={`# Start the agent server
pm2 start server.js --name "equity-agents"

# Save PM2 config so it survives server reboots
pm2 save

# Configure PM2 to auto-start on system boot
pm2 startup
# (Run the command that PM2 prints — it will look like:
#  sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u equity --hp /home/equity)

# Confirm the server is running
pm2 status

# Watch live logs
pm2 logs equity-agents`} />
          <p className="mt-3 mb-2 text-gray-600 text-sm">Useful PM2 commands going forward:</p>
          <CodeBlock label="bash — PM2 day-to-day" code={`pm2 logs equity-agents --lines 100   # tail recent logs
pm2 monit                              # real-time resource monitor
pm2 restart equity-agents              # restart after code changes
pm2 stop equity-agents                 # stop the server
pm2 delete equity-agents               # remove from PM2`} />
        </Section>

        {/* Step 5 */}
        <Section number={5} icon={Shield} iconBg="bg-red-600" iconColor="text-red-600"
          title="Configure Firewall (UFW)"
          subtitle="Allow SSH and port 3000, enable UFW for a basic security perimeter">
          <CodeBlock label="bash — UFW firewall" code={`# Allow SSH (critical — don't lock yourself out)
ufw allow ssh

# Allow the agent backend port
ufw allow 3000

# Enable the firewall
ufw enable

# Verify rules
ufw status`} />
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800">
            Also enable Hostinger's built-in VPS firewall from the hpanel dashboard as a second layer of protection.
          </div>
        </Section>

        {/* Step 6 */}
        <Section number={6} icon={Globe} iconBg="bg-teal-600" iconColor="text-teal-600"
          title="(Recommended) HTTPS with Nginx + Let's Encrypt"
          subtitle="Secure the connection with a free SSL certificate — required for production use">
          <p className="text-sm text-gray-600 mb-3">
            For production, run Nginx in front of Node.js. This enables HTTPS, which is required
            because the GitHub Pages frontend uses <code className="bg-gray-100 px-1 rounded text-xs">https://</code> and cannot
            call a plain <code className="bg-gray-100 px-1 rounded text-xs">http://</code> backend (mixed content block).
          </p>
          <CodeBlock label="bash — Nginx + Certbot install" code={`apt install -y nginx certbot python3-certbot-nginx`} />
          <CodeBlock label="bash — Nginx site config" code={`# Create Nginx configuration
cat > /etc/nginx/sites-available/equity-agents << 'EOF'
server {
    listen 80;
    server_name agents.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
    }
}
EOF

# Enable the site
ln -s /etc/nginx/sites-available/equity-agents /etc/nginx/sites-enabled/

# Test config
nginx -t

# Start Nginx
systemctl restart nginx

# Get free SSL certificate (replace with your actual domain)
certbot --nginx -d agents.yourdomain.com`} />
          <div className="mt-3 bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-700">
            <strong>No domain yet?</strong> Use your VPS IP directly for initial testing:
            <code className="block bg-gray-100 rounded px-2 py-1 mt-1 font-mono">http://YOUR_VPS_IP:3000/health</code>
            If this returns JSON, the backend is running. Add a domain + SSL before inviting staff.
          </div>
        </Section>

        {/* Step 7 */}
        <Section number={7} icon={Wifi} iconBg="bg-orange-600" iconColor="text-orange-600"
          title="Connect the Frontend to the Backend"
          subtitle="Tell the React app where the agent API lives by setting AGENT_API_URL">
          <p className="text-sm text-gray-600 mb-3">
            Edit <code className="bg-gray-100 px-1 rounded text-xs">index.html</code> in the root of the repository and uncomment the AGENT_API_URL line:
          </p>
          <CodeBlock label="index.html — with domain + SSL (recommended)" code={`<!-- Uncomment and update this line: -->
<script>window.AGENT_API_URL = 'https://agents.yourdomain.com';</script>`} />
          <CodeBlock label="index.html — IP-only / no SSL (testing only)" code={`<script>window.AGENT_API_URL = 'http://YOUR_VPS_IP:3000';</script>`} />
          <p className="text-sm text-gray-600 mt-3">
            After editing, rebuild and redeploy the frontend:
          </p>
          <CodeBlock label="bash — rebuild frontend" code={`npm run build
# Push the dist/ folder to GitHub Pages (or re-deploy via your CI pipeline)`} />
          <p className="text-sm text-gray-600 mt-3">
            Verify the connection: open the <strong>AI Assistant</strong> page in the app — the status indicator should show{' '}
            <span className="text-green-700 font-semibold">Connected</span>.
          </p>
        </Section>

      </div>

      {/* ── Updating the Backend ─────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-gray-500" /> Updating the Backend
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Pull new code, install any new dependencies, restart PM2</p>
        </div>
        <div className="p-5">
          <CodeBlock label="bash — update workflow" code={`ssh equity@YOUR_VPS_IP
cd ~/One-DSD-Equity-Program

# Pull latest changes
git pull origin main

# Install any new backend dependencies
cd backend
npm install

# Restart the agent server
pm2 restart equity-agents

# Confirm it's running
pm2 status`} />
        </div>
      </div>

      {/* ── Monitoring ──────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-gray-500" /> Monitoring & Diagnostics
          </h2>
        </div>
        <div className="p-5">
          <CodeBlock label="bash — monitoring commands" code={`# Live process logs
pm2 logs equity-agents --lines 100

# Real-time CPU/RAM dashboard
pm2 monit

# Check health endpoint (should return JSON with agent list)
curl http://localhost:3000/health

# Inspect the SQLite database
sqlite3 ~/One-DSD-Equity-Program/backend/data/equity_program.db

# Inside sqlite3:
.tables
SELECT * FROM insights ORDER BY created_at DESC LIMIT 5;
SELECT * FROM conversations ORDER BY created_at DESC LIMIT 5;
SELECT count(*) FROM messages;
.quit`} />
        </div>
      </div>

      {/* ── Security Checklist ───────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-500" /> Security Checklist
          </h2>
        </div>
        <ul className="divide-y divide-gray-100">
          {SECURITY_CHECKLIST.map(item => (
            <li key={item} className="flex items-start gap-3 px-5 py-3 text-sm text-gray-700">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Cost Summary ────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-500" /> Operating Cost Summary
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Anthropic API is the primary variable cost — monitor usage weekly</p>
        </div>
        <div className="divide-y divide-gray-100">
          {COSTS.map(r => (
            <div
              key={r.item}
              className={`flex justify-between px-5 py-3 text-sm ${r.highlight ? 'bg-blue-50 font-semibold' : ''}`}
            >
              <span className={r.highlight ? 'text-blue-900' : 'text-gray-700'}>{r.item}</span>
              <span className={r.highlight ? 'text-blue-700' : 'text-gray-900 font-medium'}>{r.cost}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer link */}
      <div className="flex items-center gap-2 text-sm text-blue-600">
        <CheckCircle2 className="w-4 h-4" />
        <span>Full deployment commands are also available in</span>
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-800">backend/DEPLOY.md</code>
        <span>in the repository.</span>
      </div>

    </div>
  );
}
