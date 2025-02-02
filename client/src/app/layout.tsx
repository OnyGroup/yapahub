import '@/styles/globals.scss'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import ProgressBar from '@/components/ProgressBar/ProgressBar'
import DictionaryProvider from '@/locales/DictionaryProvider'
import { getDictionary } from '@/locales/dictionary'
import getTheme from '@/themes/theme'
config.autoAddCss = false

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dictionary = await getDictionary()

  return (
    <html lang="en" data-bs-theme={getTheme()}>
      <body>
        <ProgressBar />
        <DictionaryProvider dictionary={dictionary}>
          {children}
        </DictionaryProvider>
      </body>
    </html>
  )
}
