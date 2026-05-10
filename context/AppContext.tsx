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

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);
  const [karmaHistory, setKarmaHistory] = useState<KarmaEvent[]>([]);
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
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

      const loadedUser: User = userStr
        ? { ...DEFAULT_USER, ...JSON.parse(userStr) }
        : DEFAULT_USER;

      let loadedLoans: Loan[] = loansStr ? JSON.parse(loansStr) : DEMO_LOANS;
      const loadedNotifs: Notification[] = notifStr
        ? JSON.parse(notifStr)
        : DEMO_NOTIFICATIONS;
      const loadedKarmaHist: KarmaEvent[] = karmaHistStr
        ? JSON.parse(karmaHistStr)
        : [];

      if (blacklistStr) setBlacklist(JSON.parse(blacklistStr));

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
            id: `auto_writeoff_${loan.id}_${Date.now()}`,
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
            id: `overdue_${loan.id}_${Date.now()}`,
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
    await AsyncStorage.setItem("@zaymy_user", JSON.stringify(u));
    setUser(u);
  };

  const saveLoans = async (l: Loan[]) => {
    await AsyncStorage.setItem("@zaymy_loans", JSON.stringify(l));
    setLoans(l);
  };

  const saveBlacklist = async (bl: string[]) => {
    await AsyncStorage.setItem("@zaymy_blacklist", JSON.stringify(bl));
    setBlacklist(bl);
  };

  const saveNotifications = async (n: Notification[]) => {
    await AsyncStorage.setItem("@zaymy_notifications", JSON.stringify(n));
    setNotifications(n);
  };

  const saveKarmaHistory = async (h: KarmaEvent[]) => {
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
      const updated = [newNotif, ...notifications];
      await saveNotifications(updated);
    },
    [notifications]
  );

  const setUserName = useCallback(
    async (name: string, phone = "", characterId = "lucha") => {
      const updated: User = {
        ...user,
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
      await saveKarmaHistory([welcomeEvent, ...karmaHistory]);
    },
    [user, karmaHistory]
  );

  const updateUser = useCallback(
    async (updates: Partial<User>) => {
      const updated = { ...user, ...updates };
      await saveUser(updated);
    },
    [user]
  );

  const setSelectedCharacter = useCallback(
    async (id: string) => {
      await saveUser({ ...user, selectedCharacterId: id });
    },
    [user]
  );

  const setPremiumTier = useCallback(
    async (tier: 0 | 1 | 2) => {
      await saveUser({ ...user, premiumTier: tier, isPremium: tier > 0 });
    },
    [user]
  );

  const addLoan = useCallback(
    async (loan: Omit<Loan, "id" | "createdAt">) => {
      // Check blacklist
      if (blacklist.some((b) => b.toLowerCase() === loan.contact.toLowerCase().trim())) {
        return {
          success: false,
          error: `${loan.contact} находится в чёрном списке. Удали контакт из чёрного списка чтобы продолжить.`,
        };
      }

      // Enforce Basic tier loan limit
      if (user.premiumTier === 0) {
        const activeCount = loans.filter(
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

      const updated = [newLoan, ...loans];
      await saveLoans(updated);

      if (loan.type === "given") {
        const newKarma = user.karma + 40;
        await saveUser({
          ...user,
          karma: newKarma,
          totalGiven: user.totalGiven + loan.amount,
        });

        // Karma event
        const event: KarmaEvent = {
          id: `karma_give_${newLoan.id}`,
          date: new Date().toISOString(),
          points: 40,
          reason: `Дал в долг: ${loan.contact}`,
          icon: "arrow-up-right",
        };
        await saveKarmaHistory([event, ...karmaHistory]);

        // Notification
        await addNotification({
          type: "karma",
          title: "Карма выросла +40 ⭐",
          message: `Займ для ${loan.contact} зафиксирован. Ты надёжный!`,
          characterId: "lucha",
        });
      } else {
        await saveUser({
          ...user,
          totalTaken: user.totalTaken + loan.amount,
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
    [loans, user, karmaHistory, addNotification]
  );

  const updateLoanStatus = useCallback(
    async (id: string, status: Loan["status"]) => {
      const updated = loans.map((l) => (l.id === id ? { ...l, status } : l));
      await saveLoans(updated);

      if (status === "returned") {
        const loan = loans.find((l) => l.id === id);
        if (loan) {
          // Cancel the scheduled push reminder
          await cancelNotification(loan.notificationId);

          const isEarly = new Date() < new Date(loan.dueDate);
          const karmaPoints = isEarly ? 20 : 10;
          const newKarma = user.karma + karmaPoints;

          await saveUser({
            ...user,
            karma: newKarma,
            totalReturned:
              loan.type === "taken"
                ? user.totalReturned + loan.amount
                : user.totalReturned,
          });

          // Karma event
          const event: KarmaEvent = {
            id: `karma_return_${id}_${Date.now()}`,
            date: new Date().toISOString(),
            points: karmaPoints,
            reason: isEarly
              ? `Досрочный возврат: ${loan.contact}`
              : `Возврат займа: ${loan.contact}`,
            icon: isEarly ? "zap" : "check-circle",
          };
          await saveKarmaHistory([event, ...karmaHistory]);

          // Notification
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
    [loans, user, karmaHistory, addNotification]
  );

  const updateLoanNote = useCallback(
    async (id: string, note: string) => {
      const updated = loans.map((l) => (l.id === id ? { ...l, note } : l));
      await saveLoans(updated);
    },
    [loans]
  );

  const removeLoan = useCallback(
    async (id: string) => {
      await saveLoans(loans.filter((l) => l.id !== id));
    },
    [loans]
  );

  const addKarma = useCallback(
    async (points: number, reason = "Бонус", icon: FeatherIconName = "star") => {
      const newKarma = user.karma + points;
      await saveUser({ ...user, karma: newKarma });

      const event: KarmaEvent = {
        id: `karma_manual_${Date.now()}`,
        date: new Date().toISOString(),
        points,
        reason,
        icon,
      };
      await saveKarmaHistory([event, ...karmaHistory]);
    },
    [user, karmaHistory]
  );

  const markNotificationRead = useCallback(
    async (id: string) => {
      const updated = notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      await saveNotifications(updated);
    },
    [notifications]
  );

  const addToBlacklist = useCallback(
    async (name: string) => {
      if (!blacklist.includes(name)) {
        await saveBlacklist([...blacklist, name]);
      }
    },
    [blacklist]
  );

  const removeFromBlacklist = useCallback(
    async (name: string) => {
      await saveBlacklist(blacklist.filter((n) => n !== name));
    },
    [blacklist]
  );

  const getMyDebts = useCallback(
    () =>
      loans
        .filter((l) => l.type === "taken" && (l.status === "active" || l.status === "overdue"))
        .reduce((s, l) => s + l.amount, 0),
    [loans]
  );

  const getOwedToMe = useCallback(
    () =>
      loans
        .filter((l) => l.type === "given" && (l.status === "active" || l.status === "overdue"))
        .reduce((s, l) => s + l.amount, 0),
    [loans]
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
