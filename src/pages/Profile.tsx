import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import AppShell from '@/components/layout/AppShell'
import BrandMark from '@/components/brand/BrandMark'
import BackNavigation from '@/components/navigation/BackNavigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import DeleteAccountDialog from '@/components/profile/DeleteAccountDialog'
import { cardPrimary, cardInner } from '@/lib/styles'

interface ProfileRecord {
  id: string
  full_name: string | null
  avatar_url: string | null
  updated_at: string | null
}

const MIN_PASSWORD_LENGTH = 6

function passwordStrength(password: string): { score: number; feedback: string } {
  if (!password) return { score: 0, feedback: '' }
  let score = 0
  if (password.length >= MIN_PASSWORD_LENGTH) score += 1
  if (password.length >= 10) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[!@#$%^&*]/.test(password)) score += 1
  const feedbacks = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong']
  return { score, feedback: feedbacks[Math.min(score, feedbacks.length - 1)] || '' }
}

const Profile = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<ProfileRecord | null>(null)
  const [fullName, setFullName] = useState('')
  const [saving, setSaving] = useState(false)
  const mountedRef = useRef(true)

  // Password change state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Delete account dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Validation errors
  const [nameError, setNameError] = useState('')

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchProfile(user.id)
    }
  }, [user])

  const fetchProfile = async (userId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!mountedRef.current) return
      if (error) throw error
      setProfile(data)
      setFullName(data.full_name || '')
    } catch (error: unknown) {
      if (mountedRef.current) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred.'
        toast.error('Failed to load profile: ' + message)
      }
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  const handleFullNameChange = (value: string) => {
    setFullName(value)
    if (value.trim().length === 0) {
      setNameError('Full name is required')
    } else {
      setNameError('')
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    if (fullName.trim().length === 0) {
      setNameError('Full name is required')
      return
    }

    try {
      setSaving(true)
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName.trim(),
          updated_at: new Date().toISOString(),
        })

      if (!mountedRef.current) return
      if (error) {
        if (error.code === 'PGRST301' || error.message?.includes('JWT expired')) {
          toast.error('Your session has expired. Please log in again.')
          await signOut()
          navigate('/auth?mode=login', { replace: true })
          return
        }
        throw error
      }
      toast.success('Profile updated in Renderr!')
      fetchProfile(user.id)
    } catch (error: unknown) {
      if (mountedRef.current) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred.'
        toast.error('Error saving profile: ' + message)
      }
    } finally {
      if (mountedRef.current) setSaving(false)
    }
  }

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.')
      return
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }

    try {
      setChangingPassword(true)
      const { error } = await supabase.auth.updateUser({ password: newPassword })

      if (!mountedRef.current) return
      if (error) {
        if (error.message?.includes('JWT expired')) {
          toast.error('Session expired. Please log in again.')
          await signOut()
          navigate('/auth?mode=login', { replace: true })
          return
        }
        throw error
      }
      toast.success('Password updated successfully.')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: unknown) {
      if (mountedRef.current) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred.'
        toast.error('Failed to change password: ' + message)
      }
    } finally {
      if (mountedRef.current) setChangingPassword(false)
    }
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return

    try {
      setUploading(true)
      setUploadProgress(0)
      const fileExt = avatarFile.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}.${fileExt}`
      
      // Simulate progress (Supabase upload doesn't provide progress events)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: false,
        })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!mountedRef.current) return
      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const avatarUrl = publicUrlData?.publicUrl

      if (!avatarUrl) {
        throw new Error('Failed to get public URL for uploaded avatar.')
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })

      if (!mountedRef.current) return
      if (updateError) throw updateError

      toast.success('Avatar uploaded!')
      fetchProfile(user.id)
      setAvatarFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error: unknown) {
      if (mountedRef.current) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred.'
        toast.error('Avatar upload failed: ' + message)
        setUploadProgress(0)
      }
    } finally {
      if (mountedRef.current) setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB.')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed.')
        return
      }
      setAvatarFile(file)
    }
  }

  const strength = passwordStrength(newPassword)

  // Skeleton loader
  if (loading) {
    return (
      <AppShell centered maxWidthClassName="max-w-3xl" aria-label="Profile loading">
        <Card className={`${cardPrimary} overflow-hidden`}>
          <CardHeader className="p-6 sm:p-8">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <Skeleton className="mt-2 h-4 w-96 rounded-xl" />
          </CardHeader>
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
              <div className="space-y-6">
                <Skeleton className="h-24 rounded-3xl" />
                <Skeleton className="h-24 rounded-3xl" />
              </div>
              <Skeleton className="h-64 rounded-3xl" />
            </div>
          </CardContent>
        </Card>
      </AppShell>
    )
  }

  if (!profile) {
    return (
      <AppShell centered maxWidthClassName="max-w-md" aria-label="Profile error">
        <Card className="rounded-3xl border-destructive/40 bg-destructive/10 shadow-xl shadow-destructive/10 backdrop-blur">
          <CardContent className="p-6 text-center sm:p-8">
            <BrandMark compact size="lg" className="mx-auto mb-4" />
            <h2 className="text-xl font-bold tracking-tight">Profile not found</h2>
            <p className="mt-2 text-sm text-muted-foreground text-pretty">
              We could not load your profile. Please try refreshing or contact support.
            </p>
            <Button 
              variant="outline" 
              className="mt-6 min-h-10 rounded-xl" 
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    )
  }

  return (
    <AppShell centered maxWidthClassName="max-w-3xl" aria-label="Profile settings">
      <div className="space-y-6">
        {/* Profile Details Card */}
        <Card className={`${cardPrimary} overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/20`}>
          <CardHeader className="relative overflow-hidden border-b border-border bg-muted/30 p-6 sm:p-8">
            <div className="absolute right-6 top-6 hidden gap-2 sm:flex" aria-hidden="true">
              <span className="h-2.5 w-10 rounded-full bg-primary" />
              <span className="h-2.5 w-6 rounded-full bg-accent" />
              <span className="h-2.5 w-14 rounded-full bg-primary/40" />
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-4">
                <BrandMark subtitle="Profile settings" />
                <div>
                  <div className="mb-3 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary shadow-sm">
                    Account identity
                  </div>
                  <CardTitle className="text-3xl font-bold tracking-tight">Make your Renderr profile shine.</CardTitle>
                  <CardDescription className="mt-3 max-w-2xl text-sm leading-6 text-pretty">
                    Manage your public profile information and keep your Renderr account recognizable across your fundraising workspace.
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="space-y-6 p-6 sm:p-8">
              <section className="grid gap-6 lg:grid-cols-[1fr_0.85fr]" aria-label="Profile details">
                <div className="space-y-6">
                  <div className={`${cardInner} space-y-2 p-6`}>
                    <Label htmlFor="fullName" className="text-sm font-semibold">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => handleFullNameChange(e.target.value)}
                      placeholder="Enter your full name"
                      disabled={saving}
                      className={`h-11 rounded-xl border-primary/20 bg-card/80 focus-visible:ring-primary/40 ${nameError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      aria-describedby="fullName-error"
                      aria-invalid={!!nameError}
                    />
                    {nameError && (
                      <p id="fullName-error" className="text-xs font-medium text-destructive" role="alert">
                        {nameError}
                      </p>
                    )}
                    <p className="text-xs leading-5 text-muted-foreground text-pretty">
                      This is the name supporters and collaborators can recognize in Renderr.
                    </p>
                  </div>

                  <div className={`${cardInner} p-6`}>
                    <Label className="text-sm font-semibold">Email</Label>
                    <p className="mt-2 break-all text-sm font-medium text-foreground">{user?.email}</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground text-pretty">
                      Your email is managed through the existing secure Supabase authentication flow.
                    </p>
                  </div>
                </div>

                <aside className={`${cardInner} p-6`} aria-label="Profile avatar">
                  <Label className="text-sm font-semibold">Avatar</Label>
                  {profile.avatar_url ? (
                    <div className="mt-4 flex flex-col items-center rounded-2xl border border-primary/15 bg-card/80 p-6 text-center">
                      <img
                        src={profile.avatar_url}
                        alt="Your avatar"
                        className="h-24 w-24 rounded-full border border-primary/20 object-cover shadow-lg shadow-primary/10"
                      />
                      <p className="mt-4 text-sm font-medium">Avatar connected</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground text-pretty">
                        Your profile image is ready for a colorful Renderr presence.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-dashed border-primary/30 bg-card/80 p-6 text-center">
                      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner ring-1 ring-primary/20">
                        <span className="text-3xl font-black" aria-hidden="true">
                          {(fullName.trim() || user?.email || 'R').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p className="mt-4 text-sm font-semibold">No avatar yet</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground text-pretty">
                        Your Renderr profile is ready for future personalization with a bright avatar state today.
                      </p>
                      <div className="mx-auto mt-4 flex w-fit gap-2" aria-hidden="true">
                        <span className="h-2 w-8 rounded-full bg-primary" />
                        <span className="h-2 w-5 rounded-full bg-accent" />
                        <span className="h-2 w-10 rounded-full bg-primary/40" />
                      </div>
                    </div>
                  )}
                </aside>
              </section>
            </CardContent>

            <CardFooter className="flex flex-col-reverse gap-3 border-t border-border bg-muted/20 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <BackNavigation fallbackTo="/dashboard" label="Back" />
              <Button type="submit" disabled={saving} className="min-h-10 w-full rounded-xl bg-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 sm:w-auto" aria-busy={saving}>
                {saving ? <><Spinner className="mr-2 h-4 w-4" /> Saving...</> : 'Save Changes'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Change Password Card */}
        <Card className={`${cardPrimary} overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/20`}>
          <CardHeader className="p-6 sm:p-8">
            <CardTitle className="text-2xl font-bold tracking-tight">Change Password</CardTitle>
            <CardDescription className="text-pretty">
              Update your password to keep your account secure.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleChangePassword} noValidate>
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-semibold">New Password</Label>
                  <PasswordInput
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    disabled={changingPassword}
                    className="h-11 rounded-xl border-primary/20 bg-card/80"
                    required
                    minLength={MIN_PASSWORD_LENGTH}
                    autoComplete="new-password"
                  />
                  {newPassword && (
                    <div className="rounded-lg border border-border/50 bg-background/50 p-3">
                      <Label className="mb-1 block text-xs font-semibold">Password strength</Label>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${
                            strength.score <= 1 ? 'bg-destructive' :
                            strength.score === 2 ? 'bg-yellow-500' :
                            strength.score === 3 ? 'bg-primary' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${(strength.score / 5) * 100}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs font-medium text-muted-foreground">{strength.feedback || 'Too short'}</p>
                      <p className="mt-1 text-xs text-muted-foreground text-pretty">
                        Use at least {MIN_PASSWORD_LENGTH} characters with a mix of uppercase, numbers, and symbols for a strong password.
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold">Confirm New Password</Label>
                  <PasswordInput
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={changingPassword}
                    className="h-11 rounded-xl border-primary/20 bg-card/80"
                    required
                    minLength={MIN_PASSWORD_LENGTH}
                    autoComplete="new-password"
                  />
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs font-medium text-destructive" role="alert">
                      Passwords do not match.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border bg-muted/20 p-6 sm:p-8">
              <Button type="submit" disabled={changingPassword} className="min-h-10 rounded-xl shadow-lg shadow-primary/20" aria-busy={changingPassword}>
                {changingPassword ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Updating…
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Avatar Upload Card */}
        <Card className={`${cardPrimary} overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/20`}>
          <CardHeader className="p-6 sm:p-8">
            <CardTitle className="text-2xl font-bold tracking-tight">Upload Avatar</CardTitle>
            <CardDescription className="text-pretty">
              Choose an image to represent your profile. Max size 5MB, images only.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="space-y-3">
              <Label htmlFor="avatarFile" className="text-sm font-semibold">Select Image</Label>
              <Input
                id="avatarFile"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="h-11 rounded-xl border-primary/20 bg-card/80 file:mr-4 file:rounded-xl file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
              />
              {avatarFile && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-4">
                    <img
                      src={URL.createObjectURL(avatarFile)}
                      alt="Preview"
                      className="h-16 w-16 rounded-full object-cover border border-primary/20"
                    />
                    <p className="text-sm text-muted-foreground">
                      {avatarFile.name} ({(avatarFile.size / 1024).toFixed(1)} KB)
                    </p>
                  </div>
                  {uploading && (
                    <div className="overflow-hidden rounded-full bg-muted h-2 w-full">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t border-border bg-muted/20 p-6 sm:p-8">
            <Button 
              onClick={handleAvatarUpload} 
              disabled={!avatarFile || uploading} 
              className="min-h-10 rounded-xl shadow-lg shadow-primary/20 transition-all hover:bg-primary/90" 
              aria-busy={uploading}
            >
              {uploading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Uploading... {uploadProgress}%
                </>
              ) : 'Upload Avatar'}
            </Button>
          </CardFooter>
        </Card>

        {/* Danger zone: delete account */}
        <Card className={`${cardPrimary} border-destructive/30 shadow-xl shadow-destructive/10`}>
          <CardHeader className="p-6 sm:p-8">
            <CardTitle className="text-2xl font-bold tracking-tight text-destructive">Danger Zone</CardTitle>
            <CardDescription className="text-pretty">
              Once you delete your account, there is no going back. Please be certain.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <Button
              variant="destructive"
              className="min-h-10 rounded-xl"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete my account
            </Button>
          </CardContent>
        </Card>

        {/* Delete account confirmation dialog */}
        <DeleteAccountDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      </div>
    </AppShell>
  )
}

export default Profile
