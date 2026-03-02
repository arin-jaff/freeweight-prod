import { Check, X } from 'lucide-react';
import { motion } from 'motion/react';

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

interface ActiveWorkoutProps {
  exercise: Exercise;
  currentIndex: number;
  totalExercises: number;
  onComplete: () => void;
  onExit: () => void;
}

export function ActiveWorkout({ 
  exercise, 
  currentIndex, 
  totalExercises,
  onComplete,
  onExit 
}: ActiveWorkoutProps) {
  const setsArray = Array.from({ length: parseInt(exercise.sets) }, (_, i) => i + 1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-background z-50 flex flex-col"
    >
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
            onClick={onExit}
            className="w-9 h-9 rounded-full bg-card flex items-center justify-center active:scale-95 transition-transform"
          >
            <X className="w-5 h-5" style={{ color: '#E6EDF3' }} />
          </button>
          <div className="text-[15px]" style={{ fontWeight: 600, color: '#9BA3AD' }}>
            Exercise {currentIndex + 1} of {totalExercises}
          </div>
          <div className="w-9"></div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-card rounded-full overflow-hidden mb-6">
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{ 
              width: `${((currentIndex + 1) / totalExercises) * 100}%`,
              backgroundColor: '#B4F000'
            }}
          />
        </div>

        {/* Exercise name */}
        <h1 className="text-[28px] mb-2" style={{ fontWeight: 600, color: '#E6EDF3' }}>
          {exercise.name}
        </h1>
        <div className="flex gap-3 text-[16px] mb-6" style={{ color: '#9BA3AD' }}>
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

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {/* Video Section */}
        <div className="mb-6">
          <h3 className="text-[15px] mb-3" style={{ fontWeight: 600, color: '#E6EDF3' }}>
            Form Video
          </h3>
          <div className="relative aspect-video bg-card rounded-2xl overflow-hidden flex items-center justify-center border border-border/50">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2A2F36] to-[#1E2328]"></div>
            <button className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center active:scale-95 transition-transform" style={{ backgroundColor: '#B4F000' }}>
              <svg className="w-9 h-9 ml-1" viewBox="0 0 24 24" fill="#14181C">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
            <div className="absolute bottom-4 right-4 px-2.5 py-1 bg-black/70 rounded-lg text-[13px]" style={{ color: '#E6EDF3', fontWeight: 600 }}>
              2:15
            </div>
          </div>
        </div>

        {/* Sets Breakdown */}
        <div className="mb-6">
          <h3 className="text-[15px] mb-3" style={{ fontWeight: 600, color: '#E6EDF3' }}>
            Sets to Complete
          </h3>
          <div className="space-y-3">
            {setsArray.map((setNum) => (
              <div
                key={setNum}
                className="bg-card rounded-2xl p-5 border border-border/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#B4F000' }}>
                      <span className="text-[16px]" style={{ fontWeight: 600, color: '#14181C' }}>
                        {setNum}
                      </span>
                    </div>
                    <div>
                      <div className="text-[17px]" style={{ fontWeight: 600, color: '#E6EDF3' }}>
                        {exercise.reps} reps
                      </div>
                      <div className="text-[14px]" style={{ color: '#9BA3AD' }}>
                        {exercise.weight}
                      </div>
                    </div>
                  </div>
                </div>
                {setNum < setsArray.length && (
                  <div className="pt-3 border-t border-border/30 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(180, 240, 0, 0.15)' }}>
                      <span className="text-[16px]">⏱</span>
                    </div>
                    <span className="text-[14px]" style={{ color: '#9BA3AD' }}>
                      Rest {exercise.restTime}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Coach Notes */}
        {exercise.notes && (
          <div className="mb-6">
            <h3 className="text-[15px] mb-3" style={{ fontWeight: 600, color: '#E6EDF3' }}>
              Coach Notes
            </h3>
            <div className="bg-card rounded-2xl p-5 border border-border/50">
              <p className="text-[15px] leading-relaxed" style={{ color: '#9BA3AD' }}>
                {exercise.notes}
              </p>
            </div>
          </div>
        )}

        {/* Spacer for button */}
        <div className="h-24"></div>
      </div>

      {/* Fixed bottom button */}
      <div className="absolute bottom-0 left-0 right-0 px-6 py-6 bg-gradient-to-t from-background via-background to-transparent">
        <button
          onClick={onComplete}
          className="w-full py-5 rounded-2xl text-[18px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg"
          style={{ fontWeight: 600, backgroundColor: '#B4F000', color: '#14181C' }}
        >
          <Check className="w-6 h-6" />
          Completed
        </button>
      </div>
    </motion.div>
  );
}
