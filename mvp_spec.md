# Freeweight — MVP Product Specification

---

## 1. Overview

Freeweight is a strength training platform connecting coaches and athletes. The MVP focuses on two core experiences: a coach-side program builder and athlete management tool, and an athlete-side guided workout experience. The app will be available on mobile (iOS/Android) and web. Athletes will primarily use mobile in the gym; coaches will primarily use the web interface to manage their rosters and programs.

---

## 2. User Types

There are two user types in Freeweight:

- **Athlete** — Follows a coach-assigned or self-programmed training plan. Views their calendar, logs workouts, and tracks progress.
- **Coach** — Builds and assigns training programs to individuals, groups, and subgroups. Monitors athlete activity, completion, and flags.

Upon first opening the app, users are prompted to select their user type before completing onboarding. This selection determines the experience they receive throughout the app.

---

## 3. Onboarding

### 3.1 Athlete Onboarding

Collected during first-time setup:

- Name & profile photo
- Sport / team
- Training goals or focus area
- Current maxes (e.g. squat, deadlift, bench, clean)

If an athlete does not have a recorded max for a given lift, the app will prompt them to enter it before their first workout where that lift appears.

### 3.2 Coach Onboarding

Collected during first-time setup:

- Name & profile photo
- Sport / team(s) they coach
- Coaching credentials / bio
- Groups they manage (can be set up during or after onboarding)

---

## 4. Coach–Athlete Connection

Coaches invite athletes to their roster by sending a direct invite link. The athlete clicks the link, which opens the app (or prompts them to download it), and they are automatically connected to that coach's roster upon completing onboarding or logging in.

---

## 5. Groups & Subgroups

Coaches can organize athletes into groups and subgroups to streamline program assignment.

- A coach may manage multiple teams (e.g. three rowing teams)
- Within each team, subgroups can be created for athletes on different training focuses (e.g. hypertrophy, strength, mobility)
- Programs can be assigned at the individual, group, or subgroup level
- An athlete can belong to one group and one subgroup

---

## 6. Coach Experience

### 6.1 Coach Dashboard

The coach's home screen provides a quick overview of:

- Which athletes have completed their workout today
- Athletes with flagged injuries or notes
- Upcoming workouts scheduled this week

### 6.2 Roster Management

Coaches can view their full roster, organized by group and subgroup. From here, coaches can:

- View individual athlete profiles and history
- See flagged notes or injury reports on any athlete
- Send invite links to new athletes

### 6.3 Program Builder

Coaches build programs and assign them to individuals, groups, or subgroups. Program structure:

- Programs are made up of individual workout sessions placed on specific calendar dates
- Each workout contains one or more exercises
- Each exercise includes:
  - Exercise name
  - Sets, reps, and percentage of max (e.g. 4x3 @ 80%)
  - Embedded video demonstration
  - Coach notes for that specific exercise
- Percentages are used to auto-calculate weights based on the athlete's recorded maxes

### 6.4 Viewing Athlete Data

Coaches can tap into any athlete's profile to view:

- Workout completion history
- Actual weights used and reps completed per session
- RPE and effort ratings logged
- Notes or flags submitted by the athlete
- Any in-workout modifications the athlete made (with what was changed clearly indicated)
- Strength progress over time (max charts)

---

## 7. Athlete Experience

### 7.1 Athlete Home & Calendar

The athlete's home screen surfaces their plan for today as the primary element — one clear, prominent card showing what is scheduled. Below that, a calendar view shows all programmed sessions as far out as the coach has planned, including rest days.

- Scheduled workout days are visually distinguished from rest days
- Athletes can scroll forward to see upcoming sessions
- Past sessions are marked as completed or missed

### 7.2 Self-Programming

Athletes who do not have a coach, or who wish to add their own sessions, can create their own workouts. Self-programmed workouts appear on the calendar alongside coach-assigned ones. The same workout logging experience applies.

### 7.3 Workout View

When an athlete taps their workout for the day, they are taken into guided workout mode. This experience is designed to be as simple and low-friction as possible — big buttons, minimal taps, fast to respond.

The workout walks the athlete through each exercise sequentially:

- Exercise name is displayed prominently
- Sets and reps are shown (e.g. "4 sets × 3 reps")
- Target weight is auto-calculated from the athlete's recorded max and the coach's prescribed percentage (e.g. "80% of your squat max = 185 lbs")
- Video demo is accessible without leaving the screen
- Coach notes for that exercise are visible

For each set, the athlete logs:

- Weight used
- Reps completed
- The app advances to the next set / exercise with a single tap

After completing all sets for an exercise, the athlete can optionally add:

- RPE / effort rating
- Notes or comments
- Video of their lift

### 7.4 In-Workout Modifications

Athletes can modify their workout on the fly (e.g. swap an exercise, skip a set, adjust weight). Any changes made are flagged and visible to the coach in the athlete's workout log, so the coach has full visibility into what was actually completed versus what was prescribed.

### 7.5 Injury & Notes Flagging

Athletes can attach a note or flag to any workout or exercise. These flags surface directly on the coach's dashboard and athlete profile. This replaces the need for athletes to communicate issues through outside channels.

### 7.6 Max Updates

An athlete's maxes can be updated in three ways:

- The athlete manually updates a max at any time
- The coach updates it on the athlete's behalf
- The app prompts the athlete to update a max after a workout where that lift was performed (triggered when it's likely a max has changed)

---

## 8. Notifications

Notifications in the MVP are limited to athletes only:

- **Daily workout reminder** — Athletes receive a notification on days they have a scheduled workout, reminding them to complete it

---

## 9. Progress & History

### Athlete Profile

Each athlete has a profile visible to both themselves and their coach, showing:

- Strength progress over time (max charts per lift)
- Workout completion rate

---

## 10. Future Considerations

The following features are out of scope for the MVP but should be kept in mind during architecture and design decisions to avoid closing off these capabilities:

- **Social / sharing layer** — Athletes will eventually be able to share lifts, PRs, and workout activity with friends or teammates. Data models and privacy settings should be designed with this in mind.
- **Taper Mode** — Adjusted programming logic for competition taper periods
- **Injury Mode** — Modified programming when an athlete is managing an injury
- **Coach notifications** — Alerts when athletes log, flag injuries, or make modifications
- **Wearable / data integration** — Connecting RPE and performance data from external devices

---

*Last updated: March 2026*