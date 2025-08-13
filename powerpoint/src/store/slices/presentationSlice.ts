import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type * as fabric from "fabric"

export interface Slide {
  id: string
  name: string
  content: string 
  thumbnail?: string
}

export interface PresentationState {
  slides: Slide[]
  activeSlideIndex: number
  canvas: fabric.Canvas | null
  selectedTool: "select" | "text" | "rectangle" | "circle" | "line" | "image"
  selectedObject: fabric.Object | null
}

const initialState: PresentationState = {
  slides: [
    {
      id: "1",
      name: "Slide 1",
      content: '{"version":"5.3.0","objects":[]}',
    },
  ],
  activeSlideIndex: 0,
  canvas: null,
  selectedTool: "select",
  selectedObject: null,
}

const presentationSlice = createSlice({
  name: "presentation",
  initialState,
  reducers: {
    setCanvas: (state, action: PayloadAction<fabric.Canvas>) => {
      state.canvas = action.payload
    },
    addSlide: (state) => {
      const newSlide: Slide = {
        id: Date.now().toString(),
        name: `Slide ${state.slides.length + 1}`,
        content: '{"version":"5.3.0","objects":[]}',
      }
      state.slides.push(newSlide)
    },
    deleteSlide: (state, action: PayloadAction<number>) => {
      if (state.slides.length > 1) {
        state.slides.splice(action.payload, 1)
        if (state.activeSlideIndex >= state.slides.length) {
          state.activeSlideIndex = state.slides.length - 1
        }
      }
    },
    setActiveSlide: (state, action: PayloadAction<number>) => {
      state.activeSlideIndex = action.payload
    },
    updateSlideContent: (state, action: PayloadAction<{ index: number; content: string }>) => {
      const { index, content } = action.payload
      if (state.slides[index]) {
        state.slides[index].content = content
      }
    },
    setSelectedTool: (state, action: PayloadAction<PresentationState["selectedTool"]>) => {
      state.selectedTool = action.payload
    },
    setSelectedObject: (state, action: PayloadAction<fabric.Object | null>) => {
      state.selectedObject = action.payload
    },
    loadPresentation: (state, action: PayloadAction<{ slides: Slide[] }>) => {
      state.slides = action.payload.slides
      state.activeSlideIndex = 0
    },
    updateSlideThumbnail: (state, action: PayloadAction<{ index: number; thumbnail: string }>) => {
      const { index, thumbnail } = action.payload
      if (state.slides[index]) {
        state.slides[index].thumbnail = thumbnail
      }
    },
  },
})

export const {
  setCanvas,
  addSlide,
  deleteSlide,
  setActiveSlide,
  updateSlideContent,
  setSelectedTool,
  setSelectedObject,
  loadPresentation,
  updateSlideThumbnail,
} = presentationSlice.actions

export default presentationSlice.reducer
