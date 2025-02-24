
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const BASE_URL = "http://localhost:8000";

export default function BiometricRegistration() {
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'facial' | null>(null);

  useEffect(() => {
    checkDeviceCompatibility();
  }, []);

  const checkDeviceCompatibility = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!compatible || !enrolled) {
        Alert.alert(
          "Not Available",
          "Biometric authentication is not available on your device.",
          [{ text: "OK", onPress: () => router.back() }]
        );
        return;
      }

      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('facial');
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('fingerprint');
      }
    } catch (error) {
      console.error('Biometric check error:', error);
      Alert.alert("Error", "Failed to check biometric compatibility");
    }
  };

  const handleRegister = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Register your biometric data',
        disableDeviceFallback: true,
      });

      if (result.success) {
        const randomString = `${Date.now()}-${biometricType}`;
        const response = await fetch(`${BASE_URL}/register_biometric`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            biometric_type: biometricType,
            biometric_data: randomString,
          }),
        });

        if (response.ok) {
          Alert.alert(
            "Success",
            "Biometric data registered successfully",
            [{ text: "OK", onPress: () => router.push('/(app)/(tabs)') }]
          );
        } else {
          Alert.alert("Error", "Failed to register biometric data");
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert("Error", "Failed to register biometric data");
    }
  };

  return (
    <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Register Biometric</Text>
        
        <View style={styles.iconContainer}>
          <Ionicons 
            name={biometricType === 'fingerprint' ? 'finger-print' : 'scan'} 
            size={80} 
            color="#fff" 
          />
        </View>

        <Text style={styles.description}>
          {biometricType === 'facial' 
            ? 'Register your Face ID for secure access' 
            : 'Register your fingerprint for secure access'}
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register Now</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={() => router.push('/(app)/(tabs)')}
        >
          <Text style={styles.skipButtonText}>Skip for Now</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 40,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    maxWidth: 300,
    marginBottom: 15,
  },
  buttonText: {
    color: '#1e3c72',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  skipButton: {
    paddingVertical: 15,
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});
