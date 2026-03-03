import { Users } from 'lucide-react';
import { useNavigate } from 'react-router';

interface Athlete {
  id: string;
  name: string;
  avatar: string;
  programName: string;
  nextWorkout: string;
  completionRate: number;
}

export function CoachView() {
  const navigate = useNavigate();

  const athletes: Athlete[] = [
    {
      id: '1',
      name: 'Marcus Johnson',
      avatar: 'MJ',
      programName: 'Strength Building',
      nextWorkout: 'Upper Body',
      completionRate: 85,
    },
    {
      id: '2',
      name: 'Sarah Chen',
      avatar: 'SC',
      programName: 'Athletic Performance',
      nextWorkout: 'Lower Body',
      completionRate: 92,
    },
    {
      id: '3',
      name: 'David Rodriguez',
      avatar: 'DR',
      programName: 'Powerlifting',
      nextWorkout: 'Rest Day',
      completionRate: 78,
    },
    {
      id: '4',
      name: 'Emma Williams',
      avatar: 'EW',
      programName: 'Conditioning',
      nextWorkout: 'Full Body',
      completionRate: 95,
    },
    {
      id: '5',
      name: 'James Martinez',
      avatar: 'JM',
      programName: 'Strength Building',
      nextWorkout: 'Push Day',
      completionRate: 68,
    },
    {
      id: '6',
      name: 'Olivia Thompson',
      avatar: 'OT',
      programName: 'Olympic Lifting',
      nextWorkout: 'Leg Day',
      completionRate: 88,
    },
  ];

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
            <div>
              <h1 className="text-[28px]" style={{ fontWeight: 600, color: '#E6EDF3' }}>
                Coach View
              </h1>
              <p className="text-[15px]" style={{ color: '#9BA3AD' }}>
                Manage your athletes
              </p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(180, 240, 0, 0.1)' }}>
              <Users className="w-6 h-6" style={{ color: '#B4F000' }} />
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 bg-card rounded-xl p-3 border border-border/50">
              <div className="text-[24px] mb-1" style={{ fontWeight: 600, color: '#B4F000' }}>
                {athletes.length}
              </div>
              <div className="text-[13px]" style={{ color: '#9BA3AD' }}>
                Active Athletes
              </div>
            </div>
            <div className="flex-1 bg-card rounded-xl p-3 border border-border/50">
              <div className="text-[24px] mb-1" style={{ fontWeight: 600, color: '#B4F000' }}>
                {Math.round(athletes.reduce((acc, a) => acc + a.completionRate, 0) / athletes.length)}%
              </div>
              <div className="text-[13px]" style={{ color: '#9BA3AD' }}>
                Avg Completion
              </div>
            </div>
          </div>
        </div>

        {/* Athletes List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-3">
            {athletes.map((athlete) => (
              <div
                key={athlete.id}
                onClick={() => navigate(`/coach/athlete/${athlete.id}`)}
                className="bg-card rounded-2xl p-4 border border-border/50 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-[16px]"
                    style={{ fontWeight: 600, backgroundColor: '#B4F000', color: '#14181C' }}
                  >
                    {athlete.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[17px] mb-0.5" style={{ fontWeight: 600, color: '#E6EDF3' }}>
                      {athlete.name}
                    </h3>
                    <p className="text-[14px]" style={{ color: '#9BA3AD' }}>
                      {athlete.programName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[15px] mb-0.5" style={{ fontWeight: 600, color: '#B4F000' }}>
                      {athlete.completionRate}%
                    </div>
                    <div className="text-[12px]" style={{ color: '#9BA3AD' }}>
                      Complete
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[13px]" style={{ color: '#9BA3AD' }}>
                  <span>Next:</span>
                  <span style={{ color: '#E6EDF3' }}>{athlete.nextWorkout}</span>
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
