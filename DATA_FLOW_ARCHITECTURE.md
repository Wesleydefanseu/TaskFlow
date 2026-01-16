# Data Flow Architecture - StackFlow Implementation

## Overall Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Dashboard   │  │  Projects    │  │  Calendar    │          │
│  │  (Sidebar)   │  │   (Kanban)   │  │   (Events)   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
│  ┌──────▼──────────────────▼──────────────────▼──────┐          │
│  │            Event Handlers / Click Events          │          │
│  │  • handleProjectSubmit()                          │          │
│  │  • handleTaskSubmit()                             │          │
│  │  • handleEventSubmit()                            │          │
│  │  • handleSubmit() [Team]                          │          │
│  └──────┬───────────────────────────────────────────┘          │
│         │                                                         │
└─────────┼─────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API LAYER (src/lib/api.ts)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Project API │  │   Task API   │  │  Event API   │          │
│  │              │  │              │  │              │          │
│  │createProject │  │ createTask   │  │ createEvent  │          │
│  └──────┬───────┘  │ assignToUsers│  │updateEvent   │          │
│         │          │ updateTask   │  │deleteEvent   │          │
│         │          └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
│  ┌──────▼──────────────────▼──────────────────▼──────┐          │
│  │              Team API Functions                    │          │
│  │  • inviteTeamMember()                             │          │
│  │  • updateTeamMemberRole()                         │          │
│  └──────────────────┬───────────────────────────────┘          │
└─────────────────────┼─────────────────────────────────────────────┘
                      │
                      ▼
            ┌─────────────────────┐
            │  Supabase Client    │
            │                     │
            │ .from(table).insert │
            │ .from(table).update │
            │ .from(table).delete │
            │ .from(table).select │
            └──────────┬──────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SUPABASE DATABASE                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │  projects  │  │   tasks    │  │   events   │                │
│  │────────────│  │────────────│  │────────────│                │
│  │ id         │  │ id         │  │ id         │                │
│  │ name       │  │ title      │  │ title      │                │
│  │ workspace_ │  │ description│  │ date       │                │
│  │   id       │  │ priority   │  │ time       │                │
│  │ description│  │ status     │  │ duration   │                │
│  │ created_by │  │ board_id   │  │ color      │                │
│  └────────────┘  │ created_by │  └────────────┘                │
│                  └────────────┘                                  │
│  ┌────────────────┐  ┌──────────────────┐                      │
│  │task_assignees  │  │workspace_members │                      │
│  │────────────────│  │──────────────────│                      │
│  │ task_id        │  │ workspace_id     │                      │
│  │ user_id        │  │ user_id          │                      │
│  └────────────────┘  │ role             │                      │
│                      │ joined_at        │                      │
│                      └──────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Creation Flow

```
User clicks "+" button (Sidebar)
         │
         ▼
ProjectForm Dialog opens
         │
         ▼
User fills form and clicks "Créer"
         │
         ▼
handleProjectSubmit(data)
         │
         ▼
addProject(name, description, color)
    [WorkspaceContext]
         │
         ▼
API Call: createProject()
         │
    ┌────▼─────┐
    │           │
    ▼           ▼
Success       Error
    │           │
    ▼           ▼
Insert into   Show Error
projects      Toast
table
    │
    ▼
Update State
    │
    ▼
Project appears in sidebar
    │
    ▼
Show Success Toast
```

---

## Task Creation & Assignment Flow

```
User clicks "+ Nouvelle tâche"
         │
         ▼
TaskForm Dialog opens
         │
         ▼
User selects assignees from team list
         │
         ▼
User clicks "Créer"
         │
         ▼
handleTaskSubmit(taskData)
         │
    ┌────▼─────────────────┐
    │                      │
    ▼                      ▼
Insert into        Assign to users
tasks table        [assignTaskToUsers]
    │                      │
    │              ┌───────┴───────┬────────────┐
    │              ▼               ▼            ▼
    │         Delete old     Insert new   Show Success
    │         assignments    assignments  Toast
    │              │              │
    └──────────┬───┴──────────────┘
               │
               ▼
        Update UI State
               │
               ▼
        Task appears on board
        with assignee avatars
```

---

## Event CRUD Flow

```
CREATE EVENT
User clicks "+" → EventForm → handleEventSubmit() → createEvent() → Insert into events → Update state → Show on calendar

UPDATE EVENT
User clicks Edit → EventForm with data → handleEventSubmit() → updateEvent() → Update in events → Refresh state

DELETE EVENT
User clicks Delete → Confirmation → handleDeleteEvent() → deleteEvent() → Delete from events → Refresh state
```

---

## Team Member Flow

```
INVITE MEMBER
User clicks "Inviter" → TeamMemberForm → handleSubmit() → inviteTeamMember()
         │
         ▼
    Validate email exists
         │
    ┌────▼─────┐
    │           │
    ▼           ▼
Found       Not Found
    │           │
    ▼           ▼
Insert into  Show Error:
workspace_   "User not found"
members
    │
    ▼
Add to team grid
    │
    ▼
Show Success Toast


UPDATE ROLE
Edit member → updateTeamMemberRole() → Update role in workspace_members → Refresh UI

DELETE MEMBER
Delete button → Confirm dialog → removeMember() → Delete from workspace_members → Remove from grid
```

---

## State Management Flow

```
┌──────────────────────────────────────────────┐
│        React Component (Page/Sidebar)        │
│                                              │
│  State Variables:                           │
│  • [tasks, setTasks]                        │
│  • [events, setEvents]                      │
│  • [teamMembers, setTeamMembers]            │
│  • [isSubmitting, setIsSubmitting]          │
└──────────────┬───────────────────────────────┘
               │
               ▼
        User interaction
        (click button)
               │
               ▼
      Event Handler Function
      (e.g., handleTaskSubmit)
               │
               ▼
        API Call to Supabase
               │
         ┌─────▼─────┐
         │            │
         ▼            ▼
    Success         Error
         │            │
         ▼            ▼
    Update State   Show Toast
    with new data  with error msg
         │
         ▼
    React Re-renders
    with new data
         │
         ▼
    UI Updates
    (new item appears)
         │
         ▼
    Show Success Toast
```

---

## Error Handling Flow

```
User Action
     │
     ▼
Handler Function
     │
     ▼
Try: API Call
     │
┌────▼────┐
│          │
▼          ▼
Success   Error
  │         │
  │         ▼
  │    Catch Block
  │         │
  │    ┌────▼──────┐
  │    │            │
  │    ▼            ▼
  │ Console.error  Toast.error
  │ (debugging)    (user message)
  │    │            │
  │    └────┬───────┘
  │         │
  │    Return early
  │         │
  └─────┬───┘
        │
        ▼
    Update UI
    (loading state false)
        │
        ▼
    Show Status to User
```

---

## Database Operation Sequence

```
┌──────────────┐
│ JavaScript   │
│ (Frontend)   │
└────────┬─────┘
         │
         │ 1. Call API function
         │    (with data)
         │
         ▼
┌──────────────────────────┐
│ API Function (api.ts)    │
│                          │
│ • Validate data          │
│ • Prepare for database   │
└────────┬─────────────────┘
         │
         │ 2. Call Supabase
         │    .from().insert()
         │    .from().update()
         │    .from().delete()
         │
         ▼
┌──────────────────────────┐
│ Supabase Client          │
│                          │
│ • Build SQL query        │
│ • Execute query          │
│ • Return result          │
└────────┬─────────────────┘
         │
         │ 3. HTTP Request
         │    to Supabase
         │
         ▼
┌──────────────────────────┐
│ Supabase Server          │
│                          │
│ • Authenticate user      │
│ • Check permissions      │
│ • Execute SQL            │
│ • Save to database       │
│ • Return result          │
└────────┬─────────────────┘
         │
         │ 4. HTTP Response
         │    with data/error
         │
         ▼
┌──────────────────────────┐
│ Supabase Client          │
│                          │
│ • Parse response         │
│ • Return to JS           │
└────────┬─────────────────┘
         │
         │ 5. Handle in
         │    API function
         │
         ▼
┌──────────────────────────┐
│ API Function             │
│                          │
│ • Check for errors       │
│ • Return data or throw   │
└────────┬─────────────────┘
         │
         │ 6. Receive in
         │    handler
         │
         ▼
┌──────────────────────────┐
│ Handler Function         │
│                          │
│ • Update state           │
│ • Show notification      │
│ • Refresh UI             │
└──────────────────────────┘
```

---

## Toast Notification Flow

```
Success Operation
     │
     ▼
Handler executes
     │
     ▼
toast.success("Message")
     │
     ▼
Toast notification appears
(green/bottom-right)
     │
     ▼
Auto-dismiss after 3-4 seconds
     │
     ▼
Notification removed


Error Operation
     │
     ▼
Catch block executes
     │
     ▼
toast.error("Error message")
     │
     ▼
Toast notification appears
(red/bottom-right)
     │
     ▼
User can click to dismiss
     │
     ▼
Notification removed
```

---

## Performance Considerations

```
Single Operation:
User clicks → Handler → API Call → Database → Response → UI Update
Time: ~200-500ms (network dependent)

Bulk Operations:
Multi-select → Handler → Single API Call → Database → Response → UI Update
Time: ~200-500ms (same as single)
Benefit: Reduced API calls


Optimizations Implemented:
✓ Supabase client connection pooling
✓ Single API calls for bulk operations
✓ Local state updates for instant UI feedback
✓ Loading states prevent double submission
✓ Error handling prevents failed requests
```

---

## Data Validation Flow

```
User Input
     │
     ▼
Browser Form Validation
(HTML5: required, type, etc.)
     │
┌────▼────┐
│          │
▼          ▼
Valid    Invalid
│         │
│         └─► Show browser error
│             (red outline)
│
▼
Handler Function
     │
     ▼
Manual Validation
(e.g., check email format)
     │
┌────▼────┐
│          │
▼          ▼
Valid    Invalid
│         │
│         └─► Show toast error
│
▼
API Function
     │
     ▼
API Validation
(TypeScript types)
     │
┌────▼────┐
│          │
▼          ▼
Valid    Invalid
│         │
│         └─► Throw error
│
▼
Supabase
     │
     ▼
Database Constraints
     │
┌────▼────┐
│          │
▼          ▼
Valid    Invalid
│         │
│         └─► Return error
│
▼
Success
```

---

## Summary

The entire flow ensures:
1. **User Experience** - Immediate feedback via toasts
2. **Data Integrity** - Multiple validation layers
3. **Error Handling** - Graceful error messages
4. **Performance** - Optimized API calls
5. **Reliability** - Proper state management
6. **Security** - Server-side validation

All components work together to provide a seamless, efficient, and secure user experience.
