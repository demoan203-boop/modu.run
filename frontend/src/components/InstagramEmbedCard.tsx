interface InstagramEmbedCardProps {
  url: string
  caption: string
}

function toEmbedUrl(url: string): string {
  const match = url.match(/instagram\.com\/(?:reel|reels|p)\/([^/?]+)/)
  const shortcode = match?.[1] ?? ''
  return `https://www.instagram.com/reel/${shortcode}/embed`
}

export function InstagramEmbedCard({ url, caption }: InstagramEmbedCardProps) {
  return (
    <div className="mb-8 flex flex-col items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-start">
      <iframe
        src={toEmbedUrl(url)}
        className="h-[480px] w-[340px] shrink-0 border-0"
        allow="encrypted-media"
        title="화장품/미용 프로모션 영상"
      />
      <p className="text-sm leading-relaxed text-gray-600">{caption}</p>
    </div>
  )
}
