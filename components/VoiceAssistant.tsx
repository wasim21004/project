import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Mic, MicOff, Volume2 } from 'lucide-react-native';

interface VoiceAssistantProps {
  onVoiceCommand?: (command: string) => void;
  onSpeakResponse?: (response: string) => void;
}

export default function VoiceAssistant({ onVoiceCommand, onSpeakResponse }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isListening || isSpeaking) {
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
  }, [isListening, isSpeaking]);

  const handleVoicePress = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    setIsListening(true);
    
    // Mock voice recognition after 3 seconds
    setTimeout(() => {
      const mockCommand = "What are my remaining tasks?";
      setIsListening(false);
      onVoiceCommand?.(mockCommand);
      
      // Mock assistant response
      const mockResponse = "You have 3 pending tasks: Review quarterly reports, Update project documentation, and Call insurance company.";
      speakResponse(mockResponse);
    }, 3000);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const speakResponse = (response: string) => {
    setIsSpeaking(true);
    onSpeakResponse?.(response);
    
    // Mock speaking duration based on response length
    const speakingDuration = Math.max(2000, response.length * 50);
    setTimeout(() => {
      setIsSpeaking(false);
    }, speakingDuration);
  };

  const getButtonColor = () => {
    if (isSpeaking) return '#10B981'; // Green for speaking
    if (isListening) return '#EF4444'; // Red for listening
    return '#3B82F6'; // Blue for idle
  };

  const getButtonIcon = () => {
    if (isSpeaking) return <Volume2 size={28} color="#FFFFFF" />;
    if (isListening) return <MicOff size={28} color="#FFFFFF" />;
    return <Mic size={28} color="#FFFFFF" />;
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            transform: [{ scale: pulseAnim }],
            shadowColor: getButtonColor(),
            shadowOpacity: glowAnim,
            shadowRadius: Animated.multiply(glowAnim, 20),
            elevation: isListening || isSpeaking ? 8 : 4,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: getButtonColor() }
          ]}
          onPress={handleVoicePress}
          activeOpacity={0.8}
          disabled={isSpeaking}
        >
          {getButtonIcon()}
        </TouchableOpacity>
      </Animated.View>
      
      {(isListening || isSpeaking) && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {isListening ? 'Listening...' : 'Speaking...'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  buttonContainer: {
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    marginTop: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});