import React, { useState, useEffect } from 'react';
import TaskForm from './TaskForm';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { createTask } from '../../services/tasks/tasksApi';
import { getLists } from '../../services/lists/listsApi';

const AddTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const [lists, setLists] = useState<{ id: string; name: string }[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLists = async () => {
      setLoading(true);
      try {
        const data = await getLists();
        setLists(Array.isArray(data) ? data : data?.data || []);
        if (Array.isArray(data) && data.length > 0) setSelectedListId(data[0].id);
        else if (Array.isArray(data?.data) && data.data.length > 0) setSelectedListId(data.data[0].id);
      } catch {
        setLists([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLists();
  }, []);

  const handleAdd = async (data: { title: string; description?: string; dueDate?: string }) => {
    try {
      await createTask({ ...data, listId: selectedListId });
      showToast('Tugas berhasil ditambah', 'success');
      navigate('/tasks');
    } catch (err: any) {
      showToast(err.message || 'Gagal menambah tugas', 'error');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Tambah Tugas Baru</h2>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="px-4 py-2 rounded-lg bg-gray-700 text-white font-semibold shadow hover:bg-gray-500 transition flex items-center gap-2 mb-6"
        aria-label="Back"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
      <div className="mb-4">
        <label htmlFor="list-select" className="block mb-1 font-medium text-gray-900 dark:text-white">Pilih List</label>
        <select
          id="list-select"
          value={selectedListId}
          onChange={e => setSelectedListId(e.target.value)}
          className="w-full p-2 rounded border bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {lists.map(list => (
            <option key={list.id} value={list.id}>{list.name}</option>
          ))}
        </select>
      </div>
      <TaskForm onSubmit={handleAdd} loading={loading} />
      {ToastComponent}
    </div>
  );
};

export default AddTaskPage;
