"use client"

import { useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { updateSlideContent, setSelectedObject, updateSlideThumbnail } from "@/store/slices/presentationSlice"
import { saveState } from "@/store/slices/undoRedoSlice"
import * as fabric from "fabric"
import { useCanvas } from "./canvas-context"

export default function CanvasArea() {
  const canvasElementRef = useRef<HTMLCanvasElement>(null)
  const { canvasRef } = useCanvas()
  const previousSlideIndex = useRef<number>(0)
  const dispatch = useAppDispatch()
  const { activeSlideIndex, slides } = useAppSelector((state) => state.presentation)

  const saveCurrentSlideContent = (slideIndex: number) => {
    const fabricCanvas = canvasRef.current
    if (!fabricCanvas) return

    try {
      const currentContent = JSON.stringify(fabricCanvas.toJSON())
      dispatch(updateSlideContent({ index: slideIndex, content: currentContent }))

      // Update thumbnail
      const thumbnail = fabricCanvas.toDataURL({ format: "png", quality: 0.3, multiplier: 0.2 })
      dispatch(updateSlideThumbnail({ index: slideIndex, thumbnail }))

      console.log("Saved slide content for slide", slideIndex)
    } catch (error) {
      console.error("Failed to save slide content:", error)
    }
  }

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasElementRef.current || canvasRef.current) return

    try {
      console.log("Initializing Fabric.js canvas...")

      const fabricCanvas = new fabric.Canvas(canvasElementRef.current, {
        width: 800,
        height: 600,
        backgroundColor: "#ffffff",
        selection: true,
        preserveObjectStacking: true,
      })

      fabricCanvas.renderAll()
      canvasRef.current = fabricCanvas
      previousSlideIndex.current = activeSlideIndex

      console.log("Fabric.js canvas initialized and ready:", !!canvasRef.current)

      // Load initial slide content if available
      if (slides[activeSlideIndex]?.content) {
        fabricCanvas.loadFromJSON(slides[activeSlideIndex].content, () => {
          fabricCanvas.renderAll()
          dispatch(saveState(slides[activeSlideIndex].content))
          console.log("Initial slide content loaded")
        })
      } else {
        // Save initial empty state
        const initialState = JSON.stringify(fabricCanvas.toJSON())
        dispatch(saveState(initialState))
        console.log("Initial empty state saved")
      }
    } catch (error) {
      console.error("Failed to initialize Fabric.js canvas:", error)
    }

    // Cleanup function
    return () => {
      if (canvasRef.current) {
        console.log("Disposing canvas...")
        canvasRef.current.dispose()
        canvasRef.current = null
      }
    }
  }, [dispatch, canvasRef, activeSlideIndex, slides])

  // Set up event listeners when canvas is available
  useEffect(() => {
    const fabricCanvas = canvasRef.current
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

    const handleTextChanged = () => {
      console.log("Text changed, saving slide content...")
      // Small delay to ensure text changes are committed to the object
      setTimeout(() => {
        handleObjectModified()
      }, 100)
    }

    const handleTextEditingExited = () => {
      console.log("Text editing exited, saving slide content...")
      // Small delay to ensure text changes are committed to the object
      setTimeout(() => {
        handleObjectModified()
      }, 100)
    }

    // Add event listeners
    fabricCanvas.on("selection:created", handleSelectionCreated)
    fabricCanvas.on("selection:updated", handleSelectionUpdated)
    fabricCanvas.on("selection:cleared", handleSelectionCleared)
    fabricCanvas.on("object:modified", handleObjectModified)
    fabricCanvas.on("object:added", handleObjectModified)
    fabricCanvas.on("object:removed", handleObjectModified)
    fabricCanvas.on("text:changed", handleTextChanged)
    fabricCanvas.on("text:editing:exited", handleTextEditingExited)

    return () => {
      fabricCanvas.off("selection:created", handleSelectionCreated)
      fabricCanvas.off("selection:updated", handleSelectionUpdated)
      fabricCanvas.off("selection:cleared", handleSelectionCleared)
      fabricCanvas.off("object:modified", handleObjectModified)
      fabricCanvas.off("object:added", handleObjectModified)
      fabricCanvas.off("object:removed", handleObjectModified)
      fabricCanvas.off("text:changed", handleTextChanged)
      fabricCanvas.off("text:editing:exited", handleTextEditingExited)
    }
  }, [dispatch, activeSlideIndex, canvasRef])

  useEffect(() => {
    const fabricCanvas = canvasRef.current
    if (!fabricCanvas || !slides[activeSlideIndex]) return

    if (previousSlideIndex.current !== activeSlideIndex) {
      console.log(
        "Saving content for previous slide",
        previousSlideIndex.current,
        "before switching to",
        activeSlideIndex,
      )
      try {
        const currentContent = JSON.stringify(fabricCanvas.toJSON())
        // Only save if the previous slide index is valid
        if (previousSlideIndex.current >= 0 && previousSlideIndex.current < slides.length) {
          dispatch(updateSlideContent({ index: previousSlideIndex.current, content: currentContent }))

          // Update thumbnail for previous slide
          const thumbnail = fabricCanvas.toDataURL({ format: "png", quality: 0.3, multiplier: 0.2 })
          dispatch(updateSlideThumbnail({ index: previousSlideIndex.current, thumbnail }))

          console.log("Successfully saved previous slide content for slide", previousSlideIndex.current)
        }
      } catch (error) {
        console.error("Failed to save previous slide content:", error)
      }
    }

    console.log("Loading slide content for slide", activeSlideIndex)

    try {
      fabricCanvas.clear()

      // Load the active slide content
      if (slides[activeSlideIndex].content) {
        fabricCanvas.loadFromJSON(slides[activeSlideIndex].content, () => {
          fabricCanvas.renderAll()
          console.log("Slide content loaded successfully for slide", activeSlideIndex)
        })
      } else {
        // Empty slide
        fabricCanvas.renderAll()
        console.log("Loaded empty slide", activeSlideIndex)
      }

      previousSlideIndex.current = activeSlideIndex
    } catch (error) {
      console.error("Failed to load slide content:", error)
    }
  }, [activeSlideIndex, slides, canvasRef, dispatch])

  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-border">
        <canvas ref={canvasElementRef} className="block" style={{ cursor: "default" }} />
      </div>
    </div>
  )
}
