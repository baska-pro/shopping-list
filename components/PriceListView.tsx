import React, { useMemo } from 'react';
import { ShoppingSession } from '../types';
import { formatCurrency } from '../constants';

interface PriceListViewProps {
  history?: ShoppingSession[];
}

interface PriceData {
  name: string;
  lastPrice: number;
  lastUnit: string;
  trend: 'up' | 'down' | 'stable' | 'new';
  diff: number;
}

const PriceListView: React.FC<PriceListViewProps> = ({ history = [] }) => {
  const priceStats = useMemo(() => {
    const stats: { [name: string]: { prices: { price: number, date: string, unit: string }[] } } = {};
    const safeHistory = history || [];

    // Collect all prices for each item name
    safeHistory.forEach(session => {
      (session.items || []).forEach(item => {
        if (item.realPrice) {
          const name = (item.name || '').trim();
          if (!stats[name]) stats[name] = { prices: [] };
          // Normalize price per 1 unit if possible, but for simplicity, we track the price as recorded
          // Ideally, we should only compare prices if units are the same.
          stats[name].prices.push({
            price: (item.quantity && item.quantity > 0) ? (item.realPrice / item.quantity) : item.realPrice,
            date: session.date,
            unit: item.unit || '-'
          });
        }
      });
    });

    const result: PriceData[] = [];

    Object.keys(stats).forEach(name => {
      // Sort by date descending
      const prices = stats[name].prices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      if (prices.length > 0) {
        const latest = prices[0];
        let trend: 'up' | 'down' | 'stable' | 'new' = 'new';
        let diff = 0;

        if (prices.length > 1) {
          const previous = prices[1];
          // Only compare if units are somewhat similar strings
          if (latest.unit === previous.unit) {
            if (latest.price > previous.price) trend = 'up';
            else if (latest.price < previous.price) trend = 'down';
            else trend = 'stable';
            
            diff = latest.price - previous.price;
          }
        }

        result.push({
          name,
          lastPrice: latest.price, // Showing unit price
          lastUnit: latest.unit,
          trend,
          diff
        });
      }
    });

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [history]);

  if (priceStats.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-200">
        <p className="text-gray-500">Belum ada data harga. Lakukan rekap belanja untuk melihat analisis.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Wrapper for Horizontal Scroll */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-rose-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Barang</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Harga Satuan Terakhir</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Tren</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {priceStats.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                  {formatCurrency(item.lastPrice)} <span className="text-gray-400 text-xs">/ {item.lastUnit}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {item.trend === 'up' && (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Naik {formatCurrency(item.diff)} ⬆
                    </span>
                  )}
                  {item.trend === 'down' && (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Turun {formatCurrency(Math.abs(item.diff))} ⬇
                    </span>
                  )}
                  {item.trend === 'stable' && (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      Stabil =
                    </span>
                  )}
                  {item.trend === 'new' && (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Baru
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PriceListView;