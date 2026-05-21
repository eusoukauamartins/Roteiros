import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

/* ── helpers inlined (mirror Lyria logic) ── */
function toLocalISODate(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getToday() {
  return toLocalISODate(new Date());
}

function getWeekRef(date = new Date()) {
  const d = new Date(date);
  const firstJan = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d - firstJan) / 86400000);
  const weekNum = Math.ceil((days + firstJan.getDay() + 1) / 7);
  return `${d.getFullYear()}-S${String(weekNum).padStart(2, '0')}`;
}

export function getTaskPeriodKey(task, date = new Date()) {
  if (task.recurrence === 'diária') return toLocalISODate(date);
  if (task.recurrence === 'semanal') return getWeekRef(date);
  if (task.recurrence === 'mensal') return toLocalISODate(date).substring(0, 7);
  return '';
}

export function isTaskCompleted(task, date = new Date()) {
  if (task.recurrence === 'diária' || task.recurrence === 'semanal' || task.recurrence === 'mensal') {
    const periodKey = getTaskPeriodKey(task, date);
    return (task.completedDates || []).includes(periodKey);
  }
  return task.status === 'done';
}

export function isFutureTask(task) {
  if (task.recurrence === 'diária' || task.recurrence === 'semanal' || task.recurrence === 'mensal') return false;
  if (!task.scheduledDate && !task.dueDate) return false;
  const today = getToday();
  const d = task.scheduledDate || task.dueDate;
  return d > today;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function priorityValue(p) {
  const map = { high: 3, medium: 2, low: 1 };
  return map[p] || 0;
}

const useTaskStore = create(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (data) => {
        const task = {
          id: nanoid(),
          title: data.title || '',
          description: data.description || '',
          priority: data.priority || 'medium',
          status: data.status || 'pending',
          type: data.type || 'general',
          relatedCardId: data.relatedCardId || null,
          // Lyria fields
          dueDate: data.dueDate || '',
          scheduledDate: data.scheduledDate || '',
          category: data.category || '',
          recurrence: data.recurrence || 'única',
          recurrenceDay: data.recurrenceDay || '',
          estimatedHours: data.estimatedHours || '',
          completedDates: [],
          completedAt: null,
          deletedAt: null,
          order: data.order ?? get().tasks.length,
          createdAt: new Date().toISOString(),
        };
        set({ tasks: [...get().tasks, task] });
        return task;
      },

      updateTask: (id, updates) => {
        set({
          tasks: get().tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        });
      },

      updateBatch: (updates) => {
        // updates = [{ id, updates: { ... } }]
        const tasks = [...get().tasks];
        updates.forEach(({ id, updates: u }) => {
          const idx = tasks.findIndex(t => t.id === id);
          if (idx !== -1) tasks[idx] = { ...tasks[idx], ...u };
        });
        set({ tasks });
      },

      deleteTask: (id) => {
        set({ tasks: get().tasks.filter((t) => t.id !== id) });
      },

      softDeleteTask: (id) => {
        set({
          tasks: get().tasks.map(t =>
            t.id === id ? { ...t, status: 'deleted', deletedAt: new Date().toISOString() } : t
          ),
        });
      },

      restoreTask: (id) => {
        set({
          tasks: get().tasks.map(t =>
            t.id === id ? { ...t, status: 'pending', completedAt: null, deletedAt: null, completedDates: [] } : t
          ),
        });
      },

      toggleStatus: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;

        // Recurring tasks use completedDates
        if (task.recurrence === 'diária' || task.recurrence === 'semanal' || task.recurrence === 'mensal') {
          const periodKey = getTaskPeriodKey(task);
          const history = task.completedDates || [];
          if (history.includes(periodKey)) {
            get().updateTask(id, { completedDates: history.filter(k => k !== periodKey) });
          } else {
            get().updateTask(id, { completedDates: [...history, periodKey] });
          }
          return;
        }

        // Non-recurring: cycle through statuses
        if (task.status === 'done') {
          get().updateTask(id, { status: 'pending', completedAt: null });
        } else {
          get().updateTask(id, { status: 'done', completedAt: new Date().toISOString() });
        }
      },

      importTasks: (newTasks) => {
        set({ tasks: newTasks });
      },
    }),
    { name: 'otimizador-tasks' }
  )
);

export default useTaskStore;
