
import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingItem, Unit } from '../types';
import { PREDEFINED_UNITS, formatCurrency, formatNumberInput, parseNumberInput } from '../constants';
import Input from './Input';
import Select from './Select';

interface ShoppingListItemProps {
  item: ShoppingItem;
  index: number;
  globalIndex: number; // Continuous index
  onUpdate: (updatedItem: ShoppingItem) => void;
  onDelete: (id: string) => void;
  onRequestDelete?: (item: ShoppingItem) => void;
  groupColors: { [key: string]: string };
  isMergeMode: boolean;
  isSelectedForMerge: boolean;
  onToggleMergeSelect: (id: string) => void;
  onPriceChange: (name: string, price: number) => void;
}

const ShoppingListItem: React.FC<ShoppingListItemProps> = ({ 
  item, 
  index, 
  globalIndex,
  onUpdate, 
  onDelete, 
  onRequestDelete,
  groupColors, 
  isMergeMode,
  isSelectedForMerge,
  onToggleMergeSelect,
  onPriceChange
}) => {
  // Local state for inputs to allow typing without jitter, updates parent onBlur
  const [name, setName] = useState<string>(item.name);
  const [quantityStr, setQuantityStr] = useState<string>(
    item.quantity !== null && item.quantity !== undefined ? String(item.quantity) : ''
  );
  const [unit, setUnit] = useState<string>(item.unit || '');
  const [customUnit, setCustomUnit] = useState<string>(item.unit === Unit.LAINNYA ? item.unit : '');
  
  // Use string for price inputs to handle "15.000" formatting
  const [estimatedPriceStr, setEstimatedPriceStr] = useState<string>(formatNumberInput(item.estimatedPrice));
  const [realPriceStr, setRealPriceStr] = useState<string>(formatNumberInput(item.realPrice));
  
  const [groupTag, setGroupTag] = useState<string>(item.groupTag ?? '');

  // Sync local state when prop changes (e.g. from import or merge)
  useEffect(() => {
    setName(item.name);
    setQuantityStr(item.quantity !== null && item.quantity !== undefined ? String(item.quantity) : '');
    setUnit(item.unit || '');
    setCustomUnit(item.unit === Unit.LAINNYA ? item.unit : '');
    setEstimatedPriceStr(formatNumberInput(item.estimatedPrice));
    setRealPriceStr(formatNumberInput(item.realPrice));
    setGroupTag(item.groupTag ?? '');
  }, [item]);

  const handlePriceChange = (value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    // Remove non-digits to keep clean number
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue) {
        setter('');
        return;
    }
    // Format with dots
    const formatted = Number(numericValue).toLocaleString('id-ID');
    setter(formatted);
  };

  const handleSave = useCallback(() => {
    const parsedRealPrice = realPriceStr === '' ? null : parseNumberInput(realPriceStr);
    const parsedEstPrice = estimatedPriceStr === '' ? null : parseNumberInput(estimatedPriceStr);
    const parsedQty = quantityStr.trim() === '' ? null : parseFloat(quantityStr);
    
    // Update price history if real price is set
    if (parsedRealPrice !== null && name.trim()) {
        onPriceChange(name.trim(), parsedRealPrice);
    }

    const updatedItem: ShoppingItem = {
      ...item,
      name: name.trim(),
      quantity: parsedQty !== null && !isNaN(parsedQty) && parsedQty > 0 ? parsedQty : null,
      unit: unit === Unit.LAINNYA ? customUnit.trim() : (unit || null),
      estimatedPrice: parsedEstPrice,
      realPrice: parsedRealPrice,
      groupTag: groupTag.trim() === '' ? null : groupTag.trim(),
    };

    // Only update if changed to avoid loops/unnecessary renders
    if (JSON.stringify(updatedItem) !== JSON.stringify(item)) {
        onUpdate(updatedItem);
    }
  }, [item, name, quantityStr, unit, customUnit, estimatedPriceStr, realPriceStr, groupTag, onUpdate, onPriceChange]);

  const setRealPriceSameAsEstimate = () => {
    if (estimatedPriceStr !== '') {
        setRealPriceStr(estimatedPriceStr);
        // Trigger save manually logic
        const price = parseNumberInput(estimatedPriceStr);
        onPriceChange(name.trim(), price);
        
        const parsedQty = quantityStr !== '' ? parseFloat(quantityStr) : null;
        const updatedItem = {
            ...item,
            name: name.trim(),
            quantity: parsedQty !== null && !isNaN(parsedQty) && parsedQty > 0 ? parsedQty : null,
            unit: unit === Unit.LAINNYA ? customUnit.trim() : unit,
            estimatedPrice: price,
            realPrice: price, // Set same
            groupTag: groupTag.trim() === '' ? null : groupTag.trim(),
        };
        onUpdate(updatedItem);
    }
  };

  const handleToggleCheck = useCallback(() => {
    if (isMergeMode) {
        onToggleMergeSelect(item.id);
    }
  }, [item, isMergeMode, onToggleMergeSelect]);

  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation(); 
      e.preventDefault();
      if (onRequestDelete) {
          onRequestDelete(item);
      } else {
          onDelete(item.id);
      }
  };

  const realP = item.realPrice;
  const estP = item.estimatedPrice;
  const difference = realP !== null && estP !== null ? realP - estP : null;

  const itemGroupColor = item.groupTag ? groupColors[item.groupTag] || 'bg-gray-50' : 'bg-white';
  const rowBackground = isMergeMode && isSelectedForMerge ? 'bg-rose-100 border-rose-300' : itemGroupColor;

  return (
    <tr className={`${rowBackground} border-b last:border-b-0 transition-colors duration-200 hover:bg-gray-50`}>
      {/* Checkbox only in merge mode */}
      {isMergeMode && (
        <td className="py-2 px-2 text-center w-10">
            <input
            type="checkbox"
            checked={isSelectedForMerge}
            onChange={handleToggleCheck}
            className={`form-checkbox h-5 w-5 rounded cursor-pointer text-rose-600 border-rose-500 focus:ring-rose-500`}
            />
        </td>
      )}

      {/* Numbering */}
      <td className="py-2 px-2 text-center text-sm text-gray-500 align-top pt-3 w-8">
        {globalIndex}
      </td>

      {/* Name */}
      <td className="py-2 px-2 align-top">
        <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSave}
            className={`text-sm font-medium ${item.isChecked ? 'line-through text-gray-400' : 'text-gray-800'}`}
            transparentBg
            placeholder="Nama Barang"
        />
      </td>

      {/* Quantity & Unit (Single Row, Fixed Width) */}
      <td className="py-2 px-2 align-top">
          <div className="flex flex-row gap-1 items-center justify-center">
            {/* Fixed width for quantity input to prevent cutting off unit */}
            <div className="w-16 flex-shrink-0">
                <Input
                type="number"
                inputMode="decimal"
                step="any"
                placeholder="-"
                value={quantityStr}
                onChange={(e) => setQuantityStr(e.target.value)}
                onBlur={handleSave}
                className="text-sm text-center"
                min="0.01"
                transparentBg
                />
            </div>
            <div className="flex-grow min-w-[70px]">
                <Select
                    value={unit}
                    onChange={(e) => {
                        setUnit(e.target.value);
                        // Save immediately
                        const updatedItem = { ...item, unit: e.target.value || null }; 
                        onUpdate(updatedItem); 
                    }}
                    options={[
                      { value: '', label: '-' },
                      ...PREDEFINED_UNITS.map(u => ({ value: u, label: u }))
                    ]}
                    className="w-full text-sm"
                    transparentBg
                    aria-label="Satuan"
                />
            </div>
          </div>
          {unit === Unit.LAINNYA && (
              <Input
                type="text"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                onBlur={handleSave}
                className="w-full text-sm mt-1"
                placeholder="Unit Custom"
                transparentBg
              />
            )}
      </td>

      {/* Estimated Price */}
      <td className="py-2 px-2 align-top text-right">
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={estimatedPriceStr}
            onChange={(e) => handlePriceChange(e.target.value, setEstimatedPriceStr)}
            onBlur={handleSave}
            className={`text-sm text-right min-w-[80px] ${item.isChecked ? 'text-gray-400' : 'text-gray-600'}`}
            placeholder="0"
            transparentBg
          />
      </td>

      {/* Real Price */}
      <td className="py-2 px-2 align-top">
        <div className="flex items-center justify-end gap-1">
            <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={realPriceStr}
                onChange={(e) => handlePriceChange(e.target.value, setRealPriceStr)}
                onBlur={handleSave}
                className={`text-sm text-right font-bold min-w-[80px] ${item.isChecked ? 'text-gray-400' : 'text-gray-900'}`}
                placeholder="0"
                transparentBg
            />
            <button 
                onClick={setRealPriceSameAsEstimate}
                className="text-xs bg-rose-100 text-rose-600 hover:bg-rose-200 rounded px-1 py-1 h-8 w-8 flex items-center justify-center border border-rose-200 flex-shrink-0"
                title="Sama dengan harga perkiraan"
                tabIndex={-1}
            >
                =
            </button>
        </div>
      </td>

      {/* Difference (Calculated) */}
      <td className={`py-2 px-2 align-middle text-right text-sm font-medium ${difference !== null && difference > 0 ? 'text-rose-600' : difference !== null && difference < 0 ? 'text-green-600' : 'text-gray-400'}`}>
        {difference !== null ? formatCurrency(difference) : '-'}
      </td>

      {/* Group Tag (Editable) - Removed hidden class */}
      <td className="py-2 px-2 align-top text-center">
          <Input
            type="text"
            value={groupTag}
            onChange={(e) => setGroupTag(e.target.value)}
            onBlur={handleSave}
            className="text-sm text-center min-w-[80px]"
            placeholder="-"
            transparentBg
          />
      </td>

      {/* Actions */}
      <td className="py-2 px-2 align-middle text-right">
        <div className="flex space-x-1 justify-end items-center relative z-10">
            <button 
                onClick={() => onUpdate({ ...item, isChecked: !item.isChecked })}
                className={`p-1.5 rounded-md transition-colors ${item.isChecked ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                title={item.isChecked ? "Batalkan Selesai" : "Tandai Selesai"}
                tabIndex={-1}
                type="button"
            >
                {item.isChecked ? '✅' : '⬜'}
            </button>

          <button 
            onClick={handleDelete} 
            className="p-1.5 rounded-md transition-colors bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 relative z-50 cursor-pointer border border-transparent shadow-sm"
            title="Hapus"
            type="button" 
          >
            🗑️
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ShoppingListItem;
