import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "./Input"
import { Button } from "./Button"

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    return (
      <div className={cn("relative w-full sm:w-auto", className)}>
        <Input
          type={showPassword ? "text" : "password"}
          ref={ref}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword((prev) => !prev)}
          disabled={props.disabled}
        >
          {showPassword ? (
            <span className="sr-only">Hide password</span>
          ) : (
            <span className="sr-only">Show password</span>
          )}
          {/* Icon could be added here */}
        </Button>
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
