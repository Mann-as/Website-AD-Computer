import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  Wrench,
  Cpu,
  Bot,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

export const revalidate = 60;

export default async function LandingPage() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    take: 6,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-24 pb-20 bg-white">
      {/* HERO SECTION */}
      <section className="relative pt-20 pb-16 overflow-hidden bg-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Computer & IT Services Ditenagai AI Assistant</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Solusi Service Komputer & IT <span className="text-brand-600">Cepat, Transparan & Cerdas</span>
          </h1>

          <p className="mt-6 text-gray-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Perbaiki laptop overheating, install Windows & software, atasi masalah jaringan, atau konsultasi masalah perangkat Anda secara instan dengan teknologi AI.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/ai-consultation"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 group"
            >
              <Bot className="w-4 h-4" />
              Konsultasi AI Diagnosis Gratis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/booking"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 group"
            >
              <Wrench className="w-4 h-4" />
              Booking Service
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto border-t border-gray-200 pt-10">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">99.2%</div>
              <div className="text-xs text-gray-500 mt-1">Kepuasan Pelanggan</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">1.500+</div>
              <div className="text-xs text-gray-500 mt-1">Komputer Selesai Service</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">Instant</div>
              <div className="text-xs text-gray-500 mt-1">AI Trouble Diagnosis</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">24/7</div>
              <div className="text-xs text-gray-500 mt-1">Status Tracking Realtime</div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Katalog Layanan Service & IT
          </h2>
          <p className="text-gray-500 text-sm mt-3">
            Pilihan paket layanan perbaikan komputer, software, dan jaringan dengan estimasi harga yang transparan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-brand-200 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 border border-brand-200 text-[11px] font-semibold uppercase tracking-wider">
                    {service.category}
                  </span>
                  <span className="text-xs text-gray-500">⏱️ {service.estimatedDuration}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                  {service.name}
                </h3>
                <p className="text-gray-500 text-xs mt-2 leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Estimasi Tarif</span>
                  <span className="text-lg font-extrabold text-brand-600">
                    {formatRupiah(service.price)}
                  </span>
                </div>
                <Link
                  href="/booking"
                  className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-brand-50 text-brand-600 border border-brand-200 hover:border-brand-300 text-xs font-semibold transition-all"
                >
                  Booking
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
