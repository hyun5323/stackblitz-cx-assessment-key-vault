import { useState } from 'react';
import { Eye, EyeOff, Copy, Edit2, Trash2, Check } from 'lucide-react';
import { Secret } from '../lib/supabase';

interface SecretsListProps {
  secrets: Secret[];
  loading: boolean;
  onEdit: (secret: Secret) => void;
  onDelete: (id: string) => void;
}

export const SecretsList = ({ secrets, loading, onEdit, onDelete }: SecretsListProps) => {
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleVisibility = (id: string) => {
    setVisibleSecrets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDeleteClick = (id: string, projectName: string) => {
    if (confirm(`Are you sure you want to delete the secret for "${projectName}"?`)) {
      onDelete(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (secrets.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Copy className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No secrets yet</h3>
        <p className="text-slate-400">Click "Add Secret" to store your first API key</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {secrets.map((secret) => (
        <div
          key={secret.id}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">{secret.project_name}</h3>
              <p className="text-sm text-slate-400">{secret.key_label}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(secret)}
                className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteClick(secret.id, secret.project_name)}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono text-slate-300 break-all">
                {visibleSecrets.has(secret.id)
                  ? secret.secret_value
                  : '•'.repeat(Math.min(secret.secret_value.length, 40))}
              </code>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleVisibility(secret.id)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title={visibleSecrets.has(secret.id) ? 'Hide' : 'Show'}
                >
                  {visibleSecrets.has(secret.id) ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => copyToClipboard(secret.secret_value, secret.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    copiedId === secret.id
                      ? 'text-green-400 bg-green-900/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Copy to clipboard"
                >
                  {copiedId === secret.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Updated {new Date(secret.updated_at).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
};
