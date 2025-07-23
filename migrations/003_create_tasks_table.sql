-- Migration: 003_create_tasks_table.sql
-- Create tasks table for storing individual tasks

CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline TIMESTAMP NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    list_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index on list_id for faster lookups
CREATE INDEX idx_tasks_list_id ON tasks(list_id);

-- Create index on user_id for faster lookups
CREATE INDEX idx_tasks_user_id ON tasks(user_id);

-- Create index on deadline for filtering and sorting
CREATE INDEX idx_tasks_deadline ON tasks(deadline);

-- Create index on is_completed for filtering
CREATE INDEX idx_tasks_is_completed ON tasks(is_completed);

-- Create index on created_at for sorting
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- Create composite index for user tasks sorted by deadline
CREATE INDEX idx_tasks_user_deadline ON tasks(user_id, deadline);
