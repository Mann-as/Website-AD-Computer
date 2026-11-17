import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck, Bot, MessageCircle, ExternalLink } from 'lucide-react';

const WA_NUMBER = '6285881489207';
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=Halo%20AD%20Computer%2C%20saya%20ingin%20konsultasi%20layanan%20service%20komputer`;
const MAPS_SHORT_LINK = 'https://maps.app.goo.gl/ueqD6bkZre8vrXiq6';
const MAPS_EMBED_SRC =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.168!2d108.6354294!3d-6.8400731!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6f05d0c57fe507%3A0x761bab464644dc1d!2sAD%20Computer!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 text-gray-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/AD.png"
                alt="AD Computer"
                className="h-9 w-9 rounded-lg object-contain bg-white border border-gray-200 p-0.5"
              />
              <span className="font-bold text-lg text-gray-900 tracking-tight">AD Computer</span>
            </div>
            <p className="text-gray-600 text-xs leading-relaxed">
              Solusi terdepan untuk perbaikan komputer, install OS/software, instalasi jaringan, dan pemeliharaan IT bisnis
              yang ditenagai oleh kecerdasan buatan (AI).
            </p>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold shadow-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Hubungi Kami via WhatsApp
            </a>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">Layanan Utama</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>Service Komputer & Laptop</li>
              <li>Install OS Windows & Driver</li>
              <li>Install Paket Software</li>
              <li>Hardware Troubleshooting</li>
              <li>Setup Jaringan & Wi-Fi</li>
              <li>IT Support & Maintenance</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">Navigasi Cepat</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="text-gray-600 hover:text-[#dc2626] transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="/ai-consultation"
                  className="text-gray-600 hover:text-[#dc2626] transition-colors flex items-center gap-1"
                >
                  <Bot className="w-3 h-3 text-[#dc2626]" /> AI Consultation
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-600 hover:text-[#dc2626] transition-colors">
                  Portal Login Customer
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-gray-600 hover:text-[#dc2626] transition-colors flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3 text-gray-500" /> Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">Kontak & Workshop</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#dc2626] shrink-0 mt-0.5" />
                <div>
                  <a
                    href={MAPS_SHORT_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-[#dc2626] transition-colors inline-flex items-center gap-1 font-medium"
                  >
                    AD Computer — Cirebon
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="block text-gray-500 mt-0.5">Buka di Google Maps</span>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#dc2626] shrink-0" />
                <a href="tel:+6285881489207" className="text-gray-600 hover:text-[#dc2626] transition-colors">
                  +62 858-8148-9207
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#dc2626] shrink-0" />
                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#dc2626] transition-colors font-medium text-gray-700"
                >
                  WhatsApp: +62 858-8148-9207
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#dc2626] shrink-0" />
                <span className="text-gray-600">support@adcomputer.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* MAPS SECTION */}
        <div className="mt-10 rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
          <div className="grid md:grid-cols-5 gap-0">
            <div className="md:col-span-3 h-[280px] md:h-[320px] relative bg-gray-100">
              <iframe
                src={MAPS_EMBED_SRC}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi AD Computer di Google Maps"
                className="absolute inset-0"
              />
            </div>
            <div className="md:col-span-2 p-6 flex flex-col justify-center gap-4 bg-white">
              <div className="inline-flex items-center gap-2 text-[#dc2626] text-xs font-semibold uppercase tracking-wider">
                <MapPin className="w-4 h-4" /> Lokasi Workshop
              </div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">Kunjungi Workshop Kami</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                AD Computer — lokasi resmi kami. Klik tombol di bawah untuk membuka rute langsung di Google Maps atau
                hubungi kami via WhatsApp untuk konsultasi cepat.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-1">
                <a
                  href={MAPS_SHORT_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold shadow-sm transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  Buka di Google Maps
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold shadow-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Hubungi Kami
                </a>
              </div>
              <p className="text-[11px] text-gray-500">
                Telp/WA:{' '}
                <a href="tel:+6285881489207" className="text-gray-700 hover:text-[#dc2626]">
                  +62 858-8148-9207
                </a>{' '}
                •{' '}
                <a
                  href={MAPS_SHORT_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#dc2626] hover:text-[#b91c1c]"
                >
                  {MAPS_SHORT_LINK}
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© 2026 AD Computer. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Senior Software Architecture & Full-Stack Implementation</p>
        </div>
      </div>
    </footer>
  );
}
