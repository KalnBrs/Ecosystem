import { PASSWORD_RULES } from "@/lib/passwordRules"

export default function PasswordChecklist({ password }: { password: string }) {
  const touched = password.length > 0

  return (
    <ul aria-label="Password requirements" className="flex flex-col gap-1 text-xs">
      {PASSWORD_RULES.map(rule => {
        const met = rule.test(password)
        // "No spaces" is trivially true for an empty field, so only mark it once typing starts.
        const showMet = met && touched
        return (
          <li key={rule.id} className={`flex items-center gap-2 ${showMet ? "text-success" : "text-muted-foreground"}`}>
            <span aria-hidden className="w-3 text-center">{showMet ? "✓" : "•"}</span>
            <span>{rule.label}</span>
            <span className="sr-only">{showMet ? "(met)" : "(not met)"}</span>
          </li>
        )
      })}
    </ul>
  )
}
