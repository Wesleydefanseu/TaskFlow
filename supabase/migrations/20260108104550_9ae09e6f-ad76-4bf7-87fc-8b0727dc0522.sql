-- Table for chat channels (groups and direct messages)
CREATE TABLE public.chat_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'project')),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for channel members
CREATE TABLE public.chat_channel_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_read_at TIMESTAMPTZ,
  UNIQUE(channel_id, user_id)
);

-- Table for messages
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  reply_to_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for invoices (simulated billing)
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  amount INTEGER NOT NULL, -- in FCFA
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'enterprise')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for subscriptions
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due')),
  current_period_start DATE NOT NULL DEFAULT CURRENT_DATE,
  current_period_end DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for AI predictions on tasks
CREATE TABLE public.task_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE UNIQUE,
  predicted_completion_date DATE,
  delay_risk_score INTEGER CHECK (delay_risk_score >= 0 AND delay_risk_score <= 100),
  risk_factors JSONB,
  suggested_priority TEXT CHECK (suggested_priority IN ('urgent', 'high', 'medium', 'low')),
  suggested_assignees UUID[],
  estimated_hours NUMERIC,
  ai_notes TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_predictions ENABLE ROW LEVEL SECURITY;

-- Helper function to check channel membership
CREATE OR REPLACE FUNCTION public.is_channel_member(_user_id UUID, _channel_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_channel_members
    WHERE user_id = _user_id AND channel_id = _channel_id
  )
$$;

-- RLS Policies for chat_channels
CREATE POLICY "Workspace members can view channels"
ON public.chat_channels FOR SELECT
USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Workspace members can create channels"
ON public.chat_channels FOR INSERT
WITH CHECK (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Channel creator can update"
ON public.chat_channels FOR UPDATE
USING (created_by = auth.uid());

-- RLS Policies for chat_channel_members
CREATE POLICY "Channel members can view members"
ON public.chat_channel_members FOR SELECT
USING (is_channel_member(auth.uid(), channel_id));

CREATE POLICY "Channel members can add members"
ON public.chat_channel_members FOR INSERT
WITH CHECK (is_channel_member(auth.uid(), channel_id) OR user_id = auth.uid());

CREATE POLICY "Users can leave channels"
ON public.chat_channel_members FOR DELETE
USING (user_id = auth.uid());

-- RLS Policies for chat_messages
CREATE POLICY "Channel members can view messages"
ON public.chat_messages FOR SELECT
USING (is_channel_member(auth.uid(), channel_id));

CREATE POLICY "Channel members can send messages"
ON public.chat_messages FOR INSERT
WITH CHECK (is_channel_member(auth.uid(), channel_id) AND user_id = auth.uid());

CREATE POLICY "Authors can update their messages"
ON public.chat_messages FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Authors can delete their messages"
ON public.chat_messages FOR DELETE
USING (user_id = auth.uid());

-- RLS Policies for invoices
CREATE POLICY "Workspace admins can view invoices"
ON public.invoices FOR SELECT
USING (has_workspace_role(auth.uid(), workspace_id, 'owner') OR has_workspace_role(auth.uid(), workspace_id, 'admin'));

CREATE POLICY "System can create invoices"
ON public.invoices FOR INSERT
WITH CHECK (is_workspace_member(auth.uid(), workspace_id));

-- RLS Policies for subscriptions
CREATE POLICY "Workspace members can view subscription"
ON public.subscriptions FOR SELECT
USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Workspace admins can manage subscription"
ON public.subscriptions FOR ALL
USING (has_workspace_role(auth.uid(), workspace_id, 'owner') OR has_workspace_role(auth.uid(), workspace_id, 'admin'));

-- RLS Policies for task_predictions
CREATE POLICY "Users with task access can view predictions"
ON public.task_predictions FOR SELECT
USING (has_task_access(auth.uid(), task_id));

CREATE POLICY "System can manage predictions"
ON public.task_predictions FOR ALL
USING (has_task_access(auth.uid(), task_id));

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Triggers for updated_at
CREATE TRIGGER update_chat_channels_updated_at
  BEFORE UPDATE ON public.chat_channels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at
  BEFORE UPDATE ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();