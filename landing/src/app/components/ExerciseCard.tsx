import { CheckCircle2, Circle } from 'lucide-react';

interface ExerciseCardProps {
  name: string;
  sets: string;
  reps: string;
  weight?: string;
  completed?: boolean;
  onToggle?: () => void;
  onSelect?: () => void;
}

export function ExerciseCard({ 
  name, 
  sets, 
  reps, 
  weight, 
  completed = false,
  onToggle,
  onSelect 
}: ExerciseCardProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect();
    }
  };

  const handleCheckClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggle) {
      onToggle();
    }
  };

  return (
    <div 
      className="bg-card rounded-2xl p-4 border border-border/50 active:scale-[0.98] transition-transform cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-[17px] mb-1.5" style={{ fontWeight: 600 }}>
            {name}
          </h3>
          <div className="flex gap-4 text-[15px]" style={{ color: '#9BA3AD' }}>
            <span>{sets} sets</span>
            <span>•</span>
            <span>{reps} reps</span>
            {weight && (
              <>
                <span>•</span>
                <span>{weight}</span>
              </>
            )}
          </div>
        </div>
        <div className="mt-1" onClick={handleCheckClick}>
          {completed ? (
            <CheckCircle2 className="w-6 h-6" style={{ color: '#B4F000' }} />
          ) : (
            <Circle className="w-6 h-6" style={{ color: '#5A6572' }} />
          )}
        </div>
      </div>
    </div>
  );
}