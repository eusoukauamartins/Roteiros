import { useState, useMemo, useEffect } from 'react';
import {
  Plus, Search, Trash2, X, Edit3, Check, Clock, AlertTriangle, Flag,
  Repeat, CalendarClock, RotateCcw, GripVertical, Archive, CheckSquare
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import useTaskStore, {
  isTaskCompleted, isFutureTask, getTaskPeriodKey, formatDate, priorityValue
} from '../stores/useTaskStore';
import useVideoStore from '../stores/useVideoStore';

/* ── constants ── */
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const WEEKDAY_LABELS = {
  0: 'Domingo', 1: 'Segunda-feira', 2: 'Terça-feira', 3: 'Quarta-feira',
  4: 'Quinta-feira', 5: 'Sexta-feira', 6: 'Sábado',
};

const priorityConfig = {
  low:    { label: 'Baixa',  color: '#10B981' },
  medium: { label: 'Média',  color: '#F59E0B' },
  high:   { label: 'Alta',   color: '#EF4444' },
};
const statusConfig = {
  pending:       { label: 'Pendente',      color: '#F59E0B' },
  'in-progress': { label: 'Em andamento',  color: '#3B82F6' },
  done:          { label: 'Concluída',     color: '#10B981' },
  deleted:       { label: 'Excluída',      color: '#EF4444' },
};

const categories = ['Marketing', 'Conteúdo', 'Produto', 'Operações', 'Estratégia', 'Pessoal', 'Outro'];

const defaultForm = {
  title: '', description: '', priority: 'medium', status: 'pending',
  type: 'general', relatedCardId: '',
  dueDate: '', scheduledDate: '', category: '',
  recurrence: 'única', recurrenceDay: '', estimatedHours: '',
};

/* ──────────────────────────────────────────────
   TaskCard  (reusable row)
   ────────────────────────────────────────────── */
function TaskCard({ task, onToggle, onEdit, onDelete, isArchive, dragHandlers }) {
  const completed = isTaskCompleted(task);
  const pc = priorityConfig[task.priority] || priorityConfig.medium;

  return (
    <div
      className={`glass-card p-3 flex items-center gap-3 group transition-all ${completed ? 'opacity-50' : ''}`}
      {...(dragHandlers || {})}
    >
      {/* Drag handle */}
      {!isArchive && (
        <div style={{ cursor: 'grab', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <GripVertical size={14} />
        </div>
      )}

      {/* Checkbox */}
      <button
        onClick={() => onToggle(task)}
        className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all"
        style={{
          background: completed ? pc.color : 'transparent',
          border: completed ? 'none' : `2px solid ${pc.color}`,
        }}
      >
        {completed && <Check size={12} className="text-white" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-sm font-medium ${completed || task.status === 'deleted' ? 'line-through' : ''}`}
            style={{ color: completed || task.status === 'deleted' ? 'var(--text-muted)' : 'var(--text-primary)' }}
          >
            {task.title}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{ background: `${pc.color}20`, color: pc.color }}>{pc.label}</span>
          {task.category && (
            <span className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>{task.category}</span>
          )}
        </div>
        <div className="flex gap-2 mt-0.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {task.dueDate && <span>Prazo: {formatDate(task.dueDate)}</span>}
          {task.scheduledDate && <span>Agendada: {formatDate(task.scheduledDate)}</span>}
          {task.estimatedHours && <span>{task.estimatedHours}h</span>}
          {task.type === 'content' && (
            <span style={{ color: 'var(--accent-light)' }}>Conteúdo</span>
          )}
          {task.recurrence === 'semanal' && <span style={{ color: 'var(--accent-light)' }}>Semanal</span>}
          {task.recurrence === 'mensal' && <span style={{ color: 'var(--accent-light)' }}>Mensal</span>}
          {task.recurrence === 'diária' && <span style={{ color: 'var(--accent-light)' }}>Diária</span>}
          {task.status === 'deleted' && <span style={{ color: '#EF4444' }}>Excluída</span>}
        </div>
      </div>

      {/* Actions */}
      {isArchive ? (
        <div className="flex gap-1 flex-shrink-0">
          <button className="p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors" onClick={() => onEdit(task)} title="Restaurar">
            <RotateCcw size={13} style={{ color: '#10B981' }} />
          </button>
          <button className="p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors" onClick={() => onDelete(task.id)} title="Excluir permanentemente">
            <Trash2 size={13} style={{ color: '#EF4444' }} />
          </button>
        </div>
      ) : (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button className="p-1.5 rounded hover:bg-[var(--surface-hover)]" onClick={() => onEdit(task)}>
            <Edit3 size={13} style={{ color: 'var(--text-muted)' }} />
          </button>
          <button className="p-1.5 rounded hover:bg-[var(--surface-hover)]" onClick={() => onDelete(task)}>
            <Trash2 size={13} style={{ color: '#EF4444' }} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   TaskColumn  (for Pendentes / Agendadas)
   ────────────────────────────────────────────── */
function TaskColumn({ title, icon: Icon, tasks, modifier, onToggle, onEdit, onDelete, droppableId }) {
  return (
    <div className={`rounded-xl overflow-hidden flex flex-col ${modifier || ''}`}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-color)',
        minHeight: '200px',
        ...(modifier === 'task-column--scheduled' ? { opacity: 0.75, borderStyle: 'dashed' } : {}),
      }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <h3 className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2"
          style={{ color: 'var(--text-primary)' }}>
          <Icon size={15} /> {title}
        </h3>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)' }}>
          {tasks.length}
        </span>
      </div>
      <Droppable droppableId={droppableId}>
        {(provided) => (
          <div
            className="flex-1 overflow-y-auto p-3 space-y-2"
            style={{ maxHeight: '65vh' }}
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {tasks.length === 0 ? (
              <p className="text-center py-8 text-xs" style={{ color: 'var(--text-muted)' }}>Nenhuma tarefa</p>
            ) : (
              tasks.map((t, index) => (
                <Draggable key={t.id} draggableId={t.id} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} style={{...provided.draggableProps.style}}>
                      <TaskCard task={t} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} dragHandlers={provided.dragHandleProps} />
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

/* ──────────────────────────────────────────────
   RoutineColumn  (Rotina do Dia — daily + weekly)
   ────────────────────────────────────────────── */
function RoutineColumn({ dailyTasks, weeklyByDay, todayWeekday, onToggle, onEdit, onDelete }) {
  const totalCount = dailyTasks.length + Object.values(weeklyByDay).reduce((s, arr) => s + arr.length, 0);
  const orderedDays = WEEKDAY_ORDER.filter(d => weeklyByDay[d]?.length > 0);
  const todayDays = orderedDays.filter(d => d === todayWeekday);
  const otherDays = orderedDays.filter(d => d !== todayWeekday);
  const sortedDays = [...todayDays, ...otherDays];

  const renderCards = (tasks, droppableId) => (
    <Droppable droppableId={droppableId}>
      {(provided) => (
        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
          {tasks.map((task, index) => (
            <Draggable key={task.id} draggableId={task.id} index={index}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.draggableProps} style={{...provided.draggableProps.style}}>
                  <TaskCard task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} dragHandlers={provided.dragHandleProps} />
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );

  return (
    <div className="rounded-xl overflow-hidden flex flex-col"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--accent-light, var(--border-color))',
        boxShadow: '0 0 16px rgba(var(--accent-rgb, 139,92,246), 0.08)',
        minHeight: '200px',
      }}>
      <div className="flex items-center justify-between px-4 py-3 border-b"
        style={{
          borderColor: 'var(--border-color)',
          background: 'linear-gradient(135deg, rgba(var(--accent-rgb, 139,92,246), 0.08), transparent)',
        }}>
        <h3 className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2"
          style={{ color: 'var(--accent-light, var(--text-primary))' }}>
          <Repeat size={15} /> Rotina do Dia
        </h3>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)' }}>
          {totalCount}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ maxHeight: '65vh' }}>
        {totalCount === 0 ? (
          <p className="text-center py-8 text-xs" style={{ color: 'var(--text-muted)' }}>Nenhuma tarefa de rotina</p>
        ) : (
          <>
            {dailyTasks.length > 0 && (
              <>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1 mt-2"
                  style={{ color: 'var(--accent-light)' }}>Diárias</div>
                {renderCards(dailyTasks, 'dailyTasks')}
              </>
            )}
            {sortedDays.map(day => (
              <div key={day}>
                {(dailyTasks.length > 0 || sortedDays.indexOf(day) > 0) && (
                  <div className="my-2" style={{ height: 1, background: 'var(--border-color)', opacity: 0.5 }} />
                )}
                <div className="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-2"
                  style={{ color: day === todayWeekday ? 'var(--accent-light)' : 'var(--text-muted)' }}>
                  {WEEKDAY_LABELS[day]}
                  {day === todayWeekday && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold text-white"
                      style={{ background: 'var(--accent-light)' }}>HOJE</span>
                  )}
                </div>
                {renderCards(weeklyByDay[day], `weekly-${day}`)}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════ */
export default function TasksPage() {
  const { tasks, addTask, updateTask, updateBatch, softDeleteTask, restoreTask, deleteTask, toggleStatus } = useTaskStore();
  const cards = useVideoStore(s => s.cards);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [originalSnapshot, setOriginalSnapshot] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('manual');
  const [activeTab, setActiveTab] = useState('ativas');
  const [fastAdd, setFastAdd] = useState('');

  const hasChanges = JSON.stringify(form) !== JSON.stringify(originalSnapshot);

  /* ── active tasks (non-completed, non-deleted) ── */
  const activeTasks = useMemo(() => {
    let result = tasks.filter(t => t.status !== 'deleted' && !isTaskCompleted(t));
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) || (t.category || '').toLowerCase().includes(q)
      );
    }
    if (filterPriority) result = result.filter(t => t.priority === filterPriority);
    if (filterStatus) result = result.filter(t => t.status === filterStatus);
    result.sort((a, b) => {
      if (sortBy === 'manual') return (a.order || 0) - (b.order || 0);
      if (sortBy === 'priority') return priorityValue(b.priority) - priorityValue(a.priority);
      if (sortBy === 'date') return (a.dueDate || '9999') > (b.dueDate || '9999') ? 1 : -1;
      return 0;
    });
    return result;
  }, [tasks, search, filterPriority, filterStatus, sortBy]);

  /* ── split active tasks into 3 columns ── */
  const dailyTasks = useMemo(() => activeTasks.filter(t => t.recurrence === 'diária'), [activeTasks]);
  const weeklyTasks = useMemo(() => activeTasks.filter(t => t.recurrence === 'semanal'), [activeTasks]);
  const scheduledTasks = useMemo(() => activeTasks.filter(t =>
    t.recurrence !== 'diária' && t.recurrence !== 'semanal' && isFutureTask(t)
  ), [activeTasks]);
  const pendingTasks = useMemo(() => activeTasks.filter(t =>
    t.recurrence !== 'diária' && t.recurrence !== 'semanal' && !isFutureTask(t)
  ), [activeTasks]);

  const todayWeekday = new Date().getDay();
  const weeklyByDay = useMemo(() => {
    const groups = {};
    weeklyTasks.forEach(t => {
      const day = t.recurrenceDay !== undefined && t.recurrenceDay !== '' ? Number(t.recurrenceDay) : todayWeekday;
      if (!groups[day]) groups[day] = [];
      groups[day].push(t);
    });
    return groups;
  }, [weeklyTasks, todayWeekday]);

  /* ── archive ── */
  const archivedTasks = useMemo(() => {
    let result = tasks.filter(t => t.status === 'deleted' || isTaskCompleted(t));
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q) || (t.category || '').toLowerCase().includes(q));
    }
    if (filterPriority) result = result.filter(t => t.priority === filterPriority);
    return result;
  }, [tasks, search, filterPriority]);

  /* ── handlers ── */
  const openCreate = () => {
    setForm({ ...defaultForm });
    setOriginalSnapshot({ ...defaultForm });
    setEditing(null);
    setShowForm(true);
  };
  const openEdit = (t) => {
    const d = {
      title: t.title, description: t.description || '', priority: t.priority,
      status: t.status, type: t.type || 'general', relatedCardId: t.relatedCardId || '',
      dueDate: t.dueDate || '', scheduledDate: t.scheduledDate || '',
      category: t.category || '', recurrence: t.recurrence || 'única',
      recurrenceDay: t.recurrenceDay || '', estimatedHours: t.estimatedHours || '',
    };
    setForm(d);
    setOriginalSnapshot(d);
    setEditing(t.id);
    setShowForm(true);
  };
  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editing) {
      updateTask(editing, form);
    } else {
      addTask(form);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleCloseWithSave = () => {
    if (!editing && !hasChanges) {
      setShowForm(false);
      return;
    }
    handleSave();
  };

  const handleCancelClick = () => {
    if (hasChanges) {
      setShowCancelConfirm(true);
    } else {
      setShowForm(false);
    }
  };

  const handleDiscardChanges = () => {
    setShowCancelConfirm(false);
    setShowForm(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showForm && !showCancelConfirm) {
        handleCloseWithSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showForm, showCancelConfirm, form, hasChanges, editing]);

  const handleFastAdd = (e) => {
    if (e.key === 'Enter' && fastAdd.trim()) {
      addTask({ ...defaultForm, title: fastAdd.trim() });
      setFastAdd('');
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    const sourceId = source.droppableId;
    const destId = destination.droppableId;

    const getList = (id) => {
      if (id === 'pendingTasks') return [...pendingTasks];
      if (id === 'scheduledTasks') return [...scheduledTasks];
      if (id === 'dailyTasks') return [...dailyTasks];
      if (id.startsWith('weekly-')) return [...weeklyByDay[id.split('-')[1]]];
      return [];
    };

    let sourceList = getList(sourceId);
    let destList = sourceId === destId ? sourceList : getList(destId);

    if (sourceList.length === 0) return;

    const [dragged] = sourceList.splice(source.index, 1);

    // Apply logic for moving across columns
    const updates = { id: dragged.id, updates: {} };

    if (sourceId !== destId) {
      if (destId === 'scheduledTasks') {
        // Defaults to tomorrow if moved to scheduled
        import('../utils/dateUtils').then(({ getTomorrowSP }) => {
          const tomorrow = getTomorrowSP();
          useTaskStore.getState().updateTask(dragged.id, { recurrence: 'única', scheduledDate: tomorrow, dueDate: '' });
        });
      } else if (destId === 'pendingTasks') {
        updates.updates = { recurrence: 'única', scheduledDate: '', dueDate: '' };
      } else if (destId === 'dailyTasks') {
        updates.updates = { recurrence: 'diária' };
      } else if (destId.startsWith('weekly-')) {
        updates.updates = { recurrence: 'semanal', recurrenceDay: destId.split('-')[1] };
      }
    }

    if (Object.keys(updates.updates).length > 0) {
      useTaskStore.getState().updateBatch([updates]);
    }

    destList.splice(destination.index, 0, dragged);

    if (sourceId === destId) {
      const orderUpdates = destList.map((t, i) => ({ id: t.id, order: i }));
      useTaskStore.getState().reorderTasks(orderUpdates);
    } else {
      // Reorder both
      const sourceOrderUpdates = sourceList.map((t, i) => ({ id: t.id, order: i }));
      const destOrderUpdates = destList.map((t, i) => ({ id: t.id, order: i }));
      useTaskStore.getState().reorderTasks([...sourceOrderUpdates, ...destOrderUpdates]);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold gradient-text">Tarefas</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {tasks.filter(t => !isTaskCompleted(t) && t.status !== 'deleted').length} pendentes
            {' · '}
            {tasks.filter(t => isTaskCompleted(t)).length} concluídas
          </p>
        </div>
        <button className="btn-accent flex items-center gap-2" onClick={openCreate}>
          <Plus size={16} /> Nova Tarefa
        </button>
      </div>

      {/* TABS */}
      <div className="px-6 flex gap-1 mb-4">
        <button
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2`}
          style={activeTab === 'ativas'
            ? { background: 'var(--accent-surface, rgba(139,92,246,0.12))', color: 'var(--accent-light)', border: '1px solid var(--accent, #8B5CF6)' }
            : { color: 'var(--text-muted)', background: 'transparent', border: '1px solid var(--border-color)' }}
          onClick={() => { setActiveTab('ativas'); setFilterStatus(''); }}>
          <CheckSquare size={14} /> Ativas
        </button>
        <button
          className="px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2"
          style={activeTab === 'arquivo'
            ? { background: 'var(--accent-surface, rgba(139,92,246,0.12))', color: 'var(--accent-light)', border: '1px solid var(--accent, #8B5CF6)' }
            : { color: 'var(--text-muted)', background: 'transparent', border: '1px solid var(--border-color)' }}
          onClick={() => { setActiveTab('arquivo'); setFilterStatus(''); }}>
          <Archive size={14} /> Histórico
        </button>
      </div>

      {/* FAST ADD */}
      {activeTab === 'ativas' && (
        <div className="px-6 mb-4">
          <div className="relative">
            <Plus size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              className="input-field pl-9 h-9 text-sm"
              placeholder="Adicionar tarefa rapidamente... (Enter para criar)"
              value={fastAdd}
              onChange={e => setFastAdd(e.target.value)}
              onKeyDown={handleFastAdd}
            />
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div className="px-6 pb-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input-field pl-9 h-9 text-sm" placeholder="Buscar tarefa..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field h-9 text-sm w-36" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="">Prioridade</option>
          {Object.entries(priorityConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        {activeTab === 'ativas' && (
          <select className="input-field h-9 text-sm w-36" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="manual">Ordem Manual</option>
            <option value="priority">Prioridade</option>
            <option value="date">Data</option>
          </select>
        )}
      </div>

      {/* ═══ ACTIVE: 3-Column Layout ═══ */}
      {activeTab === 'ativas' && (
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {activeTasks.length === 0 ? (
            <div className="text-center py-16">
              <CheckSquare size={40} style={{ color: 'var(--text-muted)', opacity: 0.25 }} className="mx-auto mb-3" />
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Nenhuma tarefa encontrada</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>Crie sua primeira tarefa para começar a organizar seu dia.</p>
              <button className="btn-accent mt-4 text-sm" onClick={openCreate}><Plus size={14} /> Nova Tarefa</button>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(3, 1fr)', alignItems: 'start' }}>
                <RoutineColumn
                  dailyTasks={dailyTasks}
                  weeklyByDay={weeklyByDay}
                  todayWeekday={todayWeekday}
                  onToggle={t => toggleStatus(t.id)}
                  onEdit={openEdit}
                  onDelete={t => softDeleteTask(t.id)}
                />
                <TaskColumn
                  title="Pendentes"
                  icon={Clock}
                  tasks={pendingTasks}
                  droppableId="pendingTasks"
                  onToggle={t => toggleStatus(t.id)}
                  onEdit={openEdit}
                  onDelete={t => softDeleteTask(t.id)}
                />
                <TaskColumn
                  title="Tarefas Agendadas"
                  icon={CalendarClock}
                  tasks={scheduledTasks}
                  modifier="task-column--scheduled"
                  droppableId="scheduledTasks"
                  onToggle={t => toggleStatus(t.id)}
                  onEdit={openEdit}
                  onDelete={t => softDeleteTask(t.id)}
                />
              </div>
            </DragDropContext>
          )}
        </div>
      )}

      {/* ═══ ARCHIVE ═══ */}
      {activeTab === 'arquivo' && (
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {archivedTasks.length === 0 ? (
            <div className="text-center py-16">
              <Archive size={40} style={{ color: 'var(--text-muted)', opacity: 0.25 }} className="mx-auto mb-3" />
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Nenhum registro encontrado</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>Tarefas concluídas e excluídas aparecerão aqui.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {archivedTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={t => toggleStatus(t.id)}
                  onEdit={t => restoreTask(t.id)}
                  onDelete={id => deleteTask(typeof id === 'string' ? id : id)}
                  isArchive
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ MODAL ═══ */}
      {showForm && (
        <div className="overlay animate-fade-in" onClick={handleCancelClick}>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-2xl p-6 z-50 animate-scale-in glass-strong"
            style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()}>
            
            {showCancelConfirm && (
              <div className="absolute inset-0 z-10 glass-strong rounded-2xl flex items-center justify-center p-6 animate-fade-in">
                <div className="text-center w-full">
                  <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Cancelar edições?</h3>
                  <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
                    Tem certeza que deseja cancelar as alterações não salvas?
                  </p>
                  <div className="flex gap-3">
                    <button className="btn-ghost flex-1 text-sm py-2" onClick={() => setShowCancelConfirm(false)}>
                      Continuar editando
                    </button>
                    <button className="flex-1 text-sm py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                        style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
                        onClick={handleDiscardChanges}>
                      Descartar alterações
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{editing ? 'Editar' : 'Nova'} Tarefa</h2>
              <button onClick={handleCancelClick} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <div className="space-y-4">
              {/* Título */}
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Título</label>
                <input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Nome da tarefa" autoFocus />
              </div>
              {/* Descrição */}
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Descrição</label>
                <textarea className="textarea-field" style={{ minHeight: '60px' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detalhes..." />
              </div>
              {/* Prioridade + Frequência */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Prioridade</label>
                  <select className="input-field" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Frequência</label>
                  <select className="input-field" value={form.recurrence} onChange={e => setForm({ ...form, recurrence: e.target.value })}>
                    <option value="única">Única</option><option value="diária">Diária</option><option value="semanal">Semanal</option><option value="mensal">Mensal</option>
                  </select>
                </div>
              </div>
              {/* Dia da semana / dia do mês (conditional) */}
              {form.recurrence === 'semanal' && (
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Dia da Semana</label>
                  <select className="input-field" value={form.recurrenceDay} onChange={e => setForm({ ...form, recurrenceDay: e.target.value })}>
                    <option value="">Qualquer dia</option>
                    <option value="1">Segunda-feira</option><option value="2">Terça-feira</option><option value="3">Quarta-feira</option>
                    <option value="4">Quinta-feira</option><option value="5">Sexta-feira</option><option value="6">Sábado</option><option value="0">Domingo</option>
                  </select>
                </div>
              )}
              {form.recurrence === 'mensal' && (
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Dia do Mês</label>
                  <input type="number" min="1" max="31" className="input-field" placeholder="Ex: 15"
                    value={form.recurrenceDay} onChange={e => setForm({ ...form, recurrenceDay: e.target.value })} />
                </div>
              )}
              {/* Datas + Horas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Data Limite</label>
                  <input type="date" className="input-field" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Data Agendada</label>
                  <input type="date" className="input-field" value={form.scheduledDate} onChange={e => setForm({ ...form, scheduledDate: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Horas Estimadas</label>
                  <input className="input-field" type="number" step="0.5" min="0" placeholder="Ex: 2"
                    value={form.estimatedHours} onChange={e => setForm({ ...form, estimatedHours: parseFloat(e.target.value) || '' })} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Categoria</label>
                  <input className="input-field" list="task-categories" placeholder="Ex: Marketing"
                    value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                  <datalist id="task-categories">
                    {categories.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>
              {/* Tipo + Conteúdo relacionado (Roteiros-specific) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Tipo</label>
                  <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="general">Geral</option><option value="content">Conteúdo pessoal</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Conteúdo relacionado</label>
                  <select className="input-field" value={form.relatedCardId} onChange={e => setForm({ ...form, relatedCardId: e.target.value })}>
                    <option value="">Nenhum</option>
                    {cards.map(c => <option key={c.id} value={c.id}>{c.headline || 'Sem headline'}</option>)}
                  </select>
                </div>
              </div>
              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button className="btn-ghost flex-1" onClick={handleCancelClick}>Cancelar</button>
                <button className="btn-accent flex-1" onClick={handleSave}>{editing ? 'Salvar' : 'Criar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
