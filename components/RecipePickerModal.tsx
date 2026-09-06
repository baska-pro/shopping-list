import React, { useState, useMemo, useEffect } from 'react';
import { Recipe, RecipeIngredient, ShoppingItem, Unit } from '../types';
import { DEFAULT_RECIPES } from '../constants/recipes';
import { formatCurrency } from '../constants';
import Button from './Button';

interface RecipePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMultipleItems: (items: Omit<ShoppingItem, 'id' | 'isChecked'>[]) => void;
  existingItemNames?: string[];
  priceHistory?: { [name: string]: number };
}

const CUSTOM_RECIPES_STORAGE_KEY = 'belanjaan_custom_recipes_list';

const RECIPE_CATEGORIES = [
  'Semua',
  'Sayuran',
  'Daging & Ayam',
  'Sup & Berkuah',
  'Lauk Pauk',
  'Gorengan & Lauk',
  'Nasi & Mie',
];

const RecipePickerModal: React.FC<RecipePickerModalProps> = ({
  isOpen,
  onClose,
  onAddMultipleItems,
  existingItemNames = [],
  priceHistory = {},
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);

  // Scaled servings for active recipe
  const [servings, setServings] = useState<number>(4);

  // Set of selected ingredient names for the active recipe (default: all checked)
  const [selectedIngredientNames, setSelectedIngredientNames] = useState<Set<string>>(new Set());

  // Show cooking instructions tab/toggle
  const [showCookingSteps, setShowCookingSteps] = useState<boolean>(false);

  // Custom recipes saved in localStorage
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_RECIPES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // State for creating a new custom recipe
  const [showNewRecipeForm, setShowNewRecipeForm] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newRecipeCategory, setNewRecipeCategory] = useState('Sayuran');
  const [newRecipeDesc, setNewRecipeDesc] = useState('');
  const [newRecipeServings, setNewRecipeServings] = useState(4);
  const [newRecipeCookTime, setNewRecipeCookTime] = useState(30);
  const [newRecipeIngredientsText, setNewRecipeIngredientsText] = useState('');
  const [newRecipeFormError, setNewRecipeFormError] = useState<string | null>(null);

  // Save custom recipes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_RECIPES_STORAGE_KEY, JSON.stringify(customRecipes));
    } catch (e) {
      console.error('Failed to save custom recipes', e);
    }
  }, [customRecipes]);

  // Combine default and custom recipes
  const allRecipes = useMemo(() => {
    return [...DEFAULT_RECIPES, ...customRecipes];
  }, [customRecipes]);

  // Existing names set for fast lookup
  const existingSet = useMemo(() => {
    return new Set((existingItemNames || []).map(n => (n || '').toLowerCase().trim()));
  }, [existingItemNames]);

  // Filtered recipes
  const filteredRecipes = useMemo(() => {
    return (allRecipes || []).filter(r => {
      const matchCategory = selectedCategory === 'Semua' || r.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        (r.name || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (r.ingredients || []).some(ing => (ing.name || '').toLowerCase().includes(q));
      return matchCategory && matchQuery;
    });
  }, [allRecipes, selectedCategory, searchQuery]);

  // Whenever activeRecipe changes, reset servings and select all its ingredients
  useEffect(() => {
    if (activeRecipe) {
      setServings(activeRecipe.defaultServings || 4);
      setSelectedIngredientNames(new Set((activeRecipe.ingredients || []).map(ing => ing.name)));
      setShowCookingSteps(false);
    }
  }, [activeRecipe]);

  if (!isOpen) return null;

  const handleSelectRecipe = (recipe: Recipe) => {
    setActiveRecipe(recipe);
  };

  const handleToggleIngredient = (name: string) => {
    setSelectedIngredientNames(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const handleToggleAllIngredients = () => {
    if (!activeRecipe) return;
    const ingList = activeRecipe.ingredients || [];
    if (selectedIngredientNames.size === ingList.length) {
      setSelectedIngredientNames(new Set());
    } else {
      setSelectedIngredientNames(new Set(ingList.map(i => i.name)));
    }
  };

  const handleAddIngredientsToList = () => {
    if (!activeRecipe) return;

    const ratio = servings / (activeRecipe.defaultServings || 4);
    const ingList = activeRecipe.ingredients || [];

    const itemsToAdd: Omit<ShoppingItem, 'id' | 'isChecked'>[] = ingList
      .filter(ing => selectedIngredientNames.has(ing.name))
      .map(ing => {
        let scaledQty: number | null = null;
        if (ing.quantity !== null && ing.quantity !== undefined) {
          const raw = ing.quantity * ratio;
          // Clean round up to 2 decimals
          scaledQty = Math.round(raw * 100) / 100;
        }

        const estPrice = ing.estimatedPrice
          ? Math.round(ing.estimatedPrice * ratio)
          : (priceHistory[ing.name.trim()] ? Math.round(priceHistory[ing.name.trim()] * (scaledQty || 1)) : null);

        return {
          name: ing.name,
          quantity: scaledQty,
          unit: ing.unit,
          estimatedPrice: estPrice,
          realPrice: null,
          groupTag: ing.category || 'Bahan Resep',
          note: `Resep: ${activeRecipe.name}${ing.note ? ` (${ing.note})` : ''}`,
        };
      });

    if (itemsToAdd.length > 0) {
      onAddMultipleItems(itemsToAdd);
      onClose();
    }
  };

  const handleSaveCustomRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    setNewRecipeFormError(null);

    const trimmedName = newRecipeName.trim();
    if (!trimmedName) {
      setNewRecipeFormError('Nama resep wajib diisi.');
      return;
    }

    if (!newRecipeIngredientsText.trim()) {
      setNewRecipeFormError('Bahan-bahan resep wajib diisi.');
      return;
    }

    // Parse lines into ingredients
    const lines = newRecipeIngredientsText.split('\n').map(l => l.trim()).filter(Boolean);
    const ingredients: RecipeIngredient[] = lines.map(line => {
      // Basic splitting if user types "2 buah wortel" or just "wortel"
      return {
        name: line,
        quantity: 1,
        unit: Unit.BUAH,
        category: 'Bahan Resep',
      };
    });

    const newRecipe: Recipe = {
      id: `custom-${Date.now()}`,
      name: trimmedName,
      category: newRecipeCategory,
      description: newRecipeDesc.trim() || 'Resep kustom buatan sendiri',
      defaultServings: newRecipeServings || 4,
      cookTimeMinutes: newRecipeCookTime || 30,
      difficulty: 'Mudah',
      ingredients,
      isCustom: true,
    };

    setCustomRecipes(prev => [newRecipe, ...prev]);
    setActiveRecipe(newRecipe);
    setShowNewRecipeForm(false);
    // Reset form
    setNewRecipeName('');
    setNewRecipeDesc('');
    setNewRecipeIngredientsText('');
  };

  const handleDeleteCustomRecipe = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomRecipes(prev => prev.filter(r => r.id !== id));
    if (activeRecipe?.id === id) {
      setActiveRecipe(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[130] bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-orange-600 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
              🍳
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Resep ke Daftar Belanja</h2>
              <p className="text-xs text-orange-100">
                Pilih menu masakan nusantara, sesuaikan porsi & bahan, lalu masukkan ke belanjaan Anda.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors text-lg leading-none"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Content Container (Grid: Left is recipe catalog, Right is ingredients inspector) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0 bg-gray-50">
          {/* Left Column: Recipe List (md:col-span-5) */}
          <div className="md:col-span-5 border-r border-gray-200 flex flex-col min-h-0 bg-white">
            {/* Search & Category Filter */}
            <div className="p-3 border-b border-gray-200 bg-gray-50 space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari resep: Soto, Rendang, Sayur..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                  <span className="absolute left-2.5 top-2 text-gray-400 text-xs">🔍</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewRecipeForm(!showNewRecipeForm)}
                  className="px-2.5 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg text-xs font-bold shrink-0 transition-colors"
                  title="Tambah resep kustom sendiri"
                >
                  {showNewRecipeForm ? '✕ Batal' : '✨ + Buat'}
                </button>
              </div>

              {/* Category pills */}
              <div className="flex gap-1 overflow-x-auto pb-0.5 no-scrollbar text-[11px]">
                {RECIPE_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-orange-600 text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Recipe Creation Form (if toggled) */}
            {showNewRecipeForm && (
              <form
                onSubmit={handleSaveCustomRecipe}
                className="p-3 bg-orange-50/70 border-b border-orange-200 space-y-2 text-xs overflow-y-auto max-h-60"
              >
                <h4 className="font-bold text-orange-950">📝 Tambah Resep Sendiri</h4>
                {newRecipeFormError && (
                  <p className="text-red-600 text-[11px]">{newRecipeFormError}</p>
                )}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700">Nama Resep:</label>
                  <input
                    type="text"
                    value={newRecipeName}
                    onChange={e => setNewRecipeName(e.target.value)}
                    placeholder="Misal: Sambal Terasi Khas Ibu"
                    className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-xs"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700">Kategori:</label>
                    <select
                      value={newRecipeCategory}
                      onChange={e => setNewRecipeCategory(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-xs"
                    >
                      {RECIPE_CATEGORIES.filter(c => c !== 'Semua').map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700">Porsi:</label>
                    <input
                      type="number"
                      min="1"
                      value={newRecipeServings}
                      onChange={e => setNewRecipeServings(parseInt(e.target.value) || 4)}
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700">
                    Bahan-Bahan (1 bahan per baris):
                  </label>
                  <textarea
                    value={newRecipeIngredientsText}
                    onChange={e => setNewRecipeIngredientsText(e.target.value)}
                    placeholder="Bawang merah&#10;Cabai rawit&#10;Tomat&#10;Terasi"
                    rows={3}
                    className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-xs"
                  />
                </div>
                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowNewRecipeForm(false)}
                    className="px-2.5 py-1 text-gray-600 hover:bg-gray-200 rounded"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded font-bold"
                  >
                    Simpan Resep
                  </button>
                </div>
              </form>
            )}

            {/* Recipe Cards List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {filteredRecipes.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  <p className="text-2xl mb-1">🍲</p>
                  <p>Tidak ada resep yang cocok.</p>
                </div>
              ) : (
                filteredRecipes.map(recipe => {
                  const isSelected = activeRecipe?.id === recipe.id;
                  return (
                    <div
                      key={recipe.id}
                      onClick={() => handleSelectRecipe(recipe)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'bg-orange-50 border-orange-500 shadow-xs ring-1 ring-orange-500'
                          : 'bg-white border-gray-200 hover:border-orange-300 hover:bg-orange-50/30'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-gray-900 truncate">
                            {recipe.name}
                          </h4>
                          {recipe.isCustom && (
                            <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold">
                              Resep Sendiri
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                          {recipe.description}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                          <span>⏱️ {recipe.cookTimeMinutes || 30} mnt</span>
                          <span>•</span>
                          <span>👥 {recipe.defaultServings} porsi</span>
                          <span>•</span>
                          <span>📦 {recipe.ingredients.length} bahan</span>
                        </div>
                      </div>

                      {recipe.isCustom && (
                        <button
                          type="button"
                          onClick={e => handleDeleteCustomRecipe(recipe.id, e)}
                          className="text-gray-400 hover:text-red-500 p-1 text-xs rounded"
                          title="Hapus resep ini"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Recipe Details & Ingredients Checklist (md:col-span-7) */}
          <div className="md:col-span-7 flex flex-col min-h-0 bg-gray-50">
            {activeRecipe ? (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Active Recipe Header */}
                <div className="p-3.5 sm:p-4 bg-white border-b border-gray-200 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900">
                          {activeRecipe.name}
                        </h3>
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                          {activeRecipe.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        {activeRecipe.description}
                      </p>
                    </div>

                    {/* Instructions Toggle Button */}
                    {activeRecipe.instructions && (
                      <button
                        type="button"
                        onClick={() => setShowCookingSteps(!showCookingSteps)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold shrink-0 transition-colors ${
                          showCookingSteps
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {showCookingSteps ? '📋 Lihat Bahan' : '👩‍🍳 Cara Masak'}
                      </button>
                    )}
                  </div>

                  {/* Servings Stepper & Ratio Scaler */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-gray-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Atur Porsi:</span>
                      <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setServings(s => Math.max(1, s - 1))}
                          className="px-2.5 py-0.5 text-orange-700 hover:bg-orange-50 font-bold text-sm"
                          title="Kurangi porsi"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-gray-800">
                          {servings} Porsi
                        </span>
                        <button
                          type="button"
                          onClick={() => setServings(s => s + 1)}
                          className="px-2.5 py-0.5 text-orange-700 hover:bg-orange-50 font-bold text-sm"
                          title="Tambah porsi"
                        >
                          +
                        </button>
                      </div>
                      {servings !== activeRecipe.defaultServings && (
                        <span className="text-[11px] text-orange-600 italic">
                          (Jumlah bahan disesuaikan {servings}/{activeRecipe.defaultServings})
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleAllIngredients}
                      className="text-xs text-orange-700 hover:text-orange-900 font-semibold underline"
                    >
                      {selectedIngredientNames.size === activeRecipe.ingredients.length
                        ? 'Batal Pilih Semua'
                        : 'Pilih Semua Bahan'}
                    </button>
                  </div>
                </div>

                {/* Body: Ingredients List OR Cooking Instructions */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
                  {showCookingSteps && activeRecipe.instructions ? (
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800">
                        Langkah Memasak ({activeRecipe.name}):
                      </h4>
                      <ol className="space-y-2.5 text-xs text-gray-700 list-decimal pl-4 leading-relaxed">
                        {(activeRecipe.instructions || []).map((step, idx) => (
                          <li key={idx} className="pl-1">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-xs text-gray-500 pb-1">
                        <span>
                          Pilih bahan yang perlu dibeli (centang bahan yang belum ada di rumah):
                        </span>
                        <span className="font-semibold text-gray-800">
                          {selectedIngredientNames.size} dari {(activeRecipe.ingredients || []).length} bahan
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {(activeRecipe.ingredients || []).map(ing => {
                          const isChecked = selectedIngredientNames.has(ing.name);
                          const isAlreadyInList = existingSet.has(ing.name.toLowerCase().trim());
                          const ratio = servings / (activeRecipe.defaultServings || 4);

                          let displayQty: string = '';
                          if (ing.quantity !== null && ing.quantity !== undefined) {
                            const raw = ing.quantity * ratio;
                            const rounded = Math.round(raw * 100) / 100;
                            displayQty = `${rounded} ${ing.unit || ''}`.trim();
                          } else {
                            displayQty = (ing.unit || 'Secukupnya').toString();
                          }

                          const scaledEstPrice = ing.estimatedPrice
                            ? Math.round(ing.estimatedPrice * ratio)
                            : null;

                          return (
                            <div
                              key={ing.name}
                              onClick={() => handleToggleIngredient(ing.name)}
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 select-none ${
                                isChecked
                                  ? 'bg-white border-orange-300 shadow-2xs'
                                  : 'bg-gray-100/70 border-gray-200 text-gray-400 opacity-70'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}} // handled by parent onClick
                                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 border-gray-300 cursor-pointer"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span
                                      className={`text-xs font-bold ${
                                        isChecked ? 'text-gray-900' : 'text-gray-400 line-through'
                                      }`}
                                    >
                                      {ing.name}
                                    </span>
                                    {isAlreadyInList && (
                                      <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold border border-amber-200">
                                        Sudah di daftar
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                                    <span className="font-semibold text-orange-950">
                                      {displayQty}
                                    </span>
                                    {ing.note && <span className="italic">({ing.note})</span>}
                                  </div>
                                </div>
                              </div>

                              {scaledEstPrice && (
                                <div className="text-right text-xs shrink-0">
                                  <span
                                    className={`font-semibold ${
                                      isChecked ? 'text-emerald-700' : 'text-gray-400'
                                    }`}
                                  >
                                    ~{formatCurrency(scaledEstPrice)}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Right Bottom Action Bar */}
                <div className="p-3.5 bg-white border-t border-gray-200 flex items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="font-bold text-gray-900">
                      {selectedIngredientNames.size}
                    </span>{' '}
                    bahan dipilih untuk {servings} porsi
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleAddIngredientsToList}
                    disabled={selectedIngredientNames.size === 0}
                    size="sm"
                    className={`bg-orange-600 hover:bg-orange-700 ${
                      selectedIngredientNames.size === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : 'shadow-md'
                    }`}
                  >
                    + Masukkan Bahan ({selectedIngredientNames.size}) ke Daftar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400 space-y-2">
                <span className="text-4xl">🍲</span>
                <h4 className="font-bold text-gray-700 text-sm">Pilih Resep di Sebelah Kiri</h4>
                <p className="text-xs max-w-xs">
                  Klik salah satu resep masakan untuk melihat daftar bahan, menyesuaikan porsi, dan
                  memasukkannya ke daftar belanja.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipePickerModal;
