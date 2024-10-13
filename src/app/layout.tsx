import type { Metadata } from "next"
import "../../globals.css"

type RootLayoutTypes = {
  children: React.ReactNode
}

export default function RootLayout({ children, }: Readonly<RootLayoutTypes>) {
  return (
    <html lang="pt-br">
      <body>
        {children}
      </body>
    </html>
  )
}
