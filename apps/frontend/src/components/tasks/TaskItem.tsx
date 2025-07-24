import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface TaskItemProps {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleComplete?: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ id, title, description, dueDate, completed, onEdit, onDelete, onToggleComplete }) => (
  <Card className="flex flex-col md:flex-row md:items-center justify-between mb-2">
    <div>
      <span className={`font-medium text-gray-900 dark:text-white ${completed ? 'line-through' : ''}`}>{title}</span>
      {description && <div className="text-sm text-gray-500 dark:text-gray-300">{description}</div>}
      {dueDate && <div className="text-xs text-gray-400 dark:text-gray-400">Due: {new Date(dueDate).toLocaleDateString()}</div>}
    </div>
    <div className="flex gap-2 mt-2 md:mt-0">
      {onToggleComplete && (
        <Button size="sm" variant={completed ? 'success' : 'secondary'} onClick={() => onToggleComplete(id)}>
          {completed ? 'Selesai' : 'Belum'}
        </Button>
      )}
      {onEdit && <Button size="sm" variant="secondary" onClick={() => onEdit(id)}>Edit</Button>}
      {onDelete && <Button size="sm" variant="error" onClick={() => onDelete(id)}>Delete</Button>}
    </div>
  </Card>
);

export default TaskItem;
