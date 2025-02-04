import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import DictionaryProvider from "@/locales/DictionaryProvider"
import { getDictionary } from "@/locales/dictionary"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Yapahub Dashboard",
  description: "Professional dashboard for Yapahub",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const dictionary = await getDictionary() // Fetch dictionary

  return (
    <html lang="en">
      <body className={inter.className}>
        <DictionaryProvider dictionary={dictionary}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
            <Toaster /> {/* Ensure Toaster is placed inside ThemeProvider but outside children */}
          </ThemeProvider>
        </DictionaryProvider>
      </body>
    </html>
  )
}