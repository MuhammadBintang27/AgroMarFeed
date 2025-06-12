"use client";
import Image from "next/image";

export default function AboutUsPage() {
  return (
    <div className="bg-white min-h-screen pt-32 pb-16">
      <div className="container mx-auto px-4 lg:px-20">
        {/* Heading */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-black mb-4">Tentang Kami</h1>
          <p className="text-gray-600 text-lg">
            Inovasi Pakan Ternak Berbasis Limbah Agro-Maritim untuk Masa Depan yang Berkelanjutan
          </p>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 mb-16">
          <div className="lg:w-1/2">
            <h2 className="text-2xl font-semibold text-black mb-4">
              Misi Kami
            </h2>
            <p className="text-gray-700 mb-4 text-justify">
              Kami percaya bahwa masa depan peternakan Indonesia bergantung pada solusi yang tidak hanya efisien, tapi juga berkelanjutan. Kami menghadirkan pakan ternak dari limbah agro-maritim untuk membantu peternak mengurangi biaya operasional hingga 30%, sekaligus menjaga lingkungan dari pencemaran limbah organik.
            </p>
            <p className="text-gray-700 text-justify">
              Dari penelitian hingga produksi, kami berkomitmen menjadikan setiap langkah dalam rantai pasok lebih ramah lingkungan dan bermanfaat bagi masyarakat lokal.
            </p>
          </div>
          <div className="lg:w-1/2">
            <Image
              src="/images/home/bg_homepage.png"
              alt="Gambar Sawah"
              width={600}
              height={400}
              className="rounded-xl shadow-lg"
            />
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-black mb-6 text-center">Nilai-Nilai Kami</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-2xl p-6 shadow">
              <h3 className="text-xl font-bold text-black mb-2">Inovatif</h3>
              <p className="text-gray-600 text-justify">
                Kami terus mengembangkan produk berbasis riset ilmiah dan teknologi terbaru untuk meningkatkan efisiensi pakan ternak.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 shadow">
              <h3 className="text-xl font-bold text-black mb-2">Berkelanjutan</h3>
              <p className="text-gray-600 text-justify">
                Semua bahan kami berasal dari limbah agro-maritim yang diolah secara ramah lingkungan, tanpa bahan kimia berbahaya.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 shadow">
              <h3 className="text-xl font-bold text-black mb-2">Memberdayakan</h3>
              <p className="text-gray-600 text-justify">
                Kami berkolaborasi dengan petani, peternak, dan nelayan lokal untuk menciptakan ekosistem yang saling menguntungkan.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
        <h2 className="text-2xl font-semibold text-black mb-6 text-center">Tim Kami</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
            {
                name: "Andi",
                role: "Lead Penelitian",
                description: "Memimpin pengembangan formula pakan berbasis riset ilmiah dan nutrisi ternak.",
            },
            {
                name: "Sari",
                role: "Manajer Produk",
                description: "Mengelola siklus hidup produk dan kebutuhan pengguna dari peternak lokal.",
            },
            {
                name: "Rizky",
                role: "Ahli Agro-Maritim",
                description: "Mengintegrasikan limbah pertanian dan kelautan sebagai bahan baku utama.",
            },
            {
                name: "Budi",
                role: "Pengembang Teknologi",
                description: "Mengembangkan platform digital untuk distribusi dan monitoring pakan.",
            },
            {
                name: "Cici",
                role: "Manajer Komunitas",
                description: "Membangun komunitas peternak dan edukasi keberlanjutan melalui pelatihan.",
            },
            {
                name: "Dodi",
                role: "Analis Dampak Lingkungan",
                description: "Mengevaluasi dampak emisi karbon dan limbah selama siklus produksi.",
            },
            ].map((member, index) => (
            <div
                key={index}
                className="flex flex-col items-center bg-white rounded-xl shadow p-6 text-center"
            >
                <Image
                src={`/images/team/${member.name.toLowerCase()}.png`}
                alt={`Foto ${member.name}`}
                width={100}
                height={100}
                className="rounded-full mb-4 object-cover"
                />
                <h4 className="font-semibold text-black text-lg">{member.name}</h4>
                <p className="text-yellow-600 text-sm font-medium">{member.role}</p>
                <p className="text-gray-600 text-sm mt-2">{member.description}</p>
            </div>
            ))}
        </div>
        </div>


        {/* CTA */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-semibold text-black mb-2">
            Siap Menjadi Bagian dari Revolusi Hijau Peternakan?
          </h3>
          <p className="text-gray-600 mb-6">
            Bergabunglah dengan kami dalam misi menyediakan pakan ternak berkualitas dan berkelanjutan.
          </p>
          <a
            href="https://api.whatsapp.com/send?phone=6281264020484"
            className="inline-block bg-3 text-white px-6 py-3 rounded-full hover:bg-yellow-600 transition"
          >
            Hubungi Kami
          </a>
        </div>
      </div>
    </div>
  );
}
