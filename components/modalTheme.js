import { StyleSheet } from 'react-native';
import { font } from '../utils/fonts';

// Shared modal design — taken from AddMacrosModal (Add Food) so every modal
// matches: navy overlay, white card, navy badge, bold black title, round grey
// close button, light input rows (black outline while typing), black save button.

export const M = {
  NAVY: '#0B1F4D',
  INK: '#111111',        // primary text / buttons
  WHITE: '#FFFFFF',
  SURFACE: '#F2F2F2',    // input rows / close button
  MUTED: '#8C8C8C',      // secondary text
  PLACEHOLDER: '#BABABA',
  DANGER: '#EF4444',
};

export const modalStyles = StyleSheet.create({
  // Centered modal
  overlay: {
    flex: 1,
    backgroundColor: M.NAVY + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '88%',
    backgroundColor: M.WHITE,
    padding: 22,
    borderRadius: 24,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
  },

  // Bottom-sheet modal (slides up)
  sheetOverlay: {
    flex: 1,
    backgroundColor: M.NAVY + 'CC',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: M.WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    gap: 6,
    flexShrink: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: M.NAVY,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    color: M.WHITE,
    fontSize: 9,
    ...font('700'),
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 22,
    ...font('900'),
    color: M.INK,
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: M.SURFACE,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 12,
    ...font('400'),
    color: M.MUTED,
    lineHeight: 17,
    marginBottom: 16,
  },

  // Navy summary card (like "Today so far")
  infoCard: {
    backgroundColor: M.NAVY,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 10,
    ...font('700'),
    color: M.WHITE,
    opacity: 0.7,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  infoValue: {
    fontSize: 18,
    ...font('800'),
    color: M.WHITE,
    letterSpacing: -0.5,
  },
  infoLabel: {
    fontSize: 11,
    ...font('500'),
    color: M.WHITE,
    opacity: 0.7,
  },

  // Inputs
  fieldLabel: {
    fontSize: 12,
    ...font('700'),
    color: M.INK,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: M.SURFACE,
    borderWidth: 1.5,
    borderColor: M.SURFACE,
    borderRadius: 14,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 14,
  },
  inputRowFocused: {
    backgroundColor: M.WHITE,
    borderColor: M.INK,
  },
  inputIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 15,
    ...font('700'),
    color: M.INK,
  },
  inputNumber: {
    minWidth: 64,
    paddingVertical: 4,
    textAlign: 'right',
    color: M.INK,
    fontSize: 18,
    ...font('800'),
  },
  textInput: {
    backgroundColor: M.SURFACE,
    borderWidth: 1.5,
    borderColor: M.SURFACE,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: M.INK,
    fontSize: 15,
    ...font('500'),
  },

  // Buttons
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: M.INK,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: M.WHITE,
    fontSize: 15,
    ...font('800'),
    letterSpacing: 0.3,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: M.WHITE,
    borderWidth: 1.5,
    borderColor: M.INK,
    paddingVertical: 14,
    borderRadius: 14,
  },
  secondaryButtonText: {
    color: M.INK,
    fontSize: 15,
    ...font('700'),
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: M.WHITE,
    borderWidth: 1.5,
    borderColor: M.DANGER + '66',
    paddingVertical: 12,
    borderRadius: 14,
  },
  dangerButtonText: {
    color: M.DANGER,
    fontSize: 14,
    ...font('700'),
  },

  // iOS keyboard "Done" bar
  accessoryBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  accessoryDoneText: {
    backgroundColor: M.INK,
    borderRadius: 41,
    paddingVertical: 10,
    paddingHorizontal: 18,
    color: M.WHITE,
    fontSize: 16,
    ...font('700'),
    overflow: 'hidden',
  },
});
