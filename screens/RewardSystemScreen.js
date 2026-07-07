import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function RewardSystemScreen() {
  const navigation = useNavigation();

  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentXP, setCurrentXP] = useState(0);
  const [userId, setUserId] = useState(null);

  // Create reward modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardXP, setNewRewardXP] = useState('');
  const [saving, setSaving] = useState(false);

  // Edit reward modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState(null);
  const [editRewardName, setEditRewardName] = useState('');
  const [editRewardXP, setEditRewardXP] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // ── Load user + rewards on mount ─────────────────────────────────────────
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return;
      }

      const uid = session.user.id;
      setUserId(uid);

      // Fetch XP from userProfiles
      const { data: profile, error: profileError } = await supabase
        .from('userProfiles')
        .select('totalXP')
        .eq('id', uid)
        .single();

      if (profileError) throw profileError;
      setCurrentXP(profile?.totalXP ?? 0);

      // Fetch rewards for this user
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', uid)
        .order('xp_required', { ascending: true });

      if (rewardsError) throw rewardsError;
      setRewards(rewardsData ?? []);
    } catch (err) {
      console.error('RewardSystemScreen load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Redeem a reward ───────────────────────────────────────────────────────
  const redeemReward = async (reward) => {
    if (currentXP < reward.xp_required) {
      Alert.alert('Not enough XP', `You need ${reward.xp_required} XP to redeem this reward. You have ${currentXP} XP.`);
      return;
    }

    try {
      const { error } = await supabase
        .from('rewards')
        .update({ redeemedStatus: true, redeemed_at: new Date().toISOString() })
        .eq('id', reward.id)
        .eq('user_id', userId);

      if (error) throw error;

      // Deduct XP from profile
      const { error: xpError } = await supabase
        .from('userProfiles')
        .update({ totalXP: currentXP - reward.xp_required })
        .eq('id', userId);

      if (xpError) throw xpError;

      setCurrentXP((prev) => prev - reward.xp_required);
      setRewards((prev) =>
        prev.map((r) => (r.id === reward.id ? { ...r, redeemedStatus: true } : r))
      );

      Alert.alert('🎉 Reward Redeemed!', `Enjoy your ${reward.reward_name}!`);
    } catch (err) {
      console.error('redeemReward error:', err.message);
      Alert.alert('Error', 'Failed to redeem reward. Please try again.');
    }
  };

  // ── Create a new reward ───────────────────────────────────────────────────
  const handleCreateReward = async () => {

    if (!newRewardName.trim()) {
      Alert.alert('Missing name', 'Please enter a reward name.');
      return;
    }
    const xp = parseInt(newRewardXP, 10);
    if (!xp || xp <= 0) {
      Alert.alert('Invalid XP', 'Please enter a valid XP amount greater than 0.');
      return;
    }

    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('rewards')
        .insert([{
          user_id: userId,
          reward_name: newRewardName.trim(),
          xp_required: xp,
          redeemedStatus: false,
          redeemed_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      setRewards((prev) => [...prev, data].sort((a, b) => a.xp_required - b.xp_required));
      setNewRewardName('');
      setNewRewardXP('');
      setShowCreateModal(false);

    } catch (err) {
      console.error('createReward error:', err.message);
      Alert.alert('Error', 'Failed to create reward. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Open edit modal, prefill fields ───────────────────────────────────────
  const handleEditReward = (reward) => {
    setEditingRewardId(reward.id);
    setEditRewardName(reward.reward_name);
    setEditRewardXP(reward.xp_required.toString());
    setShowEditModal(true);
  };

  // ── Save edited reward ──────────────────────────────────────────────────────
  const handleSaveEdit = async () => {
    if (!editRewardName.trim()) {
      Alert.alert('Missing name', 'Please enter a reward name.');
      return;
    }
    const xp = parseInt(editRewardXP, 10);
    if (!xp || xp <= 0) {
      Alert.alert('Invalid XP', 'Please enter a valid XP amount greater than 0.');
      return;
    }

    try {
      setSavingEdit(true);
      const { data, error } = await supabase
        .from('rewards')
        .update({
          reward_name: editRewardName.trim(),
          xp_required: xp,
        })
        .eq('id', editingRewardId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      setRewards((prev) =>
        prev
          .map((r) => (r.id === editingRewardId ? data : r))
          .sort((a, b) => a.xp_required - b.xp_required)
      );

      setShowEditModal(false);
      setEditingRewardId(null);
      Alert.alert('Saved', 'Reward updated successfully.');
    } catch (err) {
      console.error('EditReward error:', err.message);
      Alert.alert('Error', 'Failed to update reward. Please try again.');
    } finally {
      setSavingEdit(false);
    }
  };

  // ── Delete a reward ───────────────────────────────────────────────────────
  const deleteReward = (reward) => {
    Alert.alert(
      'Delete Reward',
      `Remove "${reward.reward_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('rewards')
                .delete()
                .eq('id', reward.id)
                .eq('user_id', userId);
              if (error) throw error;
              setRewards((prev) => prev.filter((r) => r.id !== reward.id));
            } catch (err) {
              console.error('deleteReward error:', err.message);
            }
          },
        },
      ]
    );
  };

  // ── Render individual reward card ─────────────────────────────────────────
  const renderReward = ({ item }) => {
    const unlocked = currentXP >= item.xp_required;
    const pct = Math.min((currentXP / item.xp_required) * 100, 100);

    return (
      <View style={[styles.card, item.redeemed && styles.cardRedeemed]}>
        <View style={styles.cardTopRow}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.rewardName}>{item.reward_name}</Text>
            {item.redeemed && (
              <View style={styles.redeemedBadge}>
                <Ionicons name="checkmark-circle" size={12} color={ACCENT} />
                <Text style={styles.redeemedBadgeText}>Redeemed</Text>
              </View>
            )}
          </View>

          <View style={styles.cardActions}>
         

            <TouchableOpacity onPress={() => handleEditReward(item)} style={styles.editBtn}
            >
   
              <Ionicons name="create-outline" size={18} color="#FFFFFF" />
              {/* <Text style={styles.editBtnText}>Edit</Text> */}
            </TouchableOpacity> 



            
            <TouchableOpacity onPress={() => deleteReward(item)} style={styles.editBtn}>
              <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
              {/* <Text style={styles.editBtnText}>Delete</Text> */}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.xpRow}>
          <Ionicons name="flash" size={13} color={unlocked ? ACCENT : '#4a4a5a'} />
          <Text style={[styles.xpText, unlocked && styles.xpTextUnlocked]}>
            {item.xp_required.toLocaleString()} XP required
          </Text>
        </View>

        {/* XP progress bar */}
        {!item.redeemed && (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%` }, !unlocked && styles.progressFillLocked]} />
          </View>
        )}

        {/* Action */}
        {item.redeemed ? null : (
          <TouchableOpacity
            style={[styles.redeemBtn, !unlocked && styles.redeemBtnLocked]}
            onPress={() => redeemReward(item)}
            disabled={!unlocked}
            activeOpacity={0.8}
          >
            <Ionicons
              name={unlocked ? 'gift-outline' : 'lock-closed-outline'}
              size={15}
              color={unlocked ? '#0E0E12' : '#4a4a5a'}
            />
            <Text style={[styles.redeemBtnText, !unlocked && styles.redeemBtnTextLocked]}>
              {unlocked ? 'REDEEM' : `${Math.round(pct)}% there`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Blobs */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>REWARDS</Text>
          </View>
          <Text style={styles.title}>Your Rewards</Text>
        </View>

        {/* XP pill */}
        <View style={styles.xpPill}>
          <Ionicons name="flash" size={14} color={ACCENT} />
          <Text style={styles.xpPillText}>{currentXP.toLocaleString()} XP</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.xpPill}>
        <Ionicons name="information-circle-outline" size={20} color={ACCENT} />
        <Text style={styles.xpPillText}>Why have a Reward System?</Text>
      </TouchableOpacity>

      {/* ── List ── */}
      <FlatList
        data={rewards}
        renderItem={renderReward}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="gift-outline" size={40} color="#42425A" />
            <Text style={styles.emptyTitle}>No rewards yet</Text>
            <Text style={styles.emptySubtitle}>Create your first reward to get motivated!</Text>
          </View>
        }
      />

      {/* ── Create button ── */}
      <View style={styles.fabWrapper}>
        <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)} activeOpacity={0.85}>
          <Ionicons name="add-outline" size={20} color="#0E0E12" />
          <Text style={styles.fabText}>CREATE REWARD</Text>
        </TouchableOpacity>
      </View>

      {/* ── Create Reward Modal ── */}
      <Modal
        visible={showCreateModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>

            <View style={styles.modalHeader}>
              <View>
                <View style={styles.modalBadge}>
                  <Text style={styles.modalBadgeText}>NEW REWARD</Text>
                </View>
                <Text style={styles.modalTitle}>Create Reward</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCreateModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color="#A0A0BC" />
              </TouchableOpacity>
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>REWARD NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. New Shoes"
                placeholderTextColor="#4a4a5a"
                value={newRewardName}
                onChangeText={setNewRewardName}
              />
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>XP REQUIRED</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 500"
                placeholderTextColor="#4a4a5a"
                keyboardType="number-pad"
                value={newRewardXP}
                onChangeText={setNewRewardXP}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleCreateReward}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator color="#0E0E12" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>SAVE REWARD</Text>
              )}
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      {/* ── Edit Reward Modal ── */}
      <Modal
        visible={showEditModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>

            <View style={styles.modalHeader}>
              <View>
                <View style={styles.modalBadge}>
                  <Text style={styles.modalBadgeText}>EDIT REWARD</Text>
                </View>
                <Text style={styles.modalTitle}>Edit Reward</Text>
              </View>
              <TouchableOpacity onPress={() => setShowEditModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color="#A0A0BC" />
              </TouchableOpacity>
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>REWARD NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. New Shoes"
                placeholderTextColor="#4a4a5a"
                value={editRewardName}
                onChangeText={setEditRewardName}
              />
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>XP REQUIRED</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 500"
                placeholderTextColor="#4a4a5a"
                keyboardType="number-pad"
                value={editRewardXP}
                onChangeText={setEditRewardXP}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, savingEdit && { opacity: 0.6 }]}
              onPress={handleSaveEdit}
              disabled={savingEdit}
              activeOpacity={0.85}
            >
              {savingEdit ? (
                <ActivityIndicator color="#0E0E12" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>UPDATE REWARD</Text>
              )}
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
}

// ─── Palette ──────────────────────────────────────────────────────────────────
const ACCENT   = '#C6F135';
const BG       = '#0E0E12';
const CARD     = '#22222E';
const SURFACE2 = '#2C2C3C';
const BORDER   = '#42425A';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },

  blobTopRight:   { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: ACCENT, opacity: 0.05, top: -80, right: -80 },
  blobBottomLeft: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: '#5B4FE8', opacity: 0.06, bottom: 60, left: -80 },

  // Header
  header:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 64, paddingBottom: 20 },
  badge:    { alignSelf: 'flex-start', backgroundColor: ACCENT + '22', borderWidth: 1, borderColor: ACCENT + '55', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginBottom: 8 },
  badgeText:{ color: ACCENT, fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
  title:    { fontSize: 32, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1 },
  subtitle: { fontSize: 14, color: '#A0A0BC', marginTop: 4 },

  xpPill:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: ACCENT + '18', borderWidth: 1, borderColor: ACCENT + '44', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  xpPillText: { color: ACCENT, fontSize: 14, fontWeight: '800' },

  listContent: { paddingHorizontal: 20, paddingBottom: 120 },

  // Reward card
  card:         { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 16, marginBottom: 14 },
  cardRedeemed: { borderColor: ACCENT + '44', opacity: 0.7 },

  cardTopRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  cardTitleRow: { flex: 1, gap: 6 },
  rewardName:   { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
  redeemedBadge:     { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: ACCENT + '18', borderWidth: 1, borderColor: ACCENT + '44', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  redeemedBadgeText: { color: ACCENT, fontSize: 11, fontWeight: '700' },

  cardActions: { flexDirection: 'row', gap: 8 },
  
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  
  editBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteBtn: { padding: 4 },

  xpRow:         { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },
  xpText:        { fontSize: 13, color: '#4a4a5a', fontWeight: '600' },
  xpTextUnlocked:{ color: ACCENT },

  progressTrack:      { height: 3, backgroundColor: SURFACE2, borderRadius: 2, marginBottom: 12, overflow: 'hidden' },
  progressFill:       { height: '100%', backgroundColor: ACCENT, borderRadius: 2 },
  progressFillLocked: { backgroundColor: '#42425A' },

  redeemBtn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: ACCENT, paddingVertical: 11, borderRadius: 11, gap: 7, shadowColor: ACCENT, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 10, elevation: 5 },
  redeemBtnLocked:    { backgroundColor: SURFACE2, shadowOpacity: 0 },
  redeemBtnText:      { color: '#0E0E12', fontSize: 12, fontWeight: '900', letterSpacing: 1.2 },
  redeemBtnTextLocked:{ color: '#4a4a5a' },

  // Empty state
  emptyBox:     { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle:   { fontSize: 18, fontWeight: '700', color: '#DDDDF0' },
  emptySubtitle:{ fontSize: 14, color: '#A0A0BC', textAlign: 'center' },

  // FAB
  fabWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 18, backgroundColor: BG, borderTopWidth: 1, borderTopColor: BORDER },
  fab:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: ACCENT, paddingVertical: 15, borderRadius: 14, gap: 8, shadowColor: ACCENT, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 8 },
  fabText:    { color: '#0E0E12', fontSize: 13, fontWeight: '900', letterSpacing: 1.5 },

  // Modal
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '88%', backgroundColor: '#18181F', borderRadius: 22, padding: 22, borderWidth: 1, borderColor: BORDER },
  modalHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 },
  modalBadge:     { alignSelf: 'flex-start', backgroundColor: ACCENT + '22', borderWidth: 1, borderColor: ACCENT + '55', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginBottom: 6 },
  modalBadgeText: { color: ACCENT, fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
  modalTitle:     { fontSize: 22, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 },
  closeBtn:       { width: 32, height: 32, borderRadius: 16, backgroundColor: SURFACE2, borderWidth: 1, borderColor: BORDER, justifyContent: 'center', alignItems: 'center' },

  fieldWrapper: { marginBottom: 16 },
  fieldLabel:   { color: '#A0A0BC', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  input:        { backgroundColor: SURFACE2, borderWidth: 1.5, borderColor: BORDER, borderRadius: 12, padding: 14, color: '#FFFFFF', fontSize: 15, fontWeight: '500' },

  saveBtn:     { backgroundColor: ACCENT, paddingVertical: 15, borderRadius: 13, alignItems: 'center', marginTop: 4, shadowColor: ACCENT, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  saveBtnText: { color: '#0E0E12', fontSize: 13, fontWeight: '900', letterSpacing: 1.5 },
});