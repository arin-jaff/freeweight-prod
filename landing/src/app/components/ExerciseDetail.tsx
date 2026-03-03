import { X, Play, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExerciseDetailProps {
  exercise: {
    id: string;
    name: string;
    sets: string;
    reps: string;
    weight?: string;
    restTime: string;
    videoUrl?: string;
    notes?: string;
  };
  onClose: () => void;
  onComplete: () => void;
}

export function ExerciseDetail({ exercise, onClose, onComplete }: ExerciseDetailProps) {
  const setsArray = Array.from({ length: parseInt(exercise.sets) }, (_, i) => i + 1);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="w-full max-w-[390px] bg-background rounded-t-[2rem] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{ maxHeight: '85vh' }}
        >
          {/* Handle bar */}
          <div className="pt-3 pb-2 flex justify-center">
            <div className="w-10 h-1 bg-[#5A6572] rounded-full"></div>
          </div>

          {/* Header */}
          <div className="px-6 py-3 flex items-start justify-between border-b border-border/50">
            <div className="flex-1 pr-4">
              <h2 className="text-[20px] mb-1" style={{ fontWeight: 600, color: '#E6EDF3' }}>
                {exercise.name}
              </h2>
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
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-card flex items-center justify-center active:scale-95 transition-transform"
            >
              <X className="w-5 h-5" style={{ color: '#E6EDF3' }} />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(85vh - 120px)' }}>
            {/* Video Section */}
            <div className="mb-6">
              <h3 className="text-[15px] mb-3" style={{ fontWeight: 600, color: '#E6EDF3' }}>
                Form Video
              </h3>
              <div className="relative aspect-video bg-card rounded-2xl overflow-hidden flex items-center justify-center border border-border/50">
                {/* Video placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#2A2F36] to-[#1E2328]"></div>
                <button className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center active:scale-95 transition-transform" style={{ backgroundColor: '#B4F000' }}>
                  <Play className="w-7 h-7 ml-1" style={{ color: '#14181C' }} fill="#14181C" />
                </button>
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 rounded text-[12px]" style={{ color: '#E6EDF3' }}>
                  2:15
                </div>
              </div>
            </div>

            {/* Sets Breakdown */}
            <div className="mb-6">
              <h3 className="text-[15px] mb-3" style={{ fontWeight: 600, color: '#E6EDF3' }}>
                Sets Breakdown
              </h3>
              <div className="space-y-2">
                {setsArray.map((setNum) => (
                  <div
                    key={setNum}
                    className="bg-card rounded-xl p-4 border border-border/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2A2F36] flex items-center justify-center">
                        <span className="text-[14px]" style={{ fontWeight: 600, color: '#B4F000' }}>
                          {setNum}
                        </span>
                      </div>
                      <div>
                        <div className="text-[15px]" style={{ fontWeight: 600, color: '#E6EDF3' }}>
                          {exercise.reps} reps
                        </div>
                        <div className="text-[13px]" style={{ color: '#9BA3AD' }}>
                          {exercise.weight}
                        </div>
                      </div>
                    </div>
                    <button className="w-7 h-7 rounded-full border-2 flex items-center justify-center active:scale-95 transition-all" style={{ borderColor: '#5A6572' }}>
                      <Check className="w-4 h-4 opacity-0" style={{ color: '#B4F000' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Rest Time */}
            <div className="mb-6">
              <h3 className="text-[15px] mb-3" style={{ fontWeight: 600, color: '#E6EDF3' }}>
                Rest Between Sets
              </h3>
              <div className="bg-card rounded-xl p-4 border border-border/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(180, 240, 0, 0.1)' }}>
                  <span className="text-[18px]" style={{ fontWeight: 600, color: '#B4F000' }}>
                    ⏱
                  </span>
                </div>
                <div>
                  <div className="text-[15px]" style={{ fontWeight: 600, color: '#E6EDF3' }}>
                    {exercise.restTime}
                  </div>
                  <div className="text-[13px]" style={{ color: '#9BA3AD' }}>
                    Recovery time
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {exercise.notes && (
              <div className="mb-6">
                <h3 className="text-[15px] mb-3" style={{ fontWeight: 600, color: '#E6EDF3' }}>
                  Coach Notes
                </h3>
                <div className="bg-card rounded-xl p-4 border border-border/50">
                  <p className="text-[14px] leading-relaxed" style={{ color: '#9BA3AD' }}>
                    {exercise.notes}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Button */}
          <div className="px-6 py-4 border-t border-border/50">
            <button
              onClick={onComplete}
              className="w-full py-4 rounded-2xl text-[17px] active:scale-[0.98] transition-transform"
              style={{ fontWeight: 600, backgroundColor: '#B4F000', color: '#14181C' }}
            >
              Mark as Complete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
