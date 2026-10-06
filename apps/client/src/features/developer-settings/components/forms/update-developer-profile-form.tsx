import { LoadingButton } from '@/components/inputs/loading-button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useFormContext } from 'react-hook-form';
import type { UpdateDeveloperProfileInfoFormSchemaType } from '../../lib/schema';

export function UpdateDeveloperProfileForm({ isPending }: { isPending: boolean }) {
    const updateProfileForm = useFormContext<UpdateDeveloperProfileInfoFormSchemaType>();

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={updateProfileForm.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter your first name"
                                    {...field}
                                    value={field.value ?? undefined}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={updateProfileForm.control}
                    name="lastName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter your last name"
                                    {...field}
                                    value={field.value ?? undefined}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <FormField
                control={updateProfileForm.control}
                name="bio"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Tell us more about your self"
                                rows={5}
                                {...field}
                                value={field.value ?? ''}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <FormField
                    control={updateProfileForm.control}
                    name="isPrivate"
                    render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 h-10 px-3 py-2 border border-border rounded-md bg-input">
                            <FormControl>
                                <Switch
                                    disabled={isPending}
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <FormLabel>Make account private</FormLabel>
                        </FormItem>
                    )}
                />
            </div>
            <LoadingButton isLoading={isPending} type="submit">
                Update Profile
            </LoadingButton>
        </div>
    );
}
