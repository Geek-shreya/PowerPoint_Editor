"use client"

import { useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { updateSlideContent, setSelectedObject, updateSlideThumbnail } from "@/store/slices/presentationSlice"
import { saveState } from "@/store/slices/undoRedoSlice"
import * as fabric  from "fabric"
import { useCanvas } from "./canvas-context"

interface FabricSelectionEvent {
  selected: fabric.Object[]
}

interface FabricObjectWithId extends fabric.Object {
  id?: string
  uuid?: string
}

interface FabricObjectWithOpacity extends fabric.Object {
  opacity: number
}

export default function CanvasArea() {
  const canvasElementRef = useRef<HTMLCanvasElement>(null)
  const { canvasRef } = useCanvas()
  const previousSlideIndex = useRef<number>(0)
  const dispatch = useAppDispatch()
  const { activeSlideIndex, slides } = useAppSelector((state) => state.presentation)

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasElementRef.current || canvasRef.current) return

    // Ensure canvas element is properly mounted and has context
    const canvasElement = canvasElementRef.current
    const context = canvasElement.getContext("2d")
    if (!context) {
      console.error("Failed to get 2D context from canvas element")
      return
    }

    try {
      console.log("Initializing Fabric.js canvas...")

      const fabricCanvas = new fabric.Canvas(canvasElement, {
        width: 800,
        height: 600,
        backgroundColor: "#ffffff",
        selection: true,
        preserveObjectStacking: true,
      })

      if (!fabricCanvas || !fabricCanvas.getContext()) {
        console.error("Failed to create Fabric.js canvas or get context")
        return
      }

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

    const handleSelectionCreated = (e: FabricSelectionEvent) => {
      const selectedObject = e.selected[0]
      if (selectedObject) {
        const objectWithId = selectedObject as FabricObjectWithId
        const objectWithOpacity = selectedObject as FabricObjectWithOpacity
        dispatch(
          setSelectedObject({
            type: selectedObject.type,
            id: objectWithId.id || objectWithId.uuid,
            left: selectedObject.left,
            top: selectedObject.top,
            width: selectedObject.width,
            height: selectedObject.height,
            opacity: objectWithOpacity.opacity || 1,
          }),
        )
      } else {
        dispatch(setSelectedObject(null))
      }
    }

    const handleSelectionUpdated = (e: FabricSelectionEvent) => {
      const selectedObject = e.selected[0]
      if (selectedObject) {
        const objectWithId = selectedObject as FabricObjectWithId
        const objectWithOpacity = selectedObject as FabricObjectWithOpacity
        dispatch(
          setSelectedObject({
            type: selectedObject.type,
            id: objectWithId.id || objectWithId.uuid,
            left: selectedObject.left,
            top: selectedObject.top,
            width: selectedObject.width,
            height: selectedObject.height,
            opacity: objectWithOpacity.opacity || 1,
          }),
        )
      } else {
        dispatch(setSelectedObject(null))
      }
    }

    const handleSelectionCleared = () => {
      dispatch(setSelectedObject(null))
    }

    const handleObjectModified = () => {
      try {
        if (!canvasRef.current) return
        const canvasData = JSON.stringify(canvasRef.current.toJSON())
        dispatch(updateSlideContent({ index: activeSlideIndex, content: canvasData }))
        dispatch(saveState(canvasData))

        // Update thumbnail
        const thumbnail = canvasRef.current.toDataURL({ format: "png", quality: 0.3, multiplier: 0.2 })
        dispatch(updateSlideThumbnail({ index: activeSlideIndex, thumbnail }))
      } catch (error) {
        console.error("Failed to handle object modification:", error)
      }
    }

    const handleTextChanged = () => {
      // Small delay to ensure text changes are committed to the object
      setTimeout(() => {
        handleObjectModified()
      }, 100)
    }

    const handleTextEditingExited = () => {
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
    if (!fabricCanvas || !fabricCanvas.getContext()) {
      return
    }

    if (!slides[activeSlideIndex]) return

    if (previousSlideIndex.current !== activeSlideIndex) {
      try {
        const currentContent = JSON.stringify(fabricCanvas.toJSON())
        // Only save if the previous slide index is valid
        if (previousSlideIndex.current >= 0 && previousSlideIndex.current < slides.length) {
          dispatch(updateSlideContent({ index: previousSlideIndex.current, content: currentContent }))

          // Update thumbnail for previous slide
          const thumbnail = fabricCanvas.toDataURL({ format: "png", quality: 0.3, multiplier: 0.2 })
          dispatch(updateSlideThumbnail({ index: previousSlideIndex.current, thumbnail }))
        }
      } catch (error) {
        console.error("Failed to save previous slide content:", error)
      }
    }

    try {
      const context = fabricCanvas.getContext()
      if (!context) {
        console.error("Canvas context lost, cannot clear canvas")
        return
      }

      fabricCanvas.clear()

      // Load the active slide content
      if (slides[activeSlideIndex].content) {
        fabricCanvas.loadFromJSON(slides[activeSlideIndex].content, () => {
          fabricCanvas.renderAll()
        })
      } else {
        // Empty slide
        fabricCanvas.renderAll()
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
