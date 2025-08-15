# PowerPoint Editor 

A full-stack, production-ready PowerPoint-style presentation editor built with Next.js, Fabric.js, and Redux Toolkit.

## 🚀 Live Demo

[View Live Application](https://powerpoint-editor.vercel.app)

## ✨ Features

### Core Functionality
- **Slide Management**: Add, delete, and navigate between slides
- **Canvas Editor**: Powered by Fabric.js for smooth object manipulation
- **Element Support**: Text boxes, images, rectangles, circles, and lines
- **File Operations**: Save presentations as JSON and load them back
- **State Management**: Redux Toolkit for robust state handling

### Advanced Features
- **Undo/Redo**: Full undo/redo functionality with keyboard shortcuts
- **Property Panel**: Real-time editing of object properties
- **Slide Thumbnails**: Visual preview of all slides
- **Image Export**: Export individual slides as PNG images
- **Keyboard Shortcuts**: Ctrl+Z (undo), Ctrl+Y (redo), Del (delete)
- **Responsive Design**: Works on desktop and tablet devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Canvas**: Fabric.js
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/Geek-shreya/PowerPoint_Editor.git
   cd powerpoint
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### Creating Presentations
1. **Add Elements**: Use the toolbar to add text, shapes, or images
2. **Edit Properties**: Select any object to edit its properties in the right panel
3. **Manage Slides**: Add new slides or delete existing ones from the left panel
4. **Save Work**: Use the "Save" button to download your presentation as JSON

### Loading Presentations
1. Click the "Load" button in the toolbar
2. Select a previously saved JSON file
3. Your presentation will be restored with all slides and content

### Keyboard Shortcuts
- `Ctrl+Z`: Undo last action
- `Ctrl+Y` or `Ctrl+Shift+Z`: Redo action
- `Delete`: Remove selected object

## 📁 Project Structure

\`\`\`
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main application page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── canvas-area.tsx     # Fabric.js canvas component
│   ├── file-operations.tsx # Save/load functionality
│   ├── presentation-editor.tsx # Main editor layout
│   ├── property-panel.tsx  # Object property editor
│   ├── slide-panel.tsx     # Slide navigation
│   └── toolbar.tsx         # Main toolbar
├── store/
│   ├── slices/
│   │   ├── presentationSlice.ts # Main app state
│   │   └── undoRedoSlice.ts     # Undo/redo state
│   ├── hooks.ts            # Typed Redux hooks
│   └── store.ts            # Redux store configuration
└── example-presentation.json # Sample presentation file
\`\`\`

## 🎨 Key Design Decisions

### State Management
- **Redux Toolkit** for predictable state updates
- Separate slices for presentation data and undo/redo functionality
- Middleware configuration to handle non-serializable canvas objects

### Canvas Integration
- **Fabric.js** for powerful canvas manipulation
- Event-driven updates to sync canvas state with Redux
- Automatic thumbnail generation for slide previews

### File Persistence
- JSON format for cross-platform compatibility
- Browser File System API for local file operations
- Structured data format with version information

### User Experience
- Real-time property editing with immediate visual feedback
- Keyboard shortcuts for power users
- Responsive layout that works on different screen sizes

## 🧪 Testing the Application

1. **Load the example presentation**:
   - Click "Load" and select `example-presentation.json`
   - Explore the pre-built slides with various elements

2. **Create new content**:
   - Add text boxes and edit their content
   - Insert shapes and modify their colors
   - Upload images and resize them

3. **Test persistence**:
   - Make changes and save the presentation
   - Reload the page and load your saved file
   - Verify all content is preserved

## 🚀 Deployment

The application is deployed on Vercel and fully functional in production:

1. **Build the application**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Deploy to Vercel**
   \`\`\`bash
   vercel --prod
   \`\`\`

