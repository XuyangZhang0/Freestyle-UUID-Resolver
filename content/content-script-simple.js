/**
 * Content Script for UUID Resolver Chrome Extension
 * Simple context menu-based UUID resolution
 */

console.log('UUID Resolver: Content script loaded');

// Toast utilities
function ensureStyle() {
  if (document.getElementById('uuid-resolver-toast-style')) return;
  const style = document.createElement('style');
  style.id = 'uuid-resolver-toast-style';
  style.textContent = `
    .uuid-resolver-toast-container{position:fixed;right:16px;bottom:16px;z-index:2147483647;display:flex;flex-direction:column;gap:8px}
    .uuid-resolver-toast{background:#0b6aa2;color:#fff;padding:12px 14px;border-radius:8px;box-shadow:0 4px 18px rgba(0,0,0,.2);max-width:380px;font:13px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;position:relative}
    .uuid-resolver-toast.info{background:#d97706} /* orange-600 */
    .uuid-resolver-toast.success{background:#0e7a22}
    .uuid-resolver-toast.error{background:#b00020}
    .uuid-resolver-toast .title{font-weight:600;margin-bottom:4px}
    .uuid-resolver-toast .body{white-space:pre-wrap;word-break:break-word}
    .uuid-resolver-toast .close{position:absolute;top:8px;right:10px;cursor:pointer;opacity:.9}
  `;
  document.head.appendChild(style);
}

function getContainer(){
  let c = document.querySelector('.uuid-resolver-toast-container');
  if (!c){
    c = document.createElement('div');
    c.className = 'uuid-resolver-toast-container';
    document.body.appendChild(c);
  }
  return c;
}

function showToast(title, body, level='info', timeout=6000, persist=false){
  ensureStyle();
  const el = document.createElement('div');
  el.className = `uuid-resolver-toast ${level}`;
  el.innerHTML = `<div class="title">${title}</div><div class="body">${body}</div><div class="close" aria-label="Close">×</div>`;
  const closeBtn = el.querySelector('.close');
  closeBtn.addEventListener('click', () => el.remove());
  getContainer().appendChild(el);
  if (!persist) {
    setTimeout(()=>{ el.remove(); }, timeout);
  }
}

function formatEntityToast(data){
  const name = data.name || 'Unknown';
  const type = data.subType || data.type || 'Entity';
  const uuid = data.uuid || '';
  let body = `Name: ${name}\nType: ${type}`;
  if (data.description) body += `\n${data.description}`;
  if (uuid) body += `\nUUID: ${uuid}`;
  return body;
}

function dismissInfoToasts(){
  document.querySelectorAll('.uuid-resolver-toast.info')?.forEach(el => el.remove());
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.action === 'displayResolvedEntity' && message.data) {
    const body = formatEntityToast(message.data);
    // Remove any in-progress info toast
    dismissInfoToasts();
    // Success should persist longer and provide close
    showToast('UUID Resolved', body, 'success', 12000, true);
    sendResponse?.({ ok: true });
    return; // handled
  }
  if (message?.action === 'displayExtensionMessage') {
    const { title = 'UUID Resolver', message: msg = ' ', level = 'info', persist = false } = message;
    // Collapse any existing info (orange) toast when showing success/error
    if (level === 'success' || level === 'error') dismissInfoToasts();
    const defaultTimeout = level === 'success' ? 12000 : level === 'error' ? 7000 : 3000;
    showToast(title, msg, level, defaultTimeout, !!persist);
    sendResponse?.({ ok: true });
    return;
  }
  if (message?.action === 'ping') {
    sendResponse?.({ success: true, message: 'Content script is active' });
    return;
  }
  sendResponse?.({ success: true });
});

// Notify background that content script is loaded
chrome.runtime.sendMessage({ action: 'contentScriptLoaded', url: window.location.href }).catch(()=>{});

console.log('UUID Resolver: Context menu-based UUID resolver ready');
