import { Label } from '@/components/ui/label'

export function ThemePreviewSection() {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Preview</Label>
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Code Snippet Preview</h3>
        </div>
        <div className="bg-muted rounded-md p-3 font-mono text-sm">
          <div className="text-blue-600 dark:text-blue-400">function</div>
          <div className="text-purple-600 dark:text-purple-400 ml-2">
            greetUser
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            (name: string) {`{`}
          </div>
          <div className="ml-4 text-green-600 dark:text-green-400">
            return `Hello, ${`{name}`}!`
          </div>
          <div className="text-gray-600 dark:text-gray-400">{`}`}</div>
        </div>
      </div>
    </div>
  )
}
