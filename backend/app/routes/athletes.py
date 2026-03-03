from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, date
from typing import Optional
from ..database import get_db
from ..auth import get_current_athlete
from .. import models
from ..schemas.athlete import OnboardingRequest, MaxUpdate, CalendarResponse, CalendarWorkout, ProgressResponse, ProgressDataPoint
from ..schemas.workout import WorkoutResponse, ExerciseResponse, SetLogCreate, WorkoutComplete, FlagRequest, WorkoutLogResponse

router = APIRouter(prefix="/api/athletes", tags=["athletes"])


def _build_workout_response(workout: models.Workout, current_athlete: models.User, db: Session) -> WorkoutResponse:
    """Build a WorkoutResponse with auto-calculated target weights."""
    athlete_maxes = {m.exercise_name: m.max_weight for m in current_athlete.maxes}

    exercises = []
    for exercise in sorted(workout.exercises, key=lambda e: e.order):
        target_weight = None
        if exercise.percentage_of_max and exercise.target_exercise:
            max_weight = athlete_maxes.get(exercise.target_exercise)
            if max_weight:
                target_weight = round(max_weight * exercise.percentage_of_max, 2)

        exercises.append(ExerciseResponse(
            id=exercise.id,
            name=exercise.name,
            sets=exercise.sets,
            reps=exercise.reps,
            percentage_of_max=exercise.percentage_of_max,
            target_exercise=exercise.target_exercise,
            target_weight=target_weight,
            video_url=exercise.video_url,
            coach_notes=exercise.coach_notes,
            order=exercise.order
        ))

    workout_log = db.query(models.WorkoutLog).filter(
        and_(
            models.WorkoutLog.workout_id == workout.id,
            models.WorkoutLog.athlete_id == current_athlete.id
        )
    ).first()

    return WorkoutResponse(
        id=workout.id,
        name=workout.name,
        scheduled_date=workout.scheduled_date,
        exercises=exercises,
        workout_log_id=workout_log.id if workout_log else None,
        is_completed=workout_log.is_completed if workout_log else False,
        is_flagged=workout_log.is_flagged if workout_log else False
    )


@router.post("/onboarding")
def complete_onboarding(
    data: OnboardingRequest,
    current_athlete: models.User = Depends(get_current_athlete),
    db: Session = Depends(get_db)
):
    current_athlete.sport = data.sport
    current_athlete.team = data.team
    current_athlete.training_goals = data.training_goals

    if data.maxes:
        for exercise_name, max_weight in data.maxes.items():
            existing = db.query(models.AthleteMax).filter(
                and_(
                    models.AthleteMax.athlete_id == current_athlete.id,
                    models.AthleteMax.exercise_name == exercise_name
                )
            ).first()
            if existing:
                existing.max_weight = max_weight
            else:
                db.add(models.AthleteMax(
                    athlete_id=current_athlete.id,
                    exercise_name=exercise_name,
                    max_weight=max_weight,
                    unit="lbs"
                ))

    db.commit()
    return {"message": "Onboarding completed successfully"}


@router.put("/maxes")
def update_max(
    data: MaxUpdate,
    current_athlete: models.User = Depends(get_current_athlete),
    db: Session = Depends(get_db)
):
    athlete_max = db.query(models.AthleteMax).filter(
        and_(
            models.AthleteMax.athlete_id == current_athlete.id,
            models.AthleteMax.exercise_name == data.exercise_name
        )
    ).first()

    if athlete_max:
        athlete_max.max_weight = data.max_weight
        athlete_max.unit = data.unit
        athlete_max.updated_at = datetime.utcnow()
    else:
        athlete_max = models.AthleteMax(
            athlete_id=current_athlete.id,
            exercise_name=data.exercise_name,
            max_weight=data.max_weight,
            unit=data.unit
        )
        db.add(athlete_max)

    db.commit()
    return {"message": "Max updated successfully"}


@router.get("/calendar", response_model=CalendarResponse)
def get_calendar(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_athlete: models.User = Depends(get_current_athlete),
    db: Session = Depends(get_db)
):
    # Only query workouts assigned directly to this athlete.
    # Coach-assigned workouts are materialized to athlete_id rows in assign_program.
    query = db.query(models.Workout).filter(
        models.Workout.athlete_id == current_athlete.id
    )

    if start_date:
        query = query.filter(models.Workout.scheduled_date >= start_date)
    if end_date:
        query = query.filter(models.Workout.scheduled_date <= end_date)

    workouts = query.order_by(models.Workout.scheduled_date).all()

    calendar_workouts = []
    for workout in workouts:
        workout_log = db.query(models.WorkoutLog).filter(
            and_(
                models.WorkoutLog.workout_id == workout.id,
                models.WorkoutLog.athlete_id == current_athlete.id
            )
        ).first()

        calendar_workouts.append(CalendarWorkout(
            id=workout.id,
            name=workout.name,
            scheduled_date=workout.scheduled_date,
            is_completed=workout_log.is_completed if workout_log else False,
            is_flagged=workout_log.is_flagged if workout_log else False
        ))

    return CalendarResponse(workouts=calendar_workouts)


@router.get("/workouts/today", response_model=WorkoutResponse)
def get_today_workout(
    current_athlete: models.User = Depends(get_current_athlete),
    db: Session = Depends(get_db)
):
    today = datetime.utcnow().date()
    today_start = datetime(today.year, today.month, today.day, 0, 0, 0)
    today_end = datetime(today.year, today.month, today.day, 23, 59, 59)

    workout = db.query(models.Workout).filter(
        and_(
            models.Workout.athlete_id == current_athlete.id,
            models.Workout.scheduled_date >= today_start,
            models.Workout.scheduled_date <= today_end
        )
    ).first()

    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No workout scheduled for today"
        )

    return _build_workout_response(workout, current_athlete, db)


@router.get("/workouts/{workout_id}", response_model=WorkoutResponse)
def get_workout(
    workout_id: int,
    current_athlete: models.User = Depends(get_current_athlete),
    db: Session = Depends(get_db)
):
    workout = db.query(models.Workout).filter(
        and_(
            models.Workout.id == workout_id,
            models.Workout.athlete_id == current_athlete.id
        )
    ).first()

    if not workout:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workout not found")

    return _build_workout_response(workout, current_athlete, db)


@router.post("/workouts/{workout_id}/start")
def start_workout(
    workout_id: int,
    current_athlete: models.User = Depends(get_current_athlete),
    db: Session = Depends(get_db)
):
    workout = db.query(models.Workout).filter(
        and_(
            models.Workout.id == workout_id,
            models.Workout.athlete_id == current_athlete.id
        )
    ).first()

    if not workout:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workout not found")

    existing_log = db.query(models.WorkoutLog).filter(
        and_(
            models.WorkoutLog.workout_id == workout_id,
            models.WorkoutLog.athlete_id == current_athlete.id
        )
    ).first()

    if existing_log:
        return {"workout_log_id": existing_log.id, "message": "Workout already started"}

    workout_log = models.WorkoutLog(
        athlete_id=current_athlete.id,
        workout_id=workout_id,
        is_completed=False
    )
    db.add(workout_log)
    db.commit()
    db.refresh(workout_log)

    return {"workout_log_id": workout_log.id, "message": "Workout started"}


@router.post("/workouts/{workout_id}/sets")
def log_set(
    workout_id: int,
    data: SetLogCreate,
    current_athlete: models.User = Depends(get_current_athlete),
    db: Session = Depends(get_db)
):
    workout_log = db.query(models.WorkoutLog).filter(
        and_(
            models.WorkoutLog.workout_id == workout_id,
            models.WorkoutLog.athlete_id == current_athlete.id
        )
    ).first()

    if not workout_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not started. Call /start first"
        )

    exercise = db.query(models.Exercise).filter(models.Exercise.id == data.exercise_id).first()
    if not exercise or exercise.workout_id != workout_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found in this workout"
        )

    set_log = models.SetLog(
        workout_log_id=workout_log.id,
        exercise_id=data.exercise_id,
        set_number=data.set_number,
        weight_used=data.weight_used,
        reps_completed=data.reps_completed,
        rpe=data.rpe,
        notes=data.notes,
        video_url=data.video_url,
        was_modified=data.was_modified
    )
    db.add(set_log)

    if data.was_modified:
        workout_log.has_modifications = True

    db.commit()
    return {"message": "Set logged successfully"}


@router.post("/workouts/{workout_id}/complete")
def complete_workout(
    workout_id: int,
    data: WorkoutComplete,
    current_athlete: models.User = Depends(get_current_athlete),
    db: Session = Depends(get_db)
):
    workout_log = db.query(models.WorkoutLog).filter(
        and_(
            models.WorkoutLog.workout_id == workout_id,
            models.WorkoutLog.athlete_id == current_athlete.id
        )
    ).first()

    if not workout_log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workout not started")

    workout_log.is_completed = True
    workout_log.completed_at = datetime.utcnow()
    if data.notes:
        workout_log.notes = data.notes

    db.commit()
    return {"message": "Workout completed successfully"}


@router.post("/workouts/{workout_id}/flag")
def flag_workout(
    workout_id: int,
    data: FlagRequest,
    current_athlete: models.User = Depends(get_current_athlete),
    db: Session = Depends(get_db)
):
    workout_log = db.query(models.WorkoutLog).filter(
        and_(
            models.WorkoutLog.workout_id == workout_id,
            models.WorkoutLog.athlete_id == current_athlete.id
        )
    ).first()

    if not workout_log:
        workout_log = models.WorkoutLog(
            athlete_id=current_athlete.id,
            workout_id=workout_id,
            is_completed=False,
            is_flagged=True,
            flag_reason=data.reason
        )
        db.add(workout_log)
    else:
        workout_log.is_flagged = True
        workout_log.flag_reason = data.reason

    db.commit()
    return {"message": "Workout flagged successfully"}


@router.get("/history", response_model=list[WorkoutLogResponse])
def get_history(
    limit: int = 50,
    current_athlete: models.User = Depends(get_current_athlete),
    db: Session = Depends(get_db)
):
    workout_logs = db.query(models.WorkoutLog).filter(
        models.WorkoutLog.athlete_id == current_athlete.id
    ).order_by(models.WorkoutLog.created_at.desc()).limit(limit).all()

    response = []
    for log in workout_logs:
        workout = db.query(models.Workout).filter(models.Workout.id == log.workout_id).first()
        response.append(WorkoutLogResponse(
            id=log.id,
            workout_id=log.workout_id,
            workout_name=workout.name if workout else "Unknown",
            scheduled_date=workout.scheduled_date if workout else log.created_at,
            completed_at=log.completed_at,
            is_completed=log.is_completed,
            has_modifications=log.has_modifications,
            is_flagged=log.is_flagged,
            flag_reason=log.flag_reason
        ))

    return response


@router.get("/progress", response_model=list[ProgressResponse])
def get_progress(
    exercise_name: Optional[str] = None,
    current_athlete: models.User = Depends(get_current_athlete),
    db: Session = Depends(get_db)
):
    query = db.query(models.AthleteMax).filter(
        models.AthleteMax.athlete_id == current_athlete.id
    )

    if exercise_name:
        query = query.filter(models.AthleteMax.exercise_name == exercise_name)

    maxes = query.order_by(models.AthleteMax.exercise_name, models.AthleteMax.recorded_at).all()

    progress_by_exercise = {}
    for max_record in maxes:
        if max_record.exercise_name not in progress_by_exercise:
            progress_by_exercise[max_record.exercise_name] = []
        progress_by_exercise[max_record.exercise_name].append(
            ProgressDataPoint(
                date=max_record.recorded_at,
                max_weight=max_record.max_weight
            )
        )

    return [
        ProgressResponse(exercise_name=exercise, data=data)
        for exercise, data in progress_by_exercise.items()
    ]
