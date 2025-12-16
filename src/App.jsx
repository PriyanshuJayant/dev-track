import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import Sidebar from './components/Sidebar';
import HomeView from './components/HomeView';
import OnboardingView from './components/OnboardingView';
import CourseCard from './components/CourseCard';
import { Plus, CheckCircle, AlertCircle, ClipboardList, Menu, X, LayoutGrid, List, Home } from 'lucide-react';

function App() {
  // LocalStorage for persistent data - new category-based structure
  const [categories, setCategories] = useLocalStorage('dev-track-categories', null);
  const [activeCategoryId, setActiveCategoryId] = useLocalStorage('dev-track-active-category', null);
  const [activeListId, setActiveListId] = useLocalStorage('dev-track-active-list', null);
  const [viewMode, setViewMode] = useLocalStorage('dev-track-view', 'home'); // 'home', 'category', 'list', 'all-lists'
  const [allViewLayout, setAllViewLayout] = useLocalStorage('dev-track-layout', 'grid');
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [notification, setNotification] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const fileInputRef = useRef(null);

  // Initialize with empty array if localStorage is empty
  useEffect(() => {
    if (categories === null) {
      setCategories([]);
    }
    setIsInitialized(true);
  }, [categories, setCategories]);

  // Get active category and list
  const activeCategory = categories?.find(c => c.id === activeCategoryId);
  const activeList = activeCategory?.lists?.find(l => l.id === activeListId);

  const showNotification = useCallback((msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // ===== CATEGORY HANDLERS =====
  const handleCreateCategory = useCallback((name = 'New List') => {
    const newCategory = {
      id: Date.now().toString(),
      name: name,
      lists: []
    };
    setCategories(prev => [...(prev || []), newCategory]);
    setActiveCategoryId(newCategory.id);
    setViewMode('category');
    showNotification(`"${name}" created!`);
  }, [setCategories, setActiveCategoryId, setViewMode, showNotification]);

  const handleSelectCategory = useCallback((id) => {
    setActiveCategoryId(id);
    setActiveListId(null);
    setViewMode('category');
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [setActiveCategoryId, setActiveListId, setViewMode]);

  const handleRenameCategory = useCallback((id, newName = null) => {
    const category = categories?.find(c => c.id === id);
    if (!category) return;
    
    // If newName is provided directly, use it (inline editing)
    // Otherwise, prompt for a new name (context menu)
    const finalName = newName !== null ? newName : window.prompt('Enter new name:', category.name);
    
    if (finalName && finalName.trim()) {
      setCategories(prev => prev.map(c => 
        c.id === id ? { ...c, name: finalName.trim() } : c
      ));
      showNotification('Category renamed');
    }
  }, [categories, setCategories, showNotification]);

  const handleDeleteCategory = useCallback((id) => {
    const category = categories?.find(c => c.id === id);
    
    const isEmpty = !category?.lists || category.lists.length === 0;
    const shouldDelete = isEmpty || 
      window.confirm(`Delete "${category.name}" and all its lists? This cannot be undone.`);
    
    if (shouldDelete) {
      setCategories(prev => {
        const newCategories = prev.filter(c => c.id !== id);
        if (id === activeCategoryId) {
          setActiveCategoryId(null);
          setActiveListId(null);
          setViewMode('home');
        }
        return newCategories;
      });
      showNotification('Category deleted');
    }
  }, [categories, setCategories, activeCategoryId, setActiveCategoryId, setActiveListId, setViewMode, showNotification]);

  const handleDuplicateCategory = useCallback((id) => {
    const category = categories?.find(c => c.id === id);
    if (!category) return;
    
    const duplicated = {
      ...JSON.parse(JSON.stringify(category)),
      id: Date.now().toString(),
      name: `${category.name} (Copy)`
    };
    
    setCategories(prev => [...prev, duplicated]);
    setActiveCategoryId(duplicated.id);
    setViewMode('category');
    showNotification('Category duplicated');
  }, [categories, setCategories, setActiveCategoryId, setViewMode, showNotification]);

  // Reorder categories (drag and drop)
  const handleReorderCategories = useCallback((newOrder) => {
    setCategories(newOrder);
  }, [setCategories]);

  const handleGoHome = useCallback(() => {
    setViewMode('home');
    setActiveListId(null);
  }, [setViewMode, setActiveListId]);

  // ===== LIST HANDLERS (within a category) =====
  const handleAddList = useCallback(() => {
    if (!activeCategoryId) return;
    
    const newList = {
      id: Date.now().toString(),
      title: 'New Item',
      tasks: []
    };
    
    setCategories(prev => prev.map(cat => 
      cat.id === activeCategoryId 
        ? { ...cat, lists: [...(cat.lists || []), newList] }
        : cat
    ));
    setActiveListId(newList.id);
    setViewMode('list');
    showNotification('New item created!');
  }, [activeCategoryId, setCategories, setActiveListId, setViewMode, showNotification]);

  const handleUpdateList = useCallback((listId, updatedList) => {
    setCategories(prev => prev.map(cat => 
      cat.id === activeCategoryId 
        ? { ...cat, lists: cat.lists.map(l => l.id === listId ? updatedList : l) }
        : cat
    ));
  }, [activeCategoryId, setCategories]);

  const handleDeleteList = useCallback((listId) => {
    const list = activeCategory?.lists?.find(l => l.id === listId);
    
    const isDefault = list && 
      (list.title === 'New Item' || list.title === '') && 
      (!list.tasks || list.tasks.length === 0);
    
    const shouldDelete = isDefault || 
      window.confirm('Delete this item? This action cannot be undone.');
    
    if (shouldDelete) {
      setCategories(prev => prev.map(cat => {
        if (cat.id !== activeCategoryId) return cat;
        
        const newLists = cat.lists.filter(l => l.id !== listId);
        if (listId === activeListId && newLists.length > 0) {
          setActiveListId(newLists[0].id);
        } else if (newLists.length === 0) {
          setActiveListId(null);
          setViewMode('category');
        }
        return { ...cat, lists: newLists };
      }));
      showNotification('Item deleted');
    }
  }, [activeCategory, activeCategoryId, activeListId, setCategories, setActiveListId, setViewMode, showNotification]);

  const handleSelectList = useCallback((id) => {
    setActiveListId(id);
    setViewMode('list');
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [setActiveListId, setViewMode]);

  const handleViewAllLists = useCallback(() => {
    setViewMode('all-lists');
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [setViewMode]);

  const handleRenameList = useCallback((id) => {
    const list = activeCategory?.lists?.find(l => l.id === id);
    if (!list) return;
    
    const newName = window.prompt('Enter new name:', list.title);
    if (newName && newName.trim()) {
      setCategories(prev => prev.map(cat => 
        cat.id === activeCategoryId 
          ? { ...cat, lists: cat.lists.map(l => l.id === id ? { ...l, title: newName.trim() } : l) }
          : cat
      ));
      showNotification('Item renamed');
    }
  }, [activeCategory, activeCategoryId, setCategories, showNotification]);

  // Reorder lists within a category (drag and drop)
  const handleReorderLists = useCallback((newOrder) => {
    setCategories(prev => prev.map(cat => 
      cat.id === activeCategoryId 
        ? { ...cat, lists: newOrder }
        : cat
    ));
  }, [activeCategoryId, setCategories]);

  const handleDuplicateList = useCallback((id) => {
    const list = activeCategory?.lists?.find(l => l.id === id);
    if (!list) return;
    
    const duplicated = {
      ...JSON.parse(JSON.stringify(list)),
      id: Date.now().toString(),
      title: `${list.title} (Copy)`
    };
    
    setCategories(prev => prev.map(cat => 
      cat.id === activeCategoryId 
        ? { ...cat, lists: [...cat.lists, duplicated] }
        : cat
    ));
    setActiveListId(duplicated.id);
    setViewMode('list');
    showNotification('Item duplicated');
  }, [activeCategory, activeCategoryId, setCategories, setActiveListId, setViewMode, showNotification]);

  // ===== EXPORT/IMPORT =====
  const handleExportData = useCallback(() => {
    const data = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      categories: categories || []
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `devtrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!');
  }, [categories, showNotification]);

  const handleImportData = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result);
        
        // Handle v2.0 format (categories)
        if (data.categories && Array.isArray(data.categories)) {
          const confirmImport = categories?.length > 0
            ? window.confirm(`This will replace your current data. Continue?`)
            : true;
          
          if (confirmImport) {
            setCategories(data.categories);
            setActiveCategoryId(null);
            setActiveListId(null);
            setViewMode('home');
            showNotification(`Imported ${data.categories.length} category(s)!`);
          }
        } 
        // Handle v1.0 format (roadmaps) - migrate to new structure
        else if (data.roadmaps && Array.isArray(data.roadmaps)) {
          const confirmImport = categories?.length > 0
            ? window.confirm(`This will import legacy data as a new "Roadmaps" category. Continue?`)
            : true;
          
          if (confirmImport) {
            const migratedCategory = {
              id: Date.now().toString(),
              name: 'Roadmaps',
              lists: data.roadmaps
            };
            setCategories(prev => [...(prev || []), migratedCategory]);
            setActiveCategoryId(migratedCategory.id);
            setViewMode('category');
            showNotification(`Imported ${data.roadmaps.length} roadmap(s)!`);
          }
        } else {
          showNotification('Invalid backup file format', 'error');
        }
      } catch (err) {
        showNotification('Failed to parse backup file', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [categories, setCategories, setActiveCategoryId, setActiveListId, setViewMode, showNotification]);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Loading state
  if (!isInitialized) {
    return (
      <div className="app-loading">
        <div className="app-loading__spinner" />
        <p>Loading DevTrack...</p>
      </div>
    );
  }

  // Onboarding - no categories exist
  if (categories?.length === 0) {
    return <OnboardingView onCreateCategory={handleCreateCategory} onImportData={handleImportData} />;
  }

  return (
    <div className={`app-layout ${sidebarOpen ? 'app-layout--sidebar-open' : ''} ${viewMode === 'home' ? 'app-layout--home' : ''}`}>
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Toast Notification */}
      {notification && (
        <div 
          className={`toast ${notification.type === 'error' ? 'toast--error' : 'toast--success'}`}
          role="alert"
          aria-live="polite"
        >
          <span className={`toast__icon ${notification.type === 'error' ? 'toast__icon--error' : 'toast__icon--success'}`}>
            {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          </span>
          {notification.msg}
        </div>
      )}

      {/* Mobile Header */}
      <header className="mobile-header">
        <button 
          className="mobile-header__toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1 className="mobile-header__title">DevTrack</h1>
        <button 
          className="mobile-header__home"
          onClick={handleGoHome}
          aria-label="Go to home"
        >
          <Home size={24} />
        </button>
      </header>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportData}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      {/* Sidebar - only show when in category view */}
      {viewMode !== 'home' && activeCategory && (
        <Sidebar 
          category={activeCategory}
          lists={activeCategory.lists || []}
          activeListId={activeListId}
          viewMode={viewMode}
          allViewLayout={allViewLayout}
          onGoHome={handleGoHome}
          onSelectList={handleSelectList}
          onCreateList={handleAddList}
          onDeleteList={handleDeleteList}
          onRenameList={handleRenameList}
          onDuplicateList={handleDuplicateList}
          onReorderLists={handleReorderLists}
          onViewAllLists={handleViewAllLists}
          onSetAllViewLayout={setAllViewLayout}
          onExportData={handleExportData}
          onImportData={triggerFileInput}
        />
      )}

      {/* Main Content */}
      <main id="main-content" className={`app-main ${viewMode === 'home' ? 'app-main--full' : ''}`} role="main">
        {viewMode === 'home' ? (
          // Home View - All Categories
          <HomeView 
            categories={categories}
            onSelectCategory={handleSelectCategory}
            onCreateCategory={handleCreateCategory}
            onRenameCategory={handleRenameCategory}
            onDeleteCategory={handleDeleteCategory}
            onDuplicateCategory={handleDuplicateCategory}
            onReorderCategories={handleReorderCategories}
            onExportData={handleExportData}
            onImportData={triggerFileInput}
          />
        ) : viewMode === 'all-lists' ? (
          // All Lists View (within a category)
          <div key={`all-lists-${activeCategoryId}`} className="all-roadmaps-view">
            <div className="page-header">
              <div className="page-header__icon">
                <LayoutGrid size={24} />
              </div>
              <div className="page-header__content">
                <h2 className="page-header__title">{activeCategory?.name}</h2>
                <p className="page-header__subtitle">
                  {activeCategory?.lists?.length || 0} items • Click to view details
                </p>
              </div>
              <div className="page-header__actions">
                <div className="layout-toggle" role="group" aria-label="View layout">
                  <button
                    className={`layout-toggle__btn ${allViewLayout === 'grid' ? 'layout-toggle__btn--active' : ''}`}
                    onClick={() => setAllViewLayout('grid')}
                    aria-pressed={allViewLayout === 'grid'}
                    title="Grid view"
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    className={`layout-toggle__btn ${allViewLayout === 'list' ? 'layout-toggle__btn--active' : ''}`}
                    onClick={() => setAllViewLayout('list')}
                    aria-pressed={allViewLayout === 'list'}
                    title="List view"
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>
            
            {activeCategory?.lists?.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon" aria-hidden="true">
                  <ClipboardList size={48} />
                </div>
                <h2 className="empty-state__title">No items yet</h2>
                <p className="empty-state__text">
                  Create your first item in this category.
                </p>
                <button 
                  onClick={handleAddList} 
                  className="btn btn--primary"
                >
                  <Plus size={18} aria-hidden="true" />
                  Create Item
                </button>
              </div>
            ) : (
              <div className="roadmap-grid-wrapper">
                <div 
                  className={`grid-backdrop ${expandedCardId ? 'grid-backdrop--visible' : ''}`}
                  onClick={() => setExpandedCardId(null)}
                  aria-hidden="true"
                />
                <div 
                  key={`layout-${allViewLayout}`}
                  className={`${allViewLayout === 'grid' ? 'roadmap-grid' : 'roadmap-list'} ${expandedCardId ? 'has-expanded-card' : ''}`}
                >
                  {activeCategory.lists.map(list => (
                    <CourseCard
                      key={list.id}
                      course={list}
                      onUpdate={(updated) => handleUpdateList(list.id, updated)}
                      onDelete={handleDeleteList}
                      defaultExpanded={false}
                      compact={true}
                      isExpandedExternal={expandedCardId === list.id}
                      onExpandChange={(expanded) => setExpandedCardId(expanded ? list.id : null)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : viewMode === 'list' && activeList ? (
          // Single List View
          <div key={`list-view-${activeList.id}`} className="roadmap-view">
            <CourseCard
              key={activeList.id}
              course={activeList}
              onUpdate={(updated) => handleUpdateList(activeList.id, updated)}
              onDelete={handleDeleteList}
            />
          </div>
        ) : (
          // Category View - no list selected
          <div key={`category-empty-${activeCategoryId}`} className="empty-state animate-fade-in">
            <div className="empty-state__icon" aria-hidden="true">
              <ClipboardList size={48} />
            </div>
            <h2 className="empty-state__title">
              {activeCategory?.lists?.length === 0 ? 'No items yet' : 'Select an item'}
            </h2>
            <p className="empty-state__text">
              {activeCategory?.lists?.length === 0 
                ? 'Create your first item to get started.'
                : 'Choose an item from the sidebar to view and manage your tasks.'}
            </p>
            {activeCategory?.lists?.length === 0 && (
              <button 
                onClick={handleAddList} 
                className="btn btn--primary"
              >
                <Plus size={18} aria-hidden="true" />
                Create Item
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
