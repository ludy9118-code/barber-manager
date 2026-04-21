import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ProductsSection from '@/components/ProductsSection';
import RenuevaAdSection from '@/components/RenuevaAdSection';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <RenuevaAdSection />
      <ProductsSection />
    </main>
  );
}
