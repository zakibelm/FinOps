import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import QueryProvider from './providers'

  const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'FinOps - Analyse Financiere IA',
    description: 'Plateforme d\'analyse financiere optimisee pour CPA',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
          <html lang="fr">
                <body className={inter.className}>
                        <QueryProvider>
                          {children}
                        </QueryProvider>QueryProvider>
                </body>body>
          </html>html>
        )
}</html>
