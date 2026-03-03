import { ChevronLeft, CheckCircle2, Circle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';

interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight?: string;
  completed: boolean;
}

interface DayData {
  day: string;
  date: string;
  type: string;
  exercises: Exercise[];
}

export function DayDetail() {
  const navigate = useNavigate();
  const { athleteId, dayIndex } = useParams();

  // Mock data - in real app this would be fetched based on athleteId and dayIndex
  const athleteName = 'Marcus Johnson';
  
  const daysData: Record<string, DayData> = {
    '0': {
      day: 'Monday',
      date: 'Feb 24',
      type: 'Upper Body',
      exercises: [
        { id: '1', name: 'Bench Press', sets: '4', reps: '8-10', weight: '185 lbs', completed: true },
        { id: '2', name: 'Bent Over Row', sets: '4', reps: '8-10', weight: '155 lbs', completed: true },
        { id: '3', name: 'Overhead Press', sets: '3', reps: '10-12', weight: '95 lbs', completed: true },
        { id: '4', name: 'Pull-ups', sets: '3', reps: '8-10', weight: 'Bodyweight', completed: true },
        { id: '5', name: 'Dumbbell Curl', sets: '3', reps: '12', weight: '30 lbs', completed: true },
      ],
    },
    '1': {
      day: 'Tuesday',
      date: 'Feb 25',
      type: 'Lower Body',
      exercises: [
        { id: '1', name: 'Barbell Back Squat', sets: '4', reps: '8-10', weight: '185 lbs', completed: true },
        { id: '2', name: 'Romanian Deadlift', sets: '3', reps: '10-12', weight: '135 lbs', completed: true },
        { id: '3', name: 'Leg Press', sets: '3', reps: '12-15', weight: '270 lbs', completed: false },
        { id: '4', name: 'Walking Lunges', sets: '3', reps: '12', weight: '40 lbs', completed: false },
        { id: '5', name: 'Leg Curl', sets: '3', reps: '12-15', weight: '90 lbs', completed: false },
        { id: '6', name: 'Calf Raises', sets: '4', reps: '15-20', weight: '135 lbs', completed: false },
      ],
    },
    '2': {
      day: 'Wednesday',
      date: 'Feb 26',
      type: 'Rest Day',
      exercises: [
        { id: '1', name: 'Active Recovery Walk', sets: '1', reps: '30 min', completed: true },
        { id: '2', name: 'Stretching Routine', sets: '1', reps: '15 min', completed: true },
      ],
    },
    '3': {
      day: 'Thursday',
      date: 'Feb 27',
      type: 'Push Day',
      exercises: [
        { id: '1', name: 'Incline Bench Press', sets: '4', reps: '8-10', weight: '165 lbs', completed: false },
        { id: '2', name: 'Dips', sets: '3', reps: '10-12', weight: 'Bodyweight', completed: false },
        { id: '3', name: 'Shoulder Press', sets: '3', reps: '10-12', weight: '85 lbs', completed: false },
        { id: '4', name: 'Lateral Raise', sets: '3', reps: '12-15', weight: '20 lbs', completed: false },
        { id: '5', name: 'Tricep Extensions', sets: '3', reps: '12', weight: '70 lbs', completed: false },
      ],
    },
    '4': {
      day: 'Friday',
      date: 'Feb 28',
      type: 'Pull Day',
      exercises: [
        { id: '1', name: 'Deadlift', sets: '4', reps: '6-8', weight: '225 lbs', completed: false },
        { id: '2', name: 'Pull-ups', sets: '4', reps: '8-10', weight: 'Bodyweight', completed: false },
        { id: '3', name: 'Barbell Row', sets: '3', reps: '10-12', weight: '155 lbs', completed: false },
        { id: '4', name: 'Face Pulls', sets: '3', reps: '15', weight: '60 lbs', completed: false },
        { id: '5', name: 'Hammer Curl', sets: '3', reps: '12', weight: '35 lbs', completed: false },
      ],
    },
    '5': {
      day: 'Saturday',
      date: 'Mar 1',
      type: 'Leg Day',
      exercises: [
        { id: '1', name: 'Front Squat', sets: '4', reps: '8-10', weight: '155 lbs', completed: false },
        { id: '2', name: 'Walking Lunges', sets: '3', reps: '12', weight: '40 lbs', completed: false },
        { id: '3', name: 'Leg Curl', sets: '3', reps: '12-15', weight: '90 lbs', completed: false },
        { id: '4', name: 'Leg Extension', sets: '3', reps: '12-15', weight: '120 lbs', completed: false },
        { id: '5', name: 'Calf Raises', sets: '4', reps: '15-20', weight: '135 lbs', completed: false },
      ],
    },
    '6': {
      day: 'Sunday',
      date: 'Mar 2',
      type: 'Rest Day',
      exercises: [
        { id: '1', name: 'Active Recovery', sets: '1', reps: '20 min', completed: false },
        { id: '2', name: 'Mobility Work', sets: '1', reps: '20 min', completed: false },
      ],
    },
  };

  const dayData = daysData[dayIndex || '0'];
  const completedCount = dayData.exercises.filter(ex => ex.completed).length;
  const totalCount = dayData.exercises.length;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* iPhone mockup frame */}
      <div className="w-full max-w-[390px] h-[844px] bg-background rounded-[3rem] border-[12px] border-[#1E2328] shadow-2xl overflow-hidden flex flex-col relative">
        {/* Status bar */}
        <div className="h-11 flex items-center justify-between px-8 pt-2" style={{ color: '#E6EDF3' }}>
          <span className="text-[15px]" style={{ fontWeight: 600 }}>9:41</span>
          <div className="flex gap-1.5">
            <div className="w-[17px] h-[11px] rounded-sm" style={{ border: '1px solid #E6EDF3' }}>
              <div className="w-[13px] h-[7px] bg-[#E6EDF3] rounded-[1px] m-[1px]"></div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="px-6 pt-2 pb-4">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => navigate(`/coach/athlete/${athleteId}`)}
              className="w-9 h-9 rounded-full bg-card flex items-center justify-center active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-5 h-5" style={{ color: '#E6EDF3' }} />
            </button>
            <div className="text-[17px]" style={{ fontWeight: 600, color: '#E6EDF3' }}>
              {dayData.day} Workout
            </div>
            <div className="w-9"></div>
          </div>

          {/* Day Info */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-[24px] mb-0.5" style={{ fontWeight: 600, color: '#E6EDF3' }}>
                  {athleteName}
                </h2>
                <p className="text-[14px]" style={{ color: '#9BA3AD' }}>
                  {dayData.date}
                </p>
              </div>
              <div 
                className="px-3 py-1.5 rounded-full"
                style={{ backgroundColor: 'rgba(180, 240, 0, 0.1)' }}
              >
                <span className="text-[13px]" style={{ fontWeight: 600, color: '#B4F000' }}>
                  {dayData.type.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-card rounded-xl p-4 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px]" style={{ color: '#9BA3AD' }}>
                  Workout Progress
                </span>
                <span className="text-[14px]" style={{ fontWeight: 600, color: '#E6EDF3' }}>
                  {completedCount}/{totalCount} exercises
                </span>
              </div>
              <div className="h-2 bg-[#2A2F36] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(completedCount / totalCount) * 100}%`,
                    backgroundColor: '#B4F000'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-3">
            {dayData.exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="bg-card rounded-2xl p-4 border border-border/50"
              >
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    {exercise.completed ? (
                      <CheckCircle2 className="w-6 h-6" style={{ color: '#B4F000' }} />
                    ) : (
                      <Circle className="w-6 h-6" style={{ color: '#5A6572' }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 
                      className="text-[17px] mb-1"
                      style={{ 
                        fontWeight: 600, 
                        color: exercise.completed ? '#E6EDF3' : '#9BA3AD',
                        textDecoration: exercise.completed ? 'none' : 'none'
                      }}
                    >
                      {exercise.name}
                    </h3>
                    <div className="flex gap-3 text-[14px]" style={{ color: '#9BA3AD' }}>
                      <span>{exercise.sets} sets</span>
                      <span>•</span>
                      <span>{exercise.reps} reps</span>
                      {exercise.weight && (
                        <>
                          <span>•</span>
                          <span>{exercise.weight}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom safe area */}
        <div className="h-8 bg-background"></div>
      </div>
    </div>
  );
}
