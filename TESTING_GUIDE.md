# Testing Guide - StackFlow Button Implementations

## Pre-Testing Checklist

Before testing, ensure:
- [ ] Supabase project is configured
- [ ] Environment variables are set (.env)
- [ ] Database migrations are up to date
- [ ] User is authenticated
- [ ] Workspace is selected

---

## Test Scenarios

### 1. Project Creation

**Location:** Sidebar → Projects section

**Steps:**
1. Click "+" button next to "Projets"
2. Fill in the form:
   - Nom du projet: "Test Project"
   - Description: "This is a test"
   - Statut: "planning"
   - Date de début: (pick any date)
   - Date de fin: (pick a future date)
3. Click "Créer"

**Expected Results:**
- [ ] Form closes
- [ ] Success toast appears: "Projet créé avec succès!"
- [ ] New project appears in sidebar
- [ ] Project has a colored dot indicator

**Database Check:**
```sql
SELECT * FROM projects WHERE name = 'Test Project';
-- Should return 1 row
```

---

### 2. Task Creation

**Location:** Projects page → Kanban board

**Steps:**
1. Navigate to Projects page
2. Click "+ Nouvelle tâche" button
3. Fill in the form:
   - Titre: "Test Task"
   - Description: "Test description"
   - Priorité: "high"
   - Date d'échéance: (pick a date)
   - Assignés: Select team members
4. Click "Créer"

**Expected Results:**
- [ ] Form closes
- [ ] Success toast appears: "Tâche créée"
- [ ] Task appears in the "À faire" column
- [ ] Assignees are displayed on the task card

**Database Check:**
```sql
SELECT * FROM tasks WHERE title = 'Test Task';
-- Should return 1 row

SELECT * FROM task_assignees WHERE task_id = '<task_id>';
-- Should return assignments for selected members
```

---

### 3. Task Assignment

**Location:** Projects page → Task Edit

**Steps:**
1. Open a task for editing (click on it)
2. In the form, select or add assignees
3. Click "Enregistrer"

**Expected Results:**
- [ ] Form closes
- [ ] Success toast appears: "Tâche mise à jour"
- [ ] Task shows updated assignees
- [ ] Avatar badges appear for assigned members

**Database Check:**
```sql
SELECT COUNT(*) FROM task_assignees WHERE task_id = '<task_id>';
-- Should match number of selected assignees
```

---

### 4. Task Status Change (Drag & Drop)

**Location:** Projects page → Kanban board

**Steps:**
1. Drag a task from "À faire" to "En cours"
2. Observe the card moves
3. Refresh the page

**Expected Results:**
- [ ] Task moves visually to new column
- [ ] Task remains in new column after refresh
- [ ] No toast needed (implicit operation)

**Database Check:**
```sql
SELECT status FROM tasks WHERE id = '<task_id>';
-- Should be 'in_progress'
```

---

### 5. Calendar Event Creation

**Location:** Calendar page

**Steps:**
1. Navigate to Calendar
2. Click "+" or "Nouvel événement" button
3. Fill in the form:
   - Titre: "Team Meeting"
   - Description: "Sprint planning"
   - Date: Pick a date
   - Heure: Pick a time
   - Durée: "1 heure"
   - Couleur: Select a color
4. Click "Créer"

**Expected Results:**
- [ ] Form closes
- [ ] Success toast appears: "Événement créé"
- [ ] Event appears on the calendar
- [ ] Event shows the selected color

**Database Check:**
```sql
SELECT * FROM events WHERE title = 'Team Meeting';
-- Should return 1 row with color and time
```

---

### 6. Calendar Event Update

**Location:** Calendar page

**Steps:**
1. Click on an existing event
2. Click edit/pencil icon
3. Change event details
4. Click "Enregistrer"

**Expected Results:**
- [ ] Form closes
- [ ] Success toast appears: "Événement mis à jour"
- [ ] Event reflects changes on calendar

**Database Check:**
```sql
SELECT * FROM events WHERE id = '<event_id>';
-- Should show updated fields
```

---

### 7. Calendar Event Deletion

**Location:** Calendar page

**Steps:**
1. Click on an event
2. Click delete/trash icon
3. Confirm deletion in the dialog

**Expected Results:**
- [ ] Confirmation dialog appears
- [ ] Event disappears from calendar after confirmation
- [ ] Success toast appears: "Événement supprimé"

**Database Check:**
```sql
SELECT * FROM events WHERE id = '<event_id>';
-- Should return 0 rows
```

---

### 8. Team Member Invitation

**Location:** Team page

**Steps:**
1. Click "Inviter" button
2. Fill in the form:
   - Nom complet: "John Doe"
   - Email: (existing user email)
   - Rôle: "developpeur"
   - Département: "Engineering"
3. Click "Créer"

**Expected Results:**
- [ ] Form closes
- [ ] Success toast appears: "Membre invité avec succès!"
- [ ] New member appears in team grid
- [ ] Member has the correct role badge

**Database Check:**
```sql
SELECT * FROM workspace_members WHERE user_id = '<user_id>';
-- Should show new membership with correct role
```

---

### 9. Team Member Role Update

**Location:** Team page

**Steps:**
1. Click "..." menu on member card
2. Click "Modifier"
3. Change role to "chef_projet"
4. Click "Enregistrer"

**Expected Results:**
- [ ] Form closes
- [ ] Success toast appears: "Membre mis à jour"
- [ ] Member card shows updated role

**Database Check:**
```sql
SELECT role FROM workspace_members 
WHERE user_id = '<user_id>' AND workspace_id = '<workspace_id>';
-- Should be 'manager' (mapped from chef_projet)
```

---

### 10. Team Member Deletion

**Location:** Team page

**Steps:**
1. Click "..." menu on member card
2. Click "Supprimer"
3. Confirm in the alert dialog

**Expected Results:**
- [ ] Confirmation dialog appears
- [ ] Member disappears from grid after confirmation
- [ ] Success toast appears: "Membre supprimé avec succès"

**Database Check:**
```sql
SELECT COUNT(*) FROM workspace_members 
WHERE user_id = '<user_id>' AND workspace_id = '<workspace_id>';
-- Should be 0
```

---

## Error Handling Tests

### Test Invalid Email Invitation
1. Try to invite with non-existent email
2. Should show error: "Utilisateur non trouvé"

### Test Duplicate Team Member
1. Try to invite someone already in the workspace
2. Should show error: "Cet utilisateur est déjà membre"

### Test Required Fields
1. Try to submit forms without required fields
2. Browser validation should prevent submission
3. Toast should explain what's missing

### Test Network Error
1. Open browser DevTools → Network tab
2. Mark API requests as "Offline"
3. Try to create a project
4. Should show error toast with message

---

## Performance Tests

### Test Large Dataset
1. Create 50+ tasks
2. Scroll through kanban board
3. Should not lag or freeze

### Test Real-Time Updates
1. Open same workspace in two browser windows
2. Create task in window 1
3. Refresh window 2
4. Should see new task

---

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Accessibility Tests

- [ ] All buttons have proper labels
- [ ] Forms are keyboard navigable
- [ ] Error messages are announced
- [ ] Toast notifications are readable
- [ ] Color contrast is sufficient

---

## Final Checklist

After all tests pass:

- [ ] No console errors
- [ ] No console warnings
- [ ] All toasts appear correctly
- [ ] All forms submit successfully
- [ ] Database has correct data
- [ ] UI reflects database state
- [ ] Loading states appear and disappear
- [ ] Error messages are user-friendly
- [ ] Page refreshes preserve data
- [ ] Drag-and-drop works smoothly

---

## Debugging Tips

If something doesn't work:

1. **Check Console**
   ```
   Open DevTools → Console
   Look for error messages
   ```

2. **Check Network**
   ```
   DevTools → Network
   Look for failed requests
   Check response status and body
   ```

3. **Check Database**
   ```
   Go to Supabase dashboard
   Query the relevant table
   Verify data was saved
   ```

4. **Check Environment Variables**
   ```
   Make sure .env has:
   VITE_SUPABASE_URL
   VITE_SUPABASE_PUBLISHABLE_KEY
   ```

5. **Check Authentication**
   ```
   Verify user is logged in
   Check user has proper permissions
   Verify workspace is selected
   ```

---

## Success Criteria

✅ All CRUD operations work
✅ Data persists in database
✅ UI updates correctly
✅ Error handling works
✅ Toast notifications display
✅ Forms validate properly
✅ No TypeScript errors
✅ No console errors
✅ Loading states work
✅ Drag-drop works (tasks)
