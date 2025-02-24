
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, StyleSheet, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';

const BASE_URL = "http://localhost:8000";

export default function BiometricAuth() {
  const [isCompatible, setIsCompatible] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'facial' | null>(null);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOTP] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserId();
    checkDeviceCompatibility();
  }, []);

  const fetchUserId = async () => {
    try {
      const response = await fetch(`${BASE_URL}/get_user_id`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setUserId(data.user_id);
    } catch (error) {
      console.error("Error fetching user ID:", error);
      setShowOTP(true);
    }
  };

  const checkDeviceCompatibility = async () => {
    if (Platform.OS === 'web') {
      setShowOTP(true);
      return;
    }

    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        setShowOTP(true);
        return;
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        router.push('/BiometricRegistration');
        return;
      }

      setIsCompatible(true);
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (Platform.OS === 'ios') {
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('facial');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('fingerprint');
        }
      } else {
        if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('fingerprint');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('facial');
        }
      }
    } catch (error) {
      console.error('Biometric check error:', error);
      setShowOTP(true);
    }
  };

  const generateBiometricHash = async () => {
    try {
      const randomString = `${userId}-${biometricType}-${Date.now()}`;
      return await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        randomString
      );
    } catch (error) {
      console.error("Error generating biometric hash:", error);
      return null;
    }
  };

  const authenticate = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID not found.");
      return;
    }

    if (Platform.OS === 'web') {
      setShowOTP(true);
      return;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with Biometrics',
        disableDeviceFallback: false,
        fallbackLabel: 'Use OTP',
      });

      if (result.success) {
        const biometricHash = await generateBiometricHash();
        if (!biometricHash) {
          setShowOTP(true);
          return;
        }

        const response = await fetch(`${BASE_URL}/verify_biometric`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            biometric_data: biometricHash,
            biometric_type: biometricType,
          }),
        });

        if (response.ok) {
          router.push('/(app)/(tabs)');
        } else {
          Alert.alert("Error", "Biometric verification failed");
          setShowOTP(true);
        }
      } else {
        setShowOTP(true);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setShowOTP(true);
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    try {
      // Here you would typically verify the OTP with your backend
      // For now, we'll simulate a successful verification
      router.push('/(app)/(tabs)');
    } catch (error) {
      console.error('OTP verification error:', error);
      Alert.alert('Error', 'Failed to verify OTP');
    }
  };

  return (
    <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.container}>
      <View style={styles.content}>
        <Image
          source={{ uri: 'https://your-app-logo.com/logo.png' }}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>Secure Authentication</Text>
        
        {!showOTP && isCompatible ? (
          <>
            <View style={styles.biometricContainer}>
              <Ionicons 
                name={biometricType === 'fingerprint' ? 'finger-print' : 'scan'} 
                size={80} 
                color="#fff" 
              />
            </View>

            <Text style={styles.description}>
              {biometricType === 'facial' 
                ? 'Use Face ID to securely access your account' 
                : 'Use your fingerprint to securely access your account'}
            </Text>

            <TouchableOpacity style={styles.authButton} onPress={authenticate}>
              <Text style={styles.authButtonText}>Authenticate</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.alternativeButton} 
              onPress={() => setShowOTP(true)}
            >
              <Text style={styles.alternativeButtonText}>Use OTP Instead</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.otpContainer}>
            <Text style={styles.otpTitle}>Enter OTP</Text>
            <Text style={styles.otpDescription}>
              Please enter the 6-digit code sent to your registered email
            </Text>
            <TextInput
              style={styles.otpInput}
              value={otp}
              onChangeText={setOTP}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
            <TouchableOpacity style={styles.authButton} onPress={verifyOTP}>
              <Text style={styles.authButtonText}>Verify OTP</Text>
            </TouchableOpacity>
          </View>
        )}
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
  logo: {
    width: 200,
    height: 80,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  biometricContainer: {
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
  authButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    maxWidth: 300,
    marginBottom: 15,
  },
  authButtonText: {
    color: '#1e3c72',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  alternativeButton: {
    paddingVertical: 15,
  },
  alternativeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  otpContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  otpTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  otpDescription: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  otpInput: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 15,
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
});
