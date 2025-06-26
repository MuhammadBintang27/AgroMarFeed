"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout } from "@/lib/auth";
import { User } from "@/types";
import Image from "next/image";

interface Store {
  _id: string;
  user_id: string;
  nama: string;
  nama_toko: string;
  email: string;
  nomor_hp: string;
  deskripsi: string;
  aktif: boolean;
  rating?: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>("");
  const [store, setStore] = useState<Store | null>(null);
  const [loadingStore, setLoadingStore] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getCurrentUser();
        setUser(response.user ?? null);
      } catch (err: any) {
        setError("Not authenticated");
        router.push("/auth/login");
      }
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    if (user?._id) {
      setLoadingStore(true);
      fetch(`/api/stores/user/${user._id}`)
        .then(async (res) => {
          if (res.status === 404) return null;
          if (!res.ok) return null;
          return await res.json();
        })
        .then((data) => setStore(data))
        .catch(() => setStore(null))
        .finally(() => setLoadingStore(false));
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      router.push("/auth/login");
    } catch (err: any) {
      console.error("Logout failed:", err);
      setError("Logout failed");
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <section className="bg-white w-full text-black py-20 px-4 sm:px-6 lg:px-8 lg:py-40 md:py-30">
      <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-10">
        {/* Sidebar kiri */}
        <div className="w-full lg:w-[30%]">
          {/* Info User */}
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
              <Image
                src="/default-user.png"
                alt="User"
                width={48}
                height={48}
              />
            </div>
            <div className="ml-4">
              <p className="font-semibold text-black">{user.name}</p>
              <p className="text-sm text-black">{user.email}</p>
            </div>
          </div>

          {/* Tombol Buka/Lihat Toko */}
          <div className="mb-6">
            {user.role === 'penjual' ? (
              <button
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition mb-2"
                onClick={() => router.push(`/tokoSaya`)}
              >
                Lihat Toko
              </button>
            ) : (
              <button
                className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-yellow-600 transition mb-2"
                onClick={() => router.push("/buatToko")}
              >
                Buka Toko
              </button>
            )}
          </div>

          {/* Navigasi */}
          <nav className="flex flex-col gap-2">
            <div>
              <p className="font-semibold text-black">Akun Saya</p>
              <div className="ml-4 mt-1 flex flex-col gap-1 text-sm">
                <button className="text-left text-black hover:underline">
                  Profil
                </button>
                <button className="text-left text-black hover:underline">
                  Ubah Kata Sandi
                </button>
                <button className="text-left text-black hover:underline">
                  Pengaturan Notifikasi
                </button>
                <button className="text-left text-black hover:underline">
                  Pengaturan Privasi
                </button>
              </div>
            </div>

            <button className="mt-4 font-semibold text-left text-black hover:underline">
              Pesanan Saya
            </button>
            <button
              className="font-semibold text-left text-black hover:underline"
              onClick={() => router.push("/riwayatBelanja")}
            >
              Riwayat Pemesanan
            </button>
            <button
              onClick={handleLogout}
              className="font-semibold text-left text-red-500 hover:underline"
            >
              Keluar
            </button>
          </nav>
        </div>

        {/* Konten kanan */}
        <div className="w-full lg:w-[70%]">
          <h2 className="text-xl font-semibold mb-1">Profil Saya</h2>
          <p className="text-sm text-gray-600 mb-6">
            Kelola informasi profil Anda untuk mengontrol, melindungi, dan
            mengamankan akun
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div className="font-medium">Nama Pengguna</div>
            <div>{user.name}</div>

            <div className="font-medium">Email</div>
            <div>{user.email}</div>

            <div className="font-medium">Nomor Telepon</div>
            <div>{user.detail?.[0]?.no_telpon || "-"}</div>

            <div className="font-medium">Tanggal Lahir</div>
            <div>
              {user.detail?.[0]?.tanggal_lahir
                ? new Date(user.detail[0].tanggal_lahir).toLocaleDateString()
                : "-"}
            </div>

            <div className="font-medium">Jenis Kelamin</div>
            <div>{user.detail?.[0]?.jenis_kelamin || "-"}</div>
          </div>

          <div className="mt-10">
            <h3 className="text-lg font-semibold mb-2">Alamat</h3>
            {user.alamat && user.alamat.length > 0 ? (
              <div className="flex flex-col gap-4">
                {user.alamat.map((alamat, idx) => (
                  <div
                    key={idx}
                    className={`border p-4 rounded-md ${
                      alamat.is_active
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <p className="font-medium">
                      {alamat.label_alamat || "Alamat Tanpa Label"}
                    </p>
                    <p>
                      {alamat.nama} - {alamat.nomor_hp}
                    </p>
                    <p>{alamat.alamat_lengkap}</p>
                    <p>
                      {alamat.desa}, {alamat.kecamatan}, {alamat.kabupaten},{" "}
                      {alamat.provinsi} {alamat.kode_pos}
                    </p>
                    <p className="text-sm text-gray-500">
                      Catatan: {alamat.catatan_kurir || "-"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Belum ada alamat tersimpan.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
