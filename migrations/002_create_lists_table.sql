-- Migration: 002_create_lists_table.sql
-- Create lists table for storing task lists

CREATE TABLE IF NOT EXISTS lists (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique constraint for list name per user
    UNIQUE KEY unique_list_name_per_user (user_id, name)
);

-- Create index on user_id for faster lookups
CREATE INDEX idx_lists_user_id ON lists(user_id);

-- Create index on created_at for sorting
CREATE INDEX idx_lists_created_at ON lists(created_at);

-- Create index on name for searching
CREATE INDEX idx_lists_name ON lists(name);
