import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { registerRequest } from '../services/bibliotecaService';

export function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    nombre: '',
    matricula: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const { nombre, matricula, email, password, confirmPassword } = formData;
    if (!nombre.trim() || !matricula.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Campos incompletos', 'Por favor llena todos los campos.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    try {
      setLoading(true);
      await registerRequest({ nombre, matricula, email, password });
      Alert.alert('Registro exitoso', 'Tu cuenta fue creada. Ahora inicia sesión.', [
        { text: 'Ir a Login', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (err) {
      Alert.alert('Error al registrar', err.message || 'No se pudo completar el registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Registro de estudiantes UTR</Text>

        <Text style={styles.label}>Nombre completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Braulio Martínez"
          placeholderTextColor="#94A3B8"
          value={formData.nombre}
          onChangeText={(t) => handleChange('nombre', t)}
        />

        <Text style={styles.label}>Matrícula</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. 23040112"
          placeholderTextColor="#94A3B8"
          value={formData.matricula}
          onChangeText={(t) => handleChange('matricula', t)}
        />

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="alumno@utr.edu.mx"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(t) => handleChange('email', t)}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          value={formData.password}
          onChangeText={(t) => handleChange('password', t)}
        />

        <Text style={styles.label}>Confirmar contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          value={formData.confirmPassword}
          onChangeText={(t) => handleChange('confirmPassword', t)}
        />

        <Pressable
          style={[styles.btnPrimary, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.btnPrimaryText}>Registrarse</Text>
          )}
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Login')} style={styles.linkRow}>
          <Text style={styles.linkMuted}>¿Ya tienes cuenta? </Text>
          <Text style={styles.linkBold}>Inicia sesión aquí</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#0F172A', marginTop: 12 },
  subtitle: { fontSize: 14, color: '#475569', marginBottom: 20 },
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
    marginBottom: 12,
  },
  btnPrimary: {
    height: 46,
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { backgroundColor: '#94A3B8' },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  linkMuted: { color: '#475569', fontSize: 14 },
  linkBold: { color: '#1D4ED8', fontSize: 14, fontWeight: '600' },
});