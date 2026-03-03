import { useState } from 'react';
import { ChevronLeft, Calendar, Play } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ExerciseCard } from '../components/ExerciseCard';
import { ExerciseDetail } from '../components/ExerciseDetail';
import { ActiveWorkout } from '../components/ActiveWorkout';

interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight?: string;
  restTime: string;
  videoUrl?: string;
  notes?: string;
  completed: boolean;
}

export function AthleteView() {
  const navigate = useNavigate();
  
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: '1',
      name: 'Barbell Back Squat',
      sets: '4',
      reps: '8-10',
      weight: '185 lbs',
      restTime: '2-3 minutes',
      notes: 'Focus on depth and keeping your core tight. Bar should be on your upper traps.',
      completed: true,
    },
    {
      id: '2',
      name: 'Romanian Deadlift',
      sets: '3',
      reps: '10-12',
      weight: '135 lbs',
      restTime: '90 seconds',
      notes: 'Keep a slight bend in your knees and push your hips back. Feel the stretch in your hamstrings.',
      completed: true,
    },
    {
      id: '3',
      name: 'Leg Press',
      sets: '3',
      reps: '12-15',
      weight: '270 lbs',
      restTime: '90 seconds',
      notes: 'Full range of motion. Don\'t lock out your knees at the top.',
      completed: false,
    },
    {
      id: '4',
      name: 'Walking Lunges',
      sets: '3',
      reps: '12',
      weight: '40 lbs',
      restTime: '60 seconds',
      notes: 'Keep your torso upright and step far enough forward. Each leg should count as one rep.',
      completed: false,
    },
    {
      id: '5',
      name: 'Leg Curl',
      sets: '3',
      reps: '12-15',
      weight: '90 lbs',
      restTime: '60 seconds',
      notes: 'Control the negative. Don\'t let momentum do the work.',
      completed: false,
    },
    {
      id: '6',
      name: 'Calf Raises',
      sets: '4',
      reps: '15-20',
      weight: '135 lbs',
      restTime: '45 seconds',
      notes: 'Full stretch at the bottom, full contraction at the top. Pause for 1 second at the peak.',
      completed: false,
    },
  ]);

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  const toggleExercise = (id: string) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, completed: !ex.completed } : ex
    ));
    setSelectedExercise(null);
  };

  const startWorkout = () => {
    setIsWorkoutActive(true);
    setCurrentExerciseIndex(0);
  };

  const completeCurrentExercise = () => {
    const currentExercise = exercises[currentExerciseIndex];
    setExercises(exercises.map(ex => 
      ex.id === currentExercise.id ? { ...ex, completed: true } : ex
    ));

    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      setIsWorkoutActive(false);
      setCurrentExerciseIndex(0);
    }
  };

  const exitWorkout = () => {
    setIsWorkoutActive(false);
    setCurrentExerciseIndex(0);
  };

  const completedCount = exercises.filter(ex => ex.completed).length;
  const totalCount = exercises.length;

  // Show active workout if in workout mode
  if (isWorkoutActive) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-[390px] h-[844px] bg-background rounded-[3rem] border-[12px] border-[#1E2328] shadow-2xl overflow-hidden relative">
          <ActiveWorkout
            exercise={exercises[currentExerciseIndex]}
            currentIndex={currentExerciseIndex}
            totalExercises={totalCount}
            onComplete={completeCurrentExercise}
            onExit={exitWorkout}
          />
        </div>
      </div>
    );
  }

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
              onClick={() => navigate('/coach/athlete/1')}
              className="w-9 h-9 rounded-full bg-card flex items-center justify-center active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-5 h-5" style={{ color: '#E6EDF3' }} />
            </button>
            <div className="text-[17px]" style={{ fontWeight: 600, color: '#E6EDF3' }}>
              Athlete View
            </div>
            <button className="w-9 h-9 rounded-full bg-card flex items-center justify-center active:scale-95 transition-transform">
              <Calendar className="w-5 h-5" style={{ color: '#E6EDF3' }} />
            </button>
          </div>

          {/* Date and progress */}
          <div className="mb-4">
            <div className="text-[15px] mb-2" style={{ color: '#9BA3AD' }}>
              Thursday, Feb 26
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-card rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(completedCount / totalCount) * 100}%`,
                    backgroundColor: '#B4F000'
                  }}
                />
              </div>
              <div className="text-[15px]" style={{ fontWeight: 600, color: '#E6EDF3' }}>
                {completedCount}/{totalCount}
              </div>
            </div>
          </div>

          {/* Workout type badge */}
          <div className="inline-block px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(180, 240, 0, 0.1)' }}>
            <span className="text-[13px]" style={{ fontWeight: 600, color: '#B4F000' }}>
              LEG DAY
            </span>
          </div>
        </div>

        {/* Exercise list */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* Start Workout Button */}
          <button
            onClick={startWorkout}
            className="w-full py-5 rounded-2xl text-[18px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform mb-6 shadow-lg"
            style={{ fontWeight: 600, backgroundColor: '#B4F000', color: '#14181C' }}
          >
            <Play className="w-6 h-6" fill="#14181C" />
            Start Workout
          </button>

          <div className="space-y-3">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                name={exercise.name}
                sets={exercise.sets}
                reps={exercise.reps}
                weight={exercise.weight}
                completed={exercise.completed}
                onToggle={() => toggleExercise(exercise.id)}
                onSelect={() => setSelectedExercise(exercise)}
              />
            ))}
          </div>
        </div>

        {/* Bottom safe area */}
        <div className="h-8 bg-background"></div>
      </div>

      {/* Exercise detail modal */}
      {selectedExercise && (
        <ExerciseDetail
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onComplete={() => toggleExercise(selectedExercise.id)}
        />
      )}
    </div>
  );
}
