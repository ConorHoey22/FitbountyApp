// import React, { useState, useEffect } from 'react';
// import {
//   Modal,
//   StyleSheet,
//   View,
//   Text,
//   TouchableOpacity,
//   Keyboard,
//   TouchableWithoutFeedback,
//   Platform,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { supabase } from '../lib/supabase';
// import ActivityInputNumberPad from './ActivityInputNumber';

// const UpdatePlanIndividualSelectionModal = ({ visible, onClose, onSave }) => {

//   const [updateActivitySelection, setUpdateActivitySelection] = useState('');

//   const [cardioInputValue, setCardioInputValue] = useState('');
//   const [stepsInputValue, setStepsInputValue] = useState('');
//   const [workoutsInputValue, setWorkoutsInputValue] = useState('');

//   const [currentCardioGoal, setCurrentCardioGoal] = useState(0);
//   const [currentStepsGoal, setCurrentStepsGoal] = useState(0);
//   const [currentWorkoutsGoal, setCurrentWorkoutsGoal] = useState(0);

//   const [saving, setSaving] = useState(false);

//   // DONE Button For number Pad
//   const [keyboardVisible, setKeyboardVisible] = useState(false);
//   const [keyboardHeight, setKeyboardHeight] = useState(0);

//   useEffect(() => {
//     const showSub = Keyboard.addListener(
//       Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
//       (e) => {
//         setKeyboardHeight(e.endCoordinates.height);
//         setKeyboardVisible(true);
//       }
//     );
//     const hideSub = Keyboard.addListener(
//       Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
//       () => {
//         setKeyboardHeight(0);
//         setKeyboardVisible(false);
//       }
//     );
//     return () => {
//       showSub.remove();
//       hideSub.remove();
//     };
//   }, []);

//   useEffect(() => {
//     if (visible) {
//       loadCurrentGoals();
//     } else {
//       // reset when modal closes so it reopens on the selection screen
//       setUpdateActivitySelection('');
//       setCardioInputValue('');
//       setStepsInputValue('');
//       setWorkoutsInputValue('');
//     }
//   }, [visible]);

//   // Obtain Goals
//   const loadCurrentGoals = async () => {
//     try {
//       const { data: { session } } = await supabase.auth.getSession();
//       if (!session?.user) return;

//       const { data: profileData, error } = await supabase
//         .from('userProfiles')
//         .select('cardioGoal, stepGoal, workoutSessionsGoal')
//         .eq('id', session.user.id)
//         .single();

//       if (error) throw error;

//       setCurrentCardioGoal(profileData?.cardioGoal ?? 0);
//       setCurrentStepsGoal(profileData?.stepGoal ?? 0);
//       setCurrentWorkoutsGoal(profileData?.workoutSessionsGoal ?? 0);
//     } catch (err) {
//       console.error('UpdatePlanIndividualSelectionModal load error:', err.message);
//     }
//   };

//   const goBackToSelection = () => {
//     setUpdateActivitySelection('');
//     setCardioInputValue('');
//     setStepsInputValue('');
//     setWorkoutsInputValue('');
//   };

//   // Header back button: goes to the selection screen if on an activity
//   // screen, otherwise closes the modal from the top-level screen.
//   const handleHeaderBack = () => {
//     if (updateActivitySelection === '') {
//       onClose();
//     } else {
//       goBackToSelection();
//     }
//   };

//   const updateGoalField = async (field, value) => {
//     const { data: { session } } = await supabase.auth.getSession();
//     if (!session?.user) return false;

//     const { error } = await supabase
//       .from('userProfiles')
//       .update({ [field]: value })
//       .eq('id', session.user.id);

//     if (error) throw error;
//     return true;
//   };

//   const handleUpdateCardio = async () => {
//     const updatedCardioValue = parseInt(cardioInputValue, 10) || 0;
//     if (!updatedCardioValue) return;

//     try {
//       setSaving(true);
//       await updateGoalField('cardioGoal', updatedCardioValue);
//       setCurrentCardioGoal(updatedCardioValue);
//       setCardioInputValue('');
//       if (onSave) onSave();
//       onClose();
//     } catch (error) {
//       console.error('Error updating cardio goal:', error.message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleUpdateSteps = async () => {
//     const updatedStepsValue = parseInt(stepsInputValue, 10) || 0;
//     if (!updatedStepsValue) return;

//     try {
//       setSaving(true);
//       await updateGoalField('stepGoal', updatedStepsValue);
//       setCurrentStepsGoal(updatedStepsValue);
//       setStepsInputValue('');
//       if (onSave) onSave();
//       onClose();
//     } catch (error) {
//       console.error('Error updating steps goal:', error.message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleUpdateWorkouts = async () => {
//     const updatedWorkoutsValue = parseInt(workoutsInputValue, 10) || 0;
//     if (!updatedWorkoutsValue) return;

//     try {
//       setSaving(true);
//       await updateGoalField('workoutSessionsGoal', updatedWorkoutsValue);
//       setCurrentWorkoutsGoal(updatedWorkoutsValue);
//       setWorkoutsInputValue('');
//       if (onSave) onSave();
//       onClose();
//     } catch (error) {
//       console.error('Error updating workouts goal:', error.message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
//       <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//         <View style={styles.overlay}>
//           <View style={styles.modalContainer}>

//             {/* Header */}
//             <View style={styles.header}>
//               <TouchableOpacity onPress={handleHeaderBack} style={styles.backBtn}>
//                 <Ionicons name="chevron-back" size={18} color="#A0A0BC" />
//               </TouchableOpacity>

//               <Text style={styles.title}>
//                 {updateActivitySelection === '' ? 'Update your Plan' : `${updateActivitySelection} Goal`}
//               </Text>
//             </View>

//             {/* Selection menu */}
//             {updateActivitySelection === '' && (
//               <View>
//                 <Text style={styles.subtitle}>Which Goal would like to update?</Text>

//                 <View style={styles.selectionGrid}>
//                   <TouchableOpacity
//                     style={styles.selectionCard}
//                     onPress={() => setUpdateActivitySelection('Cardio')}
//                     activeOpacity={0.8}
//                   >
//                     <View style={[styles.selectionIconWrap, { backgroundColor: ACCENT4 + '22' }]}>
//                       <Ionicons name="bicycle-outline" size={22} color={ACCENT4} />
//                     </View>
//                     <Text style={styles.selectionCardTitle}>Cardio</Text>
//                     <Text style={styles.selectionCardValue}>{currentCardioGoal} min</Text>
//                   </TouchableOpacity>

//                   <TouchableOpacity
//                     style={styles.selectionCard}
//                     onPress={() => setUpdateActivitySelection('Steps')}
//                     activeOpacity={0.8}
//                   >
//                     <View style={[styles.selectionIconWrap, { backgroundColor: '#A49BFF22' }]}>
//                       <Ionicons name="footsteps-outline" size={22} color="#A49BFF" />
//                     </View>
//                     <Text style={styles.selectionCardTitle}>Steps</Text>
//                     <Text style={styles.selectionCardValue}>{currentStepsGoal.toLocaleString()}</Text>
//                   </TouchableOpacity>

//                   <TouchableOpacity
//                     style={styles.selectionCard}
//                     onPress={() => setUpdateActivitySelection('Workouts')}
//                     activeOpacity={0.8}
//                   >
//                     <View style={[styles.selectionIconWrap, { backgroundColor: '#FFA94022' }]}>
//                       <Ionicons name="barbell-outline" size={22} color="#FFA940" />
//                     </View>
//                     <Text style={styles.selectionCardTitle}>Workouts</Text>
//                     <Text style={styles.selectionCardValue}>{currentWorkoutsGoal}/wk</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             )}

//             {updateActivitySelection === 'Cardio' && (
//               <View style={styles.inputGroup}>
//                 <View style={styles.currentGoalCard}>
//                   <View style={[styles.currentGoalIconWrap, { backgroundColor: ACCENT + '22' }]}>
//                     <Ionicons name="bicycle-outline" size={18} color={ACCENT} />
//                   </View>
//                   <View>
//                     <Text style={styles.currentGoalLabel}>CURRENT GOAL</Text>
//                     <Text style={styles.currentGoalValue}>{currentCardioGoal} minutes</Text>
//                   </View>
//                 </View>

//                 <ActivityInputNumberPad
//                   icon="bicycle-outline"
//                   iconColor={ACCENT}
//                   label="Cardio (minutes)"
//                   value={cardioInputValue}
//                   onChange={setCardioInputValue}
//                 />

//                 <TouchableOpacity
//                   style={[styles.saveButton, saving && styles.saveButtonDisabled]}
//                   onPress={handleUpdateCardio}
//                   disabled={saving}
//                 >
//                   <Ionicons name="checkmark-outline" size={18} color="#ffffff" />
//                   <Text style={styles.saveButtonText}>{saving ? 'UPDATING…' : 'UPDATE'}</Text>
//                 </TouchableOpacity>
//               </View>
//             )}

//             {updateActivitySelection === 'Steps' && (
//               <View style={styles.inputGroup}>
//                 <View style={styles.currentGoalCard}>
//                   <View style={[styles.currentGoalIconWrap, { backgroundColor: '#A49BFF22' }]}>
//                     <Ionicons name="footsteps-outline" size={18} color="#A49BFF" />
//                   </View>
//                   <View>
//                     <Text style={styles.currentGoalLabel}>CURRENT GOAL</Text>
//                     <Text style={styles.currentGoalValue}>{currentStepsGoal.toLocaleString()} steps</Text>
//                   </View>
//                 </View>

//                 <ActivityInputNumberPad
//                   icon="footsteps-outline"
//                   iconColor="#A49BFF"
//                   label="Steps"
//                   value={stepsInputValue}
//                   onChange={setStepsInputValue}
//                 />

//                 <TouchableOpacity
//                   style={[styles.saveButton, saving && styles.saveButtonDisabled]}
//                   onPress={handleUpdateSteps}
//                   disabled={saving}
//                 >
//                   <Ionicons name="checkmark-outline" size={18} color="#ffffff" />
//                   <Text style={styles.saveButtonText}>{saving ? 'UPDATING…' : 'UPDATE'}</Text>
//                 </TouchableOpacity>
//               </View>
//             )}

//             {updateActivitySelection === 'Workouts' && (
//               <View style={styles.inputGroup}>
//                 <View style={styles.currentGoalCard}>
//                   <View style={[styles.currentGoalIconWrap, { backgroundColor: '#FFA94022' }]}>
//                     <Ionicons name="barbell-outline" size={18} color="#FFA940" />
//                   </View>
//                   <View>
//                     <Text style={styles.currentGoalLabel}>CURRENT GOAL</Text>
//                     <Text style={styles.currentGoalValue}>{currentWorkoutsGoal} sessions per week</Text>
//                   </View>
//                 </View>

//                 <ActivityInputNumberPad
//                   icon="barbell-outline"
//                   iconColor="#FFA940"
//                   label="Workouts"
//                   value={workoutsInputValue}
//                   placeholder="test"
//                   onChange={setWorkoutsInputValue}
//                 />

//                 <TouchableOpacity
//                   style={[styles.saveButton, saving && styles.saveButtonDisabled]}
//                   onPress={handleUpdateWorkouts}
//                   disabled={saving}
//                 >
//                   <Ionicons name="checkmark-outline" size={18} color="#ffffff" />
//                   <Text style={styles.saveButtonText}>{saving ? 'UPDATING…' : 'UPDATE'}</Text>
//                 </TouchableOpacity>
//               </View>
//             )}

//           </View>
//         </View>
//       </TouchableWithoutFeedback>

//       {keyboardVisible && (
//         <View style={[styles.accessoryBar, { bottom: keyboardHeight }]}>
//           <TouchableOpacity onPress={Keyboard.dismiss}>
//             <Text style={styles.accessoryDoneText}>Done</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </Modal>
//   );
// };

// // ─── Palette ──────────────────────────────────────────────────────────────────
// const ACCENT   = '#C6F135';
// const ACCENT4  = '#E11D48';
// const BG_MODAL = '#1A1A26';
// const SURFACE  = '#22222E';
// const SURFACE2 = '#2C2C3C';
// const BORDER   = '#42425A';
// const ACCENT2   = '#2563EB';

// const styles = StyleSheet.create({
//   accessoryBar: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     alignItems: 'flex-end',
//   },
//   accessoryDoneText: {
//     backgroundColor: '#22222E',
//     borderWidth: 1,
//     borderRadius: 41,
//     borderColor: '#C6F135',
//     padding: 10,
//     color: '#C6F135',
//     fontSize: 16,
//     fontWeight: '700',
//     overflow: 'hidden',
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.75)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     width: '88%',
//     backgroundColor: BG_MODAL,
//     borderRadius: 22,
//     padding: 22,
//     borderWidth: 1,
//     borderColor: BORDER,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 12 },
//     shadowOpacity: 0.5,
//     shadowRadius: 20,
//     elevation: 12,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     marginBottom: 16,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '900',
//     color: '#FFFFFF',
//     letterSpacing: -0.3,
//   },
//   subtitle: {
//     fontSize: 12,
//     color: '#ffffff',
//     marginBottom: 16,
//     lineHeight: 17,
//     fontWeight: '500',
//   },

//   // ── Selection menu (3 cards) ──
//   selectionGrid: {
//     flexDirection: 'row',
//     gap: 10,
//     marginBottom: 4,
//   },
//   selectionCard: {
//     flex: 1,
//     backgroundColor: SURFACE,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: BORDER,
//     paddingVertical: 16,
//     paddingHorizontal: 8,
//     alignItems: 'center',
//     gap: 8,
//   },
//   selectionIconWrap: {
//     width: 42,
//     height: 42,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   selectionCardTitle: {
//     color: '#FFFFFF',
//     fontSize: 12,
//     fontWeight: '700',
//     letterSpacing: 0.2,
//   },
//   selectionCardValue: {
//     color: '#A0A0BC',
//     fontSize: 11,
//     fontWeight: '600',
//   },

//   // ── Individual goal screens ──
//   currentGoalCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     backgroundColor: SURFACE,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: BORDER,
//     padding: 14,
//     marginBottom: 4,
//   },
//   currentGoalIconWrap: {
//     width: 36,
//     height: 36,
//     borderRadius: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   currentGoalLabel: {
//     color: '#A0A0BC',
//     fontSize: 9,
//     fontWeight: '700',
//     letterSpacing: 1,
//     marginBottom: 2,
//   },
//   currentGoalValue: {
//     color: '#FFFFFF',
//     fontSize: 15,
//     fontWeight: '800',
//   },

//   backBtn: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: SURFACE2,
//     borderWidth: 1,
//     borderColor: BORDER,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   inputGroup: {
//     gap: 12,
//     marginBottom: 20,
//   },
//   saveButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: ACCENT2,
//     paddingVertical: 14,
//     borderRadius: 13,
//     gap: 8,
//     marginBottom: 10,
//     shadowColor: ACCENT2,
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.3,
//     shadowRadius: 12,
//     elevation: 6,
//   },
//   saveButtonDisabled: {
//     opacity: 0.6,
//   },
//   saveButtonText: {
//     color: '#ffffff',
//     fontSize: 13,
//     fontWeight: '900',
//     letterSpacing: 1.5,
//   },
// });

// export default UpdatePlanIndividualSelectionModal;
import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import ActivityInputNumberPad from './ActivityInputNumber';

const UpdatePlanIndividualSelectionModal = ({ visible, onClose, onSave }) => {

  const navigation = useNavigation();

  const [updateActivitySelection, setUpdateActivitySelection] = useState('');

  const [cardioInputValue, setCardioInputValue] = useState('');
  const [stepsInputValue, setStepsInputValue] = useState('');
  const [workoutsInputValue, setWorkoutsInputValue] = useState('');

  const [currentCardioGoal, setCurrentCardioGoal] = useState(0);
  const [currentStepsGoal, setCurrentStepsGoal] = useState(0);
  const [currentWorkoutsGoal, setCurrentWorkoutsGoal] = useState(0);

  const [saving, setSaving] = useState(false);

  // DONE Button For number Pad
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setKeyboardVisible(true);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setKeyboardVisible(false);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (visible) {
      loadCurrentGoals();
    } else {
      // reset when modal closes so it reopens on the selection screen
      setUpdateActivitySelection('');
      setCardioInputValue('');
      setStepsInputValue('');
      setWorkoutsInputValue('');
    }
  }, [visible]);

  // Obtain Goals
  const loadCurrentGoals = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: profileData, error } = await supabase
        .from('userProfiles')
        .select('cardioGoal, stepGoal, workoutSessionsGoal')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      setCurrentCardioGoal(profileData?.cardioGoal ?? 0);
      setCurrentStepsGoal(profileData?.stepGoal ?? 0);
      setCurrentWorkoutsGoal(profileData?.workoutSessionsGoal ?? 0);
    } catch (err) {
      console.error('UpdatePlanIndividualSelectionModal load error:', err.message);
    }
  };

  const goBackToSelection = () => {
    setUpdateActivitySelection('');
    setCardioInputValue('');
    setStepsInputValue('');
    setWorkoutsInputValue('');
  };

  // Header back button: goes to the selection screen if on an activity
  // screen, otherwise closes the modal from the top-level screen.
  const handleHeaderBack = () => {
    if (updateActivitySelection === '') {
      onClose();
    } else {
      goBackToSelection();
    }
  };

  const updateGoalField = async (field, value) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;

    const { error } = await supabase
      .from('userProfiles')
      .update({ [field]: value })
      .eq('id', session.user.id);

    if (error) throw error;
    return true;
  };

  // Flips UserHasWeeklyPlanSetup to false and sends the user to
  // PlanYourWeekScreen so their weekly schedule matches the new goal.
  const triggerWeeklyReplan = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { error } = await supabase
      .from('userProfiles')
      .update({ UserHasWeeklyPlanSetup: false })
      .eq('id', session.user.id);

    if (error) {
      console.error('Error resetting weekly plan flag:', error.message);
      return;
    }

    navigation.reset({
      index: 0,
      routes: [{ name: 'PlanYourWeekScreen' }],
    });
  };

  const handleUpdateCardio = async () => {
    const updatedCardioValue = parseInt(cardioInputValue, 10) || 0;
    if (!updatedCardioValue) return;

    try {
      setSaving(true);
      await updateGoalField('cardioGoal', updatedCardioValue);
      setCurrentCardioGoal(updatedCardioValue);
      setCardioInputValue('');
      if (onSave) onSave();
      await triggerWeeklyReplan();
    } catch (error) {
      console.error('Error updating cardio goal:', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSteps = async () => {
    const updatedStepsValue = parseInt(stepsInputValue, 10) || 0;
    if (!updatedStepsValue) return;

    try {
      setSaving(true);
      await updateGoalField('stepGoal', updatedStepsValue);
      setCurrentStepsGoal(updatedStepsValue);
      setStepsInputValue('');
      if (onSave) onSave();
      onClose();
    } catch (error) {
      console.error('Error updating steps goal:', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateWorkouts = async () => {
    const updatedWorkoutsValue = parseInt(workoutsInputValue, 10) || 0;
    if (!updatedWorkoutsValue) return;

    try {
      setSaving(true);
      await updateGoalField('workoutSessionsGoal', updatedWorkoutsValue);
      setCurrentWorkoutsGoal(updatedWorkoutsValue);
      setWorkoutsInputValue('');
      if (onSave) onSave();
      await triggerWeeklyReplan();
    } catch (error) {
      console.error('Error updating workouts goal:', error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleHeaderBack} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={18} color="#A0A0BC" />
              </TouchableOpacity>

              <Text style={styles.title}>
                {updateActivitySelection === '' ? 'Update your Plan' : `${updateActivitySelection} Goal`}
              </Text>
            </View>

            {/* Selection menu */}
            {updateActivitySelection === '' && (
              <View>
                <Text style={styles.subtitle}>Which Goal would like to update?</Text>

                <View style={styles.selectionGrid}>
                  <TouchableOpacity
                    style={styles.selectionCard}
                    onPress={() => setUpdateActivitySelection('Cardio')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.selectionIconWrap, { backgroundColor: ACCENT4 + '22' }]}>
                      <Ionicons name="bicycle-outline" size={22} color={ACCENT4} />
                    </View>
                    <Text style={styles.selectionCardTitle}>Cardio</Text>
                    <Text style={styles.selectionCardValue}>{currentCardioGoal} min</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.selectionCard}
                    onPress={() => setUpdateActivitySelection('Steps')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.selectionIconWrap, { backgroundColor: '#A49BFF22' }]}>
                      <Ionicons name="footsteps-outline" size={22} color="#A49BFF" />
                    </View>
                    <Text style={styles.selectionCardTitle}>Steps</Text>
                    <Text style={styles.selectionCardValue}>{currentStepsGoal.toLocaleString()}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.selectionCard}
                    onPress={() => setUpdateActivitySelection('Workouts')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.selectionIconWrap, { backgroundColor: '#FFA94022' }]}>
                      <Ionicons name="barbell-outline" size={22} color="#FFA940" />
                    </View>
                    <Text style={styles.selectionCardTitle}>Workouts</Text>
                    <Text style={styles.selectionCardValue}>{currentWorkoutsGoal}/wk</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {updateActivitySelection === 'Cardio' && (
              <View style={styles.inputGroup}>
                <View style={styles.currentGoalCard}>
                  <View style={[styles.currentGoalIconWrap, { backgroundColor: ACCENT + '22' }]}>
                    <Ionicons name="bicycle-outline" size={18} color={ACCENT} />
                  </View>
                  <View>
                    <Text style={styles.currentGoalLabel}>CURRENT GOAL</Text>
                    <Text style={styles.currentGoalValue}>{currentCardioGoal} minutes</Text>
                  </View>
                </View>

                <ActivityInputNumberPad
                  icon="bicycle-outline"
                  iconColor={ACCENT}
                  label="Cardio (minutes)"
                  value={cardioInputValue}
                  onChange={setCardioInputValue}
                />

                <TouchableOpacity
                  style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                  onPress={handleUpdateCardio}
                  disabled={saving}
                >
                  <Ionicons name="checkmark-outline" size={18} color="#ffffff" />
                  <Text style={styles.saveButtonText}>{saving ? 'UPDATING…' : 'UPDATE'}</Text>
                </TouchableOpacity>
              </View>
            )}

            {updateActivitySelection === 'Steps' && (
              <View style={styles.inputGroup}>
                <View style={styles.currentGoalCard}>
                  <View style={[styles.currentGoalIconWrap, { backgroundColor: '#A49BFF22' }]}>
                    <Ionicons name="footsteps-outline" size={18} color="#A49BFF" />
                  </View>
                  <View>
                    <Text style={styles.currentGoalLabel}>CURRENT GOAL</Text>
                    <Text style={styles.currentGoalValue}>{currentStepsGoal.toLocaleString()} steps</Text>
                  </View>
                </View>

                <ActivityInputNumberPad
                  icon="footsteps-outline"
                  iconColor="#A49BFF"
                  label="Steps"
                  value={stepsInputValue}
                  onChange={setStepsInputValue}
                />

                <TouchableOpacity
                  style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                  onPress={handleUpdateSteps}
                  disabled={saving}
                >
                  <Ionicons name="checkmark-outline" size={18} color="#ffffff" />
                  <Text style={styles.saveButtonText}>{saving ? 'UPDATING…' : 'UPDATE'}</Text>
                </TouchableOpacity>
              </View>
            )}

            {updateActivitySelection === 'Workouts' && (
              <View style={styles.inputGroup}>
                <View style={styles.currentGoalCard}>
                  <View style={[styles.currentGoalIconWrap, { backgroundColor: '#FFA94022' }]}>
                    <Ionicons name="barbell-outline" size={18} color="#FFA940" />
                  </View>
                  <View>
                    <Text style={styles.currentGoalLabel}>CURRENT GOAL</Text>
                    <Text style={styles.currentGoalValue}>{currentWorkoutsGoal} sessions per week</Text>
                  </View>
                </View>

                <ActivityInputNumberPad
                  icon="barbell-outline"
                  iconColor="#FFA940"
                  label="Workouts"
                  value={workoutsInputValue}
                  placeholder="test"
                  onChange={setWorkoutsInputValue}
                />

                <TouchableOpacity
                  style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                  onPress={handleUpdateWorkouts}
                  disabled={saving}
                >
                  <Ionicons name="checkmark-outline" size={18} color="#ffffff" />
                  <Text style={styles.saveButtonText}>{saving ? 'UPDATING…' : 'UPDATE'}</Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        </View>
      </TouchableWithoutFeedback>

      {keyboardVisible && (
        <View style={[styles.accessoryBar, { bottom: keyboardHeight }]}>
          <TouchableOpacity onPress={Keyboard.dismiss}>
            <Text style={styles.accessoryDoneText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </Modal>
  );
};

// ─── Palette ──────────────────────────────────────────────────────────────────
const ACCENT   = '#C6F135';
const ACCENT4  = '#E11D48';
const BG_MODAL = '#1A1A26';
const SURFACE  = '#22222E';
const SURFACE2 = '#2C2C3C';
const BORDER   = '#42425A';
const ACCENT2   = '#2563EB';

const styles = StyleSheet.create({
  accessoryBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  accessoryDoneText: {
    backgroundColor: '#22222E',
    borderWidth: 1,
    borderRadius: 41,
    borderColor: '#C6F135',
    padding: 10,
    color: '#C6F135',
    fontSize: 16,
    fontWeight: '700',
    overflow: 'hidden',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '88%',
    backgroundColor: BG_MODAL,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#ffffff',
    marginBottom: 16,
    lineHeight: 17,
    fontWeight: '500',
  },

  // ── Selection menu (3 cards) ──
  selectionGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  selectionCard: {
    flex: 1,
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 8,
  },
  selectionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionCardTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  selectionCardValue: {
    color: '#A0A0BC',
    fontSize: 11,
    fontWeight: '600',
  },

  // ── Individual goal screens ──
  currentGoalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: SURFACE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 4,
  },
  currentGoalIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentGoalLabel: {
    color: '#A0A0BC',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  currentGoalValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  backBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: SURFACE2,
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    gap: 12,
    marginBottom: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT2,
    paddingVertical: 14,
    borderRadius: 13,
    gap: 8,
    marginBottom: 10,
    shadowColor: ACCENT2,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});

export default UpdatePlanIndividualSelectionModal;