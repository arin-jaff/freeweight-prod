# Feature: Core CRUD Operations for MVP

## Overview

Complete essential Create, Read, Update, Delete, and Archive operations to make Freeweight's coaching platform fully functional for MVP launch. This enables coaches to edit programs after creation, manage groups/subgroups with a full UI, allow athletes to join via invite codes, and archive programs with one-click restoration. Priority is frontend polish for existing features with minimal new backend endpoints.

**Target Users:** Coaches (primary), Athletes (invite acceptance only)
**Timeline:** 1 week to MVP
**Priority Ranking:** 1) Program editing, 2) Athlete invitation flow, 3) Group management UI, 4) Program archiving, 5) Athlete profile editing

---

## Functional Requirements

### Program Editing

#### FR-PROG-001: Edit Program Metadata
While a coach is viewing their program list, when they select "Edit" on a program, the system shall display an edit form pre-populated with the program's current name and description.

#### FR-PROG-002: Update Program Details
While a coach is editing a program, when they submit valid changes, the system shall update the Program record and return the updated program with all nested workouts/exercises.

#### FR-PROG-003: Edit Workout Template
While a coach is editing a program, when they modify a workout's name or day offset, the system shall update the Workout template record.

#### FR-PROG-004: Edit Exercise Details
While a coach is editing a program, when they modify an exercise's name, sets, reps, percentage, or rest period, the system shall update the Exercise record.

#### FR-PROG-005: Reorder Workouts
While a coach is editing a program, when they change the order of workouts, the system shall update the day_offset fields to reflect the new sequence.

#### FR-PROG-006: Reorder Exercises
While a coach is editing a workout, when they change the order of exercises, the system shall update the order fields to reflect the new sequence.

#### FR-PROG-007: Apply Edits to Future Workouts Only
While a program is assigned to athletes, when a coach edits the program template, the system shall update only the materialized Workout instances with scheduled_date greater than today (future workouts).

#### FR-PROG-008: Preserve Historical Set Logs
While an athlete has logged sets for a workout, when a coach edits that workout's exercises, the system shall preserve all SetLog records with their original values intact.

#### FR-PROG-009: Delete Workout from Program
While a coach is editing a program, when they delete a workout, the system shall remove the Workout template and all associated Exercises via cascade delete.

#### FR-PROG-010: Delete Exercise from Workout
While a coach is editing a workout, when they delete an exercise, the system shall remove the Exercise record.

### Program Archiving

#### FR-ARCH-001: Archive Program
While a coach is viewing a program, when they select "Archive", the system shall set archived=true on the Program record.

#### FR-ARCH-002: Hide Archived Programs
While a coach is viewing their program list, the system shall filter out programs where archived=true by default.

#### FR-ARCH-003: View Archived Programs
While a coach is on the programs screen, when they navigate to the "Archived" tab, the system shall display all programs where archived=true.

#### FR-ARCH-004: Restore Archived Program
While a coach is viewing an archived program, when they click "Restore", the system shall set archived=false and move the program back to the active list.

#### FR-ARCH-005: Unassign on Archive
While a program is archived, when the archive operation completes, the system shall delete all ProgramAssignment records linked to that program.

#### FR-ARCH-006: Delete Athlete Workouts on Archive
While a program is archived, when assignments are deleted, the system shall delete all materialized Workout instances assigned to athletes via cascade.

### Athlete Invitation Flow

#### FR-INV-001: Generate Invite Code
While a coach requests their invite code, when they access the roster or invite screen, the system shall generate or retrieve a 6-character alphanumeric code unique to that coach.

#### FR-INV-002: Display Invite Code
While a coach views their invite code, the system shall display the code prominently with a "Copy" button.

#### FR-INV-003: Signup with Invite Code
While an athlete is signing up, when they enter a valid coach invite code in the optional signup field, the system shall create the User account and link the athlete to the coach via the coach_athlete association table.

#### FR-INV-004: Validate Invite Code
While an athlete enters an invite code, when the code does not match any coach's invite_code, the system shall display an error "Invalid invite code" and prevent signup completion.

#### FR-INV-005: Change Coach via Profile
While an athlete is viewing their profile, when they enter a new valid invite code and submit, the system shall remove the existing coach association and create a new coach_athlete link.

#### FR-INV-006: Reusable Invite Code
The system shall allow a coach's invite code to be used by unlimited athletes without expiration.

### Group & Subgroup Management UI

#### FR-GRP-001: Create Group
While a coach is on the roster screen, when they click "Create Group" and submit a group name, the system shall create a Group record linked to that coach.

#### FR-GRP-002: Edit Group Name
While a coach is viewing a group, when they edit the group name and submit, the system shall update the Group record.

#### FR-GRP-003: Delete Group
While a coach selects a group, when they choose "Delete Group", the system shall delete the Group record and cascade delete all Subgroups and group_members associations.

#### FR-GRP-004: Create Subgroup
While a coach is viewing a group, when they click "Create Subgroup" and submit a subgroup name, the system shall create a Subgroup record linked to that group.

#### FR-GRP-005: Edit Subgroup Name
While a coach is viewing a subgroup, when they edit the subgroup name and submit, the system shall update the Subgroup record.

#### FR-GRP-006: Delete Subgroup
While a coach selects a subgroup, when they choose "Delete Subgroup", the system shall delete the Subgroup record and cascade delete all subgroup_members associations.

#### FR-GRP-007: Add Athletes to Group
While a coach is viewing a group, when they select multiple athletes and click "Add to Group", the system shall create group_members records for each athlete-group pair.

#### FR-GRP-008: Remove Athletes from Group
While a coach is viewing a group's roster, when they select athletes and click "Remove", the system shall delete the corresponding group_members records.

#### FR-GRP-009: Add Athletes to Subgroup
While a coach is viewing a subgroup, when they select athletes from the parent group and click "Add", the system shall create subgroup_members records.

#### FR-GRP-010: Remove Athletes from Subgroup
While a coach is viewing a subgroup's roster, when they select athletes and click "Remove", the system shall delete the corresponding subgroup_members records.

#### FR-GRP-011: Enforce Single Subgroup Constraint
While an athlete is being added to a subgroup, when they already belong to a different subgroup in the same group, the system shall reject the operation with error "Athlete can only belong to one subgroup per group".

#### FR-GRP-012: View Group Roster
While a coach is viewing a group, the system shall display all athletes linked via group_members with their current subgroup badges.

#### FR-GRP-013: Bulk Assign Program to Group
While a coach is assigning a program, when they select a group as the target, the system shall create ProgramAssignment records for all athletes in that group.

#### FR-GRP-014: Bulk Assign Program to Subgroup
While a coach is assigning a program, when they select a subgroup as the target, the system shall create ProgramAssignment records for all athletes in that subgroup.

### Athlete Profile Editing (Lower Priority)

#### FR-PROF-001: Edit Athlete Profile
While an athlete is viewing their profile, when they update their sport, team, or training goals and submit, the system shall update the User record fields.

#### FR-PROF-002: Edit Athlete Maxes
While an athlete is viewing their profile, when they update their max lifts and submit, the system shall update or create AthleteMax records (existing functionality, just needs UI polish).

---

## Non-Functional Requirements

### Performance
- **Response time:** All CRUD operations < 500ms p95 (database local, minimal data volume)
- **Throughput:** Not critical for MVP (single coach with ~50 athletes max)
- **Data volume:** Programs < 100, Workouts < 500, Exercises < 5000 per coach

### Security
- **Authentication:** All endpoints require JWT via `Depends(get_current_user)` or role-specific dependencies
- **Authorization:**
  - Coaches can only edit/delete/archive their own programs (filter by `coach_id`)
  - Coaches can only manage their own groups/athletes
  - Athletes can only edit their own profile
  - Invite codes validated against Coach.invite_code field
- **Data protection:** No PII in invite codes, passwords remain bcrypt-hashed

### Usability (Frontend-Heavy Priority)
- **Clean UX:** Forms should be simple with clear labels, no complex multi-step flows
- **Error feedback:** Inline validation errors where possible, fallback to Alert dialogs
- **Loading states:** Disable buttons during submission, show loading indicators
- **Optimistic updates:** Not required for MVP, use standard React Query invalidation
- **Responsive design:** Mobile-first (React Native), must work on coach's phone/tablet

### Scalability
- **Concurrent users:** MVP assumes 1-10 coaches, no concurrent edit protection needed
- **Peak load:** Not applicable for MVP
- **Data retention:** No automated cleanup, manual delete via archive

---

## Acceptance Criteria

### Program Editing

#### AC-PROG-001: Edit Program Name Successfully
**Given** a coach viewing their program "Fall Training"
**When** they click "Edit", change the name to "Fall Strength", and save
**Then** the program list displays "Fall Strength"
**And** the Program record name is updated in the database
**And** a success message "Program updated" is shown

#### AC-PROG-002: Edit Workout Details
**Given** a coach editing a program with workout "Day 1 - Squat"
**When** they change the workout name to "Day 1 - Lower Body" and day offset from 0 to 1
**Then** the workout template is updated
**And** future materialized workouts for assigned athletes reflect "Day 1 - Lower Body"
**And** past/completed workouts retain original names

#### AC-PROG-003: Edit Exercise Parameters
**Given** a coach editing an exercise "Squat 3x5 @ 70%"
**When** they change reps to 8 and percentage to 75%
**Then** the exercise template is updated
**And** future workouts show "Squat 3x8 @ 75%"
**And** historical SetLog records remain unchanged

#### AC-PROG-004: Delete Workout from Program
**Given** a coach editing a program with 4 workouts
**When** they delete workout "Day 3 - Rest"
**Then** the program has 3 workouts
**And** all exercises in "Day 3 - Rest" are cascade deleted
**And** future athlete assignments do not include the deleted workout

#### AC-PROG-005: Reorder Workouts
**Given** a coach editing a program with workouts in order [Day 1, Day 2, Day 3]
**When** they drag "Day 3" to first position
**Then** the order becomes [Day 3, Day 1, Day 2]
**And** day_offset fields are recalculated [0, 1, 2]

#### AC-PROG-006: Cannot Edit Non-Owned Program
**Given** a coach trying to access edit endpoint for another coach's program
**When** they submit the request
**Then** they receive 404 Not Found (program filtered by coach_id)
**And** no changes are made

### Program Archiving

#### AC-ARCH-001: Archive Program Successfully
**Given** a coach viewing program "Old Program" assigned to 5 athletes
**When** they click "Archive" and confirm
**Then** the program disappears from the active list
**And** archived=true in the database
**And** all 5 ProgramAssignment records are deleted
**And** all materialized Workout instances for those athletes are deleted

#### AC-ARCH-002: View Archived Programs
**Given** a coach with 2 archived programs
**When** they navigate to the "Archived" tab
**Then** both archived programs are displayed
**And** each shows "Restore" button

#### AC-ARCH-003: Restore Archived Program
**Given** a coach viewing archived program "Old Program"
**When** they click "Restore"
**Then** the program appears in the active list
**And** archived=false in the database
**And** no assignments are recreated (coach must reassign manually)

#### AC-ARCH-004: Archived Programs Not Assignable
**Given** a coach trying to assign an archived program
**When** they view the program list in assignment modal
**Then** archived programs do not appear in the selection list

### Athlete Invitation Flow

#### AC-INV-001: Generate Invite Code
**Given** a new coach with no invite code
**When** they access the roster screen
**Then** a 6-character alphanumeric code is generated and displayed
**And** the code is saved to Coach.invite_code field

#### AC-INV-002: Display Existing Invite Code
**Given** a coach with invite code "ABC123"
**When** they view the roster screen
**Then** the code "ABC123" is displayed prominently
**And** a "Copy to Clipboard" button is available

#### AC-INV-003: Athlete Signup with Valid Code
**Given** an athlete signing up with invite code "ABC123"
**When** they complete signup and the code matches a coach
**Then** their User account is created
**And** a coach_athlete association is created
**And** they are logged in and see their dashboard

#### AC-INV-004: Athlete Signup with Invalid Code
**Given** an athlete entering invite code "XXXXXX" that doesn't exist
**When** they attempt to complete signup
**Then** an error "Invalid invite code" is displayed
**And** signup is not completed

#### AC-INV-005: Athlete Signup without Invite Code
**Given** an athlete signing up with the invite code field left blank
**When** they complete signup
**Then** their account is created without a coach association
**And** they can add a coach later via profile

#### AC-INV-006: Change Coach via Profile
**Given** an athlete currently linked to Coach A
**When** they enter Coach B's invite code in their profile and save
**Then** the coach_athlete link to Coach A is deleted
**And** a new coach_athlete link to Coach B is created
**And** all previous program assignments from Coach A are deleted

#### AC-INV-007: Reusable Invite Code
**Given** 10 athletes using the same invite code "ABC123"
**When** all 10 sign up
**Then** all 10 are successfully linked to the coach
**And** the code remains valid for future athletes

### Group & Subgroup Management

#### AC-GRP-001: Create Group
**Given** a coach on the roster screen
**When** they click "Create Group", enter "Varsity", and save
**Then** a new group "Varsity" appears in their group list
**And** the group has 0 athletes

#### AC-GRP-002: Edit Group Name
**Given** a coach viewing group "Varsity"
**When** they edit the name to "Varsity Squad" and save
**Then** the group name is updated in the UI and database

#### AC-GRP-003: Delete Group with Subgroups
**Given** a coach with group "Varsity" containing subgroup "Offense"
**When** they delete "Varsity" and confirm
**Then** both "Varsity" and "Offense" are deleted
**And** all athlete associations are removed
**And** no orphaned subgroup remains

#### AC-GRP-004: Create Subgroup
**Given** a coach viewing group "Varsity"
**When** they click "Create Subgroup", enter "Defense", and save
**Then** subgroup "Defense" appears under "Varsity"

#### AC-GRP-005: Add Athletes to Group
**Given** a coach with 5 athletes not in any group
**When** they select 3 athletes and click "Add to Varsity"
**Then** 3 group_members records are created
**And** the athletes appear in "Varsity" roster

#### AC-GRP-006: Add Athlete to Subgroup
**Given** a coach with athlete "John" in group "Varsity"
**When** they add "John" to subgroup "Defense"
**Then** a subgroup_members record is created
**And** "John" shows "Defense" badge in roster

#### AC-GRP-007: Reject Multiple Subgroup Assignment
**Given** athlete "John" already in subgroup "Defense" under "Varsity"
**When** coach tries to add "John" to subgroup "Offense" under same "Varsity" group
**Then** an error "Athlete can only belong to one subgroup per group" is displayed
**And** no subgroup_members record is created

#### AC-GRP-008: Remove Athlete from Group
**Given** athlete "John" in group "Varsity" and subgroup "Defense"
**When** coach removes "John" from "Varsity"
**Then** both group_members and subgroup_members records are deleted
**And** "John" no longer appears in "Varsity" or "Defense" rosters

#### AC-GRP-009: Bulk Assign Program to Group
**Given** group "Varsity" with 10 athletes
**When** coach assigns program "Fall Training" to "Varsity"
**Then** 10 ProgramAssignment records are created
**And** all 10 athletes see "Fall Training" workouts on their calendars

#### AC-GRP-010: View Group Roster with Subgroups
**Given** group "Varsity" with athletes in subgroups "Offense" and "Defense"
**When** coach views "Varsity" roster
**Then** all athletes are listed with their subgroup badges
**And** athletes not in subgroups show no badge

### Athlete Profile Editing

#### AC-PROF-001: Edit Profile Fields
**Given** an athlete viewing their profile
**When** they change sport from "Football" to "Basketball" and save
**Then** the User record is updated
**And** a success message is shown

#### AC-PROF-002: Edit Max Lifts
**Given** an athlete viewing their profile
**When** they update Squat max from 200 to 225 and save
**Then** the AthleteMax record is updated
**And** future workouts calculate percentages from 225

---

## Error Handling

| Error Condition | HTTP Code | User Message |
|-----------------|-----------|--------------|
| Program not found or not owned | 404 | "Program not found" |
| Workout not found or not owned | 404 | "Workout not found" |
| Group not found or not owned | 404 | "Group not found" |
| Athlete not coached by user | 404 | "Athlete not found" |
| Invalid invite code | 400 | "Invalid invite code. Please check and try again." |
| Empty program name | 400 | "Program name is required" |
| Empty group/subgroup name | 400 | "Name is required" |
| Athlete already in different subgroup | 409 | "Athlete can only belong to one subgroup per group" |
| Unauthorized access (non-coach) | 403 | "Only coaches can access this resource" |
| Invalid JWT token | 401 | "Session expired. Please log in again." |
| Database constraint violation | 500 | "An error occurred. Please try again." |

---

## Implementation TODO

### Phase 1: Backend (Priority Endpoints Only)

#### Database Migrations
- [ ] Add `archived: Boolean` field to Program model (default=False)
- [ ] Add `invite_code: String(6)` field to User model (nullable, unique where user_type=COACH)
- [ ] Create Alembic migration: `uv run alembic revision --autogenerate -m "add archived and invite_code"`
- [ ] Apply migration: `uv run alembic upgrade head`

#### Program Editing Endpoints
- [ ] `PUT /api/programs/{id}` - Update program name/description (return full ProgramResponse)
- [ ] `PUT /api/programs/workouts/{workout_id}` - Update workout name/day_offset
- [ ] `PUT /api/programs/exercises/{exercise_id}` - Update exercise details
- [ ] `DELETE /api/programs/workouts/{workout_id}` - Delete workout (cascade exercises)
- [ ] `DELETE /api/programs/exercises/{exercise_id}` - Delete exercise
- [ ] Add helper function: `update_future_materialized_workouts(program_id, changes)` to sync edits to athlete workouts

#### Program Archiving Endpoints
- [ ] `POST /api/programs/{id}/archive` - Set archived=true, delete assignments/workouts
- [ ] `POST /api/programs/{id}/restore` - Set archived=false
- [ ] Update `GET /api/programs` to filter archived=false by default, add `?include_archived=true` query param
- [ ] `GET /api/programs/archived` - List archived programs only

#### Invitation Endpoints
- [ ] `GET /api/coaches/invite-code` - Generate or retrieve coach's invite code (6-char alphanumeric)
- [ ] Update `POST /api/auth/signup` - Add optional `invite_code` field to SignupRequest schema
- [ ] Add validation logic: If invite_code provided, query User where user_type=COACH and invite_code=value, create coach_athlete link
- [ ] `PUT /api/athletes/coach` - Change coach (delete old coach_athlete, create new one, delete old assignments)

#### Group Management Endpoints
- [ ] `PUT /api/coaches/groups/{id}` - Update group name (return GroupResponse)
- [ ] `DELETE /api/coaches/groups/{id}` - Delete group (cascade subgroups/members)
- [ ] `PUT /api/coaches/subgroups/{id}` - Update subgroup name
- [ ] `DELETE /api/coaches/subgroups/{id}` - Delete subgroup (cascade members)
- [ ] `POST /api/coaches/groups/{id}/members` - Add athletes to group (body: {athlete_ids: [int]})
- [ ] `DELETE /api/coaches/groups/{id}/members` - Remove athletes from group (body: {athlete_ids: [int]})
- [ ] `POST /api/coaches/subgroups/{id}/members` - Add athletes to subgroup (validate single subgroup constraint)
- [ ] `DELETE /api/coaches/subgroups/{id}/members` - Remove athletes from subgroup

#### Athlete Profile Endpoints
- [ ] `PUT /api/athletes/profile` - Update sport/team/training_goals (return UserResponse)
- [ ] Verify `PUT /api/athletes/maxes` returns updated AthleteMax objects (currently returns message dict)

#### Pydantic Schemas
- [ ] Create `ProgramUpdate(BaseModel)` - name, description (all optional)
- [ ] Create `WorkoutUpdate(BaseModel)` - name, day_offset (all optional)
- [ ] Create `ExerciseUpdate(BaseModel)` - name, sets, reps, percentage, rest_seconds (all optional)
- [ ] Create `GroupUpdate(BaseModel)` - name
- [ ] Create `SubgroupUpdate(BaseModel)` - name
- [ ] Create `GroupMembersRequest(BaseModel)` - athlete_ids: List[int]
- [ ] Create `AthleteProfileUpdate(BaseModel)` - sport, team, training_goals (all optional)
- [ ] Update `SignupRequest` - add `invite_code: Optional[str]`

### Phase 2: Frontend (Polish Existing, Add Minimal New Screens)

#### Program Editing UI
- [ ] Add "Edit" button to each program card in `/src/screens/coach/DashboardScreen.tsx` (Programs tab)
- [ ] Create `/src/screens/coach/ProgramEditScreen.tsx` - reuse ProgramBuilderScreen structure but pre-populate from API
- [ ] In ProgramEditScreen: Fetch program details via `programsApi.get(id)`, populate useState with existing data
- [ ] Add "Delete Workout" button (trash icon) to each workout card with confirmation Alert
- [ ] Add "Delete Exercise" button to each exercise row with confirmation Alert
- [ ] Implement drag-to-reorder for workouts (react-native-draggable-flatlist or manual)
- [ ] Implement drag-to-reorder for exercises within workout
- [ ] On save, call `PUT /api/programs/{id}`, `PUT /workouts/{id}`, `PUT /exercises/{id}` as needed
- [ ] Show loading indicator during save, disable save button to prevent double-submit
- [ ] Invalidate `['programs']` and `['programs', id]` queries on success

#### Program Archiving UI
- [ ] Add "Archive" button (archive icon) to program detail view with confirmation Alert: "Archive this program? Athletes will lose access to workouts."
- [ ] On confirm, call `POST /api/programs/{id}/archive`, invalidate queries, navigate back
- [ ] Add "Archived" tab to Programs section in DashboardScreen
- [ ] In Archived tab, fetch archived programs via `programsApi.listArchived()`, display list
- [ ] Add "Restore" button to archived program cards, call `POST /api/programs/{id}/restore`
- [ ] On restore, invalidate queries and show in active list

#### Invitation Flow UI
- [ ] In `/src/screens/coach/DashboardScreen.tsx` (Roster tab), add "Invite Code" card at top
- [ ] Fetch coach invite code via `coachesApi.getInviteCode()`, display in large text
- [ ] Add "Copy" button next to code using `Clipboard.setString()` with toast "Code copied!"
- [ ] In `/src/screens/auth/SignupScreen.tsx`, add optional TextInput for "Coach Invite Code (Optional)"
- [ ] Pass invite_code to signup API if provided
- [ ] In `/src/screens/athlete/HomeScreen.tsx` (Profile tab), add "Change Coach" button
- [ ] Create modal/inline form with TextInput for new invite code
- [ ] On submit, call `athletesApi.changeCoach({invite_code})`, show success/error Alert

#### Group Management UI
- [ ] Create `/src/screens/coach/GroupManagementScreen.tsx` - new screen accessible from Roster tab
- [ ] Add "Manage Groups" button in Roster tab header, navigate to GroupManagementScreen
- [ ] In GroupManagementScreen: Fetch groups via `coachesApi.listGroups()`, display as expandable list
- [ ] Each group shows: Name, athlete count, expand/collapse arrow
- [ ] Expanded group shows: List of athletes (with subgroup badges), list of subgroups
- [ ] Add "Create Group" button (floating action button or header), show modal with TextInput for name
- [ ] Add "Edit" icon next to group name, show modal to edit name
- [ ] Add "Delete" icon next to group, show confirmation Alert with warning about subgroup cascade
- [ ] For each group: Add "Create Subgroup" button, show modal with TextInput
- [ ] For each subgroup: Add "Edit" and "Delete" icons
- [ ] Add "Add Athletes" button for group: Show multi-select modal with all rostered athletes, call `POST /groups/{id}/members`
- [ ] Add "Add Athletes" button for subgroup: Show multi-select modal with group members only, call `POST /subgroups/{id}/members`
- [ ] For each athlete in group/subgroup roster: Add "Remove" icon (X), call `DELETE /groups/{id}/members` or `DELETE /subgroups/{id}/members`
- [ ] Handle error "Athlete can only belong to one subgroup" with Alert dialog
- [ ] Add loading states for all operations (button disabled, spinner)

#### Athlete Profile Editing UI
- [ ] In `/src/screens/athlete/HomeScreen.tsx` (Profile tab), add "Edit Profile" button
- [ ] Show inline form or modal with editable TextInputs for sport, team, training goals
- [ ] On save, call `athletesApi.updateProfile(data)`, show success/error Alert
- [ ] For maxes: Verify existing "Edit" functionality works, add loading/success feedback if missing

#### API Client Updates
- [ ] In `/src/api/endpoints.ts`, add:
  - `programsApi.update(id, data)` → `PUT /api/programs/{id}`
  - `programsApi.updateWorkout(id, data)` → `PUT /api/programs/workouts/{id}`
  - `programsApi.updateExercise(id, data)` → `PUT /api/programs/exercises/{id}`
  - `programsApi.deleteWorkout(id)` → `DELETE /api/programs/workouts/{id}`
  - `programsApi.deleteExercise(id)` → `DELETE /api/programs/exercises/{id}`
  - `programsApi.archive(id)` → `POST /api/programs/{id}/archive`
  - `programsApi.restore(id)` → `POST /api/programs/{id}/restore`
  - `programsApi.listArchived()` → `GET /api/programs/archived`
  - `coachesApi.getInviteCode()` → `GET /api/coaches/invite-code`
  - `coachesApi.listGroups()` → `GET /api/coaches/groups` (if not exists)
  - `coachesApi.updateGroup(id, data)` → `PUT /api/coaches/groups/{id}`
  - `coachesApi.deleteGroup(id)` → `DELETE /api/coaches/groups/{id}`
  - `coachesApi.updateSubgroup(id, data)` → `PUT /api/coaches/subgroups/{id}`
  - `coachesApi.deleteSubgroup(id)` → `DELETE /api/coaches/subgroups/{id}`
  - `coachesApi.addGroupMembers(id, athlete_ids)` → `POST /api/coaches/groups/{id}/members`
  - `coachesApi.removeGroupMembers(id, athlete_ids)` → `DELETE /api/coaches/groups/{id}/members`
  - `coachesApi.addSubgroupMembers(id, athlete_ids)` → `POST /api/coaches/subgroups/{id}/members`
  - `coachesApi.removeSubgroupMembers(id, athlete_ids)` → `DELETE /api/coaches/subgroups/{id}/members`
  - `athletesApi.updateProfile(data)` → `PUT /api/athletes/profile`
  - `athletesApi.changeCoach(data)` → `PUT /api/athletes/coach`

### Phase 3: Testing (Minimal for MVP)

#### Backend Tests
- [ ] Test `PUT /api/programs/{id}` with valid/invalid coach ownership
- [ ] Test program archive deletes assignments and workouts
- [ ] Test invite code validation (valid/invalid/empty)
- [ ] Test subgroup constraint enforcement (reject duplicate subgroup)

#### Manual Frontend Testing
- [ ] Test full program edit flow (edit name, workout, exercise, delete, reorder)
- [ ] Test archive → restore flow
- [ ] Test athlete signup with invite code → verify coach link
- [ ] Test athlete change coach → verify old assignments deleted
- [ ] Test create group → add athletes → create subgroup → add athletes
- [ ] Test delete group cascades subgroups
- [ ] Test subgroup constraint error displays correctly

### Phase 4: Deployment (MVP Launch)

- [ ] Run all migrations on production database
- [ ] Deploy backend to production environment
- [ ] Build and deploy frontend to TestFlight/Google Play beta
- [ ] Smoke test: Create coach account, generate invite code, signup athlete with code, create program, edit program, archive program

---

## Out of Scope (Explicitly Deferred)

- **Soft deletes with recovery** - Using archive pattern instead, hard deletes for groups/workouts
- **Optimistic locking** - Accepting last-write-wins for MVP
- **Program templates library** - No built-in programs (5/3/1, GZCLP) in this spec
- **Exercise library** - No reusable exercise templates yet
- **Workout history view for athletes** - Existing but not polished in this spec
- **Push notifications** - No alerts for new assignments
- **Rate limiting** - No API rate limits for MVP
- **Advanced validation** - No range checks (sets > 0), string length limits beyond basic Pydantic
- **Batch operations** - No bulk delete/archive programs
- **Audit logs** - No tracking of who edited what when
- **Program versioning** - No history of program changes over time
- **Undo/redo** - No rollback of edits
- **Search/filter** - No search in programs or roster (can add later)
- **Drag-drop for group assignment** - Using multi-select modals instead

---

## Open Questions

None - all requirements validated during interview phase.

---

## Success Metrics (Post-Launch)

- Coach can create, edit, and archive a program in < 5 minutes
- Athlete signup with invite code has 100% success rate (no invalid code friction)
- Zero critical bugs related to cascade deletes or orphaned data
- 10 beta coaches onboard and use all CRUD features within 1 week

---

**Specification Complete** ✅
Generated via Feature Forge | 1-week MVP timeline | Frontend-heavy | Minimal backend additions
