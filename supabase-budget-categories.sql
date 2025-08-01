-- Budget Categories System
-- Add these tables to your existing Supabase database

-- Budget Categories table
CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  allocated_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  current_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  color VARCHAR(7) DEFAULT '#31748f', -- Rose Pine colors
  icon VARCHAR(50) DEFAULT '💰',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budget Category Transactions table
CREATE TABLE IF NOT EXISTS budget_category_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  transaction_date DATE NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'expense', -- 'expense' or 'refund'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budget Category Refills table (for tracking when categories get refilled)
CREATE TABLE IF NOT EXISTS budget_category_refills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
  refill_amount DECIMAL(12,2) NOT NULL,
  refill_date DATE NOT NULL,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_budget_categories_user_id ON budget_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_category_transactions_user_id ON budget_category_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_category_transactions_category_id ON budget_category_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_budget_category_refills_user_id ON budget_category_refills(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_category_refills_category_id ON budget_category_refills(category_id);

-- Enable Row Level Security
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_category_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_category_refills ENABLE ROW LEVEL SECURITY;

-- RLS Policies for budget_categories
CREATE POLICY "Users can view their own budget categories" ON budget_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget categories" ON budget_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget categories" ON budget_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget categories" ON budget_categories
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for budget_category_transactions
CREATE POLICY "Users can view their own budget category transactions" ON budget_category_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget category transactions" ON budget_category_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget category transactions" ON budget_category_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget category transactions" ON budget_category_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for budget_category_refills
CREATE POLICY "Users can view their own budget category refills" ON budget_category_refills
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget category refills" ON budget_category_refills
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget category refills" ON budget_category_refills
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget category refills" ON budget_category_refills
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update category balance when transaction is added
CREATE OR REPLACE FUNCTION update_budget_category_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'expense' THEN
      UPDATE budget_categories 
      SET current_balance = current_balance - NEW.amount,
          updated_at = NOW()
      WHERE id = NEW.category_id;
    ELSIF NEW.type = 'refund' THEN
      UPDATE budget_categories 
      SET current_balance = current_balance + NEW.amount,
          updated_at = NOW()
      WHERE id = NEW.category_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle balance adjustment for updated transactions
    IF OLD.type = 'expense' AND NEW.type = 'expense' THEN
      UPDATE budget_categories 
      SET current_balance = current_balance + OLD.amount - NEW.amount,
          updated_at = NOW()
      WHERE id = NEW.category_id;
    ELSIF OLD.type = 'refund' AND NEW.type = 'refund' THEN
      UPDATE budget_categories 
      SET current_balance = current_balance - OLD.amount + NEW.amount,
          updated_at = NOW()
      WHERE id = NEW.category_id;
    ELSIF OLD.type = 'expense' AND NEW.type = 'refund' THEN
      UPDATE budget_categories 
      SET current_balance = current_balance + OLD.amount + NEW.amount,
          updated_at = NOW()
      WHERE id = NEW.category_id;
    ELSIF OLD.type = 'refund' AND NEW.type = 'expense' THEN
      UPDATE budget_categories 
      SET current_balance = current_balance - OLD.amount - NEW.amount,
          updated_at = NOW()
      WHERE id = NEW.category_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'expense' THEN
      UPDATE budget_categories 
      SET current_balance = current_balance + OLD.amount,
          updated_at = NOW()
      WHERE id = OLD.category_id;
    ELSIF OLD.type = 'refund' THEN
      UPDATE budget_categories 
      SET current_balance = current_balance - OLD.amount,
          updated_at = NOW()
      WHERE id = OLD.category_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for budget category transactions
DROP TRIGGER IF EXISTS trigger_update_budget_category_balance ON budget_category_transactions;
CREATE TRIGGER trigger_update_budget_category_balance
  AFTER INSERT OR UPDATE OR DELETE ON budget_category_transactions
  FOR EACH ROW EXECUTE FUNCTION update_budget_category_balance();

-- Function to refill budget categories on pay period
CREATE OR REPLACE FUNCTION refill_budget_categories(pay_period_start DATE, pay_period_end DATE)
RETURNS VOID AS $$
DECLARE
  category_record RECORD;
BEGIN
  FOR category_record IN 
    SELECT id, allocated_amount 
    FROM budget_categories 
    WHERE is_active = TRUE
  LOOP
    -- Add refill amount to current balance
    UPDATE budget_categories 
    SET current_balance = current_balance + category_record.allocated_amount,
        updated_at = NOW()
    WHERE id = category_record.id;
    
    -- Record the refill
    INSERT INTO budget_category_refills (
      category_id, 
      refill_amount, 
      refill_date, 
      pay_period_start, 
      pay_period_end
    ) VALUES (
      category_record.id,
      category_record.allocated_amount,
      CURRENT_DATE,
      pay_period_start,
      pay_period_end
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insert some default budget categories for new users
INSERT INTO budget_categories (user_id, name, description, allocated_amount, color, icon) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Groceries', 'Food and household items', 200.00, '#31748f', '🛒'),
  ('00000000-0000-0000-0000-000000000000', 'Entertainment', 'Movies, games, fun activities', 100.00, '#eb6f92', '🎮'),
  ('00000000-0000-0000-0000-000000000000', 'Dining Out', 'Restaurants and takeout', 150.00, '#f6c177', '🍕'),
  ('00000000-0000-0000-0000-000000000000', 'Transportation', 'Gas, public transit, rideshare', 100.00, '#9ccfd8', '🚗'),
  ('00000000-0000-0000-0000-000000000000', 'Shopping', 'Clothes, electronics, etc.', 75.00, '#c4a7e7', '🛍️'),
  ('00000000-0000-0000-0000-000000000000', 'No Questions Asked', 'Spend on whatever you want', 75.00, '#ebbcba', '💸');

-- Add updated_at trigger for budget_categories
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_budget_categories_updated_at ON budget_categories;
CREATE TRIGGER update_budget_categories_updated_at
    BEFORE UPDATE ON budget_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();