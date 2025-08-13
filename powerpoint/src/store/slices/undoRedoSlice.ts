import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface UndoRedoState {
  past: string[]
  present: string
  future: string[]
  canUndo: boolean
  canRedo: boolean
}

const initialState: UndoRedoState = {
  past: [],
  present: '{"version":"5.3.0","objects":[]}',
  future: [],
  canUndo: false,
  canRedo: false,
}

const undoRedoSlice = createSlice({
  name: "undoRedo",
  initialState,
  reducers: {
    saveState: (state, action: PayloadAction<string>) => {
      state.past.push(state.present)
      state.present = action.payload
      state.future = []

      // Limit history to 50 states
      if (state.past.length > 50) {
        state.past.shift()
      }

      state.canUndo = state.past.length > 0
      state.canRedo = false
    },
    undo: (state) => {
      if (state.past.length > 0) {
        state.future.unshift(state.present)
        state.present = state.past.pop()!

        state.canUndo = state.past.length > 0
        state.canRedo = true
      }
    },
    redo: (state) => {
      if (state.future.length > 0) {
        state.past.push(state.present)
        state.present = state.future.shift()!

        state.canUndo = true
        state.canRedo = state.future.length > 0
      }
    },
    clearHistory: (state) => {
      state.past = []
      state.future = []
      state.canUndo = false
      state.canRedo = false
    },
  },
})

export const { saveState, undo, redo, clearHistory } = undoRedoSlice.actions
export default undoRedoSlice.reducer
