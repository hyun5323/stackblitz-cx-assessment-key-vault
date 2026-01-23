import React, { useEffect } from 'react'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useStripe } from '../hooks/useStripe'

export function Success() {
  const [searchParams] = useSearchParams()
  const { refetch } = useStripe()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Refetch Stripe data to update the user's subscription/order status
    if (sessionId) {
      // Add a small delay to ensure webhook has processed
      setTimeout(() => {
        refetch()
      }, 2000)
    }
  }, [sessionId, refetch])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Successful!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome to Key Vault Pro! Your purchase has been completed successfully.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            What's Next?
          </h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                You now have lifetime access to Key Vault Pro features
              </span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                Unlimited secret storage is now available
              </span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                Advanced masking features are enabled
              </span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                Priority support is now active
              </span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Session ID: {sessionId || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  )
}