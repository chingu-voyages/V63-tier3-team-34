import { useState } from 'react'
import { Button } from '@/components/ui/button'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-semibold tracking-tight">Client</h1>
      <p className="text-muted-foreground">React 19 + TypeScript + Tailwind CSS + shadcn/ui</p>
      <div className="flex items-center gap-3">
        <Button onClick={() => setCount((c) => c + 1)}>Count: {count}</Button>
        <Button variant="outline" onClick={() => setCount(0)}>
          Reset
        </Button>
      </div>
    </main>
  )
}

export default App
