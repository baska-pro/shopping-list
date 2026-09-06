import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import Button from './Button';
import ConfirmModal from './ConfirmModal';

interface DownloadImageButtonProps {
  targetRef: React.RefObject<HTMLElement>;
  filename: string;
  children: React.ReactNode;
}

const DownloadImageButton: React.FC<DownloadImageButtonProps> = ({ targetRef, filename, children }) => {
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const downloadImage = async () => {
    if (targetRef.current) {
      try {
        const canvas = await html2canvas(targetRef.current, {
          scale: 2, // Increase resolution for better image quality
          useCORS: true,
          backgroundColor: '#ffffff'
        });

        // Convert to Blob instead of Data URL (better for large images and browser support)
        canvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } else {
                setErrorModal('Gagal memproses gambar. Format data tidak dapat dibuat.');
            }
        }, 'image/png');

      } catch (error) {
        console.error('Error generating image:', error);
        setErrorModal('Gagal mengunduh gambar daftar belanja. Silakan coba lagi.');
      }
    } else {
      setErrorModal('Elemen daftar tidak ditemukan untuk diunduh.');
    }
  };

  return (
    <>
      <Button onClick={downloadImage} variant="outline" className="w-full">
        {children}
      </Button>

      {errorModal && (
        <ConfirmModal
          isOpen={true}
          title="Unduh Gambar"
          message={errorModal}
          variant="danger"
          icon="⚠️"
          confirmText="Tutup"
          onConfirm={() => setErrorModal(null)}
          onCancel={() => setErrorModal(null)}
        />
      )}
    </>
  );
};

export default DownloadImageButton;