// types/index.ts
export interface User {
  _id: string;
  name: string;
  email: string;
  profile_picture?: string;
  accounts: Array<{
    provider: string;
    providerAccountId: string;
    access_token?: string;
    type: 'credentials' | 'oauth';
  }>;

  // Tambahan berdasarkan model backend
  detail?: Array<{
    no_telpon?: string;
    tanggal_lahir?: string; // pakai string karena dikirim sebagai ISO string dari backend
    jenis_kelamin?: 'Laki-laki' | 'Perempuan';
  }>;

  alamat?: Array<{
    _id?: string;
    nama?: string;
    nomor_hp?: string;
    label_alamat?: string;
    provinsi?: string;
    kabupaten?: string;
    kecamatan?: string;
    desa?: string;
    kode_pos?: number;
    alamat_lengkap?: string;
    catatan_kurir?: string;
    is_active?: boolean;
  }>;

  role?: string;
}


// types/index.ts
export interface ApiResponse<T> {
  data: any;
  success: any;
  message: string;
  user: T | null; // Change from `user?: T` to `user: T | null`
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends AuthCredentials {
  name: string;
}