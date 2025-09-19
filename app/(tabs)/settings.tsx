import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Switch,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Bell, 
  Calendar, 
  Volume2, 
  Phone, 
  ChevronRight, 
  User, 
  Link,
  Unlink
} from 'lucide-react-native';
import TopNavBar from '@/components/TopNavBar';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

export default function SettingsScreen() {
  const [morningCallEnabled, setMorningCallEnabled] = useState(true);
  const [doubleAnnouncement, setDoubleAnnouncement] = useState(false);
  const [googleAccountLinked, setGoogleAccountLinked] = useState(true);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const handleGoogleAccountToggle = () => {
    if (googleAccountLinked) {
      Alert.alert(
        'Unlink Google Account',
        'This will remove calendar sync and voice features. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Unlink', 
            style: 'destructive',
            onPress: () => setGoogleAccountLinked(false)
          }
        ]
      );
    } else {
      Alert.alert(
        'Link Google Account',
        'Redirecting to Google authentication...',
        [{ text: 'OK', onPress: () => setGoogleAccountLinked(true) }]
      );
    }
  };

  const showComingSoon = () => {
    Alert.alert('Coming Soon', 'This feature will be available in the next update!');
  };

  if (!fontsLoaded) {
    return null;
  }

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    showSwitch = false, 
    switchValue, 
    onSwitchChange, 
    showChevron = false,
    onPress,
    customRight
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    showChevron?: boolean;
    onPress?: () => void;
    customRight?: React.ReactNode;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress && !showSwitch}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      
      <View style={styles.settingRight}>
        {showSwitch && (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
            thumbColor={switchValue ? '#FFFFFF' : '#FFFFFF'}
          />
        )}
        {customRight}
        {showChevron && (
          <ChevronRight size={20} color="#9CA3AF" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TopNavBar 
        title="Settings" 
        onNotificationsPress={() => Alert.alert('Notifications', 'You have 3 pending reminders')}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <SettingItem
            icon={<User size={20} color="#3B82F6" />}
            title="Profile"
            subtitle="Manage your account information"
            showChevron
            onPress={showComingSoon}
          />
          
          <SettingItem
            icon={googleAccountLinked ? 
              <Link size={20} color="#10B981" /> : 
              <Unlink size={20} color="#EF4444" />
            }
            title="Google Account"
            subtitle={googleAccountLinked ? 'Connected to john.doe@gmail.com' : 'Not connected'}
            onPress={handleGoogleAccountToggle}
            customRight={
              <View style={[
                styles.statusBadge, 
                { backgroundColor: googleAccountLinked ? '#10B98120' : '#EF444420' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: googleAccountLinked ? '#10B981' : '#EF4444' }
                ]}>
                  {googleAccountLinked ? 'Connected' : 'Disconnected'}
                </Text>
              </View>
            }
          />
        </View>

        {/* Voice Assistant Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Assistant</Text>
          
          <SettingItem
            icon={<Volume2 size={20} color="#3B82F6" />}
            title="Double Announcements"
            subtitle="Repeat important notifications twice"
            showSwitch
            switchValue={doubleAnnouncement}
            onSwitchChange={setDoubleAnnouncement}
          />
          
          <SettingItem
            icon={<Bell size={20} color="#3B82F6" />}
            title="Voice Settings"
            subtitle="Customize voice speed and language"
            showChevron
            onPress={showComingSoon}
          />
        </View>

        {/* Morning Call Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Morning Call</Text>
          
          <SettingItem
            icon={<Phone size={20} color="#3B82F6" />}
            title="Enable Morning Call"
            subtitle="Receive daily schedule via phone call"
            showSwitch
            switchValue={morningCallEnabled}
            onSwitchChange={setMorningCallEnabled}
          />
          
          {morningCallEnabled && (
            <>
              <SettingItem
                icon={<Calendar size={20} color="#3B82F6" />}
                title="Call Time"
                subtitle="8:00 AM"
                showChevron
                onPress={showComingSoon}
              />
              
              <SettingItem
                icon={<Phone size={20} color="#3B82F6" />}
                title="Phone Number"
                subtitle="+1 (555) 123-4567"
                showChevron
                onPress={showComingSoon}
              />
            </>
          )}
        </View>

        {/* Calendar Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calendar</Text>
          
          <SettingItem
            icon={<Calendar size={20} color="#3B82F6" />}
            title="Default Calendar"
            subtitle="Primary Calendar"
            showChevron
            onPress={showComingSoon}
          />
          
          <SettingItem
            icon={<Bell size={20} color="#3B82F6" />}
            title="Notification Settings"
            subtitle="Manage calendar reminders"
            showChevron
            onPress={showComingSoon}
          />
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <SettingItem
            icon={<Volume2 size={20} color="#3B82F6" />}
            title="Version"
            subtitle="1.0.0"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
});