"use client"

import SlidePanel from "./slide-panel"
import CanvasArea from "./canvas-area"
import Toolbar from "./toolbar"
import PropertyPanel from "./property-panel"
import { CanvasProvider } from "./canvas-context"

export default function PresentationEditor() {
  return (
    <CanvasProvider>
      <div className="flex h-full bg-background">
        {/* Slide Panel */}
        <div className="w-64 border-r border-border bg-muted/30 flex-shrink-0">
          <SlidePanel />
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <Toolbar />

          {/* Canvas and Property Panel */}
          <div className="flex-1 flex min-h-0">
            {/* Canvas Area */}
            <div className="flex-1 bg-muted/10">
              <CanvasArea />
            </div>

            {/* Property Panel */}
            <div className="border-l border-border bg-muted/30 p-4 flex-shrink-0">
              <PropertyPanel />
            </div>
          </div>
        </div>
      </div>
    </CanvasProvider>
  )
}
