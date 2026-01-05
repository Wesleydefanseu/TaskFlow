import { supabase } from "@/integrations/supabase/client";

// =====================================================
// AI API
// =====================================================

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AISuggestion {
  type: "priority" | "deadline" | "assignee" | "task";
  title: string;
  description: string;
  confidence: number;
  data?: Record<string, unknown>;
}

interface AIProjectSummary {
  summary: string;
  keyMetrics: {
    completionRate: number;
    onTrackTasks: number;
    delayedTasks: number;
    riskLevel: "low" | "medium" | "high";
  };
  recommendations: string[];
  highlights?: string[];
  risks?: string[];
}

export async function streamAIChat(
  messages: ChatMessage[],
  onDelta: (text: string) => void,
  onDone: () => void
): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ type: "chat", messages }),
    }
  );

  if (!response.ok || !response.body) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "Failed to start stream");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        onDone();
        return;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  onDone();
}

export async function getAISuggestions(
  context: { tasks?: unknown[]; project?: unknown }
): Promise<AISuggestion[]> {
  const { data, error } = await supabase.functions.invoke("ai-assistant", {
    body: { type: "suggestions", context },
  });

  if (error) throw error;
  return data?.suggestions || [];
}

export async function getAIProjectSummary(
  context: { project?: unknown; tasks?: unknown[] }
): Promise<AIProjectSummary> {
  const { data, error } = await supabase.functions.invoke("ai-assistant", {
    body: { type: "summary", context },
  });

  if (error) throw error;
  return data;
}

// =====================================================
// AUTH API
// =====================================================

export async function signUp(email: string, password: string, fullName: string) {
  const redirectUrl = `${window.location.origin}/`;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        full_name: fullName,
      },
    },
  });

  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// =====================================================
// WORKSPACE API
// =====================================================

export async function createWorkspace(name: string, description?: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .insert({
      name,
      slug: `${slug}-${Date.now()}`,
      description,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
    .single();

  if (workspaceError) throw workspaceError;

  // Add creator as owner
  const { error: memberError } = await supabase
    .from("workspace_members")
    .insert({
      workspace_id: workspace.id,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      role: "owner",
    });

  if (memberError) throw memberError;

  return workspace;
}

export async function joinWorkspaceByCode(invitationCode: string) {
  const { data: workspace, error: findError } = await supabase
    .from("workspaces")
    .select("id, name")
    .eq("invitation_code", invitationCode)
    .maybeSingle();

  if (findError) throw findError;
  if (!workspace) throw new Error("Code d'invitation invalide");

  const { error: joinError } = await supabase
    .from("workspace_members")
    .insert({
      workspace_id: workspace.id,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      role: "member",
    });

  if (joinError) {
    if (joinError.code === "23505") {
      throw new Error("Vous êtes déjà membre de cet espace de travail");
    }
    throw joinError;
  }

  return workspace;
}

export async function getUserWorkspaces() {
  const { data, error } = await supabase
    .from("workspace_members")
    .select(`
      workspace_id,
      role,
      joined_at,
      workspaces (
        id,
        name,
        slug,
        description,
        logo_url,
        invitation_code,
        created_at
      )
    `)
    .order("joined_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getWorkspaceMembers(workspaceId: string) {
  const { data, error } = await supabase
    .from("workspace_members")
    .select(`
      id,
      user_id,
      role,
      joined_at,
      profiles (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq("workspace_id", workspaceId)
    .order("joined_at", { ascending: true });

  if (error) throw error;
  return data;
}

// =====================================================
// PROJECT API
// =====================================================

export async function createProject(
  workspaceId: string,
  name: string,
  description?: string,
  color?: string
) {
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      workspace_id: workspaceId,
      name,
      description,
      color: color || "#6366f1",
      created_by: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
    .single();

  if (projectError) throw projectError;

  // Create default board
  const { error: boardError } = await supabase
    .from("boards")
    .insert({
      project_id: project.id,
      name: "Tableau principal",
      is_default: true,
    });

  if (boardError) throw boardError;

  return project;
}

export async function getWorkspaceProjects(workspaceId: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getProjectBoards(projectId: string) {
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

// =====================================================
// TASK API
// =====================================================

export async function createTask(
  boardId: string,
  title: string,
  options?: {
    description?: string;
    status?: "todo" | "in_progress" | "review" | "done" | "archived";
    priority?: "urgent" | "high" | "medium" | "low";
    dueDate?: string;
  }
) {
  const user = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("tasks")
    .insert([{
      board_id: boardId,
      title,
      description: options?.description,
      status: options?.status || "todo",
      priority: options?.priority || "medium",
      due_date: options?.dueDate,
      created_by: user.data.user?.id,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getBoardTasks(boardId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      task_assignees (
        user_id,
        profiles (
          id,
          full_name,
          avatar_url
        )
      ),
      task_labels (
        label_id,
        labels (
          id,
          name,
          color
        )
      )
    `)
    .eq("board_id", boardId)
    .order("position", { ascending: true });

  if (error) throw error;
  return data;
}

export async function updateTask(
  taskId: string,
  updates: {
    title?: string;
    description?: string;
    status?: "todo" | "in_progress" | "review" | "done" | "archived";
    priority?: "urgent" | "high" | "medium" | "low";
    position?: number;
    due_date?: string;
  }
) {
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(taskId: string) {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) throw error;
}

// =====================================================
// COMMENTS API
// =====================================================

export async function getTaskComments(taskId: string) {
  const { data, error } = await supabase
    .from("task_comments")
    .select(`
      *,
      profiles (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function addTaskComment(taskId: string, content: string) {
  const { data, error } = await supabase
    .from("task_comments")
    .insert({
      task_id: taskId,
      content,
      user_id: (await supabase.auth.getUser()).data.user?.id,
    })
    .select(`
      *,
      profiles (
        id,
        full_name,
        avatar_url
      )
    `)
    .single();

  if (error) throw error;
  return data;
}

// =====================================================
// ACTIVITY API
// =====================================================

export async function getWorkspaceActivity(workspaceId: string, limit = 20) {
  const { data, error } = await supabase
    .from("activity_log")
    .select(`
      *,
      profiles (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function logActivity(
  workspaceId: string,
  action: string,
  targetType: string,
  targetId?: string,
  targetName?: string,
  details?: object
) {
  const user = await supabase.auth.getUser();
  const { error } = await supabase
    .from("activity_log")
    .insert([{
      workspace_id: workspaceId,
      user_id: user.data.user?.id,
      action,
      target_type: targetType,
      target_id: targetId,
      target_name: targetName,
      details: details ? JSON.parse(JSON.stringify(details)) : null,
    }]);

  if (error) throw error;
}

// =====================================================
// NOTIFICATIONS API
// =====================================================

export async function getUserNotifications() {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}

export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) throw error;
}

export async function markAllNotificationsRead() {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("is_read", false);

  if (error) throw error;
}
