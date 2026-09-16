import Footer from "@/components/layout/Footer";
import Navbar from "@/components/navigation/Navbar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col">{children}</div>
      <Footer />
    </>
  );
}
