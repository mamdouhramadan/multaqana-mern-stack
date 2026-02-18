// This file defines the list of user roles and their corresponding numeric codes.
// Why? Using numbers for roles is efficient for comparisons and storage in the database.
// What if not exist? You would have to hardcode "Admin" or "User" strings everywhere, which is prone to typos (e.g. "admin" vs "Admin") and harder to manage.
const ROLES_LIST = {
  "User": 2001,     // Standard user role, can access basic features
  "Employee": 2002, // Employee role, attendance/leaves and basic read
  "Editor": 1984,   // Editor role, can modify content but not manage system settings
  "Admin": 5150     // Admin role, has full access to the system
}

module.exports = ROLES_LIST; // Export the list so it can be used in other files (like middleware and controllers)
