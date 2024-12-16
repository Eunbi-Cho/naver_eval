import AdvancedCSVEditor from './components/advanced-csv-editor'
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <AdvancedCSVEditor />
      <Toaster />
    </main>
  )
}

