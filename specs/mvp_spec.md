**Freeweight**

MVP Product Specification

Version 1.0 · March 2026

**1. Product Overview**

Freeweight is a strength programming platform that connects coaches and
athletes, replacing spreadsheets, PDFs, and manual percentage
calculations with a seamless, mobile-first experience. The core design
principle is radical simplicity for the athlete during their workout,
with a powerful web-based interface for coaches to build and manage
programs.

Freeweight serves two distinct user types:

-   Athletes: primarily on mobile, logging workouts in the gym with
    minimal friction

-   Coaches: primarily on web, building programs and monitoring athlete
    progress

*Future consideration: A social layer allowing athletes to share lifts,
view teammate PRs, and connect with friends. The data model should
support public/private visibility on lift logs from day one so this can
be added without a rebuild.*

**2. Platform**

-   Mobile app (iOS & Android) --- primary experience for athletes

-   Web app --- primary experience for coaches; also available to
    athletes

**3. User Types & Onboarding**

When a user opens the app for the first time, they choose: Athlete or
Coach. This selection determines their onboarding path and the
experience they receive throughout the app.

**3.1 Athlete Onboarding**

-   Name and profile photo

-   Sport and team

-   Training goals / focus area

-   Current maxes (e.g. squat, deadlift, bench press)

-   Connect to coach via invite link (optional --- athletes without a
    coach can self-program)

If an athlete does not have a recorded max for a lift when a workout
begins, the app prompts them to enter it before starting the session.

**3.2 Coach Onboarding**

-   Name and profile photo

-   Sport and team

-   Coaching credentials and bio

-   Set up groups and subgroups

-   Generate and send invite links to athletes

**3.3 Athlete--Coach Connection**

Coaches send a direct invite link to athletes. Tapping the link connects
the athlete to the coach\'s roster and places them in the correct group
or subgroup automatically --- no code entry or manual search required.

**4. Athlete Experience**

**4.1 Home --- Calendar View**

The athlete home screen is a calendar showing their full program as far
out as the coach has scheduled. Key behaviors:

-   Today\'s session is prominently highlighted

-   Rest days are visible on the calendar

-   Athletes can see all future programmed sessions

-   Athletes who self-program can add their own sessions to the calendar

**4.2 Workout Notification**

Athletes receive a daily push notification reminding them of their
scheduled session. Tapping it opens the app directly to today\'s
workout.

**4.3 In-Workout Flow**

The in-workout interface is designed to require as few taps as possible.
The athlete steps through exercises one at a time.

**Session overview (pre-start)**

Before starting, the athlete sees all exercises for the session with
weights automatically calculated from their maxes using coach-set
percentages.

**Per-exercise view**

-   Exercise name

-   Calculated weight (max × percentage, auto-calculated)

-   Sets and reps

-   Embedded video demo

-   Coach notes for that exercise

**Set logging**

After each set, the athlete logs:

-   Actual weight used (primary)

-   Reps completed (primary)

-   RPE / effort rating (secondary)

-   Notes or comments (secondary)

-   Video of the lift (secondary)

*Weight used and reps completed are the most critical data points. RPE,
notes, and video are important but should not interrupt or slow down the
workout flow.*

**4.4 Workout Modifications**

Athletes can modify their workout in the moment --- swapping exercises,
skipping sets, or adjusting weights. All modifications are recorded and
visible to the coach after the session. Athletes can also add an injury
flag or note directly on the workout log without leaving the app.

**4.5 Post-Workout & Max Updates**

After completing a session, the app marks it done and may prompt the
athlete to update a max if the session included a relevant lift. Maxes
can be updated three ways:

-   Athlete updates manually after a PR

-   Coach updates on the athlete\'s behalf

-   App prompts the athlete after a relevant session

**4.6 Self-Programming**

Athletes without a coach, or those who want to add sessions alongside
their programmed work, can build their own workouts and schedule them on
the calendar.

**4.7 Athlete Progress View**

-   Strength progress over time --- per-lift max charts

-   Workout completion rate

**5. Coach Experience**

The coach experience is optimized for web, though all features are
available on mobile. The interface prioritizes roster management,
program building, and athlete monitoring.

**5.1 Coach Dashboard**

The coach home view shows at a glance:

-   Who has completed today\'s workout

-   Athletes with active injury flags or notes

-   Upcoming sessions scheduled this week

**5.2 Roster --- Groups & Subgroups**

Coaches can manage multiple teams with a nested group structure:

-   A coach creates one or more Groups (e.g. Men\'s Rowing, Women\'s
    Rowing)

-   Within each group, the coach creates Subgroups (e.g. Hypertrophy,
    Strength, Mobility)

-   Athletes are assigned to a group and optionally a subgroup

-   Workouts can be assigned to individuals, entire groups, or specific
    subgroups

*Example: A strength coach managing 3 rowing teams, each with athletes
on hypertrophy, strength-focused, and mobility plans. Subgroups allow
different programming within the same team.*

**5.3 Program Building**

Each exercise in a session can include:

-   Exercise name

-   Sets and reps

-   Percentage of max (app auto-calculates weight per athlete from their
    recorded max)

-   Embedded video demo

-   Coach notes per exercise

Workouts are scheduled on specific dates and assigned to an individual,
group, or subgroup. Rest days are explicitly marked. Coaches can program
as far in advance as they wish.

**5.4 Monitoring Completed Workouts**

-   Actual weights logged vs. prescribed weights

-   Reps completed per set

-   RPE ratings and notes

-   Lift videos uploaded by the athlete

-   Any in-session modifications the athlete made

**5.5 Injury Flags & Athlete Notes**

When an athlete flags an injury or adds a note on their workout log, it
surfaces on the coach\'s dashboard. The coach can view, acknowledge, and
adapt future programming accordingly.

**5.6 Athlete Progress**

-   Strength progress over time --- max charts per lift

-   Workout completion rate

Coaches can manually update an athlete\'s maxes at any time.

**6. Maxes & Weight Calculation**

The core mechanic of Freeweight\'s value proposition: coaches set
percentages, the app calculates actual weights per athlete from their
recorded maxes --- eliminating manual calculation during workouts.

-   Coach sets: 80% of squat max for 4 sets of 3

-   App reads: athlete\'s recorded squat max

-   App displays: calculated weight, automatically

If a max is missing when a session starts, the athlete is prompted to
enter it before beginning.

**7. Notifications**

MVP notification scope is intentionally narrow:

-   Daily workout reminder --- athletes receive a push notification on
    days they have a scheduled session

*Future: coach alerts when an athlete logs, injury flag notifications,
PR congratulations.*

**8. Out of Scope for MVP**

The following are not part of the MVP but are noted to ensure
architecture does not close off these capabilities:

-   Social features --- sharing lifts, PRs feed, friends list, team
    activity feed

-   Taper mode and deload week templates

-   Wearable / biometric data integration

-   In-app messaging between athlete and coach

-   Automated coach alerts on session completion

**9. Design Principles**

-   Minimal taps in the gym --- athletes should never fight the app
    mid-workout

-   Auto-calculate everything --- no athlete should do math in their
    head

-   Visibility without friction --- coaches see what they need without
    drilling through menus

-   Separate complexity --- powerful tools live on the coach side;
    athlete side stays simple

-   Don\'t close doors --- build with the social layer in mind before
    it\'s built