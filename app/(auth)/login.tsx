"use client"

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Animated,
  Easing,
  ScrollView,
  KeyboardAvoidingView,
  Modal,
  Dimensions,
} from "react-native"
import { router } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import axios from "axios"
import Reanimated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated"

const BASE_URL = "http://localhost:8000" // Change this if running on a device

interface ApiResponse {
  success: boolean
  message?: string
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

const { width } = Dimensions.get("window")

export default function LoginScreen() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState("")
  const [fingerprintData, setFingerprintData] = useState("")
  const [message, setMessage] = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const [modalMessage, setModalMessage] = useState("")

  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const buttonScale = useSharedValue(1)
  const inputFocus = useSharedValue(0)

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start()
  }, [fadeAnim, scaleAnim])

  const handleLogin = async () => {
    if (!username || !password) {
      setModalMessage("Please enter both username and password")
      setModalVisible(true)
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post<ApiResponse>(`${BASE_URL}/login`, {
        username,
        password,
      })

      if (response.data.success) {
        setModalMessage("Login Successful")
        setModalVisible(true)
        setTimeout(() => {
          router.push("/(app)/(tabs)")
        }, 1500)
      } else {
        setModalMessage("Login Failed: " + response.data.message)
        setModalVisible(true)
      }
    } catch (error) {
      setModalMessage("Error: Invalid credentials")
      setModalVisible(true)
    } finally {
      setIsLoading(false)
    }
  }

  const registerFingerprint = async () => {
    if (!userId || !fingerprintData) {
      setModalMessage("Please enter both User ID and Fingerprint Data")
      setModalVisible(true)
      return
    }

    try {
      const response = await axios.post<ApiResponse>(`${BASE_URL}/register_fingerprint`, {
        user_id: userId,
        fingerprint_data: fingerprintData,
      })

      setModalMessage(response.data.message || "Fingerprint registered successfully")
      setModalVisible(true)
    } catch (error) {
      setModalMessage("Error registering fingerprint")
      setModalVisible(true)
    }
  }

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(buttonScale.value) }],
    }
  })

  const onPressIn = () => {
    buttonScale.value = withSpring(0.95)
  }

  const onPressOut = () => {
    buttonScale.value = withSpring(1)
  }

  const fadeInStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(1, { duration: 1000 }),
      transform: [{ translateY: withTiming(0, { duration: 1000 }) }],
    }
  })

  const inputAnimatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: "transparent",
      borderWidth: 0,
      shadowOpacity: 0,
      shadowColor: "transparent",
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 0,
      elevation: 0,
    }
  })

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      outline: inputFocus.value === 1 ? "2px solid black" : "none",
      borderColor: "transparent",
      borderWidth: 0,
      shadowOpacity: 0,
      shadowColor: "transparent",
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 0,
      elevation: 0,
    }
  })

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <AnimatedLinearGradient colors={["#2a4b87", "#5373ac", "#688b96"]} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.logoContainer}>
              <Image
                source={{
                  uri: "https://scontent.fisb5-1.fna.fbcdn.net/v/t39.30808-6/323331746_702072514795829_7518306954137304748_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=ECc2SVtZUPsQ7kNvgGl_q-p&_nc_oc=AdhLFJcB2cMYl3F_QniQd5SR4hzeT7IBvujD4VcGddXJW_Oa0YxhrNI0jkDbVhZyfNw&_nc_zt=23&_nc_ht=scontent.fisb5-1.fna&_nc_gid=ALqSEWMsKIDNdmc9zbgKsno&oh=00_AYDq0r9_QP8zTgZEB70aK9gUdru9T66agMk1hCbN3dxFcw&oe=67C09285",
                }}
                style={styles.logo}
                resizeMode="contain"
              />
              <Animated.Text style={[styles.bankName, { opacity: fadeAnim }]}>Faysal Bank</Animated.Text>
            </View>

            <View style={styles.formContainer}>
              <Reanimated.View style={[styles.inputContainer, inputAnimatedStyle, fadeInStyle, containerAnimatedStyle]}>
                <Ionicons name="person-outline" size={20} color="#2a4b87" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#5373ac"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  onFocus={() => (inputFocus.value = withTiming(1))}
                  onBlur={() => (inputFocus.value = withTiming(0))}
                />
              </Reanimated.View>

              <Reanimated.View style={[styles.inputContainer, inputAnimatedStyle, fadeInStyle, containerAnimatedStyle]}>
                <Ionicons name="lock-closed-outline" size={20} color="#2a4b87" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#5373ac"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  onFocus={() => (inputFocus.value = withTiming(1))}
                  onBlur={() => (inputFocus.value = withTiming(0))}
                />
              </Reanimated.View>

              <Reanimated.View style={[styles.forgotPassword, fadeInStyle]}>
              <TouchableOpacity onPress={() => router.push("/forgotPassword")}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </Reanimated.View>

              <Reanimated.View style={[animatedButtonStyle, fadeInStyle]}>
                <AnimatedTouchableOpacity
                  style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  disabled={isLoading}
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                >
                  <Text style={styles.loginButtonText}>{isLoading ? "Logging in..." : "Login"}</Text>
                </AnimatedTouchableOpacity>
              </Reanimated.View>

              <Reanimated.View style={[styles.registerContainer, fadeInStyle]}>
                <Text style={styles.registerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/register")}>
                  <Text style={styles.registerLink}>Register Now</Text>
                </TouchableOpacity>
              </Reanimated.View>

              <Reanimated.View style={[styles.fingerprintContainer, fadeInStyle]}>
                <Reanimated.View style={[styles.inputContainer, inputAnimatedStyle, containerAnimatedStyle]}>
                  <Ionicons name="finger-print-outline" size={20} color="#2a4b87" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="User ID"
                    placeholderTextColor="#5373ac"
                    value={userId}
                    onChangeText={setUserId}
                    onFocus={() => (inputFocus.value = withTiming(1))}
                    onBlur={() => (inputFocus.value = withTiming(0))}
                  />
                </Reanimated.View>
                <Reanimated.View style={[styles.inputContainer, inputAnimatedStyle, containerAnimatedStyle]}>
                  <Ionicons name="scan-outline" size={20} color="#2a4b87" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Fingerprint Data"
                    placeholderTextColor="#5373ac"
                    value={fingerprintData}
                    onChangeText={setFingerprintData}
                    onFocus={() => (inputFocus.value = withTiming(1))}
                    onBlur={() => (inputFocus.value = withTiming(0))}
                  />
                </Reanimated.View>
                <AnimatedTouchableOpacity
                  style={[styles.loginButton, animatedButtonStyle]}
                  onPress={registerFingerprint}
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                >
                  <Text style={styles.loginButtonText}>Register Fingerprint</Text>
                </AnimatedTouchableOpacity>
                {message ? (
                  <Reanimated.Text style={[styles.messageText, fadeInStyle]}>{message}</Reanimated.Text>
                ) : null}
              </Reanimated.View>
            </View>
          </Animated.View>
        </ScrollView>
      </AnimatedLinearGradient>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible)
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  logo: {
    width: 200,
    height: 80,
    marginBottom: 20,
  },
  bankName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#2a4b87",
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: "#fff",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  loginButton: {
    backgroundColor: "#fff",
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#2a4b87",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerText: {
    color: "#fff",
    fontSize: 14,
  },
  registerLink: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  fingerprintContainer: {
    marginTop: 30,
  },
  messageText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 14,
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: "#2a4b87",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
    color: "#2a4b87",
  },
})

