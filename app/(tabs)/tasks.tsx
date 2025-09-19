import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { SquareCheck as CheckSquare, Square, CreditCard as Edit2, Trash2, Calendar, Plus } from 'lucide-react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import TopNavBar from '@/components/TopNavBar';
import AddTaskModal from '@/components/AddTaskModal';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  scheduled?: boolean;
  scheduledTime?: string;
  description?: string;
}

export default function TasksScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
  ]);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const addTask = (newTask: Omit<Task, 'id' | 'completed'>) => {
    const task: Task = { ...newTask, id: Date.now().toString(), completed: false };
    setTasks([...tasks, task]);
  };

  const deleteTask = (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => setTasks(tasks.filter(task => task.id !== taskId))
        }
      ]
    );
  };

  const editTask = (taskId: string) => {
    Alert.alert('Edit Task', 'Task editing feature coming soon!', [{ text: 'OK' }]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const scheduledTasks = tasks.filter(task => task.scheduled && !task.completed);
  const unscheduledTasks = tasks.filter(task => !task.scheduled && !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

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
            <Text style={styles.scheduledTime}>{task.scheduledTime}</Text>
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

  return (
    <View style={styles.container}>
      <TopNavBar 
        title="Tasks" 
        onNotificationsPress={() => Alert.alert('Notifications', 'You have 3 pending reminders')} 
      />

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
            <Text style={styles.emptySubtitle}>Use the voice button to add your first task</Text>
          </View>
        )}
      </ScrollView>

      <AddTaskModal
        isVisible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddTask={addTask}
      />
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
