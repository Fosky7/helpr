import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

interface DeleteAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DeleteAccountDialog({ open, onOpenChange }: DeleteAccountDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      // Delete user's profile data from the database
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', supabase.auth.user()?.id)

      if (deleteError) {
        throw deleteError
      }

      // Sign the user out and redirect to home
      await signOut()
      navigate('/', { replace: true })
      toast.success('Your account has been deleted.')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.'
      toast.error('Failed to delete account: ' + message)
      // Re-open the dialog so the user can retry (onOpenChange is called on close)
      onOpenChange(true)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This action is permanent and cannot be undone. All your profile data, campaigns, and related information will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            asChild
            disabled={isDeleting}
            onClick={handleDelete}
          >
            <Button variant="destructive" className="gap-2">
              {isDeleting ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Deleting...
                </>
              ) : (
                'Delete my account'
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
