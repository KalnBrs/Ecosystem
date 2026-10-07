import { useEffect } from "react"; 

type KeyCombo = {
  key: string; 
  metaKey?: boolean; 
  ctrlKey?: boolean; 
  altKey?: boolean;
  shiftKey?: boolean;
}

/**
 * Creates a custom hook in order to do a command when a user clicks a key or key command 
 * Works for all commands, if defined by the call. 
 * 
 * Accepts undefined for meta, ctrl, and shift key. There is a default value of false on the 
 * varibales defined in targetConfig
 * @param targetConfig this is the defined key structure for the key command that is wanted
 * @param callback this is the callback method that is called when the targetConfig 
 * key command is pressed
 */
export function useKeyPress(targetConfig: KeyCombo, callback: () => void) {
  useEffect(() => {
    const {key, metaKey = false, ctrlKey = false, shiftKey = false, altKey = false} = targetConfig

    const handleKeyDown = (event: KeyboardEvent) => {
      const matchKey = event.key.toLowerCase() == key.toLowerCase()

      // If a modifier is explicitly expected, enforce it
      if (event.metaKey !== metaKey || event.ctrlKey !== ctrlKey || event.shiftKey !== shiftKey || event.shiftKey !== altKey) return
      if (metaKey && !event.metaKey) return
      if (ctrlKey && !event.ctrlKey) return
      if (shiftKey && !event.shiftKey) return
      if (altKey && !event.altKey) return

      if (matchKey) {
        event.preventDefault()
        callback()
      }
    };

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    };
  }, [targetConfig, callback])
}