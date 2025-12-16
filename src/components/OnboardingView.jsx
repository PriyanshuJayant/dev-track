import { useState } from 'react';
import { Plus, Sparkles, ClipboardList } from 'lucide-react';

const OnboardingView = ({ onCreateCategory }) => {
  const [categoryName, setCategoryName] = useState('');
  const [step, setStep] = useState(1); // 1: welcome, 2: name input

  const handleSubmit = (e) => {
    e.preventDefault();
    if (categoryName.trim()) {
      onCreateCategory(categoryName.trim());
    }
  };

  const handleQuickStart = (name) => {
    onCreateCategory(name);
  };

  return (
    <div className="onboarding">
      <div className="onboarding__container">
        {step === 1 ? (
          <>
            <div className="onboarding__icon">
              <Sparkles size={48} />
            </div>
            <h1 className="onboarding__title">Welcome to DevTrack</h1>
            <p className="onboarding__subtitle">
              Your personal task organizer for everything — learning roadmaps, 
              shopping lists, goals, and more.
            </p>

            <div className="onboarding__actions">
              <button 
                className="btn btn--primary btn--lg"
                onClick={() => setStep(2)}
              >
                <Plus size={20} />
                Create Your First List
              </button>
            </div>

            <div className="onboarding__quick-start">
              <p className="onboarding__quick-label">Or quick start with:</p>
              <div className="onboarding__quick-options">
                <button 
                  className="onboarding__quick-btn"
                  onClick={() => handleQuickStart('Roadmaps')}
                >
                  📚 Roadmaps
                </button>
                <button 
                  className="onboarding__quick-btn"
                  onClick={() => handleQuickStart('Groceries')}
                >
                  🛒 Groceries
                </button>
                <button 
                  className="onboarding__quick-btn"
                  onClick={() => handleQuickStart('Goals')}
                >
                  🎯 Goals
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="onboarding__icon">
              <ClipboardList size={48} />
            </div>
            <h1 className="onboarding__title">Name Your List</h1>
            <p className="onboarding__subtitle">
              What would you like to track? Give your list a name.
            </p>

            <form onSubmit={handleSubmit} className="onboarding__form">
              <input
                type="text"
                className="onboarding__input"
                placeholder="e.g., Learning Roadmaps, Shopping, Goals..."
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                autoFocus
                maxLength={50}
              />
              <div className="onboarding__form-actions">
                <button 
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button 
                  type="submit"
                  className="btn btn--primary"
                  disabled={!categoryName.trim()}
                >
                  Create List
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default OnboardingView;
