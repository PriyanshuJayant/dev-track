import { useState, useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, FolderOpen, CheckCircle, ClipboardList, MoreVertical, Pencil, Trash2, Copy, Sparkles, Target, Zap, CheckSquare, Download, Upload, GripVertical } from 'lucide-react';

const HomeView = ({ 
  categories, 
  onSelectCategory, 
  onCreateCategory, 
  onRenameCategory,
  onDeleteCategory,
  onDuplicateCategory,
  onReorderCategories,
  onExportData,
  onImportData
}) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isEditingSectionTitle, setIsEditingSectionTitle] = useState(false);
  const [sectionTitleValue, setSectionTitleValue] = useState('');

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex(cat => cat.id === active.id);
      const newIndex = categories.findIndex(cat => cat.id === over.id);
      const newOrder = arrayMove(categories, oldIndex, newIndex);
      onReorderCategories(newOrder);
    }
  };

  const handleContextMenu = (e, category) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      category
    });
  };

  const handleContextAction = (action) => {
    switch (action) {
      case 'rename':
        onRenameCategory?.(contextMenu.category.id);
        break;
      case 'delete':
        onDeleteCategory?.(contextMenu.category.id);
        break;
      case 'duplicate':
        onDuplicateCategory?.(contextMenu.category.id);
        break;
    }
    setContextMenu(null);
  };

  const handleBackdropClick = () => {
    setContextMenu(null);
  };

  const handleOpenCreateModal = () => {
    setNewListName('');
    setShowCreateModal(true);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (newListName.trim()) {
      onCreateCategory(newListName.trim());
      setShowCreateModal(false);
      setNewListName('');
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setNewListName('');
  };

  // Get section title from localStorage or use default
  const [sectionTitle, setSectionTitle] = useState(() => {
    return localStorage.getItem('dev-track-section-title') || 'Your Lists';
  });

  const handleSectionTitleClick = () => {
    setSectionTitleValue(sectionTitle);
    setIsEditingSectionTitle(true);
  };

  const handleSectionTitleSave = () => {
    const newTitle = sectionTitleValue.trim() || 'Your Lists';
    setSectionTitle(newTitle);
    localStorage.setItem('dev-track-section-title', newTitle);
    setIsEditingSectionTitle(false);
  };

  const handleSectionTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSectionTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditingSectionTitle(false);
    }
  };

  const getCategoryStats = (category) => {
    let totalTasks = 0;
    let completedTasks = 0;
    let completedLists = 0;

    category.lists?.forEach(list => {
      let listTotal = 0;
      let listCompleted = 0;

      const countTasks = (tasks) => {
        tasks?.forEach(task => {
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

    const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const isComplete = totalTasks > 0 && completedTasks === totalTasks;

    return { 
      totalLists: category.lists?.length || 0,
      completedLists,
      totalTasks, 
      completedTasks, 
      percent,
      isComplete
    };
  };

  const dashboardStats = useMemo(() => {
    let totalCategories = categories.length;
    let totalLists = 0;
    let completedLists = 0;
    let totalTasks = 0;
    let completedTasks = 0;

    categories.forEach(category => {
      category.lists?.forEach(list => {
        totalLists++;
        let listTotal = 0;
        let listCompleted = 0;

        const countTasks = (tasks) => {
          tasks?.forEach(task => {
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
    });

    const overallPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalCategories,
      totalLists,
      completedLists,
      totalTasks,
      completedTasks,
      overallPercent
    };
  }, [categories]);

  return (
    <div className="home-view">
      <div className="dashboard-header">
        <div className="dashboard-brand">
          <div className="dashboard-brand__logo">
            <CheckSquare size={32} />
          </div>
          <div className="dashboard-brand__text">
            <h1 className="dashboard-brand__title">DevTrack</h1>
            <p className="dashboard-brand__tagline">Your personal productivity hub</p>
          </div>
        </div>
        <div className="dashboard-header__actions">
          <button className="btn btn--ghost btn--sm" onClick={onExportData} title="Export all data">
            <Upload size={18} />
            Export
          </button>
          <button className="btn btn--ghost btn--sm" onClick={onImportData} title="Import data">
            <Download size={18} />
            Import
          </button>
          <button className="btn btn--primary" onClick={handleOpenCreateModal}>
            <Plus size={18} />
            New List
          </button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="dashboard-stats__main">
          <div className="dashboard-stats__progress-ring">
            <svg viewBox="0 0 100 100" className="progress-ring">
              <circle className="progress-ring__bg" cx="50" cy="50" r="42" fill="none" strokeWidth="8" />
              <circle 
                className="progress-ring__fill" 
                cx="50" cy="50" r="42" fill="none" strokeWidth="8"
                strokeDasharray={`${dashboardStats.overallPercent * 2.64} 264`} 
                strokeLinecap="round" 
                transform="rotate(-90 50 50)" 
                style={{ stroke: dashboardStats.overallPercent === 100 ? 'var(--success)' : 'var(--primary)' }}
              />
            </svg>
            <div className="dashboard-stats__progress-text">
              <span 
                className="dashboard-stats__progress-value"
                style={{ color: dashboardStats.overallPercent === 100 ? 'var(--success)' : undefined }}
              >
                {dashboardStats.overallPercent}%
              </span>
              <span className="dashboard-stats__progress-label">Complete</span>
            </div>
          </div>
          <div className="dashboard-stats__info">
            <h3 className="dashboard-stats__title"><Sparkles size={18} /> Overall Progress</h3>
            <p className="dashboard-stats__subtitle">{dashboardStats.completedTasks} of {dashboardStats.totalTasks} tasks completed</p>
          </div>
        </div>

        <div className="dashboard-stats__cards">
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--purple"><FolderOpen size={20} /></div>
            <div className="stat-card__content">
              <span className="stat-card__value">{dashboardStats.totalCategories}</span>
              <span className="stat-card__label">Categories</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--blue"><Target size={20} /></div>
            <div className="stat-card__content">
              <span className="stat-card__value">{dashboardStats.totalLists}</span>
              <span className="stat-card__label">Lists</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--green"><CheckCircle size={20} /></div>
            <div className="stat-card__content">
              <span className="stat-card__value">{dashboardStats.completedLists}</span>
              <span className="stat-card__label">Completed</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--orange"><Zap size={20} /></div>
            <div className="stat-card__content">
              <span className="stat-card__value">{dashboardStats.totalTasks - dashboardStats.completedTasks}</span>
              <span className="stat-card__label">Remaining</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section__header">
          {isEditingSectionTitle ? (
            <input
              type="text"
              className="dashboard-section__title-input"
              value={sectionTitleValue}
              onChange={(e) => setSectionTitleValue(e.target.value)}
              onBlur={handleSectionTitleSave}
              onKeyDown={handleSectionTitleKeyDown}
              autoFocus
              maxLength={30}
              size={Math.max(sectionTitleValue.length, 5)}
              style={{ width: `${Math.max(sectionTitleValue.length + 1, 6)}ch` }}
            />
          ) : (
            <h2 
              className="dashboard-section__title dashboard-section__title--editable"
              onClick={handleSectionTitleClick}
              title="Click to rename"
            >
              {sectionTitle}
              <Pencil size={14} className="dashboard-section__edit-icon" />
            </h2>
          )}
          <span className="dashboard-section__count">{categories.length}</span>
        </div>

        {categories.length === 0 ? (
          <div className="empty-state empty-state--compact">
            <div className="empty-state__icon" aria-hidden="true"><ClipboardList size={40} /></div>
            <h3 className="empty-state__title">No lists yet</h3>
            <p className="empty-state__text">Create your first list to start organizing your tasks.</p>
            <div className="empty-state__actions">
              <button onClick={handleOpenCreateModal} className="btn btn--primary">
                <Plus size={18} aria-hidden="true" /> Create Your First List
              </button>
              <button onClick={onImportData} className="btn btn--ghost">
                <Download size={18} aria-hidden="true" /> Import
              </button>
            </div>
          </div>
        ) : (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={categories.map(cat => cat.id)}
              strategy={rectSortingStrategy}
            >
              <div className="category-grid">
                {categories.map(category => {
                  const stats = getCategoryStats(category);
                  return (
                    <SortableCategoryCard
                      key={category.id}
                      category={category}
                      stats={stats}
                      onSelectCategory={onSelectCategory}
                      onContextMenu={(e) => handleContextMenu(e, category)}
                    />
                  );
                })}
                <button className="category-card category-card--add" onClick={handleOpenCreateModal} aria-label="Create new category">
                  <Plus size={32} /><span>New List</span>
                </button>
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <div className="modal__icon"><FolderOpen size={24} /></div>
              <h2 className="modal__title">Create New List</h2>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal__body">
                <label className="modal__label">What would you like to track?</label>
                <input type="text" className="modal__input" placeholder="e.g., Learning Roadmap, Groceries, Goals..."
                  value={newListName} onChange={(e) => setNewListName(e.target.value)} autoFocus maxLength={50} />
                <div className="modal__suggestions">
                  <span className="modal__suggestions-label">Quick picks:</span>
                  <div className="modal__suggestion-chips">
                    <button type="button" className="chip" onClick={() => setNewListName('Learning Roadmap')}>📚 Learning Roadmap</button>
                    <button type="button" className="chip" onClick={() => setNewListName('Project Tasks')}>💼 Project Tasks</button>
                    <button type="button" className="chip" onClick={() => setNewListName('Daily Habits')}>🎯 Daily Habits</button>
                    <button type="button" className="chip" onClick={() => setNewListName('Shopping List')}>🛒 Shopping List</button>
                  </div>
                </div>
              </div>
              <div className="modal__footer">
                <button type="button" className="btn btn--ghost" onClick={handleCloseModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {contextMenu && (
        <>
          <div className="context-menu-backdrop" onClick={handleBackdropClick} />
          <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
            <button className="context-menu__item" onClick={() => handleContextAction('rename')}><Pencil size={14} /> Rename</button>
            <button className="context-menu__item" onClick={() => handleContextAction('duplicate')}><Copy size={14} /> Duplicate</button>
            <div className="context-menu__divider" />
            <button className="context-menu__item context-menu__item--danger" onClick={() => handleContextAction('delete')}><Trash2 size={14} /> Delete</button>
          </div>
        </>
      )}
    </div>
  );
};

// Sortable category card component
const SortableCategoryCard = ({ category, stats, onSelectCategory, onContextMenu }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`category-card ${stats.isComplete ? 'category-card--complete' : ''} ${isDragging ? 'category-card--dragging' : ''}`}
      onContextMenu={onContextMenu}
    >
      <div 
        className="category-card__drag-handle" 
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={16} />
      </div>
      <div className="category-card__content" onClick={() => onSelectCategory(category.id)}>
        <div className="category-card__header">
          <div className="category-card__icon"><FolderOpen size={24} /></div>
          <button 
            className="category-card__menu"
            onClick={(e) => { e.stopPropagation(); onContextMenu(e); }}
            aria-label="Category options"
          >
            <MoreVertical size={18} />
          </button>
        </div>
        <h3 className="category-card__title">{category.name}</h3>
        <div className="category-card__stats">
          <span>{stats.totalLists} {stats.totalLists === 1 ? 'list' : 'lists'}</span>
          <span>•</span>
          <span>{stats.completedTasks}/{stats.totalTasks} tasks</span>
        </div>
        <div className="category-card__progress">
          <div 
            className="category-card__progress-bar"
            style={{ width: `${stats.percent}%`, background: stats.isComplete ? 'var(--success)' : 'var(--primary)' }} 
          />
        </div>
        <div className="category-card__percent">
          {stats.percent}%
          {stats.isComplete && <CheckCircle size={14} className="category-card__complete-icon" />}
        </div>
      </div>
    </div>
  );
};

export default HomeView;
