-- Achievement System Database Schema

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'savings', 'budgeting', 'goals', 'streaks', 'milestones'
  rarity VARCHAR(20) NOT NULL, -- 'common', 'rare', 'epic', 'legendary'
  points INTEGER NOT NULL DEFAULT 0,
  requirements JSONB NOT NULL, -- e.g., {"type": "balance_threshold", "value": 1000}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements (tracking which users have earned which achievements)
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress JSONB, -- For tracking progress on multi-step achievements
  UNIQUE(user_id, achievement_id)
);

-- User stats for achievement tracking
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_balance_high DECIMAL(12,2) DEFAULT 0,
  total_saved DECIMAL(12,2) DEFAULT 0,
  goals_completed INTEGER DEFAULT 0,
  bills_paid_on_time INTEGER DEFAULT 0,
  days_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profile badges/tags
CREATE TABLE IF NOT EXISTS profile_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  color VARCHAR(20) NOT NULL,
  rarity VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profile badges
CREATE TABLE IF NOT EXISTS user_profile_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES profile_badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_equipped BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, badge_id)
);

-- Insert default achievements
INSERT INTO achievements (name, description, icon, category, rarity, points, requirements) VALUES
-- Savings Achievements
('First Steps', 'Save your first $100', '💰', 'savings', 'common', 10, '{"type": "balance_threshold", "value": 100}'),
('Saver', 'Reach $1,000 in savings', '🏦', 'savings', 'common', 25, '{"type": "balance_threshold", "value": 1000}'),
('Thousandaire', 'Reach $10,000 in savings', '💎', 'savings', 'rare', 100, '{"type": "balance_threshold", "value": 10000}'),
('Millionaire Mindset', 'Reach $100,000 in savings', '👑', 'savings', 'legendary', 500, '{"type": "balance_threshold", "value": 100000}'),

-- Goal Achievements
('Goal Setter', 'Create your first savings goal', '🎯', 'goals', 'common', 10, '{"type": "goals_created", "value": 1}'),
('Goal Crusher', 'Complete 5 savings goals', '🏆', 'goals', 'rare', 50, '{"type": "goals_completed", "value": 5}'),
('Dream Chaser', 'Complete 10 savings goals', '⭐', 'goals', 'epic', 100, '{"type": "goals_completed", "value": 10}'),

-- Budgeting Achievements
('Budget Master', 'Pay all bills on time for 3 months', '📊', 'budgeting', 'rare', 75, '{"type": "bills_on_time_streak", "value": 90}'),
('Discipline', 'Stay within budget for 30 days', '⚡', 'budgeting', 'common', 25, '{"type": "budget_streak", "value": 30}'),
('Consistency', 'Log income for 7 consecutive days', '📝', 'budgeting', 'common', 15, '{"type": "income_log_streak", "value": 7}'),

-- Streak Achievements
('Week Warrior', 'Use the app for 7 consecutive days', '🔥', 'streaks', 'common', 20, '{"type": "app_usage_streak", "value": 7}'),
('Month Master', 'Use the app for 30 consecutive days', '🔥', 'streaks', 'rare', 50, '{"type": "app_usage_streak", "value": 30}'),
('Habit Hero', 'Use the app for 100 consecutive days', '🔥', 'streaks', 'epic', 150, '{"type": "app_usage_streak", "value": 100}'),

-- Milestone Achievements
('First Bill', 'Add your first recurring bill', '📄', 'milestones', 'common', 5, '{"type": "bills_added", "value": 1}'),
('Bill Manager', 'Add 5 recurring bills', '📋', 'milestones', 'common', 15, '{"type": "bills_added", "value": 5}'),
('Income Tracker', 'Log your first income entry', '💵', 'milestones', 'common', 5, '{"type": "income_entries", "value": 1}'),
('Regular Earner', 'Log 10 income entries', '💵', 'milestones', 'common', 20, '{"type": "income_entries", "value": 10}');

-- Insert default profile badges
INSERT INTO profile_badges (name, description, icon, color, rarity) VALUES
('Newcomer', 'Just getting started', '🌱', 'green', 'common'),
('Saver', 'Proven saving skills', '💰', 'gold', 'common'),
('Goal Setter', 'Ambitious and focused', '🎯', 'blue', 'common'),
('Consistent', 'Shows dedication', '📅', 'purple', 'rare'),
('Disciplined', 'Excellent self-control', '⚡', 'orange', 'rare'),
('Millionaire', 'Reached $100k savings', '👑', 'yellow', 'legendary'),
('Streak Master', '100+ day usage streak', '🔥', 'red', 'epic'),
('Budget Pro', 'Master of budgeting', '📊', 'cyan', 'epic');

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements (read-only for all users)
CREATE POLICY "achievements_read_policy" ON achievements FOR SELECT USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "user_achievements_select_policy" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_achievements_insert_policy" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_achievements_update_policy" ON user_achievements FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_stats
CREATE POLICY "user_stats_select_policy" ON user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_stats_insert_policy" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_stats_update_policy" ON user_stats FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for profile_badges (read-only for all users)
CREATE POLICY "profile_badges_read_policy" ON profile_badges FOR SELECT USING (true);

-- RLS Policies for user_profile_badges
CREATE POLICY "user_profile_badges_select_policy" ON user_profile_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_profile_badges_insert_policy" ON user_profile_badges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_profile_badges_update_policy" ON user_profile_badges FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profile_badges_user_id ON user_profile_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profile_badges_badge_id ON user_profile_badges(badge_id);

-- Function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id, total_balance_high, total_saved, goals_completed, bills_paid_on_time, days_streak, longest_streak, last_activity_date, updated_at)
  VALUES (NEW.user_id, 0, 0, 0, 0, 0, 0, CURRENT_DATE, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    updated_at = NOW(),
    last_activity_date = CURRENT_DATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create user_stats on new user
CREATE TRIGGER create_user_stats_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();