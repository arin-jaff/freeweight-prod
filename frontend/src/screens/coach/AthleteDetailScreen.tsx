import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { coachApi, AthleteDetail } from '../../api/endpoints';

type Props = NativeStackScreenProps<RootStackParamList, 'AthleteDetail'>;

const ACCENT = '#4df0c8';

export default function AthleteDetailScreen({ route, navigation }: Props) {
  const { athleteId, athleteName } = route.params;

  const { data: athlete, isLoading, error } = useQuery({
    queryKey: ['athleteDetail', athleteId],
    queryFn: () => coachApi.getAthleteDetail(athleteId).then((r) => r.data),
  });

  const maxWeight =
    athlete && athlete.maxes.length > 0
      ? Math.max(...athlete.maxes.map((m) => m.max_weight))
      : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {athleteName}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={ACCENT} size="large" />
        </View>
      ) : error || !athlete ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Could not load athlete data.</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile */}
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {athlete.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </Text>
            </View>
            <View>
              <Text style={styles.athleteName}>{athlete.name}</Text>
              <Text style={styles.athleteMeta}>
                {[athlete.sport, athlete.team].filter(Boolean).join(' · ') || athlete.email}
              </Text>
            </View>
          </View>

          {athlete.training_goals ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>GOALS</Text>
              <View style={styles.card}>
                <Text style={styles.goalsText}>{athlete.training_goals}</Text>
              </View>
            </View>
          ) : null}

          {/* Maxes */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CURRENT MAXES</Text>
            {athlete.maxes.length === 0 ? (
              <Text style={styles.mutedText}>No maxes recorded.</Text>
            ) : (
              athlete.maxes.map((m) => {
                const barWidth = maxWeight > 0 ? (m.max_weight / maxWeight) * 100 : 0;
                return (
                  <View key={m.exercise_name} style={styles.maxRow}>
                    <View style={styles.maxHeader}>
                      <Text style={styles.maxName}>
                        {m.exercise_name.charAt(0).toUpperCase() + m.exercise_name.slice(1)}
                      </Text>
                      <Text style={styles.maxWeight}>
                        {m.max_weight} <Text style={styles.maxUnit}>{m.unit}</Text>
                      </Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${barWidth}%` }]} />
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* Recent workout history */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>RECENT SESSIONS</Text>
            {athlete.recent_logs.length === 0 ? (
              <Text style={styles.mutedText}>No sessions logged yet.</Text>
            ) : (
              athlete.recent_logs.map((log, i) => (
                <View key={i} style={styles.logRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.logName}>{log.workout_name}</Text>
                    <Text style={styles.logDate}>
                      {new Date(log.scheduled_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View style={styles.logStatusContainer}>
                    {log.is_flagged && (
                      <Text style={styles.flagBadge}>⚑</Text>
                    )}
                    <View
                      style={[
                        styles.statusBadge,
                        log.is_completed ? styles.statusComplete : styles.statusMissed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          log.is_completed ? styles.statusTextComplete : styles.statusTextMissed,
                        ]}
                      >
                        {log.is_completed ? 'DONE' : 'MISSED'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14181C',
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#5A6572',
    fontSize: 15,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 28,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(77,240,200,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ACCENT,
  },
  athleteName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E6EDF3',
  },
  athleteMeta: {
    fontSize: 13,
    color: '#5A6572',
    marginTop: 2,
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
    borderRadius: 10,
    padding: 16,
  },
  goalsText: {
    fontSize: 14,
    color: '#E6EDF3',
    lineHeight: 22,
  },
  mutedText: {
    color: '#5A6572',
    fontSize: 14,
  },
  maxRow: {
    marginBottom: 16,
  },
  maxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  maxName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E6EDF3',
  },
  maxWeight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E6EDF3',
  },
  maxUnit: {
    fontSize: 12,
    color: '#5A6572',
    fontWeight: 'normal',
  },
  barTrack: {
    height: 4,
    backgroundColor: '#1F2937',
    borderRadius: 2,
  },
  barFill: {
    height: 4,
    backgroundColor: ACCENT,
    borderRadius: 2,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  logName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E6EDF3',
  },
  logDate: {
    fontSize: 12,
    color: '#5A6572',
    marginTop: 2,
  },
  logStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flagBadge: {
    fontSize: 14,
    color: '#FF4D4F',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusComplete: {
    backgroundColor: 'rgba(77,240,200,0.1)',
  },
  statusMissed: {
    backgroundColor: 'rgba(90,101,114,0.15)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusTextComplete: {
    color: ACCENT,
  },
  statusTextMissed: {
    color: '#5A6572',
  },
});
