import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTasks, updateTask } from '../../services/tasks/tasksApi';
import TaskForm from './TaskForm';
import { useToast } from '../../hooks/useToast';
import { getLists } from '../../services/lists/listsApi';

const EditTaskPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState<any>(null);
  const [lists, setLists] = useState<{ id: string; name: string }[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');

  useEffect(() => {
    const fetchTaskAndLists = async () => {
      setLoading(true);
      try {
        const [allTasks, listData] = await Promise.all([getTasks(), getLists()]);
        const found = Array.isArray(allTasks)
          ? allTasks.find((t: any) => t.id === taskId)
          : allTasks?.data?.find((t: any) => t.id === taskId);
        setTask(found || null);
        const sortedLists = Array.isArray(listData) ? listData : listData?.data || [];
        setLists(sortedLists);
        if (found && found.listId) setSelectedListId(found.listId);
        else if (sortedLists.length > 0) setSelectedListId(sortedLists[0].id);
      } catch (err: any) {
        showToast('Gagal memuat data tugas atau list', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (taskId) fetchTaskAndLists();
  }, [taskId]);

  const handleUpdate = async (data: { title: string; description?: string; dueDate?: string }) => {
    setLoading(true);
    try {
    await updateTask(taskId!, { ...data, listId: selectedListId } as any);
      showToast('Tugas berhasil diupdate', 'success');
      navigate('/tasks');
    } catch (err: any) {
      showToast(err.message || 'Gagal update tugas', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Edit Tugas</h2>
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
      {loading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-gray-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span className="text-gray-500 dark:text-gray-400">Memuat data tugas...</span>
        </div>
      ) : task ? (
        <TaskForm
          key={task.id}
          initial={task}
          onSubmit={handleUpdate}
          loading={loading}
        />
      ) : (
        <div className="text-center text-red-500 dark:text-red-400 py-8 border rounded-lg bg-gray-50 dark:bg-gray-800">
          Tugas tidak ditemukan.
        </div>
      )}
      {ToastComponent}
    </div>
  );
};

export default EditTaskPage;
