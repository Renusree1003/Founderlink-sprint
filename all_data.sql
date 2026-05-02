-- SQL Script to clear all data from the tables
-- This will delete all rows and reset auto-increment counters

TRUNCATE TABLE 
    user_profiles, 
    startups, 
    teams, 
    investments, 
    user_roles, 
    users, 
    roles, 
    conversation, 
    message 
RESTART IDENTITY CASCADE;

-- Seed roles
INSERT INTO roles (name) VALUES ('ROLE_FOUNDER');
INSERT INTO roles (name) VALUES ('ROLE_INVESTOR');
INSERT INTO roles (name) VALUES ('ROLE_COFOUNDER');
INSERT INTO roles (name) VALUES ('ROLE_ADMIN');
