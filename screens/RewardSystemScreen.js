import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
export default function RewardSystemScreen({ currentXP = 750 }) {
  // Test rewards data (mock, no DB)
  const [rewards, setRewards] = useState([
    { id: '1', reward_name: 'Cheat Meal 🍔', xp_required: 500, redeemed: false },
    { id: '2', reward_name: 'New Gym T-Shirt 👕', xp_required: 1000, redeemed: false },
    { id: '3', reward_name: 'Massage 💆', xp_required: 2000, redeemed: false },
  ]);

  const redeemReward = (id, xpRequired) => {
    if (currentXP < xpRequired) {
      alert('⚡ Not enough XP to redeem this reward!');
      return;
    }
    setRewards(prev =>
      prev.map(r => (r.id === id ? { ...r, redeemed: true } : r))
    );
    alert('🎉 Reward redeemed!');
  };

  const createReward = () => {
    // Just a placeholder — later hook into a "Create Reward" screen
    alert('✨ Create Reward clicked (hook this to a form later)');
  };

  const renderReward = ({ item }) => {
    const unlocked = currentXP >= item.xp_required;
    return (
      <View style={[styles.card, item.redeemed && styles.redeemed]}>
        <Text style={styles.name}>{item.reward_name}</Text>
        <Text style={styles.xp}>Requires {item.xp_required} XP</Text>
        {item.redeemed ? (
          <Text style={styles.redeemedText}>✅ Redeemed</Text>
        ) : (
          <TouchableOpacity
            style={[styles.button, !unlocked && styles.buttonLocked]}
            onPress={() => redeemReward(item.id, item.xp_required)}
            disabled={!unlocked}
          >
            <Text style={styles.buttonText}>{unlocked ? 'Redeem' : 'Locked 🔒'}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>🎯 Rewards</Text>
        <TouchableOpacity style={styles.createButton} onPress={createReward}>
          <Text style={styles.createText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={rewards}
        renderItem={renderReward}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  createText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  redeemed: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    opacity: 0.7,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    color: '#333',
  },
  xp: {
    fontSize: 14,
    color: '#777',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonLocked: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  redeemedText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 16,
  },
});
