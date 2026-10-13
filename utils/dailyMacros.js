
import AsyncStorage from '@react-native-async-storage/async-storage';

const MACROS_KEY = 'todayMacros';
const MACROS_DATE_KEY = 'todayMacrosDate';

export const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const checkAndResetDailyMacros = async ({
  setCaloriesConsumed,
  setProteinConsumed,
  setCarbohydratesConsumed,
  setFatsConsumed,
}) => {
  const today = getLocalDateKey();

  const [savedDate, savedMacros] = await Promise.all([
    AsyncStorage.getItem(MACROS_DATE_KEY),
    AsyncStorage.getItem(MACROS_KEY),
  ]);

  if (savedDate !== today) {
    const emptyMacros = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fats: 0,
    };

    await AsyncStorage.multiSet([
      [MACROS_KEY, JSON.stringify(emptyMacros)],
      [MACROS_DATE_KEY, today],
    ]);

    setCaloriesConsumed(0);
    setProteinConsumed(0);
    setCarbohydratesConsumed(0);
    setFatsConsumed(0);

    return;
  }

  const macros = savedMacros ? JSON.parse(savedMacros) : {};

  setCaloriesConsumed(Number(macros.calories) || 0);
  setProteinConsumed(Number(macros.protein) || 0);
  setCarbohydratesConsumed(Number(macros.carbohydrates) || 0);
  setFatsConsumed(Number(macros.fats) || 0);
};