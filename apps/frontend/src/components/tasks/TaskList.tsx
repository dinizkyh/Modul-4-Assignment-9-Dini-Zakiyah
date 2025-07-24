import React, { useEffect, useState } from 'react';
import { getTasks, createTask, updateTask, deleteTask, toggleComplete, getTasksDueThisWeek } from '../../services/tasks/tasksApi';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import { getLists } from '../../services/lists/listsApi';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';

interface TaskType {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed?: boolean;
  listId?: string;
}

const TaskList: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [lists, setLists] = useState<{ id: string; name: string }[]>([]);
  // ...existing code...
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [listDropdownTouched, setListDropdownTouched] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDueThisWeek, setShowDueThisWeek] = useState(false);
  const [isSortedByDeadline, setIsSortedByDeadline] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const fetchTasks = async (sort?: string) => {
    setLoading(true);
    try {
      const data = await getTasks(sort ? { sort } : undefined);
      if (Array.isArray(data)) {
        setTasks(data);
      } else if (Array.isArray(data?.data)) {
        setTasks(data.data);
      } else {
        setTasks([]);
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal memuat tugas', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      const listData = await getLists();
      // Sort alphabetically by name
      const sortedLists = [...listData].sort((a, b) => a.name.localeCompare(b.name));
      setLists(sortedLists);
      // Do not set selectedListId by default, wait for user selection
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (selectedListId) fetchTasks();
  }, [selectedListId]);

  const handleAdd = async (data: { title: string; description?: string; dueDate?: string }) => {
    setLoading(true);
    try {
      await createTask({ ...data, listId: selectedListId });
      showToast('Tugas berhasil ditambah', 'success');
      fetchTasks();
    } catch (err: any) {
      showToast(err.message || 'Gagal menambah tugas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => setEditingId(id);

  const handleUpdate = async (data: { title: string; description?: string; dueDate?: string }) => {
    if (!editingId) return;
    setLoading(true);
    try {
      await updateTask(editingId, data);
      showToast('Tugas berhasil diupdate', 'success');
      setEditingId(null);
      fetchTasks();
    } catch (err: any) {
      showToast(err.message || 'Gagal update tugas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteTask(id);
      showToast('Tugas berhasil dihapus', 'success');
      fetchTasks();
    } catch (err: any) {
      showToast(err.message || 'Gagal hapus tugas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (id: string) => {
    setLoading(true);
    try {
      await toggleComplete(id);
      showToast('Status tugas diubah', 'success');
      fetchTasks();
    } catch (err: any) {
      showToast(err.message || 'Gagal ubah status tugas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSortDeadline = () => {
    if (!isSortedByDeadline) {
      fetchTasks('deadline');
      setIsSortedByDeadline(true);
    } else {
      fetchTasks();
      setIsSortedByDeadline(false);
    }
  };

  const handleShowDueThisWeek = async () => {
    setLoading(true);
    setShowDueThisWeek(true);
    try {
      const data = await getTasksDueThisWeek();
      if (Array.isArray(data)) {
        setTasks(data);
      } else if (Array.isArray(data?.data)) {
        setTasks(data.data);
      } else {
        setTasks([]);
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal memuat tugas minggu ini', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Daftar Tugas</h2>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-lg bg-gray-700 text-white font-semibold shadow hover:bg-gray-500 transition flex items-center gap-2"
          aria-label="Back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          type="button"
          onClick={() => navigate('/tasks/add')}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition ml-auto flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Tugas
        </button>
      </div>
      <div className="mb-4">
        <label htmlFor="list-select" className="block mb-1 font-medium text-gray-900 dark:text-white">Pilih List</label>
        <select
          id="list-select"
          value={selectedListId}
          onChange={e => setSelectedListId(e.target.value)}
          className="w-full p-2 rounded border bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="" disabled>Pilih List</option>
          {lists.map(list => (
            <option key={list.id} value={list.id}>{list.name}</option>
          ))}
        </select>
      </div>
      {/* TaskForm removed as requested. */}
      <div className="flex gap-2 mb-4 justify-center">
        <Button
          variant="info"
          onClick={handleSortDeadline}
          className="bg-cyan-100 text-cyan-800 dark:bg-cyan-600 dark:text-white font-semibold px-4 py-2 rounded shadow"
        >
          {isSortedByDeadline ? 'Sort Default' : 'Sort by Deadline'}
        </Button>
        <Button
          variant="warning"
          onClick={handleShowDueThisWeek}
          className="bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-white font-semibold px-4 py-2 rounded shadow"
        >
          Tugas Minggu Ini
        </Button>
      </div>
      <div>
        {tasks.filter(task => task.listId === selectedListId).length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8 border rounded-lg bg-gray-50 dark:bg-gray-800">
            Belum ada tugas. Tambahkan tugas baru untuk memulai!
          </div>
        ) : (
          tasks.filter(task => task.listId === selectedListId).map(task => (
            <div key={task.id} className="bg-white dark:bg-gray-900 shadow rounded-lg p-4 mb-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg text-gray-900 dark:text-white">{task.title}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${task.completed ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}`}>{task.completed ? 'Selesai' : 'Belum'}</span>
              </div>
              {task.description && (
                <div className="text-gray-700 dark:text-gray-300 text-sm">{task.description}</div>
              )}
              {task.dueDate && (
                <div className="text-xs text-gray-500 dark:text-gray-400">Deadline: {new Date(task.dueDate).toLocaleDateString()}</div>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 text-sm"
                  onClick={() => navigate(`/tasks/edit/${task.id}`)}
                >Edit</button>
                <button
                  className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
                  onClick={() => handleDelete(task.id)}
                >Delete</button>
                <button
                  className={`px-3 py-1 rounded ${task.completed ? 'bg-gray-400 text-white' : 'bg-green-500 text-white hover:bg-green-600'} text-sm`}
                  onClick={() => handleToggleComplete(task.id)}
                >{task.completed ? 'Tandai Belum' : 'Tandai Selesai'}</button>
              </div>
            </div>
          ))
        )}
      </div>
      {ToastComponent}
    </div>
  );
};

export default TaskList;
