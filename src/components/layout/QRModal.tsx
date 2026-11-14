import { useState, useEffect, type FC } from 'react';
import { X, Check, Copy, Share2, Smartphone, Download, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  publicUrl?: string;
}

export const QRModal: FC<QRModalProps> = ({ isOpen, onClose, name, publicUrl }) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(true);

  const finalUrl =
    publicUrl ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://minhquan.space');

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsGenerating(true);

    QRCode.toDataURL(finalUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1e1c1a',
        light: '#ffffff',
      },
    })
      .then((url: string) => {
        if (isMounted) {
          setQrDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((err: unknown) => {
        console.error('Lỗi tạo mã QR:', err);
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, finalUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(finalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} • Danh thiếp số`,
          text: `Ghé thăm góc nhỏ cá nhân của ${name}!`,
          url: finalUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qr-${name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'card'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Mã QR chia sẻ"
    >
      <div
        className="relative max-w-sm w-full bg-paper-50 dark:bg-paper-darkSurface rounded-3xl p-6 shadow-2xl border border-ink-border dark:border-paper-darkBorder text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-paper-200/80 dark:bg-paper-dark border border-ink-border/60 text-ink dark:text-gray-300 hover:bg-paper-300 transition-all"
          aria-label="Đóng"
        >
          <X size={16} />
        </button>

        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-clay-light dark:bg-clay/20 text-clay flex items-center justify-center">
          <Smartphone size={24} />
        </div>

        <h3 className="font-serif font-bold text-xl text-ink dark:text-gray-100">
          Chia Sẻ Danh Thiếp
        </h3>
        <p className="text-xs text-ink-muted dark:text-gray-400 mt-1 mb-4">
          Quét camera điện thoại để mở nhanh trang cá nhân của mình
        </p>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-2xl inline-block shadow-inner border border-ink-border/50 mb-3">
          {isGenerating ? (
            <div className="w-44 h-44 flex items-center justify-center text-ink-subtle">
              <Loader2 size={24} className="animate-spin text-clay" />
            </div>
          ) : qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`Mã QR của ${name}`}
              className="w-44 h-44 mx-auto block rounded-lg"
            />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center text-xs text-red-500">
              Không thể tải QR
            </div>
          )}
          <div className="mt-2 text-[10px] font-mono text-ink-subtle uppercase tracking-wider">
            {name} • Danh thiếp số
          </div>
        </div>

        {/* Download QR Button */}
        <div className="mb-4">
          <button
            onClick={handleDownloadQR}
            disabled={!qrDataUrl || isGenerating}
            className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-paper-200 dark:bg-stone-800 hover:bg-paper-300 dark:hover:bg-stone-700 text-xs font-mono text-ink-muted dark:text-gray-200 border border-ink-border/60 transition-all disabled:opacity-50"
          >
            <Download size={13} />
            <span>Tải mã QR (PNG)</span>
          </button>
        </div>

        {/* Fixed Link Display & Copy */}
        <div className="p-2 px-3 mb-4 rounded-xl bg-paper-100 dark:bg-stone-900 border border-ink-border/50 flex items-center justify-between gap-2 text-left">
          <span className="text-[11px] font-mono text-ink-subtle dark:text-gray-400 truncate flex-1">
            {finalUrl}
          </span>
          <button
            onClick={handleCopy}
            className="p-1 text-ink-muted hover:text-clay dark:text-gray-300 transition-colors"
            title="Sao chép"
          >
            {copied ? <Check size={14} className="text-sage" /> : <Copy size={14} />}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-paper-200 dark:bg-stone-800 text-ink dark:text-gray-200 text-xs font-medium border border-ink-border/60 hover:bg-paper-300 transition-all active:scale-95"
          >
            {copied ? (
              <>
                <Check size={14} className="text-sage" />
                <span>Đã sao chép!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Sao chép link</span>
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-clay text-white text-xs font-medium shadow-clay hover:brightness-105 transition-all active:scale-95"
          >
            <Share2 size={14} />
            <span>Gửi bạn bè</span>
          </button>
        </div>
      </div>
    </div>
  );
};
