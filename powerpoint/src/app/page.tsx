"use client"

import { Provider } from "react-redux"
import { store } from "@/store/store"
import PresentationEditor from "@/components/presentation-editor"

export default function Home() {
  return (
    <Provider store={store}>
      <div className="h-screen w-full bg-background">
        <PresentationEditor />
      </div>
    </Provider>
  )
}
