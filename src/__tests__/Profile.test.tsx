import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import Profile from '@/pages/Profile'

vi.mock('@/integrations/supabase/client', () => {
  const mockFrom = vi.fn()
  const mockSelect = vi.fn()
  const mockEq = vi.fn()
  const mockSingle = vi.fn()
  const mockUpsert = vi.fn()
  const mockStorageFrom = vi.fn()
  const mockUpload = vi.fn()
  const mockGetPublicUrl = vi.fn()
  const mockUpdateUser = vi.fn()

  return {
    supabase: {
      from: mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            single: mockSingle
          }),
          single: mockSingle
        }),
        upsert: mockUpsert
      }),
      storage: {
        from: mockStorageFrom.mockReturnValue({
          upload: mockUpload,
          getPublicUrl: mockGetPublicUrl
        })
      },
      auth: {
        updateUser: mockUpdateUser
      }
    }
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn()
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

const mockUser = {
  id: 'user-123',
  email: 'test@renderr.io'
}

const mockProfile = {
  id: 'user-123',
  full_name: 'Efosa Ighodaro',
  avatar_url: null,
  updated_at: '2025-03-20T10:00:00Z'
}

const mockProfileWithAvatar = {
  ...mockProfile,
  avatar_url: 'https://example.com/avatars/user-123/avatar.jpg'
}

function setupSupabaseOverrides(overrides: Record<string, unknown> = {}) {
  ;(supabase.from as any).mockClear()
  const mockFrom = supabase.from as any
  const mockSelect = mockFrom().select as any
  const mockEq = mockSelect().eq as any
  const mockSingle = mockEq().single as any
  const mockUpsert = mockFrom().upsert as any
  const mockStorageFrom = supabase.storage.from as any
  const mockUpload = mockStorageFrom().upload as any
  const mockGetPublicUrl = mockStorageFrom().getPublicUrl as any
  const mockUpdateUser = supabase.auth.updateUser as any

  if (overrides.single) {
    mockSingle.mockResolvedValue(overrides.single)
  } else {
    mockSingle.mockResolvedValue({ data: mockProfile, error: null })
  }

  if (overrides.upsert) {
    mockUpsert.mockResolvedValue(overrides.upsert)
  } else {
    mockUpsert.mockResolvedValue({ error: null })
  }

  if (overrides.updateUser) {
    mockUpdateUser.mockResolvedValue(overrides.updateUser)
  } else {
    mockUpdateUser.mockResolvedValue({ error: null })
  }

  if (overrides.upload) {
    mockUpload.mockResolvedValue(overrides.upload)
  } else {
    mockUpload.mockResolvedValue({ error: null })
  }

  if (overrides.publicUrl) {
    mockGetPublicUrl.mockReturnValue({ publicUrl: overrides.publicUrl })
  } else {
    mockGetPublicUrl.mockReturnValue({ publicUrl: 'https://example.com/new-avatar.jpg' })
  }

  return {
    mockFrom,
    mockSelect,
    mockEq,
    mockSingle,
    mockUpsert,
    mockStorageFrom,
    mockUpload,
    mockGetPublicUrl,
    mockUpdateUser
  }
}

describe('Profile Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useAuth as any).mockReturnValue({ user: mockUser })
    setupSupabaseOverrides()
    // @ts-ignore
    URL.createObjectURL = vi.fn(() => 'blob:preview-url')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows loading state initially', async () => {
    ;(supabase.from('profiles').select('*').eq('id', mockUser.id).single as any).mockImplementation(
      () => new Promise(() => {}) // never resolve
    )
    render(<Profile />)
    expect(screen.getByText(/loading your renderr profile/i)).toBeInTheDocument()
  })

  it('renders profile not found when data is null', async () => {
    setupSupabaseOverrides({ single: { data: null, error: null } })
    render(<Profile />)
    await waitFor(() => {
      expect(screen.getByText(/profile not found/i)).toBeInTheDocument()
    })
  })

  it('renders profile details on successful load', async () => {
    render(<Profile />)
    await waitFor(() => {
      expect(screen.getByLabelText('Full Name')).toHaveValue(mockProfile.full_name || '')
      expect(screen.getByText(mockUser.email)).toBeInTheDocument()
    })
  })

  it('displays avatar when avatar_url is set', async () => {
    setupSupabaseOverrides({ single: { data: mockProfileWithAvatar, error: null } })
    render(<Profile />)
    await waitFor(() => {
      const avatar = screen.getByRole('img', { name: /avatar/i })
      expect(avatar).toHaveAttribute('src', mockProfileWithAvatar.avatar_url)
    })
  })

  it('shows first letter placeholder when no avatar', async () => {
    render(<Profile />)
    await waitFor(() => {
      expect(screen.getByText('E')).toBeInTheDocument() // first letter of full_name
    })
  })

  it('saves profile changes successfully', async () => {
    const user = userEvent.setup()
    render(<Profile />)
    await waitFor(() => {
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    })

    const nameInput = screen.getByLabelText('Full Name')
    await user.clear(nameInput)
    await user.type(nameInput, 'New Name')

    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(supabase.from('profiles').upsert).toHaveBeenCalledWith({
        id: mockUser.id,
        full_name: 'New Name',
        updated_at: expect.any(String)
      })
      expect(toast.success).toHaveBeenCalledWith('Profile updated in Renderr!')
    })
  })

  it('shows error toast when save fails', async () => {
    const user = userEvent.setup()
    setupSupabaseOverrides({ upsert: { error: { message: 'DB error' } } })
    render(<Profile />)
    await waitFor(() => {
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    })

    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Error saving profile: DB error')
      )
    })
  })

  it('changes password successfully', async () => {
    const user = userEvent.setup()
    render(<Profile />)
    await waitFor(() => {
      expect(screen.getByLabelText('New Password')).toBeInTheDocument()
    })

    const newPasswordInput = screen.getByLabelText('New Password')
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password')
    await user.type(newPasswordInput, 'newpassword123')
    await user.type(confirmPasswordInput, 'newpassword123')

    const updateButton = screen.getByRole('button', { name: /update password/i })
    await user.click(updateButton)

    await waitFor(() => {
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'newpassword123' })
      expect(toast.success).toHaveBeenCalledWith('Password updated successfully.')
    })
  })

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup()
    render(<Profile />)
    await waitFor(() => {
      expect(screen.getByLabelText('New Password')).toBeInTheDocument()
    })

    const newPasswordInput = screen.getByLabelText('New Password')
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password')
    await user.type(newPasswordInput, 'newpassword123')
    await user.type(confirmPasswordInput, 'different')

    const updateButton = screen.getByRole('button', { name: /update password/i })
    await user.click(updateButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('New passwords do not match.')
    })
    expect(supabase.auth.updateUser).not.toHaveBeenCalled()
  })

  it('handles password change error', async () => {
    const user = userEvent.setup()
    setupSupabaseOverrides({ updateUser: { error: { message: 'Weak password' } } })
    render(<Profile />)
    await waitFor(() => {
      expect(screen.getByLabelText('New Password')).toBeInTheDocument()
    })

    const newPasswordInput = screen.getByLabelText('New Password')
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password')
    await user.type(newPasswordInput, 'weak')
    await user.type(confirmPasswordInput, 'weak')

    const updateButton = screen.getByRole('button', { name: /update password/i })
    await user.click(updateButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to change password: Weak password')
      )
    })
  })

  it('validates avatar file size', async () => {
    const user = userEvent.setup()
    render(<Profile />)
    await waitFor(() => {
      expect(screen.getByLabelText(/select image/i)).toBeInTheDocument()
    })

    const fileInput = screen.getByLabelText(/select image/i)
    const largeFile = new File(['(large)'], 'photo.jpg', { type: 'image/jpeg' })
    Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 }) // 6MB

    await user.upload(fileInput, largeFile)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('File size must be less than 5MB.')
    })
    // The avatar file should not be set, so upload button is disabled
    expect(screen.getByRole('button', { name: /upload avatar/i })).toBeDisabled()
  })

  it('validates avatar file type', async () => {
    const user = userEvent.setup()
    render(<Profile />)
    await waitFor(() => {
      expect(screen.getByLabelText(/select image/i)).toBeInTheDocument()
    })

    const fileInput = screen.getByLabelText(/select image/i)
    const pdfFile = new File(['pdf'], 'doc.pdf', { type: 'application/pdf' })

    await user.upload(fileInput, pdfFile)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Only image files are allowed.')
    })
    expect(screen.getByRole('button', { name: /upload avatar/i })).toBeDisabled()
  })

  it('uploads avatar successfully and displays preview', async () => {
    const user = userEvent.setup()
    const imageFile = new File(['image'], 'avatar.png', { type: 'image/png' })
    Object.defineProperty(imageFile, 'size', { value: 2 * 1024 * 1024 }) // 2MB

    render(<Profile />)
    await waitFor(() => {
      expect(screen.getByLabelText(/select image/i)).toBeInTheDocument()
    })

    const fileInput = screen.getByLabelText(/select image/i)
    await user.upload(fileInput, imageFile)

    // Preview should appear
    await waitFor(() => {
      const preview = screen.getByRole('img', { name: /preview/i })
      expect(preview).toHaveAttribute('src', 'blob:preview-url')
      expect(screen.getByText(/avatar\.png \(2\.0 KB\)/i)).toBeInTheDocument()
    })

    const uploadButton = screen.getByRole('button', { name: /upload avatar/i })
    await user.click(uploadButton)

    await waitFor(() => {
      expect(supabase.storage.from('avatars').upload).toHaveBeenCalledWith(
        expect.stringContaining(mockUser.id),
        imageFile,
        expect.any(Object)
      )
      expect(toast.success).toHaveBeenCalledWith('Avatar uploaded!')
    })
  })

  it('handles avatar upload error', async () => {
    const user = userEvent.setup()
    const imageFile = new File(['image'], 'avatar.png', { type: 'image/png' })
    Object.defineProperty(imageFile, 'size', { value: 2 * 1024 * 1024 })
    setupSupabaseOverrides({ upload: { error: { message: 'Storage error' } } })

    render(<Profile />)
    await waitFor(() => {
      expect(screen.getByLabelText(/select image/i)).toBeInTheDocument()
    })

    const fileInput = screen.getByLabelText(/select image/i)
    await user.upload(fileInput, imageFile)

    const uploadButton = screen.getByRole('button', { name: /upload avatar/i })
    await user.click(uploadButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Avatar upload failed: Storage error')
      )
    })
  })

  it('clears avatar selection after successful upload', async () => {
    const user = userEvent.setup()
    const imageFile = new File(['image'], 'avatar.png', { type: 'image/png' })
    Object.defineProperty(imageFile, 'size', { value: 2 * 1024 * 1024 })

    render(<Profile />)
    await waitFor(() => {
      expect(screen.getByLabelText(/select image/i)).toBeInTheDocument()
    })

    const fileInput = screen.getByLabelText(/select image/i)
    await user.upload(fileInput, imageFile)

    const uploadButton = screen.getByRole('button', { name: /upload avatar/i })
    await user.click(uploadButton)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Avatar uploaded!')
      // The file input value should be cleared, so no preview
      expect(screen.queryByRole('img', { name: /preview/i })).not.toBeInTheDocument()
      // The upload button should be disabled
      expect(screen.getByRole('button', { name: /upload avatar/i })).toBeDisabled()
    })
  })

  it('handles missing public URL after upload', async () => {
    const user = userEvent.setup()
    const imageFile = new File(['image'], 'avatar.png', { type: 'image/png' })
    Object.defineProperty(imageFile, 'size', { value: 2 * 1024 * 1024 })
    setupSupabaseOverrides({ publicUrl: null })

    render(<Profile />)
    await waitFor(() => {
      expect(screen.getByLabelText(/select image/i)).toBeInTheDocument()
    })

    const fileInput = screen.getByLabelText(/select image/i)
    await user.upload(fileInput, imageFile)

    const uploadButton = screen.getByRole('button', { name: /upload avatar/i })
    await user.click(uploadButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Avatar upload failed')
      )
    })
  })
})
