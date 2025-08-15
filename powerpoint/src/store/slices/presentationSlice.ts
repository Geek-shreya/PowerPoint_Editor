import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface Slide {
  id: string
  name: string
  content: string // JSON string of fabric canvas
  thumbnail?: string
}

interface SelectedObjectInfo {
  type?: string
  id?: string
  left?: number
  top?: number
  width?: number
  height?: number
}

export interface PresentationState {
  slides: Slide[]
  activeSlideIndex: number
  selectedTool: "select" | "text" | "rectangle" | "circle" | "line" | "image"
  selectedObject: SelectedObjectInfo | null
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
  selectedTool: "select",
  selectedObject: null,
}

const presentationSlice = createSlice({
  name: "presentation",
  initialState,
  reducers: {
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

        state.slides.forEach((slide, index) => {
          slide.name = `Slide ${index + 1}`
        })

        // Adjust active slide index if necessary
        if (state.activeSlideIndex >= state.slides.length) {
          state.activeSlideIndex = state.slides.length - 1
        } else if (state.activeSlideIndex > action.payload) {
          state.activeSlideIndex = state.activeSlideIndex - 1
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
    setSelectedObject: (state, action: PayloadAction<SelectedObjectInfo | null>) => {
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
