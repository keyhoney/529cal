import { highlightMatch, rankSearchResults } from './search-match';

export interface SearchComboboxOptions {
  input: HTMLInputElement;
  list: HTMLUListElement;
  hidden: HTMLInputElement;
  placeholder?: string;
  emptyText?: string;
  onChange?: (value: string) => void;
}

export class SearchCombobox {
  private items: string[] = [];
  private activeIndex = -1;
  private open = false;
  private enabled = true;

  constructor(private readonly opts: SearchComboboxOptions) {
    const { input, placeholder } = opts;
    if (placeholder) input.placeholder = placeholder;

    input.addEventListener('input', () => this.onInput());
    input.addEventListener('focus', () => this.openList());
    input.addEventListener('keydown', (e) => this.onKeyDown(e));
    input.addEventListener('blur', () => {
      window.setTimeout(() => this.closeList(), 120);
    });

    document.addEventListener('click', (e) => {
      const target = e.target as Node;
      if (!input.parentElement?.contains(target) && !this.opts.list.contains(target)) {
        this.closeList();
      }
    });

    window.addEventListener('scroll', () => this.repositionDropdown(), true);
    window.addEventListener('resize', () => this.repositionDropdown());
  }

  setItems(items: string[]) {
    this.items = items;
    if (!this.opts.hidden.value) this.renderList(this.opts.input.value);
  }

  getValue(): string {
    return this.opts.hidden.value;
  }

  setValue(value: string, label = value) {
    this.opts.hidden.value = value;
    this.opts.input.value = label;
  }

  clear() {
    this.opts.hidden.value = '';
    this.opts.input.value = '';
    this.closeList();
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    this.opts.input.disabled = !enabled;
    if (!enabled) {
      this.clear();
      this.closeList();
    }
  }

  private onInput() {
    const typed = this.opts.input.value;
    if (this.opts.hidden.value && typed !== this.labelFor(this.opts.hidden.value)) {
      this.opts.hidden.value = '';
    }
    this.openList();
    this.renderList(typed);
  }

  private labelFor(value: string): string {
    return value;
  }

  private openList() {
    if (!this.enabled || this.items.length === 0) return;
    this.open = true;
    this.opts.list.classList.remove('hidden');
    if (!this.opts.input.value.trim()) this.renderList('');
    this.repositionDropdown();
  }

  private closeList() {
    this.open = false;
    this.activeIndex = -1;
    this.opts.list.classList.add('hidden');
  }

  private repositionDropdown() {
    if (!this.open || this.opts.list.classList.contains('hidden')) return;

    const rect = this.opts.input.getBoundingClientRect();
    const list = this.opts.list;
    const gap = 6;
    const maxHeight = Math.min(448, window.innerHeight - rect.bottom - gap - 16);

    list.style.position = 'fixed';
    list.style.top = `${rect.bottom + gap}px`;
    list.style.left = `${rect.left}px`;
    list.style.width = `${rect.width}px`;
    list.style.maxHeight = `${Math.max(120, maxHeight)}px`;
    list.style.zIndex = '100';
  }

  private renderList(query: string) {
    const { list, emptyText = '검색 결과가 없습니다.' } = this.opts;
    const results = rankSearchResults(query, this.items);

    list.innerHTML = '';
    if (results.length === 0) {
      const li = document.createElement('li');
      li.className = 'search-option search-option--empty';
      li.textContent = emptyText;
      list.appendChild(li);
      this.activeIndex = -1;
      return;
    }

    results.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'search-option';
      li.setAttribute('role', 'option');
      li.dataset.value = item;
      li.innerHTML = highlightMatch(item, query);
      li.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.select(item);
      });
      li.addEventListener('mouseenter', () => {
        this.activeIndex = index;
        this.syncActive();
      });
      list.appendChild(li);
    });

    this.activeIndex = query.trim() ? 0 : -1;
    this.syncActive();
    this.repositionDropdown();
  }

  private select(value: string) {
    this.setValue(value, value);
    this.closeList();
    this.opts.onChange?.(value);
  }

  private onKeyDown(e: KeyboardEvent) {
    if (!this.open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') this.openList();
      return;
    }

    const options = [...this.opts.list.querySelectorAll<HTMLElement>('.search-option:not(.search-option--empty)')];
    if (options.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.activeIndex = Math.min(this.activeIndex + 1, options.length - 1);
      this.syncActive();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.activeIndex = Math.max(this.activeIndex - 1, 0);
      this.syncActive();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (this.activeIndex >= 0 && options[this.activeIndex]) {
        this.select(options[this.activeIndex].dataset.value!);
      }
    } else if (e.key === 'Escape') {
      this.closeList();
    }
  }

  private syncActive() {
    const options = this.opts.list.querySelectorAll<HTMLElement>('.search-option');
    options.forEach((el, i) => {
      el.classList.toggle('is-active', i === this.activeIndex);
    });
    const active = options[this.activeIndex];
    active?.scrollIntoView({ block: 'nearest' });
  }
}
