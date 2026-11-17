'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bot, Loader2, Send, Sparkles, X, BarChart2 } from 'lucide-react';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
};

const CUSTOMER_SUGGESTIONS = [
  'Berapa biaya service laptop?',
  'Bagaimana cara booking service?',
  'Lokasi workshop di mana?',
];

const ADMIN_SUGGESTIONS = [
  'Berapa jumlah tiket service?',
  'Harga tiket termurah dan termahal?',
  'Total pendapatan?',
  'Jumlah customer terdaftar?',
];

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AIAssistantBubble() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'ADMIN' | 'CUSTOMER' | 'GUEST' | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    const container = scrollRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (pathname.startsWith('/ai-consultation')) {
      return;
    }
    let mounted = true;
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data.user) {
          setRole(data.user.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER');
        } else {
          setRole('GUEST');
        }
      })
      .catch(() => {
        if (mounted) setRole('GUEST');
      });
    return () => { mounted = false; };
  }, [pathname]);

  if (pathname.startsWith('/ai-consultation')) {
    return null;
  }

  async function sendMessage(rawText: string) {
    const text = rawText.trim();
    if (!text || loading) return;

    setMessages((prev) => [
      ...prev,
      { id: createId(), role: 'user', content: text },
    ]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceType: 'Konsultasi Umum',
          issueDescription: text,
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { diagnosis?: string; error?: string }
        | null;

      if (!res.ok || !data?.diagnosis) {
        throw new Error(data?.error || 'Gagal mendapatkan jawaban AI.');
      }

      setMessages((prev) => [
        ...prev,
        { id: createId(), role: 'assistant', content: data.diagnosis as string },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: 'assistant',
          content:
            error instanceof Error
              ? `Maaf, ${error.message} Silakan coba lagi atau hubungi WhatsApp +62 858-8148-9207.`
              : 'Maaf, terjadi gangguan koneksi. Silakan coba lagi.',
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const suggestions = role === 'ADMIN' ? ADMIN_SUGGESTIONS : CUSTOMER_SUGGESTIONS;
  const welcomeMessage = role === 'ADMIN'
    ? 'Halo Admin! Saya AI Assistant AD Computer. Silakan tanya seputar statistik tiket, pendapatan, customer, teknisi, atau keluhan perangkat.'
    : 'Halo! Saya AI Assistant AD Computer. Silakan tanya seputar layanan, estimasi harga, booking, atau keluhan perangkat Anda.';

  return (
    <>
      {open && (
        <div className="fixed inset-x-4 bottom-24 z-50 flex h-[min(70vh,540px)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/20 sm:inset-x-auto sm:right-5 sm:w-[380px]">
          <div className="flex items-center justify-between gap-3 bg-brand-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <Bot className="h-5 w-5" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-brand-600 bg-emerald-400" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-bold">AD Computer AI</p>
                <p className="text-[11px] text-white/80">
                  {role === 'ADMIN' ? 'Mode Admin · Online' : role === 'CUSTOMER' ? 'Online · Siap membantu' : 'Tamu · Online'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              aria-label="Tutup chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-3.5 py-2.5 text-xs leading-relaxed text-gray-700 shadow-sm">
                  {welcomeMessage}
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => sendMessage(suggestion)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-[11px] font-medium text-brand-700 transition-colors hover:bg-brand-100"
                    >
                      {role === 'ADMIN' ? (
                        <>
                          <BarChart2 className="h-3 w-3" />
                          {suggestion}
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3" />
                          {suggestion}
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) =>
              message.role === 'user' ? (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-[85%] whitespace-pre-line rounded-2xl rounded-tr-sm bg-brand-600 px-3.5 py-2.5 text-xs leading-relaxed text-white shadow-sm">
                    {message.content}
                  </div>
                </div>
              ) : (
                <div key={message.id} className="flex justify-start">
                  <div
                    className={`max-w-[85%] whitespace-pre-line rounded-2xl rounded-tl-sm border px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                      message.isError
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-white text-gray-700'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              )
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-500 shadow-sm">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-600" />
                  AI sedang mengetik...
                </div>
              </div>
            )}

          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage(input);
            }}
            className="border-t border-gray-200 bg-white p-3"
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage(input);
                  }
                }}
                rows={1}
                maxLength={2000}
                placeholder="Tulis pertanyaan Anda..."
                className="max-h-28 flex-1 resize-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-brand-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Kirim pesan"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-gray-400">
              AI dapat membuat kesalahan. Konfirmasi detail via WhatsApp.
            </p>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? 'Tutup chat AI' : 'Buka chat AI'}
        className="group fixed bottom-5 right-5 z-50 flex items-center gap-2"
      >
        <span className="pointer-events-none translate-x-2 rounded-full bg-gray-900 px-3 py-1.5 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
          {open ? 'Tutup' : role === 'ADMIN' ? 'Admin AI' : 'AI Diagnosis'}
        </span>
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 transition-all duration-200 hover:scale-105 hover:bg-brand-700">
          {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
          {!open && (
            <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
          )}
        </span>
      </button>
    </>
  );
}