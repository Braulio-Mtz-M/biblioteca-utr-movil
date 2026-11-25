import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { loginRequest } from '../services/bibliotecaService';

export function LoginScreen({ navigation }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa tu correo y contraseña.');
      return;
    }

    try {
      setLoading(true);
      const data = await loginRequest(formData);
      await login(data.token, data.user);
    } catch (err) {
      Alert.alert('Error de acceso', err.message || 'Credenciales incorrectas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconBox}>
          <BookOpen size={36} color="#1E3A8A" />
        </View>
        <Text style={styles.title}>Biblioteca UTR</Text>
        <Text style={styles.subtitle}>Inicia sesión con tu cuenta institucional</Text>

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="alumno@equipo-a2.utr"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(text) => handleChange('email', text)}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          value={formData.password}
          onChangeText={(text) => handleChange('password', text)}
        />

        <Pressable
          style={[styles.btnPrimary, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.btnPrimaryText}>Iniciar Sesión</Text>
          )}
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Register')} style={styles.linkRow}>
          <Text style={styles.linkMuted}>¿No tienes cuenta? </Text>
          <Text style={styles.linkBold}>Regístrate aquí</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center' },
  content: { paddingHorizontal: 24 },
  iconBox: {
    alignSelf: 'center',
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#0F172A', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#475569', textAlign: 'center', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: '#475569', marginBottom: 6 },
  input: {
    height: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 14,
  },
  btnPrimary: {
    height: 46,
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  btnDisabled: { backgroundColor: '#94A3B8' },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  linkMuted: { color: '#475569', fontSize: 14 },
  linkBold: { color: '#1D4ED8', fontSize: 14, fontWeight: '600' },
});