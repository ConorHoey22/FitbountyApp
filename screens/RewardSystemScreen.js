import React, { useState, useEffect } from 'react';
import { APP_BG_GRADIENT } from '../components/ScreenBackground';
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
import { M, modalStyles as ms } from '../components/modalTheme';
import useTabBarSpace from '../utils/useTabBarSpace';
import { LinearGradient } from 'expo-linear-gradient';
import { font } from '../utils/fonts';

export default function RewardSystemScreen() {
  const tabSpace = useTabBarSpace(); // room for the floating tab bar

  const navigation = useNavigation();

  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentXP, setCurrentXP] = useState(0);
  const [userId, setUserId] = useState(null);

  // Create reward modal
  const [showInfoModal, setShowInfoModal] = useState(false);
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
        <LinearGradient
          colors={CARD_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={styles.cardTopRow}>
          {/* Icon */}
          <View style={[styles.iconCircle, { backgroundColor: (item.redeemed || unlocked ? READY_COLOR : XP_COLOR) + 'CC' }]}>
            <Ionicons name={item.redeemed ? 'checkmark' : unlocked ? 'gift' : 'lock-closed'} size={18} color={WHITE} />
          </View>

          {/* Name + XP */}
          <View style={styles.cardTitleRow}>
            <Text style={styles.rewardName} numberOfLines={2}>{item.reward_name}</Text>
            <View style={styles.xpRow}>
              <Ionicons name="flash" size={12} color={XP_COLOR} />
              <Text style={styles.xpText}>{item.xp_required.toLocaleString()} XP</Text>
              {item.redeemed && <Text style={styles.redeemedText}> · Redeemed</Text>}
            </View>
          </View>

          {/* Edit / delete */}
          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => handleEditReward(item)} style={styles.iconBtn} hitSlop={6}>
              <Ionicons name="create-outline" size={17} color={WHITE} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteReward(item)} style={styles.iconBtn} hitSlop={6}>
              <Ionicons name="trash-outline" size={16} color={DANGER} />
            </TouchableOpacity>
          </View>
        </View>

        {/* XP progress */}
        {!item.redeemed && (
          <>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>
                {Math.min(currentXP, item.xp_required).toLocaleString()} / {item.xp_required.toLocaleString()} XP
              </Text>
              <Text style={styles.progressLabel}>{Math.round(pct)}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: unlocked ? READY_COLOR : XP_COLOR }]} />
            </View>
          </>
        )}

        {/* Action */}
        {item.redeemed ? null : (
          <TouchableOpacity
            style={[styles.redeemBtn, !unlocked && styles.redeemBtnLocked]}
            onPress={() => redeemReward(item)}
            disabled={!unlocked}
            activeOpacity={0.8}
          >
            <Ionicons name={unlocked ? 'gift' : 'lock-closed'} size={15} color={WHITE} />
            <Text style={styles.redeemBtnText}>
              {unlocked ? 'REDEEM' : `${(item.xp_required - currentXP).toLocaleString()} XP TO GO`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={WHITE} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={BG_GRADIENT} style={StyleSheet.absoluteFill} pointerEvents="none" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Rewards</Text>

        {/* XP pill */}
        <View style={styles.xpPill}>
          <Ionicons name="flash" size={14} color={XP_COLOR} />
          <Text style={styles.xpPillText}>{currentXP.toLocaleString()} XP</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.infoRow} activeOpacity={0.7} onPress={() => setShowInfoModal(true)}>
        <Ionicons name="information-circle-outline" size={18} color={WHITE} />
        <Text style={styles.infoText}>Why have a Reward System?</Text>
      </TouchableOpacity>

      {/* ── Create button ── */}
      <View style={styles.createWrapper}>
        <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)} activeOpacity={0.85}>
          <Ionicons name="add" size={20} color={INK} />
          <Text style={styles.fabText}>CREATE REWARD</Text>
        </TouchableOpacity>
      </View>

      {/* ── List ── */}
      <FlatList
        data={rewards}
        renderItem={renderReward}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[styles.listContent, { paddingBottom: 30 + tabSpace }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <View style={[styles.iconCircle, styles.emptyIcon]}>
              <Ionicons name="gift" size={26} color={WHITE} />
            </View>
            <Text style={styles.emptyTitle}>No rewards yet</Text>
            <Text style={styles.emptySubtitle}>Create your first reward to get motivated!</Text>
          </View>
        }
      />

      {/* ── Why have a Reward System? Modal ── */}
      <Modal
        visible={showInfoModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={ms.overlay}>
          <View style={ms.card}>
            <View style={[ms.header, { marginBottom: 16 }]}>
              <View style={ms.headerLeft}>
                <Text style={ms.title}>Why have a Reward System?</Text>
              </View>
              <TouchableOpacity onPress={() => setShowInfoModal(false)} style={ms.closeBtn} hitSlop={10}>
                <Ionicons name="close" size={20} color={M.INK} />
              </TouchableOpacity>
            </View>

            <Text style={styles.infoBody}>
              The brain’s reward system is a network of regions and pathways that drives how we feel pleasure, form habits, and motivate behavior.
            </Text>
            <Text style={[styles.infoBody, { marginBottom: 0 }]}>
              It works by releasing chemicals (like dopamine) in response to rewarding activities, whether it’s eating, socializing, or achieving a goal. This evolved mechanism reinforces behaviors that are beneficial or enjoyable by making us feel good when we do them.
            </Text>
          </View>
        </View>
      </Modal>

      {/* ── Create Reward Modal ── */}
      <Modal
        visible={showCreateModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={ms.overlay}>
          <View style={ms.card}>

            <View style={[ms.header, { marginBottom: 16 }]}>
              <View style={ms.headerLeft}>
                <View style={ms.badge}>
                  <Text style={ms.badgeText}>NEW REWARD</Text>
                </View>
                <Text style={ms.title}>Create Reward</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCreateModal(false)} style={ms.closeBtn} hitSlop={10}>
                <Ionicons name="close" size={20} color={M.INK} />
              </TouchableOpacity>
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={ms.fieldLabel}>REWARD NAME</Text>
              <TextInput
                style={ms.textInput}
                placeholder="e.g. New Shoes"
                placeholderTextColor={M.PLACEHOLDER}
                value={newRewardName}
                onChangeText={setNewRewardName}
              />
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={ms.fieldLabel}>XP REQUIRED</Text>
              <TextInput
                style={ms.textInput}
                placeholder="e.g. 500"
                placeholderTextColor={M.PLACEHOLDER}
                keyboardType="number-pad"
                value={newRewardXP}
                onChangeText={setNewRewardXP}
              />
            </View>

            <TouchableOpacity
              style={[ms.saveButton, { marginTop: 4 }, saving && ms.saveButtonDisabled]}
              onPress={handleCreateReward}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator color={M.WHITE} size="small" />
              ) : (
                <Text style={ms.saveButtonText}>Save Reward</Text>
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
        <View style={ms.overlay}>
          <View style={ms.card}>

            <View style={[ms.header, { marginBottom: 16 }]}>
              <View style={ms.headerLeft}>
                <View style={ms.badge}>
                  <Text style={ms.badgeText}>EDIT REWARD</Text>
                </View>
                <Text style={ms.title}>Edit Reward</Text>
              </View>
              <TouchableOpacity onPress={() => setShowEditModal(false)} style={ms.closeBtn} hitSlop={10}>
                <Ionicons name="close" size={20} color={M.INK} />
              </TouchableOpacity>
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={ms.fieldLabel}>REWARD NAME</Text>
              <TextInput
                style={ms.textInput}
                placeholder="e.g. New Shoes"
                placeholderTextColor={M.PLACEHOLDER}
                value={editRewardName}
                onChangeText={setEditRewardName}
              />
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={ms.fieldLabel}>XP REQUIRED</Text>
              <TextInput
                style={ms.textInput}
                placeholder="e.g. 500"
                placeholderTextColor={M.PLACEHOLDER}
                keyboardType="number-pad"
                value={editRewardXP}
                onChangeText={setEditRewardXP}
              />
            </View>

            <TouchableOpacity
              style={[ms.saveButton, { marginTop: 4 }, savingEdit && ms.saveButtonDisabled]}
              onPress={handleSaveEdit}
              disabled={savingEdit}
              activeOpacity={0.85}
            >
              {savingEdit ? (
                <ActivityIndicator color={M.WHITE} size="small" />
              ) : (
                <Text style={ms.saveButtonText}>Update Reward</Text>
              )}
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
}

// ─── Palette — dark purple → black page, dark cards ──────────────────────────
// Other versions tried: purple → blue ['#2E1065', '#0B1F4D'];
// warm off-white '#FAF7F2' (with black header text)
const BG_GRADIENT = APP_BG_GRADIENT; // shared — components/ScreenBackground.js
const BG          = '#000000';                  // shown while loading / behind the gradient
const INK         = '#111111';                  // primary text
const WHITE       = '#FFFFFF';
const CARD_BG     = '#1C1C1E';                  // dark cards
const CARD_GRADIENT = ['rgba(37,99,235,0.30)', 'rgba(37,99,235,0.12)', 'rgba(37,99,235,0.04)']; // blue tint (was purple → blue, as on Home)
const BORDER      = 'rgba(255,255,255,0.16)';   // edges of pills on the page
const CARD_BORDER = 'rgba(255,255,255,0.12)';   // edges inside dark cards
const CARD_ROW_BG = 'rgba(255,255,255,0.08)';   // inner rows / track / small buttons inside dark cards
const XP_COLOR    = '#FF7722';                  // orange — same as the XP level ring on Home
const READY_COLOR = '#16A34A';                  // green — enough XP / redeemed (Home's goal reached)
const DANGER      = '#EF4444';
const ROW_BG      = 'rgba(255,255,255,0.10)';   // pills on the page

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 64, paddingBottom: 12 },
  title:  { fontSize: 28, ...font('800'), color: WHITE, letterSpacing: -0.5 },

  xpPill:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: ROW_BG, borderWidth: 1, borderColor: BORDER, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  xpPillText: { color: WHITE, fontSize: 15, ...font('800') },

  infoRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginHorizontal: 20, marginBottom: 18, backgroundColor: ROW_BG, borderWidth: 1, borderColor: BORDER, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  infoText: { color: WHITE, fontSize: 13, ...font('600') },
  infoBody: { color: INK, fontSize: 15, lineHeight: 22, ...font('400'), marginBottom: 12 },

  listContent: { paddingHorizontal: 20 },

  // Reward card
  card:         { backgroundColor: CARD_BG, borderRadius: 22, borderWidth: 1, borderColor: CARD_BORDER, padding: 16, marginBottom: 14, overflow: 'hidden', shadowColor: '#000000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 },
  cardRedeemed: { opacity: 0.6 },

  cardTopRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  iconCircle:   { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  cardTitleRow: { flex: 1, gap: 3 },
  rewardName:   { fontSize: 17, ...font('700'), color: WHITE },
  xpRow:        { flexDirection: 'row', alignItems: 'center', gap: 4 },
  xpText:       { fontSize: 13, color: WHITE, ...font('600') },
  redeemedText: { fontSize: 13, color: READY_COLOR, ...font('700') },

  cardActions: { flexDirection: 'row', gap: 8 },
  iconBtn:     { width: 34, height: 34, borderRadius: 17, backgroundColor: CARD_ROW_BG, borderWidth: 1, borderColor: CARD_BORDER, alignItems: 'center', justifyContent: 'center' },

  // Progress
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel:    { fontSize: 12, color: WHITE, ...font('600') },
  progressTrack:    { height: 6, backgroundColor: CARD_ROW_BG, borderRadius: 3, marginBottom: 14, overflow: 'hidden' },
  progressFill:     { height: '100%', borderRadius: 3 },

  // Redeem
  redeemBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: READY_COLOR, paddingVertical: 12, borderRadius: 999, gap: 7 },
  redeemBtnLocked: { backgroundColor: CARD_ROW_BG, borderWidth: 1, borderColor: CARD_BORDER },
  redeemBtnText:   { color: WHITE, fontSize: 12, ...font('800'), letterSpacing: 1.2 },

  // Empty state
  emptyBox:      { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyIcon:     { width: 60, height: 60, borderRadius: 30, backgroundColor: XP_COLOR + 'CC', marginBottom: 4 },
  emptyTitle:    { fontSize: 18, ...font('700'), color: WHITE },
  emptySubtitle: { fontSize: 14, color: WHITE, ...font('400'), textAlign: 'center' },

  // Create button
  createWrapper: { paddingHorizontal: 20, marginBottom: 18 },
  fab:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: WHITE, borderRadius: 999, paddingVertical: 15, gap: 8 },
  fabText:    { color: INK, fontSize: 13, ...font('800'), letterSpacing: 1.5 },

  fieldWrapper: { marginBottom: 16 },
});
