/* ============================================
   API CLIENT — typeCode
   Centralized HTTP client for all backend calls
   ============================================ */

const API = (function () {
  'use strict';

  // ---- Configuration ----
  const BASE_URL = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
    ? 'http://127.0.0.1:5000/api'
    : 'https://typecode.onrender.com/api';

  // ---- Token Management ----
  function getAccessToken() {
    return localStorage.getItem('tc_access_token');
  }

  function getRefreshToken() {
    return localStorage.getItem('tc_refresh_token');
  }

  function setTokens(access, refresh) {
    localStorage.setItem('tc_access_token', access);
    if (refresh) localStorage.setItem('tc_refresh_token', refresh);
  }

  function clearTokens() {
    localStorage.removeItem('tc_access_token');
    localStorage.removeItem('tc_refresh_token');
    localStorage.removeItem('tc_user');
  }

  function getUser() {
    const u = localStorage.getItem('tc_user');
    return u ? JSON.parse(u) : null;
  }

  function setUser(user) {
    localStorage.setItem('tc_user', JSON.stringify(user));
  }

  function isLoggedIn() {
    return !!getAccessToken();
  }

  // ---- Core Request Function ----
  async function request(method, endpoint, body, requireAuth) {
    if (requireAuth === undefined) requireAuth = true;

    var headers = { 'Content-Type': 'application/json' };

    if (requireAuth) {
      var token = getAccessToken();
      if (!token) {
        // Try to refresh
        var refreshed = await refreshAccessToken();
        if (!refreshed) {
          window.location.href = 'login.html';
          throw new Error('Not authenticated');
        }
        token = getAccessToken();
      }
      headers['Authorization'] = 'Bearer ' + token;
    }

    var options = {
      method: method,
      headers: headers,
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    var url = BASE_URL + endpoint;

    // For GET requests with query params, append them
    if (method === 'GET' && body) {
      var params = new URLSearchParams(body).toString();
      url += '?' + params;
      delete options.body;
    }

    var response = await fetch(url, options);

    // Handle 401 — try token refresh once
    if (response.status === 401 && requireAuth) {
      var refreshed = await refreshAccessToken();
      if (refreshed) {
        headers['Authorization'] = 'Bearer ' + getAccessToken();
        options.headers = headers;
        response = await fetch(url, options);
      } else {
        clearTokens();
        window.location.href = 'login.html';
        throw new Error('Session expired');
      }
    }

    var data = await response.json();

    if (!response.ok) {
      throw { status: response.status, message: data.message || 'Request failed', data: data };
    }

    return data;
  }

  // ---- Token Refresh ----
  async function refreshAccessToken() {
    var refresh = getRefreshToken();
    if (!refresh) return false;

    try {
      var response = await fetch(BASE_URL + '/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + refresh,
        },
      });

      if (response.ok) {
        var data = await response.json();
        setTokens(data.access_token, data.refresh_token || refresh);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  // ============================================
  // AUTH ENDPOINTS
  // ============================================
  async function register(username, email, password) {
    var data = await request('POST', '/auth/register', {
      username: username,
      email: email,
      password: password,
    }, false);
    setTokens(data.access_token, data.refresh_token);
    setUser(data.user);
    return data;
  }

  async function login(email, password) {
    var data = await request('POST', '/auth/login', {
      email: email,
      password: password,
    }, false);
    setTokens(data.access_token, data.refresh_token);
    setUser(data.user);
    return data;
  }

  async function logout() {
    try {
      await request('POST', '/auth/logout', null, true);
    } catch (e) {
      // Ignore errors on logout
    }
    clearTokens();
    window.location.href = 'login.html';
  }

  // ============================================
  // TYPING CONTENT ENDPOINTS
  // ============================================
  function getTexts(params) {
    return request('GET', '/texts', params, false);
  }

  function getCodeSnippets(params) {
    return request('GET', '/code-snippets', params, false);
  }

  // ============================================
  // RESULTS ENDPOINTS
  // ============================================
  function saveResult(resultData) {
    return request('POST', '/results', resultData);
  }

  function saveKeyErrors(errorsData) {
    return request('POST', '/results/key-errors', errorsData);
  }

  function getHistory(params) {
    return request('GET', '/results/history', params);
  }

  // ============================================
  // PROGRESS ENDPOINTS
  // ============================================
  function getProgress() {
    return request('GET', '/progress');
  }

  function getWeakKeys() {
    return request('GET', '/progress/weak-keys');
  }

  // ============================================
  // LEADERBOARD ENDPOINTS
  // ============================================
  function getLeaderboard(params) {
    return request('GET', '/leaderboard', params, false);
  }

  // ============================================
  // PROFILE ENDPOINTS
  // ============================================
  function getProfile() {
    return request('GET', '/user/profile');
  }

  function updateProfile(data) {
    return request('PUT', '/user/profile', data);
  }

  function changePassword(data) {
    return request('PUT', '/user/password', data);
  }

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================
  function adminGetUsers(params) {
    return request('GET', '/admin/users', params);
  }

  function adminUpdateUser(id, data) {
    return request('PUT', '/admin/users/' + id, data);
  }

  function adminDeleteUser(id) {
    return request('DELETE', '/admin/users/' + id);
  }

  function adminAddText(data) {
    return request('POST', '/admin/texts', data);
  }

  function adminUpdateText(id, data) {
    return request('PUT', '/admin/texts/' + id, data);
  }

  function adminDeleteText(id) {
    return request('DELETE', '/admin/texts/' + id);
  }

  function adminAddSnippet(data) {
    return request('POST', '/admin/code-snippets', data);
  }

  function adminUpdateSnippet(id, data) {
    return request('PUT', '/admin/code-snippets/' + id, data);
  }

  function adminDeleteSnippet(id) {
    return request('DELETE', '/admin/code-snippets/' + id);
  }

  function adminGetAnalytics() {
    return request('GET', '/admin/analytics');
  }

  // ---- Public Interface ----
  return {
    // Auth
    register: register,
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn,
    getUser: getUser,
    setUser: setUser,
    clearTokens: clearTokens,

    // Content
    getTexts: getTexts,
    getCodeSnippets: getCodeSnippets,

    // Results
    saveResult: saveResult,
    saveKeyErrors: saveKeyErrors,
    getHistory: getHistory,

    // Progress
    getProgress: getProgress,
    getWeakKeys: getWeakKeys,

    // Leaderboard
    getLeaderboard: getLeaderboard,

    // Profile
    getProfile: getProfile,
    updateProfile: updateProfile,
    changePassword: changePassword,

    // Admin
    adminGetUsers: adminGetUsers,
    adminUpdateUser: adminUpdateUser,
    adminDeleteUser: adminDeleteUser,
    adminAddText: adminAddText,
    adminUpdateText: adminUpdateText,
    adminDeleteText: adminDeleteText,
    adminAddSnippet: adminAddSnippet,
    adminUpdateSnippet: adminUpdateSnippet,
    adminDeleteSnippet: adminDeleteSnippet,
    adminGetAnalytics: adminGetAnalytics,
  };

})();
