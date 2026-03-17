'use client'

export default function CalendarEmbed({ html }: { html: string }) {
  return (
    <div
      className="min-h-[500px]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
