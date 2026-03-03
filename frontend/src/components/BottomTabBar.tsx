import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface Tab {
  key: string;
  label: string;
}

interface Props {
  tabs: Tab[];
  activeTab: string;
  onTabPress: (key: string) => void;
  accentColor?: string;
}

export default function BottomTabBar({ tabs, activeTab, onTabPress, accentColor = '#B4F000' }: Props) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, isActive && { color: accentColor }]}>
              {tab.label}
            </Text>
            {isActive && (
              <View style={[styles.indicator, { backgroundColor: accentColor }]} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1C2128',
    borderTopWidth: 1,
    borderTopColor: '#2D3748',
    paddingBottom: 28,
    paddingTop: 14,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5A6572',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  indicator: {
    height: 2,
    width: 20,
    borderRadius: 1,
  },
});
