"use client"

import { useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  updateSlideContent,
  setSelectedObject,
  updateSlideThumbnail,
  setCanvas,
} from "@/store/slices/presentationSlice"
import { saveState } from "@/store/slices/undoRedoSlice"
import * as fabric from "fabric"

export default function CanvasArea() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
  const dispatch = useAppDispatch()
  const { canvas, activeSlideIndex, slides } = useAppSelector((state) => state.presentation)

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return

    try {
      console.log("Initializing Fabric.js canvas...")

      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: "#ffffff",
        selection: true,
        preserveObjectStacking: true,
      })

      fabricCanvasRef.current = fabricCanvas
      dispatch(setCanvas(fabricCanvas))

      console.log("Fabric.js canvas initialized successfully")

      // Load initial slide content if available
      if (slides[activeSlideIndex]?.content) {
        fabricCanvas.loadFromJSON(slides[activeSlideIndex].content, () => {
          fabricCanvas.renderAll()
          dispatch(saveState(slides[activeSlideIndex].content))
        })
      } else {
        // Save initial empty state
        const initialState = JSON.stringify(fabricCanvas.toJSON())
        dispatch(saveState(initialState))
      }
    } catch (error) {
      console.error("Failed to initialize Fabric.js canvas:", error)
    }

    // Cleanup function
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose()
        fabricCanvasRef.current = null
      }
    }
  }, [dispatch, activeSlideIndex, slides])

  // Set up event listeners when canvas is available
  useEffect(() => {
    const fabricCanvas = fabricCanvasRef.current
    if (!fabricCanvas) return

    console.log("Setting up canvas event listeners...")

    const handleSelectionCreated = (e: any) => {
      dispatch(setSelectedObject(e.selected[0] || null))
    }

    const handleSelectionUpdated = (e: any) => {
      dispatch(setSelectedObject(e.selected[0] || null))
    }

    const handleSelectionCleared = () => {
      dispatch(setSelectedObject(null))
    }

    const handleObjectModified = () => {
      try {
        // Save canvas state when objects are modified
        const canvasData = JSON.stringify(fabricCanvas.toJSON())
        dispatch(updateSlideContent({ index: activeSlideIndex, content: canvasData }))
        dispatch(saveState(canvasData))

        // Update thumbnail
        const thumbnail = fabricCanvas.toDataURL({ format: "png", quality: 0.3, multiplier: 0.2 })
        dispatch(updateSlideThumbnail({ index: activeSlideIndex, thumbnail }))
      } catch (error) {
        console.error("Failed to handle object modification:", error)
      }
    }

    // Add event listeners
    fabricCanvas.on("selection:created", handleSelectionCreated)
    fabricCanvas.on("selection:updated", handleSelectionUpdated)
    fabricCanvas.on("selection:cleared", handleSelectionCleared)
    fabricCanvas.on("object:modified", handleObjectModified)
    fabricCanvas.on("object:added", handleObjectModified)
    fabricCanvas.on("object:removed", handleObjectModified)

    return () => {
      fabricCanvas.off("selection:created", handleSelectionCreated)
      fabricCanvas.off("selection:updated", handleSelectionUpdated)
      fabricCanvas.off("selection:cleared", handleSelectionCleared)
      fabricCanvas.off("object:modified", handleObjectModified)
      fabricCanvas.off("object:added", handleObjectModified)
      fabricCanvas.off("object:removed", handleObjectModified)
    }
  }, [dispatch, activeSlideIndex])

  // Handle slide changes
  useEffect(() => {
    const fabricCanvas = fabricCanvasRef.current
    if (!fabricCanvas || !slides[activeSlideIndex]) return

    console.log("Loading slide content for slide", activeSlideIndex)

    try {
      // Load the active slide content
      fabricCanvas.loadFromJSON(slides[activeSlideIndex].content, () => {
        fabricCanvas.renderAll()
        console.log("Slide content loaded successfully")
      })
    } catch (error) {
      console.error("Failed to load slide content:", error)
    }
  }, [activeSlideIndex, slides])

  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-border">
        <canvas ref={canvasRef} className="block" style={{ cursor: "default" }} />
      </div>
    </div>
  )
}
