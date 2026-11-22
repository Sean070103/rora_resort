import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Queen Aurora's Garden Resort | A Garden Escape in Cabuyao",
  description: "Discover a garden-side getaway in Marinig, Cabuyao City, Laguna. Explore Queen Aurora's Garden Resort and enquire about your next visit.",
  openGraph: {
    title: "Queen Aurora's Garden Resort | A Garden Escape in Cabuyao",
    description: 'A garden-side pause in Cabuyao, made for the people you love and the moments you want to keep.',
    images: ['https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-wLIUSTxIiOrRcdtn3VVKEMpDdOt6Xy.png'],
    type: 'website',
  },
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f7f6ef',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
