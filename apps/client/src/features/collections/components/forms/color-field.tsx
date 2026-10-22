import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { PaintBucketIcon, PaletteIcon } from 'lucide-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { COLOR_OPTIONS } from '../../lib/data';

const normalizeColor = (value?: string) => (typeof value === 'string' ? value.trim() : '');

export function ColorField() {
    const form = useFormContext();
    const selectedColor = normalizeColor(form.watch('color'));
    const isPending = form.formState.isSubmitting;

    const isCustomColor = !!selectedColor && !COLOR_OPTIONS.some(option => option.code.toLowerCase() === selectedColor.toLowerCase());

    const handleColorChange = (value: string) => {
        form.setValue('color', value, { shouldDirty: true, shouldTouch: true });
    };

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

                    <div className="space-y-3">
                        <ToggleGroup
                            value={field.value}
                            onValueChange={val => handleColorChange(val || '')}
                            type="single"
                            disabled={isPending}
                            className="w-full grid grid-cols-4 gap-3"
                        >
                            {COLOR_OPTIONS?.map(color => (
                                <ToggleGroupItem
                                    key={color.name}
                                    title={color.name}
                                    className={cn(
                                        'text-xs sm:text-sm h-12 w-full rounded-lg border-2 border-transparent transition-all hover:scale-[1.02] hover:border-primary/70',
                                        color.class,
                                        selectedColor === color.code && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                                    )}
                                    value={color.code}
                                    aria-label={`Toggle ${color.name}`}
                                >
                                    <span className="sr-only">{color.name}</span>
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>

                        <div className="flex items-center gap-3 rounded-lg border border-border bg-input/40 p-3">
                            <label
                                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border bg-background shadow-sm"
                                htmlFor="custom-collection-color"
                                aria-label="Choose custom collection color"
                            >
                                <PaintBucketIcon className="h-4 w-4 text-foreground" />
                            </label>

                            <Input
                                id="custom-collection-color"
                                type="color"
                                value={isCustomColor ? selectedColor : '#2B7FFF'}
                                onChange={event => handleColorChange(event.target.value)}
                                className="h-10 w-16 cursor-pointer border-0 bg-transparent p-0 shadow-none"
                                aria-label="Custom collection color"
                            />

                            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-background px-2.5 py-2">
                                <div
                                    className="h-4 w-4 shrink-0 rounded-full border border-border"
                                    style={{ backgroundColor: selectedColor || '#2B7FFF' }}
                                />
                                <span className="truncate text-xs font-medium text-foreground">
                                    {selectedColor || 'No color selected'}
                                </span>
                            </div>
                        </div>
                    </div>
                </FormItem>
            )}
        />
    );
}
