"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, Suspense } from 'react';

function PaymentConsultationErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get('order_id');
  const [appointment, setAppointment] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetry = 15; // 15x2 detik = 30 detik
  const retryTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchAppointment = async () => {
    if (!orderId) return;
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/appointment?order_id=${orderId}`);
      if (!res.ok) throw new Error('Appointment tidak ditemukan');
      const data = await res.json();
      setAppointment(data);
      // Jika data belum ada, retry
      if (!(data.status) && !(data.payment_status) && retryCount < maxRetry) {
        retryTimeout.current = setTimeout(() => setRetryCount(c => c + 1), 2000);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setFetchError(errorMessage);
      if (retryCount < maxRetry) {
        retryTimeout.current = setTimeout(() => setRetryCount(c => c + 1), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId && retryCount < maxRetry && (!appointment || !((appointment as any).status) && !((appointment as any).payment_status))) {
      fetchAppointment();
    }
    return () => {
      if (retryTimeout.current) clearTimeout(retryTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, retryCount]);

  const handleTryAgain = () => {
    if (orderId) {
      router.push(`/pembayaranKonsultasi?order_id=${orderId}`);
    } else {
      router.push('/konsultasi');
    }
  };

  const handleBackToConsultation = () => {
    router.push('/konsultasi');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>

          {loading || (retryCount > 0 && retryCount < maxRetry && (!appointment || !((appointment as any).status) && !((appointment as any).payment_status))) ? (
            <p className="text-blue-600 mb-4">Sedang memproses appointment Anda, mohon tunggu beberapa detik...</p>
          ) : fetchError ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Terjadi Kesalahan</h1>
              <p className="text-gray-600 mb-6">{fetchError}</p>
            </>
          ) : appointment ? (
            (appointment as any).payment_status === 'pending' || (appointment as any).status === 'pending' || (!(appointment as any).status && !(appointment as any).payment_status) ? (
              <>
                <h1 className="text-2xl font-bold text-yellow-700 mb-4">Appointment Berhasil Dibuat</h1>
                <p className="text-gray-600 mb-6">Appointment Anda berhasil dibuat dan menunggu pembayaran. Silakan selesaikan pembayaran sesuai instruksi.</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600">Order ID: {orderId}</p>
                  <p className="text-sm text-gray-600">Status appointment: {(appointment as any).status || 'Belum dibayar'}, pembayaran: {(appointment as any).payment_status || 'Belum dibayar'}</p>
                </div>
              </>
            ) : (appointment as any).payment_status === 'failed' || (appointment as any).status === 'cancelled' ? (
              <>
                <h1 className="text-2xl font-bold text-red-600 mb-4">Pembayaran Gagal / Dibatalkan</h1>
                <p className="text-gray-600 mb-6">Pembayaran konsultasi Anda gagal atau dibatalkan. Silakan lakukan appointment ulang.</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600">Order ID: {orderId}</p>
                  <p className="text-sm text-gray-600">Status appointment: {(appointment as any).status || 'Tidak ditemukan'}, pembayaran: {(appointment as any).payment_status || 'Tidak ditemukan'}</p>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-green-700 mb-4">Status Appointment</h1>
                <p className="text-gray-600 mb-6">Status appointment: {(appointment as any).status || 'Belum dibayar'}, pembayaran: {(appointment as any).payment_status || 'Belum dibayar'}</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600">Order ID: {orderId}</p>
                </div>
              </>
            )
          ) : (
            <>
              <h1 className="text-2xl font-bold text-yellow-700 mb-4">Appointment Berhasil Dibuat</h1>
              <p className="text-gray-600 mb-6">Appointment Anda berhasil dibuat dan menunggu pembayaran. Silakan selesaikan pembayaran sesuai instruksi.</p>
              {orderId && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600">Order ID: {orderId}</p>
                </div>
              )}
            </>
          )}

          <div className="space-y-3">
            <button
              onClick={handleTryAgain}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Coba Lagi
            </button>

            <button
              onClick={handleBackToConsultation}
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition duration-200"
            >
              Kembali ke Konsultasi
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Jika masalah berlanjut, silakan hubungi admin kami.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentConsultationErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    }>
      <PaymentConsultationErrorContent />
    </Suspense>
  );
} 