import { useCallback, useMemo, useState } from 'react'

/**
 * Simplified email pattern. The authoritative check happens server-side in
 * Supabase — the goal here is to catch obvious typos early and guide the user
 * with a helpful inline message, not to reject valid edge-case addresses.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Minimum password length enforced by Supabase Auth. */
export const PASSWORD_MIN_LENGTH = 6

/**
 * Validate an email address and return a human-readable error message, or
 * `null` when the value is valid.
 */
export function validateEmail(email: string): string | null {
  const trimmed = email.trim()
  if (!trimmed) return 'Email is required.'
  if (!EMAIL_REGEX.test(trimmed)) return 'Please enter a valid email address.'
  return null
}

/**
 * Validate a password and return a human-readable error message, or `null`
 * when the value is valid.
 */
export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required.'
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`
  }
  return null
}

export interface UseFormValidationOptions {
  /**
   * When `true` (default), field errors are only surfaced after the field has
   * been blurred or a submit has been attempted. This avoids showing "invalid
   * email" the moment a user focuses an empty field.
   */
  showOnlyWhenTouched?: boolean
}

export interface UseFormValidationResult {
  /** Raw validation error for the current email value (ignores touched state). */
  emailError: string | null
  /** Raw validation error for the current password value (ignores touched state). */
  passwordError: string | null
  /** Whether the email field has been interacted with. */
  emailTouched: boolean
  /** Whether the password field has been interacted with. */
  passwordTouched: boolean
  /**
   * The email error to display, respecting touched/submit state. Returns
   * `null` when nothing should be shown.
   */
  showEmailError: string | null
  /**
   * The password error to display, respecting touched/submit state. Returns
   * `null` when nothing should be shown.
   */
  showPasswordError: string | null
  /** Whether the entire form is currently valid. */
  isValid: boolean
  /** Mark the email field as touched (call on blur). */
  markEmailTouched: () => void
  /** Mark the password field as touched (call on blur). */
  markPasswordTouched: () => void
  /** Reset all touched/submit state (e.g. when switching modes). */
  reset: () => void
  /**
   * Validate every field and mark the form as "submit attempted" so all errors
   * become visible. Returns `true` when the form is valid and submission may
   * proceed.
   */
  validateAll: () => boolean
}

/**
 * useFormValidation provides real-time, field-level validation for the auth
 * email/password form. Errors are computed reactively from the current values
 * but only displayed once the user has interacted with a field (or attempted
 * to submit), keeping the initial UX calm.
 */
export function useFormValidation(
  email: string,
  password: string,
  options: UseFormValidationOptions = {},
): UseFormValidationResult {
  const { showOnlyWhenTouched = true } = options

  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const emailError = useMemo(() => validateEmail(email), [email])
  const passwordError = useMemo(() => validatePassword(password), [password])

  const isValid = emailError === null && passwordError === null

  const shouldShowEmail = submitAttempted || !showOnlyWhenTouched || emailTouched
  const shouldShowPassword =
    submitAttempted || !showOnlyWhenTouched || passwordTouched

  const showEmailError = shouldShowEmail ? emailError : null
  const showPasswordError = shouldShowPassword ? passwordError : null

  const validateAll = useCallback(() => {
    setSubmitAttempted(true)
    return emailError === null && passwordError === null
  }, [emailError, passwordError])

  const reset = useCallback(() => {
    setEmailTouched(false)
    setPasswordTouched(false)
    setSubmitAttempted(false)
  }, [])

  return {
    emailError,
    passwordError,
    emailTouched,
    passwordTouched,
    showEmailError,
    showPasswordError,
    isValid,
    markEmailTouched: useCallback(() => setEmailTouched(true), []),
    markPasswordTouched: useCallback(() => setPasswordTouched(true), []),
    reset,
    validateAll,
  }
}
