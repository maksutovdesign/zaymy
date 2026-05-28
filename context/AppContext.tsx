import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import {
  scheduleLoanReminder,
  cancelNotification,
  setBadgeCount,
} from "@/utils/notifications";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

export interface KarmaEvent {
  id: string;
  date: string;
  points: number;
  reason: string;
  icon: FeatherIconName;
}

export interface User {
  name: string;
  phone: string;
  isPremium: boolean;
  premiumTier: 0 | 1 | 2;
  karma: number;
  totalGiven: number;
  totalTaken: number;
  totalReturned: number;
  friendsCount: number;
  badges: string[];
  selectedCharacterId: string;
  createdAt: string;
  autoWriteOff: boolean;
  lateFeeRate: number;
  isPrivate: boolean;
  overdueCheckedDate: string;
}

export interface Loan {
  id: string;
  type: "given" | "taken";
  contact: string;
  amount: number;
  term: string;
  interestRate: number;
  account: string;
  status: "active" | "returned" | "overdue";
  createdAt: string;
  dueDate: string;
  note?: string;
  notificationId?: string;
}

export interface Notification {
  id: string;
  type: "reminder" | "received" | "overdue" | "karma" | "friend" | "offer";
  title: string;
  message: string;
  characterId: string;
  read: boolean;
  createdAt: string;
}

const BASIC_TIER_LOAN_LIMIT = 5;

interface AppContextValue {
  user: User;
  loans: Loan[];
  notifications: Notification[];
  karmaHistory: KarmaEvent[];
  blacklist: string[];
  isLoading: boolean;
  setUserName: (name: string, phone?: string, characterId?: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  setSelectedCharacter: (id: string) => Promise<void>;
  setPremiumTier: (tier: 0 | 1 | 2) => Promise<void>;
  addLoan: (loan: Omit<Loan, "id" | "createdAt">) => Promise<{ success: boolean; error?: string }>;
  updateLoanStatus: (id: string, status: Loan["status"]) => Promise<void>;
  updateLoanNote: (id: string, note: string) => Promise<void>;
  removeLoan: (id: string) => Promise<void>;
  addKarma: (points: number, reason?: string, icon?: FeatherIconName) => Promise<void>;
  addNotification: (n: Omit<Notification, "id" | "createdAt" | "read">) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  addToBlacklist: (name: string) => Promise<void>;
  removeFromBlacklist: (name: string) => Promise<void>;
  getMyDebts: () => number;
  getOwedToMe: () => number;
}

const DEFAULT_USER: User = {
  name: "",
  phone: "",
  isPremium: false,
  premiumTier: 0,
  karma: 0,
  totalGiven: 0,
  totalTaken: 0,
  totalReturned: 0,
  friendsCount: 0,
  badges: [],
  selectedCharacterId: "lucha",
  createdAt: new Date().toISOString(),
  autoWriteOff: false,
  lateFeeRate: 0,
  isPrivate: false,
  overdueCheckedDate: "",
};

const DEMO_LOANS: Loan[] = [
  {
    id: "demo1",
    type: "given",
    contact: "Андрей К.",
    amount: 15000,
    term: "30 дней",
    interestRate: 0,
    account: "СберБанк",
    status: "active",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo2",
    type: "taken",
    contact: "Мария С.",
    amount: 5000,
    term: "14 дней",
    interestRate: 0,
    account: "Тинькофф",
    status: "active",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo3",
    type: "given",
    contact: "Саша Б.",
    amount: 3000,
    term: "7 дней",
    interestRate: 0,
    account: "Тинькофф",
    status: "returned",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "notif1",
    type: "reminder",
    title: "Напоминание о долге",
    message: "Андрей К. должен вернуть 15 000 ₽ через 3 дня",
    characterId: "topa",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notif2",
    type: "karma",
    title: "Карма выросла!",
    message: "Ты получил +40 к карме за новый займ. Так держать!",
    characterId: "lucha",
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notif3",
    type: "offer",
    title: "Предложение от банка",
    message: "Зюйд рекомендует: специальные условия кредитования для вас!",
    characterId: "zyuyd",
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Safe JSON parser — returns fallback on parse error or null/undefined input.
// Prevents crashes from corrupted AsyncStorage data (partial writes, manual edits).
function safeParse<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try {
    const result = JSON.parse(str);
    return result ?? fallback;
  } catch {
    return fallback;
  }
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);
  const [karmaHistory, setKarmaHistory] = useState<KarmaEvent[]>([]);
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Refs hold the LATEST state value so callbacks never capture stale closures.
  // Updated immediately inside each save* helper (before setXxx), so sequential
  // async calls within a single handler always read the up-to-date value.
  const userRef = useRef(user);
  const loansRef = useRef(loans);
  const notificationsRef = useRef(notifications);
  const karmaHistoryRef = useRef(karmaHistory);
  const blacklistRef = useRef(blacklist);

  useEffect(() => {
    loadData().catch(console.error);
  }, []);

  const loadData = async () => {
    try {
      const [userStr, loansStr, blacklistStr, notifStr, karmaHistStr] =
        await Promise.all([
          AsyncStorage.getItem("@zaymy_user"),
          AsyncStorage.getItem("@zaymy_loans"),
          AsyncStorage.getItem("@zaymy_blacklist"),
          AsyncStorage.getItem("@zaymy_notifications"),
          AsyncStorage.getItem("@zaymy_karma_history"),
        ]);

      const loadedUser: User = {
        ...DEFAULT_USER,
        ...safeParse<Partial<User>>(userStr, {}),
      };
      // Sanitize numeric fields — prevents NaN in UI if stored value is corrupt
      loadedUser.karma = Number.isFinite(loadedUser.karma) ? loadedUser.karma : 0;
      loadedUser.totalGiven = Number.isFinite(loadedUser.totalGiven) ? loadedUser.totalGiven : 0;
      loadedUser.totalTaken = Number.isFinite(loadedUser.totalTaken) ? loadedUser.totalTaken : 0;
      loadedUser.totalReturned = Number.isFinite(loadedUser.totalReturned) ? loadedUser.totalReturned : 0;
      loadedUser.friendsCount = Number.isFinite(loadedUser.friendsCount) ? loadedUser.friendsCount : 0;

      let loadedLoans: Loan[] = safeParse<Loan[]>(loansStr, DEMO_LOANS);
      if (!Array.isArray(loadedLoans)) loadedLoans = DEMO_LOANS;

      const loadedNotifs: Notification[] = (() => {
        const parsed = safeParse<Notification[]>(notifStr, DEMO_NOTIFICATIONS);
        return Array.isArray(parsed) ? parsed : DEMO_NOTIFICATIONS;
      })();

      const loadedKarmaHist: KarmaEvent[] = (() => {
        const parsed = safeParse<KarmaEvent[]>(karmaHistStr, []);
        return Array.isArray(parsed) ? parsed : [];
      })();

      if (blacklistStr) {
        const bl = safeParse<string[]>(blacklistStr, []);
        setBlacklist(Array.isArray(bl) ? bl : []);
      }

      // Auto-process overdue loans
      const today = new Date().toDateString();
      const newNotifs: Notification[] = [];
      let karmaDeduction = 0;
      let loansChanged = false;

      loadedLoans = loadedLoans.map((loan) => {
        if (loan.status !== "active") return loan;

        const isOverdue = new Date() > new Date(loan.dueDate);
        if (!isOverdue) return loan;

        loansChanged = true;

        // autoWriteOff: mark as returned automatically
        if (loadedUser.autoWriteOff) {
          newNotifs.push({
            // append random suffix — multiple loans can be processed in the same ms
            id: `auto_writeoff_${loan.id}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            type: "received",
            title: "Займ списан автоматически",
            message: `Займ ${loan.contact} на ${loan.amount.toLocaleString("ru-RU")} ₽ автоматически закрыт.`,
            characterId: "lucha",
            read: false,
            createdAt: new Date().toISOString(),
          });
          return { ...loan, status: "returned" as const };
        }

        // Mark as overdue + karma deduction once per day
        if (loadedUser.overdueCheckedDate !== today) {
          const daysOverdue = Math.ceil(
            (Date.now() - new Date(loan.dueDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          // Deduct 5 per overdue loan (not per day to avoid huge deductions on first load)
          karmaDeduction += 5;

          newNotifs.push({
            id: `overdue_${loan.id}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            type: "overdue",
            title: "Просрочка!",
            message: `${loan.type === "given" ? loan.contact + " не вернул" : "Ты не вернул"} ${loan.amount.toLocaleString("ru-RU")} ₽. Просрочка: ${daysOverdue} дн.`,
            characterId: "topa",
            read: false,
            createdAt: new Date().toISOString(),
          });
        }

        return { ...loan, status: "overdue" as const };
      });

      // Apply karma deduction and update overdueCheckedDate
      let finalUser = loadedUser;
      if (karmaDeduction > 0 || loadedUser.overdueCheckedDate !== today) {
        finalUser = {
          ...loadedUser,
          karma: Math.max(0, loadedUser.karma - karmaDeduction),
          overdueCheckedDate: today,
        };
        await AsyncStorage.setItem("@zaymy_user", JSON.stringify(finalUser));

        if (karmaDeduction > 0) {
          const deductEvent: KarmaEvent = {
            id: `karma_overdue_${Date.now()}`,
            date: new Date().toISOString(),
            points: -karmaDeduction,
            reason: "Просрочка по займам",
            icon: "clock",
          };
          loadedKarmaHist.unshift(deductEvent);
          await AsyncStorage.setItem(
            "@zaymy_karma_history",
            JSON.stringify(loadedKarmaHist)
          );
        }
      }

      if (loansChanged) {
        await AsyncStorage.setItem("@zaymy_loans", JSON.stringify(loadedLoans));
      }

      // Merge new overdue/writeoff notifications
      const mergedNotifs =
        newNotifs.length > 0
          ? [...newNotifs, ...loadedNotifs]
          : loadedNotifs;

      if (newNotifs.length > 0) {
        await AsyncStorage.setItem(
          "@zaymy_notifications",
          JSON.stringify(mergedNotifs)
        );
      }

      setUser(finalUser);
      setLoans(loadedLoans);
      setNotifications(mergedNotifs);
      setKarmaHistory(loadedKarmaHist);
    } catch (e) {
      console.warn("[AppContext] loadData error:", e);
      // Fallback to demo state so app remains usable
      setLoans(DEMO_LOANS);
      setNotifications(DEMO_NOTIFICATIONS);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (u: User) => {
    userRef.current = u;
    await AsyncStorage.setItem("@zaymy_user", JSON.stringify(u));
    setUser(u);
  };

  const saveLoans = async (l: Loan[]) => {
    loansRef.current = l;
    await AsyncStorage.setItem("@zaymy_loans", JSON.stringify(l));
    setLoans(l);
  };

  const saveBlacklist = async (bl: string[]) => {
    blacklistRef.current = bl;
    await AsyncStorage.setItem("@zaymy_blacklist", JSON.stringify(bl));
    setBlacklist(bl);
  };

  const saveNotifications = async (n: Notification[]) => {
    notificationsRef.current = n;
    await AsyncStorage.setItem("@zaymy_notifications", JSON.stringify(n));
    setNotifications(n);
  };

  const saveKarmaHistory = async (h: KarmaEvent[]) => {
    karmaHistoryRef.current = h;
    await AsyncStorage.setItem("@zaymy_karma_history", JSON.stringify(h));
    setKarmaHistory(h);
  };

  const addNotification = useCallback(
    async (n: Omit<Notification, "id" | "createdAt" | "read">) => {
      const newNotif: Notification = {
        ...n,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
        createdAt: new Date().toISOString(),
        read: false,
      };
      // Use ref — always reads latest notifications even in sequential async calls
      const updated = [newNotif, ...notificationsRef.current];
      await saveNotifications(updated);
    },
    []
  );

  const setUserName = useCallback(
    async (name: string, phone = "", characterId = "lucha") => {
      const updated: User = {
        ...userRef.current,
        name,
        phone,
        karma: 100,
        selectedCharacterId: characterId,
        createdAt: new Date().toISOString(),
      };
      await saveUser(updated);

      // Welcome karma event
      const welcomeEvent: KarmaEvent = {
        id: `karma_welcome_${Date.now()}`,
        date: new Date().toISOString(),
        points: 100,
        reason: "Добро пожаловать в Дай в долг!",
        icon: "star",
      };
      await saveKarmaHistory([welcomeEvent, ...karmaHistoryRef.current]);
    },
    []
  );

  const updateUser = useCallback(
    async (updates: Partial<User>) => {
      const updated = { ...userRef.current, ...updates };
      await saveUser(updated);
    },
    []
  );

  const setSelectedCharacter = useCallback(
    async (id: string) => {
      await saveUser({ ...userRef.current, selectedCharacterId: id });
    },
    []
  );

  const setPremiumTier = useCallback(
    async (tier: 0 | 1 | 2) => {
      await saveUser({ ...userRef.current, premiumTier: tier, isPremium: tier > 0 });
    },
    []
  );

  const addLoan = useCallback(
    async (loan: Omit<Loan, "id" | "createdAt">) => {
      // Check blacklist
      if (blacklistRef.current.some((b) => b.toLowerCase() === loan.contact.toLowerCase().trim())) {
        return {
          success: false,
          error: `${loan.contact} находится в чёрном списке. Удали контакт из чёрного списка чтобы продолжить.`,
        };
      }

      // Enforce Basic tier loan limit
      if (userRef.current.premiumTier === 0) {
        const activeCount = loansRef.current.filter(
          (l) => l.status === "active" || l.status === "overdue"
        ).length;
        if (activeCount >= BASIC_TIER_LOAN_LIMIT) {
          return {
            success: false,
            error: `На базовом тарифе можно иметь не более ${BASIC_TIER_LOAN_LIMIT} активных займов. Перейди на Premium для безлимитного доступа.`,
          };
        }
      }

      const newLoan: Loan = {
        ...loan,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      };

      // Schedule push reminder 3 days before due date
      const notifId = await scheduleLoanReminder(
        newLoan.id,
        loan.contact,
        loan.amount,
        loan.dueDate
      );
      if (notifId) newLoan.notificationId = notifId;

      // saveLoans updates loansRef.current immediately, so sequential calls are safe
      await saveLoans([newLoan, ...loansRef.current]);

      if (loan.type === "given") {
        const newKarma = userRef.current.karma + 40;
        await saveUser({
          ...userRef.current,
          karma: newKarma,
          totalGiven: userRef.current.totalGiven + loan.amount,
        });

        // Karma event — saveKarmaHistory updates karmaHistoryRef.current immediately
        const event: KarmaEvent = {
          id: `karma_give_${newLoan.id}`,
          date: new Date().toISOString(),
          points: 40,
          reason: `Дал в долг: ${loan.contact}`,
          icon: "arrow-up-right",
        };
        await saveKarmaHistory([event, ...karmaHistoryRef.current]);

        // addNotification reads notificationsRef.current (already up-to-date)
        await addNotification({
          type: "karma",
          title: "Карма выросла +40 ⭐",
          message: `Займ для ${loan.contact} зафиксирован. Ты надёжный!`,
          characterId: "lucha",
        });
      } else {
        await saveUser({
          ...userRef.current,
          totalTaken: userRef.current.totalTaken + loan.amount,
        });

        await addNotification({
          type: "reminder",
          title: "Займ зафиксирован",
          message: `Не забудь вернуть ${loan.amount.toLocaleString("ru-RU")} ₽ до ${new Date(loan.dueDate).toLocaleDateString("ru-RU")}.`,
          characterId: "topa",
        });
      }

      return { success: true };
    },
    [addNotification]
  );

  const updateLoanStatus = useCallback(
    async (id: string, status: Loan["status"]) => {
      const updated = loansRef.current.map((l) => (l.id === id ? { ...l, status } : l));
      await saveLoans(updated);

      if (status === "returned") {
        const loan = loansRef.current.find((l) => l.id === id);
        if (loan) {
          await cancelNotification(loan.notificationId);

          const isEarly = new Date() < new Date(loan.dueDate);
          const karmaPoints = isEarly ? 20 : 10;

          await saveUser({
            ...userRef.current,
            karma: userRef.current.karma + karmaPoints,
            totalReturned:
              loan.type === "taken"
                ? userRef.current.totalReturned + loan.amount
                : userRef.current.totalReturned,
          });

          const event: KarmaEvent = {
            id: `karma_return_${id}_${Date.now()}`,
            date: new Date().toISOString(),
            points: karmaPoints,
            reason: isEarly
              ? `Досрочный возврат: ${loan.contact}`
              : `Возврат займа: ${loan.contact}`,
            icon: isEarly ? "zap" : "check-circle",
          };
          await saveKarmaHistory([event, ...karmaHistoryRef.current]);

          await addNotification({
            type: "karma",
            title: isEarly ? `Досрочно! +${karmaPoints} к карме ⚡` : `Займ закрыт +${karmaPoints} к карме ✓`,
            message: isEarly
              ? `Займ с ${loan.contact} закрыт досрочно. Отличная репутация!`
              : `Займ с ${loan.contact} на ${loan.amount.toLocaleString("ru-RU")} ₽ возвращён.`,
            characterId: "lucha",
          });
        }
      }
    },
    [addNotification]
  );

  const updateLoanNote = useCallback(
    async (id: string, note: string) => {
      const updated = loansRef.current.map((l) => (l.id === id ? { ...l, note } : l));
      await saveLoans(updated);
    },
    []
  );

  const removeLoan = useCallback(
    async (id: string) => {
      // Cancel any pending push notification before removing
      const loan = loansRef.current.find((l) => l.id === id);
      if (loan?.notificationId) {
        await cancelNotification(loan.notificationId);
      }
      // Uses ref — safe to call sequentially without stale state
      await saveLoans(loansRef.current.filter((l) => l.id !== id));
    },
    []
  );

  const addKarma = useCallback(
    async (points: number, reason = "Бонус", icon: FeatherIconName = "star") => {
      await saveUser({ ...userRef.current, karma: userRef.current.karma + points });

      const event: KarmaEvent = {
        id: `karma_manual_${Date.now()}`,
        date: new Date().toISOString(),
        points,
        reason,
        icon,
      };
      await saveKarmaHistory([event, ...karmaHistoryRef.current]);
    },
    []
  );

  const markNotificationRead = useCallback(
    async (id: string) => {
      const updated = notificationsRef.current.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      await saveNotifications(updated);
    },
    []
  );

  const addToBlacklist = useCallback(
    async (name: string) => {
      if (!blacklistRef.current.includes(name)) {
        await saveBlacklist([...blacklistRef.current, name]);
      }
    },
    []
  );

  const removeFromBlacklist = useCallback(
    async (name: string) => {
      await saveBlacklist(blacklistRef.current.filter((n) => n !== name));
    },
    []
  );

  const getMyDebts = useCallback(
    () =>
      loansRef.current
        .filter((l) => l.type === "taken" && (l.status === "active" || l.status === "overdue"))
        .reduce((s, l) => s + l.amount, 0),
    []
  );

  const getOwedToMe = useCallback(
    () =>
      loansRef.current
        .filter((l) => l.type === "given" && (l.status === "active" || l.status === "overdue"))
        .reduce((s, l) => s + l.amount, 0),
    []
  );

  return (
    <AppContext.Provider
      value={{
        user,
        loans,
        notifications,
        karmaHistory,
        blacklist,
        isLoading,
        setUserName,
        updateUser,
        setSelectedCharacter,
        setPremiumTier,
        addLoan,
        updateLoanStatus,
        updateLoanNote,
        removeLoan,
        addKarma,
        addNotification,
        markNotificationRead,
        addToBlacklist,
        removeFromBlacklist,
        getMyDebts,
        getOwedToMe,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
