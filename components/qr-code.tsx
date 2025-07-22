import { QRCodeSVG } from "qrcode.react"

interface QRCodeProps {
  value: string
  size?: number
}

export function QRCode({ value, size = 128 }: QRCodeProps) {
  return (
    <div className="flex items-center justify-center rounded-lg bg-white p-4">
      <QRCodeSVG value={value} size={size} />
    </div>
  )
}
