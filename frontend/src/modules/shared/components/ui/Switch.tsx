import * as React from "react"

interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
    ({ className, checked, onCheckedChange, ...props }, ref) => (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            data-state={checked ? "checked" : "unchecked"}
            onClick={() => onCheckedChange?.(!checked)}
            className={`
        peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50
        data-[state=checked]:bg-indigo-600 data-[state=unchecked]:bg-slate-200 dark:data-[state=checked]:bg-indigo-500 dark:data-[state=unchecked]:bg-slate-700
        ${className}
      `}
            ref={ref}
            {...props}
        >
            <span
                data-state={checked ? "checked" : "unchecked"}
                className={`
          pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0
        `}
            />
        </button>
    )
)
Switch.displayName = "Switch"

export { Switch }
