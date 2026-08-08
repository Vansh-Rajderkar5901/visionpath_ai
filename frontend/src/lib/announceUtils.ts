/**
 * Utilities to build human-friendly spoken descriptions for interactive
 * (or otherwise meaningful) DOM elements. These are used by the global
 * screen-reader announcer so a user who cannot see the screen understands
 * exactly what each element is, its current state, and its purpose.
 */

/**
 * Determine the spoken role of an element based on its tag/role attributes.
 */
export function describeElementRole(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const role = el.getAttribute('role');

  if (role === 'switch') return 'switch';
  if (role === 'menuitem') return 'menu item';
  if (role === 'tab') return 'tab';
  if (role === 'dialog') return 'dialog';
  if (role === 'alert') return 'alert';
  if (role === 'navigation') return 'navigation region';
  if (role === 'button') return 'button';
  if (role === 'link') return 'link';

  switch (tag) {
    case 'button':
      return 'button';
    case 'a':
      return 'link';
    case 'input': {
      const type = el.getAttribute('type') || 'text';
      if (type === 'checkbox') return 'check box';
      if (type === 'radio') return 'radio button';
      if (type === 'range') return 'slider';
      if (type === 'file') return 'file upload button';
      if (type === 'submit') return 'submit button';
      return 'text field';
    }
    case 'select':
      return 'drop down list';
    case 'textarea':
      return 'text area';
    case 'label':
      return '';
    case 'nav':
      return 'navigation';
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
      return 'heading';
    default:
      // aria roles that map to a speech role
      if (role === 'menu') return 'menu';
      if (role === 'listbox') return 'list box';
      if (role === 'option') return 'option';
      if (role === 'tablist') return 'tab list';
      return '';
  }
}

/** Get the closest useful readable label for an element. */
export function getAccessibleName(el: Element): string {
  // aria-labelledby
  const labelledBy = el.getAttribute('aria-labelledby');
  if (labelledBy) {
    const label = document.getElementById(labelledBy);
    if (label?.textContent?.trim()) return label.textContent.trim();
  }
  // aria-label
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel?.trim()) return ariaLabel.trim();
  // title attribute
  const title = el.getAttribute('title');
  if (title?.trim()) return title.trim();
  // placeholder for inputs
  const placeholder = el.getAttribute('placeholder');
  if (placeholder?.trim()) return placeholder.trim();
  // associated <label> for inputs via htmlFor
  if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
    const id = el.id;
    if (id) {
      const labels = document.querySelectorAll(`label[for="${CSS.escape(id)}"]`);
      if (labels.length && labels[0].textContent?.trim()) return labels[0].textContent.trim();
    }
  }
  // Body text (buttons, links) or alt for images
  const text = el.textContent?.trim();
  if (text && text.length < 120) return text;
  const alt = el.getAttribute('alt');
  if (alt?.trim()) return alt.trim();

  return '';
}

/**
 * Build a full spoken description for an element, e.g.
 * "Button: Upload Map." or "Text field: Building name, required."
 */
export function buildAnnouncement(el: Element): string {
  const role = describeElementRole(el);
  const name = getAccessibleName(el);

  // Skip purely presentational elements with no name/role
  if (!role && !name) return '';
  if (role === 'heading' && !name) return '';

  const required = el.getAttribute('aria-required') === 'true' || el.hasAttribute('required');
  const disabled = el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true';
  const checked = el.getAttribute('aria-checked');
  const selected = el.getAttribute('aria-selected');
  const expanded = el.getAttribute('aria-expanded');
  const style = el.getAttribute('style');

  let text = '';
  if (role) {
    text = `${capitalizeFirst(role)}: ${name || 'Unlabeled control'}`;
  } else if (name) {
    text = name;
  }

  if (required) text += ', required';
  if (role === 'check box' && checked === 'true') text += ', checked';
  if (role === 'check box' && checked === 'false') text += ', not checked';
  if (role === 'switch' && checked === 'true') text += ', on';
  if (role === 'switch' && checked === 'false') text += ', off';
  if ((role === 'button') && disabled) text += ', disabled';
  if ((role === 'link' || role === 'button') && expanded === 'true') text += ', expanded';
  if ((role === 'link' || role === 'button') && expanded === 'false') text += ', collapsed';
  if (role === 'slider' && style) {
    // range inputs often don't expose value in a friendly way; skip styling
  }

  return text ? text + '.' : text;
}

/** Check if an element should be described aloud (interactive or meaningful). */
export function isAnnounceable(el: Element): boolean {
  const tag = el.tagName.toLowerCase();
  const role = el.getAttribute('role');
  if (role === 'presentation' || role === 'none') return false;
  if (tag === 'button' || tag === 'a' || tag === 'select' || tag === 'textarea') return true;
  if (tag === 'input') {
    const type = el.getAttribute('type') || 'text';
    // Don't announce hidden inputs
    return type !== 'hidden';
  }
  if (tag === 'nav') return true;
  if (el.getAttribute('tabindex') !== null) return true;
  return false;
}

/** Capitalize first letter of a string. */
export function capitalizeFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

