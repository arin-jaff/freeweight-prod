import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { athleteApi, Exercise, TodayWorkout } from '../../api/endpoints';

type Props = NativeStackScreenProps<RootStackParamList, 'Workout'>;

interface SetState {
  weight: string;
  reps: string;
  logged: boolean;
}

interface ExerciseLog {
  sets: SetState[];
}

function initLogs(exercises: Exercise[]): ExerciseLog[] {
  return exercises.map((ex) => ({
    sets: Array.from({ length: ex.sets }, () => ({
      weight: ex.target_weight ? String(Math.round(ex.target_weight)) : '',
      reps: String(ex.reps),
      logged: false,
    })),
  }));
}

export default function WorkoutScreen({ route, navigation }: Props) {
  const { workoutId, workoutName } = route.params;

  const [workout, setWorkout] = useState<TodayWorkout | null>(null);
  const [loading, setLoading] = useState(true);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [currentSetIdx, setCurrentSetIdx] = useState(0);
  const [workoutLogId, setWorkoutLogId] = useState<number | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [showFlagForm, setShowFlagForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    athleteApi
      .getWorkout(workoutId)
      .then((r) => {
        setWorkout(r.data);
        setExerciseLogs(initLogs(r.data.exercises));
        if (r.data.workout_log_id) {
          setWorkoutLogId(r.data.workout_log_id);
          setIsStarted(true);
        }
        if (r.data.is_completed) {
          setIsComplete(true);
        }
      })
      .catch(() => Alert.alert('Error', 'Could not load workout.'))
      .finally(() => setLoading(false));
  }, [workoutId]);

  const currentExercise = workout?.exercises[currentExerciseIdx];
  const currentLog = exerciseLogs[currentExerciseIdx];
  const currentSet = currentLog?.sets[currentSetIdx];

  const allExercisesComplete =
    exerciseLogs.length > 0 &&
    exerciseLogs.every((log) => log.sets.every((s) => s.logged));

  const startWorkout = async () => {
    try {
      const res = await athleteApi.startWorkout(workoutId);
      setWorkoutLogId(res.data.workout_log_id);
      setIsStarted(true);
    } catch {
      Alert.alert('Error', 'Failed to start workout.');
    }
  };

  const logCurrentSet = async () => {
    if (!currentExercise || !currentSet) return;

    const weight = parseFloat(currentSet.weight);
    const reps = parseInt(currentSet.reps, 10);

    if (!weight || weight <= 0) {
      Alert.alert('Invalid weight', 'Enter the weight you used.');
      return;
    }
    if (!reps || reps <= 0) {
      Alert.alert('Invalid reps', 'Enter the reps you completed.');
      return;
    }

    setSubmitting(true);
    try {
      if (!isStarted) {
        const res = await athleteApi.startWorkout(workoutId);
        setWorkoutLogId(res.data.workout_log_id);
        setIsStarted(true);
      }

      await athleteApi.logSet(workoutId, {
        exercise_id: currentExercise.id,
        set_number: currentSetIdx + 1,
        weight_used: weight,
        reps_completed: reps,
      });

      // Mark set as logged
      const updated = exerciseLogs.map((el, ei) => {
        if (ei !== currentExerciseIdx) return el;
        return {
          sets: el.sets.map((s, si) =>
            si === currentSetIdx ? { ...s, logged: true } : s
          ),
        };
      });
      setExerciseLogs(updated);

      // Advance
      const nextSet = currentSetIdx + 1;
      if (nextSet < currentLog.sets.length) {
        setCurrentSetIdx(nextSet);
      } else {
        // Move to next exercise
        const nextEx = currentExerciseIdx + 1;
        if (nextEx < (workout?.exercises.length ?? 0)) {
          setCurrentExerciseIdx(nextEx);
          setCurrentSetIdx(0);
        }
        // If all done, the allExercisesComplete flag will update
      }
    } catch {
      Alert.alert('Error', 'Failed to log set. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const finishWorkout = async () => {
    setSubmitting(true);
    try {
      await athleteApi.completeWorkout(workoutId);
      setIsComplete(true);
    } catch {
      Alert.alert('Error', 'Failed to complete workout.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitFlag = async () => {
    if (!flagReason.trim()) {
      Alert.alert('Required', 'Describe the issue for your coach.');
      return;
    }
    try {
      await athleteApi.flagWorkout(workoutId, flagReason.trim());
      setShowFlagForm(false);
      setFlagReason('');
      Alert.alert('Flagged', 'Your coach will see this note.');
    } catch {
      Alert.alert('Error', 'Failed to send flag.');
    }
  };

  const updateCurrentSet = (field: 'weight' | 'reps', value: string) => {
    setExerciseLogs((prev) =>
      prev.map((el, ei) => {
        if (ei !== currentExerciseIdx) return el;
        return {
          sets: el.sets.map((s, si) =>
            si === currentSetIdx ? { ...s, [field]: value } : s
          ),
        };
      })
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#B4F000" size="large" />
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Could not load workout.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#14181C' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {workoutName}
        </Text>
        <TouchableOpacity onPress={() => setShowFlagForm(true)} style={styles.flagButton}>
          <Text style={styles.flagButtonText}>⚑ Flag</Text>
        </TouchableOpacity>
      </View>

      {/* Completed state */}
      {isComplete ? (
        <View style={styles.completedContainer}>
          <Text style={styles.completedIcon}>✓</Text>
          <Text style={styles.completedTitle}>Workout Complete</Text>
          <Text style={styles.completedSub}>Great work. Session saved.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.primaryButtonText}>BACK TO HOME</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
          {/* Exercise list overview */}
          <View style={styles.exerciseList}>
            {workout.exercises.map((ex, i) => {
              const log = exerciseLogs[i];
              const done = log?.sets.every((s) => s.logged);
              const isCurrent = i === currentExerciseIdx;
              return (
                <View
                  key={ex.id}
                  style={[
                    styles.exerciseChip,
                    done && styles.exerciseChipDone,
                    isCurrent && styles.exerciseChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.exerciseChipText,
                      done && styles.exerciseChipTextDone,
                      isCurrent && styles.exerciseChipTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {done ? '✓ ' : ''}{ex.name}
                  </Text>
                </View>
              );
            })}
          </View>

          {allExercisesComplete ? (
            /* All sets logged — finish */
            <View style={styles.finishContainer}>
              <Text style={styles.finishTitle}>All exercises complete</Text>
              <Text style={styles.finishSub}>Ready to mark this session done?</Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={finishWorkout}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#14181C" />
                ) : (
                  <Text style={styles.primaryButtonText}>FINISH WORKOUT</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* Active exercise view */
            <View style={styles.activeExercise}>
              {/* Exercise info */}
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseLabel}>
                  Exercise {currentExerciseIdx + 1} of {workout.exercises.length}
                </Text>
                <Text style={styles.exerciseName}>{currentExercise?.name}</Text>
                <Text style={styles.exerciseScheme}>
                  {currentExercise?.sets} sets × {currentExercise?.reps} reps
                </Text>

                {currentExercise?.target_weight && (
                  <View style={styles.targetBadge}>
                    <Text style={styles.targetText}>
                      Target: {Math.round(currentExercise.target_weight)} lbs
                      {currentExercise.percentage_of_max
                        ? ` (${Math.round(currentExercise.percentage_of_max * 100)}% of ${currentExercise.target_exercise})`
                        : ''}
                    </Text>
                  </View>
                )}

                {currentExercise?.coach_notes && (
                  <View style={styles.notesCard}>
                    <Text style={styles.notesLabel}>COACH NOTES</Text>
                    <Text style={styles.notesText}>{currentExercise.coach_notes}</Text>
                  </View>
                )}
              </View>

              {/* Set logger */}
              <View style={styles.setLogger}>
                <Text style={styles.setLabel}>
                  Set {currentSetIdx + 1} of {currentExercise?.sets}
                </Text>

                <View style={styles.inputRow}>
                  <View style={styles.inputBlock}>
                    <Text style={styles.inputLabel}>WEIGHT (lbs)</Text>
                    <TextInput
                      style={styles.bigInput}
                      value={currentSet?.weight ?? ''}
                      onChangeText={(v) => updateCurrentSet('weight', v)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#5A6572"
                    />
                  </View>
                  <View style={styles.inputDivider} />
                  <View style={styles.inputBlock}>
                    <Text style={styles.inputLabel}>REPS</Text>
                    <TextInput
                      style={styles.bigInput}
                      value={currentSet?.reps ?? ''}
                      onChangeText={(v) => updateCurrentSet('reps', v)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#5A6572"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
                  onPress={logCurrentSet}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#14181C" />
                  ) : (
                    <Text style={styles.primaryButtonText}>LOG SET</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Flag form overlay */}
      {showFlagForm && (
        <View style={styles.flagOverlay}>
          <View style={styles.flagCard}>
            <Text style={styles.flagTitle}>Flag an Issue</Text>
            <Text style={styles.flagSub}>Your coach will see this note.</Text>
            <TextInput
              style={styles.flagInput}
              placeholder="Describe the issue..."
              placeholderTextColor="#5A6572"
              value={flagReason}
              onChangeText={setFlagReason}
              multiline
              numberOfLines={4}
              autoFocus
            />
            <TouchableOpacity style={styles.primaryButton} onPress={submitFlag}>
              <Text style={styles.primaryButtonText}>SEND FLAG</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowFlagForm(false);
                setFlagReason('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: '#14181C',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  errorText: {
    color: '#E6EDF3',
    fontSize: 16,
  },
  backLink: {
    color: '#B4F000',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  backArrow: {
    fontSize: 20,
    color: '#E6EDF3',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#E6EDF3',
  },
  flagButton: {
    padding: 4,
  },
  flagButtonText: {
    color: '#FF4D4F',
    fontSize: 13,
    fontWeight: '600',
  },
  exerciseList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 8,
  },
  exerciseChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#2D3748',
    maxWidth: 140,
  },
  exerciseChipActive: {
    borderColor: '#B4F000',
    backgroundColor: 'rgba(180, 240, 0, 0.08)',
  },
  exerciseChipDone: {
    borderColor: '#2D3748',
    backgroundColor: '#1C2128',
  },
  exerciseChipText: {
    fontSize: 12,
    color: '#5A6572',
  },
  exerciseChipTextActive: {
    color: '#B4F000',
    fontWeight: '600',
  },
  exerciseChipTextDone: {
    color: '#3A4A5A',
  },
  activeExercise: {
    flex: 1,
  },
  exerciseInfo: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  exerciseLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5A6572',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E6EDF3',
    marginBottom: 6,
  },
  exerciseScheme: {
    fontSize: 15,
    color: '#5A6572',
    marginBottom: 14,
  },
  targetBadge: {
    backgroundColor: 'rgba(180, 240, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(180, 240, 0, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  targetText: {
    color: '#B4F000',
    fontSize: 13,
    fontWeight: '600',
  },
  notesCard: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 14,
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5A6572',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#E6EDF3',
    lineHeight: 20,
  },
  setLogger: {
    padding: 24,
  },
  setLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5A6572',
    letterSpacing: 1.5,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  inputBlock: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  inputDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#2D3748',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5A6572',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  bigInput: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#E6EDF3',
    textAlign: 'center',
    width: '80%',
  },
  primaryButton: {
    backgroundColor: '#B4F000',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#14181C',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
  finishContainer: {
    padding: 24,
    gap: 12,
    alignItems: 'center',
  },
  finishTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E6EDF3',
  },
  finishSub: {
    fontSize: 14,
    color: '#5A6572',
    marginBottom: 8,
  },
  completedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  completedIcon: {
    fontSize: 56,
    color: '#B4F000',
  },
  completedTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#E6EDF3',
  },
  completedSub: {
    fontSize: 15,
    color: '#5A6572',
    marginBottom: 16,
  },
  flagOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 40,
  },
  flagCard: {
    backgroundColor: '#1C2128',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    gap: 12,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  flagTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E6EDF3',
  },
  flagSub: {
    fontSize: 13,
    color: '#5A6572',
  },
  flagInput: {
    backgroundColor: '#14181C',
    color: '#E6EDF3',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  cancelButton: {
    padding: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#5A6572',
    fontSize: 14,
  },
});
