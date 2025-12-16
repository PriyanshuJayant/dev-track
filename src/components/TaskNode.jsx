import { useState, useRef, useCallback } from 'react';
import { ChevronRight, ChevronDown, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

const TaskNode = ({ task, onUpdate, onDelete, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const textInputRef = useRef(null);

  const toggleComplete = useCallback(() => {
    onUpdate({ ...task, completed: !task.completed });
  }, [task, onUpdate]);

  const handleAddSubTask = useCallback(() => {
    const newSubTask = {
      id: Date.now().toString(),
      text: 'New Subtask',
      completed: false,
      children: []
    };
    onUpdate({ ...task, children: [...(task.children || []), newSubTask] });
    setIsExpanded(true);
  }, [task, onUpdate]);

  const handleChildUpdate = useCallback((childId, updatedChild) => {
    const updatedChildren = task.children.map(c => 
      c.id === childId ? updatedChild : c
    );
    onUpdate({ ...task, children: updatedChildren });
  }, [task, onUpdate]);

  const handleChildDelete = useCallback((childId) => {
    const updatedChildren = task.children.filter(c => c.id !== childId);
    onUpdate({ ...task, children: updatedChildren });
  }, [task, onUpdate]);

  const handleTextChange = (e) => {
    onUpdate({ ...task, text: e.target.value });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      textInputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      textInputRef.current?.blur();
    }
  };

  const handleCheckboxKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleComplete();
    }
  };

  const hasChildren = task.children && task.children.length > 0;

  return (
    <div 
      className="animate-fade-in"
      role="listitem"
      aria-label={`Task: ${task.text}${task.completed ? ' (completed)' : ''}`}
    >
      <div className={`task-item ${task.completed ? 'task-item--completed' : ''}`}>
        {/* Expand/Collapse Toggle */}
        {hasChildren ? (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="task-item__expand-btn"
            aria-expanded={isExpanded}
            aria-controls={`subtasks-${task.id}`}
            aria-label={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <div style={{ width: '24px' }} aria-hidden="true" />
        )}

        {/* Checkbox */}
        <button 
          onClick={toggleComplete}
          onKeyDown={handleCheckboxKeyDown}
          className={`task-item__checkbox ${task.completed ? 'task-item__checkbox--checked' : 'task-item__checkbox--unchecked'}`}
          role="checkbox"
          aria-checked={task.completed}
          aria-label={task.completed ? `Mark "${task.text}" as incomplete` : `Mark "${task.text}" as complete`}
        >
          {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </button>

        {/* Task Text */}
        <div className="task-item__content">
          <label htmlFor={`task-${task.id}`} className="visually-hidden">
            Task text
          </label>
          <input
            ref={textInputRef}
            id={`task-${task.id}`}
            type="text"
            value={task.text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            className="task-item__text"
            placeholder="Enter task..."
            aria-label={`Edit task: ${task.text}`}
          />
        </div>

        {/* Actions */}
        <div className="task-item__actions">
          <button 
            onClick={handleAddSubTask}
            className="btn btn--ghost btn--icon-sm"
            aria-label={`Add subtask to "${task.text}"`}
            title="Add subtask"
          >
            <Plus size={14} />
          </button>
          <button 
            onClick={() => onDelete(task.id)}
            className="btn btn--ghost btn--icon-sm btn--danger"
            aria-label={`Delete task: ${task.text}`}
            title="Delete task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Recursive Children */}
      {isExpanded && hasChildren && (
        <div 
          id={`subtasks-${task.id}`}
          className="task-item__children"
          role="list"
          aria-label={`Subtasks of ${task.text}`}
        >
          {task.children.map(child => (
            <TaskNode
              key={child.id}
              task={child}
              depth={depth + 1}
              onUpdate={(updated) => handleChildUpdate(child.id, updated)}
              onDelete={handleChildDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskNode;
