"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, User, Mail, Phone } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { PageLoading, ButtonLoading } from "@/components/ui/loading";

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
  total_harga: number;
  snap_redirect_url?: string;
  payment_url?: string;
  zoom_link?: string;
}

const BookingPageContent = () => {
  const router = useRouter();
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [konsultan, setKonsultan] = useState<any>(null);
  const [loadingKonsultan, setLoadingKonsultan] = useState(true);
  const { user } = useUser();

  // Add form state
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    email: "",
    no_hp: "",
  });
  // Error state for validation
  const [formErrors, setFormErrors] = useState({
    nama_lengkap: "",
    email: "",
    no_hp: "",
  });

  // Add loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tambahan untuk appointment detail jika ada order_id
  const [appointmentDetails, setAppointmentDetails] =
    useState<AppointmentDetails | null>(null);
  const [appointmentLoading, setAppointmentLoading] = useState(false);
  const orderId = searchParams.get("order_id");

  // Check for Midtrans redirect parameters
  const transactionStatus = searchParams.get("transaction_status");
  const orderIdFromMidtrans = searchParams.get("order_id");
  const finalOrderId = orderId || orderIdFromMidtrans;

  // Jika ada order_id, fetch detail appointment
  useEffect(() => {
    if (finalOrderId) {
      setAppointmentLoading(true);
      fetchAppointmentDetails(finalOrderId)
        .then((data) => {
          console.log("Appointment data received:", data);
          if (data) {
            setAppointmentDetails(data);
          } else {
            console.error("No appointment data received");
            setAppointmentDetails(null);
          }
        })
        .catch((error) => {
          console.error("Error fetching appointment:", error);
          setAppointmentDetails(null);
        })
        .finally(() => setAppointmentLoading(false));
    }
  }, [finalOrderId]);

  const fetchAppointmentDetails = async (oid: string) => {
    try {
      const response = await fetch(`/api/appointment?order_id=${oid}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error("Failed to fetch appointment details");
        return null;
      }
    } catch (error) {
      console.error("Error fetching appointment details:", error);
      return null;
    }
  };

  // Add form handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Validation
    if (name === "nama_lengkap") {
      if (!/^[A-Za-z\s]{2,}$/.test(value)) {
        setFormErrors((prev) => ({
          ...prev,
          nama_lengkap: "Nama hanya boleh huruf dan minimal 2 karakter.",
        }));
      } else {
        setFormErrors((prev) => ({ ...prev, nama_lengkap: "" }));
      }
    }
    if (name === "email") {
      if (!/^\S+@\S+\.\S+$/.test(value)) {
        setFormErrors((prev) => ({
          ...prev,
          email: "Format email tidak valid.",
        }));
      } else {
        setFormErrors((prev) => ({ ...prev, email: "" }));
      }
    }
    if (name === "no_hp") {
      // Hanya angka, diawali 0 atau +, minimal 9 digit, maksimal 15 digit
      const phone = value.trim();
      if (!/^([0]|\+)[0-9]{8,14}$/.test(phone)) {
        setFormErrors((prev) => ({
          ...prev,
          no_hp: "No. telepon harus angka, diawali 0 atau +, 9-15 digit.",
        }));
      } else {
        setFormErrors((prev) => ({ ...prev, no_hp: "" }));
      }
    }
  };

  // Add validation check
  const isFormValid = () => {
    return (
      formData.nama_lengkap &&
      formData.email &&
      formData.no_hp &&
      selectedDate &&
      selectedTime &&
      !formErrors.nama_lengkap &&
      !formErrors.email &&
      !formErrors.no_hp
    );
  };

  // Update the confirmation handler to include booking details
  const handleConfirmBooking = async () => {
    if (!isFormValid() || isSubmitting) return;
    if (!user || !user._id) {
      alert("Silakan login terlebih dahulu");
      return;
    }
    setIsSubmitting(true);
    try {
      // Find selected slot's jam_mulai & jam_berakhir
      let jam_mulai = null,
        jam_berakhir = null;
      if (selectedTime) {
        const [mulai, akhir] = selectedTime.split(" - ");
        jam_mulai = mulai;
        jam_berakhir = akhir;
      }
      const appointmentPayload = {
        user_id: user._id,
        nama_lengkap: formData.nama_lengkap,
        email: formData.email,
        no_hp: formData.no_hp,
        konsultan_id: konsultan?._id,
        tanggal_konsultasi: selectedDate?.toISOString(),
        jadwal: { jam_mulai, jam_berakhir },
        total_harga: konsultan?.price || 0,
        metode_pembayaran: "midtrans",
      };
      console.log("Appointment payload:", appointmentPayload);

      // Step 1: Create appointment
      const res = await fetch("/api/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentPayload),
      });

      const data = await res.json();

      console.log("Appointment response:", data);

      if (res.ok && data._id) {
        // Step 2: Create payment for konsultasi
        const appointmentId = data._id;
        const productId = konsultan?._id || "";
        const name = konsultan?.nama
          ? `Konsultasi: ${konsultan.nama}`
          : "Konsultasi";
        const price =
          typeof konsultan?.price === "number" ? konsultan.price : 0;
        const quantity = 1;
        const description =
          konsultan?.nama && selectedDate && jam_mulai && jam_berakhir
            ? `Konsultasi dengan ${
                konsultan.nama
              } pada ${selectedDate.toLocaleDateString(
                "id-ID"
              )} jam ${jam_mulai}-${jam_berakhir}`
            : "Konsultasi";
        const customerName = formData.nama_lengkap || "User";
        const customerEmail = formData.email || "user@email.com";
        const customerPhone = formData.no_hp || "0000000000";
        const userId = user._id || "";

        const paymentData = {
          appointmentId,
          items: [
            {
              productId,
              name,
              price,
              quantity,
              description,
            },
          ],
          customerDetails: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            userId,
          },
        };
        // Validasi payload payment
        if (!paymentData.appointmentId) {
          alert("Gagal membuat appointmentId untuk pembayaran.");
          return;
        }
        if (
          !paymentData.items ||
          !Array.isArray(paymentData.items) ||
          paymentData.items.length === 0
        ) {
          alert("Data item pembayaran konsultasi kosong.");
          return;
        }
        if (
          !paymentData.customerDetails ||
          !paymentData.customerDetails.name ||
          !paymentData.customerDetails.email ||
          !paymentData.customerDetails.phone
        ) {
          alert("Data customer pembayaran konsultasi tidak lengkap.");
          return;
        }
        console.log("Payment payload:", paymentData);
        const paymentRes = await fetch("/api/payment/consultation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentData),
        });
        const paymentResult = await paymentRes.json();
        console.log("Payment response:", paymentResult);
        if (paymentRes.ok && paymentResult.redirect_url) {
          if (data.orderId) {
            localStorage.setItem("last_appointment_order_id", data.orderId);
          }
          window.location.href = paymentResult.redirect_url;
        } else {
          alert(
            paymentResult.message ||
              JSON.stringify(paymentResult) ||
              "Gagal membuat pembayaran konsultasi"
          );
        }
      } else {
        alert(
          data.message || JSON.stringify(data) || "Gagal membuat appointment"
        );
      }
    } catch (error) {
      console.error("Error submitting appointment:", error);
      alert(
        "There was an error processing your booking. Please try again.\n" +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch konsultan by id (slug)
  useEffect(() => {
    if (!slug) return;
    const fetchKonsultan = async () => {
      setLoadingKonsultan(true);
      try {
        const res = await fetch(`/api/konsultan?id=${slug}`);
        const data = await res.json();
        setKonsultan(data);
      } catch (err) {
        setKonsultan(null);
      } finally {
        setLoadingKonsultan(false);
      }
    };
    fetchKonsultan();
  }, [slug]);

  // Generate time slots from konsultan.jadwal
  function generateTimeSlots(
    jadwal: { jam_mulai: string; jam_berakhir: string }[] = []
  ) {
    const slots: string[] = [];
    for (const j of jadwal) {
      let [startHour, startMin] = j.jam_mulai.split(":").map(Number);
      let [endHour, endMin] = j.jam_berakhir.split(":").map(Number);
      let current = new Date(0, 0, 0, startHour, startMin);
      const end = new Date(0, 0, 0, endHour, endMin);
      while (current < end) {
        const next = new Date(current.getTime() + 60 * 60 * 1000); // +1 hour
        if (next > end) break;
        const pad = (n: number) => n.toString().padStart(2, "0");
        slots.push(
          `${pad(current.getHours())}:${pad(current.getMinutes())} - ${pad(
            next.getHours()
          )}:${pad(next.getMinutes())}`
        );
        current = next;
      }
    }
    return slots;
  }

  const timeSlots = konsultan ? generateTimeSlots(konsultan.jadwal) : [];

  // Function to get month name
  const getMonthName = (date: Date) => {
    return date.toLocaleString("id-ID", { month: "long", year: "numeric" });
  };

  // Function to get days in month including empty spaces for correct day alignment
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Adjust first day to start from Monday (1) instead of Sunday (0)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    // Create array for empty spaces
    const days = Array(adjustedFirstDay).fill(null);

    // Add actual dates
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  // Function to check if date is in the past
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Functions to change month
  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const handleNextStep = () => {
    if (selectedDate && selectedTime) {
      setCurrentStep(2);
      // Scroll to detail section smoothly
      document
        .getElementById("detail-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Render jika ada order_id (mode instruksi pembayaran)
  if (finalOrderId) {
    if (appointmentLoading) {
      return <PageLoading text="Memuat detail appointment..." />;
    }
    if (!appointmentDetails) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500">Appointment tidak ditemukan.</p>
            <button
              onClick={() => router.push("/konsultasi")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Kembali ke Konsultasi
            </button>
          </div>
        </div>
      );
    }

    // Handle Midtrans redirect status
    let statusMessage = "";
    let statusColor = "";
    let statusIcon = null;

    if (transactionStatus === "capture" || transactionStatus === "settlement") {
      statusMessage = "Pembayaran Konsultasi Berhasil!";
      statusColor = "text-green-600";
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
    } else if (transactionStatus === "pending") {
      statusMessage = "Menunggu Pembayaran Konsultasi";
      statusColor = "text-yellow-600";
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
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      statusMessage = "Pembayaran Konsultasi Gagal";
      statusColor = "text-red-600";
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
            ></path>
          </svg>
        </div>
      );
    }

    // Cek tipe ID
    const isOrder = appointmentDetails.orderId?.startsWith("ORDER-");
    const isConsultation =
      appointmentDetails.orderId?.startsWith("KONSULTASI-");

    // Jika sudah dibayar (paid/settlement)
    if (
      appointmentDetails.payment_status === "paid" ||
      transactionStatus === "settlement"
    ) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Pembayaran Konsultasi Sudah Diterima
            </h1>
            <p className="text-gray-600 mb-6">
              Terima kasih, appointment Anda sudah dibayar dan sedang diproses.
            </p>
            {/* Detail Appointment */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">
                Detail Appointment:
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium text-gray-900">
                    {appointmentDetails.orderId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium text-gray-900">
                    Rp {appointmentDetails.total_harga?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-gray-900">
                    {appointmentDetails.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pembayaran:</span>
                  <span className="font-medium text-gray-900">
                    {appointmentDetails.payment_status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Layanan:</span>
                  <span className="font-medium text-gray-900">
                    {appointmentDetails.service}
                  </span>
                </div>
                {appointmentDetails.zoom_link && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Link Zoom:</span>
                    <a
                      href={appointmentDetails.zoom_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 underline break-all"
                    >
                      {appointmentDetails.zoom_link}
                    </a>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => router.push("/riwayatBelanja")}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition duration-200 mb-2"
            >
              Lihat Riwayat Pesanan
            </button>
            <button
              onClick={() => router.push("/konsultasi")}
              className="w-full bg-gray-300 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-400 transition duration-200"
            >
              Kembali ke Konsultasi
            </button>
          </div>
        </div>
      );
    }
    // Jika masih pending
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          {statusIcon}
          <h1
            className={`text-2xl font-bold mb-4 ${
              statusColor || "text-gray-900"
            }`}
          >
            {statusMessage || "Menunggu Pembayaran Konsultasi"}
          </h1>
          <p className="text-gray-600 mb-6">
            {transactionStatus === "pending"
              ? "Silakan selesaikan pembayaran konsultasi Anda sesuai instruksi berikut:"
              : "Status pembayaran konsultasi Anda saat ini:"}
          </p>
          {/* Detail Appointment */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">
              Detail Appointment:
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium text-gray-900">
                  {appointmentDetails.orderId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium text-gray-900">
                  Rp {appointmentDetails.total_harga?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-gray-900">
                  {appointmentDetails.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pembayaran:</span>
                <span className="font-medium text-gray-900">
                  {appointmentDetails.payment_status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Layanan:</span>
                <span className="font-medium text-gray-900">
                  {appointmentDetails.service}
                </span>
              </div>
              {appointmentDetails.zoom_link && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Link Zoom:</span>
                  <a
                    href={appointmentDetails.zoom_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 underline break-all"
                  >
                    {appointmentDetails.zoom_link}
                  </a>
                </div>
              )}
              {transactionStatus && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Status Midtrans:</span>
                  <span className="font-medium text-gray-900">
                    {transactionStatus}
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 mb-2"
          >
            Refresh Status Pembayaran
          </button>
          {/* Tombol Bayar Sekarang di Midtrans */}
          {appointmentDetails.payment_status === "pending" &&
            appointmentDetails.snap_redirect_url && (
              <div className="mb-2">
                <button
                  onClick={() =>
                    (window.location.href =
                      appointmentDetails.snap_redirect_url ?? "")
                  }
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-200"
                >
                  Dapatkan Kode Pembayaran Kembali
                </button>
              </div>
            )}
          <button
            onClick={() => router.push("/riwayatBelanja")}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition duration-200 mb-2"
          >
            Lihat Riwayat Pesanan
          </button>
          <button
            onClick={() => router.push("/konsultasi")}
            className="w-full bg-gray-300 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-400 transition duration-200"
          >
            Kembali ke Konsultasi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 bg-7">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Konsultan Info */}
          {loadingKonsultan ? (
            <div className="text-center mb-8">Loading konsultan...</div>
          ) : konsultan ? (
            <div className="flex items-center gap-4 mb-8 bg-white p-4 rounded-xl shadow">
              {/* Foto profil default berdasarkan jenis_kelamin */}
              <img
                src={
                  konsultan.jenis_kelamin === "P"
                    ? "/images/AgroMarDoc-P.png"
                    : "/images/AgroMarDoc-L.png"
                }
                alt={konsultan.nama}
                className="w-20 h-20 rounded-full object-cover border"
              />
              <div>
                <div className="font-bold text-lg text-black">
                  {konsultan.nama}
                </div>
                <div className="text-black/60 mb-1">{konsultan.profesi}</div>
                <div className="text-black/60 text-sm">
                  {konsultan.description}
                </div>
                <div className="text-black/80 mt-1 font-semibold">
                  Rp {konsultan.price?.toLocaleString("id-ID")}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center mb-8 text-red-500">
              Konsultan tidak ditemukan
            </div>
          )}
          {/* Header with Icon */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-3 text-black">
              Konsultasi Ahli Pakan & Dokter Hewan Langsung
            </h1>
            <p className="text-black text-sm max-w-2xl mx-auto">
            Konsultasi langsung dengan ahli pakan dan dokter hewan untuk solusi
            tepat bagi kebutuhan ternak Anda.
            </p>
          </div>

          {/* Booking Form Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <span
                    className={`w-8 h-8 rounded-full ${
                      currentStep === 1 ? "bg-2 text-white" : "bg-2 text-white"
                    } flex items-center justify-center text-sm`}
                  >
                    1
                  </span>
                  <span className="ml-2 text-sm font-medium text-black">
                    Pilih Jadwal
                  </span>
                </div>
                <div
                  className={`w-16 h-[2px] ${
                    currentStep === 2 ? "bg-2" : "bg-gray-200"
                  } transition-colors duration-300`}
                ></div>
                <div className="flex items-center">
                  <span
                    className={`w-8 h-8 rounded-full ${
                      currentStep === 2
                        ? "bg-2 text-white"
                        : "bg-gray-200 text-gray-600"
                    } transition-colors duration-300 flex items-center justify-center text-sm`}
                  >
                    2
                  </span>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      currentStep === 2 ? "text-black" : "text-gray-500"
                    }`}
                  >
                    Detail Pribadi
                  </span>
                </div>
              </div>
            </div>

            {/* Calendar and Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
              {/* Calendar Section */}
              <div className="border rounded-xl p-6 bg-gray-50">
                <h3 className="text-lg font-semibold mb-4 flex items-center justify-between text-black">
                  <div className="flex flex-wrap items-center w-full gap-2 justify-between">
                    <span className="flex items-center mb-2 md:mb-0">
                      <Calendar className="w-5 h-5 mr-2 text-2 text-black" />
                      Pilih Tanggal
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-normal">
                      <button
                        onClick={prevMonth}
                        className="p-1 hover:bg-gray-200 rounded-full transition-all"
                        style={{ minWidth: 32 }}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <span className="text-sm font-medium min-w-[100px] max-w-[140px] text-center truncate">
                        {getMonthName(currentMonth)}
                      </span>
                      <button
                        onClick={nextMonth}
                        className="p-1 hover:bg-gray-200 rounded-full transition-all"
                        style={{ minWidth: 32 }}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </h3>
                <div className="bg-white rounded-lg p-4">
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(
                      (day) => (
                        <div
                          key={day}
                          className="text-center text-sm font-medium text-gray-500"
                        >
                          {day}
                        </div>
                      )
                    )}
                    {getDaysInMonth().map((date, i) => (
                      <button
                        key={i}
                        disabled={date === null || (date && isPastDate(date))}
                        className={`text-center text-sm rounded-lg transition-all aspect-square w-full flex items-center justify-center
                          ${
                            date === null ? "opacity-0 pointer-events-none" : ""
                          }
                          ${
                            date && isPastDate(date)
                              ? "text-gray-300 cursor-not-allowed"
                              : ""
                          }
                          ${
                            date &&
                            selectedDate?.getDate() === date.getDate() &&
                            selectedDate?.getMonth() === date.getMonth()
                              ? "bg-2 text-white"
                              : date && !isPastDate(date)
                              ? " text-black hover:bg-2/10"
                              : ""
                          }
                        `}
                        onClick={() =>
                          date && !isPastDate(date) && setSelectedDate(date)
                        }
                        style={{ minHeight: 36, minWidth: 36 }}
                      >
                        {date ? date.getDate() : ""}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Time Slots Section */}
              <div className="border rounded-xl p-6 bg-gray-50">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-black">
                  <Clock className="w-5 h-5 mr-2 text-2" />
                  Pilih Waktu
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots.length === 0 && (
                    <div className="col-span-2 text-gray-400">
                      Tidak ada jadwal tersedia
                    </div>
                  )}
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      className={`p-3 rounded-lg text-sm transition-all
                        ${
                          selectedTime === time
                            ? "bg-2 text-white"
                            : "bg-white text-black hover:bg-2/10"
                        }`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Next Step Button */}
            <div className="mt-8 flex justify-end mb-10">
              <button
                className={`bg-2 text-white px-8 py-3 rounded-lg transition-all flex items-center
                  ${
                    !selectedDate || !selectedTime
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:opacity-90"
                  }`}
                onClick={handleNextStep}
                disabled={!selectedDate || !selectedTime}
              >
                <span>Lanjutkan</span>
              </button>
            </div>

            {/* Personal Details Form */}
            <div
              id="detail-section"
              className={`border-t pt-8 transition-opacity duration-300 ${
                currentStep === 2
                  ? "opacity-100"
                  : "opacity-50 pointer-events-none"
              }`}
            >
              <h3 className="text-lg font-semibold mb-6 text-black">
                Detail Pribadi
              </h3>
              <div className="grid md:grid-cols-2 gap-6 text-black">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Nama Lengkap<span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      name="nama_lengkap"
                      value={formData.nama_lengkap}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 h-12 border rounded-lg focus:ring-2 focus:ring-2/20 focus:border-2 transition-all"
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>
                  {formErrors.nama_lengkap && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.nama_lengkap}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Email<span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 h-12 border rounded-lg focus:ring-2 focus:ring-2/20 focus:border-2 transition-all"
                      placeholder="Masukkan email"
                      required
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    No. Telepon<span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="tel"
                      name="no_hp"
                      value={formData.no_hp}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 h-12 border rounded-lg focus:ring-2 focus:ring-2/20 focus:border-2 transition-all"
                      placeholder="Masukkan no. telepon"
                      required
                      inputMode="tel"
                      pattern="^([0]|\+)[0-9]{8,14}$"
                    />
                  </div>
                  {formErrors.no_hp && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.no_hp}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8 flex justify-end">
                <button
                  className={`bg-2 text-white px-8 py-3 rounded-lg transition-all flex items-center gap-2
                    ${
                      !isFormValid() || isSubmitting
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:opacity-90"
                    }`}
                  onClick={handleConfirmBooking}
                  disabled={!isFormValid() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span>Processing...</span>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                    </>
                  ) : (
                    <>
                      <span>Metode Pembayaran</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const BookingPage = () => {
  return (
    <Suspense fallback={<PageLoading />}>
      <BookingPageContent />
    </Suspense>
  );
};

export default BookingPage;
