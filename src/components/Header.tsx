import React from 'react'
import { Link } from 'react-router-dom'
import { Key, LogOut, User, CreditCard } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useStripe } from '../hooks/useStripe'

export function Header() {
  const { user, signOut } = useAuth()
  const { getPlanName } = useStripe()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Key className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">Key Stash</span>
          </Link>

          <nav className="flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/pricing"
                  className="text-gray-700 hover:text-indigo-600 transition-colors flex items-center"
                >
                  <CreditCard className="h-4 w-4 mr-1" />
                  Pricing
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{user.email}</span>
                    <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                      {getPlanName()}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/pricing"
                  className="text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  to="/auth"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}