import React, { useState, useEffect } from 'react';
import { CloudSyncConfig, SyncProvider, SyncPayload } from '../types';
import { loadCloudSyncConfig, saveCloudSyncConfig, testProviderConnection, pushDataToCloud, pullDataFromCloud } from '../services/syncService';
import Button from './Button';
import { 
  Cloud, 
  Database, 
  FileSpreadsheet, 
  HardDrive, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Copy, 
  ExternalLink,
  UploadCloud,
  DownloadCloud,
  ShieldCheck,
  X
} from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPayload: SyncPayload;
  onDataAppliedFromCloud: (payload: SyncPayload) => void;
  onConfigUpdated: (config: CloudSyncConfig) => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  currentPayload,
  onDataAppliedFromCloud,
  onConfigUpdated,
}) => {
  const [config, setConfig] = useState<CloudSyncConfig>(loadCloudSyncConfig);
  const [activeTab, setActiveTab] = useState<SyncProvider>('none');
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loaded = loadCloudSyncConfig();
      setConfig(loaded);
      setActiveTab(loaded.provider);
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProviderSelect = (provider: SyncProvider) => {
    setActiveTab(provider);
    setConfig(prev => ({ ...prev, provider }));
    setStatusMessage(null);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setStatusMessage({ type: 'info', text: 'Menguji koneksi ke cloud...' });
    try {
      const res = await testProviderConnection({ ...config, provider: activeTab });
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Gagal menguji koneksi.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveSettings = () => {
    const updated: CloudSyncConfig = {
      ...config,
      provider: activeTab,
    };
    saveCloudSyncConfig(updated);
    setConfig(updated);
    onConfigUpdated(updated);
    setStatusMessage({ type: 'success', text: 'Pengaturan sinkronisasi cloud berhasil disimpan!' });
  };

  const handlePushNow = async () => {
    if (activeTab === 'none') {
      setStatusMessage({ type: 'error', text: 'Pilih provider Google Sheets atau Supabase terlebih dahulu.' });
      return;
    }

    setIsSyncing(true);
    setStatusMessage({ type: 'info', text: 'Mengunggah data belanjaan ke cloud...' });
    try {
      const currentConfig: CloudSyncConfig = { ...config, provider: activeTab };
      const res = await pushDataToCloud(currentConfig, currentPayload);
      if (res.success) {
        const now = new Date().toISOString();
        const updated: CloudSyncConfig = {
          ...currentConfig,
          lastSyncTime: now,
          lastSyncStatus: 'success',
          lastSyncMessage: 'Unggah berhasil',
        };
        saveCloudSyncConfig(updated);
        setConfig(updated);
        onConfigUpdated(updated);
        setStatusMessage({ type: 'success', text: res.message });
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Gagal mengunggah data.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullNow = async () => {
    if (activeTab === 'none') {
      setStatusMessage({ type: 'error', text: 'Pilih provider Google Sheets atau Supabase terlebih dahulu.' });
      return;
    }

    setIsSyncing(true);
    setStatusMessage({ type: 'info', text: 'Mengambil data belanjaan dari cloud...' });
    try {
      const currentConfig: CloudSyncConfig = { ...config, provider: activeTab };
      const res = await pullDataFromCloud(currentConfig);
      if (res.success && res.data) {
        onDataAppliedFromCloud(res.data);
        const now = new Date().toISOString();
        const updated: CloudSyncConfig = {
          ...currentConfig,
          lastSyncTime: now,
          lastSyncStatus: 'success',
          lastSyncMessage: 'Unduh berhasil',
        };
        saveCloudSyncConfig(updated);
        setConfig(updated);
        onConfigUpdated(updated);
        setStatusMessage({ type: 'success', text: 'Data dari cloud berhasil dimuat ke perangkat ini!' });
      } else if (res.success && !res.data) {
        setStatusMessage({ type: 'info', text: 'Belum ada data belanja di cloud untuk Room ID ini. Silakan klik "Kirim Data (Push)".' });
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Gagal mengambil data dari cloud.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const copyGASCodeSnippet = () => {
    const code = `// Buka file code.gs di root project Belanjaan untuk melihat kode lengkap Google Apps Script!`;
    navigator.clipboard.writeText(code);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const copySupabaseSQL = () => {
    const sql = `-- Script SQL Supabase untuk Belanjaan
create table if not exists shopping_sync (
  id text primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  payload jsonb not null
);

-- Buka izin RLS untuk client public
alter table shopping_sync enable row level security;
create policy "Akses Belanjaan Multi Device" on shopping_sync 
  for all using (true) with check (true);`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight">Sinkronisasi & Cloud Storage</h2>
              <p className="text-xs sm:text-sm text-emerald-100">
                Hubungkan belanjaan antar HP, Tablet, & Laptop keluarga tanpa login rumit
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-gray-800">
          
          {/* Provider Selection Tabs */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pilih Media Penyimpanan & Sinkronisasi:
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => handleProviderSelect('none')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                  activeTab === 'none'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold ring-2 ring-emerald-500/20 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-gray-50/50'
                }`}
              >
                <HardDrive className="w-5 h-5 mb-1 text-gray-700" />
                <span className="text-xs sm:text-sm">Lokal Saja</span>
                <span className="text-[10px] text-gray-500 hidden sm:inline mt-0.5">Offline-first</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderSelect('google-sheets')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                  activeTab === 'google-sheets'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold ring-2 ring-emerald-500/20 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-gray-50/50'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5 mb-1 text-green-600" />
                <span className="text-xs sm:text-sm">Google Sheets</span>
                <span className="text-[10px] text-gray-500 hidden sm:inline mt-0.5">Gratis via code.gs</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderSelect('supabase')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                  activeTab === 'supabase'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold ring-2 ring-emerald-500/20 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-gray-50/50'
                }`}
              >
                <Database className="w-5 h-5 mb-1 text-teal-600" />
                <span className="text-xs sm:text-sm">Supabase</span>
                <span className="text-[10px] text-gray-500 hidden sm:inline mt-0.5">PostgreSQL Cloud</span>
              </button>
            </div>
          </div>

          {/* Universal Room Key */}
          {activeTab !== 'none' && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 sm:p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-amber-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  ID Ruang Sinkronisasi (Sync Room Key)
                </label>
                <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
                  Multi-Device Pairing
                </span>
              </div>
              <input
                type="text"
                value={config.syncRoomKey}
                onChange={e => setConfig(prev => ({ ...prev, syncRoomKey: e.target.value }))}
                placeholder="misal: keluarga-budi atau belanja-rumah"
                className="w-full px-3 py-2 text-sm bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
              <p className="text-[11px] text-amber-800 leading-relaxed">
                💡 <strong>Tips Sinkronisasi Antar HP:</strong> Masukkan kata kunci yang sama di HP Anda, HP pasangan, atau anggota keluarga lainnya agar daftar belanja tersinkronisasi otomatis.
              </p>
            </div>
          )}

          {/* Provider Details: Offline */}
          {activeTab === 'none' && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center space-y-2">
              <HardDrive className="w-8 h-8 text-gray-400 mx-auto" />
              <h4 className="font-semibold text-gray-800">Mode Lokal (Offline PWA)</h4>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                Seluruh data daftar belanja, riwayat, dan resep disimpan dengan aman di memori browser perangkat ini. 
                Pilih <strong>Google Sheets</strong> atau <strong>Supabase</strong> jika Anda ingin menyelaraskan daftar belanja secara live dengan perangkat lain.
              </p>
            </div>
          )}

          {/* Provider Details: Google Sheets */}
          {activeTab === 'google-sheets' && (
            <div className="space-y-4 bg-emerald-50/40 border border-emerald-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                  <h4 className="font-bold text-gray-900 text-sm sm:text-base">Konfigurasi Google Spreadsheet</h4>
                </div>
                <button
                  type="button"
                  onClick={copyGASCodeSnippet}
                  className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-medium bg-white px-2.5 py-1 rounded-md border border-emerald-300 shadow-2xs"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedScript ? 'Tersalin!' : 'Lihat code.gs'}
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  URL Web App Google Apps Script (akhiran /exec) *
                </label>
                <input
                  type="url"
                  value={config.googleSheets.scriptUrl}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    googleSheets: { ...prev.googleSheets, scriptUrl: e.target.value }
                  }))}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  Token / Passcode Pengaman (Opsional)
                </label>
                <input
                  type="password"
                  value={config.googleSheets.authToken || ''}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    googleSheets: { ...prev.googleSheets, authToken: e.target.value }
                  }))}
                  placeholder="Opsional - kosongkan jika tidak diset di Apps Script"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="text-[11px] text-gray-600 bg-white p-3 rounded-lg border border-gray-200 space-y-1">
                <p className="font-semibold text-gray-800">Cara mudah setup Google Sheets:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-gray-600">
                  <li>Buat Google Spreadsheet baru di Google Drive Anda.</li>
                  <li>Klik menu <strong>Ekstensi &gt; Apps Script</strong>.</li>
                  <li>Tempel kode dari file <code>code.gs</code> yang sudah disediakan di proyek ini.</li>
                  <li>Klik <strong>Deploy &gt; New deployment &gt; Web app</strong> (akses: Anyone).</li>
                  <li>Salin URL Web App dan tempelkan pada kolom input di atas.</li>
                </ol>
              </div>
            </div>
          )}

          {/* Provider Details: Supabase */}
          {activeTab === 'supabase' && (
            <div className="space-y-4 bg-teal-50/40 border border-teal-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-teal-700" />
                  <h4 className="font-bold text-gray-900 text-sm sm:text-base">Konfigurasi Supabase</h4>
                </div>
                <button
                  type="button"
                  onClick={copySupabaseSQL}
                  className="text-xs text-teal-700 hover:text-teal-800 flex items-center gap-1 font-medium bg-white px-2.5 py-1 rounded-md border border-teal-300 shadow-2xs"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'SQL Tersalin!' : 'Salin SQL Tabel'}
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  Supabase Project URL *
                </label>
                <input
                  type="url"
                  value={config.supabase.url}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    supabase: { ...prev.supabase, url: e.target.value }
                  }))}
                  placeholder="https://your-project.supabase.co"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  Supabase Anon (Public) Key *
                </label>
                <input
                  type="password"
                  value={config.supabase.anonKey}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    supabase: { ...prev.supabase, anonKey: e.target.value }
                  }))}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  Nama Tabel Sync (Default: shopping_sync)
                </label>
                <input
                  type="text"
                  value={config.supabase.tableName || 'shopping_sync'}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    supabase: { ...prev.supabase, tableName: e.target.value }
                  }))}
                  placeholder="shopping_sync"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="text-[11px] text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                <p className="leading-relaxed">
                  🔐 <strong>Keamanan:</strong> Gunakan <code>anon key</code> (public key), bukan service_role key. Data disimpan terenkripsi saat transit via HTTPS.
                </p>
              </div>
            </div>
          )}

          {/* Auto-Sync Toggle */}
          {activeTab !== 'none' && (
            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <span className="text-sm font-bold text-gray-800 block">Sinkronisasi Otomatis (Auto-Sync)</span>
                <span className="text-xs text-gray-500">
                  Otomatis kirim/ambil data saat ada perubahan atau aplikasi dibuka
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoSync}
                  onChange={e => setConfig(prev => ({ ...prev, autoSync: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          )}

          {/* Status Message */}
          {statusMessage && (
            <div className={`p-3 rounded-xl text-xs sm:text-sm flex items-start gap-2 ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' 
                : statusMessage.type === 'error'
                ? 'bg-rose-50 border border-rose-200 text-rose-900'
                : 'bg-blue-50 border border-blue-200 text-blue-900'
            }`}>
              {statusMessage.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <RefreshCw className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 animate-spin" />
              )}
              <span className="leading-relaxed">{statusMessage.text}</span>
            </div>
          )}

          {/* Cloud Actions (Push / Pull) */}
          {activeTab !== 'none' && (
            <div className="pt-2 border-t border-gray-100">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Aksi Sinkronisasi Manual
              </span>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handlePushNow}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 shadow-xs"
                >
                  <UploadCloud className="w-4 h-4" />
                  Kirim Data (Push)
                </button>

                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handlePullNow}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 rounded-xl text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 shadow-xs"
                >
                  <DownloadCloud className="w-4 h-4 text-emerald-600" />
                  Ambil Data (Pull)
                </button>
              </div>

              {config.lastSyncTime && (
                <p className="text-[11px] text-gray-400 text-center mt-2">
                  Terakhir disinkronkan: {new Date(config.lastSyncTime).toLocaleString('id-ID')}
                </p>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-200 flex items-center justify-between shrink-0">
          <div>
            {activeTab !== 'none' && (
              <button
                type="button"
                disabled={isTesting}
                onClick={handleTestConnection}
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1.5 underline"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                Uji Koneksi
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveSettings}>
              Simpan Pengaturan
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CloudSyncModal;
