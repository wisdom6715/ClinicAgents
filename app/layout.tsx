import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ClinicAgents',
  description: 'App developed by intuitionLabs to ',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
