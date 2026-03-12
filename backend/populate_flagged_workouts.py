"""
Populate flagged workouts for testing the coach dashboard.
"""
import sys
from pathlib import Path

# Add the backend directory to the path
sys.path.append(str(Path(__file__).parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User, Workout, WorkoutLog
from datetime import datetime, timedelta

def populate_flagged_workouts():
    db: Session = SessionLocal()

    try:
        # Get coach smith
        coach = db.query(User).filter(User.email == "coach@test.com").first()
        if not coach:
            print("Coach not found!")
            return

        # Get some athletes
        athletes = coach.coached_athletes
        if len(athletes) < 2:
            print("Not enough athletes found!")
            return

        print(f"Found {len(athletes)} athletes for Coach Smith")

        # Create some workouts for athletes to flag
        workouts_to_flag = [
            {
                "athlete": athletes[0],
                "workout_name": "Upper Body Strength",
                "flag_reason": "Shoulder felt painful during overhead press"
            },
            {
                "athlete": athletes[1],
                "workout_name": "Lower Body Power",
                "flag_reason": "Knee discomfort during squats, reduced weight"
            },
        ]

        # Add a third if we have enough athletes
        if len(athletes) >= 3:
            workouts_to_flag.append({
                "athlete": athletes[2],
                "workout_name": "Rowing Endurance",
                "flag_reason": "Lower back tightness, need form check"
            })

        for workout_data in workouts_to_flag:
            athlete = workout_data["athlete"]

            # Create a workout
            workout = Workout(
                name=workout_data["workout_name"],
                scheduled_date=datetime.utcnow() - timedelta(days=1)
            )
            db.add(workout)
            db.flush()

            # Create a workout log that is flagged
            workout_log = WorkoutLog(
                athlete_id=athlete.id,
                workout_id=workout.id,
                is_completed=True,
                completed_at=datetime.utcnow() - timedelta(hours=2),
                is_flagged=True,
                flag_reason=workout_data["flag_reason"]
            )
            db.add(workout_log)

            print(f"Created flagged workout for {athlete.name}: {workout_data['workout_name']}")

        db.commit()
        print("\n✅ Successfully created flagged workouts!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    populate_flagged_workouts()
