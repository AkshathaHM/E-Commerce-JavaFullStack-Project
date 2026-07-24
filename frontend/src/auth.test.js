import test from 'node:test';
import assert from 'node:assert/strict';
import { clearAuthSession, getDashboardPath, isAuthenticated, setAuthSession } from './auth.js';

class MockStorage {
  constructor() {
    this.store = {};
  }

  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }
}

const storage = new MockStorage();
global.localStorage = storage;

test('setAuthSession stores auth state for the user', () => {
  clearAuthSession();
  setAuthSession('abc123', { username: 'Alice', role: 'CUSTOMER' });

  assert.equal(isAuthenticated(), true);
  assert.equal(localStorage.getItem('authToken'), 'abc123');
  assert.equal(localStorage.getItem('username'), 'Alice');
  assert.equal(localStorage.getItem('role'), 'CUSTOMER');
});

test('clearAuthSession removes persisted auth data', () => {
  clearAuthSession();

  assert.equal(isAuthenticated(), false);
  assert.equal(localStorage.getItem('authToken'), null);
  assert.equal(localStorage.getItem('username'), null);
  assert.equal(localStorage.getItem('role'), null);
});

test('getDashboardPath returns the correct dashboard for each role', () => {
  assert.equal(getDashboardPath('CUSTOMER'), '/customerhome');
  assert.equal(getDashboardPath('ADMIN'), '/admindashboard');
  assert.equal(getDashboardPath('UNKNOWN'), '/');
});
