import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const control =
  'w-full min-h-11 rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 transition-[border-color,box-shadow] hover:border-white/20 focus:border-brand-500/70 focus:outline-none focus:ring-4 focus:ring-brand-500/15 aria-[invalid=true]:border-red-400'

interface WrapperProps { label: string; error?: string; hint?: string; children: (id: string, describedBy: string | undefined) => ReactNode }

function FieldWrapper({ label, error, hint, children }: WrapperProps) {
  const id = useId()
  const msgId = error || hint ? `${id}-msg` : undefined
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      {children(id, msgId)}
      {error ? <p id={msgId} role="alert" className="text-xs text-red-400">{error}</p> : hint ? <p id={msgId} className="text-xs text-muted">{hint}</p> : null}
    </div>
  )
}

type Common = { label: string; error?: string; hint?: string }

export const TextField = forwardRef<HTMLInputElement, Common & InputHTMLAttributes<HTMLInputElement>>(
  ({ label, error, hint, className, ...props }, ref) => (
    <FieldWrapper label={label} error={error} hint={hint}>
      {(id, d) => <input ref={ref} id={id} aria-invalid={!!error} aria-describedby={d} className={cn(control, className)} {...props} />}
    </FieldWrapper>
  ),
)
TextField.displayName = 'TextField'

export const TextArea = forwardRef<HTMLTextAreaElement, Common & TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ label, error, hint, className, ...props }, ref) => (
    <FieldWrapper label={label} error={error} hint={hint}>
      {(id, d) => <textarea ref={ref} id={id} rows={4} aria-invalid={!!error} aria-describedby={d} className={cn(control, className)} {...props} />}
    </FieldWrapper>
  ),
)
TextArea.displayName = 'TextArea'

export const SelectField = forwardRef<HTMLSelectElement, Common & SelectHTMLAttributes<HTMLSelectElement>>(
  ({ label, error, hint, className, children, ...props }, ref) => (
    <FieldWrapper label={label} error={error} hint={hint}>
      {(id, d) => <select ref={ref} id={id} aria-invalid={!!error} aria-describedby={d} className={cn(control, className)} {...props}>{children}</select>}
    </FieldWrapper>
  ),
)
SelectField.displayName = 'SelectField'
