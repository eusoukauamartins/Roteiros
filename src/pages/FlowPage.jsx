import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FileText, Image, Music, Link } from 'lucide-react';
import useVideoStore, { FLOW_COLUMNS } from '../stores/useVideoStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_COLORS = {
  'creating': '#F97316',
  'ready-to-record': '#3B82F6',
  'recorded': '#8B5CF6',
  'editing': '#EC4899',
  'posted': '#10B981',
};

/* ===== CARD CONTENT (shared between sortable + overlay) ===== */
function CardContent({ card }) {
  const hasScript = card.script && card.script.length > 0;
  const hasImages = card.images && card.images.length > 0;
  const hasMusic = Array.isArray(card.music) ? card.music.length > 0 : card.music?.name;
  const hasLink = card.externalLink || card.recordedFilesLink || card.productionLinks?.length > 0;

  return (
    <>
      <p className="text-sm font-medium mb-1 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
        {card.headline || 'Sem headline'}
      </p>
      {card.niche && (
        <span className="badge mb-2">{card.niche}</span>
      )}
      <div className="flex items-center gap-2 mt-2">
        {hasScript && <FileText size={12} style={{ color: 'var(--accent-light)' }} />}
        {hasImages && <Image size={12} style={{ color: '#EC4899' }} />}
        {hasMusic && <Music size={12} style={{ color: '#10B981' }} />}
        {hasLink && <Link size={12} style={{ color: '#F59E0B' }} />}
        <span className="ml-auto text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {format(new Date(card.createdAt), 'dd/MM', { locale: ptBR })}
        </span>
      </div>
    </>
  );
}

/* ===== SORTABLE CARD ===== */
function SortableCard({ card, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="kanban-card mb-2"
      onClick={() => onClick(card)}
    >
      <CardContent card={card} />
    </div>
  );
}

/* ===== DROPPABLE COLUMN ===== */
function DroppableColumn({ column, cards, onCardClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const color = STATUS_COLORS[column.id] || 'var(--accent)';

  return (
    <div className="kanban-column flex flex-col" style={{
      height: 'calc(100vh - 140px)',
      borderColor: isOver ? color : undefined,
      boxShadow: isOver ? `0 0 20px ${color}22` : undefined,
    }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2">
          <span className="text-base">{column.emoji}</span>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            {column.title}
          </span>
        </div>
        <span
          className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: `${color}18`, color }}
        >
          {cards.length}
        </span>
      </div>
      <div ref={setNodeRef} className="flex-1 overflow-y-auto p-3 space-y-0" style={{ minHeight: '80px' }}>
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <SortableCard key={card.id} card={card} onClick={onCardClick} />
          ))}
        </SortableContext>
        {cards.length === 0 && (
          <div className="text-center py-8 text-xs" style={{ color: 'var(--text-muted)' }}>
            Arraste cards aqui
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== FLOW PAGE ===== */
export default function FlowPage() {
  const { cards, moveCard, reorderCards } = useVideoStore();
  const activeCards = cards.filter(c => !c.archived);
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeCard = activeCards.find(c => c.id === active.id);
    if (!activeCard) return;

    // Dropped onto a column
    const targetColumn = FLOW_COLUMNS.find(col => col.id === over.id);
    if (targetColumn) {
      if (activeCard.status !== targetColumn.id) {
        moveCard(active.id, targetColumn.id);
      }
      return;
    }

    // Dropped onto another card
    const overCard = activeCards.find(c => c.id === over.id);
    if (!overCard) return;

    if (activeCard.status === overCard.status && active.id !== over.id) {
      reorderCards(active.id, over.id, overCard.status);
    } else if (activeCard.status !== overCard.status) {
      reorderCards(active.id, over.id, overCard.status);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleCardClick = (card) => {
    navigate('/videos');
  };

  const activeCard = activeId ? activeCards.find(c => c.id === activeId) : null;

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 flex-shrink-0">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Fluxo de Produção</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Visão geral do pipeline — arraste para reorganizar o status dos vídeos
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex-1 overflow-x-auto px-6 pb-6">
          <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
            {FLOW_COLUMNS.map((column) => {
              const columnCards = activeCards.filter(c => c.status === column.id);
              return (
                <DroppableColumn
                  key={column.id}
                  column={column}
                  cards={columnCards}
                  onCardClick={handleCardClick}
                />
              );
            })}
          </div>
        </div>

        {/* Drag overlay for smooth ghost card */}
        <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
          {activeCard ? (
            <div className="kanban-card" style={{ width: '260px', opacity: 0.9, boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }}>
              <CardContent card={activeCard} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
