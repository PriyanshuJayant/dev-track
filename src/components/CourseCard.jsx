import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import TaskNode from './TaskNode';
import { Plus, Trash2, FolderKanban, ChevronDown, ChevronRight } from 'lucide-react';
import { getTechIconFromTitle } from '../utils/techIcons';

const CourseCard = ({ 
  course, 
  onUpdate, 
  onDelete, 
  defaultExpanded = true, 
  compact = false, 
  isExpandedExternal,
  onExpandChange 
}) => {
  // Use external control if provided, otherwise use internal state
  const [isExpandedInternal, setIsExpandedInternal] = useState(defaultExpanded);
  const isControlled = isExpandedExternal !== undefined;
  const isExpanded = isControlled ? isExpandedExternal : isExpandedInternal;
  
  const cardRef = useRef(null);
  const bodyRef = useRef(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [iconError, setIconError] = useState(false);
  const titleInputRef = useRef(null);

  const handleToggleExpand = useCallback(() => {
    if (isControlled) {
      onExpandChange?.(!isExpanded);
    } else {
      setIsExpandedInternal(!isExpanded);
    }
  }, [isControlled, isExpanded, onExpandChange]);

  // Calculate Progress Recursively
  const calculateProgress = useCallback((tasks) => {
    if (!tasks || tasks.length === 0) return { total: 0, completed: 0, percent: 0 };
    
    let total = 0;
    let completed = 0;

    const traverse = (node) => {
      total++;
      if (node.completed) completed++;
      if (node.children) node.children.forEach(traverse);
    };

    tasks.forEach(traverse);
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, percent };
  }, []);

  const progress = useMemo(() => calculateProgress(course.tasks), [course.tasks, calculateProgress]);
  
  // Check if roadmap is fully completed
  const isCompleted = progress.total > 0 && progress.percent === 100;
  
  // Get tech icon based on title
  const techIcon = useMemo(() => getTechIconFromTitle(course.title), [course.title]);

  const handleAddTask = () => {
    const newTask = {
      id: Date.now().toString(),
      text: 'New Task',
      completed: false,
      children: []
    };
    onUpdate({ ...course, tasks: [...(course.tasks || []), newTask] });
  };

  const handleTaskUpdate = useCallback((taskId, updatedTask) => {
    const updatedTasks = course.tasks.map(t => 
      t.id === taskId ? updatedTask : t
    );
    onUpdate({ ...course, tasks: updatedTasks });
  }, [course, onUpdate]);

  const handleTaskDelete = useCallback((taskId) => {
    const updatedTasks = course.tasks.filter(t => t.id !== taskId);
    onUpdate({ ...course, tasks: updatedTasks });
  }, [course, onUpdate]);

  const handleTitleChange = (e) => {
    onUpdate({ ...course, title: e.target.value });
    setIconError(false); // Reset icon error when title changes
  };

  const handleTitleKeyDown = (e) => {
    // Stop propagation to prevent header from capturing space/enter keys
    e.stopPropagation();
    
    if (e.key === 'Enter') {
      e.preventDefault();
      titleInputRef.current?.blur();
      setIsEditingTitle(false);
    }
    if (e.key === 'Escape') {
      titleInputRef.current?.blur();
      setIsEditingTitle(false);
    }
  };

  const handleTitleFocus = () => {
    setIsEditingTitle(true);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
  };

  const handleIconError = () => {
    setIconError(true);
  };

  return (
    <article 
      ref={cardRef}
      className={`task-card animate-fade-in ${isCompleted && !compact ? 'task-card--completed' : ''} ${isExpanded && compact ? 'task-card--expanded-in-grid' : ''}`}
      role="listitem"
      aria-label={`Roadmap: ${course.title}${isCompleted ? ' (Completed)' : ''}`}
    >
      <div 
        className="task-card__header task-card__header--clickable"
        onClick={handleToggleExpand}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggleExpand(); } }}
        aria-expanded={isExpanded}
        aria-controls={`tasks-${course.id}`}
      >
        <div 
          className="task-card__icon" 
          aria-hidden="true"
          style={techIcon && !iconError ? { background: `${techIcon.color}20` } : {}}
        >
          {techIcon && !iconError ? (
            <img 
              src={techIcon.url} 
              alt=""
              width={22}
              height={22}
              onError={handleIconError}
              style={{ objectFit: 'contain' }}
            />
          ) : (
            <FolderKanban size={20} />
          )}
        </div>
        
        <div className="task-card__info">
          <label htmlFor={`title-${course.id}`} className="visually-hidden">
            Roadmap title
          </label>
          <input
            ref={titleInputRef}
            id={`title-${course.id}`}
            type="text"
            value={course.title}
            onChange={handleTitleChange}
            onKeyDown={handleTitleKeyDown}
            onFocus={handleTitleFocus}
            onBlur={handleTitleBlur}
            onClick={(e) => e.stopPropagation()}
            className="task-card__title-input"
            placeholder="Enter roadmap name..."
            aria-label={`Edit roadmap title: ${course.title}`}
          />
          
          {/* Progress Bar */}
          <div className="progress-container">
            <div 
              className="progress-bar"
              role="progressbar"
              aria-valuenow={progress.percent}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label={`Progress: ${progress.completed} of ${progress.total} tasks completed`}
            >
              <div 
                className="progress-bar__fill"
                style={{ 
                  width: `${progress.percent}%`,
                  background: isCompleted ? 'var(--success)' : 'var(--primary)'
                }}
              />
            </div>
            <div className="progress-text">
              <span>{progress.completed} of {progress.total} tasks</span>
              <span style={{ color: isCompleted ? 'var(--success)' : undefined }}>
                {isCompleted ? '✓ Complete!' : `${progress.percent}%`}
              </span>
            </div>
          </div>
        </div>

        <div className="task-card__actions" onClick={(e) => e.stopPropagation()}>
          <span className="task-card__expand-indicator" aria-hidden="true">
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </span>
          <button 
            onClick={() => onDelete(course.id)}
            className="btn btn--ghost btn--icon-sm btn--danger"
            aria-label={`Delete roadmap: ${course.title}`}
            title="Delete roadmap"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div 
        ref={bodyRef}
        id={`tasks-${course.id}`}
        className={`task-card__body ${isExpanded ? 'task-card__body--expanded' : 'task-card__body--collapsed'}`}
        role="list"
        aria-label={`Tasks in ${course.title}`}
        aria-hidden={!isExpanded}
      >
        <div className="task-card__body-inner">
          {course.tasks && course.tasks.length > 0 ? (
            course.tasks.map(task => (
              <TaskNode
                key={task.id}
                task={task}
                onUpdate={(updated) => handleTaskUpdate(task.id, updated)}
                onDelete={handleTaskDelete}
              />
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', padding: 'var(--spacing-md)' }}>
              No tasks yet. Add your first task below.
            </p>
          )}
          
          <button 
            onClick={handleAddTask}
            className="add-task-btn"
            aria-label="Add new task to this roadmap"
          >
            <Plus size={16} aria-hidden="true" />
            Add Task
          </button>
        </div>
      </div>
    </article>
  );
};

export default CourseCard;
