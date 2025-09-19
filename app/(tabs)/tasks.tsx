import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert 
} from 'react-native';
import { 
  SquareCheck as CheckSquare, Square, CreditCard as Edit2, Trash2, Calendar, Plus 
} from 'lucide-react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import TopNavBar from '@/components/TopNavBar';
import AddTaskModal from '@/components/AddTaskModal';

interface Task {
  id: string; // React side ID mapped from MongoDB _id
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  scheduled?: boolean;
  scheduledTime?: string | null;
  description?: string;
}

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const API_BASE = 'http://localhost:5000'; // Replace YOUR_PC_IP with your local machine IP

  // Fetch tasks from backend
  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_BASE}/tasks`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const mappedTasks = data.map(t => ({
          id: t._id, // map MongoDB _id to id
          title: t.title ?? 'Untitled',
          completed: t.completed ?? false,
          priority: t.priority ?? 'low',
          scheduled: t.scheduled ?? false,
          scheduledTime: t.scheduledDate ?? null,
          description: t.description ?? '',
        }));
        setTasks(mappedTasks);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Toggle task completion
  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (!res.ok) throw new Error('Failed to update task');

      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update task.');
    }
  };

  // Delete task
  const deleteTask = (taskId?: string) => {
  if (!taskId){
    Alert.alert('Error', 'Task ID is missing.');
    return;
  } ;

  Alert.alert(
    'Delete Task',
    'Are you sure you want to delete this task?',
    [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(`http://localhost:5000/tasks/${taskId}`, {
              method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete task');

            setTasks(prev => prev.filter(t => t._id !== taskId));
          } catch (err) {
            console.error('Failed to delete task:', err);
            Alert.alert('Error', 'Failed to delete task.');
          }
        }
      }
    ]
  );
};


  // Add new task
  const addTask = async (newTask: Omit<Task, 'id' | 'completed'>) => {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...newTask, 
          scheduled: newTask.scheduled || false 
        }),
      });
      const data = await res.json();
      if (data._id) {
        setTasks(prev => [...prev, { ...data, id: data._id }]);
        setShowAddModal(false);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to add task.');
    }
  };

  const editTask = (taskId: string) => {
    Alert.alert('Edit Task', 'Feature coming soon');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  if (!fontsLoaded) return null;

  const renderTask = (task: Task) => (
    <View key={task.id} style={[styles.taskCard, task.completed && styles.completedTask]}>
      <TouchableOpacity style={styles.checkboxContainer} onPress={() => toggleTask(task.id)}>
        {task.completed ? <CheckSquare size={24} color="#10B981" /> : <Square size={24} color="#6B7280" />}
      </TouchableOpacity>

      <View style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <Text style={[styles.taskTitle, task.completed && styles.completedTaskTitle]}>{task.title}</Text>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>{task.priority}</Text>
          </View>
        </View>
        {task.description && <Text style={styles.taskDescription}>{task.description}</Text>}
        {task.scheduled && task.scheduledTime && (
          <View style={styles.scheduledInfo}>
            <Calendar size={14} color="#6B7280" />
            <Text style={styles.scheduledTime}>{new Date(task.scheduledTime).toLocaleString()}</Text>
          </View>
        )}
      </View>

      <View style={styles.taskActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => editTask(task.id)}>
          <Edit2 size={18} color="#6B7280" />
        </TouchableOpacity>
       <TouchableOpacity style={styles.actionButton} onPress={() => deleteTask(task.id)}>
  <Trash2 size={18} color="#EF4444" />
</TouchableOpacity>
      </View>
    </View>
  );

  const scheduledTasks = tasks.filter(t => t.scheduled && !t.completed);
  const unscheduledTasks = tasks.filter(t => !t.scheduled && !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <View style={styles.container}>
      <TopNavBar title="Tasks" onNotificationsPress={() => Alert.alert('Notifications', 'You have 3 pending reminders')} />

      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Plus size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {scheduledTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scheduled ({scheduledTasks.length})</Text>
            {scheduledTasks.map(renderTask)}
          </View>
        )}
        {unscheduledTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Unscheduled ({unscheduledTasks.length})</Text>
            {unscheduledTasks.map(renderTask)}
          </View>
        )}
        {completedTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed ({completedTasks.length})</Text>
            {completedTasks.map(renderTask)}
          </View>
        )}
        {tasks.length === 0 && (
          <View style={styles.emptyState}>
            <CheckSquare size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptySubtitle}>Use the button to add your first task</Text>
          </View>
        )}
      </ScrollView>

      <AddTaskModal isVisible={showAddModal} onClose={() => setShowAddModal(false)} onAddTask={addTask} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EBF4FF', justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, paddingHorizontal: 20 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter-SemiBold', color: '#1F2937', marginBottom: 16 },
  taskCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  completedTask: { opacity: 0.6 },
  checkboxContainer: { marginRight: 12 },
  taskContent: { flex: 1 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  taskTitle: { fontSize: 16, fontFamily: 'Inter-Regular', color: '#1F2937', flex: 1, marginRight: 12 },
  completedTaskTitle: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  taskDescription: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#4B5563', marginBottom: 4 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  priorityText: { fontSize: 12, fontFamily: 'Inter-SemiBold', textTransform: 'uppercase' },
  scheduledInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  scheduledTime: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#6B7280', marginLeft: 4 },
  taskActions: { flexDirection: 'row', alignItems: 'center' },
  actionButton: { padding: 8, marginLeft: 4 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 20, fontFamily: 'Inter-SemiBold', color: '#9CA3AF', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 16, fontFamily: 'Inter-Regular', color: '#D1D5DB', textAlign: 'center' },
});
