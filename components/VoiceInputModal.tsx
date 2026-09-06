import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ShoppingItem } from '../types';
import { parseShoppingTextList, ParsedShoppingItem } from '../utils/textParser';
import Button from './Button';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMultipleItems: (items: Omit<ShoppingItem, 'id' | 'isChecked'>[]) => void;
  priceHistory?: { [name: string]: number };
}

// Check speech recognition support
const getSpeechRecognitionClass = (): any => {
  if (typeof window === 'undefined') return null;
  const win = window as any;
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
};

const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  onAddMultipleItems,
  priceHistory = {},
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [parsedItems, setParsedItems] = useState<ParsedShoppingItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isManualEditing, setIsManualEditing] = useState<boolean>(false);

  // Reference to recognition instance
  const recognitionRef = useRef<any>(null);

  // Check support on mount
  useEffect(() => {
    const SpeechClass = getSpeechRecognitionClass();
    if (!SpeechClass) {
      setIsSupported(false);
    }
  }, []);

  // Initialize and clean up speech recognition
  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      setTranscript('');
      setInterimTranscript('');
      setParsedItems([]);
      setErrorMessage(null);
      return;
    }

    const SpeechClass = getSpeechRecognitionClass();
    if (!SpeechClass) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new (SpeechClass as any)();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'id-ID'; // Bahasa Indonesia

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalStr += trans + ' ';
          } else {
            interimStr += trans;
          }
        }

        if (finalStr) {
          setTranscript(prev => {
            const updated = (prev + ' ' + finalStr).trim();
            // Automatically parse the updated transcript into shopping items
            const parsed = parseShoppingTextList(
              updated.replace(/,/g, '\n').replace(/ dan /gi, '\n'),
              priceHistory
            );
            setParsedItems(parsed);
            return updated;
          });
        }
        setInterimTranscript(interimStr);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage(
            'Izin mikrofon belum diberikan. Harap aktifkan izin mikrofon di pengaturan browser Anda.'
          );
        } else if (event.error === 'no-speech') {
          // Normal when silent, don't show full error
        } else {
          setErrorMessage(`Terjadi kesalahan suara (${event.error}). Silakan coba lagi.`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Error creating recognition instance:', err);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [isOpen, priceHistory]);

  const handleStartListening = () => {
    setErrorMessage(null);
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.warn('Recognition start warning:', err);
      // If already started, restart
      try {
        recognitionRef.current.stop();
        setTimeout(() => {
          recognitionRef.current?.start();
          setIsListening(true);
        }, 150);
      } catch {
        // ignore
      }
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
    // Parse final transcript
    const fullText = (transcript + ' ' + interimTranscript).trim();
    if (fullText) {
      const parsed = parseShoppingTextList(
        fullText.replace(/,/g, '\n').replace(/ dan /gi, '\n'),
        priceHistory
      );
      setParsedItems(parsed);
    }
  };

  const handleTranscriptTextChange = (text: string) => {
    setTranscript(text);
    const parsed = parseShoppingTextList(
      text.replace(/,/g, '\n').replace(/ dan /gi, '\n'),
      priceHistory
    );
    setParsedItems(parsed);
  };

  const handleRemoveParsedItem = (idTemp: string) => {
    setParsedItems(prev => prev.filter(i => i.idTemp !== idTemp));
  };

  const handleUpdateItemQty = (idTemp: string, delta: number) => {
    setParsedItems(prev =>
      prev.map(i => {
        if (i.idTemp === idTemp) {
          const currentQ = i.quantity ?? 1;
          return { ...i, quantity: Math.max(1, currentQ + delta) };
        }
        return i;
      })
    );
  };

  const handleAddAllToShoppingList = () => {
    if (parsedItems.length === 0) return;

    const itemsToAdd: Omit<ShoppingItem, 'id' | 'isChecked'>[] = parsedItems.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      estimatedPrice: item.estimatedPrice,
      realPrice: null,
      groupTag: item.category,
      note: item.note,
    }));

    onAddMultipleItems(itemsToAdd);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[140] bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-600 to-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
              🎙️
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Input Suara Cepat (Voice-to-List)</h2>
              <p className="text-xs text-rose-100">
                Sebutkan belanjaan Anda dalam Bahasa Indonesia, sistem akan otomatis mencatatnya.
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

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 bg-gray-50">
          {!isSupported ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2 text-center">
              <span className="text-3xl block">⚠️</span>
              <h4 className="font-bold text-sm">Browser Tidak Mendukung Pengenalan Suara</h4>
              <p className="text-amber-700">
                Fitur Input Suara memerlukan Web Speech API yang didukung pada Google Chrome, Edge,
                dan Safari terbaru. Anda tetap dapat menggunakan fitur <strong>Input Daftar Teks</strong>.
              </p>
            </div>
          ) : (
            <>
              {/* Mic Controller Area */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
                {/* Visual Mic Button */}
                <div className="relative">
                  {isListening && (
                    <div className="absolute -inset-3 rounded-full bg-rose-500/20 animate-ping pointer-events-none" />
                  )}
                  <button
                    type="button"
                    onClick={isListening ? handleStopListening : handleStartListening}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg transition-all duration-200 transform active:scale-95 ${
                      isListening
                        ? 'bg-rose-600 text-white ring-4 ring-rose-300 scale-105 animate-pulse'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-2 border-rose-300'
                    }`}
                    title={isListening ? 'Klik untuk berhenti bicara' : 'Klik untuk mulai bicara'}
                  >
                    {isListening ? '🛑' : '🎙️'}
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {isListening ? 'Sedang Mendengarkan... Silakan Bicara!' : 'Tekan Tombol Mikrofon untuk Mulai'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isListening
                      ? 'Katakan barang belanjaan, misal: "Bawang merah 1 kilo, tempe 2 papan, kecap 1 botol"'
                      : 'Klik mikrofon lalu sebutkan daftar belanjaan Anda'}
                  </p>
                </div>

                {/* Example Speech Hint */}
                <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-2.5 text-[11px] text-rose-800 text-left w-full">
                  <span className="font-semibold block mb-0.5">💡 Contoh Kalimat yang Bisa Diucapkan:</span>
                  <p className="italic text-rose-700">
                    &quot;Beli beras lima kilo, telur ayam 1 kilo, minyak goreng dua liter, dan wortel 3 ikat&quot;
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Spoken Transcript Preview */}
              <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <span>📝</span> Teks yang Didengar:
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsManualEditing(!isManualEditing)}
                    className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold"
                  >
                    {isManualEditing ? 'Selesai Edit' : '✏️ Koreksi Teks'}
                  </button>
                </div>

                {isManualEditing ? (
                  <textarea
                    value={transcript}
                    onChange={e => handleTranscriptTextChange(e.target.value)}
                    placeholder="Ketik atau koreksi ucapan Anda di sini..."
                    className="w-full p-2.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none min-h-[70px]"
                  />
                ) : (
                  <div className="p-2.5 bg-gray-50 rounded-lg text-xs text-gray-800 min-h-[50px] leading-relaxed">
                    {transcript ? (
                      <span>
                        {transcript}
                        {interimTranscript && (
                          <span className="text-gray-400 italic"> {interimTranscript}...</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">
                        {isListening
                          ? 'Suara Anda akan muncul di sini secara langsung...'
                          : 'Belum ada suara yang terekam. Klik tombol mikrofon di atas.'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Parsed Items Breakdown */}
              {parsedItems.length > 0 && (
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <span>🛒</span> Hasil Deteksi Barang ({parsedItems.length}):
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Otomatis dikenali dari suara
                    </span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {parsedItems.map(item => (
                      <div
                        key={item.idTemp}
                        className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                          <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                            <span className="bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-medium">
                              {item.category}
                            </span>
                            <span>
                              {item.quantity ? `${item.quantity} ${item.unit || ''}` : item.unit || 'Secukupnya'}
                            </span>
                            {item.estimatedPrice && (
                              <span className="text-emerald-700 font-semibold">
                                Rp {item.estimatedPrice.toLocaleString('id-ID')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Stepper & Delete */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="flex items-center border border-gray-300 rounded-md bg-white overflow-hidden">
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQty(item.idTemp, -1)}
                              className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 font-bold"
                            >
                              -
                            </button>
                            <span className="px-1.5 text-xs font-semibold text-gray-800">
                              {item.quantity ?? 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQty(item.idTemp, 1)}
                              className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 font-bold"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveParsedItem(item.idTemp)}
                            className="text-gray-400 hover:text-red-500 p-1 text-sm rounded hover:bg-gray-200 transition-colors"
                            title="Hapus barang ini"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-gray-200 flex items-center justify-between gap-2">
          <Button variant="secondary" onClick={onClose} size="sm">
            Batal
          </Button>

          <Button
            variant="primary"
            onClick={handleAddAllToShoppingList}
            disabled={parsedItems.length === 0}
            size="sm"
            className={parsedItems.length === 0 ? 'opacity-50 cursor-not-allowed' : 'shadow-md'}
          >
            + Masukkan {parsedItems.length > 0 ? `(${parsedItems.length})` : ''} ke Daftar Belanja
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VoiceInputModal;
