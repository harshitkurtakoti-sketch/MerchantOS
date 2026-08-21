'use client';

import { useState, useRef } from 'react';
import { Camera, Mic, Upload, FileText, CheckCircle2, RefreshCw, AlertCircle, Sparkles, Volume2 } from 'lucide-react';

interface ParsedInvoice {
  counterparty: string;
  invoice_date: string;
  total_amount: number;
  tax_amount: number;
  category: string;
  items: Array<{ name: string; qty: number; unit_price: number; total: number }>;
  raw_text: string;
}

interface OCRInvoiceCaptureProps {
  onInvoiceParsed?: (invoice: ParsedInvoice) => void;
}

export function OCRInvoiceCapture({ onInvoiceParsed }: OCRInvoiceCaptureProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'voice'>('camera');
  const [isScanning, setIsScanning] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedInvoice | null>(null);
  const [voiceText, setVoiceText] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Start Camera Stream
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setStatusMessage('Camera unavailable. Please use Photo Upload or Voice Input fallback.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Mock On-Device Vision OCR Simulation (Gemma 2B / Phi-3 / Tesseract pattern)
  const processImageOCR = (imageSrc: string) => {
    setIsScanning(true);
    setStatusMessage('Running on-device OCR model (Vision Pipeline)...');

    setTimeout(() => {
      setIsScanning(false);
      // Synthetic bill OCR parse output
      const mockResult: ParsedInvoice = {
        counterparty: 'Shree Laxmi Wholesalers',
        invoice_date: new Date().toISOString().split('T')[0],
        total_amount: 42500,
        tax_amount: 7650,
        category: 'Inventory Purchase',
        items: [
          { name: 'Basmati Rice 25kg Bag', qty: 15, unit_price: 1800, total: 27000 },
          { name: 'Refined Oil 15L Can', qty: 10, unit_price: 1550, total: 15500 },
        ],
        raw_text: 'INVOICE #SLW-9921\nShree Laxmi Wholesalers\nDate: 2026-08-21\nGSTIN: 27AABCU9603R1ZM\n1. Basmati Rice 25kg - 15 @ 1800 = 27000\n2. Refined Oil 15L - 10 @ 1550 = 15500\nTotal Tax (GST 18%): 7650\nGrand Total: ₹42,500',
      };
      setParsedData(mockResult);
      setStatusMessage('Invoice successfully parsed via local OCR engine!');
      if (onInvoiceParsed) onInvoiceParsed(mockResult);
    }, 1800);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPreviewImage(dataUrl);
      stopCamera();
      processImageOCR(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        processImageOCR(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Voice Input Fallback Handler (Web Speech API)
  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Fallback prompt for browsers without native Web Speech API
      const input = prompt('Enter bill details by speaking or typing (e.g. "Bought 10 bags of sugar from Laxmi Traders for 15000 rupees")');
      if (input) {
        parseVoiceText(input);
      }
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMessage('Listening... Speak bill details now (e.g. "Invoice from Mahaveer Traders for 25000 rupees")');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceText(transcript);
        setIsListening(false);
        parseVoiceText(transcript);
      };

      recognition.onerror = (err: any) => {
        console.error('Speech error:', err);
        setIsListening(false);
        setStatusMessage('Voice recognition error. Please try again.');
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const parseVoiceText = (text: string) => {
    setIsScanning(true);
    setStatusMessage('Parsing voice invoice stream...');

    setTimeout(() => {
      setIsScanning(false);
      const amtMatch = text.match(/\d+([.,]\d+)?/);
      const extractedAmount = amtMatch ? parseFloat(amtMatch[0].replace(/,/g, '')) : 18500;

      const voiceParsed: ParsedInvoice = {
        counterparty: text.toLowerCase().includes('mahaveer') ? 'Mahaveer Traders' : 'Voice Invoice Supplier',
        invoice_date: new Date().toISOString().split('T')[0],
        total_amount: extractedAmount,
        tax_amount: Math.round(extractedAmount * 0.18),
        category: 'Supplies / Inventory',
        items: [{ name: 'Voice Captured Item', qty: 1, unit_price: extractedAmount, total: extractedAmount }],
        raw_text: `Voice Input: "${text}"`,
      };

      setParsedData(voiceParsed);
      setStatusMessage('Voice bill entry successfully captured!');
      if (onInvoiceParsed) onInvoiceParsed(voiceParsed);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" /> On-Device Invoice & Bill Capture
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            On-device vision OCR model capture with voice input fallback.
          </p>
        </div>
        <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
          Local WebGPU / OCR
        </span>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
        <button
          onClick={() => {
            setActiveTab('camera');
            setParsedData(null);
            setPreviewImage(null);
          }}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'camera' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Camera className="w-3.5 h-3.5" /> Camera OCR
        </button>

        <button
          onClick={() => {
            stopCamera();
            setActiveTab('upload');
            setParsedData(null);
            setPreviewImage(null);
          }}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'upload' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="w-3.5 h-3.5" /> Photo Upload
        </button>

        <button
          onClick={() => {
            stopCamera();
            setActiveTab('voice');
            setParsedData(null);
            setPreviewImage(null);
          }}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'voice' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Mic className="w-3.5 h-3.5" /> Voice Input
        </button>
      </div>

      {/* Camera Capture View */}
      {activeTab === 'camera' && (
        <div className="space-y-3">
          <div className="relative bg-slate-900 rounded-xl overflow-hidden min-h-[220px] flex items-center justify-center border border-slate-800">
            {isCameraActive ? (
              <video ref={videoRef} autoPlay playsInline className="w-full h-56 object-cover" />
            ) : previewImage ? (
              <img src={previewImage} alt="Captured Bill" className="w-full h-56 object-contain" />
            ) : (
              <div className="text-center p-6 space-y-3 text-slate-400">
                <Camera className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-xs">Stream bill image to extract items & totals live</p>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-all shadow-md"
                >
                  Open Camera Stream
                </button>
              </div>
            )}
          </div>

          {isCameraActive && (
            <div className="flex gap-2">
              <button
                onClick={capturePhoto}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Camera className="w-4 h-4" /> Snap & Run On-Device OCR
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* File Upload View */}
      {activeTab === 'upload' && (
        <div className="space-y-3">
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center space-y-3 hover:border-emerald-400 transition-all bg-slate-50/50">
            <Upload className="w-8 h-8 text-emerald-600 mx-auto" />
            <div>
              <p className="text-xs font-bold text-slate-900">Upload Invoice or Receipt Photo</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Supports JPG, PNG, WEBP receipts & GST bills</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="camera-file-input"
            />
            <label
              htmlFor="camera-file-input"
              className="inline-block px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-all shadow-xs"
            >
              Select Image File
            </label>
          </div>

          {previewImage && (
            <div className="rounded-xl overflow-hidden border border-slate-200">
              <img src={previewImage} alt="Bill Preview" className="w-full h-40 object-cover" />
            </div>
          )}
        </div>
      )}

      {/* Voice Input View */}
      {activeTab === 'voice' && (
        <div className="p-6 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md animate-pulse">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-950">Voice Invoice Entry Fallback</h4>
            <p className="text-xs text-emerald-800 mt-1 max-w-sm mx-auto">
              Speak invoice details directly: supplier name, total rupees, and item breakdown.
            </p>
          </div>

          <button
            onClick={startVoiceInput}
            disabled={isListening}
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 mx-auto shadow-md"
          >
            {isListening ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Listening...
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" /> Tap to Speak Bill
              </>
            )}
          </button>

          {voiceText && (
            <div className="p-3 bg-white rounded-lg border border-emerald-200 text-left text-xs text-slate-700">
              <span className="font-bold text-slate-900">Captured Speech:</span> "{voiceText}"
            </div>
          )}
        </div>
      )}

      {/* Scanning status banner */}
      {isScanning && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-800 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" /> {statusMessage}
        </div>
      )}

      {/* Parsed Result Display */}
      {parsedData && (
        <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400">Structured Data Parsed</span>
            </div>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-800">
              98.4% Confidence
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Supplier / Counterparty</span>
              <span className="font-bold text-slate-100">{parsedData.counterparty}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Invoice Date</span>
              <span className="font-bold text-slate-100">{parsedData.invoice_date}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Total Amount</span>
              <span className="font-extrabold text-emerald-400 text-sm">
                ₹{parsedData.total_amount.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Est. GST / Tax</span>
              <span className="font-bold text-slate-300">
                ₹{parsedData.tax_amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {parsedData.items.length > 0 && (
            <div className="border-t border-slate-800 pt-2 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Line Items ({parsedData.items.length})
              </span>
              <div className="space-y-1">
                {parsedData.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-xs font-mono text-slate-300">
                    <span>
                      {it.name} (x{it.qty})
                    </span>
                    <span>₹{it.total.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => {
                alert(`Added ₹${parsedData.total_amount.toLocaleString('en-IN')} expense from ${parsedData.counterparty} to active digital twin!`);
                setParsedData(null);
                setPreviewImage(null);
              }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-all"
            >
              Confirm & Commit to Merchant OS State
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
