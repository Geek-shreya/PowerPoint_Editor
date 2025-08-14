"use client"

import type React from "react"

import { createContext, useContext, useRef, type ReactNode } from "react"
import type * as fabric from "fabric"

interface CanvasContextType {
  canvasRef: React.MutableRefObject<fabric.Canvas | null>
}

const CanvasContext = createContext<CanvasContextType | null>(null)

export function CanvasProvider({ children }: { children: ReactNode }) {
  const canvasRef = useRef<fabric.Canvas | null>(null)

  return <CanvasContext.Provider value={{ canvasRef }}>{children}</CanvasContext.Provider>
}

export function useCanvas() {
  const context = useContext(CanvasContext)
  if (!context) {
    throw new Error("useCanvas must be used within a CanvasProvider")
  }
  return context
}
