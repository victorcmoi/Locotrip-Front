import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <h1 className="text-4xl font-bold text-center">
        Welcome to <span className="text-blue-600">Locotrip</span>
      </h1>
      
      <Link 
        href="/login"
        className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
      >
        Se connecter
      </Link>
    </div>
  );
}
