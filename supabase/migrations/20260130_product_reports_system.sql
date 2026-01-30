-- Product Reports & Points System Migration
-- Enables users to report product issues and earn RushPoints

-- Create enum for report status
CREATE TYPE report_status AS ENUM ('pending', 'verified', 'rejected');

-- Create enum for issue types
CREATE TYPE issue_type AS ENUM ('expired', 'damaged', 'mrp_mismatch', 'fake_offer', 'other');

-- Table: product_reports
-- Stores all user-submitted reports about product issues
CREATE TABLE public.product_reports (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    issue_type issue_type NOT NULL,
    description TEXT,
    proof_image_url TEXT, -- URL to image in Supabase Storage
    expiry_date_image_url TEXT, -- Mandatory for expired products
    status report_status NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    points_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on product_reports
ALTER TABLE public.product_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports"
ON public.product_reports FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create reports"
ON public.product_reports FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending reports"
ON public.product_reports FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Table: user_points
-- Stores total points balance for each user
CREATE TABLE public.user_points (
    user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_points INTEGER NOT NULL DEFAULT 0,
    points_used INTEGER NOT NULL DEFAULT 0,
    available_points INTEGER GENERATED ALWAYS AS (total_points - points_used) STORED,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_points
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own points"
ON public.user_points FOR SELECT
USING (auth.uid() = user_id);

-- Table: point_transactions
-- Stores history of all point credits and debits
CREATE TABLE public.point_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL, -- Positive for credit, negative for debit
    transaction_type TEXT NOT NULL, -- 'report_verified', 'redeemed', 'bonus', etc.
    reference_id UUID, -- ID of related report/order
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on point_transactions
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
ON public.point_transactions FOR SELECT
USING (auth.uid() = user_id);

-- Function: Award points when report is verified
CREATE OR REPLACE FUNCTION award_points_for_verified_report()
RETURNS TRIGGER AS $$
DECLARE
    points_to_award INTEGER;
BEGIN
    -- Only proceed if status changed to 'verified' and points not already awarded
    IF NEW.status = 'verified' AND OLD.status != 'verified' THEN
        -- Calculate points based on issue type
        points_to_award := CASE NEW.issue_type
            WHEN 'expired' THEN 50
            WHEN 'damaged' THEN 40
            WHEN 'mrp_mismatch' THEN 30
            WHEN 'fake_offer' THEN 25
            ELSE 20
        END;
        
        -- Update report with points awarded
        NEW.points_awarded := points_to_award;
        NEW.verified_at := now();
        
        -- Insert or update user_points
        INSERT INTO public.user_points (user_id, total_points, updated_at)
        VALUES (NEW.user_id, points_to_award, now())
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            total_points = public.user_points.total_points + points_to_award,
            updated_at = now();
        
        -- Record transaction
        INSERT INTO public.point_transactions (user_id, points, transaction_type, reference_id, description)
        VALUES (
            NEW.user_id,
            points_to_award,
            'report_verified',
            NEW.id,
            'Points awarded for verified ' || NEW.issue_type || ' report'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Award points when report is verified
CREATE TRIGGER on_report_verified
    BEFORE UPDATE ON public.product_reports
    FOR EACH ROW
    EXECUTE FUNCTION award_points_for_verified_report();

-- Create indexes for better query performance
CREATE INDEX idx_product_reports_user_id ON public.product_reports(user_id);
CREATE INDEX idx_product_reports_status ON public.product_reports(status);
CREATE INDEX idx_product_reports_created_at ON public.product_reports(created_at DESC);
CREATE INDEX idx_product_reports_user_product ON public.product_reports(user_id, product_id);
CREATE INDEX idx_point_transactions_user_id ON public.point_transactions(user_id);
CREATE INDEX idx_point_transactions_created_at ON public.point_transactions(created_at DESC);

-- Function to check if user already reported same product today
CREATE OR REPLACE FUNCTION check_daily_report_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.product_reports
        WHERE user_id = NEW.user_id
        AND product_id = NEW.product_id
        AND created_at::date = NEW.created_at::date
        AND id != NEW.id
    ) THEN
        RAISE EXCEPTION 'You have already reported this product today';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce daily limit
CREATE TRIGGER enforce_daily_report_limit
    BEFORE INSERT ON public.product_reports
    FOR EACH ROW
    EXECUTE FUNCTION check_daily_report_limit();

-- Insert initial user_points record for existing users (optional)
-- INSERT INTO public.user_points (user_id)
-- SELECT id FROM auth.users
-- ON CONFLICT (user_id) DO NOTHING;

COMMENT ON TABLE public.product_reports IS 'User-submitted reports about product issues';
COMMENT ON TABLE public.user_points IS 'Total RushPoints balance for each user';
COMMENT ON TABLE public.point_transactions IS 'Complete history of point credits and debits';
