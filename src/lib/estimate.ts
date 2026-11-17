export type PriceEstimate = {
  min: number;
  max: number;
  label: string;
  avg: number;
  note: string;
};

// Estimasi jasa service IT umum di Indonesia (2024-2025).
// Harga jasa saja, belum termasuk spare part tertentu (LCD, baterai original, SSD, dll).
export function estimatePriceFromDescription(description: string): PriceEstimate {
  const text = description.toLowerCase();

  const rules: Array<{ keywords: string[]; min: number; max: number; label: string; note: string }> = [
    {
      keywords: ["layar", "lcd", "led", "blank", "bergaris", "pecah", "retak", "flicker", "no display", "layar hitam", "layar putih", "backlight"],
      min: 400000,
      max: 1300000,
      label: "Layar / LCD & Kabel Fleksibel",
      note: "Jasa bongkar + cek panel. Ganti LCD original tambah 800rb - 2jt tergantung tipe.",
    },
    {
      keywords: ["baterai", "battery", "battre", "cas", "charger", "adaptor", "adapter", "tidak ngecas", "ngecas", "tidak mengisi", "drop", "kembung", "boros baterai"],
      min: 300000,
      max: 750000,
      label: "Baterai / Adaptor & Jalur Daya",
      note: "Jasa cek & ganti baterai. Baterai original tambah 450rb - 900rb.",
    },
    {
      keywords: ["keyboard", "tombol", "keypad", "tuts", "tombol lepas", "keyboard error", "tidak bisa mengetik"],
      min: 200000,
      max: 550000,
      label: "Keyboard",
      note: "Jasa ganti keyboard. Harga keyboard tambah 250rb - 500rb tergantung model.",
    },
    {
      keywords: ["motherboard", "mobo", "mainboard", "mati total", "tidak menyala", "no power", "korslet", "short", "mati mendadak total", "tidak hidup sama sekali"],
      min: 350000,
      max: 900000,
      label: "Motherboard / Mati Total",
      note: "Jasa diagnosa & repair board level. Ganti motherboard bisa 1jt - 3jt.",
    },
    {
      keywords: ["panas", "overheat", "thermal", "fan berisik", "kipas", "kipas berisik", "suhu tinggi", "mati mendadak", "restart sendiri", "thermal paste", "overhaul", "debu"],
      min: 150000,
      max: 350000,
      label: "Overheating / Cleaning & Repasta",
      note: "Pembersihan total, ganti thermal paste premium, tuning kipas.",
    },
    {
      keywords: ["lemot", "lambat", "nge-lag", "hang", "sering hang", "hdd", "ssd", "storage", "hardisk", "hard disk", "booting lama", "loading lama", "upgrade ram", "ram", "ngefreeze"],
      min: 200000,
      max: 600000,
      label: "Performa / Storage & RAM",
      note: "Jasa migrasi HDD ke SSD + tambah RAM. Harga SSD 256GB ~350rb, RAM 8GB ~300rb di luar jasa.",
    },
    {
      keywords: ["install", "instal", "windows", "software", "virus", "malware", "format", "driver", "blue screen", "bsod", "error system", "install ulang", "aktivasi"],
      min: 100000,
      max: 250000,
      label: "Software / Install Ulang & Virus",
      note: "Clean install Windows + driver + Office & software esensial.",
    },
    {
      keywords: ["data hilang", "recovery", "restore", "backup", "partisi hilang", "keformat", "terhapus", "tidak terbaca"],
      min: 300000,
      max: 800000,
      label: "Data Recovery",
      note: "Jasa recovery tergantung tingkat kerusakan. Kasus berat bisa >1jt.",
    },
    {
      keywords: ["wifi", "jaringan", "network", "router", "mikrotik", "lan", "internet", "sinyal", "koneksi", "access point", "setting router", "konfigurasi jaringan"],
      min: 150000,
      max: 450000,
      label: "Jaringan / Networking & Mikrotik",
      note: "Setup LAN, router, AP & bandwidth limiter. Perangkat belum termasuk.",
    },
    {
      keywords: ["printer", "print", "tidak ngeprint", "cartridge", "toner"],
      min: 150000,
      max: 400000,
      label: "Printer",
      note: "Jasa service printer. Spare part & tinta/toner di luar jasa.",
    },
    {
      keywords: ["cctv", "kamera", "dvr", "nvr"],
      min: 200000,
      max: 500000,
      label: "CCTV & Kamera",
      note: "Jasa instalasi & setting CCTV. Unit kamera belum termasuk.",
    },
  ];

  let best: (typeof rules)[number] | null = null;
  let bestScore = 0;
  for (const rule of rules) {
    const score = rule.keywords.filter((k) => text.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      best = rule;
    }
  }

  if (best && bestScore > 0) {
    return {
      min: best.min,
      max: best.max,
      label: best.label,
      avg: Math.round((best.min + best.max) / 2),
      note: best.note,
    };
  }

  return {
    min: 100000,
    max: 300000,
    label: "Diagnosa Umum & Pengecekan Awal",
    avg: 175000,
    note: "Cek menyeluruh hardware & software. Biaya final setelah diagnosa langsung.",
  };
}
