import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Search } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { createLoanRequest, getBooksRequest } from '../services/bibliotecaService';

const CATEGORIAS = ['Todas', 'Software', 'Redes', 'Bases de Datos', 'Seguridad', 'Matemáticas'];

const getDefaultReturnDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0];
};

export function CatalogScreen() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [loading, setLoading] = useState(true);

  const [selectedBook, setSelectedBook] = useState(null);
  const [fechaDevolucionEstimada, setFechaDevolucionEstimada] = useState(getDefaultReturnDate());
  const [submitting, setSubmitting] = useState(false);

  const { user, logout } = useAuth();

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const catFilter = categoria === 'Todas' ? '' : categoria;
      const data = await getBooksRequest(search, catFilter);
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo cargar el catálogo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [search, categoria]);

  const handleSelect = (book) => {
    if (book.stockDisponible <= 0) return;
    setSelectedBook(book);
    setFechaDevolucionEstimada(getDefaultReturnDate());
  };

  const handleSubmit = async () => {
    if (!fechaDevolucionEstimada.trim()) {
      Alert.alert('Fecha requerida', 'Ingresa la fecha en formato AAAA-MM-DD.');
      return;
    }

    try {
      setSubmitting(true);
      await createLoanRequest({
        bookId: selectedBook.id,
        userId: user.id,
        fechaDevolucionEstimada: fechaDevolucionEstimada.trim(),
      });
      Alert.alert('Éxito', 'Préstamo registrado correctamente.');
      setSelectedBook(null);
      fetchBooks();
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo solicitar el préstamo.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderBook = ({ item }) => {
    const disponible = item.stockDisponible > 0;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.badgeCat}>
            <Text style={styles.badgeCatText}>{item.categoria}</Text>
          </View>
          <View style={[styles.badgeStatus, disponible ? styles.bgSuccess : styles.bgDanger]}>
            <Text style={disponible ? styles.textSuccess : styles.textDanger}>
              {disponible ? `Disponible: ${item.stockDisponible}` : 'Agotado'}
            </Text>
          </View>
        </View>

        <Text style={styles.bookTitle}>{item.titulo}</Text>
        <Text style={styles.bookAuthor}>{item.autor}</Text>
        <Text style={styles.bookIsbn}>ISBN: {item.isbn}</Text>

        <Pressable
          style={[styles.btnPrimary, !disponible && styles.btnDisabled]}
          disabled={!disponible}
          onPress={() => handleSelect(item)}
        >
          <Text style={[styles.btnPrimaryText, !disponible && styles.btnDisabledText]}>
            {disponible ? 'Solicitar Préstamo' : 'Sin Stock'}
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Catálogo de Libros</Text>
        <Pressable onPress={logout} style={styles.logoutBtn}>
          <LogOut size={18} color="#991B1B" />
        </Pressable>
      </View>

      <View style={styles.searchBox}>
        <Search size={18} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por título o autor..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.chipsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIAS.map((cat) => {
            const active = categoria === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setCategoria(cat)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderBook}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No se encontraron libros con esos filtros.</Text>
          }
        />
      )}

      <Modal visible={Boolean(selectedBook)} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Solicitar Préstamo</Text>

            {selectedBook && (
              <View style={styles.summaryBox}>
                <Text style={styles.bookTitle}>{selectedBook.titulo}</Text>
                <Text style={styles.bookAuthor}>Autor: {selectedBook.autor}</Text>
                <Text style={styles.bookIsbn}>ISBN: {selectedBook.isbn}</Text>
              </View>
            )}

            <Text style={styles.label}>Fecha de devolución estimada (AAAA-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2026-12-02"
              value={fechaDevolucionEstimada}
              onChangeText={setFechaDevolucionEstimada}
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.btnSecondary} onPress={() => setSelectedBook(null)}>
                <Text style={styles.btnSecondaryText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.btnPrimary, { flex: 1 }, submitting && styles.btnDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <Text style={styles.btnPrimaryText}>
                  {submitting ? 'Confirmando...' : 'Confirmar Préstamo'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#0F172A' },
  logoutBtn: { padding: 8, backgroundColor: '#FEE2E2', borderRadius: 8 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 44,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#0F172A' },
  chipsWrapper: { paddingVertical: 12, paddingLeft: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  chipActive: { backgroundColor: '#1E3A8A' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#FFFFFF' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  badgeCat: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeCatText: { color: '#1E3A8A', fontSize: 12, fontWeight: '600' },
  badgeStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  bgSuccess: { backgroundColor: '#DCFCE7' },
  bgDanger: { backgroundColor: '#FEE2E2' },
  textSuccess: { color: '#166534', fontSize: 12, fontWeight: '600' },
  textDanger: { color: '#991B1B', fontSize: 12, fontWeight: '600' },
  bookTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  bookAuthor: { fontSize: 14, color: '#475569', marginTop: 2 },
  bookIsbn: { fontSize: 12, color: '#94A3B8', marginTop: 2, marginBottom: 12 },
  btnPrimary: {
    height: 42,
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabled: { backgroundColor: '#CBD5E1' },
  btnPrimaryText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  btnDisabledText: { color: '#64748B' },
  emptyText: { textAlign: 'center', color: '#64748B', marginTop: 32 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  summaryBox: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '500', color: '#475569', marginBottom: 6 },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  modalActions: { flexDirection: 'row', gap: 10 },
  btnSecondary: {
    height: 42,
    paddingHorizontal: 16,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSecondaryText: { color: '#0F172A', fontWeight: '600' },
});