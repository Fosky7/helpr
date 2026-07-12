import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import AppShell from '@/components/layout/AppShell'
import BrandMark from '@/components/brand/BrandMark'
import BackNavigation from '@/components/navigation/BackNavigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

interface ProfileRecord {
  id: string
  full_name: string | null
  avatar_url: string | null
  updated_at: string | null
}

export default function AccountPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<ProfileRecord | null>(null)
  const [fullName, setFullName] = useState('')
  const [saving, setSaving] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mountedRef = useRef(true)

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

  const handleNameSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

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
      if (error) throw error
      toast.success('Name updated successfully.')
      fetchProfile(user.id)
    } catch (error: unknown) {
      if (mountedRef.current) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred.'
        toast.error('Error saving name: ' + message)
      }
    } finally {
      if (mountedRef.current) setSaving(false)
    }
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return

    try {
      setUploading(true)
      const fileExt = avatarFile.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: false,
        })

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
      }
    } finally {
      if (mountedRef.current) setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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

  // Loading state
  if (loading) {
    return (
      <AppShell centered maxWidthClassName="max-w-md" aria-label="Loading account">
        <Card className="border-primary/20 bg-card/90 text-center shadow-xl shadow-primary/10 backdrop-blur">
          <CardContent className="p-8">
            <div className="mx-auto mb-5 flex justify-center">
              <BrandMark compact size="lg" />
            </div>
            <p className="text-sm text-muted-foreground">Loading account details...</p>
          </CardContent>
        </Card>
      </AppShell>
    )
  }

  // If no profile after loading, show error state
  if (!profile && !loading) {
    return (
      <AppShell centered maxWidthClassName="max-w-md" aria-label="Account error">
        <Card className="border-destructive/40 bg-destructive/10 shadow-sm">
          <CardContent className="space-y-4 p-6 text-center">
            <p className="font-semibold text-destructive">Failed to load account.</p>
            <p className="text-sm leading-6 text-muted-foreground">We couldn't retrieve your profile. Please try again.</p>
            <Button type="button" variant="outline" className="rounded-xl bg-background/70" onClick={() => user && fetchProfile(user.id)}>
              Try again
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    )
  }

  return (
    <AppShell centered maxWidthClassName="max-w-3xl" aria-label="Account settings">
      <div className="space-y-6">
        {/* Account Details Card */}
        <Card className="overflow-hidden border-primary/20 bg-card/90 shadow-xl shadow-primary/10 backdrop-blur">
          <CardHeader className="relative overflow-hidden border-b border-border bg-muted/30 p-6 sm:p-8">
            <div className="absolute right-6 top-6 hidden gap-2 sm:flex" aria-hidden="true">
              <span className="h-2.5 w-10 rounded-full bg-primary" />
              <span className="h-2.5 w-6 rounded-full bg-accent" />
              <span className="h-2.5 w-14 rounded-full bg-primary/40" />
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-4">
                <BrandMark subtitle="Account settings" />
                <div>
                  <div className="mb-3 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary shadow-sm">
                    Personal information
                  </div>
                  <CardTitle className="text-3xl tracking-tight">Update your name and avatar</CardTitle>
                  <CardDescription className="mt-3 max-w-2xl text-sm leading-6">
                    Keep your Renderr account identity up to date. Your name and avatar help supporters recognize you.
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>

          <form onSubmit={handleNameSubmit}>
            <CardContent className="space-y-6 p-6 sm:p-8">
              <section className="grid gap-6 lg:grid-cols-[1fr_0.85fr]" aria-label="Account details">
                <div className="space-y-6">
                  <div className="space-y-2 rounded-3xl border border-border bg-background/70 p-5 shadow-sm">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      disabled={saving}
                      className="h-11 rounded-xl border-primary/20 bg-card/80 focus-visible:ring-primary/40"
                    />
                    <p className="text-xs leading-5 text-muted-foreground">
                      This is the name supporters and collaborators will see in Renderr.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-primary/15 bg-primary/5 p-5 shadow-sm">
                    <Label>Email</Label>
                    <p className="mt-2 break-all text-sm font-medium text-foreground">{user?.email}</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      Your email is managed through the secure Supabase authentication flow.
                    </p>
                  </div>
                </div>

                <aside className="rounded-3xl border border-border bg-muted/30 p-5 shadow-sm" aria-label="Profile avatar">
                  <Label>Avatar</Label>
                  {profile.avatar_url ? (
                    <div className="mt-4 flex flex-col items-center rounded-2xl border border-primary/15 bg-card/80 p-5 text-center">
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        className="h-24 w-24 rounded-full border border-primary/20 object-cover shadow-lg shadow-primary/10"
                      />
                      <p className="mt-4 text-sm font-medium">Current avatar</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Your profile image is set. You can upload a new one below.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-dashed border-primary/30 bg-card/80 p-5 text-center">
                      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner ring-1 ring-primary/20">
                        <span className="text-3xl font-black" aria-hidden="true">
                          {(fullName.trim() || user?.email || 'R').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p className="mt-4 text-sm font-semibold">No avatar yet</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Add a profile picture to personalize your account.
                      </p>
                    </div>
                  )}
                </aside>
              </section>

              {/* Avatar Upload Section */}
              <section className="rounded-3xl border border-border bg-background/70 p-5 shadow-sm" aria-label="Upload avatar">
                <Label htmlFor="avatarFile">Upload a new avatar</Label>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Max size 5 MB. Supported formats: JPEG, PNG, GIF, WebP.
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-4">
                  <Input
                    id="avatarFile"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="h-11 rounded-xl border-primary/20 bg-card/80 file:mr-4 file:rounded-xl file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
                  />
                  <Button
                    type="button"
                    onClick={handleAvatarUpload}
                    disabled={!avatarFile || uploading}
                    className="rounded-xl shadow-lg shadow-primary/20"
                    aria-busy={uploading}
                  >
                    {uploading ? (
                      <>
                        <Spinner className="mr-2" />
                        Uploading...
                      </>
                    ) : (
                      'Upload Avatar'
                    )}
                  </Button>
                </div>
                {avatarFile && (
                  <div className="mt-3 flex items-center gap-4">
                    <img
                      src={URL.createObjectURL(avatarFile)}
                      alt="Preview"
                      className="h-16 w-16 rounded-full object-cover border border-primary/20"
                    />
                    <p className="text-sm text-muted-foreground">{avatarFile.name} ({(avatarFile.size / 1024).toFixed(1)} KB)</p>
                  </div>
                )}
              </section>
            </CardContent>

            <CardFooter className="flex flex-col-reverse gap-3 border-t border-border bg-muted/20 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <BackNavigation fallbackTo="/dashboard" label="Back" />
              <Button type="submit" disabled={saving} className="w-full rounded-xl shadow-lg shadow-primary/20 sm:w-auto" aria-busy={saving}>
                {saving ? 'Saving...' : 'Save Name'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppShell>
  )
}