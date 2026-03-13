import React from 'react';
import { Server, CheckCircle2, ExternalLink, Cpu, HardDrive, Wifi } from 'lucide-react';

const PLANS = [
  { name: 'KVM 1', price: '$6.49/mo', cpu: '1', ram: '4 GB', storage: '50 GB', verdict: 'Technically sufficient', recommended: false },
  { name: 'KVM 2', price: '$8.99/mo', cpu: '2', ram: '8 GB', storage: '100 GB', verdict: 'Recommended — production + growth headroom', recommended: true },
  { name: 'KVM 4', price: '$12.99/mo', cpu: '4', ram: '16 GB', storage: '200 GB', verdict: 'Overkill for this use case', recommended: false },
  { name: 'KVM 8', price: '$25.99/mo', cpu: '8', ram: '32 GB', storage: '400 GB', verdict: 'Enterprise-scale — not needed', recommended: false },
];

const VPS_RESPONSIBILITIES = [
  { task: 'Run Node.js + Express server', cost: '~150 MB RAM' },
  { task: 'Manage WebSocket connections', cost: '~few KB per connection' },
  { task: 'Make HTTPS calls to Anthropic API', cost: 'Network I/O only — no local compute' },
  { task: 'Read/write SQLite database', cost: '~50–200 MB storage over 1 year' },
  { task: 'Run PM2 + Nginx', cost: '~70 MB RAM' },
  { task: 'Total realistic usage', cost: '~500 MB–1.5 GB RAM, < 5 GB storage', bold: true },
];

const SETUP_STEPS = [
  { step: 1, title: 'Provision the VPS', desc: 'Log into Hostinger → VPS → Order KVM 2 ($8.99/mo). Choose Ubuntu 22.04 LTS. Select United States region for best latency from Minnesota.' },
  { step: 2, title: 'Initial Server Setup', desc: 'SSH in, update packages, install Node.js 20 LTS, PM2, Git, and create a dedicated app user.' },
  { step: 3, title: 'Deploy the Backend', desc: 'Clone the repo, run npm install, copy .env.example to .env, and add your ANTHROPIC_API_KEY.' },
  { step: 4, title: 'Start with PM2', desc: 'Run pm2 start server.js --name "equity-agents", save the PM2 config, and enable auto-restart on reboot.' },
  { step: 5, title: 'Configure Firewall', desc: 'Allow SSH and port 3000 via UFW. Enable Hostinger\'s built-in firewall as an additional layer.' },
  { step: 6, title: '(Optional) HTTPS with Nginx', desc: 'Install Nginx + Certbot, configure reverse proxy, and get a free SSL certificate for your domain.' },
];

export default function Deployment() {
  return (
    <div className="page-content p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
          <Server className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deployment Guide</h1>
          <p className="text-sm text-gray-500">Hostinger VPS recommendation for the AI agent backend</p>
        </div>
      </div>

      {/* Recommendation Banner */}
      <div className="rounded-xl p-5 border-2 border-orange-400 bg-orange-50 flex items-start gap-4">
        <div className="text-3xl shrink-0">🏆</div>
        <div>
          <h2 className="text-lg font-bold text-orange-900">Recommended: Hostinger KVM 2 — $8.99/mo</h2>
          <p className="text-sm text-orange-800 mt-1">
            All AI computation runs on Anthropic's servers — not your VPS. The VPS only runs Node.js + SQLite,
            so lightweight infrastructure is all you need. KVM 2 gives you double the headroom of KVM 1
            for just <strong>$2.50/month more</strong>, covering growth and Phase 2 features without migration pain.
          </p>
        </div>
      </div>

      {/* What the VPS actually does */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-gray-500" /> What the VPS Actually Does
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">All AI computation runs on Anthropic's servers — your VPS just coordinates</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
              <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource Cost</th>
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
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Plan', 'Price', 'vCPU', 'RAM', 'Storage', 'Verdict'].map(h => (
                <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {PLANS.map(p => (
              <tr key={p.name} className={p.recommended ? 'bg-green-50 border-l-4 border-l-green-500' : ''}>
                <td className="px-4 py-3 font-semibold text-gray-900 flex items-center gap-2">
                  {p.recommended && <span className="text-green-600 text-xs font-bold bg-green-100 px-1.5 py-0.5 rounded">★ Best</span>}
                  {p.name}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{p.price}</td>
                <td className="px-4 py-3 text-gray-600">{p.cpu}</td>
                <td className="px-4 py-3 text-gray-600">{p.ram}</td>
                <td className="px-4 py-3 text-gray-600">{p.storage}</td>
                <td className={`px-4 py-3 text-xs ${p.recommended ? 'text-green-700 font-medium' : 'text-gray-500'}`}>{p.verdict}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* The $2.50/mo decision */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
        <h3 className="font-semibold text-blue-900 mb-2">The $2.50/Month Decision</h3>
        <p className="text-sm text-blue-800">
          KVM 1 → KVM 2 costs <strong>$2.50/month more ($30/year)</strong> for double the CPU, RAM, storage, and bandwidth.
          This headroom matters:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-blue-800 list-disc list-inside">
          <li>Phase 2 features (n8n automation, additional agents) consume more RAM</li>
          <li>Multiple staff members connecting simultaneously runs smoother with 2 vCPU</li>
          <li>SQLite + Node.js + PM2 + Nginx fits comfortably with room to spare</li>
          <li>Migrating from KVM 1 → KVM 2 mid-deployment is disruptive — start right</li>
        </ul>
      </div>

      {/* Setup Steps */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Wifi className="w-4 h-4 text-gray-500" /> Setup Overview
        </h2>
        <div className="space-y-3">
          {SETUP_STEPS.map(s => (
            <div key={s.step} className="flex gap-4 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                {s.step}
              </div>
              <div>
                <div className="font-medium text-gray-900">{s.title}</div>
                <div className="text-sm text-gray-600 mt-0.5">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-3">Operating Cost Summary</h2>
        <div className="space-y-2 text-sm">
          {[
            { item: 'Frontend hosting (GitHub Pages)', cost: 'Free' },
            { item: 'Backend VPS (Hostinger KVM 2)', cost: '$8.99/mo' },
            { item: 'Anthropic API — light use (1-2 queries/day)', cost: '~$20–40/mo' },
            { item: 'Anthropic API — moderate use (5-10 queries/day)', cost: '~$80–150/mo' },
          ].map(r => (
            <div key={r.item} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
              <span className="text-gray-700">{r.item}</span>
              <span className="font-medium text-gray-900">{r.cost}</span>
            </div>
          ))}
          <div className="flex justify-between py-1.5 pt-2 border-t border-gray-300">
            <span className="font-semibold text-gray-900">Total (moderate use)</span>
            <span className="font-bold text-blue-700">~$90–160/mo</span>
          </div>
        </div>
      </div>

      {/* Full guide link */}
      <div className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
        <CheckCircle2 className="w-4 h-4" />
        <span>Full step-by-step setup instructions are in </span>
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-800">backend/DEPLOY.md</code>
        <ExternalLink className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}
