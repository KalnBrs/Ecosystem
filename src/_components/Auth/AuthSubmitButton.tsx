type AuthSubmitButtonProps = {
  label: string
  pendingLabel: string
  pending: boolean
}

export default function AuthSubmitButton({ label, pendingLabel, pending }: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 w-full rounded-md bg-accent text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  )
}
