"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Add this import
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, User, Mail, Phone } from "lucide-react";

export default function BookingPage() {
  const router = useRouter(); // Add router instance
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Add form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Add loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add form handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add validation check
  const isFormValid = () => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.phone &&
      selectedDate &&
      selectedTime
    );
  };

  // Update the confirmation handler to include booking details
  const handleConfirmBooking = async () => {
    if (!isFormValid() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const bookingDetails = {
        date: selectedDate?.toISOString(),
        time: selectedTime,
        ...formData,
      };

      // Navigate to payment with booking details
      router.push(
        `/pembayaran?booking=${encodeURIComponent(
          JSON.stringify(bookingDetails)
        )}`
      );
    } catch (error) {
      console.error("Error submitting booking:", error);
      alert("There was an error processing your booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = [
    "08:00 - 09:00",
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "13:00 - 14:00",
    "14:00 - 15:00",
  ];

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

  return (
    <div className="min-h-screen pt-32 pb-16 bg-7">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header with Icon */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-3 text-black">
              Konsultasi Ahli Pakan & Dokter Hewan Langsung
            </h1>
            <p className="text-black text-sm max-w-2xl mx-auto">
              Paket ikan, pakan ayam, dan ternak dari limbah agro-maritim. Hemat
              hingga 30%! Beli pakan, bantu bumi.
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
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Calendar Section */}
              <div className="border rounded-xl p-6 bg-gray-50">
                <h3 className="text-lg font-semibold mb-4 flex items-center justify-between text-black">
                  <span className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-2 text-black" />
                    Pilih Tanggal
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevMonth}
                      className="p-1 hover:bg-gray-200 rounded-full transition-all"
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
                    <span className="text-sm font-medium min-w-[140px] text-center">
                      {getMonthName(currentMonth)}
                    </span>
                    <button
                      onClick={nextMonth}
                      className="p-1 hover:bg-gray-200 rounded-full transition-all"
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
                        className={`text-center p-2 text-sm rounded-lg transition-all
                          ${date === null ? "invisible" : ""}
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
                    Nama Depan<span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-2/20 focus:border-2 transition-all"
                      placeholder="Masukkan nama depan"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Nama Belakang<span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-2/20 focus:border-2 transition-all"
                      placeholder="Masukkan nama belakang"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Email<span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-2/20 focus:border-2 transition-all"
                      placeholder="Masukkan email"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    No. Telepon<span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-2/20 focus:border-2 transition-all"
                      placeholder="Masukkan no. telepon"
                      required
                    />
                  </div>
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
}