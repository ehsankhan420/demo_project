
import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import * as Crypto from 'expo-crypto';

const BASE_URL = "http://0.0.0.0:8000";

export default function BiometricVerification() {
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'facial' | null>(null);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOTP] = useState('');

  useEffect(() => {
    checkDeviceCompatibility();
  }, []);

  const checkDeviceCompatibility = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!compatible || !enrolled) {
        setShowOTP(true);
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
      setShowOTP(true);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify your identity',
        disableDeviceFallback: false,
        fallbackLabel: 'Use OTP',
      });

      if (result.success) {
        const biometricHash = await generateBiometricHash();
        const response = await fetch(`${BASE_URL}/verify_biometric`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            biometric_data: biometricHash,
            biometric_type: biometricType,
          }),
        });

        if (response.ok) {
          router.push('/(app)/(tabs)');
        } else {
          Alert.alert('Error', 'Biometric verification failed');
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

  const generateBiometricHash = async () => {
    const randomString = `${Date.now()}-${biometricType}`;
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      randomString
    );
  };

  const verifyOTP = async () => {
    // Implement OTP verification here
    if (otp.length === 6) {
      router.push('/(app)/(tabs)');
    } else {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
    }
  };

  if (showOTP) {
    return (
      <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Enter OTP</Text>
          <TextInput
            style={styles.input}
            value={otp}
            onChangeText={setOTP}
            placeholder="Enter 6-digit OTP"
            placeholderTextColor="#rgba(255,255,255,0.7)"
            keyboardType="number-pad"
            maxLength={6}
          />
          <TouchableOpacity style={styles.authButton} onPress={verifyOTP}>
            <Text style={styles.authButtonText}>Verify OTP</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify Identity</Text>
        <TouchableOpacity style={styles.biometricContainer} onPress={handleBiometricAuth}>
          <Ionicons 
            name={biometricType === 'fingerprint' ? 'finger-print' : 'scan'} 
            size={80} 
            color="#fff" 
          />
        </TouchableOpacity>
        <Text style={styles.description}>
          {biometricType === 'facial' 
            ? 'Use Face ID to verify your identity' 
            : 'Use your fingerprint to verify your identity'}
        </Text>
        <TouchableOpacity style={styles.authButton} onPress={handleBiometricAuth}>
          <Text style={styles.authButtonText}>Verify</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.alternativeButton} onPress={() => setShowOTP(true)}>
          <Text style={styles.alternativeButtonText}>Use OTP Instead</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  input: {
    width: '100%',
    maxWidth: 300,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    color: '#fff',
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
});
