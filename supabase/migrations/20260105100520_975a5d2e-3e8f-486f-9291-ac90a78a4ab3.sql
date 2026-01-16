-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'manager', 'member', 'viewer');

-- Create task_priority enum
CREATE TYPE public.task_priority AS ENUM ('urgent', 'high', 'medium', 'low');

-- Create task_status enum
CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'review', 'done', 'archived');

-- =====================================================
-- PROFILES TABLE (linked to auth.users)
-- =====================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- WORKSPACES TABLE
-- =====================================================
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  invitation_code TEXT UNIQUE DEFAULT SUBSTRING(MD5(RANDOM()::TEXT), 1, 8),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- WORKSPACE MEMBERS TABLE
-- =====================================================
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Security definer function to check workspace membership
CREATE OR REPLACE FUNCTION public.is_workspace_member(_user_id UUID, _workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE user_id = _user_id AND workspace_id = _workspace_id
  )
$$;

-- Security definer function to check workspace role
CREATE OR REPLACE FUNCTION public.has_workspace_role(_user_id UUID, _workspace_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE user_id = _user_id 
      AND workspace_id = _workspace_id
      AND role = _role
  )
$$;

-- Workspace RLS policies
CREATE POLICY "Workspace members can view workspaces"
  ON public.workspaces FOR SELECT
  USING (public.is_workspace_member(auth.uid(), id));

CREATE POLICY "Users can create workspaces"
  ON public.workspaces FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Workspace admins/owners can update"
  ON public.workspaces FOR UPDATE
  USING (
    public.has_workspace_role(auth.uid(), id, 'owner') OR 
    public.has_workspace_role(auth.uid(), id, 'admin')
  );

-- Workspace members RLS policies
CREATE POLICY "Members can view workspace members"
  ON public.workspace_members FOR SELECT
  USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Admins can manage workspace members"
  ON public.workspace_members FOR INSERT
  WITH CHECK (
    public.has_workspace_role(auth.uid(), workspace_id, 'owner') OR 
    public.has_workspace_role(auth.uid(), workspace_id, 'admin')
  );

CREATE POLICY "Users can insert themselves when joining"
  ON public.workspace_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update members"
  ON public.workspace_members FOR UPDATE
  USING (
    public.has_workspace_role(auth.uid(), workspace_id, 'owner') OR 
    public.has_workspace_role(auth.uid(), workspace_id, 'admin')
  );

CREATE POLICY "Admins can delete members"
  ON public.workspace_members FOR DELETE
  USING (
    public.has_workspace_role(auth.uid(), workspace_id, 'owner') OR 
    public.has_workspace_role(auth.uid(), workspace_id, 'admin') OR
    auth.uid() = user_id
  );

-- =====================================================
-- PROJECTS TABLE
-- =====================================================
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view projects"
  ON public.projects FOR SELECT
  USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Managers+ can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (
    public.has_workspace_role(auth.uid(), workspace_id, 'owner') OR 
    public.has_workspace_role(auth.uid(), workspace_id, 'admin') OR
    public.has_workspace_role(auth.uid(), workspace_id, 'manager')
  );

CREATE POLICY "Managers+ can update projects"
  ON public.projects FOR UPDATE
  USING (
    public.has_workspace_role(auth.uid(), workspace_id, 'owner') OR 
    public.has_workspace_role(auth.uid(), workspace_id, 'admin') OR
    public.has_workspace_role(auth.uid(), workspace_id, 'manager')
  );

CREATE POLICY "Admins can delete projects"
  ON public.projects FOR DELETE
  USING (
    public.has_workspace_role(auth.uid(), workspace_id, 'owner') OR 
    public.has_workspace_role(auth.uid(), workspace_id, 'admin')
  );

-- =====================================================
-- PROJECT MEMBERS TABLE (who has access to which project)
-- =====================================================
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Function to check project access
CREATE OR REPLACE FUNCTION public.has_project_access(_user_id UUID, _project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members
    WHERE user_id = _user_id AND project_id = _project_id
  ) OR EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE p.id = _project_id 
      AND wm.user_id = _user_id 
      AND wm.role IN ('owner', 'admin')
  )
$$;

CREATE POLICY "Project members can view"
  ON public.project_members FOR SELECT
  USING (public.has_project_access(auth.uid(), project_id));

CREATE POLICY "Managers can add project members"
  ON public.project_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND (
        public.has_workspace_role(auth.uid(), p.workspace_id, 'owner') OR
        public.has_workspace_role(auth.uid(), p.workspace_id, 'admin') OR
        public.has_workspace_role(auth.uid(), p.workspace_id, 'manager')
      )
    )
  );

CREATE POLICY "Managers can remove project members"
  ON public.project_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND (
        public.has_workspace_role(auth.uid(), p.workspace_id, 'owner') OR
        public.has_workspace_role(auth.uid(), p.workspace_id, 'admin') OR
        public.has_workspace_role(auth.uid(), p.workspace_id, 'manager')
      )
    )
  );

-- =====================================================
-- BOARDS TABLE (Kanban boards)
-- =====================================================
CREATE TABLE public.boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project members can view boards"
  ON public.boards FOR SELECT
  USING (public.has_project_access(auth.uid(), project_id));

CREATE POLICY "Project members can create boards"
  ON public.boards FOR INSERT
  WITH CHECK (public.has_project_access(auth.uid(), project_id));

CREATE POLICY "Project members can update boards"
  ON public.boards FOR UPDATE
  USING (public.has_project_access(auth.uid(), project_id));

-- =====================================================
-- TASKS TABLE
-- =====================================================
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'todo',
  priority task_priority NOT NULL DEFAULT 'medium',
  position INTEGER DEFAULT 0,
  due_date DATE,
  estimated_hours NUMERIC(5,2),
  actual_hours NUMERIC(5,2),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Function to check task access through board
CREATE OR REPLACE FUNCTION public.has_task_access(_user_id UUID, _task_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.boards b ON b.id = t.board_id
    WHERE t.id = _task_id AND public.has_project_access(_user_id, b.project_id)
  )
$$;

CREATE POLICY "Users with project access can view tasks"
  ON public.tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.boards b
      WHERE b.id = board_id AND public.has_project_access(auth.uid(), b.project_id)
    )
  );

CREATE POLICY "Users with project access can create tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.boards b
      WHERE b.id = board_id AND public.has_project_access(auth.uid(), b.project_id)
    )
  );

CREATE POLICY "Users with project access can update tasks"
  ON public.tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.boards b
      WHERE b.id = board_id AND public.has_project_access(auth.uid(), b.project_id)
    )
  );

CREATE POLICY "Users with project access can delete tasks"
  ON public.tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.boards b
      WHERE b.id = board_id AND public.has_project_access(auth.uid(), b.project_id)
    )
  );

-- =====================================================
-- TASK ASSIGNEES TABLE
-- =====================================================
CREATE TABLE public.task_assignees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id, user_id)
);

ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users with task access can view assignees"
  ON public.task_assignees FOR SELECT
  USING (public.has_task_access(auth.uid(), task_id));

CREATE POLICY "Users with task access can manage assignees"
  ON public.task_assignees FOR INSERT
  WITH CHECK (public.has_task_access(auth.uid(), task_id));

CREATE POLICY "Users with task access can remove assignees"
  ON public.task_assignees FOR DELETE
  USING (public.has_task_access(auth.uid(), task_id));

-- =====================================================
-- TASK LABELS TABLE
-- =====================================================
CREATE TABLE public.labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view labels"
  ON public.labels FOR SELECT
  USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Workspace members can create labels"
  ON public.labels FOR INSERT
  WITH CHECK (public.is_workspace_member(auth.uid(), workspace_id));

-- Task labels junction table
CREATE TABLE public.task_labels (
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES public.labels(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, label_id)
);

ALTER TABLE public.task_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users with task access can view task labels"
  ON public.task_labels FOR SELECT
  USING (public.has_task_access(auth.uid(), task_id));

CREATE POLICY "Users with task access can manage task labels"
  ON public.task_labels FOR ALL
  USING (public.has_task_access(auth.uid(), task_id));

-- =====================================================
-- TASK COMMENTS TABLE
-- =====================================================
CREATE TABLE public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users with task access can view comments"
  ON public.task_comments FOR SELECT
  USING (public.has_task_access(auth.uid(), task_id));

CREATE POLICY "Users with task access can create comments"
  ON public.task_comments FOR INSERT
  WITH CHECK (public.has_task_access(auth.uid(), task_id) AND auth.uid() = user_id);

CREATE POLICY "Comment authors can update"
  ON public.task_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Comment authors can delete"
  ON public.task_comments FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- ACTIVITY LOG TABLE
-- =====================================================
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  target_name TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view activity"
  ON public.activity_log FOR SELECT
  USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "System can insert activity"
  ON public.activity_log FOR INSERT
  WITH CHECK (public.is_workspace_member(auth.uid(), workspace_id));

-- =====================================================
-- AUTOMATION RULES TABLE
-- =====================================================
CREATE TABLE public.automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  trigger_condition JSONB,
  actions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  execution_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view automations"
  ON public.automation_rules FOR SELECT
  USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Admins can manage automations"
  ON public.automation_rules FOR ALL
  USING (
    public.has_workspace_role(auth.uid(), workspace_id, 'owner') OR 
    public.has_workspace_role(auth.uid(), workspace_id, 'admin')
  );

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (TRUE);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON public.boards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_task_comments_updated_at BEFORE UPDATE ON public.task_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON public.automation_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;