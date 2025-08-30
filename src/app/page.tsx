import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import GoTo3D from '@/components/Goto3D';
import Footer from '@/components/Footer';
import Info from '@/components/Info';

export default function Home() {
  return (
    <main className=" relative ">
      <Navbar />
      <Hero />
      <Info />
      <GoTo3D />
      {/* <Contact /> */}
      <Footer />
    </main>
  );
}