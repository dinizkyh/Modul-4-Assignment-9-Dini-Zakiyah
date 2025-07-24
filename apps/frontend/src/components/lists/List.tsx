import React, { useEffect, useState } from 'react';
import { getLists, createList, updateList, deleteList } from '../../services/lists/listsApi';
import ListItem from './ListItem';
import ListForm from './ListForm';
import { useToast } from '../../hooks/useToast';

interface ListType {
  id: string;
  name: string;
}

const List: React.FC = () => {
  const [lists, setLists] = useState<ListType[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const fetchLists = async () => {
    setLoading(true);
    try {
      const data = await getLists();
      // Pastikan data selalu array
      if (Array.isArray(data)) {
        setLists(data);
      } else if (Array.isArray(data?.data)) {
        setLists(data.data);
      } else {
        setLists([]);
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal memuat daftar', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleAdd = async (name: string) => {
    setLoading(true);
    try {
      await createList(name);
      showToast('List berhasil ditambah', 'success');
      fetchLists();
    } catch (err: any) {
      showToast(err.message || 'Gagal menambah list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => setEditingId(id);
  const handleCancelEdit = () => setEditingId(null);

  const handleUpdate = async (name: string) => {
    if (!editingId) return;
    setLoading(true);
    try {
      await updateList(editingId, name);
      showToast('List berhasil diupdate', 'success');
      setEditingId(null);
      fetchLists();
    } catch (err: any) {
      showToast(err.message || 'Gagal update list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteList(id);
      showToast('List berhasil dihapus', 'success');
      fetchLists();
    } catch (err: any) {
      showToast(err.message || 'Gagal hapus list', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white text-center">Daftar List</h2>
      <ListForm
        key={editingId || `add-${lists.length}`}
        onSubmit={editingId ? handleUpdate : handleAdd}
        loading={loading}
        initialName={editingId ? lists.find(l => l.id === editingId)?.name : ''}
        isEditing={!!editingId}
        onCancelEdit={handleCancelEdit}
      />
      <div className="mt-6 space-y-3">
        {lists.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8 border rounded-lg bg-gray-50 dark:bg-gray-800">
            Belum ada list. Tambahkan list baru untuk memulai!
          </div>
        ) : (
          lists.map(list => (
            <div key={list.id} className="bg-white dark:bg-gray-900 shadow rounded-lg p-4 flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-white">{list.name}</span>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 text-sm`}
                  onClick={() => handleEdit(list.id)}
                  disabled={editingId === list.id}
                >Edit</button>
                {editingId === list.id && (
                  <button
                    className="px-3 py-1 rounded bg-gray-400 text-white hover:bg-gray-500 text-sm"
                    onClick={handleCancelEdit}
                  >Batal</button>
                )}
                <button
                  className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
                  onClick={() => handleDelete(list.id)}
                >Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
      {ToastComponent}
    </div>
  );
};

export default List;
