"use client"

import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { loadPresentation } from "@/store/slices/presentationSlice"
import { Button } from "@/components/ui/button" 
import { Save, FolderOpen, Download } from "lucide-react"
    import { useToast } from "@/hooks/use-toast"

export default function FileOperations() {
  const dispatch = useAppDispatch()
  const { slides, canvas } = useAppSelector((state) => state.presentation)
  const { toast } = useToast()

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

            // Reload canvas with first slide
            if (canvas && data.slides[0]?.content) {
              canvas.loadFromJSON(data.slides[0].content, () => {
                canvas.renderAll()
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
    if (!canvas) return

    try {
      const dataURL = canvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2,
      })

      const link = document.createElement("a")
      link.href = dataURL
      link.download = `slide-${Date.now()}.png`
      link.click()

      toast({
        title: "Success",
        description: "Slide exported as image!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export slide.",
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
    </div>
  )
}
