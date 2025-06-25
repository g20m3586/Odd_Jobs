"use client"

export default function CopyProfileLinkButton({ userId }) {
  const handleCopy = () => {
    const link = `${window.location.origin}/user/${userId}`
    navigator.clipboard.writeText(link)
  }

  return (
    <button
      onClick={handleCopy}
      className="text-sm text-muted-foreground hover:underline"
    >
      Copy Profile Link
    </button>
  )
}
