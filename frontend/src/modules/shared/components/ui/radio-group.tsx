'use client';

import * as React from "react"
import { Circle } from "lucide-react"
import { cn } from "@/lib/utils"

// Create context for RadioGroup
const RadioGroupContext = React.createContext<{
    value?: string;
    onValueChange?: (val: string) => void;
}>({});

const RadioGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        onValueChange?: (val: string) => void;
        defaultValue?: string;
        value?: string;
    }
>(({ className, onValueChange, defaultValue, value, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || '');

    const currentValue = value !== undefined ? value : internalValue;

    const handleChange = React.useCallback((val: string) => {
        if (value === undefined) {
            setInternalValue(val);
        }
        onValueChange?.(val);
    }, [value, onValueChange]);

    return (
        <RadioGroupContext.Provider value={{ value: currentValue, onValueChange: handleChange }}>
            <div className={cn("grid gap-2", className)} ref={ref} role="radiogroup" {...props}>
                {children}
            </div>
        </RadioGroupContext.Provider>
    )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, children, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext);
    const isSelected = context.value === value;

    const handleClick = () => {
        context.onValueChange?.(value);
    };

    return (
        <button
            ref={ref}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={handleClick}
            className={cn(
                "aspect-square h-4 w-4 rounded-full border-2 ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
                isSelected
                    ? "border-slate-900 bg-slate-900"
                    : "border-slate-300 dark:border-slate-600 hover:border-blue-400",
                className
            )}
            {...props}
        >
            {isSelected && (
                <Circle className="h-2 w-2 fill-white text-white mx-auto" />
            )}
        </button>
    )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }

