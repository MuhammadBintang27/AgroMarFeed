"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CityAutocomplete from "@/components/ui/CityAutocomplete";
import { useUser } from "@/contexts/UserContext";
import imageCompression from "browser-image-compression";

interface CityOption {
  id: number;
  label: string;
  subdistrict_name: string;
  district_name: string;
  city_name: string;
  province_name: string;
  zip_code: string;
}

export default function BuatTokoPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [jenisUsaha, setJenisUsaha] = useState<string>("Perorangan");
  const [nama, setNama] = useState("");
  const [nik, setNik] = useState("");
  const [fotoKtp, setFotoKtp] = useState<File | null>(null);
  const [namaToko, setNamaToko] = useState("");
  const [email, setEmail] = useState("");
  const [nomorHp, setNomorHp] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [alamat, setAlamat] = useState<{
    label_alamat: string;
    lokasi: CityOption | null;
    alamat_lengkap: string;
  }>({
    label_alamat: "",
    lokasi: null,
    alamat_lengkap: "",
  });
  const [verifikasiWajah, setVerifikasiWajah] = useState(false);
  const [setuju, setSetuju] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const userId = user?._id || null;
  const [checkingStore, setCheckingStore] = useState(true);
  const headerRef = useRef<HTMLDivElement>(null);

  // Cek jika user sudah punya store
  useEffect(() => {
    if (!userId) return;
    setCheckingStore(true);
    fetch(`/api/stores?user_id=${userId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data._id) {
          router.replace("/tokoSaya");
        }
      })
      .finally(() => setCheckingStore(false));
  }, [userId]);

  // Validasi per step
  const isStep1Valid = nama && nik && fotoKtp && verifikasiWajah && setuju;
  const isStep2Valid =
    namaToko &&
    email &&
    nomorHp &&
    deskripsi &&
    alamat.label_alamat &&
    alamat.lokasi &&
    alamat.alamat_lengkap;

  const handleFotoKtpChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      let file = e.target.files[0];
      if (file.size > 300 * 1024) {
        // Kompres gambar jika > 300KB
        try {
          const compressedFile = await imageCompression(file, {
            maxSizeMB: 0.2, // 200KB
            maxWidthOrHeight: 800,
            useWebWorker: true,
          });
          setFotoKtp(compressedFile);
        } catch (err) {
          alert("Gagal kompres gambar, gunakan file asli.");
          setFotoKtp(file);
        }
      } else {
        setFotoKtp(file);
      }
    }
  };

  const handleAlamatChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setAlamat({ ...alamat, [e.target.name]: e.target.value });
  };

  const handleLokasiChange = (lokasi: CityOption | null) =>
    setAlamat((a) => ({ ...a, lokasi }));

  // Submit dengan konfirmasi dan redirect tujuan
  const handleSubmit = async (redirectTo: "tokoSaya" | "tambahProduk") => {
    if (!userId) {
      setError("User belum login, silakan login ulang.");
      return;
    }
    if (!isStep1Valid || !isStep2Valid) {
      setError("Lengkapi semua data terlebih dahulu.");
      return;
    }
    const confirmed = window.confirm("Apakah Anda yakin data sudah benar?");
    if (!confirmed) return;
    setLoading(true);
    setError(null);
    try {
      let fotoKtpUrl = "";
      if (fotoKtp) {
        const formData = new FormData();
        formData.append("file", fotoKtp);
        const uploadRes = await fetch("/api/store", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          throw new Error("Gagal upload foto KTP");
        }
        const uploadData = await uploadRes.json();
        fotoKtpUrl = uploadData.url || "";
      }
      const payload = {
        user_id: userId,
        jenis_usaha: jenisUsaha,
        nama,
        nik,
        foto_ktp: fotoKtpUrl,
        nama_toko: namaToko,
        email,
        nomor_hp: nomorHp,
        deskripsi,
        alamat: {
          label_alamat: alamat.label_alamat,
          provinsi: alamat.lokasi?.province_name,
          kabupaten: alamat.lokasi?.city_name,
          kecamatan: alamat.lokasi?.district_name,
          desa: alamat.lokasi?.subdistrict_name,
          kode_pos: alamat.lokasi?.zip_code
            ? Number(alamat.lokasi.zip_code)
            : undefined,
          alamat_lengkap: alamat.alamat_lengkap,
        },
      };
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        if (redirectTo === "tambahProduk") {
          router.push("/tambahProduk");
        } else {
          router.push("/tokoSaya");
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Gagal membuat toko");
      }
    } catch (err: any) {
      setError(err.message || "Gagal membuat toko");
    } finally {
      setLoading(false);
    }
  };

  // Ganti scrollTo atas menjadi scroll ke bawah header
  const scrollToForm = () => {
    headerRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  if (checkingStore) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="max-w-3xl mx-auto w-full py-12 px-4">
        <div
          ref={headerRef}
          className="bg-[#47492E] rounded-2xl p-8 mb-10 text-center text-white"
        >
          <h1 className="text-3xl font-bold mb-2">Verifikasi Data Diri</h1>
          <p className="mb-4">
            Lengkapi data untuk memulai proses pembukaan toko dan memastikan
            keamanan serta kenyamanan transaksi.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step === 1
                  ? "bg-[#B6D07A] text-[#47492E]"
                  : "bg-[#D9E7C4] text-[#47492E]"
              }`}
            >
              1
            </div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step === 2
                  ? "bg-[#B6D07A] text-[#47492E]"
                  : "bg-[#D9E7C4] text-[#47492E]"
              }`}
            >
              2
            </div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step === 3
                  ? "bg-[#B6D07A] text-[#47492E]"
                  : "bg-[#D9E7C4] text-[#47492E]"
              }`}
            >
              3
            </div>
          </div>
        </div>
        {/* Step 1: Identitas Diri */}
        {step === 1 && (
          <form
            className="bg-white rounded-xl p-8 grid grid-cols-1 md:grid-cols-2 gap-8"
            onSubmit={(e) => {
              e.preventDefault();
              if (isStep1Valid) {
                scrollToForm();
                setTimeout(() => setStep(2), 400);
              } else setError("Lengkapi semua data!");
            }}
          >
            {/* Kolom Kiri */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Identitas Diri</h2>
              <label className="block font-semibold mb-1">Nama</label>
              <input
                type="text"
                className="bg-gray-100 w-full mb-4 px-4 py-2 rounded-lg"
                placeholder="Masukkan nama lengkap"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
              />
              <label className="block font-semibold mb-1">NIK</label>
              <input
                type="text"
                className="w-full mb-4 px-4 py-2 bg-gray-100 rounded-lg"
                placeholder="Masukkan NIK"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                required
              />
              {/* Tombol S&K dan Lanjut hanya di desktop */}
              <div className="flex flex-col gap-2 pt-4 hidden md:block">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="setuju"
                    checked={setuju}
                    onChange={(e) => setSetuju(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="setuju" className="text-sm">
                    Saya Menyetujui{" "}
                    <a href="#" className="underline">
                      Syarat & Ketentuan
                    </a>
                  </label>
                </div>
                {error && (
                  <div className="text-red-500 mb-2 text-sm">{error}</div>
                )}
                <button
                  type="submit"
                  className="w-full bg-3 text-white py-3 rounded-[25] font-semibold hover:bg-yellow-600 transition text-center px-4 hover:scale-105 duration-300"
                  disabled={!isStep1Valid}
                >
                  Lanjut
                </button>
              </div>
            </div>
            {/* Kolom Kanan */}
            <div>
              <label className="block font-semibold mb-2">Foto KTP</label>
              <div className="w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center mb-6">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoKtpChange}
                  className="hidden"
                  id="fotoKtpInput"
                />
                <label
                  htmlFor="fotoKtpInput"
                  className="cursor-pointer flex flex-col items-center justify-center w-full h-full"
                >
                  {fotoKtp ? (
                    <span className="text-green-600 font-semibold">
                      {fotoKtp.name}
                    </span>
                  ) : (
                    <span className="text-gray-400">+</span>
                  )}
                </label>
              </div>
              <label className="block font-semibold mb-2 mt-6">
                Verifikasi Wajah
              </label>
              <button
                type="button"
                className="w-full bg-gray-100 border rounded-lg py-3 flex items-center justify-between px-4 mb-6"
                onClick={() => setVerifikasiWajah(true)}
              >
                <span className="flex items-center gap-2">
                  <span role="img" aria-label="face">
                    🧑‍💼
                  </span>{" "}
                  Verifikasi Wajah Anda
                </span>
                <span className="text-gray-400">
                  {verifikasiWajah ? "✔️" : "→"}
                </span>
              </button>
              {/* Tombol S&K dan Lanjut hanya di mobile */}
              <div className="flex flex-col gap-2 pt-4 block md:hidden">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="setuju-mobile"
                    checked={setuju}
                    onChange={(e) => setSetuju(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="setuju-mobile" className="text-sm">
                    Saya Menyetujui{" "}
                    <a href="#" className="underline">
                      Syarat & Ketentuan
                    </a>
                  </label>
                </div>
                {error && (
                  <div className="text-red-500 mb-2 text-sm">{error}</div>
                )}
                <button
                  type="submit"
                  className="w-full bg-3 text-white py-3 rounded-[25] font-semibold hover:bg-yellow-600 transition text-center px-4 hover:scale-105 duration-300"
                  disabled={!isStep1Valid}
                >
                  Lanjut
                </button>
              </div>
            </div>
          </form>
        )}
        {/* Step 2: Identitas Toko */}
        {step === 2 && (
          <form
            className="bg-white rounded-xl p-8 grid grid-cols-1 gap-8"
            onSubmit={(e) => {
              e.preventDefault();
              if (isStep2Valid) {
                scrollToForm();
                setTimeout(() => setStep(3), 400);
              } else setError("Lengkapi semua data toko!");
            }}
          >
            <h2 className="text-2xl font-bold mb-6">Identitas Toko</h2>
            {/* Identitas Toko 2 kolom */}
            <div className="grid md:grid-cols-2 gap-8 mb-6">
              {/* Kiri */}
              <div>
                <label className="block font-semibold mb-1">Nama Toko</label>
                <input
                  type="text"
                  className="w-full mb-4 px-4 py-2 bg-gray-100 rounded-lg"
                  placeholder="Masukkan nama toko"
                  value={namaToko}
                  onChange={(e) => setNamaToko(e.target.value)}
                  required
                />
                <label className="block font-semibold mb-1">Email</label>
                <input
                  type="email"
                  className="w-full mb-4 px-4 py-2 bg-gray-100 rounded-lg"
                  placeholder="Masukkan email toko"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label className="block font-semibold mb-1">Nomor HP</label>
                <input
                  type="text"
                  className="w-full mb-4 px-4 py-2 bg-gray-100 rounded-lg"
                  placeholder="Masukkan nomor HP toko"
                  value={nomorHp}
                  onChange={(e) => setNomorHp(e.target.value)}
                  required
                />
              </div>
              {/* Kanan */}
              <div>
                <label className="block font-semibold mb-1">
                  Deskripsi Toko
                </label>
                <textarea
                  className="w-full mb-4 px-4 py-2 bg-gray-100 rounded-lg min-h-[120px]"
                  placeholder="Masukkan deskripsi toko"
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  required
                />
              </div>
            </div>
            {/* Alamat 2 kolom */}
            <h2 className="text-xl font-bold mb-4">Alamat Toko</h2>
            <div className="grid md:grid-cols-2 gap-8 mb-6">
              {/* Kiri */}
              <div>
                <label className="block font-semibold mb-1">Cari Lokasi</label>
                <CityAutocomplete
                  value={alamat.lokasi}
                  onChange={handleLokasiChange}
                  placeholder="Cari lokasi (kelurahan/kecamatan/kota)..."
                />
                <label className="block font-semibold mb-1 mt-4">
                  Kode Pos
                </label>
                <input
                  type="text"
                  className="w-full mb-2 px-4 py-2 bg-gray-100 rounded-lg"
                  placeholder="Kode Pos"
                  value={alamat.lokasi?.zip_code || ""}
                  readOnly
                />
              </div>
              {/* Kanan */}
              <div>
                <label className="block font-semibold mb-1">Label Alamat</label>
                <input
                  type="text"
                  className="w-full mb-2 px-4 py-2 bg-gray-100 rounded-lg"
                  placeholder="Label Alamat"
                  name="label_alamat"
                  value={alamat.label_alamat}
                  onChange={handleAlamatChange}
                  required
                />
                <label className="block font-semibold mb-1 mt-4">
                  Alamat Lengkap
                </label>
                <textarea
                  className="w-full mb-2 px-4 py-2 bg-gray-100 rounded-lg min-h-[80px]"
                  placeholder="Alamat Lengkap"
                  name="alamat_lengkap"
                  value={alamat.alamat_lengkap}
                  onChange={handleAlamatChange}
                  required
                />
              </div>
            </div>
            {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
            <div className="flex gap-4">
              <button
                type="button"
                className="w-full bg-white text-orange-300 py-3 border border-orange-200 border-2 rounded-[25] px-2 text-xs font-semibold hover:scale-105 duration-300 transition text-center md:py-3 md:rounded-[25] md:px-4 md:text-base"
                onClick={() => {
                  scrollToForm();
                  setTimeout(() => setStep(1), 400);
                }}
              >
                Kembali
              </button>
              <button
                type="submit"
                className="w-full bg-3 text-white py-3 rounded-[25] font-semibold hover:bg-yellow-600 transition text-center px-4 hover:scale-105 duration-300"
                disabled={!isStep2Valid}
              >
                Lanjut
              </button>
            </div>
          </form>
        )}
        {/* Step 3: Selesai & Upload Produk */}
        {step === 3 && (
          <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-8">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Toko Siap Digunakan!
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Kamu bisa langsung mulai upload produk atau verifikasi toko
              sekarang.
            </p>
            {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
            <button
              className="w-full bg-gray-100 text-white py-2 rounded-[25] px-2 text-xs font-semibold hover:scale-105 duration-300 mb-4 flex items-center justify-between md:py-3 md:rounded-[25] md:px-4 md:text-base"
              onClick={() => handleSubmit("tambahProduk")}
              disabled={loading}
              style={{ textAlign: "left" }}
            >
              <span className="flex items-center gap-3 text-black">
                <img
                  src="/images/icons/box.png"
                  alt="Box"
                  className="w-6 h-6 mr-2"
                />
                Mulai Upload Produk
              </span>
              <img
                src="/images/icons/go.png"
                alt="Go"
                className="w-6 h-6 ml-2"
              />
            </button>
            <div className="flex gap-4 w-full">
              <button
                className="w-full bg-white text-orange-300 py-2 border border-orange-200 border-2 rounded-[25] px-2 text-xs font-semibold hover:scale-105 duration-300 transition text-center md:py-3 md:rounded-[25] md:px-4 md:text-base"
                onClick={() => {
                  scrollToForm();
                  setTimeout(() => setStep(2), 400);
                }}
              >
                Kembali
              </button>
              <button
                className="w-full bg-3 text-white py-2 rounded-[25] px-2 text-xs font-semibold hover:bg-yellow-600 transition text-center hover:scale-105 duration-300 md:py-3 md:rounded-[25] md:px-4 md:text-base"
                onClick={() => handleSubmit("tokoSaya")}
                disabled={loading}
              >
                {loading ? "Memproses..." : "Upload Nanti & Verifikasi Toko"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
