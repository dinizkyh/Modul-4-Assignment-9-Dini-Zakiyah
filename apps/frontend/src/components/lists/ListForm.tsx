import React, { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import Button from '../ui/Button';

interface ListFormProps {
  initialName?: string;
  onSubmit: (name: string) => void;
  loading?: boolean;
  isEditing?: boolean;
  onCancelEdit?: () => void;
}

const ListForm: React.FC<ListFormProps> = ({ initialName = '', onSubmit, loading, isEditing, onCancelEdit }) => {
  const [name, setName] = useState(initialName);

  // Clear input when initialName changes (e.g., after save or cancel edit)
  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onSubmit(name.trim());
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => window.history.back()}
        className="px-4 py-2 rounded-lg bg-gray-700 text-white font-semibold shadow hover:bg-gray-500 transition flex items-center gap-2 mb-6"
        aria-label="Back"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
      <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-2">
        <Input label="List Name" value={name} onChange={e => setName(e.target.value)} required />
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={loading}
            className="mt-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            {loading ? 'Saving...' : isEditing ? 'Edit' : 'Save'}
          </Button>
          {isEditing && onCancelEdit && (
            <Button
              type="button"
              onClick={onCancelEdit}
              className="mt-2 bg-gray-400 text-white rounded-lg shadow hover:bg-gray-500 transition"
            >Batal</Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ListForm;
