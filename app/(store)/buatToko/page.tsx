"use client";
import { useState } from "react";
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

  const handleFotoKtpChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          alert('Gagal kompres gambar, gunakan file asli.');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError("User belum login, silakan login ulang.");
      console.error("[BUAT TOKO] user_id tidak ditemukan, tidak submit.");
      return;
    }
    if (!setuju) {
      setError("Anda harus menyetujui syarat & ketentuan");
      return;
    }
    if (!nama || !nik || !fotoKtp || !namaToko || !email || !nomorHp || !deskripsi) {
      setError("Semua field wajib diisi, termasuk upload foto KTP.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      console.log("[BUAT TOKO] user_id yang akan dikirim:", userId);
      // Upload foto KTP jika ada
      let fotoKtpUrl = "";
      if (fotoKtp) {
        console.log("[BUAT TOKO] Mulai upload foto KTP...");
        const formData = new FormData();
        formData.append("file", fotoKtp);
        const uploadRes = await fetch("/api/store", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          const errText = await uploadRes.text();
          console.error("[BUAT TOKO] Upload foto gagal:", errText);
          throw new Error("Gagal upload foto KTP");
        }
        const uploadData = await uploadRes.json();
        fotoKtpUrl = uploadData.url || "";
        console.log("[BUAT TOKO] Foto KTP terupload:", fotoKtpUrl);
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
          kode_pos: alamat.lokasi?.zip_code ? Number(alamat.lokasi.zip_code) : undefined,
          alamat_lengkap: alamat.alamat_lengkap,
        },
      };
      console.log("[BUAT TOKO] Payload yang dikirim:", payload);
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        console.log("[BUAT TOKO] Store berhasil dibuat!");
        router.push("/tokoSaya");
      } else {
        const data = await res.json().catch(() => ({}));
        console.error("[BUAT TOKO] Error response dari backend:", data);
        setError(data.message || "Gagal membuat toko");
      }
    } catch (err: any) {
      console.error("[BUAT TOKO] ERROR:", err);
      setError(err.message || "Gagal membuat toko");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="max-w-3xl mx-auto w-full py-12 px-4">
        <div className="bg-[#47492E] rounded-2xl p-8 mb-10 text-center text-white">
          <h1 className="text-3xl font-bold mb-2">Verifikasi Data Diri</h1>
          <p className="mb-4">
            Pelet ikan, pakan ayam, dan ternak dari limbah agro-maritim. Hemat
            hingga 30%! Beli pakan, bantu bumi.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <div className="w-8 h-8 rounded-full bg-[#B6D07A] flex items-center justify-center text-[#47492E] font-bold">
              1
            </div>
            <div className="w-8 h-8 rounded-full bg-[#D9E7C4] flex items-center justify-center text-[#47492E] font-bold">
              2
            </div>
            <div className="w-8 h-8 rounded-full bg-[#D9E7C4] flex items-center justify-center text-[#47492E] font-bold">
              3
            </div>
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow p-8 grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Kiri */}
          <div>
            <label className="block font-semibold mb-1">Identitas Diri</label>
            <input
              type="text"
              className="w-full mb-4 px-4 py-2 border rounded-lg"
              placeholder="Nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
            />
            <input
              type="text"
              className="w-full mb-4 px-4 py-2 border rounded-lg"
              placeholder="NIK"
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              required
            />
            <label className="block font-semibold mb-1">Nama Toko</label>
            <input
              type="text"
              className="w-full mb-4 px-4 py-2 border rounded-lg"
              placeholder="Nama Toko"
              value={namaToko}
              onChange={(e) => setNamaToko(e.target.value)}
              required
            />
            <label className="block font-semibold mb-1">Email</label>
            <input
              type="email"
              className="w-full mb-4 px-4 py-2 border rounded-lg"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label className="block font-semibold mb-1">Nomor HP</label>
            <input
              type="text"
              className="w-full mb-4 px-4 py-2 border rounded-lg"
              placeholder="Nomor HP"
              value={nomorHp}
              onChange={(e) => setNomorHp(e.target.value)}
              required
            />
            <label className="block font-semibold mb-1">Deskripsi</label>
            <textarea
              className="w-full mb-4 px-4 py-2 border rounded-lg"
              placeholder="Deskripsi Toko"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              required
            />
            <label className="block font-semibold mb-1">Alamat</label>
            <input
              type="text"
              className="w-full mb-2 px-4 py-2 border rounded-lg"
              placeholder="Label Alamat"
              name="label_alamat"
              value={alamat.label_alamat}
              onChange={(e) =>
                setAlamat((a) => ({ ...a, label_alamat: e.target.value }))
              }
              required
            />
            <CityAutocomplete
              value={alamat.lokasi}
              onChange={handleLokasiChange}
              placeholder="Cari lokasi (kelurahan/kecamatan/kota)..."
            />
            <input
              type="text"
              className="w-full mb-2 px-4 py-2 border rounded-lg"
              placeholder="Kode Pos"
              value={alamat.lokasi?.zip_code || ""}
              readOnly
            />
            <textarea
              className="w-full mb-2 px-4 py-2 border rounded-lg"
              placeholder="Alamat Lengkap"
              name="alamat_lengkap"
              value={alamat.alamat_lengkap}
              onChange={(e) =>
                setAlamat((a) => ({ ...a, alamat_lengkap: e.target.value }))
              }
              required
            />
          </div>
          {/* Kanan */}
          <div>
            <label className="block font-semibold mb-2">Foto KTP</label>
            <div className="w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center mb-4">
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
            <label className="block font-semibold mb-2">Verifikasi Wajah</label>
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
            <div className="flex items-center mb-4">
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
            <p className="text-xs text-gray-500 mb-4">
              Dengan mengisi formulir ini, Penjual telah menyatakan bahwa semua
              info yang diberikan kepada AgroMarFeed adalah akurat, valid, dan
              terbaru
            </p>
            {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Lanjut"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
