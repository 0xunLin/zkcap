import './globals.css'
import Navbar from '../components/Navbar'

export const metadata = {
  title: 'zkCAP Dashboard',
  description: 'Verifiable commit attestation protocol',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto p-8">
          {children}
        </main>
      </body>
    </html>
  )
}
