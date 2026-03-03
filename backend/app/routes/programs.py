from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..auth import get_current_coach
from ..models import User, Program, Workout, Exercise, ProgramAssignment, Group, Subgroup
from ..schemas.program import (
    ProgramCreate,
    ProgramResponse,
    WorkoutCreate,
    WorkoutResponse,
    ExerciseCreate,
    ExerciseResponse,
    AssignmentCreate
)

router = APIRouter(prefix="/api/programs", tags=["programs"])

@router.post("", response_model=ProgramResponse)
def create_program(
    program_data: ProgramCreate,
    current_coach: User = Depends(get_current_coach),
    db: Session = Depends(get_db)
):
    new_program = Program(
        coach_id=current_coach.id,
        name=program_data.name,
        description=program_data.description
    )
    db.add(new_program)
    db.commit()
    db.refresh(new_program)

    return ProgramResponse(
        id=new_program.id,
        name=new_program.name,
        description=new_program.description,
        created_at=new_program.created_at,
        workouts=[]
    )

@router.get("/{program_id}", response_model=ProgramResponse)
def get_program(
    program_id: int,
    current_coach: User = Depends(get_current_coach),
    db: Session = Depends(get_db)
):
    program = db.query(Program).filter(
        Program.id == program_id,
        Program.coach_id == current_coach.id
    ).first()

    if not program:
        raise HTTPException(status_code=404, detail="Program not found")

    workouts = []
    for workout in program.workouts:
        exercises = [
            ExerciseResponse(
                id=ex.id,
                name=ex.name,
                sets=ex.sets,
                reps=ex.reps,
                percentage_of_max=ex.percentage_of_max,
                target_exercise=ex.target_exercise,
                video_url=ex.video_url,
                coach_notes=ex.coach_notes,
                order=ex.order
            )
            for ex in sorted(workout.exercises, key=lambda e: e.order)
        ]
        workouts.append(WorkoutResponse(
            id=workout.id,
            name=workout.name,
            day_offset=workout.day_offset,
            scheduled_date=workout.scheduled_date,
            exercises=exercises
        ))

    return ProgramResponse(
        id=program.id,
        name=program.name,
        description=program.description,
        created_at=program.created_at,
        workouts=workouts
    )

@router.post("/{program_id}/workouts", response_model=WorkoutResponse)
def add_workout_to_program(
    program_id: int,
    workout_data: WorkoutCreate,
    current_coach: User = Depends(get_current_coach),
    db: Session = Depends(get_db)
):
    program = db.query(Program).filter(
        Program.id == program_id,
        Program.coach_id == current_coach.id
    ).first()

    if not program:
        raise HTTPException(status_code=404, detail="Program not found")

    from datetime import datetime
    new_workout = Workout(
        program_id=program_id,
        name=workout_data.name,
        day_offset=workout_data.day_offset,
        scheduled_date=datetime.utcnow()
    )
    db.add(new_workout)
    db.commit()
    db.refresh(new_workout)

    return WorkoutResponse(
        id=new_workout.id,
        name=new_workout.name,
        day_offset=new_workout.day_offset,
        scheduled_date=new_workout.scheduled_date,
        exercises=[]
    )

@router.post("/workouts/{workout_id}/exercises", response_model=ExerciseResponse)
def add_exercise_to_workout(
    workout_id: int,
    exercise_data: ExerciseCreate,
    current_coach: User = Depends(get_current_coach),
    db: Session = Depends(get_db)
):
    workout = db.query(Workout).join(Program).filter(
        Workout.id == workout_id,
        Program.coach_id == current_coach.id
    ).first()

    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")

    new_exercise = Exercise(
        workout_id=workout_id,
        name=exercise_data.name,
        sets=exercise_data.sets,
        reps=exercise_data.reps,
        percentage_of_max=exercise_data.percentage_of_max,
        target_exercise=exercise_data.target_exercise,
        video_url=exercise_data.video_url,
        coach_notes=exercise_data.coach_notes,
        order=exercise_data.order
    )
    db.add(new_exercise)
    db.commit()
    db.refresh(new_exercise)

    return ExerciseResponse(
        id=new_exercise.id,
        name=new_exercise.name,
        sets=new_exercise.sets,
        reps=new_exercise.reps,
        percentage_of_max=new_exercise.percentage_of_max,
        target_exercise=new_exercise.target_exercise,
        video_url=new_exercise.video_url,
        coach_notes=new_exercise.coach_notes,
        order=new_exercise.order
    )

@router.post("/{program_id}/assign")
def assign_program(
    program_id: int,
    assignment_data: AssignmentCreate,
    current_coach: User = Depends(get_current_coach),
    db: Session = Depends(get_db)
):
    program = db.query(Program).filter(
        Program.id == program_id,
        Program.coach_id == current_coach.id
    ).first()

    if not program:
        raise HTTPException(status_code=404, detail="Program not found")

    if not any([assignment_data.athlete_id, assignment_data.group_id, assignment_data.subgroup_id]):
        raise HTTPException(
            status_code=400,
            detail="Must specify athlete_id, group_id, or subgroup_id"
        )

    if assignment_data.athlete_id:
        athlete = db.query(User).filter(User.id == assignment_data.athlete_id).first()
        if not athlete or athlete not in current_coach.coached_athletes:
            raise HTTPException(status_code=404, detail="Athlete not found in your roster")

    if assignment_data.group_id:
        group = db.query(Group).filter(
            Group.id == assignment_data.group_id,
            Group.coach_id == current_coach.id
        ).first()
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")

    if assignment_data.subgroup_id:
        subgroup = db.query(Subgroup).join(Group).filter(
            Subgroup.id == assignment_data.subgroup_id,
            Group.coach_id == current_coach.id
        ).first()
        if not subgroup:
            raise HTTPException(status_code=404, detail="Subgroup not found")

    assignment = ProgramAssignment(
        program_id=program_id,
        athlete_id=assignment_data.athlete_id,
        group_id=assignment_data.group_id,
        subgroup_id=assignment_data.subgroup_id,
        start_date=assignment_data.start_date
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    return {"message": "Program assigned successfully", "assignment_id": assignment.id}
