import './globals.css'

export const metadata = {
  title: 'Sterling Gates - Consultancy & Realty',
  description: 'API Backend for Sterling Gates Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-emerald-50">{children}</body>
    </html>
  )
}
