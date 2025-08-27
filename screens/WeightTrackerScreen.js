import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function WeightTrackerScreen() {
  const [unit, setUnit] = useState('kg'); // display unit
  const [weights, setWeights] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Modal inputs
  const [inputWeight, setInputWeight] = useState('');
  const [inputUnit, setInputUnit] = useState('kg');
  const [stoneInput, setStoneInput] = useState('');
  const [lbsInput, setLbsInput] = useState('');
  const [XPEarned, setXPEarned] = useState();


  useEffect(() => {
    // Mock test data
    const mockData = [
      { date: '2025-08-19', weight: 70.2 },
      { date: '2025-08-20', weight: 70.5 },
      { date: '2025-08-21', weight: 70.1 },
    ];
    setWeights(mockData);
  }, []);

  // Conversion helpers
  const lbsToKg = (lbs) => lbs / 2.20462;
  const stToKg = (st, lbs = 0) => (st * 14 + lbs) / 2.20462;
  const kgToLbs = (kg) => kg * 2.20462;
  const kgToSt = (kg) => {
    const lbs = kgToLbs(kg);
    const st = Math.floor(lbs / 14);
    const remainder = Math.round(lbs % 14); // whole lbs instead of decimal
    return `${st}st ${remainder}lbs`;
  };

  // Convert for display
  const convertWeight = (kg) => {
    if (unit === 'kg') return `${kg.toFixed(1)} kg`;
    if (unit === 'lbs') return `${kgToLbs(kg).toFixed(1)} lbs`;
    if (unit === 'st') return kgToSt(kg);
  };

  // Chart data (numbers only)
  const chartData =
    unit === 'st'
      ? weights.map((w) => parseFloat((kgToLbs(w.weight) / 14).toFixed(2))) // decimal stones
      : weights.map((w) =>
          unit === 'kg' ? w.weight : parseFloat(kgToLbs(w.weight).toFixed(1))
        );

  const labels = weights.map((w) =>
    new Date(w.date).toLocaleDateString('en-GB', { weekday: 'short' })
  );

  // Save new weight entry
  const saveWeight = () => {
    let weightKg = 0;

    if (inputUnit === 'kg') {
      weightKg = parseFloat(inputWeight);
    } else if (inputUnit === 'lbs') {
      weightKg = lbsToKg(parseFloat(inputWeight));
    } else if (inputUnit === 'st') {
      const st = parseFloat(stoneInput) || 0;
      const lbs = parseFloat(lbsInput) || 0;
      weightKg = stToKg(st, lbs);
    }

    if (!isNaN(weightKg) && weightKg > 0) {
      const newEntry = { date: new Date().toISOString(), weight: weightKg };
      setWeights((prev) => [...prev, newEntry]);
      setInputWeight('');
      setStoneInput('');
      setLbsInput('');
      setModalVisible(false);
      setXPEarned(100); 
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Earn XP by keeping track of your weight!</Text>
      <View style={styles.toggleWrapper}>
        {/* Button to open modal to record daily weight */}
        <TouchableOpacity style={styles.recordButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.recordButtonText}>Record your Daily Weight</Text>
        </TouchableOpacity>
      </View>

      {/* Toggle kg/lbs/st */}
      <View style={styles.toggleWrapper}>
        {['kg', 'lbs', 'st'].map((value) => (
          <TouchableOpacity
            key={value}
            style={[styles.toggleButton, unit === value && styles.activeToggle]}
            onPress={() => setUnit(value)}
          >
            <Text
              style={[
                styles.toggleText,
                unit === value && styles.activeToggleText,
              ]}
            >
              {value}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart */}
      {chartData.length > 0 && (
        <LineChart
          data={{
            labels,
            datasets: [{ data: chartData }],
          }}
          width={screenWidth - 30}
          height={220}
          yAxisSuffix={` ${unit}`}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      )}

      {/* Recent entries */}
      <Text style={styles.subtitle}>Recent Entries</Text>
      {weights.slice(-7).map((w, i) => (
        <Text key={i} style={styles.entry}>
          {new Date(w.date).toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          })}{" "}
          → {convertWeight(w.weight)}
        </Text>
      ))}



      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Your Weight</Text>

            {inputUnit === 'st' ? (
              <View style={styles.stoneWrapper}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 5 }]}
                  placeholder="stone"
                  keyboardType="numeric"
                  value={stoneInput}
                  onChangeText={setStoneInput}
                />
                <TextInput
                  style={[styles.input, { flex: 1, marginLeft: 5 }]}
                  placeholder="lbs"
                  keyboardType="numeric"
                  value={lbsInput}
                  onChangeText={setLbsInput}
                />
              </View>
            ) : (
              <TextInput
                style={styles.input}
                placeholder={`Enter weight in ${inputUnit}`}
                keyboardType="numeric"
                value={inputWeight}
                onChangeText={setInputWeight}
              />
            )}

            {/* Unit toggle inside modal */}
            <View style={styles.toggleWrapper}>
              {['kg', 'lbs', 'st'].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.toggleButton,
                    inputUnit === value && styles.activeToggle,
                  ]}
                  onPress={() => setInputUnit(value)}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      inputUnit === value && styles.activeToggleText,
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={saveWeight}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const chartConfig = {
  backgroundColor: '#fff',
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f8f9fa' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  subtitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 10 },
  toggleWrapper: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 20,
    marginHorizontal: 5,
  },
  activeToggle: { backgroundColor: '#4CAF50' },
  toggleText: { fontSize: 16, color: '#333', fontWeight: '600' },
  activeToggleText: { color: '#fff' },
  chart: { borderRadius: 12, marginVertical: 8 },
  entry: { fontSize: 14, color: '#333', paddingVertical: 3 },
  recordButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  recordButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  stoneWrapper: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  saveButton: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 8 },
  saveButtonText: { color: '#fff', fontWeight: '600' },
  cancelButton: { padding: 10 },
  cancelButtonText: { color: '#666' },
});