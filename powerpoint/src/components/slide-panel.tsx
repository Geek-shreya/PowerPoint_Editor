"use client"

import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { addSlide, deleteSlide, setActiveSlide, updateSlideContent } from "@/store/slices/presentationSlice"
import { clearHistory } from "@/store/slices/undoRedoSlice"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import { useCanvas } from "./canvas-context"

export default function SlidePanel() {
  const dispatch = useAppDispatch()
  const { slides, activeSlideIndex } = useAppSelector((state) => state.presentation)
  const { canvasRef } = useCanvas()

  const handleAddSlide = () => {
    dispatch(addSlide())
    dispatch(clearHistory())
  }

  const handleDeleteSlide = (index: number) => {
    if (slides.length > 1) {
      dispatch(deleteSlide(index))
      dispatch(clearHistory())
    }
  }

  const handleSelectSlide = (index: number) => {
    const canvas = canvasRef.current
    if (canvas) {
      try {
        const currentContent = JSON.stringify(canvas.toJSON())
        dispatch(updateSlideContent({ index: activeSlideIndex, content: currentContent }))
      } catch (error) {
        console.error("Failed to save current slide content:", error)
      }
    }

    dispatch(setActiveSlide(index))
    dispatch(clearHistory())
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Slides</h2>
        <Button
          onClick={handleAddSlide}
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0 bg-transparent hover:bg-accent"
          title="Add New Slide"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {slides.map((slide, index) => (
          <Card
            key={slide.id}
            className={`p-3 cursor-pointer transition-all duration-200 hover:bg-accent hover:shadow-md ${
              index === activeSlideIndex ? "ring-2 ring-primary bg-accent shadow-md" : ""
            }`}
            onClick={() => handleSelectSlide(index)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium mb-2">{slide.name}</div>
                <div className="w-full h-16 bg-white border rounded overflow-hidden flex items-center justify-center text-xs text-muted-foreground">
                  {slide.thumbnail ? (
                    <img
                      src={slide.thumbnail || "/placeholder.svg"}
                      alt={slide.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-xs opacity-50">Preview</div>
                    </div>
                  )}
                </div>
              </div>
              {slides.length > 1 && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteSlide(index)
                  }}
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 ml-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Delete Slide"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
        <div className="font-medium mb-1">Shortcuts:</div>
        <div>Ctrl+Z: Undo</div>
        <div>Ctrl+Y: Redo</div>
        <div>Del: Delete selected</div>
      </div>
    </div>
  )
}
