// App font: the system font — SF Pro on iOS (same as Apple Health),
// Roboto on Android. Nothing to load.
//
// Screens use font('700') for a weight, so the font can be swapped in one place.
export const font = (weight = '400') => ({ fontWeight: String(weight) });
