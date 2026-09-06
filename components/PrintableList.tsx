
import React, { forwardRef } from 'react';
import { ShoppingItem } from '../types';
import { formatCurrency } from '../constants';

interface PrintableListProps {
  items?: ShoppingItem[];
  title?: string;
  date?: string;
}

const PrintableList = forwardRef<HTMLDivElement, PrintableListProps>(({ items = [], title = 'Daftar Belanja', date = '' }, ref) => {
  const safeItems = items || [];
  const totalReal = safeItems.reduce((sum, item) => sum + (item.realPrice || 0), 0);

  // Grouping items for display
  const groups: { [key: string]: ShoppingItem[] } = {};
  safeItems.forEach(item => {
    const group = item.groupTag || 'Lainnya';
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
  });

  let globalIndexCounter = 0;

  return (
    <div ref={ref} className="bg-white p-8 w-[800px] text-gray-900 absolute top-0 left-[-9999px] font-sans">
      <div className="text-center mb-6 border-b-2 border-rose-600 pb-4">
        <h1 className="text-3xl font-extrabold text-rose-800 uppercase tracking-widest">{title}</h1>
        <p className="text-gray-600 mt-2 text-sm font-medium">Tanggal: {date}</p>
      </div>

      <table className="w-full border-collapse border border-gray-300 text-sm table-fixed">
        <colgroup><col className="w-[8%]" /><col className="w-[45%]" /><col className="w-[22%]" /><col className="w-[25%]" /></colgroup>
        <thead>
          <tr className="bg-rose-700 text-white">
            <th className="border border-gray-400 p-2 text-center">No</th>
            <th className="border border-gray-400 p-2 text-left">Nama Barang</th>
            <th className="border border-gray-400 p-2 text-center">Jumlah</th>
            <th className="border border-gray-400 p-2 text-right">Harga</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groups).map(([groupName, groupItems], groupIdx) => (
            <React.Fragment key={groupName}>
              <tr className="bg-gray-100">
                <td colSpan={4} className="border border-gray-300 p-2 font-bold text-rose-800 uppercase tracking-wide text-xs pl-4">
                   📂 {groupName}
                </td>
              </tr>
              {groupItems.map((item, idx) => {
                  globalIndexCounter++;
                  return (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 p-2 text-center text-gray-600 align-top">{globalIndexCounter}</td>
                    <td className="border border-gray-300 p-2 font-medium text-gray-900 align-top whitespace-normal break-words">
                        {item.name}
                        {item.isChecked && <span className="ml-2 text-xs text-green-600 font-bold">✓</span>}
                    </td>
                    <td className="border border-gray-300 p-2 text-center text-gray-800 align-top">
                        {item.quantity ? `${item.quantity} ${item.unit || ''}`.trim() : (item.unit || '-')}
                    </td>
                    <td className="border border-gray-300 p-2 text-right font-bold text-gray-900 align-top">
                        {item.realPrice ? formatCurrency(item.realPrice) : '-'}
                    </td>
                    </tr>
                  );
                }
              )}
            </React.Fragment>
          ))}
        </tbody>
        <tfoot>
            <tr className="bg-gray-800 text-white border-t-4 border-gray-900">
                <td colSpan={3} className="p-3 text-right font-bold text-lg uppercase">Total</td>
                <td className="p-3 text-right font-extrabold text-yellow-400 text-xl">
                    {formatCurrency(totalReal)}
                </td>
            </tr>
        </tfoot>
      </table>
      
      <div className="mt-8 flex justify-between items-end text-gray-500 text-xs italic">
        <div>
            <p>Catatan:</p>
            <div className="border-b border-gray-300 w-64 h-8 mt-2"></div>
        </div>
        <div>
            Shopping List App
        </div>
      </div>
    </div>
  );
});

export default PrintableList;
