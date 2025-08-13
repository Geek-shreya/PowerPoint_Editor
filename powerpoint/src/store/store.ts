import { configureStore } from "@reduxjs/toolkit"
import presentationSlice from "./slices/presentationSlice"
import undoRedoSlice from "./slices/undoRedoSlice"

export const store = configureStore({
  reducer: {
    presentation: presentationSlice,
    undoRedo: undoRedoSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["presentation/setCanvas"],
        ignoredPaths: ["presentation.canvas"],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
