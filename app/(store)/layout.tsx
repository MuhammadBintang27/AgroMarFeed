"use client";

import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <div className="relative min-h-screen flex flex-col bg-white">
            <Header />
            <div className="pt-4 md:pt-10" />
            <main className="flex-1 w-full max-w-5xl mx-auto px-2 sm:px-4 md:px-8">{children}</main>
            <Footer />
        </div>
    );
}