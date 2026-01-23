import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase, Secret } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SecretModalProps {
  secret: Secret | null;
  onClose: () => void;
}

export const SecretModal = ({ secret, onClose }: SecretModalProps) => {
  const { user } = useAuth();
  const [projectName, setProjectName] = useState('');
  const [keyLabel, setKeyLabel] = useState('');
  const [secretValue, setSecretValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (secret) {
      setProjectName(secret.project_name);
      setKeyLabel(secret.key_label);
      setSecretValue(secret.secret_value);
    }
  }, [secret]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      if (secret) {
        const { error } = await supabase
          .from('secrets')
          .update({
            project_name: projectName,
            key_label: keyLabel,
            secret_value: secretValue,
          })
          .eq('id', secret.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('secrets')
          .insert({
            user_id: user.id,
            project_name: projectName,
            key_label: keyLabel,
            secret_value: secretValue,
          });

        if (error) throw error;
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">
            {secret ? 'Edit Secret' : 'Add New Secret'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-slate-300 mb-2">
              Project Name
            </label>
            <input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My Awesome Project"
              required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="keyLabel" className="block text-sm font-medium text-slate-300 mb-2">
              Key Label
            </label>
            <input
              id="keyLabel"
              type="text"
              value={keyLabel}
              onChange={(e) => setKeyLabel(e.target.value)}
              placeholder="API_KEY or STRIPE_SECRET"
              required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="secretValue" className="block text-sm font-medium text-slate-300 mb-2">
              Secret Value
            </label>
            <textarea
              id="secretValue"
              value={secretValue}
              onChange={(e) => setSecretValue(e.target.value)}
              placeholder="sk_live_xxxxxxxxxxxxx"
              required
              rows={4}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/50"
            >
              {loading ? 'Saving...' : secret ? 'Update' : 'Add Secret'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
