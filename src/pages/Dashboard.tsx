import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { SubscriptionStatus } from '../components/SubscriptionStatus'
import { Plus, Eye, EyeOff, CreditCard as Edit2, Trash2, Key, LogOut, CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Secret {
  id: string
  project_name: string
  key_label: string
  secret_value: string
  created_at: string
  updated_at: string
}

export function Dashboard() {
  const { user, signOut } = useAuth()
  const [secrets, setSecrets] = useState<Secret[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSecret, setEditingSecret] = useState<Secret | null>(null)
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({
    project_name: '',
    key_label: '',
    secret_value: ''
  })

  useEffect(() => {
    fetchSecrets()
  }, [])

  const fetchSecrets = async () => {
    try {
      const { data, error } = await supabase
        .from('secrets')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      setSecrets(data || [])
    } catch (error) {
      console.error('Error fetching secrets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingSecret) {
        const { error } = await supabase
          .from('secrets')
          .update(formData)
          .eq('id', editingSecret.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('secrets')
          .insert([{ ...formData, user_id: user?.id }])
        
        if (error) throw error
      }

      setFormData({ project_name: '', key_label: '', secret_value: '' })
      setShowForm(false)
      setEditingSecret(null)
      fetchSecrets()
    } catch (error) {
      console.error('Error saving secret:', error)
    }
  }

  const handleEdit = (secret: Secret) => {
    setEditingSecret(secret)
    setFormData({
      project_name: secret.project_name,
      key_label: secret.key_label,
      secret_value: secret.secret_value
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this secret?')) return

    try {
      const { error } = await supabase
        .from('secrets')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchSecrets()
    } catch (error) {
      console.error('Error deleting secret:', error)
    }
  }

  const toggleSecretVisibility = (id: string) => {
    const newVisible = new Set(visibleSecrets)
    if (newVisible.has(id)) {
      newVisible.delete(id)
    } else {
      newVisible.add(id)
    }
    setVisibleSecrets(newVisible)
  }

  const maskSecret = (value: string) => {
    if (value.length <= 8) return '•'.repeat(value.length)
    return value.substring(0, 4) + '•'.repeat(value.length - 8) + value.substring(value.length - 4)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Key className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Key Stash</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <SubscriptionStatus />
              <Link
                to="/pricing"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Upgrade
              </Link>
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={signOut}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Secrets</h2>
            <button
              onClick={() => {
                setShowForm(true)
                setEditingSecret(null)
                setFormData({ project_name: '', key_label: '', secret_value: '' })
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Secret
            </button>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingSecret ? 'Edit Secret' : 'Add New Secret'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Project Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.project_name}
                    onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Key Label</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.key_label}
                    onChange={(e) => setFormData({ ...formData, key_label: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Secret Value</label>
                  <textarea
                    required
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.secret_value}
                    onChange={(e) => setFormData({ ...formData, secret_value: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingSecret(null)
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {editingSecret ? 'Update' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Secrets List */}
          {secrets.length === 0 ? (
            <div className="text-center py-12">
              <Key className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No secrets yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your first secret.</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {secrets.map((secret) => (
                  <li key={secret.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {secret.project_name}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {secret.key_label}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <code className="text-sm text-gray-500 font-mono">
                                {visibleSecrets.has(secret.id) ? secret.secret_value : maskSecret(secret.secret_value)}
                              </code>
                              <button
                                onClick={() => toggleSecretVisibility(secret.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {visibleSecrets.has(secret.id) ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(secret)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(secret.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}