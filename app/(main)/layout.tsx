"use client";

import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <div className="relative">
            <Header />
            <main>{children}</main>
            <Footer />
        </div>
    );
}