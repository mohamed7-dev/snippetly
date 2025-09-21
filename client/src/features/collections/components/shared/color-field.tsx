import { FormField, FormItem, FormLabel } from '@/components/ui/form'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { PaletteIcon } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { COLOR_OPTIONS } from '../../lib/data'
import { cn } from '@/lib/utils'

export function ColorField() {
  const form = useFormContext()
  const selectedColor = useFormContext().watch('color')
  const isPending = useFormContext().formState.isSubmitting
  return (
    <FormField
      control={form.control}
      name="color"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel className="flex items-center gap-2">
            <PaletteIcon className="h-4 w-4" />
            Collection Color
          </FormLabel>
          <ToggleGroup
            value={field.value}
            onValueChange={(val) => form.setValue('color', val)}
            type="single"
            disabled={isPending}
            className="w-full grid grid-cols-4 gap-3"
          >
            {COLOR_OPTIONS?.map((color) => (
              <ToggleGroupItem
                key={color.name}
                title={color.name}
                className={cn(
                  `text-xs sm:text-sm h-12 w-full rounded-lg data-[state=on]:${color.class} ${color.class} hover:${color.class} hover:scale-105 transition-transform border-2 border-transparent hover:border-primary`,
                )}
                value={color.code}
                aria-label={`Toggle ${color.name}`}
              >
                {selectedColor === color.code ? 'Selected' : ''}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </FormItem>
      )}
    />
  )
}
