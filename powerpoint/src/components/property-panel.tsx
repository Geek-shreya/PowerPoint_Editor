"use client"

import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { updateSlideContent } from "@/store/slices/presentationSlice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { useCanvas } from "./canvas-context"

interface FabricObjectWithProperties {
  fill?: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
  fontSize?: number
  fontFamily?: string
  text?: string
  [key: string]: unknown
}

export default function PropertyPanel() {
  const { selectedObject, activeSlideIndex } = useAppSelector((state) => state.presentation)
  const { canvasRef } = useCanvas()
  const dispatch = useAppDispatch()

  const [properties, setProperties] = useState({
    fill: "#000000",
    stroke: "#000000",
    strokeWidth: 1,
    opacity: 1,
    fontSize: 20,
    fontFamily: "Arial",
    text: "",
  })

  useEffect(() => {
    if (selectedObject) {
      const obj = selectedObject as FabricObjectWithProperties
      setProperties({
        fill: obj.fill || "#000000",
        stroke: obj.stroke || "#000000",
        strokeWidth: obj.strokeWidth || 1,
        opacity: selectedObject.opacity || 1,
        fontSize: obj.fontSize || 20,
        fontFamily: obj.fontFamily || "Arial",
        text: obj.text || "",
      })
    }
  }, [selectedObject])

  const updateProperty = (property: string, value: string | number) => {
    if (!selectedObject || !canvasRef.current) return
    const obj = selectedObject as FabricObjectWithProperties
    obj[property] = value
    canvasRef.current.renderAll()

    // Save canvas state
    const canvasData = JSON.stringify(canvasRef.current.toJSON())
    dispatch(updateSlideContent({ index: activeSlideIndex, content: canvasData }))

    setProperties((prev) => ({ ...prev, [property]: value }))
  }

  if (!selectedObject) {
    return (
      <Card className="w-80">
        <CardHeader>
          <CardTitle className="text-sm">Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Select an object to edit its properties</p>
        </CardContent>
      </Card>
    )
  }

  const objectType = selectedObject.type

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="text-sm">Properties - {objectType}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fill Color */}
        {(objectType === "rect" || objectType === "circle" || objectType === "textbox") && (
          <div className="space-y-2">
            <Label className="text-xs">Fill Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={properties.fill}
                onChange={(e) => updateProperty("fill", e.target.value)}
                className="w-12 h-8 p-0 border-0"
              />
              <Input
                value={properties.fill}
                onChange={(e) => updateProperty("fill", e.target.value)}
                className="flex-1 text-xs"
              />
            </div>
          </div>
        )}

        {/* Stroke Color */}
        {(objectType === "rect" || objectType === "circle" || objectType === "line") && (
          <div className="space-y-2">
            <Label className="text-xs">Stroke Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={properties.stroke}
                onChange={(e) => updateProperty("stroke", e.target.value)}
                className="w-12 h-8 p-0 border-0"
              />
              <Input
                value={properties.stroke}
                onChange={(e) => updateProperty("stroke", e.target.value)}
                className="flex-1 text-xs"
              />
            </div>
          </div>
        )}

        {/* Stroke Width */}
        {(objectType === "rect" || objectType === "circle" || objectType === "line") && (
          <div className="space-y-2">
            <Label className="text-xs">Stroke Width</Label>
            <Slider
              value={[properties.strokeWidth]}
              onValueChange={([value]) => updateProperty("strokeWidth", value)}
              max={20}
              min={0}
              step={1}
              className="w-full"
            />
            <span className="text-xs text-muted-foreground">{properties.strokeWidth}px</span>
          </div>
        )}

        {/* Opacity */}
        <div className="space-y-2">
          <Label className="text-xs">Opacity</Label>
          <Slider
            value={[properties.opacity * 100]}
            onValueChange={([value]) => updateProperty("opacity", value / 100)}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
          <span className="text-xs text-muted-foreground">{Math.round(properties.opacity * 100)}%</span>
        </div>

        {/* Text Properties */}
        {objectType === "textbox" && (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Text</Label>
              <Input
                value={properties.text}
                onChange={(e) => updateProperty("text", e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Font Size</Label>
              <Slider
                value={[properties.fontSize]}
                onValueChange={([value]) => updateProperty("fontSize", value)}
                max={72}
                min={8}
                step={1}
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">{properties.fontSize}px</span>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Font Family</Label>
              <Select value={properties.fontFamily} onValueChange={(value) => updateProperty("fontFamily", value)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Verdana">Verdana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Position */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">X Position</Label>
            <Input
              type="number"
              value={Math.round(selectedObject.left || 0)}
              onChange={(e) => updateProperty("left", Number.parseInt(e.target.value))}
              className="text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Y Position</Label>
            <Input
              type="number"
              value={Math.round(selectedObject.top || 0)}
              onChange={(e) => updateProperty("top", Number.parseInt(e.target.value))}
              className="text-xs"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
