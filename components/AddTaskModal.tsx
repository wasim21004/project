import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import { X, Mic, MicOff, Calendar, Flag, Clock, ChevronDown } from 'lucide-react-native';
import { Audio } from 'expo-av';
import DateTimePicker from '@react-native-community/datetimepicker';
import CalendarService from "../services/CalendarService";
import TaskService from '../services/TaskServices';
interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  scheduled?: boolean;
  scheduledDate?: Date;
  description?: string;
}

interface AddTaskModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void;
}

export default function AddTaskModal({ isVisible, onClose, onAddTask }: AddTaskModalProps) {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [isScheduled, setIsScheduled] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));

  // Animations for recording mic
  useEffect(() => {
    if (isRecording) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );

      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0, duration: 1000, useNativeDriver: false }),
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

  const resetForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setPriority('medium');
    setIsScheduled(false);
    setSelectedDate(new Date());
    setSelectedTime(new Date());
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getCombinedDateTime = () => {
    const combined = new Date(selectedDate);
    combined.setHours(selectedTime.getHours());
    combined.setMinutes(selectedTime.getMinutes());
    combined.setSeconds(0);
    combined.setMilliseconds(0);
    return combined;
  };

 const handleAddTask = async () => {
  if (!taskTitle.trim()) {
    Alert.alert('Error', 'Please enter a task title');
    return;
  }

  const scheduledDateTime = isScheduled ? getCombinedDateTime() : undefined;

  const newTask = {
    title: taskTitle.trim(),
    description: taskDescription.trim(),
    priority,
    scheduled: isScheduled,
    scheduledDate: scheduledDateTime,
  };

  try {
    // 🔹 Save locally first
    const savedTask = await TaskService.addTask(newTask);

    // 🔹 Push to backend
    try {
      await fetch('http://localhost:5000/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savedTask),
      });
    } catch (err) {
      console.warn('Failed to sync task with backend', err);
    }

    // 🔹 Notify parent UI
    onAddTask(savedTask);

    // 🔹 Add to Calendar if scheduled
    if (isScheduled && scheduledDateTime) {
      try {
        await CalendarService.addEvent(
          savedTask.title,
          savedTask.description,
          scheduledDateTime.toISOString()
        );
        Alert.alert(
          '✅ Added to Calendar',
          `${savedTask.title} on ${formatDate(scheduledDateTime)} at ${formatTime(scheduledDateTime)}`
        );
      } catch (e) {
        Alert.alert('⚠️ Failed to add to Calendar', String(e));
      }
    }

    handleClose();
  } catch (err) {
    Alert.alert('Error', 'Failed to save task');
  }
};


  // Recording logic (mock transcription)
  const startRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        setIsRecording(true);
        setTimeout(() => {
          setIsRecording(false);
          const mockTranscription = 'Meeting with John Friday at 2 PM';
          setTaskTitle(mockTranscription);
          setIsScheduled(true);
          // Set to next Friday
          const nextFriday = new Date();
          const daysUntilFriday = (5 - nextFriday.getDay() + 7) % 7 || 7;
          nextFriday.setDate(nextFriday.getDate() + daysUntilFriday);
          setSelectedDate(nextFriday);
          // Set time to 2 PM
          const twoPM = new Date();
          twoPM.setHours(14, 0, 0, 0);
          setSelectedTime(twoPM);
        }, 3000);
        return;
      }

      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') return;

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
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

    // 🔹 Replace with real transcription service later
    const mockTranscription = 'Meeting with John Friday at 2 PM';
    setTaskTitle(mockTranscription);
    setIsScheduled(true);
    // Set to next Friday
    const nextFriday = new Date();
    const daysUntilFriday = (5 - nextFriday.getDay() + 7) % 7 || 7;
    nextFriday.setDate(nextFriday.getDate() + daysUntilFriday);
    setSelectedDate(nextFriday);
    // Set time to 2 PM
    const twoPM = new Date();
    twoPM.setHours(14, 0, 0, 0);
    setSelectedTime(twoPM);
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const onDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  const onTimeChange = (event: any, time?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (time) {
      setSelectedTime(time);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleClose}
      onSwipeComplete={handleClose}
      swipeDirection="down"
      style={styles.modal}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View style={styles.modalContent}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add New Task</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Voice Recording Section */}
          <View style={styles.voiceSection}>
            <Text style={styles.sectionLabel}>Voice Input</Text>
            <View style={styles.voiceContainer}>
              <Animated.View
                style={[
                  styles.voiceButtonContainer,
                  {
                    transform: [{ scale: pulseAnim }],
                    shadowColor: '#3B82F6',
                    shadowOpacity: glowAnim,
                    shadowRadius: Animated.multiply(glowAnim, 15),
                    elevation: isRecording ? 8 : 4,
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.voiceButton,
                    { backgroundColor: isRecording ? '#EF4444' : '#3B82F6' }
                  ]}
                  onPress={toggleRecording}
                >
                  {isRecording ? <MicOff size={24} color="#fff" /> : <Mic size={24} color="#fff" />}
                </TouchableOpacity>
              </Animated.View>
              <Text style={styles.voiceHint}>
                {isRecording ? 'Listening...' : 'Tap to record your task'}
              </Text>
            </View>
          </View>

          {/* Manual Input Section */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionLabel}>Task Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Task title"
              value={taskTitle}
              onChangeText={setTaskTitle}
              multiline
            />
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Description (optional)"
              value={taskDescription}
              onChangeText={setTaskDescription}
              multiline
            />

            {/* Priority Selection */}
            <View style={styles.prioritySection}>
              <Text style={styles.sectionLabel}>Priority</Text>
              <View style={styles.priorityButtons}>
                {(['high', 'medium', 'low'] as const).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.priorityButton,
                      priority === level && { backgroundColor: getPriorityColor(level) + '20' }
                    ]}
                    onPress={() => setPriority(level)}
                  >
                    <Flag size={16} color={getPriorityColor(level)} />
                    <Text style={[styles.priorityText, { color: getPriorityColor(level) }]}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Schedule Section */}
            <View style={styles.scheduleSection}>
              <TouchableOpacity
                style={styles.scheduleToggle}
                onPress={() => setIsScheduled(!isScheduled)}
              >
                <Calendar size={20} color="#3B82F6" />
                <Text style={styles.scheduleLabel}>Schedule this task</Text>
                <View style={[styles.toggle, isScheduled && styles.toggleActive]}>
                  <View style={[styles.toggleThumb, isScheduled && styles.toggleThumbActive]} />
                </View>
              </TouchableOpacity>

              {/* Date and Time Pickers */}
              {isScheduled && (
                <View style={styles.dateTimeContainer}>
                  {/* Date Picker Button */}
                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <View style={styles.dateTimeButtonContent}>
                      <Calendar size={18} color="#3B82F6" />
                      <Text style={styles.dateTimeButtonText}>
                        {formatDate(selectedDate)}
                      </Text>
                      <ChevronDown size={18} color="#6B7280" />
                    </View>
                  </TouchableOpacity>

                  {/* Time Picker Button */}
                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <View style={styles.dateTimeButtonContent}>
                      <Clock size={18} color="#3B82F6" />
                      <Text style={styles.dateTimeButtonText}>
                        {formatTime(selectedTime)}
                      </Text>
                      <ChevronDown size={18} color="#6B7280" />
                    </View>
                  </TouchableOpacity>

                  {/* Date Picker Modal */}
                  {showDatePicker && (
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onDateChange}
                      minimumDate={new Date()}
                      textColor="#000000"
                      style={styles.dateTimePicker}
                    />
                  )}

                  {/* Time Picker Modal */}
                  {showTimePicker && (
                    <DateTimePicker
                      value={selectedTime}
                      mode="time"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onTimeChange}
                      textColor="#000000"
                      style={styles.dateTimePicker}
                    />
                  )}

                  {/* iOS Date/Time Picker Close Buttons */}
                  {Platform.OS === 'ios' && (showDatePicker || showTimePicker) && (
                    <View style={styles.pickerCloseContainer}>
                      <TouchableOpacity
                        style={styles.pickerCloseButton}
                        onPress={() => {
                          setShowDatePicker(false);
                          setShowTimePicker(false);
                        }}
                      >
                        <Text style={styles.pickerCloseButtonText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Selected DateTime Summary */}
                  <View style={styles.dateTimeSummary}>
                    <Text style={styles.dateTimeSummaryText}>
                      Scheduled for: {formatDate(selectedDate)} at {formatTime(selectedTime)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
            <Text style={styles.addButtonText}>Add Task</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    maxHeight: '90%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  closeButton: {
    padding: 8,
  },

  // Voice Recording
  voiceSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#374151",
  },
  voiceContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  voiceButtonContainer: {
    borderRadius: 50,
    padding: 4,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  voiceButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  voiceHint: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
  },

  // Input Section
  inputSection: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: "top",
  },

  // Priority
  prioritySection: {
    marginBottom: 16,
  },
  priorityButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  priorityButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#D1D5DB",
  },
  priorityText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
  },

  // Schedule Section
  scheduleSection: {
    marginTop: 16,
  },
  scheduleToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  scheduleLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: "#111827",
    flex: 1,
  },
  toggle: {
    width: 40,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    padding: 2,
  },
  toggleActive: {
    backgroundColor: "#3B82F6",
  },
  toggleThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignSelf: "flex-start",
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },

  // Date Time Picker Styles
  dateTimeContainer: {
    marginTop: 12,
  },
  dateTimeButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: "#F9FAFB",
  },
  dateTimeButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: "#111827",
    flex: 1,
    marginLeft: 8,
  },
  dateTimePicker: {
    backgroundColor: "#fff",
    marginVertical: 10,
  },
  pickerCloseContainer: {
    alignItems: "flex-end",
    marginTop: 8,
  },
  pickerCloseButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  pickerCloseButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  dateTimeSummary: {
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  dateTimeSummaryText: {
    fontSize: 14,
    color: "#1D4ED8",
    textAlign: "center",
    fontWeight: "500",
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#374151",
    fontWeight: "600",
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#3B82F6",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});