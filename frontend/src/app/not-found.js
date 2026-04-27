import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-200">404</h1>
        <p className="text-xl text-gray-600 mt-4">Page not found</p>
        <Link href="/" className="btn-primary mt-6 inline-flex">Go Home</Link>
      </div>
    </div>
  );
}
