"use client"

import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { loadPresentation, setActiveSlide } from "@/store/slices/presentationSlice"
import { Button } from "@/components/ui/button"
import { Save, FolderOpen, Download, FileDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCanvas } from "./canvas-context"

export default function FileOperations() {
  const dispatch = useAppDispatch()
  const { slides, activeSlideIndex } = useAppSelector((state) => state.presentation)
  const { toast } = useToast()
  const { canvasRef } = useCanvas()

  const savePresentation = () => {
    try {
      const presentationData = {
        slides: slides,
        version: "1.0.0",
        createdAt: new Date().toISOString(),
      }

      const dataStr = JSON.stringify(presentationData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })

      const link = document.createElement("a")
      link.href = URL.createObjectURL(dataBlob)
      link.download = `presentation-${Date.now()}.json`
      link.click()

      URL.revokeObjectURL(link.href)

      toast({
        title: "Success",
        description: "Presentation saved successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save presentation.",
        variant: "destructive",
      })
    }
  }

  const loadPresentationFile = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string)

          if (data.slides && Array.isArray(data.slides)) {
            dispatch(loadPresentation({ slides: data.slides }))

            if (canvasRef.current && data.slides[0]?.content) {
              canvasRef.current.loadFromJSON(data.slides[0].content, () => {
                canvasRef.current?.renderAll()
              })
            }

            toast({
              title: "Success",
              description: "Presentation loaded successfully!",
            })
          } else {
            throw new Error("Invalid file format")
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load presentation. Please check the file format.",
            variant: "destructive",
          })
        }
      }
      reader.readAsText(file)
    }

    input.click()
  }

  const exportSlideAsImage = () => {
    if (!canvasRef.current) {
      toast({
        title: "Error",
        description: "Canvas not available for export.",
        variant: "destructive",
      })
      return
    }

    try {
      const dataURL = canvasRef.current.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2,
      })

      const link = document.createElement("a")
      link.href = dataURL
      link.download = `slide-${activeSlideIndex + 1}.png`
      link.click()

      toast({
        title: "Success",
        description: "Slide exported as image!",
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Error",
        description: "Failed to export slide.",
        variant: "destructive",
      })
    }
  }

  const exportAllSlides = async () => {
    if (!canvasRef.current) {
      toast({
        title: "Error",
        description: "Canvas not available for export.",
        variant: "destructive",
      })
      return
    }

    try {
      const originalActiveSlide = activeSlideIndex

      for (let i = 0; i < slides.length; i++) {
        dispatch(setActiveSlide(i))

        if (slides[i].content) {
          await new Promise<void>((resolve) => {
            canvasRef.current?.loadFromJSON(slides[i].content, () => {
              canvasRef.current?.renderAll()
              resolve()
            })
          })
        }

        await new Promise((resolve) => setTimeout(resolve, 100))

        const dataURL = canvasRef.current.toDataURL({
          format: "png",
          quality: 1,
          multiplier: 2,
        })

        const link = document.createElement("a")
        link.href = dataURL
        link.download = `slide-${i + 1}.png`
        link.click()

        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      dispatch(setActiveSlide(originalActiveSlide))
      if (slides[originalActiveSlide]?.content) {
        canvasRef.current.loadFromJSON(slides[originalActiveSlide].content, () => {
          canvasRef.current?.renderAll()
        })
      }

      toast({
        title: "Success",
        description: `All ${slides.length} slides exported successfully!`,
      })
    } catch (error) {
      console.error("Export all error:", error)
      toast({
        title: "Error",
        description: "Failed to export all slides.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="sm" onClick={loadPresentationFile}>
        <FolderOpen className="h-4 w-4 mr-1" />
        Load
      </Button>
      <Button variant="outline" size="sm" onClick={savePresentation}>
        <Save className="h-4 w-4 mr-1" />
        Save
      </Button>
      <Button variant="outline" size="sm" onClick={exportSlideAsImage}>
        <Download className="h-4 w-4 mr-1" />
        Export
      </Button>
      <Button variant="outline" size="sm" onClick={exportAllSlides}>
        <FileDown className="h-4 w-4 mr-1" />
        Export All
      </Button>
    </div>
  )
}
