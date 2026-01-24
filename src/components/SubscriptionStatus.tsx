import { useUserProfile } from '../hooks/useUserProfile'
import { Crown, Loader2 } from 'lucide-react'

export function SubscriptionStatus() {
  const { profile, loading } = useUserProfile()

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading plan...</span>
      </div>
    )
  }

  if (!profile?.is_pro) {
    return (
      <div className="flex items-center space-x-2 text-gray-600">
        <span>Free Plan</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2 text-blue-600">
      <Crown className="h-4 w-4" />
      <span>Pro Plan</span>
    </div>
  )
}