import './globals.css'

export const metadata = {
  title: 'zkCAP — Commit Attestation Platform',
  description: 'Verifiable commit attestation protocol for private repositories.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        {children}
      </body>
    </html>
  )
}
