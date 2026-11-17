import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

// Daily activity lives in the Supabase `daily_activity` table — one row per
// user per day (steps, cardio_minutes, workouts). Weekly totals come from the
// `weekly_activity` view, so nothing is ever added to a running counter.

// Before this table existed, history was kept on the device under this key.
// It's uploaded once (see migrateLegacyHistory) and then removed.
const LEGACY_HISTORY_KEY = 'fitbounty.activityHistory.v1';

const pad = (n) => String(n).padStart(2, '0');

// The user's LOCAL calendar day as 'YYYY-MM-DD' (not UTC)
export const getActivityDateKey = (date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// Monday of the week containing `date`, as 'YYYY-MM-DD' — matches weekly_activity.week_start
export const getWeekStartKey = (date = new Date()) => {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return getActivityDateKey(monday);
};

const EMPTY_DAY = { steps: 0, cardio: 0, workouts: 0 };

const fromRow = (row) => ({
  date: row.date,
  steps: Number(row.steps) || 0,
  cardio: Number(row.cardio_minutes) || 0,
  workouts: Number(row.workouts) || 0,
});

const migratedUsers = new Set();

// One-off upload of any history saved on the device before daily_activity
// existed. Existing cloud rows win (ignoreDuplicates), then the local copy is removed.
const migrateLegacyHistory = async (userId) => {
  if (migratedUsers.has(userId)) return;

  const storageKey = `${LEGACY_HISTORY_KEY}.${userId}`;
  const stored = await AsyncStorage.getItem(storageKey);

  if (stored) {
    const parsed = JSON.parse(stored);
    const rows = (Array.isArray(parsed) ? parsed : [])
      .filter((entry) => entry && /^\d{4}-\d{2}-\d{2}$/.test(entry.date))
      .map((entry) => ({
        user_id: userId,
        date: entry.date,
        steps: Math.max(0, Number(entry.steps) || 0),
        cardio_minutes: Math.max(0, Number(entry.cardio) || 0),
        workouts: Math.max(0, Number(entry.workouts) || 0),
      }));

    if (rows.length) {
      const { error } = await supabase
        .from('daily_activity')
        .upsert(rows, { onConflict: 'user_id,date', ignoreDuplicates: true });
      if (error) throw error;
    }

    await AsyncStorage.removeItem(storageKey);
  }

  migratedUsers.add(userId);
};

const getUserId = async (userId) => {
  let activeUserId = userId;
  if (!activeUserId) {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    activeUserId = session?.user?.id;
  }
  if (!activeUserId) throw new Error('Cannot access activity history without a signed-in user');

  await migrateLegacyHistory(activeUserId);
  return activeUserId;
};

// All logged days, oldest first: [{ date, steps, cardio, workouts }]
export const getActivityHistory = async (userId) => {
  await getUserId(userId);

  const { data, error } = await supabase
    .from('daily_activity')
    .select('date, steps, cardio_minutes, workouts')
    .order('date');

  if (error) throw error;
  return (data || []).map(fromRow);
};

// One day's totals (defaults to today): { steps, cardio, workouts }
export const getActivityDay = async (date = getActivityDateKey(), userId) => {
  await getUserId(userId);

  const { data, error } = await supabase
    .from('daily_activity')
    .select('date, steps, cardio_minutes, workouts')
    .eq('date', date)
    .maybeSingle();

  if (error) throw error;
  return data ? fromRow(data) : { date, ...EMPTY_DAY };
};

// Totals for the week containing `date` (defaults to this week): { steps, cardio, workouts }
export const getWeeklyTotals = async (date = new Date(), userId) => {
  await getUserId(userId);

  const { data, error } = await supabase
    .from('weekly_activity')
    .select('steps, cardio_minutes, workouts')
    .eq('week_start', getWeekStartKey(date))
    .maybeSingle();

  if (error) throw error;
  return data
    ? { steps: Number(data.steps) || 0, cardio: Number(data.cardio_minutes) || 0, workouts: Number(data.workouts) || 0 }
    : { ...EMPTY_DAY };
};

// Insert or overwrite a day's totals: { date, steps, cardio, workouts }
export const saveActivityDay = async (entry, userId) => {
  const activeUserId = await getUserId(userId);

  const { error } = await supabase
    .from('daily_activity')
    .upsert(
      {
        user_id: activeUserId,
        date: entry.date,
        steps: Math.max(0, Number(entry.steps) || 0),
        cardio_minutes: Math.max(0, Number(entry.cardio) || 0),
        workouts: Math.max(0, Number(entry.workouts) || 0),
      },
      { onConflict: 'user_id,date' }
    );

  if (error) throw error;
};

export const removeActivityDay = async (date, userId) => {
  const activeUserId = await getUserId(userId);

  const { error } = await supabase
    .from('daily_activity')
    .delete()
    .eq('user_id', activeUserId)
    .eq('date', date);

  if (error) throw error;
};
