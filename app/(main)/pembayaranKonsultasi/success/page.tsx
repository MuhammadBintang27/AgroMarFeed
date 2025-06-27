"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

// Define appointment type
interface AppointmentDetails {
  _id: string;
  orderId: string;
  status: string;
  payment_status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: string;
  createdAt: string;
  totalAmount: number;
}

function PaymentConsultationSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const [appointmentDetails, setAppointmentDetails] =
    useState<AppointmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Cek apakah order_id di query param adalah format ORDER-...
    const queryOrderId = searchParams.get("order_id");
    if (queryOrderId && queryOrderId.startsWith("ORDER-")) {
      setOrderId(queryOrderId);
    } else {
      // Ambil dari localStorage
      const localOrderId = localStorage.getItem("last_appointment_order_id");
      if (localOrderId) setOrderId(localOrderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (orderId) {
      fetchAppointmentDetails(orderId);
      // Hapus dari localStorage setelah digunakan
      localStorage.removeItem("last_appointment_order_id");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchAppointmentDetails = async (oid: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/appointment?order_id=${oid}`);
      if (response.ok) {
        const data = await response.json();
        setAppointmentDetails(data);
      } else {
        setError("Appointment tidak ditemukan.");
      }
    } catch (err: unknown) {
      console.error('Error fetching appointment details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.push("/konsultasi");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Memproses pembayaran konsultasi...
          </p>
        </div>
      </div>
    );
  }

  let statusTitle = "";
  let statusDesc = "";
  let statusIcon = null;
  let statusColor = "";

  // Get transaction status from URL params
  const transactionStatus = searchParams.get('transaction_status');
  const statusCode = searchParams.get('status_code');

  if (error) {
    statusTitle = "Pemesanan Konsultasi Berhasil Dibuat!";
    statusDesc = "Terima kasih telah melakukan pemesanan konsultasi. Silakan selesaikan pembayaran sesuai instruksi yang telah dikirim.";
    statusIcon = (
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
        <svg
          className="h-8 w-8 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    );
    statusColor = "text-blue-600";
  } else if (
    appointmentDetails?.payment_status === "paid" ||
    appointmentDetails?.status === "processing" ||
    transactionStatus === "settlement" ||
    transactionStatus === "capture"
  ) {
    statusTitle = "Pembayaran Konsultasi Berhasil!";
    statusDesc =
      "Terima kasih telah melakukan pembayaran konsultasi. Appointment Anda telah berhasil diproses.";
    statusIcon = (
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
        <svg
          className="h-8 w-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
      </div>
    );
    statusColor = "text-green-600";
  } else if (
    appointmentDetails?.payment_status === "pending" ||
    transactionStatus === "pending"
  ) {
    statusTitle = "Menunggu Pembayaran";
    statusDesc =
      "Appointment Anda masih menunggu pembayaran. Silakan selesaikan pembayaran sesuai instruksi.";
    statusIcon = (
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
        <svg
          className="h-8 w-8 text-yellow-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      </div>
    );
    statusColor = "text-yellow-600";
  } else if (
    appointmentDetails?.payment_status === "failed" ||
    appointmentDetails?.status === "cancelled" ||
    transactionStatus === "cancel" ||
    transactionStatus === "deny" ||
    transactionStatus === "expire"
  ) {
    statusTitle = "Pembayaran Gagal / Dibatalkan";
    statusDesc =
      "Pembayaran konsultasi Anda gagal atau dibatalkan. Silakan lakukan appointment ulang.";
    statusIcon = (
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
        <svg
          className="h-8 w-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
    );
    statusColor = "text-red-600";
  } else {
    // Default case - appointment created but payment status unknown
    statusTitle = "Pemesanan Konsultasi Berhasil Dibuat!";
    statusDesc = "Terima kasih telah melakukan pemesanan konsultasi. Silakan selesaikan pembayaran sesuai instruksi yang telah dikirim.";
    statusIcon = (
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
        <svg
          className="h-8 w-8 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    );
    statusColor = "text-blue-600";
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {statusIcon}
          <h1 className={`text-2xl font-bold mb-4 ${statusColor}`}>
            {statusTitle}
          </h1>
          <p className="text-gray-600 mb-6">{statusDesc}</p>

          {appointmentDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Detail Appointment:
              </h3>
              <p className="text-sm text-gray-600">
                Order ID: {appointmentDetails.orderId}
              </p>
              <p className="text-sm text-gray-600">
                Total: Rp {appointmentDetails.totalAmount?.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                Status: {appointmentDetails.status}
              </p>
              <p className="text-sm text-gray-600">
                Pembayaran: {appointmentDetails.payment_status}
              </p>
              {appointmentDetails.service && (
                <p className="text-sm text-gray-600">
                  Layanan: {appointmentDetails.service}
                </p>
              )}
              {transactionStatus && (
                <p className="text-sm text-gray-600">
                  Status Midtrans: {transactionStatus}
                </p>
              )}
            </div>
          )}

          {!appointmentDetails && orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Informasi Pemesanan:
              </h3>
              <p className="text-sm text-gray-600">
                Order ID: {orderId}
              </p>
              {transactionStatus && (
                <p className="text-sm text-gray-600">
                  Status Pembayaran: {transactionStatus}
                </p>
              )}
              <p className="text-sm text-gray-600">
                Pemesanan konsultasi Anda telah berhasil dibuat dan sedang menunggu pembayaran.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {transactionStatus === 'pending' && (
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 transition duration-200"
              >
                Refresh Status Pembayaran
              </button>
            )}
            
            <button
              onClick={handleContinue}
              className={`w-full py-3 px-4 rounded-lg transition duration-200 ${
                transactionStatus === 'pending' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {transactionStatus === 'pending' 
                ? 'Lihat Instruksi Pembayaran' 
                : 'Lanjutkan ke Konsultasi'
              }
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Email konfirmasi telah dikirim ke{" "}
            {user?.email || "email Anda"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentConsultationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    }>
      <PaymentConsultationSuccessContent />
    </Suspense>
  );
}
