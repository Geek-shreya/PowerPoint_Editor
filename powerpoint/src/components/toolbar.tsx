"use client"

import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { setSelectedTool } from "@/store/slices/presentationSlice"
import { undo, redo, saveState } from "@/store/slices/undoRedoSlice"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MousePointer2, Type, Square, Circle, Minus, ImageIcon, Undo, Redo } from "lucide-react"
import * as fabric from "fabric"
import FileOperations from "./file-operations"
import { useEffect } from "react"
import { store } from "@/store/store"

export default function Toolbar() {
  const dispatch = useAppDispatch()
  const { selectedTool, canvas, selectedObject } = useAppSelector((state) => state.presentation)
  const { canUndo, canRedo } = useAppSelector((state) => state.undoRedo)

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
  }, [canUndo, canRedo, selectedObject, canvas])

  const handleToolSelect = (tool: typeof selectedTool) => {
    dispatch(setSelectedTool(tool))
  }

  const saveCanvasState = () => {
    if (canvas) {
      try {
        const canvasData = JSON.stringify(canvas.toJSON())
        dispatch(saveState(canvasData))
      } catch (error) {
        console.error("Failed to save canvas state:", error)
      }
    }
  }

  const handleUndo = () => {
    if (!canUndo || !canvas) {
      console.log("Cannot undo: canUndo =", canUndo, "canvas =", !!canvas)
      return
    }

    try {
      dispatch(undo())
      // Use a small delay to ensure Redux state is updated
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
  }

  const handleRedo = () => {
    if (!canRedo || !canvas) {
      console.log("Cannot redo: canRedo =", canRedo, "canvas =", !!canvas)
      return
    }

    try {
      dispatch(redo())
      // Use a small delay to ensure Redux state is updated
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
  }

  const addTextBox = () => {
    if (!canvas) {
      console.error("Canvas not available for adding text box")
      return
    }

    try {
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
    if (!canvas) {
      console.error("Canvas not available for adding rectangle")
      return
    }

    try {
      const rect = new fabric.Rect({
        left: 100,
        top: 100,
        width: 150,
        height: 100,
        fill: "transparent", // Transparent fill so we can see through it
        stroke: "#000000", // Black stroke for visibility
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
    if (!canvas) {
      console.error("Canvas not available for adding circle")
      return
    }

    try {
      const circle = new fabric.Circle({
        left: 100,
        top: 100,
        radius: 50,
        fill: "transparent", // Transparent fill so we can see through it
        stroke: "#000000", // Black stroke for visibility
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
    if (!canvas) {
      console.error("Canvas not available for adding line")
      return
    }

    try {
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
    if (!canvas) {
      console.error("Canvas not available for adding image")
      return
    }

    try {
      const input = document.createElement("input")
      input.type = "file"
      input.accept = "image/*"

      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file || !canvas) return

        const reader = new FileReader()
        reader.onload = (event) => {
          const imgUrl = event.target?.result as string
          fabric.Image.fromURL(imgUrl, (img) => {
            img.set({
              left: 100,
              top: 100,
              scaleX: 0.5,
              scaleY: 0.5,
            })
            canvas.add(img)
            canvas.setActiveObject(img)
            canvas.renderAll()
            saveCanvasState()
            console.log("Image added successfully")
          })
        }
        reader.readAsDataURL(file)
      }

      input.click()
    } catch (error) {
      console.error("Failed to add image:", error)
    }
  }

  const deleteSelected = () => {
    if (!canvas || !selectedObject) {
      console.log("Cannot delete: canvas =", !!canvas, "selectedObject =", !!selectedObject)
      return
    }

    try {
      canvas.remove(selectedObject)
      canvas.renderAll()
      saveCanvasState()
      console.log("Selected object deleted successfully")
    } catch (error) {
      console.error("Failed to delete selected object:", error)
    }
  }

  return (
    <div className="p-4 flex items-center gap-2 bg-background border-b">
      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={handleUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Selection Tools */}
      <div className="flex items-center gap-1">
        <Button
          variant={selectedTool === "select" ? "default" : "outline"}
          size="sm"
          onClick={() => handleToolSelect("select")}
          title="Select Tool"
        >
          <MousePointer2 className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Add Elements */}
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

      {/* Object Actions */}
      {selectedObject && (
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

      {/* File Operations */}
      <FileOperations />
    </div>
  )
}
