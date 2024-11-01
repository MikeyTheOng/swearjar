
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/swearjar/list')

  return (
    <html lang="en">
      <head>
        <title>SwearJar</title>
        <meta name="description" content="Jar Your Habits" />

        {/* Open Graph Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://swearjar.michaelongning.com" />
        <meta property="og:title" content="SwearJar" />
        <meta property="og:description" content="Jar Your Habits" />
        <meta property="og:image" content="https://swearjar.michaelongning.com/default-image.jpg" />
      </head>
    </html>
  )
}
