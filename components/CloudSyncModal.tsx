import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  Cloud,
  Database,
  DownloadCloud,
  FileSpreadsheet,
  HardDrive,
  RefreshCw,
  ShieldCheck,
  UploadCloud,
  X,
} from 'lucide-react';
import { CloudSyncConfig, SyncPayload, SyncProvider } from '../types';
import {
  loadCloudSyncConfig,
  pullDataFromCloud,
  pushDataToCloud,
  saveCloudSyncConfig,
  testProviderConnection,
} from '../services/syncService';
import Button from './Button';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPayload: SyncPayload;
  onDataAppliedFromCloud: (payload: SyncPayload) => void;
  onConfigUpdated: (config: CloudSyncConfig) => void;
}

type StatusMessage = { type: 'success' | 'error' | 'info'; text: string } | null;

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
  const [statusMessage, setStatusMessage] = useState<StatusMessage>(null);

  useEffect(() => {
    if (!isOpen) return;
    const loaded = loadCloudSyncConfig();
    setConfig(loaded);
    setActiveTab(loaded.provider);
    setStatusMessage(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const selectProvider = (provider: SyncProvider) => {
    setActiveTab(provider);
    setConfig(previous => ({ ...previous, provider }));
    setStatusMessage(null);
  };

  const currentConfig = (): CloudSyncConfig => ({ ...config, provider: activeTab });

  const saveSettings = () => {
    const updated = currentConfig();
    saveCloudSyncConfig(updated);
    setConfig(updated);
    onConfigUpdated(updated);
    setStatusMessage({ type: 'success', text: 'Pengaturan sinkronisasi berhasil disimpan.' });
  };

  const testConnection = async () => {
    setIsTesting(true);
    setStatusMessage({ type: 'info', text: 'Menguji koneksi...' });
    try {
      const result = await testProviderConnection(currentConfig());
      setStatusMessage({ type: result.success ? 'success' : 'error', text: result.message });
    } catch (error: unknown) {
      setStatusMessage({ type: 'error', text: error instanceof Error ? error.message : 'Gagal menguji koneksi.' });
    } finally {
      setIsTesting(false);
    }
  };

  const pushNow = async () => {
    if (activeTab === 'none') return;
    setIsSyncing(true);
    setStatusMessage({ type: 'info', text: 'Mengirim data ke cloud...' });
    try {
      const result = await pushDataToCloud(currentConfig(), currentPayload);
      if (!result.success) {
        setStatusMessage({ type: 'error', text: result.message });
        return;
      }
      const updated: CloudSyncConfig = {
        ...currentConfig(),
        lastSyncTime: new Date().toISOString(),
        lastSyncStatus: 'success',
        lastSyncMessage: 'Unggah berhasil',
      };
      saveCloudSyncConfig(updated);
      setConfig(updated);
      onConfigUpdated(updated);
      setStatusMessage({ type: 'success', text: result.message });
    } catch (error: unknown) {
      setStatusMessage({ type: 'error', text: error instanceof Error ? error.message : 'Gagal mengirim data.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const pullNow = async () => {
    if (activeTab === 'none') return;
    setIsSyncing(true);
    setStatusMessage({ type: 'info', text: 'Mengambil data dari cloud...' });
    try {
      const result = await pullDataFromCloud(currentConfig());
      if (!result.success) {
        setStatusMessage({ type: 'error', text: result.message });
        return;
      }
      if (!result.data) {
        setStatusMessage({ type: 'info', text: result.message });
        return;
      }
      onDataAppliedFromCloud(result.data);
      const updated: CloudSyncConfig = {
        ...currentConfig(),
        lastSyncTime: new Date().toISOString(),
        lastSyncStatus: 'success',
        lastSyncMessage: 'Unduh berhasil',
      };
      saveCloudSyncConfig(updated);
      setConfig(updated);
      onConfigUpdated(updated);
      setStatusMessage({ type: 'success', text: 'Data cloud berhasil diterapkan ke perangkat ini.' });
    } catch (error: unknown) {
      setStatusMessage({ type: 'error', text: error instanceof Error ? error.message : 'Gagal mengambil data.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const providerButton = (provider: SyncProvider, title: string, subtitle: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => selectProvider(provider)}
      className={`rounded-xl border p-3 text-center transition-all ${
        activeTab === provider
          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
      }`}
    >
      <div className="mx-auto mb-1 flex justify-center">{icon}</div>
      <div className="text-xs font-bold sm:text-sm">{title}</div>
      <div className="mt-0.5 hidden text-[10px] text-gray-500 sm:block">{subtitle}</div>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-xs sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white sm:p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/20 p-2"><Cloud className="h-6 w-6" /></div>
            <div>
              <h2 className="text-xl font-bold">Sinkronisasi Cloud</h2>
              <p className="text-xs text-emerald-100 sm:text-sm">Sinkronkan daftar belanja antar perangkat.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup" className="rounded-lg p-2 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto p-4 text-gray-800 sm:p-6">
          <div>
            <label className="mb-2 block text-sm font-semibold">Pilih penyimpanan</label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {providerButton('none', 'Lokal', 'Offline-first', <HardDrive className="h-5 w-5" />)}
              {providerButton('google-sheets', 'Google Sheets', 'Apps Script', <FileSpreadsheet className="h-5 w-5 text-green-600" />)}
              {providerButton('supabase', 'Supabase', 'PostgreSQL', <Database className="h-5 w-5 text-teal-600" />)}
            </div>
          </div>

          {activeTab !== 'none' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <label className="mb-1.5 flex items-center gap-2 text-sm font-bold text-amber-900">
                <ShieldCheck className="h-4 w-4" /> Room Key
              </label>
              <input
                type="password"
                value={config.syncRoomKey}
                onChange={event => setConfig(previous => ({ ...previous, syncRoomKey: event.target.value }))}
                autoComplete="new-password"
                placeholder="Gunakan frasa unik minimal 12 karakter"
                className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="mt-1.5 text-[11px] leading-relaxed text-amber-800">
                Gunakan Room Key yang panjang dan sulit ditebak. Jangan tampilkan Room Key di screenshot atau issue publik.
              </p>
            </div>
          )}

          {activeTab === 'none' && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
              <HardDrive className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm font-semibold">Mode lokal aktif</p>
              <p className="mt-1 text-xs text-gray-600">Data tetap tersimpan di browser dan aplikasi tetap dapat digunakan secara offline.</p>
            </div>
          )}

          {activeTab === 'google-sheets' && (
            <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
              <div>
                <label className="mb-1 block text-xs font-semibold">URL Web App Apps Script</label>
                <input
                  type="url"
                  value={config.googleSheets.scriptUrl}
                  onChange={event => setConfig(previous => ({
                    ...previous,
                    googleSheets: { ...previous.googleSheets, scriptUrl: event.target.value },
                  }))}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-emerald-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Token sinkronisasi</label>
                <input
                  type="password"
                  value={config.googleSheets.authToken || ''}
                  onChange={event => setConfig(previous => ({
                    ...previous,
                    googleSheets: { ...previous.googleSheets, authToken: event.target.value },
                  }))}
                  placeholder="Samakan dengan BELANJAAN_SYNC_TOKEN"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500 sm:text-sm"
                />
              </div>
              <p className="text-[11px] leading-relaxed text-gray-600">
                Gunakan <code>code.gs</code> versi terbaru. Untuk deployment publik, atur Script Property <code>BELANJAAN_SYNC_TOKEN</code> dan isi token yang sama di atas.
              </p>
            </div>
          )}

          {activeTab === 'supabase' && (
            <div className="space-y-4 rounded-xl border border-teal-200 bg-teal-50/40 p-4">
              <div>
                <label className="mb-1 block text-xs font-semibold">Supabase Project URL</label>
                <input
                  type="url"
                  value={config.supabase.url}
                  onChange={event => setConfig(previous => ({ ...previous, supabase: { ...previous.supabase, url: event.target.value } }))}
                  placeholder="https://project.supabase.co"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-emerald-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Anon / Public Key</label>
                <input
                  type="password"
                  value={config.supabase.anonKey}
                  onChange={event => setConfig(previous => ({ ...previous, supabase: { ...previous.supabase, anonKey: event.target.value } }))}
                  placeholder="Gunakan hanya public/anon key"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-emerald-500 sm:text-sm"
                />
              </div>
              <p className="text-[11px] leading-relaxed text-gray-600">
                Jalankan <code>supabase_schema.sql</code> versi terbaru. Skema memakai RPC dan hash Room Key agar tabel tidak dapat dibaca langsung atau dienumerasi oleh browser client.
              </p>
            </div>
          )}

          {activeTab !== 'none' && (
            <label className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3.5">
              <div>
                <span className="block text-sm font-bold">Auto-Sync</span>
                <span className="text-xs text-gray-500">Sinkronisasi otomatis saat aplikasi mengubah data.</span>
              </div>
              <input
                type="checkbox"
                checked={config.autoSync}
                onChange={event => setConfig(previous => ({ ...previous, autoSync: event.target.checked }))}
                className="h-5 w-5 accent-emerald-600"
              />
            </label>
          )}

          {statusMessage && (
            <div className={`flex items-start gap-2 rounded-xl border p-3 text-xs sm:text-sm ${
              statusMessage.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : statusMessage.type === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-900'
                  : 'border-blue-200 bg-blue-50 text-blue-900'
            }`}>
              {statusMessage.type === 'success' ? <Check className="mt-0.5 h-4 w-4 shrink-0" /> : statusMessage.type === 'error' ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 animate-spin" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {activeTab !== 'none' && (
            <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-4 sm:gap-3">
              <button type="button" disabled={isSyncing} onClick={pushNow} className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 sm:text-sm">
                <UploadCloud className="h-4 w-4" /> Kirim Data
              </button>
              <button type="button" disabled={isSyncing} onClick={pullNow} className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-xs font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50 sm:text-sm">
                <DownloadCloud className="h-4 w-4 text-emerald-600" /> Ambil Data
              </button>
            </div>
          )}

          {config.lastSyncTime && activeTab !== 'none' && (
            <p className="text-center text-[11px] text-gray-400">Terakhir sinkron: {new Date(config.lastSyncTime).toLocaleString('id-ID')}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
          <div>
            {activeTab !== 'none' && (
              <button type="button" disabled={isTesting} onClick={testConnection} className="flex items-center gap-1.5 text-xs font-medium text-gray-600 underline hover:text-gray-900 sm:text-sm">
                {isTesting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />} Uji Koneksi
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>Batal</Button>
            <Button variant="primary" size="sm" onClick={saveSettings}>Simpan</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudSyncModal;
