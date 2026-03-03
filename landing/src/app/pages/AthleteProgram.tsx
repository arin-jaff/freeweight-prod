import { ChevronLeft, Calendar, Dumbbell } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';

interface DayWorkout {
  day: string;
  date: string;
  type: string;
  exercises: string[];
  completed: boolean;
}

export function AthleteProgram() {
  const navigate = useNavigate();
  const { athleteId } = useParams();

  // Mock data - in real app this would be fetched based on athleteId
  const athleteName = 'Marcus Johnson';
  
  const weekProgram: DayWorkout[] = [
    {
      day: 'Monday',
      date: 'Feb 24',
      type: 'Upper Body',
      exercises: ['Bench Press', 'Bent Over Row', 'Overhead Press', 'Pull-ups'],
      completed: true,
    },
    {
      day: 'Tuesday',
      date: 'Feb 25',
      type: 'Lower Body',
      exercises: ['Back Squat', 'Romanian Deadlift', 'Leg Press', 'Leg Curl'],
      completed: true,
    },
    {
      day: 'Wednesday',
      date: 'Feb 26',
      type: 'Rest Day',
      exercises: ['Active Recovery', 'Stretching'],
      completed: true,
    },
    {
      day: 'Thursday',
      date: 'Feb 27',
      type: 'Push Day',
      exercises: ['Incline Bench', 'Dips', 'Shoulder Press', 'Tricep Extensions'],
      completed: false,
    },
    {
      day: 'Friday',
      date: 'Feb 28',
      type: 'Pull Day',
      exercises: ['Deadlift', 'Pull-ups', 'Barbell Row', 'Face Pulls'],
      completed: false,
    },
    {
      day: 'Saturday',
      date: 'Mar 1',
      type: 'Leg Day',
      exercises: ['Front Squat', 'Walking Lunges', 'Leg Curl', 'Calf Raises'],
      completed: false,
    },
    {
      day: 'Sunday',
      date: 'Mar 2',
      type: 'Rest Day',
      exercises: ['Active Recovery', 'Mobility Work'],
      completed: false,
    },
  ];

  const completedDays = weekProgram.filter(d => d.completed).length;

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
              onClick={() => navigate('/coach')}
              className="w-9 h-9 rounded-full bg-card flex items-center justify-center active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-5 h-5" style={{ color: '#E6EDF3' }} />
            </button>
            <div className="text-[17px]" style={{ fontWeight: 600, color: '#E6EDF3' }}>
              Weekly Program
            </div>
            <button className="w-9 h-9 rounded-full bg-card flex items-center justify-center active:scale-95 transition-transform">
              <Calendar className="w-5 h-5" style={{ color: '#E6EDF3' }} />
            </button>
          </div>

          {/* Athlete Info */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center text-[18px]"
                style={{ fontWeight: 600, backgroundColor: '#B4F000', color: '#14181C' }}
              >
                MJ
              </div>
              <div className="flex-1">
                <h2 className="text-[22px] mb-0.5" style={{ fontWeight: 600, color: '#E6EDF3' }}>
                  {athleteName}
                </h2>
                <p className="text-[14px]" style={{ color: '#9BA3AD' }}>
                  Strength Building Program
                </p>
              </div>
            </div>

            {/* Weekly Progress */}
            <div className="bg-card rounded-xl p-4 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px]" style={{ color: '#9BA3AD' }}>
                  Week Progress
                </span>
                <span className="text-[14px]" style={{ fontWeight: 600, color: '#E6EDF3' }}>
                  {completedDays}/{weekProgram.length} days
                </span>
              </div>
              <div className="h-2 bg-[#2A2F36] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(completedDays / weekProgram.length) * 100}%`,
                    backgroundColor: '#B4F000'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Day by Day Program */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-3">
            {weekProgram.map((dayWorkout, index) => (
              <div
                key={index}
                onClick={() => navigate(`/coach/athlete/${athleteId}/day/${index}`)}
                className="bg-card rounded-2xl p-4 border border-border/50 active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden"
              >
                {/* Completion overlay */}
                {dayWorkout.completed && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(180, 240, 0, 0.2)' }}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#B4F000" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="pt-1">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ 
                        backgroundColor: dayWorkout.completed ? 'rgba(180, 240, 0, 0.1)' : '#2A2F36'
                      }}
                    >
                      {dayWorkout.type === 'Rest Day' ? (
                        <Calendar className="w-5 h-5" style={{ color: dayWorkout.completed ? '#B4F000' : '#5A6572' }} />
                      ) : (
                        <Dumbbell className="w-5 h-5" style={{ color: dayWorkout.completed ? '#B4F000' : '#5A6572' }} />
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="text-[17px] mb-0.5" style={{ fontWeight: 600, color: '#E6EDF3' }}>
                          {dayWorkout.day}
                        </h3>
                        <p className="text-[13px]" style={{ color: '#9BA3AD' }}>
                          {dayWorkout.date}
                        </p>
                      </div>
                    </div>

                    <div 
                      className="inline-block px-2.5 py-1 rounded-lg text-[13px] mb-2"
                      style={{ 
                        fontWeight: 600,
                        backgroundColor: 'rgba(180, 240, 0, 0.1)',
                        color: '#B4F000'
                      }}
                    >
                      {dayWorkout.type}
                    </div>

                    <div className="text-[14px]" style={{ color: '#9BA3AD' }}>
                      {dayWorkout.exercises.slice(0, 3).join(' • ')}
                      {dayWorkout.exercises.length > 3 && ` +${dayWorkout.exercises.length - 3} more`}
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