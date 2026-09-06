
import React, { useState } from 'react';
import { ShoppingSession } from '../types';
import { formatCurrency } from '../constants';
import Button from './Button';
import ConfirmModal from './ConfirmModal';

interface HistoryViewProps {
  history?: ShoppingSession[];
  onLoadList: (items: any[]) => void;
  onDeleteHistory: (id: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history = [], onLoadList, onDeleteHistory }) => {
  const [sessionToDelete, setSessionToDelete] = useState<ShoppingSession | null>(null);

  const safeHistory = history || [];

  if (safeHistory.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-200">
        <p className="text-gray-500">Belum ada riwayat belanja yang direkap.</p>
      </div>
    );
  }

  // Sort by date descending
  const sortedHistory = [...safeHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4">
      {sortedHistory.map((session) => (
        <div key={session.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-rose-300 transition-colors">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <h3 className="text-lg font-extrabold text-rose-700">{session.title || 'Daftar Belanja'}</h3>
              </div>
              <p className="text-xs text-gray-500 mb-1">{new Date(session.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              <h4 className="text-base font-bold text-gray-800">Total: {formatCurrency(session.totalReal)}</h4>
              <p className="text-xs text-gray-400">{(session.items || []).length} Barang</p>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
               <Button 
                onClick={() => onLoadList(session.items || [])} 
                variant="secondary" 
                size="sm"
               >
                 🔄 Gunakan Lagi
               </Button>
               <Button 
                onClick={() => setSessionToDelete(session)} 
                variant="ghost" 
                size="sm"
                className="text-red-500 hover:bg-red-50"
                title="Hapus riwayat ini"
               >
                 🗑️
               </Button>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto text-sm">
            <table className="w-full text-left">
                <tbody>
                    {(session.items || []).map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100 last:border-0">
                            <td className="py-1 text-gray-700">{item.name}</td>
                            <td className="py-1 text-gray-500 text-right">
                              {item.quantity ? `${item.quantity} ${item.unit || ''}`.trim() : (item.unit || '-')}
                            </td>
                            <td className="py-1 text-gray-900 font-medium text-right">{formatCurrency(item.realPrice)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Modern Confirmation Modal for Deleting History */}
      <ConfirmModal
        isOpen={sessionToDelete !== null}
        title="Hapus Riwayat Belanja?"
        message={`Riwayat belanja "${sessionToDelete?.title || 'Daftar Belanja'}" (${formatCurrency(sessionToDelete?.totalReal ?? 0)}) akan dihapus permanen.`}
        submessage="Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        icon="🗑️"
        onConfirm={() => {
          if (sessionToDelete) {
            onDeleteHistory(sessionToDelete.id);
            setSessionToDelete(null);
          }
        }}
        onCancel={() => setSessionToDelete(null)}
      />
    </div>
  );
};

export default HistoryView;
