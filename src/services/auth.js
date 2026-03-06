// Auth service - localStorage implementation (Firebase-ready abstraction)

const USERS_KEY = 'globetap_users';
const SESSION_KEY = 'globetap_session';

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function signup(username, password) {
  const users = getUsers();
  const key = username.toLowerCase();
  if (users[key]) return { error: 'Username already taken' };
  users[key] = { username, password, createdAt: Date.now() };
  saveUsers(users);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ username, loggedInAt: Date.now() }));
  return { user: { username } };
}

export function login(username, password) {
  const users = getUsers();
  const key = username.toLowerCase();
  const user = users[key];
  if (!user || user.password !== password) return { error: 'Invalid username or password' };
  localStorage.setItem(SESSION_KEY, JSON.stringify({ username: user.username, loggedInAt: Date.now() }));
  return { user: { username: user.username } };
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser() {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return null;
  return JSON.parse(session);
}

export function getAllUsers() {
  const users = getUsers();
  return Object.values(users).map(u => ({ username: u.username, createdAt: u.createdAt }));
}
