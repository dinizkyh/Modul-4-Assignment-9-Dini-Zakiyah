-- Database indexes for optimized queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_lists_user_id ON lists(user_id);
CREATE INDEX idx_tasks_list_id ON tasks(list_id);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
