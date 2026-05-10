import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { router } from "expo-router";

// ─── Foreground display behaviour ────────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── Permission ───────────────────────────────────────────────────────────────

/**
 * Ask the OS for notification permission.
 * Returns true if granted, false if denied or on web.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

/**
 * Schedule a push notification N days before a loan's due date.
 * Returns the notification ID, or null if scheduling was skipped.
 *
 * @param loanId      — used to navigate to loan detail on tap
 * @param contact     — debtor / creditor name
 * @param amount      — loan amount in roubles
 * @param dueDate     — ISO date string of the due date
 * @param daysBeforeDue — how many days before due date to fire (default: 3)
 */
export async function scheduleLoanReminder(
  loanId: string,
  contact: string,
  amount: number,
  dueDate: string,
  daysBeforeDue = 3
): Promise<string | null> {
  if (Platform.OS === "web") return null;

  const triggerDate = new Date(dueDate);
  triggerDate.setDate(triggerDate.getDate() - daysBeforeDue);

  // Don't schedule if reminder date is already in the past
  if (triggerDate <= new Date()) return null;

  try {
    const amountFormatted = amount.toLocaleString("ru-RU");
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "📅 Напоминание о займе",
        body:
          daysBeforeDue === 0
            ? `Сегодня последний день! ${contact} — ${amountFormatted} ₽`
            : `${contact} должен вернуть ${amountFormatted} ₽ через ${daysBeforeDue} дн.`,
        data: { loanId, screen: "loan_detail" },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
    return id;
  } catch (e) {
    console.warn("[Notifications] Failed to schedule reminder:", e);
    return null;
  }
}

/**
 * Schedule an overdue notification (fires immediately / next minute).
 */
export async function scheduleOverdueNotification(
  loanId: string,
  contact: string,
  amount: number,
  daysOverdue: number
): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚠️ Просрочка!",
        body: `${contact} не вернул ${amount.toLocaleString("ru-RU")} ₽ уже ${daysOverdue} дн.`,
        data: { loanId, screen: "loan_detail" },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
        repeats: false,
      },
    });
  } catch {}
}

// ─── Cancel ───────────────────────────────────────────────────────────────────

/**
 * Cancel a previously scheduled notification by its ID.
 */
export async function cancelNotification(
  notificationId: string | undefined | null
): Promise<void> {
  if (!notificationId || Platform.OS === "web") return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {}
}

/**
 * Cancel ALL scheduled notifications (e.g. on full data reset).
 */
export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}

// ─── Tap handler ──────────────────────────────────────────────────────────────

/**
 * Subscribe to notification tap events and navigate to the relevant loan.
 * Call this once in the root layout, store the returned cleanup function,
 * and call it when the component unmounts.
 *
 * @returns cleanup function that removes the listener
 */
export function setupNotificationTapHandler(): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data as {
        loanId?: string;
        screen?: string;
      };
      if (data?.loanId) {
        // Small delay to ensure navigation is ready
        setTimeout(() => {
          router.push(`/loan/${data.loanId}` as any);
        }, 300);
      }
    }
  );
  return () => subscription.remove();
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export async function setBadgeCount(count: number): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch {}
}
