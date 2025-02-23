import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function BiometricAuth() {
  const [isCompatible, setIsCompatible] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'facial' | null>(null);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOTP] = useState('');

  useEffect(() => {
    checkDeviceCompatibility();
  }, []);

  const checkDeviceCompatibility = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      
      if (!compatible) {
        setShowOTP(true);
        return;
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        setShowOTP(true);
        return;
      }

      setIsCompatible(true);

      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (Platform.OS === 'ios') {
        // On iOS, prioritize Face ID
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('facial');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('fingerprint');
        }
      } else {
        // On Android, prioritize fingerprint
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

  const authenticate = async () => {
    if (Platform.OS === 'web') {
      router.push('/(app)/(tabs)');
      return;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: Platform.OS === 'ios' && biometricType === 'facial'
          ? 'Authenticate with Face ID'
          : 'Authenticate with Touch ID',
        disableDeviceFallback: false, // Allow system fallback
        fallbackLabel: 'Use Passcode', // iOS-specific
      });

      if (result.success) {
        router.push('/(app)/(tabs)');
      } else if (result.error === 'user_cancel') {
        // User canceled, do nothing
        return;
      } else {
        // Only show OTP if authentication fails (not canceled)
        setShowOTP(true);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setShowOTP(true);
    }
  };

  const verifyOTP = () => {
    if (otp.length === 6) {
      // In a real app, verify OTP with backend
      router.push('/(app)/(tabs)');
    } else {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
    }
  };

  if (!isCompatible && !showOTP) {
    return null;
  }

  return (
    <LinearGradient
      colors={['#1e3c72', '#2a5298']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Image
          source={{ uri: 'https://www.faysalbank.com/wp-content/themes/faysal/images/logo.png' }}
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

            <TouchableOpacity
              style={styles.authButton}
              onPress={authenticate}
            >
              <Text style={styles.authButtonText}>
                {Platform.OS === 'web' 
                  ? 'Continue to Dashboard' 
                  : `Authenticate with ${biometricType === 'facial' ? 'Face ID' : 'Touch ID'}`}
              </Text>
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
              We've sent a 6-digit code to your registered mobile number
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
            <TouchableOpacity
              style={styles.authButton}
              onPress={verifyOTP}
            >
              <Text style={styles.authButtonText}>Verify OTP</Text>
            </TouchableOpacity>
            {isCompatible && (
              <TouchableOpacity
                style={styles.alternativeButton}
                onPress={() => setShowOTP(false)}
              >
                <Text style={styles.alternativeButtonText}>
                  Back to {biometricType === 'facial' ? 'Face ID' : 'Touch ID'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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