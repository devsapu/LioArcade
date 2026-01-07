import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

