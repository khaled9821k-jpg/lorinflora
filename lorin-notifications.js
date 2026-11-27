(function () {
  const toastTimers = new WeakMap();
  const dialogQueue = [];
  let activeDialog = null;
  let toastRegion = null;

  function isArabic() {
    const root = document.documentElement;
    return root.dir === 'rtl' || (root.lang || '').toLowerCase().startsWith('ar');
  }

  function getToastRegion() {
    if (toastRegion && toastRegion.isConnected) return toastRegion;
    toastRegion = document.createElement('div');
    toastRegion.className = 'lorin-toast-region';
    toastRegion.setAttribute('aria-label', isArabic() ? 'الإشعارات' : 'Notifications');
    document.body.appendChild(toastRegion);
    return toastRegion;
  }

  function showToastNotification(message, options) {
    const settings = typeof options === 'string' ? { type: options } : (options || {});
    const type = settings.type || 'success';
    const toast = document.createElement('div');
    const icon = document.createElement('span');
    const text = document.createElement('span');
    const close = document.createElement('button');
    const indicators = { success: 'OK', error: '!', warning: '!', info: 'i' };

    toast.className = 'lorin-toast';
    toast.dataset.type = type;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    toast.dir = 'auto';

    icon.className = 'lorin-toast__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = indicators[type] || indicators.success;

    text.className = 'lorin-toast__message';
    text.textContent = String(message);

    close.className = 'lorin-toast__close';
    close.type = 'button';
    close.setAttribute('aria-label', isArabic() ? 'إغلاق الإشعار' : 'Dismiss notification');
    close.textContent = 'x';
    close.addEventListener('click', dismiss);

    toast.append(icon, text, close);
    getToastRegion().appendChild(toast);
    let dismissed = false;
    requestAnimationFrame(function () {
      toast.classList.add('is-visible');
    });

    toastTimers.set(toast, window.setTimeout(dismiss, 3000));

    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      const timer = toastTimers.get(toast);
      if (timer) window.clearTimeout(timer);
      toast.classList.remove('is-visible');
      window.setTimeout(function () { toast.remove(); }, 260);
    }
  }

  function enqueueDialog(kind, message, value) {
    return new Promise(function (resolve) {
      dialogQueue.push({ kind: kind, message: message, value: value, resolve: resolve });
      renderNextDialog();
    });
  }

  function renderNextDialog() {
    if (activeDialog || !dialogQueue.length) return;
    const item = dialogQueue.shift();
    const arabic = isArabic();
    const backdrop = document.createElement('div');
    const dialog = document.createElement('section');
    const message = document.createElement('p');
    const actions = document.createElement('div');
    const cancel = document.createElement('button');
    const confirm = document.createElement('button');
    let input = null;
    let settled = false;
    const previousFocus = document.activeElement;

    backdrop.className = 'lorin-dialog-backdrop';
    dialog.className = 'lorin-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'lorin-dialog-message');
    dialog.dir = document.documentElement.dir || 'auto';
    message.className = 'lorin-dialog__message';
    message.id = 'lorin-dialog-message';
    message.textContent = String(item.message);
    actions.className = 'lorin-dialog__actions';

    cancel.className = 'lorin-dialog__button lorin-dialog__button--cancel';
    cancel.type = 'button';
    cancel.textContent = arabic ? 'إلغاء' : 'Cancel';
    confirm.className = 'lorin-dialog__button lorin-dialog__button--confirm';
    confirm.type = 'button';
    confirm.textContent = arabic ? 'تأكيد' : 'Confirm';

    if (item.kind === 'prompt') {
      input = document.createElement('input');
      input.className = 'lorin-dialog__input';
      input.type = 'text';
      input.dir = 'auto';
      input.value = item.value || '';
      input.setAttribute('aria-label', String(item.message));
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          finish(input.value);
        }
      });
    }

    actions.append(cancel, confirm);
    dialog.append(message);
    if (input) dialog.append(input);
    dialog.append(actions);
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);
    activeDialog = backdrop;

    function finish(result) {
      if (settled) return;
      settled = true;
      document.removeEventListener('keydown', onKeyDown);
      backdrop.classList.remove('is-visible');
      window.setTimeout(function () {
        backdrop.remove();
        if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
        activeDialog = null;
        item.resolve(result);
        renderNextDialog();
      }, 200);
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        finish(item.kind === 'prompt' ? null : false);
      }
    }

    cancel.addEventListener('click', function () {
      finish(item.kind === 'prompt' ? null : false);
    });
    confirm.addEventListener('click', function () {
      finish(item.kind === 'prompt' ? input.value : true);
    });
    backdrop.addEventListener('click', function (event) {
      if (event.target === backdrop) finish(item.kind === 'prompt' ? null : false);
    });
    document.addEventListener('keydown', onKeyDown);
    requestAnimationFrame(function () {
      backdrop.classList.add('is-visible');
      (input || confirm).focus();
    });
  }

  window.showToastNotification = showToastNotification;
  window.showConfirmModal = function (message) {
    return enqueueDialog('confirm', message);
  };
  window.showPromptModal = function (message, value) {
    return enqueueDialog('prompt', message, value);
  };
})();
