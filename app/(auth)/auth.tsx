import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  Platform, 
  StyleSheet, 
  Image,
  TextInput  
} from 'react-native';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Crypto from 'expo-crypto';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const BASE_URL = "http://localhost:8000";

export default function Auth() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showBiometric, setShowBiometric] = useState(false);
  const [isCompatible, setIsCompatible] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'facial' | null>(null);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOTP] = useState('');

  useEffect(() => {
    checkDeviceCompatibility();
  }, []);

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
      setIsCompatible(compatible && enrolled);
      
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

  const handleLogin = async () => {
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setShowBiometric(true);
      } else {
        Alert.alert('Error', 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to login');
    }
  };

  const authenticateWithBiometric = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with Biometrics',
        disableDeviceFallback: false,
        fallbackLabel: 'Use OTP',
      });

      if (result.success) {
        router.push('/(app)/(tabs)');
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

    // Here you would verify OTP with backend
    router.push('/(app)/(tabs)');
  };

  if (showBiometric && isCompatible) {
    return (
      <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Biometric Authentication</Text>
          <TouchableOpacity style={styles.biometricContainer} onPress={authenticateWithBiometric}>
            <Ionicons 
              name={biometricType === 'fingerprint' ? 'finger-print' : 'scan'} 
              size={80} 
              color="#fff" 
            />
          </TouchableOpacity>
          <Text style={styles.description}>
            {biometricType === 'facial' 
              ? 'Use Face ID to securely access your account' 
              : 'Use your fingerprint to securely access your account'}
          </Text>
          <TouchableOpacity style={styles.authButton} onPress={authenticateWithBiometric}>
            <Text style={styles.authButtonText}>Authenticate</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.alternativeButton} 
            onPress={() => setShowOTP(true)}
          >
            <Text style={styles.alternativeButtonText}>Use OTP Instead</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (showOTP) {
    return (
      <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.container}>
        <View style={styles.content}>
          <View style={styles.otpContainer}>
            <Text style={styles.otpTitle}>Enter OTP</Text>
            <Text style={styles.otpDescription}>
              A 6-digit code has been sent to your registered phone number
            </Text>
            <TextInput
              style={styles.otpInput}
              value={otp}
              onChangeText={setOTP}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="Enter OTP"
              placeholderTextColor="#rgba(255,255,255,0.5)"
            />
            <TouchableOpacity style={styles.authButton} onPress={verifyOTP}>
              <Text style={styles.authButtonText}>Verify OTP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          placeholderTextColor="#rgba(255,255,255,0.5)"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#rgba(255,255,255,0.5)"
          secureTextEntry
        />
        <TouchableOpacity style={styles.authButton} onPress={handleLogin}>
          <Text style={styles.authButtonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.alternativeButton}
          onPress={() => router.push({
            pathname: "/(auth)BiometricRegistration"
          })}
        >
          <Text style={styles.alternativeButtonText}>Register Biometric</Text>
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
    marginBottom: 20,
    paddingHorizontal: 15,
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
  },
});
