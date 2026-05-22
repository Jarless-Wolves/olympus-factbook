/* ============================================================
   OLYMPUS ANOMALY FACT BOOK
   utils.js — shared utility functions and Supabase auth
   © 2026 David M. Arnold. All rights reserved.
   ============================================================ */


/* ------------------------------------------------------------
   SUPABASE CLIENT
   ------------------------------------------------------------ */

const SUPABASE_URL = 'https://aopklhrfxtyhglznelua.supabase.co';
const SUPABASE_KEY = 'sb_publishable_9pr1docO_yBUsM4KRy09Dw_hrZF__E9';

// Supabase JS loaded via CDN in each page's <head>
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


/* ------------------------------------------------------------
   AUTH STATE
   ------------------------------------------------------------ */

let currentUser = null;

async function initAuth() {
  const { data: { session } } = await db.auth.getSession();
  currentUser = session?.user ?? null;
  updateAuthUI();

  db.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user ?? null;
    updateAuthUI();
  });
}

async function handleLogin() {
  if (currentUser) {
    await db.auth.signOut();
  } else {
    await db.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.href
      }
    });
  }
}

function updateAuthUI() {
  const btn = document.getElementById('btnLogin');
  if (!btn) return;

  if (currentUser) {
    btn.style.color = '#6bcc6b';
    btn.title = 'Logout';
  } else {
    btn.style.color = '#666';
    btn.title = 'Login with GitHub';
  }

  // Show/hide any admin elements on the page
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = currentUser ? '' : 'none';
  });
}


/* ------------------------------------------------------------
   NAV DROPDOWNS
   (shared across all pages)
   ------------------------------------------------------------ */

function toggleNav(id) {
  const item = document.getElementById(id);
  if (!item) return;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.nav-item.open').forEach(el => el.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('.nav-item')) {
    document.querySelectorAll('.nav-item.open').forEach(el => el.classList.remove('open'));
  }
});


/* ------------------------------------------------------------
   UTILITY FUNCTIONS
   ------------------------------------------------------------ */

// Format a Supabase timestamp as a year string
function yearFromTimestamp(ts) {
  if (!ts) return new Date().getFullYear();
  return new Date(ts).getFullYear();
}

// Split a comma-separated string into a trimmed array
function splitList(str) {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

// Join an array into a comma-separated display string
function joinList(arr) {
  if (!arr || !arr.length) return '—';
  return arr.join(', ');
}

// Capitalize first letter of a string
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Safely get a value or return a fallback
function val(v, fallback = '—') {
  return v !== null && v !== undefined && v !== '' ? v : fallback;
}


/* ------------------------------------------------------------
   INIT
   ------------------------------------------------------------ */

// Run auth init on every page load
document.addEventListener('DOMContentLoaded', initAuth);
