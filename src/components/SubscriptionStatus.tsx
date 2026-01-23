import { useSubscription } from '../hooks/useSubscription'
import { stripeProducts } from '../stripe-config'
import { Crown, Loader2 } from 'lucide-react'

export function SubscriptionStatus() {
  const { subscription, loading } = useSubscription()

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading plan...</span>
      </div>
    )
  }

  if (!subscription || !subscription.price_id) {
    return (
      <div className="flex items-center space-x-2 text-gray-600">
        <span>Free Plan</span>
      </div>
    )
  }

  const product = stripeProducts.find(p => p.priceId === subscription.price_id)
  
  return (
    <div className="flex items-center space-x-2 text-blue-600">
      <Crown className="h-4 w-4" />
      <span>{product?.name || 'Pro Plan'}</span>
    </div>
  )
}