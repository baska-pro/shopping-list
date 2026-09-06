import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isOnline, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);
  const [showOfflineInfo, setShowOfflineInfo] = useState<boolean>(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // General instructions modal
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Offline Indicator Badge */}
        {!isOnline ? (
          <button
            type="button"
            onClick={() => setShowOfflineInfo(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold hover:bg-amber-200 transition-colors"
            title="Aplikasi berjalan dalam mode Offline. Data Anda tetap tersimpan aman di perangkat."
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Mode Offline</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowOfflineInfo(true)}
            className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium hover:bg-emerald-100 transition-colors"
            title="Dukungan PWA Aktif: Aplikasi dapat digunakan saat tidak ada sinyal/offline!"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Siap Offline (PWA)</span>
          </button>
        )}

        {/* Install Button (Show if not already running in standalone PWA) */}
        {!isInstalled && (
          <button
            type="button"
            onClick={handleInstallClick}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95 border border-emerald-600"
            title="Pasang aplikasi di layar HP/komputer Anda untuk akses cepat seperti aplikasi bawaan"
          >
            <span>📲</span>
            <span>Pasang Aplikasi</span>
          </button>
        )}
      </div>

      {/* Offline Info Modal */}
      {showOfflineInfo && (
        <div
          className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-3.5 border border-gray-100"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <h3 className="text-sm font-bold text-gray-900">Fitur Mode Offline (PWA)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOfflineInfo(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Aplikasi ini dirancang dengan teknologi <strong>Progressive Web App (PWA)</strong>.
              Seluruh daftar belanja, bahan masakan, riwayat, dan harga disimpan langsung di memori perangkat Anda.
            </p>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
              <span className="font-bold block">✨ Keuntungan:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                <li>Tetap bisa dibuka dan dicentang saat berada di dalam pasar bawah tanah tanpa sinyal.</li>
                <li>Tidak memakan kuota internet untuk mencatat dan mengubah harga.</li>
                <li>Bisa dipasang ke layar utama HP (Home Screen).</li>
              </ul>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setShowOfflineInfo(false)}
                className="px-4 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari / General Installation Guide Modal */}
      {showIOSGuide && (
        <div
          className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4 border border-gray-100"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📲</span>
                <h3 className="text-sm font-bold text-gray-900">Cara Pasang ke Layar Utama</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Pasang <strong>Shopping Books</strong> di layar utama HP Anda agar bisa dibuka cepat kapan saja layaknya aplikasi native:
            </p>

            <div className="space-y-2.5 text-xs text-gray-700 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                  1
                </span>
                <span>
                  Ketuk tombol <strong>Bagikan / Share</strong> (ikon <span className="font-mono">📤</span> di Safari iOS atau titik tiga <span className="font-mono">⋮</span> di Chrome).
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                  2
                </span>
                <span>
                  Gulir ke bawah dan pilih menu <strong>&quot;Tambah ke Layar Utama&quot;</strong> (<em>Add to Home Screen</em>).
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                  3
                </span>
                <span>
                  Ketuk <strong>Tambah</strong> di sudut kanan atas. Ikon aplikasi akan langsung muncul di layar HP Anda!
                </span>
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 shadow-sm"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
