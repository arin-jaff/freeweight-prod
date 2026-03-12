import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../hooks/useAuth';
import BottomTabBar, { Tab } from '../../components/BottomTabBar';
import { athleteApi, CalendarWorkout, ProgressResponse } from '../../api/endpoints';

type Props = NativeStackScreenProps<RootStackParamList, 'AthleteHome'>;

const TABS: Tab[] = [
  { key: 'home', label: 'Home' },
  { key: 'progress', label: 'Progress' },
  { key: 'profile', label: 'Profile' },
];

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

// ─── Home Tab ────────────────────────────────────────────────────────────────

function HomeTab({ navigation }: { navigation: Props['navigation'] }) {
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);

  const { data: todayWorkout, isLoading: workoutLoading, error: workoutError } = useQuery({
    queryKey: ['todayWorkout'],
    queryFn: athleteApi.getTodayWorkout,
    select: (response) => response.data,
    retry: false,
  });

  // Fetch calendar for the current week
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const startDate = weekStart.toISOString().slice(0, 10);
  const endDate = weekEnd.toISOString().slice(0, 10);

  const {
    data: calendarData,
    isLoading: calendarLoading,
    error: calendarError,
  } = useQuery({
    queryKey: ['calendar', startDate, endDate],
    queryFn: () => athleteApi.getCalendar({ start_date: startDate, end_date: endDate }),
    select: (response) => response.data.workouts,
  });

  const workoutsByDate = (calendarData ?? []).reduce<Record<string, CalendarWorkout[]>>(
    (acc, workout) => {
      const key = workout.scheduled_date.slice(0, 10);
      acc[key] = acc[key] ?? [];
      acc[key].push(workout);
      return acc;
    },
    {}
  );

  const sundayToSaturday = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
  const weekDays = [...sundayToSaturday.slice(1), sundayToSaturday[0]];
  const isLoading = workoutLoading || calendarLoading;
  const hasError = Boolean(workoutError || calendarError);

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.dateLabel}>{formatDate(today).toUpperCase()}</Text>

      {hasError && (
        <View style={styles.inlineErrorCard}>
          <Text style={styles.inlineErrorText}>Could not load all workout data. Pull to refresh.</Text>
        </View>
      )}

      {/* Today's workout card */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>TODAY&apos;S WORKOUT</Text>
        {isLoading ? (
          <View style={styles.card}>
            <ActivityIndicator color="#B4F000" />
          </View>
        ) : todayWorkout ? (
          <View style={[styles.card, styles.workoutCard]}>
            <Text style={styles.workoutName}>{todayWorkout.name}</Text>
            <Text style={styles.workoutMeta}>
              {todayWorkout.exercises.length} exercise{todayWorkout.exercises.length !== 1 ? 's' : ''}
            </Text>
            {todayWorkout.is_flagged && (
              <View style={styles.flagWarning}>
                <Text style={styles.flagWarningText}>Flagged for coach review</Text>
              </View>
            )}
            {todayWorkout.is_completed ? (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>COMPLETED</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.startButton}
                onPress={() =>
                  navigation.navigate('Workout', {
                    workoutId: todayWorkout.id,
                    workoutName: todayWorkout.name,
                  })
                }
              >
                <Text style={styles.startButtonText}>START WORKOUT</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : workoutError ? (
          <View style={styles.card}>
            <Text style={styles.restDayTitle}>Unable to load today&apos;s workout</Text>
            <Text style={styles.restDayText}>Check your connection and try again.</Text>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.restDayTitle}>Rest Day</Text>
            <Text style={styles.restDayText}>No workout scheduled. Recovery matters.</Text>
          </View>
        )}
      </View>

      {/* Week strip calendar */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>THIS WEEK</Text>
        <View style={styles.weekStrip}>
          {weekDays.map((day, i) => {
            const dateStr = day.toISOString().slice(0, 10);
            const isToday = dateStr === todayKey;
            const dayWorkouts = workoutsByDate[dateStr] ?? [];
            const hasWorkout = dayWorkouts.length > 0;
            const isCompleted = dayWorkouts.some((w) => w.is_completed);
            return (
              <View key={i} style={styles.dayCell}>
                <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                {hasWorkout ? (
                  isCompleted ? (
                    <View style={[styles.dayCheck, isToday && styles.dayCheckToday]}>
                      <Text style={styles.dayCheckText}>✓</Text>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.dayDot,
                        styles.dayDotActive,
                        isToday && styles.dayDotToday,
                      ]}
                    />
                  )
                ) : (
                  <View style={styles.daySpacer} />
                )}
                <Text style={[styles.dayNum, isToday && styles.dayNumToday]}>
                  {day.getDate()}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

// ─── Progress Tab ─────────────────────────────────────────────────────────────

const COMMON_LIFTS = ['squat', 'deadlift', 'bench', 'clean', 'press'];

function ProgressTab() {
  const queryClient = useQueryClient();
  const [editingLift, setEditingLift] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState('');
  const [newLiftName, setNewLiftName] = useState('');
  const [newLiftWeight, setNewLiftWeight] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: progress = [], isLoading, error } = useQuery({
    queryKey: ['progress'],
    queryFn: athleteApi.getProgress,
    select: (response) => response.data,
  });

  const updateMaxMutation = useMutation({
    mutationFn: (data: { exercise_name: string; max_weight: number }) =>
      athleteApi.updateMax(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      setEditingLift(null);
      setEditWeight('');
    },
    onError: () => Alert.alert('Error', 'Failed to update max. Try again.'),
  });

  // Flatten: one entry per exercise (last data point = current max)
  const maxes: Array<{ name: string; weight: number; unit: string }> = progress.map((p: ProgressResponse) => ({
    name: p.exercise_name,
    weight: p.data[p.data.length - 1]?.max_weight ?? 0,
    unit: 'lbs',
  }));

  const maxWeight = maxes.length > 0 ? Math.max(...maxes.map((m) => m.weight)) : 0;

  const handleSaveEdit = (liftName: string) => {
    const w = parseFloat(editWeight);
    if (!w || w <= 0) {
      Alert.alert('Invalid weight', 'Enter a valid weight.');
      return;
    }
    updateMaxMutation.mutate({ exercise_name: liftName, max_weight: w });
  };

  const handleAddMax = () => {
    const name = newLiftName.trim().toLowerCase();
    const w = parseFloat(newLiftWeight);
    if (!name || !w || w <= 0) {
      Alert.alert('Invalid input', 'Enter a lift name and weight.');
      return;
    }
    updateMaxMutation.mutate(
      { exercise_name: name, max_weight: w },
      {
        onSuccess: () => {
          setNewLiftName('');
          setNewLiftWeight('');
          setShowAddForm(false);
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>MY MAXES</Text>

        {isLoading ? (
          <ActivityIndicator color="#B4F000" style={{ marginTop: 32 }} />
        ) : error ? (
          <View style={styles.inlineErrorCard}>
            <Text style={styles.inlineErrorText}>Could not load your maxes. Try again shortly.</Text>
          </View>
        ) : maxes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No maxes recorded yet.</Text>
            <Text style={styles.emptySubtext}>Add your first lift below.</Text>
          </View>
        ) : (
          maxes.map((m) => {
            const barWidth = maxWeight > 0 ? (m.weight / maxWeight) * 100 : 0;
            const isEditing = editingLift === m.name;
            return (
              <View key={m.name} style={styles.maxRow}>
                <View style={styles.maxHeader}>
                  <Text style={styles.maxName}>{m.name.charAt(0).toUpperCase() + m.name.slice(1)}</Text>
                  {isEditing ? (
                    <View style={styles.editRow}>
                      <TextInput
                        style={styles.editInput}
                        value={editWeight}
                        onChangeText={setEditWeight}
                        keyboardType="numeric"
                        placeholder={String(m.weight)}
                        placeholderTextColor="#5A6572"
                        autoFocus
                      />
                      <Text style={styles.editUnit}>lbs</Text>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={() => handleSaveEdit(m.name)}
                      >
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setEditingLift(null)}>
                        <Text style={styles.cancelText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.maxValueRow}>
                      <Text style={styles.maxWeight}>
                        {m.weight} <Text style={styles.maxUnit}>{m.unit}</Text>
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setEditingLift(m.name);
                          setEditWeight(String(m.weight));
                        }}
                      >
                        <Text style={styles.editText}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${barWidth}%` }]} />
                </View>
              </View>
            );
          })
        )}

        {/* Add max */}
        {showAddForm ? (
          <View style={styles.addMaxForm}>
            <Text style={styles.addMaxLabel}>ADD LIFT</Text>
            <TextInput
              style={styles.input}
              placeholder="Lift name (e.g. squat)"
              placeholderTextColor="#5A6572"
              value={newLiftName}
              onChangeText={setNewLiftName}
              autoCapitalize="none"
            />
            <View style={styles.weightRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Weight"
                placeholderTextColor="#5A6572"
                value={newLiftWeight}
                onChangeText={setNewLiftWeight}
                keyboardType="numeric"
              />
              <Text style={styles.unitLabel}>lbs</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={handleAddMax}>
              <Text style={styles.addButtonText}>ADD MAX</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAddForm(false)}>
              <Text style={[styles.cancelText, { textAlign: 'center', marginTop: 8 }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() => setShowAddForm(true)}
          >
            <Text style={styles.outlineButtonText}>+ ADD LIFT</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user, logout } = useAuth();

  const initials = user?.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?';

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.profileName}>{user?.name}</Text>
        {(user?.sport || user?.team) && (
          <Text style={styles.profileMeta}>
            {[user.sport, user.team].filter(Boolean).join(' · ')}
          </Text>
        )}
      </View>

      {user?.training_goals ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TRAINING GOALS</Text>
          <View style={styles.card}>
            <Text style={styles.goalsText}>{user.training_goals}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>LOGOUT</Text>
      </TouchableOpacity>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AthleteHomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  const firstName = user?.name.split(' ')[0] ?? 'Athlete';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerBrand}>FREEWEIGHT</Text>
        <Text style={styles.headerGreeting}>Hi, {firstName}</Text>
      </View>

      {/* Tab content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'home' && <HomeTab navigation={navigation} />}
        {activeTab === 'progress' && <ProgressTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </View>

      <BottomTabBar tabs={TABS} activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14181C',
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  headerBrand: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B4F000',
    letterSpacing: 2,
  },
  headerGreeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E6EDF3',
    marginTop: 4,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5A6572',
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5A6572',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
  },
  inlineErrorCard: {
    backgroundColor: 'rgba(255, 77, 79, 0.12)',
    borderColor: 'rgba(255, 77, 79, 0.4)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
  },
  inlineErrorText: {
    color: '#FFB3B4',
    fontSize: 13,
  },
  workoutCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#B4F000',
  },
  workoutName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E6EDF3',
    marginBottom: 6,
  },
  workoutMeta: {
    fontSize: 13,
    color: '#5A6572',
    marginBottom: 12,
  },
  flagWarning: {
    backgroundColor: 'rgba(255, 77, 79, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 79, 0.35)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  flagWarningText: {
    color: '#FFB3B4',
    fontSize: 12,
    fontWeight: '700',
  },
  startButton: {
    backgroundColor: '#B4F000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#14181C',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  completedBadge: {
    backgroundColor: 'rgba(180, 240, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(180, 240, 0, 0.3)',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  completedText: {
    color: '#B4F000',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  restDayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E6EDF3',
    marginBottom: 6,
  },
  restDayText: {
    fontSize: 14,
    color: '#5A6572',
  },
  weekStrip: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-between',
  },
  dayCell: {
    alignItems: 'center',
    gap: 6,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#5A6572',
    letterSpacing: 0.5,
  },
  dayLabelToday: {
    color: '#B4F000',
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  daySpacer: {
    width: 12,
    height: 12,
  },
  dayDotActive: {
    backgroundColor: '#5A6572',
  },
  dayDotToday: {
    backgroundColor: '#B4F000',
  },
  dayCheck: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCheckToday: {
    backgroundColor: '#B4F000',
  },
  dayCheckText: {
    color: '#14181C',
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
  dayNum: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A6572',
  },
  dayNumToday: {
    color: '#E6EDF3',
  },
  // Progress tab
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#E6EDF3',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#5A6572',
  },
  maxRow: {
    marginBottom: 20,
  },
  maxHeader: {
    marginBottom: 8,
  },
  maxName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E6EDF3',
    marginBottom: 4,
  },
  maxValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  maxWeight: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E6EDF3',
  },
  maxUnit: {
    fontSize: 14,
    color: '#5A6572',
    fontWeight: 'normal',
  },
  editText: {
    color: '#B4F000',
    fontSize: 13,
    fontWeight: '600',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editInput: {
    backgroundColor: '#1F2937',
    color: '#E6EDF3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    fontSize: 16,
    width: 80,
    borderWidth: 1,
    borderColor: '#B4F000',
  },
  editUnit: {
    color: '#5A6572',
    fontSize: 13,
  },
  saveButton: {
    backgroundColor: '#B4F000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#14181C',
    fontSize: 13,
    fontWeight: '700',
  },
  cancelText: {
    color: '#5A6572',
    fontSize: 13,
  },
  barTrack: {
    height: 4,
    backgroundColor: '#1F2937',
    borderRadius: 2,
  },
  barFill: {
    height: 4,
    backgroundColor: '#B4F000',
    borderRadius: 2,
  },
  addMaxForm: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  addMaxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5A6572',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#14181C',
    color: '#E6EDF3',
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unitLabel: {
    color: '#5A6572',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#B4F000',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  addButtonText: {
    color: '#14181C',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#B4F000',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  outlineButtonText: {
    color: '#B4F000',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Profile tab
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#B4F000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14181C',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E6EDF3',
  },
  profileMeta: {
    fontSize: 13,
    color: '#5A6572',
    marginTop: 4,
  },
  goalsText: {
    fontSize: 14,
    color: '#E6EDF3',
    lineHeight: 22,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5A6572',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#E6EDF3',
  },
  logoutButton: {
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: '#2D3748',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  logoutText: {
    color: '#5A6572',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
