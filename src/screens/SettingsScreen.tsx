import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Switch, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [darkMode, setDarkMode] = useState(false);
  const [backgroundPlay, setBackgroundPlay] = useState(true);
  const [autoplayNext, setAutoplayNext] = useState(true);

  const SettingItem = ({ 
    title, 
    description, 
    type = 'toggle',
    value,
    onPress
  }: {
    title: string;
    description?: string;
    type?: 'toggle' | 'button';
    value?: boolean;
    onPress?: () => void;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
      {type === 'toggle' ? (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: '#E5E5E5', true: '#9F7AEA' }}
          thumbColor={value ? '#6B46C1' : '#fff'}
        />
      ) : (
        <Icon name="chevron-forward" size={20} color="#666" />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <SettingItem
            title="Dark Mode"
            description="Enable dark mode for nighttime reading"
            value={darkMode}
            onPress={() => setDarkMode(!darkMode)}
          />
        </View>

        {/* Playback */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Playback</Text>
          <SettingItem
            title="Background Play"
            description="Continue playing when app is in background"
            value={backgroundPlay}
            onPress={() => setBackgroundPlay(!backgroundPlay)}
          />
          <SettingItem
            title="Autoplay Next Chapter"
            description="Automatically play next chapter when current ends"
            value={autoplayNext}
            onPress={() => setAutoplayNext(!autoplayNext)}
          />
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <SettingItem
            title="About the App"
            type="button"
            onPress={() => {}}
          />
          <SettingItem
            title="About NLICM"
            type="button"
            onPress={() => {}}
          />
          <SettingItem
            title="Privacy Policy"
            type="button"
            onPress={() => {}}
          />
          <SettingItem
            title="Contact & Feedback"
            type="button"
            onPress={() => {}}
          />
        </View>

        {/* Version Info */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  versionInfo: {
    padding: 16,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#666',
  },
});

export default SettingsScreen;
