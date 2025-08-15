"use client"

import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { setSelectedTool } from "@/store/slices/presentationSlice"
import { undo, redo, saveState } from "@/store/slices/undoRedoSlice"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Type, Square, Circle, Minus, ImageIcon, Undo, Redo } from "lucide-react"
import * as fabric from "fabric"
import FileOperations from "./file-operations"
import { useEffect, useCallback } from "react"
import { store } from "@/store/store"
import { useCanvas } from "./canvas-context"

export default function Toolbar() {
  const dispatch = useAppDispatch()
  const { canvasRef } = useCanvas()
  const { selectedTool } = useAppSelector((state) => state.presentation)
  const { canUndo, canRedo } = useAppSelector((state) => state.undoRedo)

  const saveCanvasState = useCallback(() => {
    const canvas = canvasRef.current
    if (canvas) {
      try {
        const canvasData = JSON.stringify(canvas.toJSON())
        dispatch(saveState(canvasData))
      } catch (error) {
        console.error("Failed to save canvas state:", error)
      }
    }
  }, [canvasRef, dispatch])

  const handleUndo = useCallback(() => {
    const canvas = canvasRef.current
    if (!canUndo || !canvas) {
      console.log("Cannot undo: canUndo =", canUndo, "canvas =", !!canvas)
      return
    }

    try {
      dispatch(undo())
      setTimeout(() => {
        const state = store.getState()
        const currentState = state.undoRedo.present
        if (currentState) {
          canvas.loadFromJSON(currentState, () => {
            canvas.renderAll()
          })
        }
      }, 10)
    } catch (error) {
      console.error("Undo failed:", error)
    }
  }, [canUndo, canvasRef, dispatch])

  const handleRedo = useCallback(() => {
    const canvas = canvasRef.current
    if (!canRedo || !canvas) {
      console.log("Cannot redo: canRedo =", canRedo, "canvas =", !!canvas)
      return
    }

    try {
      dispatch(redo())
      setTimeout(() => {
        const state = store.getState()
        const currentState = state.undoRedo.present
        if (currentState) {
          canvas.loadFromJSON(currentState, () => {
            canvas.renderAll()
          })
        }
      }, 10)
    } catch (error) {
      console.error("Redo failed:", error)
    }
  }, [canRedo, canvasRef, dispatch])

  const deleteSelected = useCallback(() => {
    const canvas = canvasRef.current
    const activeObject = canvas?.getActiveObject()

    if (!canvas || !activeObject) {
      console.log("Cannot delete: canvas =", !!canvas, "activeObject =", !!activeObject)
      return
    }

    try {
      canvas.remove(activeObject)
      canvas.renderAll()
      saveCanvasState()
      console.log("Selected object deleted successfully")
    } catch (error) {
      console.error("Failed to delete selected object:", error)
    }
  }, [canvasRef, saveCanvasState])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "z":
            e.preventDefault()
            if (e.shiftKey) {
              handleRedo()
            } else {
              handleUndo()
            }
            break
          case "y":
            e.preventDefault()
            handleRedo()
            break
          case "Delete":
          case "Backspace":
            e.preventDefault()
            deleteSelected()
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleUndo, handleRedo, deleteSelected, saveCanvasState])

  const handleToolSelect = (tool: typeof selectedTool) => {
    dispatch(setSelectedTool(tool))
  }

  const addTextBox = () => {
    const canvas = canvasRef.current
    if (!canvas) {
      console.error("Canvas not available for adding text box. Canvas ref:", !!canvasRef.current)
      return
    }

    try {
      console.log("Adding text box to canvas...")
      const text = new fabric.Textbox("Click to edit text", {
        left: 100,
        top: 100,
        width: 200,
        fontSize: 20,
        fill: "#000000",
        fontFamily: "Arial",
      })

      canvas.add(text)
      canvas.setActiveObject(text)
      canvas.renderAll()
      saveCanvasState()
      console.log("Text box added successfully")
    } catch (error) {
      console.error("Failed to add text box:", error)
    }
  }

  const addRectangle = () => {
    const canvas = canvasRef.current
    if (!canvas) {
      console.error("Canvas not available for adding rectangle. Canvas ref:", !!canvasRef.current)
      return
    }

    try {
      console.log("Adding rectangle to canvas...")
      const rect = new fabric.Rect({
        left: 100,
        top: 100,
        width: 150,
        height: 100,
        fill: "transparent",
        stroke: "#000000",
        strokeWidth: 2,
      })

      canvas.add(rect)
      canvas.setActiveObject(rect)
      canvas.renderAll()
      saveCanvasState()
      console.log("Rectangle added successfully")
    } catch (error) {
      console.error("Failed to add rectangle:", error)
    }
  }

  const addCircle = () => {
    const canvas = canvasRef.current
    if (!canvas) {
      console.error("Canvas not available for adding circle. Canvas ref:", !!canvasRef.current)
      return
    }

    try {
      console.log("Adding circle to canvas...")
      const circle = new fabric.Circle({
        left: 100,
        top: 100,
        radius: 50,
        fill: "transparent",
        stroke: "#000000",
        strokeWidth: 2,
      })

      canvas.add(circle)
      canvas.setActiveObject(circle)
      canvas.renderAll()
      saveCanvasState()
      console.log("Circle added successfully")
    } catch (error) {
      console.error("Failed to add circle:", error)
    }
  }

  const addLine = () => {
    const canvas = canvasRef.current
    if (!canvas) {
      console.error("Canvas not available for adding line. Canvas ref:", !!canvasRef.current)
      return
    }

    try {
      console.log("Adding line to canvas...")
      const line = new fabric.Line([50, 100, 200, 100], {
        stroke: "#000000",
        strokeWidth: 3,
      })

      canvas.add(line)
      canvas.setActiveObject(line)
      canvas.renderAll()
      saveCanvasState()
      console.log("Line added successfully")
    } catch (error) {
      console.error("Failed to add line:", error)
    }
  }

  const addImage = () => {
    const canvas = canvasRef.current
    if (!canvas) {
      console.error("Canvas not available for adding image. Canvas ref:", !!canvasRef.current)
      return
    }

    try {
      console.log("Opening image file picker...")
      const input = document.createElement("input")
      input.type = "file"
      input.accept = "image/*"

      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file || !canvas) {
          console.error("No file selected or canvas not available")
          return
        }

        console.log("Processing image file:", file.name)
        const reader = new FileReader()
        reader.onload = (event) => {
          const imgUrl = event.target?.result as string
          console.log("Loading image into canvas...")

          const imgElement = new Image()
          imgElement.crossOrigin = "anonymous"
          imgElement.onload = () => {
            try {
              const fabricImg = new fabric.Image(imgElement, {
                left: 100,
                top: 100,
                scaleX: Math.min(200 / imgElement.width, 1),
                scaleY: Math.min(200 / imgElement.height, 1),
              })

              canvas.add(fabricImg)
              canvas.setActiveObject(fabricImg)
              canvas.renderAll()
              saveCanvasState()
              console.log("Image added successfully")
            } catch (error) {
              console.error("Failed to create fabric image:", error)
            }
          }
          imgElement.onerror = (error) => {
            console.error("Failed to load image:", error)
          }
          imgElement.src = imgUrl
        }
        reader.onerror = (error) => {
          console.error("Failed to read file:", error)
        }
        reader.readAsDataURL(file)
      }

      input.click()
    } catch (error) {
      console.error("Failed to add image:", error)
    }
  }

  return (
    <div className="p-4 flex items-center gap-2 bg-background border-b">
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={handleUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Button
          variant={selectedTool === "select" ? "default" : "outline"}
          size="sm"
          onClick={() => handleToolSelect("select")}
          title="Select Tool"
        >
          {/* Placeholder for select tool icon */}
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={addTextBox} title="Add Text">
          <Type className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={addRectangle} title="Add Rectangle">
          <Square className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={addCircle} title="Add Circle">
          <Circle className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={addLine} title="Add Line">
          <Minus className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={addImage} title="Add Image">
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {canvasRef.current?.getActiveObject() && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={deleteSelected}
            className="text-destructive hover:text-destructive bg-transparent"
            title="Delete Selected (Del)"
          >
            Delete
          </Button>
        </div>
      )}

      <div className="flex-1" />

      <FileOperations />
    </div>
  )
}
