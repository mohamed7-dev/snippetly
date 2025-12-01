import React from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

type PasswordFieldProps = React.ComponentProps<typeof Input>
export function PasswordField(props: PasswordFieldProps) {
  const [show, setShow] = React.useState(false)
  return (
    <div className="w-full h-full rounded-[inherit] flex items-center relative">
      <Input type={show ? 'text' : 'password'} inputMode="text" {...props} />
      <Button
        variant={'ghost'}
        size={'icon'}
        onClick={() => setShow((prev) => !prev)}
        className="size-8 absolute top-1/2 -translate-y-1/2 right-2 [&_svg:not([class*='size-'])]:size-4"
        type="button"
      >
        {show ? <EyeIcon /> : <EyeOffIcon />}
        <span className="sr-only">
          {show ? 'hide password' : 'show password'}
        </span>
      </Button>
    </div>
  )
}
