import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Search, Menu } from 'lucide-react-native';

interface TopNavBarProps {
  title: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  showMenu?: boolean;
  onSearchPress?: () => void;
  onNotificationsPress?: () => void;
  onMenuPress?: () => void;
}

export default function TopNavBar({
  title,
  showSearch = false,
  showNotifications = true,
  showMenu = false,
  onSearchPress,
  onNotificationsPress,
  onMenuPress,
}: TopNavBarProps) {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.leftSection}>
            {showMenu && (
              <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
                <Menu size={24} color="#1F2937" />
              </TouchableOpacity>
            )}
            <Text style={styles.title}>{title}</Text>
          </View>
          
          <View style={styles.rightSection}>
            {showSearch && (
              <TouchableOpacity style={styles.iconButton} onPress={onSearchPress}>
                <Search size={24} color="#6B7280" />
              </TouchableOpacity>
            )}
            {showNotifications && (
              <TouchableOpacity style={styles.iconButton} onPress={onNotificationsPress}>
                <Bell size={24} color="#6B7280" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
});