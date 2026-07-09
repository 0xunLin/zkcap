import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-400">
          zkCAP
        </Link>
        <div className="flex space-x-6">
          <Link href="/projects" className="hover:text-blue-300">Projects</Link>
          <Link href="/commits" className="hover:text-blue-300">Commits</Link>
          <Link href="/attestations" className="hover:text-blue-300">Attestations</Link>
        </div>
      </div>
    </nav>
  );
}
