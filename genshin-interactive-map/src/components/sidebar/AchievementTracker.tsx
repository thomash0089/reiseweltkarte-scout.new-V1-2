import React, { useState, useEffect } from 'react';
import { useMapContext } from '../../context/MapContext';

interface Achievement {
  id: number;
  name: string;
  category: string;
  description: string;
  requirements: string[];
  progress: number;
  maxProgress: number;
  completed: boolean;
  primogems: number;
  relatedLocations?: Array<[number, number]>;
}

const AchievementTracker: React.FC = () => {
  const { state } = useMapContext();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const response = await fetch('/data/achievements.json');
        const data = await response.json();
        setAchievements(data.achievements);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.achievements.map((a: Achievement) => a.category))] as string[];
        setCategories(['all', ...uniqueCategories]);
      } catch (error) {
        console.error('Error loading achievements:', error);
      }
    };

    loadAchievements();
  }, []);

  const updateAchievementProgress = (id: number, newProgress: number) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.id === id) {
        const updated = {
          ...achievement,
          progress: Math.max(0, Math.min(newProgress, achievement.maxProgress)),
          completed: newProgress >= achievement.maxProgress
        };
        return updated;
      }
      return achievement;
    }));
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'all') return true;
    if (filter === 'completed') return achievement.completed;
    if (filter === 'in-progress') return !achievement.completed && achievement.progress > 0;
    if (filter === 'not-started') return achievement.progress === 0;
    return achievement.category === filter;
  });

  const getProgressColor = (progress: number, maxProgress: number) => {
    const percentage = (progress / maxProgress) * 100;
    if (percentage >= 100) return 'var(--dendro-green)';
    if (percentage >= 75) return 'var(--geo-amber)';
    if (percentage >= 50) return 'var(--hydro-blue)';
    if (percentage >= 25) return 'var(--anemo-teal)';
    return 'var(--muted-stone)';
  };

  const totalPrimogems = achievements
    .filter(a => a.completed)
    .reduce((sum, a) => sum + a.primogems, 0);

  const completedCount = achievements.filter(a => a.completed).length;
  const totalCount = achievements.length;

  return (
    <div className="achievement-tracker">
      <div className="tracker-header">
        <h4>🏆 Achievement Tracker</h4>
        <div className="achievement-stats">
          <span className="stat">
            {completedCount}/{totalCount} completed
          </span>
          <span className="stat primogems">
            💎 {totalPrimogems} earned
          </span>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="achievement-filters">
        <select 
          className="form-input"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Achievements</option>
          <option value="completed">Completed</option>
          <option value="in-progress">In Progress</option>
          <option value="not-started">Not Started</option>
          {categories.slice(1).map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Achievements List */}
      <div className="achievements-list">
        {filteredAchievements.length === 0 ? (
          <p className="empty-state">No achievements found for the selected filter.</p>
        ) : (
          filteredAchievements.map(achievement => {
            const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;
            
            return (
              <div key={achievement.id} className={`achievement-item ${achievement.completed ? 'completed' : ''}`}>
                <div className="achievement-header">
                  <div className="achievement-info">
                    <h5 className="achievement-name">
                      {achievement.completed ? '✓ ' : ''}{achievement.name}
                    </h5>
                    <span className="achievement-category">{achievement.category}</span>
                  </div>
                  
                  <div className="achievement-reward">
                    💎 {achievement.primogems}
                  </div>
                </div>
                
                <p className="achievement-description">{achievement.description}</p>
                
                <div className="achievement-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${progressPercentage}%`,
                        backgroundColor: getProgressColor(achievement.progress, achievement.maxProgress)
                      }}
                    ></div>
                  </div>
                  <div className="progress-controls">
                    <span className="progress-text">
                      {achievement.progress} / {achievement.maxProgress}
                    </span>
                    
                    {!achievement.completed && (
                      <div className="progress-buttons">
                        <button 
                          className="btn-icon"
                          onClick={() => updateAchievementProgress(achievement.id, achievement.progress - 1)}
                          disabled={achievement.progress <= 0}
                        >
                          -
                        </button>
                        
                        <button 
                          className="btn-icon"
                          onClick={() => updateAchievementProgress(achievement.id, achievement.progress + 1)}
                          disabled={achievement.progress >= achievement.maxProgress}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {achievement.requirements.length > 0 && (
                  <div className="achievement-requirements">
                    <h6>Requirements:</h6>
                    <ul>
                      {achievement.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {achievement.relatedLocations && achievement.relatedLocations.length > 0 && (
                  <div className="achievement-locations">
                    <button className="btn btn-secondary small">
                      🗺 Show on Map ({achievement.relatedLocations.length})
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Category Summary */}
      {achievements.length > 0 && (
        <div className="category-summary">
          <h5>Progress by Category</h5>
          {categories.slice(1).map(category => {
            const categoryAchievements = achievements.filter(a => a.category === category);
            const completed = categoryAchievements.filter(a => a.completed).length;
            const total = categoryAchievements.length;
            const percentage = Math.round((completed / total) * 100);
            
            return (
              <div key={category} className="category-progress">
                <div className="category-info">
                  <span className="category-name">{category}</span>
                  <span className="category-stats">{completed}/{total} ({percentage}%)</span>
                </div>
                <div className="category-bar">
                  <div 
                    className="category-fill"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AchievementTracker;