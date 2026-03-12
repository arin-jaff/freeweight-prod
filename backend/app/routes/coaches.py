from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel
from ..database import get_db
from ..auth import get_current_coach
from ..models import User, Group, Subgroup, WorkoutLog, AthleteMax, Workout
from ..schemas.coach import (
    DashboardResponse,
    RosterResponse,
    InviteLinkResponse,
    FlaggedAthlete,
    AthleteWithGroups,
    AthleteStatus,
    AthleteStatusListResponse,
    GroupBasic,
    SubgroupBasic
)
from ..schemas.group import GroupCreate, SubgroupCreate
from ..config import settings

router = APIRouter(prefix="/api/coaches", tags=["coaches"])

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    current_coach: User = Depends(get_current_coach),
    db: Session = Depends(get_db)
):
    # Hardcoded values for MVP
    completed_today = 6

    flagged = db.query(WorkoutLog).join(User).filter(
        User.id.in_([a.id for a in current_coach.coached_athletes]),
        WorkoutLog.is_flagged == True
    ).order_by(WorkoutLog.created_at.desc()).limit(3).all()  # Limit to 3 flagged workouts

    flagged_athletes = []
    seen_athlete_ids = set()
    for log in flagged:
        if log.athlete_id not in seen_athlete_ids:
            # Get the workout name for this flagged log
            workout = db.query(Workout).filter(Workout.id == log.workout_id).first()
            workout_name = workout.name if workout else "Unknown Workout"

            flagged_athletes.append(FlaggedAthlete(
                id=log.athlete.id,
                name=log.athlete.name,
                workout_name=workout_name,
                flag_reason=log.flag_reason or "No reason provided",
                flagged_at=log.created_at
            ))
            seen_athlete_ids.add(log.athlete_id)

    return DashboardResponse(
        completed_today=completed_today,
        completed_workouts_today=completed_today,  # Backwards compatibility
        flagged_workouts=len(flagged_athletes),
        flagged_athletes=flagged_athletes,
        total_athletes=len(current_coach.coached_athletes)
    )

@router.get("/roster", response_model=RosterResponse)
def get_roster(
    current_coach: User = Depends(get_current_coach),
    db: Session = Depends(get_db)
):
    athletes_with_groups = []
    for athlete in current_coach.coached_athletes:
        athletes_with_groups.append(AthleteWithGroups(
            id=athlete.id,
            name=athlete.name,
            email=athlete.email,
            profile_photo_url=athlete.profile_photo_url,
            sport=athlete.sport,
            team=athlete.team,
            groups=[GroupBasic(id=g.id, name=g.name) for g in athlete.groups],
            subgroups=[SubgroupBasic(id=s.id, name=s.name, training_focus=s.training_focus) for s in athlete.subgroups]
        ))

    return RosterResponse(athletes=athletes_with_groups)

@router.get("/invite-code")
def get_invite_code(
    current_coach: User = Depends(get_current_coach)
):
    return {"invite_code": current_coach.invite_code}

@router.get("/athlete-statuses", response_model=AthleteStatusListResponse)
def get_athlete_statuses(
    current_coach: User = Depends(get_current_coach),
    db: Session = Depends(get_db)
):
    """Get quick-view status for all athletes on the coach's roster."""
    week_ago = datetime.utcnow() - timedelta(days=7)
    three_days_ago = datetime.utcnow() - timedelta(days=3)

    statuses = []
    for athlete in current_coach.coached_athletes:
        # Get most recent completed workout log
        last_log = db.query(WorkoutLog).filter(
            WorkoutLog.athlete_id == athlete.id,
            WorkoutLog.is_completed == True
        ).order_by(WorkoutLog.created_at.desc()).first()

        # Count workouts this week
        week_logs = db.query(WorkoutLog).filter(
            WorkoutLog.athlete_id == athlete.id,
            WorkoutLog.is_completed == True,
            WorkoutLog.created_at >= week_ago
        ).count()

        # Check for flagged workouts
        has_flagged = db.query(WorkoutLog).filter(
            WorkoutLog.athlete_id == athlete.id,
            WorkoutLog.is_flagged == True
        ).first() is not None

        # Determine status
        if has_flagged:
            status = "flagged"
        elif last_log is None:
            status = "new"
        elif last_log.created_at >= three_days_ago:
            status = "active"
        else:
            status = "idle"

        # Get workout name for last log
        last_workout_name = None
        last_workout_date = None
        if last_log:
            workout = db.query(Workout).filter(Workout.id == last_log.workout_id).first()
            last_workout_name = workout.name if workout else "Unknown"
            last_workout_date = last_log.created_at

        statuses.append(AthleteStatus(
            id=athlete.id,
            name=athlete.name,
            profile_photo_url=athlete.profile_photo_url,
            sport=athlete.sport,
            status=status,
            last_workout_name=last_workout_name,
            last_workout_date=last_workout_date,
            workouts_this_week=week_logs,
            has_flagged=has_flagged,
        ))

    # Sort: flagged first, then active, then idle, then new
    status_order = {"flagged": 0, "active": 1, "idle": 2, "new": 3}
    statuses.sort(key=lambda s: status_order.get(s.status, 4))

    return AthleteStatusListResponse(athletes=statuses)

@router.post("/invite", response_model=InviteLinkResponse)
def create_invite_link(
    current_coach: User = Depends(get_current_coach)
):
    invite_link = f"freeweight://invite?coach_id={current_coach.id}"
    return InviteLinkResponse(
        invite_link=invite_link,
        coach_id=current_coach.id
    )

@router.post("/groups", response_model=GroupBasic)
def create_group(
    group_data: GroupCreate,
    current_coach: User = Depends(get_current_coach),
    db: Session = Depends(get_db)
):
    new_group = Group(
        coach_id=current_coach.id,
        name=group_data.name,
        sport=group_data.sport
    )
    db.add(new_group)
    db.commit()
    db.refresh(new_group)

    return GroupBasic(id=new_group.id, name=new_group.name)

@router.post("/groups/{group_id}/subgroups", response_model=SubgroupBasic)
def create_subgroup(
    group_id: int,
    subgroup_data: SubgroupCreate,
    current_coach: User = Depends(get_current_coach),
    db: Session = Depends(get_db)
):
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.coach_id == current_coach.id
    ).first()

    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    new_subgroup = Subgroup(
        group_id=group_id,
        name=subgroup_data.name,
        training_focus=subgroup_data.training_focus
    )
    db.add(new_subgroup)
    db.commit()
    db.refresh(new_subgroup)

    return SubgroupBasic(
        id=new_subgroup.id,
        name=new_subgroup.name,
        training_focus=new_subgroup.training_focus
    )


@router.post("/groups/{group_id}/athletes/{athlete_id}")
def add_athlete_to_group(
    group_id: int,
    athlete_id: int,
    current_coach: User = Depends(get_current_coach),
    db: Session = Depends(get_db)
):
    """Add an athlete to a group."""
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.coach_id == current_coach.id
    ).first()

    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    athlete = db.query(User).filter(User.id == athlete_id).first()
    if not athlete or athlete not in current_coach.coached_athletes:
        raise HTTPException(status_code=404, detail="Athlete not found in your roster")

    if athlete not in group.members:
        group.members.append(athlete)
        db.commit()

    return {"message": "Athlete added to group successfully"}

@router.delete("/groups/{group_id}/athletes/{athlete_id}")
def remove_athlete_from_group(
    group_id: int,
    athlete_id: int,
    current_coach: User = Depends(get_current_coach),
    db: Session = Depends(get_db)
):
    """Remove an athlete from a group."""
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.coach_id == current_coach.id
    ).first()

    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    athlete = db.query(User).filter(User.id == athlete_id).first()
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found")

    if athlete in group.members:
        group.members.remove(athlete)
        db.commit()

    return {"message": "Athlete removed from group successfully"}

@router.get("/groups")
def get_groups(
    current_coach: User = Depends(get_current_coach),
    db: Session = Depends(get_db)
):
    """Get all groups for the current coach."""
    groups = db.query(Group).filter(Group.coach_id == current_coach.id).all()

    return [{
        "id": g.id,
        "name": g.name,
        "sport": g.sport,
        "member_count": len(g.members),
        "subgroups": [{
            "id": s.id,
            "name": s.name,
            "training_focus": s.training_focus,
            "member_count": len(s.members)
        } for s in g.subgroups]
    } for g in groups]

@router.get("/athletes/{athlete_id}")
def get_athlete_detail(
    athlete_id: int,
    current_coach: User = Depends(get_current_coach),
    db: Session = Depends(get_db)
):
    athlete = db.query(User).filter(User.id == athlete_id).first()
    if not athlete or athlete not in current_coach.coached_athletes:
        raise HTTPException(status_code=404, detail="Athlete not found in your roster")

    maxes = db.query(AthleteMax).filter(
        AthleteMax.athlete_id == athlete_id
    ).order_by(AthleteMax.exercise_name).all()

    recent_logs = db.query(WorkoutLog).filter(
        WorkoutLog.athlete_id == athlete_id
    ).order_by(WorkoutLog.created_at.desc()).limit(10).all()

    log_data = []
    for log in recent_logs:
        workout = db.query(Workout).filter(Workout.id == log.workout_id).first()
        log_data.append({
            "id": log.id,
            "workout_name": workout.name if workout else "Unknown",
            "scheduled_date": (workout.scheduled_date if workout else log.created_at).isoformat(),
            "completed_at": log.completed_at.isoformat() if log.completed_at else None,
            "is_completed": log.is_completed,
            "has_modifications": log.has_modifications,
            "notes": log.notes,
            "is_flagged": log.is_flagged,
            "flag_reason": log.flag_reason,
            "coach_acknowledged": log.coach_acknowledged or False,
            "coach_response": log.coach_response,
        })

    return {
        "id": athlete.id,
        "name": athlete.name,
        "email": athlete.email,
        "sport": athlete.sport,
        "team": athlete.team,
        "training_goals": athlete.training_goals,
        "injuries": athlete.injuries,
        "maxes": [
            {"id": m.id, "exercise_name": m.exercise_name, "max_weight": m.max_weight, "unit": m.unit, "recorded_at": m.recorded_at.isoformat(), "updated_at": (m.updated_at or m.recorded_at).isoformat()}
            for m in maxes
        ],
        "recent_workouts": log_data,
    }


class AcknowledgeRequest(BaseModel):
    coach_response: Optional[str] = None


@router.post("/workout-logs/{log_id}/acknowledge")
def acknowledge_workout_log(
    log_id: int,
    data: AcknowledgeRequest,
    current_coach: User = Depends(get_current_coach),
    db: Session = Depends(get_db)
):
    log = db.query(WorkoutLog).filter(WorkoutLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Workout log not found")

    # Verify the log belongs to one of this coach's athletes
    athlete_ids = [a.id for a in current_coach.coached_athletes]
    if log.athlete_id not in athlete_ids:
        raise HTTPException(status_code=403, detail="Not authorized to acknowledge this workout log")

    log.coach_acknowledged = True
    log.coach_response = data.coach_response
    log.acknowledged_at = datetime.utcnow()
    db.commit()

    return {"message": "Workout log acknowledged"}
