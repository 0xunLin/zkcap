import './globals.css'
import Sidebar from './components/Sidebar'

export const metadata = {
  title: 'zkCAP — Commit Attestation Platform',
  description: 'Verifiable commit attestation protocol for private repositories.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <Sidebar />
        <main
          className="min-h-screen transition-all duration-300"
          style={{ marginLeft: 'var(--sidebar-width)' }}
        >
          <div className="p-8">{children}</div>
        </main>
      </body>
    </html>
  )
}
