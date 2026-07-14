import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Tesseract from "tesseract.js";
import { Upload, Camera, Trash2, ScanLine, CheckCircle2, Loader2, X, Aperture } from "lucide-react";
import { uploadReceipt } from "../api/api";
import { parseReceiptText } from "../utils/ocrParser";
import { CATEGORIES } from "../utils/categories";
import "./UploadReceipt.css";

const emptyForm = {
  storeName: "",
  amount: "",
  tax: "",
  date: "",
  category: "Others",
};

export default function UploadReceipt() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [ocrRunning, setOcrRunning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [rawText, setRawText] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [extracted, setExtracted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const openCamera = async () => {
    setCameraError("");
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      setCameraError(
        "Couldn't access the camera. Make sure you've allowed camera permission in the browser, and that no other app is using it."
      );
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
    setCameraError("");
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `receipt-${Date.now()}.jpg`, { type: "image/jpeg" });
        handleFileChosen(file);
        closeCamera();
      },
      "image/jpeg",
      0.92
    );
  };

  // Stop the camera stream if the component unmounts while it's open
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleFileChosen = (file) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setExtracted(false);
    setForm(emptyForm);
    setRawText("");
    setError("");
  };

  const handleDelete = () => {
    setImageFile(null);
    setImagePreview(null);
    setExtracted(false);
    setForm(emptyForm);
    setRawText("");
    setOcrProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const runOCR = async () => {
    if (!imageFile) return;
    setOcrRunning(true);
    setOcrProgress(0);
    setError("");
    try {
      const result = await Tesseract.recognize(imageFile, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      const text = result.data.text || "";
      setRawText(text);

      const parsed = parseReceiptText(text);
      setForm({
        storeName: parsed.storeName,
        amount: parsed.amount ? String(parsed.amount) : "",
        tax: parsed.tax ? String(parsed.tax) : "",
        date: parsed.date,
        category: parsed.category,
      });
      setExtracted(true);
    } catch (err) {
      console.error(err);
      setError("OCR failed to process this image. Try a clearer photo, or enter details manually below.");
      setExtracted(true); // allow manual entry anyway
      setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) });
    } finally {
      setOcrRunning(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setError("Please upload or capture a receipt image first.");
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("image", imageFile);
      fd.append("storeName", form.storeName || "Unknown Store");
      fd.append("amount", form.amount);
      fd.append("tax", form.tax || 0);
      fd.append("date", form.date || new Date().toISOString().slice(0, 10));
      fd.append("category", form.category);
      fd.append("description", form.storeName || "Receipt expense");
      fd.append("rawText", rawText);

      const res = await uploadReceipt(fd);
      navigate(`/expenses/${res.data.expense._id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save receipt. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Upload Receipt</h1>
          <p>Upload or capture a receipt — we'll extract the details automatically.</p>
        </div>
      </div>

      {error && <div className="card error-banner">{error}</div>}

      <div className="upload-grid">
        <div className="card">
          <h3 className="section-title">1. Receipt Image</h3>

          {!imagePreview && (
            <div className="dropzone">
              <ScanLine size={34} className="dropzone-icon" />
              <p className="dropzone-title">Add a receipt image</p>
              <p className="dropzone-sub">JPG, PNG — up to 8MB</p>
              <div className="dropzone-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={16} />
                  Upload Image
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={openCamera}
                >
                  <Camera size={16} />
                  Use Camera
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleFileChosen(e.target.files?.[0])}
              />
            </div>
          )}

          {cameraOpen && (
            <div className="camera-modal-overlay" onClick={closeCamera}>
              <div className="camera-modal" onClick={(e) => e.stopPropagation()}>
                <div className="camera-modal-header">
                  <h3>Capture Receipt</h3>
                  <button type="button" className="camera-close-btn" onClick={closeCamera}>
                    <X size={18} />
                  </button>
                </div>

                {cameraError ? (
                  <div className="camera-error">{cameraError}</div>
                ) : (
                  <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
                )}

                <div className="camera-modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={closeCamera}>
                    Cancel
                  </button>
                  {!cameraError && (
                    <button type="button" className="btn btn-primary" onClick={capturePhoto}>
                      <Aperture size={16} />
                      Capture
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {imagePreview && (
            <div className="preview-block">
              <div className="preview-image-wrap">
                <img src={imagePreview} alt="Receipt preview" />
                <button type="button" className="preview-delete" onClick={handleDelete} title="Delete receipt">
                  <Trash2 size={16} />
                </button>
              </div>

              {!extracted && (
                <button
                  type="button"
                  className="btn btn-primary full-width"
                  onClick={runOCR}
                  disabled={ocrRunning}
                >
                  {ocrRunning ? (
                    <>
                      <Loader2 size={16} className="spin-icon" />
                      Reading receipt… {ocrProgress}%
                    </>
                  ) : (
                    <>
                      <ScanLine size={16} />
                      Extract Details (OCR)
                    </>
                  )}
                </button>
              )}

              {extracted && (
                <div className="ocr-done-badge">
                  <CheckCircle2 size={16} />
                  Text extracted — review the details
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="section-title">2. Review &amp; Edit Details</h3>

          {!extracted && (
            <div className="empty-state small">
              <p>Extracted details will appear here after OCR processing.</p>
            </div>
          )}

          {extracted && (
            <form onSubmit={handleSubmit} className="receipt-form">
              <div>
                <label className="field-label">Store Name</label>
                <input
                  className="input"
                  name="storeName"
                  value={form.storeName}
                  onChange={handleChange}
                  placeholder="e.g. Green Leaf Cafe"
                />
              </div>

              <div className="form-row">
                <div>
                  <label className="field-label">Amount (₹)</label>
                  <input
                    className="input"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="field-label">Tax (₹)</label>
                  <input
                    className="input"
                    name="tax"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.tax}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label className="field-label">Date</label>
                  <input
                    className="input"
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="field-label">Category</label>
                  <select
                    className="input select"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {rawText && (
                <details className="raw-text-block">
                  <summary>View raw OCR text</summary>
                  <pre>{rawText}</pre>
                </details>
              )}

              <button type="submit" className="btn btn-primary full-width" disabled={saving}>
                {saving ? <span className="spinner" /> : "Save Expense"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}