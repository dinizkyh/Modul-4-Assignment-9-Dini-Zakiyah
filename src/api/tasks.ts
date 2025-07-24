import express from 'express';
// In-memory tasks array
const tasks: any[] = [];
const router = express.Router();
// GET /api/tasks/:id
router.get('/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  return res.json({ success: true, data: { task }, message: 'Task retrieved successfully' });
});

// POST /api/tasks
router.post('/', (req, res) => {
  // TODO: implement create task without listId
  const newTask = {
    id: Math.random().toString(36).substring(2, 12),
    listId: req.body.listId || '',
    title: req.body.title || '',
    description: req.body.description || '',
    dueDate: req.body.dueDate || null,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  tasks.push(newTask);
  res.status(201).json({ success: true, data: { task: newTask }, message: 'Task created successfully' });
});

// POST /api/lists/:listId/tasks
router.post('/:listId/tasks', (req, res) => {
  // TODO: validation
  const newTask = {
    id: Math.random().toString(36).substring(2, 12),
    listId: req.params.listId,
    title: req.body.title || '',
    description: req.body.description || '',
    dueDate: req.body.dueDate || null,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  tasks.push(newTask);
  res.status(201).json({ success: true, data: { task: newTask }, message: 'Task created successfully' });
});

// PUT /api/tasks/:id
router.put('/:id', (req, res) => {
  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  const updatedTask = {
    ...tasks[idx],
    listId: req.body.listId || tasks[idx].listId,
    title: req.body.title || tasks[idx].title,
    description: req.body.description || tasks[idx].description,
    dueDate: req.body.dueDate || tasks[idx].dueDate,
    completed: req.body.completed ?? tasks[idx].completed,
    updatedAt: new Date().toISOString()
  };
  tasks[idx] = updatedTask;
  return res.json({ success: true, data: { task: updatedTask }, message: 'Task updated successfully' });
});

// DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  tasks.splice(idx, 1);
  return res.status(200).json({ success: true, message: 'Task deleted successfully' });
});

// PATCH /api/tasks/:id/complete
router.patch('/:id/complete', (req, res) => {
  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  tasks[idx].completed = !tasks[idx].completed;
  tasks[idx].updatedAt = new Date().toISOString();
  return res.json({ success: true, data: { task: tasks[idx] }, message: 'Task completion toggled' });
});

// GET /api/lists/:listId/tasks
router.get('/:listId/tasks', (req, res) => {
  const listTasks = tasks.filter(t => t.listId === req.params.listId);
  return res.status(200).json({ success: true, data: { tasks: listTasks }, message: 'Tasks retrieved successfully' });
});

// GET /api/tasks/due-this-week
router.get('/due-this-week', (req, res) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const result = tasks.filter(t => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    return due >= startOfWeek && due <= endOfWeek;
  });
  return res.status(200).json({ success: true, data: { tasks: result }, message: 'Tasks due this week retrieved successfully' });
});

// GET /api/tasks?sort=deadline
router.get('/', (req, res) => {
  let result = [...tasks];
  if (req.query.sort === 'deadline') {
    result.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }
  return res.status(200).json({ success: true, data: { tasks: result }, message: 'Tasks retrieved successfully' });
});

export default router;
