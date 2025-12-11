-- Database fix for conversation type column truncation
-- Run this SQL script to fix the 'type' column length issue

-- Fix the conversations table type column to accommodate longer enum values
ALTER TABLE conversations MODIFY COLUMN type VARCHAR(20) NOT NULL;

-- Verify the change
DESCRIBE conversations;
