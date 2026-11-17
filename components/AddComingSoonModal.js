import React from 'react';
import { Modal, View, Text, Pressable } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { M, modalStyles as ms } from './modalTheme';

const AddComingSoonModal = ({
    visible,
    onClose,
  }) => {

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={ms.overlay}>
        <View style={ms.card}>

          {/* Header */}
          <View style={ms.header}>
            <View style={ms.headerLeft}>
              <View style={ms.badge}>
                <Text style={ms.badgeText}>COMING SOON</Text>
              </View>
              <Text style={ms.title}>Coming Soon</Text>
            </View>
            <Pressable onPress={onClose} style={ms.closeBtn} hitSlop={10}>
              <Ionicons name="close" size={20} color={M.INK} />
            </Pressable>
          </View>

          <Text style={[ms.subtitle, { marginBottom: 0 }]}>* This Feature is currently under development *</Text>

        </View>
      </View>
    </Modal>
  );
};

export default AddComingSoonModal;
