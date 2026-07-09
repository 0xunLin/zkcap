import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-5xl font-bold mb-6 text-blue-500">Welcome to zkCAP</h1>
      <p className="text-xl text-gray-400 mb-12 max-w-2xl text-center">
        The verifiable commit attestation protocol for private repositories. 
        Securely prove the integrity of your code history without revealing the source.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Link href="/projects" className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition-colors">
          <h2 className="text-2xl font-semibold mb-2">Projects &rarr;</h2>
          <p className="text-gray-500">View and manage tracked GitHub repositories.</p>
        </Link>
        
        <Link href="/commits" className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition-colors">
          <h2 className="text-2xl font-semibold mb-2">Commits &rarr;</h2>
          <p className="text-gray-500">Browse ingested commits and metadata.</p>
        </Link>

        <Link href="/attestations" className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition-colors">
          <h2 className="text-2xl font-semibold mb-2">Attestations &rarr;</h2>
          <p className="text-gray-500">Verify cryptographic proofs for commits.</p>
        </Link>
      </div>
    </div>
  );
}
