import React, { useState } from 'react';
import { Input } from '../ui/Input';
import Button from '../ui/Button';

interface TaskFormProps {
  initial?: {
    title?: string;
    description?: string;
    dueDate?: string;
  };
  onSubmit: (data: { title: string; description?: string; dueDate?: string }) => void;
  loading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({ initial = {}, onSubmit, loading }) => {
  const [title, setTitle] = useState(initial.title || '');
  const [description, setDescription] = useState(initial.description || '');
  const [dueDate, setDueDate] = useState(initial.dueDate || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit({ title: title.trim(), description, dueDate });
      setTitle('');
      setDescription('');
      setDueDate('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <Input label="Judul Tugas" value={title} onChange={e => setTitle(e.target.value)} required />
      <Input label="Deskripsi" value={description} onChange={e => setDescription(e.target.value)} />
      <Input label="Deadline" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
      <Button type="submit" disabled={loading} className="mt-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
        {loading ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
};

export default TaskForm;
