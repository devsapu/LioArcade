import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { SoundControls } from '@/components/SoundControls'
import { ThemeProvider } from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'LioArcade - Gamified Learning Platform',
  description: 'Learn through quizzes, flashcards, and mini-games',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <SoundControls />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



