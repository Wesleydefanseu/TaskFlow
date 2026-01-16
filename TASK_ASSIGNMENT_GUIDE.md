# Guide d'Assignation des Tâches et Gestion des Groupes

## Vue d'ensemble

Ce guide explique comment utiliser les nouvelles fonctionnalités d'assignation de tâches et de gestion des groupes de messagerie dans TaskFlow.

## Fonctionnalités Implémentées

### 1. Création et Assignation de Tâches

#### Créer une Nouvelle Tâche
1. Allez à **Projets** > **Tableau Kanban**
2. Cliquez sur **+ Ajouter une tâche** dans la colonne appropriée
3. Remplissez les détails:
   - **Titre**: Nom de la tâche
   - **Description**: Détails supplémentaires
   - **Priorité**: Urgent, Élevée, Moyenne ou Basse
   - **Date d'échéance**: (Optionnel)
   - **Assignés**: Sélectionnez les membres de l'équipe

#### Assigner des Membres à une Tâche
1. Ouvrez la tâche (créer ou modifier)
2. Dans la section **Assignés**, cliquez sur **Ajouter un membre**
3. Sélectionnez un ou plusieurs membres
4. La tâche est automatiquement sauvegardée dans la base de données

#### Modifier les Assignations
1. Ouvrez la tâche en mode édition
2. Ajoutez ou supprimez des membres
3. Les changements sont synchro avec la BD automatiquement

### 2. Gestion des Groupes de Messagerie

#### Création Automatique de Groupes
Quand vous invitez un nouveau membre à l'équipe:
1. Allez à **Équipe** > **+ Ajouter un membre**
2. Remplissez les informations (email, nom, rôle)
3. Cliquez sur **Inviter**

**Automatiquement**:
- Un groupe de messagerie directe est créé pour ce membre
- Le nom du groupe: `{NomMembre} - Direct Messages`
- Le groupe inclut automatiquement le nouveau membre et l'initiateur

#### Ajouter un Membre à un Groupe Existant
Utilisez la fonction `addMemberToGroup()`:
```typescript
import { addMemberToGroup } from '@/lib/api';

await addMemberToGroup(groupId, userId);
```

#### Supprimer un Membre d'un Groupe
Utilisez la fonction `removeMemberFromGroup()`:
```typescript
import { removeMemberFromGroup } from '@/lib/api';

await removeMemberFromGroup(groupId, userId);
```

### 3. API Disponibles

#### Tâches
```typescript
// Créer une tâche
await createTask(boardId, title, options);

// Mettre à jour une tâche
await updateTask(taskId, updates);

// Supprimer une tâche
await deleteTask(taskId);
```

#### Assignations de Tâches
```typescript
// Assigner un utilisateur à une tâche
await assignTaskToUser(taskId, userId);

// Assigner plusieurs utilisateurs
await assignTaskToUsers(taskId, userIds);

// Retirer un utilisateur d'une tâche
await unassignTaskFromUser(taskId, userId);
```

#### Groupes de Messagerie
```typescript
// Créer un groupe de messagerie
await createMessageGroup(workspaceId, name, description, memberIds);

// Ajouter un membre à un groupe
await addMemberToGroup(groupId, userId);

// Retirer un membre d'un groupe
await removeMemberFromGroup(groupId, userId);

// Récupérer les détails d'un groupe
await getMessageGroup(groupId);
```

## Structure de la Base de Données

### Tables Impliquées

#### `tasks`
- `id`: UUID
- `board_id`: Référence au tableau
- `title`: Titre de la tâche
- `description`: Description
- `status`: todo | in_progress | review | done
- `priority`: urgent | high | medium | low
- `due_date`: Date d'échéance
- `created_by`: Créateur
- `position`: Ordre dans la colonne

#### `task_assignees`
- `task_id`: Référence à la tâche
- `user_id`: Référence à l'utilisateur assigné

#### `message_groups`
- `id`: UUID
- `workspace_id`: Référence à l'espace de travail
- `name`: Nom du groupe
- `description`: Description
- `created_by`: Créateur
- `created_at`: Timestamp

#### `group_members`
- `group_id`: Référence au groupe
- `user_id`: Référence à l'utilisateur

## Workflow Complet: Ajouter un Membre et le Faire Participer

1. **Inviter le Membre**
   - Équipe > Ajouter un membre
   - Email, nom, rôle
   - ✅ Groupe de messagerie créé automatiquement

2. **Assigner une Tâche**
   - Projets > Créer tâche
   - Assigner le nouveau membre
   - ✅ Tâche sauvegardée avec assignations

3. **Collaboration**
   - Le membre voit la tâche dans son tableau
   - Accès automatique au groupe de messagerie
   - Peut communiquer avec l'équipe

## Gestion des Erreurs

Toutes les fonctions lancent des erreurs appropriées:
- **Email non trouvé**: "Utilisateur non trouvé"
- **Déjà membre**: "Cet utilisateur est déjà membre"
- **Déjà assigné**: "Cet utilisateur est déjà assigné à cette tâche"

Les erreurs non critiques (comme la création de groupe échouée) ne bloquent pas l'invitation du membre.

## Notes Importantes

- Les tâches et assignations sont sauvegardées immédiatement dans la BD
- Les groupes de messagerie sont créés automatiquement (optionnel pour les viewers)
- Les transactions sont atomiques - soit tout s'enregistre, soit rien
- Les notifications sont envoyées après chaque action
