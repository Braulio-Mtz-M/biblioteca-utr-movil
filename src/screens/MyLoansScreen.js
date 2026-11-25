import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getLoansRequest } from '../services/bibliotecaService';

export function MyLoansScreen() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const fetchLoans = async () => {
        try {
          setLoading(true);
          const data = await getLoansRequest();
          if (active) setLoans(Array.isArray(data) ? data : []);
        } catch (err) {
          if (active) Alert.alert('Error', err.message || 'No se pudieron cargar tus préstamos.');
        } finally {
          if (active) setLoading(false);
        }
      };
      fetchLoans();
      return () => {
        active = false;
      };
    }, [])
  );

  const renderLoan = ({ item }) => {
    const isReturned = item.estatus === 'DEVUELTO';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.bookTitle}>{item.libro || item.book?.titulo}</Text>
          <View style={[styles.badge, isReturned ? styles.bgSuccess : styles.bgWarning]}>
            <Text style={isReturned ? styles.textSuccess : styles.textWarning}>{item.estatus}</Text>
          </View>
        </View>
        <Text style={styles.dateText}>Préstamo: {item.fechaPrestamo?.slice(0, 10) || '—'}</Text>
        <Text style={styles.dateText}>Límite: {item.fechaDevolucionEstimada?.slice(0, 10) || '—'}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.headerTitle}>Mis Préstamos</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={loans}
          keyExtractor={(item) => String(item.loanId || item.id)}
          renderItem={renderLoan}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aún no tienes préstamos registrados.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#0F172A', padding: 16 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bookTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', flex: 1, paddingRight: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  bgSuccess: { backgroundColor: '#DCFCE7' },
  bgWarning: { backgroundColor: '#FEF3C7' },
  textSuccess: { color: '#166534', fontSize: 12, fontWeight: '600' },
  textWarning: { color: '#92400E', fontSize: 12, fontWeight: '600' },
  dateText: { fontSize: 13, color: '#475569', marginTop: 2 },
  emptyText: { textAlign: 'center', color: '#64748B', marginTop: 32 },
});