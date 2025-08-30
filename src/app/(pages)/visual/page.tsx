import Footer from '@/components/Footer';
import Link from 'next/link';



export default function ThreeDPage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-space-teal mb-8 tracking-tight">
          3D Asteroid Impact Visualization
        </h1>
        <p className="text-xl mb-12 max-w-2xl mx-auto text-gray-300">
          This is where the 3D Earth visualization will be implemented. 
          The 3D model team will integrate their work here.
        </p>
        
        <div className="w-full max-w-3xl h-[500px] mx-auto bg-space-blue/30 rounded-xl border border-space-teal/30 flex items-center justify-center backdrop-blur-sm">
          <p className="text-space-teal font-mono">
            3D Earth Visualization Placeholder<br/>
            (To be implemented by 3D modeling team)
          </p>
        </div>
        
        <Link 
          href="/"
          className="inline-block mt-12 px-8 py-3 rounded-full bg-space-purple hover:bg-space-pink transition-all duration-300 font-medium text-white"
        >
          Return to Home
        </Link>
      </div>
      
      <Footer />
    </main>
  );
}