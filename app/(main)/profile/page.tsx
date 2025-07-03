"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import { useUser } from "@/contexts/UserContext";
import Image from "next/image";
import PageLoading from "@/components/ui/PageLoading";
import CityAutocomplete from "@/components/ui/CityAutocomplete";

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

interface Address {
  _id?: string;
  nama: string;
  nomor_hp: string;
  label_alamat: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  desa: string;
  kode_pos: number;
  alamat_lengkap: string;
  catatan_kurir: string;
  is_active: boolean;
}

interface CityOption {
  id: number;
  label: string;
  subdistrict_name: string;
  district_name: string;
  city_name: string;
  province_name: string;
  zip_code: string;
}

export default function ProfilePage() {
  const { user, loading, error: userError, clearUser, refreshUser } = useUser();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [store, setStore] = useState<Store | null>(null);
  const [loadingStore, setLoadingStore] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string>(
    "/images/home/avatar.png"
  );
  const router = useRouter();

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    no_telpon: "",
    tanggal_lahir: "",
    jenis_kelamin: "",
  });

  const [addressForm, setAddressForm] = useState<Address>({
    nama: "",
    nomor_hp: "",
    label_alamat: "",
    provinsi: "",
    kabupaten: "",
    kecamatan: "",
    desa: "",
    kode_pos: 0,
    alamat_lengkap: "",
    catatan_kurir: "",
    is_active: false,
  });

  const [selectedLocation, setSelectedLocation] = useState<CityOption | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"profil" | "alamat">("profil");

  useEffect(() => {
    if (userError) {
      setError("Not authenticated");
      router.push("/auth/login");
    }
  }, [userError, router]);

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

      // Initialize form data
      setFormData({
        name: user.name || "",
        no_telpon: user.detail?.[0]?.no_telpon || "",
        tanggal_lahir: user.detail?.[0]?.tanggal_lahir
          ? new Date(user.detail[0].tanggal_lahir).toISOString().split("T")[0]
          : "",
        jenis_kelamin: user.detail?.[0]?.jenis_kelamin || "",
      });

      // Set profile image URL
      if (user.profile_picture) {
        if (user.profile_picture.startsWith("data:")) {
          // Base64 image
          setProfileImageUrl(user.profile_picture);
        } else {
          // File path - convert to base64 or use default
          setProfileImageUrl("/images/home/avatar.png");
        }
      } else {
        setProfileImageUrl("/images/home/avatar.png");
      }
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      setError("");

      // Call logout API
      await logout();

      // Clear user context immediately
      clearUser();

      // Add a small delay to ensure context is updated
      setTimeout(() => {
        // Force redirect to root with full page reload to clear any cached state
        window.location.href = "/";
      }, 300);
    } catch (err: any) {
      console.error("Logout failed:", err);
      setError("Gagal keluar dari akun. Silakan coba lagi.");
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setError("");
      setSuccess("");

      const updateData = {
        name: formData.name,
        detail: [
          {
            no_telpon: formData.no_telpon,
            tanggal_lahir: formData.tanggal_lahir
              ? new Date(formData.tanggal_lahir)
              : null,
            jenis_kelamin: formData.jenis_kelamin,
          },
        ],
      };

      const response = await fetch(`/api/user/${user?._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setSuccess("Profil berhasil diperbarui!");
      setIsEditing(false);
      refreshUser(); // Refresh user context
    } catch (err: any) {
      console.error("Profile update failed:", err);
      setError("Gagal memperbarui profil. Silakan coba lagi.");
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) {
      setError("Pilih file foto terlebih dahulu");
      return;
    }

    try {
      setUploadingPhoto(true);
      setError("");
      setSuccess("");

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target?.result as string;

        // Update profile with base64 image
        const response = await fetch(`/api/user/${user?._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profile_picture: base64String,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to upload photo");
        }

        setSuccess("Foto profil berhasil diupload!");
        setSelectedFile(null);
        setProfileImageUrl(base64String);
        refreshUser(); // Refresh user context
      };

      reader.readAsDataURL(selectedFile);
    } catch (err: any) {
      console.error("Photo upload failed:", err);
      setError("Gagal upload foto profil. Silakan coba lagi.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleLocationChange = (location: CityOption | null) => {
    setSelectedLocation(location);
    if (location) {
      setAddressForm({
        ...addressForm,
        provinsi: location.province_name,
        kabupaten: location.city_name,
        kecamatan: location.district_name,
        desa: location.subdistrict_name,
        kode_pos: parseInt(location.zip_code) || 0,
      });
    }
  };

  const handleAddAddress = async () => {
    try {
      setError("");
      setSuccess("");

      // Validasi form
      if (
        !addressForm.nama ||
        !addressForm.nomor_hp ||
        !addressForm.alamat_lengkap ||
        !addressForm.provinsi
      ) {
        setError("Lengkapi semua field yang wajib diisi");
        return;
      }

      // Jika user belum punya alamat utama dan tidak mencentang checkbox, otomatis set sebagai utama
      const hasMainAddress = user?.alamat?.some((addr) => addr.is_active);
      const finalAddressForm = { ...addressForm };
      if (!hasMainAddress && !addressForm.is_active) {
        finalAddressForm.is_active = true;
      }

      const response = await fetch(`/api/user/${user?._id}/alamat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalAddressForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add address");
      }

      const result = await response.json();

      // Pesan sukses yang lebih informatif
      if (finalAddressForm.is_active) {
        setSuccess(
          "Alamat berhasil ditambahkan dan diatur sebagai alamat utama!"
        );
      } else {
        setSuccess("Alamat berhasil ditambahkan!");
      }

      setIsAddingAddress(false);
      setSelectedLocation(null);
      setAddressForm({
        nama: "",
        nomor_hp: "",
        label_alamat: "",
        provinsi: "",
        kabupaten: "",
        kecamatan: "",
        desa: "",
        kode_pos: 0,
        alamat_lengkap: "",
        catatan_kurir: "",
        is_active: false,
      });
      refreshUser(); // Refresh user context
    } catch (err: any) {
      console.error("Add address failed:", err);
      setError(err.message || "Gagal menambahkan alamat. Silakan coba lagi.");
    }
  };

  const handleDeleteAddress = async (alamatId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus alamat ini?")) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/user/${user?._id}/alamat/${alamatId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete address");
      }

      const result = await response.json();
      setSuccess("Alamat berhasil dihapus!");
      refreshUser(); // Refresh user context
    } catch (err: any) {
      console.error("Delete address failed:", err);
      setError(err.message || "Gagal menghapus alamat. Silakan coba lagi.");
    }
  };

  const handleSetMainAddress = async (alamatId: string) => {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/user/${user?._id}/alamat/${alamatId}/utama`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to set main address");
      }

      const result = await response.json();
      setSuccess("Alamat utama berhasil diatur!");
      refreshUser(); // Refresh user context
    } catch (err: any) {
      console.error("Set main address failed:", err);
      setError(
        err.message || "Gagal mengatur alamat utama. Silakan coba lagi."
      );
    }
  };

  if (loading)
    return <PageLoading text="AgroMarFeed Sedang Memuat Profil Anda..." />;
  if (!user) return <div>Not authenticated</div>;

  return (
    <section className="bg-white w-full text-black py-20 px-4 sm:px-6 lg:px-8 lg:py-40 md:py-30">
      <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-10">
        {/* Sidebar kiri */}
        <div className="w-full lg:w-[30%]">
          {/* Info User */}
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
              <Image
                src={profileImageUrl}
                alt="User"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="ml-4">
              <p className="font-semibold text-black">{user.name}</p>
              <p className="text-sm text-black">{user.email}</p>
            </div>
          </div>

          {/* Upload Foto Profil */}
          <div className="mb-6">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
            {selectedFile && (
              <button
                onClick={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="mt-2 w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingPhoto ? "Uploading..." : "Upload Foto"}
              </button>
            )}
          </div>

          {/* Tombol Buka/Lihat Toko */}
          <div className="mb-6">
            {user.role === "penjual" ? (
              <button
                className="flex items-center justify-between bg-white border border-orange-200 text-black text-xs py-2 px-3 rounded-[25] font-semibold hover:scale-105 duration-300 transition mb-2 text-left"
                onClick={() => router.push(`/tokoSaya`)}
              >
                <span className="text-left">Toko Saya</span>
                <img
                  src="/images/icons/toko.png"
                  alt="Toko"
                  className="w-5 h-5 ml-2"
                />
              </button>
            ) : (
              <button
                className="flex items-center justify-between bg-white border border-orange-200 text-black text-xs py-2 px-3 rounded-[25] font-semibold hover:scale-105 duration-300 transition mb-2 text-left"
                onClick={() => router.push("/buatToko")}
              >
                <span className="text-left">Buka Toko</span>
                <img
                  src="/images/icons/toko.png"
                  alt="Toko"
                  className="w-5 h-5 ml-2"
                />
              </button>
            )}
          </div>

          {/* Navigasi */}
          <nav className="flex flex-col gap-2">
            <div>
              <p className="font-semibold text-black">Akun Saya</p>
              <div className="ml-4 mt-1 flex flex-col gap-1 text-sm">
                <button
                  className={`text-left text-black hover:underline ${
                    activeTab === "profil" ? "font-bold underline" : ""
                  }`}
                  onClick={() => setActiveTab("profil")}
                >
                  Profil
                </button>
                <button
                  className={`text-left text-black hover:underline ${
                    activeTab === "alamat" ? "font-bold underline" : ""
                  }`}
                  onClick={() => setActiveTab("alamat")}
                >
                  Alamat
                </button>
              </div>
            </div>

            <button
              onClick={() => router.push("/wishlist")}
              className="mt-4 font-semibold text-left text-black hover:underline"
            >
              Wishlist
            </button>
            <button
              className="font-semibold text-left text-black hover:underline"
              onClick={() => router.push("/riwayatBelanja")}
            >
              Riwayat Pemesanan
            </button>
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="font-semibold text-left text-red-500 hover:underline pt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {logoutLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  Memproses...
                </>
              ) : (
                "Keluar"
              )}
            </button>
          </nav>

          {/* Error/Success messages */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}
        </div>

        {/* Konten kanan */}
        <div className="w-full lg:w-[70%]">
          {activeTab === "profil" && (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Profil Saya</h2>
                  <p className="text-sm text-gray-600">
                    Kelola informasi profil Anda untuk mengontrol, melindungi,
                    dan mengamankan akun
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-2 text-white px-4 py-2 rounded-[25] hover:bg-orange-600"
                >
                  {isEditing ? "Batal" : "Edit Profil"}
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Nama Pengguna
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none "
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      value={formData.no_telpon}
                      onChange={(e) =>
                        setFormData({ ...formData, no_telpon: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none "
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      value={formData.tanggal_lahir}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tanggal_lahir: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none "
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Jenis Kelamin
                    </label>
                    <select
                      value={formData.jenis_kelamin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          jenis_kelamin: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none "
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleProfileUpdate}
                      className="bg-3 text-white px-4 py-2 rounded-[25] hover:bg-orange-600"
                    >
                      Simpan Perubahan
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div className="font-bold">Nama Pengguna</div>
                  <div>{user.name}</div>

                  <div className="font-bold">Email</div>
                  <div>{user.email}</div>

                  <div className="font-bold">Nomor Telepon</div>
                  <div>{user.detail?.[0]?.no_telpon || "-"}</div>

                  <div className="font-bold">Tanggal Lahir</div>
                  <div>
                    {user.detail?.[0]?.tanggal_lahir
                      ? new Date(
                          user.detail[0].tanggal_lahir
                        ).toLocaleDateString()
                      : "-"}
                  </div>

                  <div className="font-bold">Jenis Kelamin</div>
                  <div>{user.detail?.[0]?.jenis_kelamin || "-"}</div>
                </div>
              )}
            </>
          )}

          {activeTab === "alamat" && (
            <div className="mt-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Alamat</h3>
                <button
                  onClick={() => setIsAddingAddress(!isAddingAddress)}
                  className="bg-3 text-white px-4 py-2 rounded-[25] hover:bg-orange-600 text-sm"
                >
                  {isAddingAddress ? "Batal" : "Tambah Alamat"}
                </button>
              </div>

              {isAddingAddress && (
                <div className="mb-6 p-4 border border-gray-200 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Penerima
                      </label>
                      <input
                        type="text"
                        value={addressForm.nama}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            nama: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none "
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nomor HP
                      </label>
                      <input
                        type="tel"
                        value={addressForm.nomor_hp}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            nomor_hp: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none "
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Label Alamat
                      </label>
                      <input
                        type="text"
                        value={addressForm.label_alamat}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            label_alamat: e.target.value,
                          })
                        }
                        placeholder="Rumah, Kantor, dll"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none "
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cari Lokasi
                      </label>
                      <CityAutocomplete
                        value={selectedLocation}
                        onChange={handleLocationChange}
                        placeholder="Cari kota/kecamatan/kelurahan..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kode Pos
                      </label>
                      <input
                        type="number"
                        value={addressForm.kode_pos}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            kode_pos: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none "
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Provinsi
                      </label>
                      <input
                        type="text"
                        value={addressForm.provinsi}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            provinsi: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none "
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kabupaten
                      </label>
                      <input
                        type="text"
                        value={addressForm.kabupaten}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            kabupaten: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none "
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kecamatan
                      </label>
                      <input
                        type="text"
                        value={addressForm.kecamatan}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            kecamatan: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none "
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Desa
                      </label>
                      <input
                        type="text"
                        value={addressForm.desa}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            desa: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none "
                        readOnly
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alamat Lengkap
                      </label>
                      <textarea
                        value={addressForm.alamat_lengkap}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            alamat_lengkap: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none "
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Catatan untuk Kurir
                      </label>
                      <textarea
                        value={addressForm.catatan_kurir}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            catatan_kurir: e.target.value,
                          })
                        }
                        rows={2}
                        placeholder="Contoh: Rumah warna biru, dekat masjid"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none "
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={addressForm.is_active}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              is_active: e.target.checked,
                            })
                          }
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">
                          {user.alamat && user.alamat.length > 0
                            ? "Jadikan alamat utama (akan mengganti alamat utama saat ini)"
                            : "Jadikan alamat utama (alamat pertama akan otomatis jadi utama)"}
                        </span>
                      </label>
                      {user.alamat &&
                        user.alamat.length > 0 &&
                        !user.alamat.some((addr) => addr.is_active) && (
                          <p className="text-xs text-yellow-600 mt-1">
                            ⚠️ Anda belum memiliki alamat utama. Disarankan
                            untuk mencentang opsi ini.
                          </p>
                        )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleAddAddress}
                      className="bg-3 text-white px-4 py-2 rounded-md hover:bg-orange-600"
                    >
                      Tambah Alamat
                    </button>
                    <button
                      onClick={() => setIsAddingAddress(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {!isAddingAddress && user.alamat && user.alamat.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {[...user.alamat]
                    .sort((a, b) =>
                      a.is_active === b.is_active ? 0 : a.is_active ? -1 : 1
                    )
                    .map((alamat, idx) => (
                      <div
                        key={alamat._id || idx}
                        className="bg-[#F7F7FA] p-6 rounded-2xl relative flex flex-col min-h-[160px]"
                      >
                        {/* Badge atau tombol di pojok kanan atas */}
                        {alamat.is_active ? (
                          <span className="absolute top-4 right-4 text-gray-600 px-4 py-1 rounded-full text-sm font-semibold z-10">
                            Alamat Utama
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetMainAddress(alamat._id!)}
                            className="absolute top-4 right-4 border border-yellow-400 text-gray-600 px-4 py-1 rounded-full text-sm font-semibold hover:bg-yellow-50 transition z-10"
                          >
                            Jadikan alamat utama
                          </button>
                        )}
                        <div className="flex-1 min-w-0 pr-36">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-lg text-black">
                              {alamat.nama}
                            </span>
                            <span className="font-bold text-lg text-black">
                              |
                            </span>
                            <span className="font-bold text-lg text-black">
                              {alamat.nomor_hp}
                            </span>
                          </div>
                          <div className="text-gray-500 text-sm mb-2 break-words">
                            {alamat.alamat_lengkap}
                          </div>
                          <div className="text-gray-400 text-xs mb-2 break-words uppercase">
                            {alamat.desa && `${alamat.desa}, `}
                            {alamat.kecamatan && `${alamat.kecamatan}, `}
                            {alamat.kabupaten && `${alamat.kabupaten}, `}
                            {alamat.provinsi && `${alamat.provinsi}, `}
                            ID, {alamat.kode_pos}
                          </div>
                        </div>
                        <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                          <button
                            onClick={() => handleDeleteAddress(alamat._id!)}
                            className="bg-red-500 text-white px-5 py-1 rounded-full text-sm font-semibold hover:bg-red-600 transition"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
