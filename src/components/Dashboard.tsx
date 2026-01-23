import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Key, LogOut, Plus } from 'lucide-react';
import { SecretsList } from './SecretsList';
import { SecretModal } from './SecretModal';
import { supabase, Secret } from '../lib/supabase';

export const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSecret, setEditingSecret] = useState<Secret | null>(null);

  const loadSecrets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('secrets')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setSecrets(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSecrets();
  }, []);

  const handleAddNew = () => {
    setEditingSecret(null);
    setIsModalOpen(true);
  };

  const handleEdit = (secret: Secret) => {
    setEditingSecret(secret);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('secrets').delete().eq('id', id);
    if (!error) {
      setSecrets(secrets.filter((s) => s.id !== id));
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingSecret(null);
    loadSecrets();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Key Stash</h1>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Secrets</h2>
            <p className="text-slate-400 mt-1">
              {secrets.length} {secrets.length === 1 ? 'secret' : 'secrets'} stored
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg hover:shadow-indigo-500/50"
          >
            <Plus className="w-5 h-5" />
            Add Secret
          </button>
        </div>

        <SecretsList
          secrets={secrets}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>

      {isModalOpen && (
        <SecretModal
          secret={editingSecret}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};
