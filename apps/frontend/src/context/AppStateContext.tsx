import React, { createContext, useContext, useState } from 'react';

export interface ListType {
  id: string;
  name: string;
}
export interface TaskType {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed?: boolean;
  listId?: string;
}

interface AppState {
  lists: ListType[];
  setLists: React.Dispatch<React.SetStateAction<ListType[]>>;
  tasks: TaskType[];
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export const useAppState = () => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
};

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lists, setLists] = useState<ListType[]>([]);
  const [tasks, setTasks] = useState<TaskType[]>([]);

  return (
    <AppStateContext.Provider value={{ lists, setLists, tasks, setTasks }}>
      {children}
    </AppStateContext.Provider>
  );
};
