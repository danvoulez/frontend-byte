"use client"

import { useEffect, useRef } from "react"

/**
 * Deterministic QR-like pattern generated from a CID string.
 * Uses a seeded hash to produce a consistent grid pattern.
 * In production, replace with a real QR library like `qrcode`.
 */
function hashSeed(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

interface QRCodeProps {
  value: string
  size?: number
  className?: string
}

export function QRCode({ value, size = 192, className }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const modules = 21 // Standard QR v1

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const scale = window.devicePixelRatio || 1
    canvas.width = size * scale
    canvas.height = size * scale
    ctx.scale(scale, scale)

    const cellSize = size / (modules + 2) // +2 for quiet zone
    const offset = cellSize // quiet zone

    // Background
    const isDark = document.documentElement.classList.contains("dark")
    ctx.fillStyle = isDark ? "#111318" : "#ffffff"
    ctx.fillRect(0, 0, size, size)

    const fg = isDark ? "#e8e8ec" : "#0f1117"

    // Deterministic grid from CID
    const rand = seededRandom(hashSeed(value))
    const grid: boolean[][] = Array.from({ length: modules }, () =>
      Array.from({ length: modules }, () => rand() > 0.45)
    )

    // Force finder patterns (3 corners)
    const setFinder = (r: number, c: number) => {
      for (let dr = 0; dr < 7; dr++) {
        for (let dc = 0; dc < 7; dc++) {
          const isOuter = dr === 0 || dr === 6 || dc === 0 || dc === 6
          const isInner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4
          grid[r + dr][c + dc] = isOuter || isInner
        }
      }
      // Separator
      for (let i = -1; i <= 7; i++) {
        const coords = [
          [r - 1, c + i], [r + 7, c + i],
          [r + i, c - 1], [r + i, c + 7],
        ]
        for (const [cr, cc] of coords) {
          if (cr >= 0 && cr < modules && cc >= 0 && cc < modules) {
            grid[cr][cc] = false
          }
        }
      }
    }

    setFinder(0, 0)
    setFinder(0, modules - 7)
    setFinder(modules - 7, 0)

    // Draw cells
    ctx.fillStyle = fg
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        if (grid[row][col]) {
          const x = offset + col * cellSize
          const y = offset + row * cellSize
          ctx.beginPath()
          const r = cellSize * 0.15
          ctx.roundRect(x, y, cellSize - 0.5, cellSize - 0.5, r)
          ctx.fill()
        }
      }
    }
  }, [value, size])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: size, height: size }}
      aria-label={`QR Code para ${value.slice(0, 20)}...`}
      role="img"
    />
  )
}
