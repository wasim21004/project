import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Animated, 
  Alert,
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, MicOff, Calendar, Clock, CircleCheck as CheckCircle2 } from 'lucide-react-native';
import { Audio } from 'expo-av';
import TopNavBar from '@/components/TopNavBar';
import AddTaskModal from '@/components/AddTaskModal';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  duration: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export default function HomeScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));
  const [tasks, setTasks] = useState<Task[]>([
  ]);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  // Mock data
  const todayEvents: CalendarEvent[] = [
    // { id: '1', title: 'Team Standup', time: '9:00', duration: '30 min', color: '#3B82F6' },
    // { id: '2', title: 'Client Meeting', time: '11:30', duration: '1 hour', color: '#10B981' },
    // { id: '3', title: 'Lunch Break', time: '13:00', duration: '1 hour', color: '#F59E0B' },
    // { id: '4', title: 'Product Review', time: '15:00', duration: '45 min', color: '#8B5CF6' },
  ];

  const addTask = (newTask: Omit<Task, 'id' | 'completed'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      completed: false,
    };
    setTasks([...tasks, task]);
  };

  const pendingTasks = tasks.filter(task => !task.completed && !task.scheduled);

  useEffect(() => {
    if (isRecording) {
      // Start pulsing animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );

      // Start glow animation
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );

      pulseAnimation.start();
      glowAnimation.start();

      return () => {
        pulseAnimation.stop();
        glowAnimation.stop();
      };
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web doesn't support audio recording, show mock behavior
        setIsRecording(true);
        // Simulate recording for 3 seconds
        setTimeout(() => {
          setIsRecording(false);
          Alert.alert(
            'Voice Command Processed',
            'Task added: "Review quarterly reports by Friday"',
            [{ text: 'OK' }]
          );
        }, 3000);
        return;
      }

      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(false);
    setRecording(null);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    
    // Mock voice processing
    Alert.alert(
      'Voice Command Processed',
      'Task added: "Review quarterly reports by Friday"',
      [{ text: 'OK' }]
    );
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      // Show modal instead of just recording
      setShowAddModal(true);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TopNavBar 
        title="TODOist" 
        showSearch={true}
        onSearchPress={() => Alert.alert('Search', 'Search functionality coming soon!')}
        onNotificationsPress={() => Alert.alert('Notifications', 'You have 3 pending reminders')}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning!</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}</Text>
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
          </View>
          
          {todayEvents.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={[styles.eventColorBar, { backgroundColor: event.color }]} />
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventMeta}>
                  <Clock size={14} color="#6B7280" />
                  <Text style={styles.eventTime}>{event.time}</Text>
                  <Text style={styles.eventDuration}>• {event.duration}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Pending Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CheckCircle2 size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Pending Tasks</Text>
          </View>
          
          {pendingTasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskContent}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
                    <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                      {task.priority}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating Microphone Button */}
      <Animated.View
        style={[
          styles.micButtonContainer,
          {
            transform: [{ scale: pulseAnim }],
            shadowColor: '#3B82F6',
            shadowOpacity: glowAnim,
            shadowRadius: Animated.multiply(glowAnim, 20),
            elevation: isRecording ? 8 : 4,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.micButton,
            { backgroundColor: isRecording ? '#EF4444' : '#3B82F6' }
          ]}
          onPress={toggleRecording}
          activeOpacity={0.8}
        >
          {isRecording ? (
            <MicOff size={28} color="#FFFFFF" />
          ) : (
            <Mic size={28} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </Animated.View>

      <AddTaskModal
        isVisible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddTask={addTask}
      />
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
  header: {
    marginTop: 10,
    marginBottom: 30,
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginLeft: 8,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventColorBar: {
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  eventContent: {
    flex: 1,
    padding: 16,
  },
  eventTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 4,
  },
  eventDuration: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginLeft: 4,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
  },
  micButtonContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});