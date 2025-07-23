-- Migration script for tasks table
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  list_id INTEGER REFERENCES lists(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  deadline TIMESTAMP
);
