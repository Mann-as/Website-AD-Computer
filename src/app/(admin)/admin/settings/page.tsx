'use client';

import { useState, useEffect } from 'react';
import { Bot, CheckCircle2, AlertCircle, Loader2, Save, Send } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    GEMINI_API_KEY: '',
    TELEGRAM_ENABLED: true,
    TELEGRAM_ACTIVE_BOT: '1' as '1' | '2',
    TELEGRAM_BOT_TOKEN_1: '',
    TELEGRAM_BOT_TOKEN_2: '',
    TELEGRAM_CHAT_ID: '',
  });
  const [loading, setLoading] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok && data.settings) {
        setSettings((prev) => ({ ...prev, ...data.settings }));
        setMessage(null);
      } else {
        setError(data.error || 'Gagal mengambil settings');
      }
    } catch (err) {
      setError('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  }

  async function testTelegram() {
    setTestingTelegram(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch('/api/telegram/test', { method: 'POST' });
      const data = await res.json();
      if (res.ok) setMessage('Test notifikasi Telegram berhasil dikirim.');
      else setError(data.error || 'Test notifikasi Telegram gagal.');
    } catch {
      setError('Gagal terhubung ke server Telegram.');
    } finally {
      setTestingTelegram(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Setting berhasil diperbarui');
        fetchSettings();
      } else {
        setError(data.error || 'Gagal memperbarui setting');
      }
    } catch (err) {
      setError('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  }

  const textareaCls =
    'w-full bg-white border border-gray-200 rounded-xl px-3.5 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#dc2626] resize-none transition-all';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="pb-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Bot className="w-6 h-6 text-[#dc2626]" />
          Setting Sistem
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Ganti API key Gemini yang digunakan oleh AI Assistant.
        </p>
      </div>

      {message && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Gemini API Key</label>
          <textarea
            value={settings.GEMINI_API_KEY}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, GEMINI_API_KEY: e.target.value }))
            }
            className={textareaCls}
            placeholder="Masukkan API key Gemini"
            rows={3}
          />
          <p className="text-[11px] text-gray-500 mt-1 text-gray-600">
            Disimpan di database aplikasi, bukan di file .env. Kosongkan jika ingin memakai fallback lokal.
          </p>
        </div>

        <section className="mt-6 pt-6 border-t border-gray-100 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-[#dc2626]" />
              Notifikasi Telegram
            </h2>
            <p className="text-[11px] text-gray-500 mt-1">
              Atur bot dan tujuan notifikasi operasional. Bot token tidak akan ditampilkan kembali.
            </p>
          </div>

          <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3 text-xs">
            <span>
              <span className="block font-semibold text-gray-800">Aktifkan notifikasi Telegram</span>
              <span className="block text-gray-500 mt-0.5">Booking, pembayaran, dan perubahan status akan dikirim saat aktif.</span>
            </span>
            <input
              type="checkbox"
              checked={settings.TELEGRAM_ENABLED}
              onChange={(e) => setSettings((prev) => ({ ...prev, TELEGRAM_ENABLED: e.target.checked }))}
              className="h-4 w-4 accent-[#dc2626]"
            />
          </label>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Bot Telegram Aktif</label>
            <select
              value={settings.TELEGRAM_ACTIVE_BOT}
              onChange={(e) => setSettings((prev) => ({ ...prev, TELEGRAM_ACTIVE_BOT: e.target.value as '1' | '2' }))}
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#dc2626] transition-all"
            >
              <option value="1">Bot 1 (Utama)</option>
              <option value="2">Bot 2 (Cadangan)</option>
            </select>
            <p className="text-[11px] text-gray-500 mt-1">Sistem mengirim pesan menggunakan bot yang dipilih.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Token Bot 1 (Utama)</label>
              <textarea
                value={settings.TELEGRAM_BOT_TOKEN_1}
                onChange={(e) => setSettings((prev) => ({ ...prev, TELEGRAM_BOT_TOKEN_1: e.target.value }))}
                className={textareaCls}
                placeholder="Token dari @BotFather"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Token Bot 2 (Cadangan)</label>
              <textarea
                value={settings.TELEGRAM_BOT_TOKEN_2}
                onChange={(e) => setSettings((prev) => ({ ...prev, TELEGRAM_BOT_TOKEN_2: e.target.value }))}
                className={textareaCls}
                placeholder="Token bot kedua dari @BotFather"
                rows={2}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Chat ID Admin</label>
            <input
              value={settings.TELEGRAM_CHAT_ID}
              onChange={(e) => setSettings((prev) => ({ ...prev, TELEGRAM_CHAT_ID: e.target.value }))}
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#dc2626] transition-all"
              placeholder="Contoh: 123456789 atau -1001234567890"
            />
          </div>

          <button
            type="button"
            onClick={testTelegram}
            disabled={testingTelegram || loading}
            className="w-full py-2.5 rounded-xl border border-[#dc2626] text-[#dc2626] hover:bg-red-50 text-xs font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {testingTelegram ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {testingTelegram ? 'Mengirim test...' : 'Test Notifikasi Telegram'}
          </button>
        </section>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white text-xs font-semibold shadow-lg shadow-red-500/10 transition-colors flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? 'Menyimpan...' : 'Simpan Setting'}
          </button>
        </div>
      </form>
    </div>
  );
}