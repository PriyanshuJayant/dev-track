import { useMemo, useState, useEffect, useRef } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, CheckSquare, FolderKanban, ChevronRight, Sparkles, LayoutGrid, List, Pencil, Trash2, Copy, Home, Download, Upload, GripVertical } from 'lucide-react';
import { getTechIconFromTitle } from '../utils/techIcons';

const Sidebar = ({ 
  category,
  lists, 
  activeListId, 
  onGoHome,
  onSelectList, 
  onCreateList,
  onDeleteList,
  onRenameList,
  onDuplicateList,
  onReorderLists,
  onViewAllLists,
  onSetAllViewLayout,
  onExportData,
  onImportData,
  viewMode,
  allViewLayout
}) => {
  const [contextMenu, setContextMenu] = useState(null);
  const contextMenuRef = useRef(null);

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = lists.findIndex(list => list.id === active.id);
      const newIndex = lists.findIndex(list => list.id === over.id);
      const newOrder = arrayMove(lists, oldIndex, newIndex);
      onReorderLists(newOrder);
    }
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };
    
    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('contextmenu', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
    };
  }, [contextMenu]);

  // Calculate stats
  const stats = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    let completedLists = 0;

    lists.forEach(list => {
      let listTotal = 0;
      let listCompleted = 0;

      const countTasks = (tasks) => {
        tasks.forEach(task => {
          totalTasks++;
          listTotal++;
          if (task.completed) {
            completedTasks++;
            listCompleted++;
          }
          if (task.children) countTasks(task.children);
        });
      };

      countTasks(list.tasks || []);
      
      if (listTotal > 0 && listTotal === listCompleted) {
        completedLists++;
      }
    });

    return { totalTasks, completedTasks, completedLists };
  }, [lists]);

  const progressPercent = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  const handleContextMenu = (e, list) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      list
    });
  };

  const handleContextAction = (action) => {
    if (!contextMenu?.list) return;
    
    switch (action) {
      case 'rename':
        onRenameList?.(contextMenu.list.id);
        break;
      case 'delete':
        onDeleteList?.(contextMenu.list.id);
        break;
      case 'duplicate':
        onDuplicateList?.(contextMenu.list.id);
        break;
    }
    setContextMenu(null);
  };

  return (
    <aside className="sidebar" role="navigation" aria-label="List navigation">
      {/* Brand - Clickable to go Home */}
      <button className="sidebar__brand sidebar__brand--clickable" onClick={onGoHome}>
        <div className="sidebar__logo" aria-hidden="true">
          <Home size={20} />
        </div>
        <h1 className="sidebar__title">DevTrack</h1>
      </button>

      {/* Category Name */}
      <div className="sidebar__category-name">
        <FolderKanban size={16} />
        <span>{category?.name || 'Untitled'}</span>
      </div>

      {/* Stats Dashboard */}
      <div className="sidebar__stats">
        <div className="stats-card">
          <div className="stats-card__header">
            <Sparkles size={16} className="stats-card__icon" />
            <span>Progress</span>
          </div>
          <div className="stats-card__progress">
            <div 
              className="stats-card__progress-bar"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="stats-card__details">
            <span>{stats.completedTasks} / {stats.totalTasks} tasks</span>
            <span>{progressPercent}%</span>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-item__value">{lists.length}</span>
            <span className="stat-item__label">Items</span>
          </div>
          <div className="stat-item">
            <span className="stat-item__value stat-item__value--success">{stats.completedLists}</span>
            <span className="stat-item__label">Completed</span>
          </div>
        </div>
      </div>

      {/* List Section */}
      <div className="sidebar__section">
        <div className="sidebar__section-header">
          <span>{category?.name || 'Items'}</span>
          <div className="sidebar__section-actions">
            <button 
              onClick={() => { onViewAllLists?.(); onSetAllViewLayout?.('list'); }}
              className={`sidebar__view-btn ${viewMode === 'all-lists' && allViewLayout === 'list' ? 'sidebar__view-btn--active' : ''}`}
              aria-label="View all as list"
              title="List View"
            >
              <List size={14} />
            </button>
            <button 
              onClick={() => { onViewAllLists?.(); onSetAllViewLayout?.('grid'); }}
              className={`sidebar__view-btn ${viewMode === 'all-lists' && allViewLayout === 'grid' ? 'sidebar__view-btn--active' : ''}`}
              aria-label="View all as grid"
              title="Grid View"
            >
              <LayoutGrid size={14} />
            </button>
            <button 
              onClick={onCreateList}
              className="sidebar__add-btn"
              aria-label="Create new item"
              title="New Item"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <nav className="sidebar__nav" role="list">
          {lists.length === 0 ? (
            <p className="sidebar__empty">No items yet</p>
          ) : (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={lists.map(list => list.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="sidebar__nav-list">
                  {lists.map(list => (
                    <SortableListNavItem
                      key={list.id}
                      list={list}
                      isActive={viewMode === 'list' && list.id === activeListId}
                      onClick={() => onSelectList(list.id)}
                      onContextMenu={(e) => handleContextMenu(e, list)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </nav>
      </div>

      {/* Footer */}
      <div className="sidebar__footer">
        <div className="sidebar__footer-actions">
          <button 
            onClick={onExportData}
            className="btn btn--ghost btn--sm"
            title="Export backup"
            aria-label="Export data as JSON backup"
          >
            <Download size={16} />
            Export
          </button>
          <button 
            onClick={onImportData}
            className="btn btn--ghost btn--sm"
            title="Import backup"
            aria-label="Import data from JSON backup"
          >
            <Upload size={16} />
            Import
          </button>
        </div>
        <button 
          onClick={onCreateList}
          className="btn btn--primary sidebar__create-btn"
        >
          <Plus size={18} />
          New Item
        </button>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div 
          ref={contextMenuRef}
          className="context-menu"
          style={{ 
            top: contextMenu.y,
            left: contextMenu.x
          }}
        >
          <button 
            className="context-menu__item"
            onClick={() => handleContextAction('rename')}
          >
            <Pencil size={14} />
            Rename
          </button>
          <button 
            className="context-menu__item"
            onClick={() => handleContextAction('duplicate')}
          >
            <Copy size={14} />
            Duplicate
          </button>
          <div className="context-menu__divider" />
          <button 
            className="context-menu__item context-menu__item--danger"
            onClick={() => handleContextAction('delete')}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </aside>
  );
};

// Individual list nav item (sortable)
const SortableListNavItem = ({ list, isActive, onClick, onContextMenu }) => {
  const techIcon = useMemo(() => getTechIconFromTitle(list.title), [list.title]);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 1,
  };
  
  // Calculate progress for this list
  const progress = useMemo(() => {
    let total = 0;
    let completed = 0;
    
    const count = (tasks) => {
      tasks.forEach(task => {
        total++;
        if (task.completed) completed++;
        if (task.children) count(task.children);
      });
    };
    
    count(list.tasks || []);
    return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [list.tasks]);

  const isCompleted = progress.total > 0 && progress.percent === 100;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''} ${isCompleted ? 'sidebar__nav-item--completed' : ''} ${isDragging ? 'sidebar__nav-item--dragging' : ''}`}
      onContextMenu={onContextMenu}
    >
      <div 
        className="sidebar__nav-drag" 
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={12} />
      </div>
      <div 
        className="sidebar__nav-icon"
        style={techIcon && !isActive ? { background: `${techIcon.color}20` } : {}}
        onClick={onClick}
      >
        {techIcon ? (
          <img 
            src={techIcon.url} 
            alt=""
            width={18}
            height={18}
            onError={(e) => e.target.style.display = 'none'}
          />
        ) : (
          <FolderKanban size={18} />
        )}
      </div>
      <div className="sidebar__nav-content" onClick={onClick}>
        <span className="sidebar__nav-title">{list.title}</span>
        <div className="sidebar__nav-progress">
          <div 
            className="sidebar__nav-progress-bar"
            style={{ 
              width: `${progress.percent}%`,
              background: isCompleted ? 'var(--success)' : 'var(--primary)'
            }}
          />
        </div>
      </div>
      <ChevronRight size={14} className="sidebar__nav-arrow" onClick={onClick} />
    </div>
  );
};

export default Sidebar;
