import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Animated,
  Platform,
  ActivityIndicator,
  PermissionsAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell } from "lucide-react-native";
import AudioRecorderPlayer from "react-native-audio-recorder-player";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";

// Initialize recorder
const audioRecorderPlayer = new AudioRecorderPlayer();
const BACKEND_URL = "http://192.168.1.3:5000"; // <-- Change to your backend IP

// Top Navigation Bar
const TopNavBar = ({ title, onNotificationsPress }) => (
  <View style={styles.topNavBar}>
    <Text style={styles.navTitle}>{title}</Text>
    <TouchableOpacity style={styles.notificationButton} onPress={onNotificationsPress}>
      <Bell size={24} color="#6B7280" />
    </TouchableOpacity>
  </View>
);

export default function VoiceTodoApp() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [recordedUri, setRecordedUri] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // -------------------- Fetch Tasks --------------------
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/tasks`);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchTasks error:", err);
      Alert.alert("Error", "Failed to fetch tasks. Check backend.");
    }
  };

  // -------------------- Pulse Animation --------------------
  useEffect(() => {
    let pulseAnimation;
    if (isRecording) {
      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulseAnimation.start();
    }
    return () => {
      if (pulseAnimation) pulseAnimation.stop();
    };
  }, [isRecording]);

  // -------------------- Permissions --------------------
  const requestMicrophonePermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: "Microphone Permission",
          message: "This app needs access to your microphone to record tasks.",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else if (Platform.OS === "ios") {
      const result = await request(PERMISSIONS.IOS.MICROPHONE);
      return result === RESULTS.GRANTED;
    }
    return true; // web
  };

  // -------------------- Start Recording --------------------
  const startRecording = async () => {
    try {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        Alert.alert("Permission Required", "Enable microphone access.");
        return;
      }

      const result = await audioRecorderPlayer.startRecorder();
      setIsRecording(true);
      setRecordedUri(null);
      console.log("Recording started:", result);
    } catch (err) {
      console.error("startRecording error:", err);
      Alert.alert("Error", err.message);
    }
  };

  // -------------------- Stop Recording --------------------
  const stopRecordingAndProcess = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      await audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      setRecordedUri(result);
      console.log("Recording stopped, URI:", result);

      setIsProcessing(true);

      const formData = new FormData();
      formData.append("audio", {
        uri: result,
        name: `recording.${Platform.OS === "ios" ? "caf" : "m4a"}`,
        type: Platform.OS === "ios" ? "audio/x-caf" : "audio/m4a",
      });

      const response = await fetch(`${BACKEND_URL}/process-voice`, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error(await response.text());
      const backendResult = await response.json();
      console.log("Backend response:", backendResult);

      Alert.alert("Success", backendResult.transcription || "Task added", [
        { text: "OK", onPress: fetchTasks },
      ]);
    } catch (err) {
      console.error("stopRecording error:", err);
      Alert.alert("Error", err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // -------------------- Button Handler --------------------
  const handleRecordPress = async () => {
    if (isRecording) {
      await stopRecordingAndProcess();
    } else {
      await startRecording();
    }
  };

  // -------------------- Render Task --------------------
  const renderTask = ({ item }) => (
    <View style={styles.taskItem}>
      <Text style={styles.taskTitle}>{item.title}</Text>
      {item.scheduledDate && (
        <Text style={styles.taskTime}>{new Date(item.scheduledDate).toLocaleString()}</Text>
      )}
      {item.completed && <Text style={styles.completedText}>✓ Completed</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TopNavBar
        title="TODOise"
        onNotificationsPress={() => Alert.alert("Notifications", "No new alerts")}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Voice TODO</Text>
        <Text style={styles.subtitle}>Tap to record your task</Text>

        <Animated.View style={{ transform: [{ scale: isRecording ? pulseAnim : 1 }] }}>
          <TouchableOpacity
            style={[styles.recordButton, { backgroundColor: isRecording ? "#EF4444" : "#3B82F6" }]}
            onPress={handleRecordPress}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.recordButtonText}>{isRecording ? "Stop & Save" : "Record Task"}</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>Your Tasks ({tasks.length})</Text>
          {tasks.length === 0 ? (
            <Text style={styles.emptyStateText}>No tasks yet</Text>
          ) : (
            <FlatList
              data={tasks}
              keyExtractor={(item) => item._id || item.id}
              renderItem={renderTask}
              contentContainerStyle={styles.tasksList}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

// -------------------- Styles --------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  topNavBar: { flexDirection: "row", justifyContent: "space-between", padding: 16, backgroundColor: "#FFF" },
  navTitle: { fontSize: 22, fontWeight: "700", color: "#1F2937" },
  notificationButton: { padding: 8 },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: "700", textAlign: "center", marginVertical: 12 },
  subtitle: { fontSize: 16, color: "#6B7280", textAlign: "center", marginBottom: 20 },
  recordButton: { width: 180, height: 70, borderRadius: 35, justifyContent: "center", alignItems: "center", alignSelf: "center", marginBottom: 30 },
  recordButtonText: { color: "#FFF", fontSize: 18, fontWeight: "600" },
  tasksSection: { flex: 1 },
  sectionTitle: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  tasksList: { paddingBottom: 20 },
  taskItem: { backgroundColor: "#FFF", padding: 16, borderRadius: 10, marginBottom: 12 },
  taskTitle: { fontSize: 16, fontWeight: "600" },
  taskTime: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  completedText: { color: "#10B981", marginTop: 4, fontWeight: "500" },
  emptyStateText: { textAlign: "center", color: "#9CA3AF", marginTop: 40, fontSize: 16 },
});
