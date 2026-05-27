"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, RotateCcw, RefreshCcw, Check } from "lucide-react";
import Logo from "@/components/Logo";
import { captureVideoFrame, CompressedImage } from "@/lib/compress-image";
import { scanReceiptImage, ScanResult } from "@/app/actions/vision";

interface CameraSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onResult: (result: ScanResult) => void;
}

export default function CameraSheet({ isOpen, onClose, onResult }: CameraSheetProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const checkInterval = useRef<NodeJS.Timeout | null>(null);

  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  
  // Freezing state
  const [frozenFrame, setFrozenFrame] = useState<CompressedImage | null>(null);
  const [frozenUrl, setFrozenUrl] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    setCameraReady(false);
    setFrozenFrame(null);
    setFrozenUrl(null);
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      
      let stream: MediaStream;
      try {
        // Try strict exact facingMode first (forces rear camera on mobile)
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode === "environment" ? { exact: "environment" } : "user", width: { ideal: 720 }, height: { ideal: 1280 } },
          audio: false,
        });
      } catch (err) {
        // Fallback if device doesn't have rear camera (e.g., laptop)
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 1280 } },
          audio: false,
        });
      }
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setCameraReady(true);
      }
    } catch {
      setError("Tidak dapat mengakses kamera.");
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
    if (checkInterval.current) clearInterval(checkInterval.current);
  }, []);

  useEffect(() => {
    if (isOpen) startCamera();
    else stopCamera();
    return stopCamera;
  }, [isOpen, startCamera, stopCamera]);

  // Auto-capture logic using simple blur detection (Laplacian Variance)
  useEffect(() => {
    if (!cameraReady || frozenFrame || scanning) {
      if (checkInterval.current) clearInterval(checkInterval.current);
      return;
    }

    const checkClarity = () => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      // Draw small version for fast processing
      canvas.width = 100;
      canvas.height = 100;
      ctx.drawImage(video, 0, 0, 100, 100);
      
      const imageData = ctx.getImageData(0, 0, 100, 100);
      const data = imageData.data;
      
      // Grayscale
      const gray = new Uint8Array(100 * 100);
      for (let i = 0; i < data.length; i += 4) {
        gray[i/4] = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
      }
      
      // Laplacian Variance
      let sum = 0, sqSum = 0;
      for (let y = 1; y < 99; y++) {
        for (let x = 1; x < 99; x++) {
          const p = y * 100 + x;
          const v = Math.abs(gray[p - 100] + gray[p - 1] + gray[p + 1] + gray[p + 100] - 4 * gray[p]);
          sum += v;
          sqSum += v * v;
        }
      }
      const n = 98 * 98;
      const mean = sum / n;
      const variance = (sqSum / n) - (mean * mean);

      // If sharp enough, freeze it
      if (variance > 300) { // higher threshold to avoid capturing faces
        handleAutoCapture();
      }
    };

    checkInterval.current = setInterval(checkClarity, 800);
    return () => { if (checkInterval.current) clearInterval(checkInterval.current); };
  }, [cameraReady, frozenFrame, scanning]);

  const handleAutoCapture = async () => {
    if (!videoRef.current) return;
    try {
      const compressed = await captureVideoFrame(videoRef.current);
      setFrozenFrame(compressed);
      setFrozenUrl(`data:image/jpeg;base64,${compressed.base64}`);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleRetake = () => {
    startCamera();
  };

  const handleProcess = async () => {
    if (!frozenFrame || scanning) return;
    setScanning(true);
    setError(null);
    try {
      const result = await scanReceiptImage(frozenFrame.base64, frozenFrame.mimeType, "camera");
      onResult(result);
      onClose();
    } catch (e: any) {
      setError(e.message ?? "Gagal memindai. Coba lagi.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100, backdropFilter: "blur(4px)" }} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, x: "-50%", y: "-50%" }} animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
            exit={{ scale: 0.9, opacity: 0, x: "-50%", y: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              position: "fixed", top: "50%", left: "50%", zIndex: 110,
              background: "#0B1215", borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.08)",
              width: "90%", maxWidth: 400, display: "flex", flexDirection: "column", overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Camera size={16} color="#4FD1C5" />
                <span style={{ fontSize: 15, fontWeight: 700, color: "#F5F7FA" }}>Scan Struk</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {!frozenFrame && (
                  <button onClick={() => setFacingMode(f => f === "environment" ? "user" : "environment")}
                    style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: 8, cursor: "pointer" }}>
                    <RotateCcw size={15} color="#AAB7C2" />
                  </button>
                )}
                <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: 8, cursor: "pointer" }}>
                  <X size={15} color="#AAB7C2" />
                </button>
              </div>
            </div>

            {/* Hidden canvas for blur detection */}
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* Camera / Frozen view */}
            <div style={{ position: "relative", width: "100%", aspectRatio: "4/5", background: "#000", overflow: "hidden" }}>
              {!frozenFrame ? (
                <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <img src={frozenUrl!} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Frozen receipt" />
              )}

              {/* Scan frame */}
              {cameraReady && !frozenFrame && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                  <div style={{ position: "relative", width: "75%", height: "65%", border: "2px solid rgba(79,209,197,0.4)", borderRadius: 12 }}>
                    {/* Dim outside */}
                    <div style={{ position: "absolute", inset: "-500px", border: "500px solid rgba(0,0,0,0.5)", borderRadius: 512 }} />
                    <p style={{ position: "absolute", top: -30, left: 0, right: 0, textAlign: "center", color: "#F5F7FA", fontSize: 12, fontWeight: 500, textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>Posisikan struk dalam kotak</p>
                  </div>
                </div>
              )}

              {/* Scanning overlay */}
              {scanning && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(11,18,21,0.8)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}
                    style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(79,209,197,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Logo size={24} />
                  </motion.div>
                  <p style={{ fontSize: 14, color: "#4FD1C5", fontWeight: 600 }}>AI sedang membaca struk...</p>
                </div>
              )}

              {error && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(0,0,0,0.6)" }}>
                  <div style={{ background: "rgba(232,137,137,0.1)", border: "1px solid rgba(232,137,137,0.3)", borderRadius: 16, padding: "16px 20px", textAlign: "center" }}>
                    <p style={{ fontSize: 14, color: "#E88989" }}>{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ padding: "16px 20px" }}>
              {!frozenFrame ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <button onClick={handleAutoCapture} disabled={scanning}
                    style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "#4FD1C5", color: "#0B1215", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <Camera size={16} strokeWidth={2.5} /> Ambil Foto
                  </button>
                  <p style={{ fontSize: 12, color: "#748391", textAlign: "center", margin: 0 }}>
                    Atau tunggu AI menangkap otomatis saat gambar sangat jelas.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={handleRetake} disabled={scanning}
                    style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#AAB7C2", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <RefreshCcw size={16} /> Ulangi
                  </button>
                  <button onClick={handleProcess} disabled={scanning}
                    style={{ flex: 1.5, padding: "12px", borderRadius: 12, border: "none", background: "#4FD1C5", color: "#0B1215", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <Check size={16} strokeWidth={2.5} /> Proses AI
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
