import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ListItemProps {
  id: string;
  name: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const ListItem: React.FC<ListItemProps> = ({ id, name, onEdit, onDelete }) => (
  <Card className="flex items-center justify-between mb-2">
    <span className="font-medium text-gray-900 dark:text-white">{name}</span>
    <div className="flex gap-2">
      {onEdit && <Button size="sm" variant="secondary" onClick={() => onEdit(id)}>Edit</Button>}
      {onDelete && <Button size="sm" variant="error" onClick={() => onDelete(id)}>Delete</Button>}
    </div>
  </Card>
);

export default ListItem;
