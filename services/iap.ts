/**
 * In-App Purchase Service — RevenueCat abstraction layer
 *
 * Setup checklist (do once you have App Store / Google Play accounts):
 * ─────────────────────────────────────────────────────────────────────
 * 1. Install SDK:
 *      npx expo install react-native-purchases
 *
 * 2. Register at https://app.revenuecat.com (free tier available)
 *
 * 3. Create an app in RevenueCat, get your API keys
 *
 * 4. Replace REVENUECAT_API_KEY_IOS / ANDROID below with real keys
 *
 * 5. Create products in App Store Connect (iOS):
 *      - com.zaymy.app.standard.monthly  → 149 ₽/мес
 *      - com.zaymy.app.premium.monthly   → 599 ₽/мес
 *
 * 6. Create products in Google Play Console (Android):
 *      - Same product IDs, same prices
 *
 * 7. Configure Entitlements in RevenueCat dashboard:
 *      - "standard" entitlement → Standard product
 *      - "premium"  entitlement → Premium product
 *
 * 8. Uncomment the RevenueCat calls in each function below
 * ─────────────────────────────────────────────────────────────────────
 */

import { Platform, Alert } from "react-native";

// ─── Config ────────────────────────────────────────────────────────────────
// Keys are read from environment variables so they are never committed to source
// control.  Set EXPO_PUBLIC_REVENUECAT_IOS_KEY and
// EXPO_PUBLIC_REVENUECAT_ANDROID_KEY in your .env.local file (gitignored).
// Placeholder values keep the app buildable before real keys are configured.
const REVENUECAT_API_KEY_IOS =
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? "appl_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const REVENUECAT_API_KEY_ANDROID =
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? "goog_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

// Product identifiers — must match App Store Connect / Google Play Console
export const PRODUCT_IDS = {
  STANDARD_MONTHLY: "com.zaymy.app.standard.monthly",
  PREMIUM_MONTHLY: "com.zaymy.app.premium.monthly",
} as const;

// RevenueCat entitlement names
const ENTITLEMENT_STANDARD = "standard";
const ENTITLEMENT_PREMIUM = "premium";

// ─── Types ─────────────────────────────────────────────────────────────────

export type PremiumTier = 0 | 1 | 2;

export type PurchaseResult =
  | { success: true; tier: 1 | 2 }
  | { success: false; error: string; cancelled?: boolean };

export type RestoreResult =
  | { success: true; tier: PremiumTier }
  | { success: false; error: string };

// ─── Initialization ────────────────────────────────────────────────────────

let _initialized = false;

/**
 * Call once at app startup (in root _layout.tsx).
 * Safe to call multiple times — no-ops after first call.
 */
export async function initializeIAP(): Promise<void> {
  if (_initialized || Platform.OS === "web") return;

  try {
    // TODO: uncomment after installing react-native-purchases
    //
    // const Purchases = (await import("react-native-purchases")).default;
    // Purchases.setLogLevel(Purchases.LOG_LEVEL.WARN);
    //
    // const apiKey =
    //   Platform.OS === "ios"
    //     ? REVENUECAT_API_KEY_IOS
    //     : REVENUECAT_API_KEY_ANDROID;
    //
    // Purchases.configure({ apiKey });

    _initialized = true;
    console.log("[IAP] Initialized (test mode — no real billing)");
  } catch (e) {
    console.warn("[IAP] Failed to initialize RevenueCat:", e);
  }
}

// ─── Purchase ──────────────────────────────────────────────────────────────

/**
 * Trigger the native purchase sheet for the given tier.
 *
 * In test mode (no RevenueCat keys): immediately returns success.
 * In production: goes through App Store / Google Play billing.
 */
export async function purchasePremium(tier: 1 | 2): Promise<PurchaseResult> {
  if (Platform.OS === "web") {
    // Web: just activate locally for testing
    return { success: true, tier };
  }

  const productId =
    tier === 1 ? PRODUCT_IDS.STANDARD_MONTHLY : PRODUCT_IDS.PREMIUM_MONTHLY;

  try {
    // TODO: uncomment after installing react-native-purchases
    //
    // const Purchases = (await import("react-native-purchases")).default;
    // const offerings = await Purchases.getOfferings();
    // const current = offerings.current;
    //
    // if (!current) {
    //   return { success: false, error: "Продукты недоступны. Проверьте интернет." };
    // }
    //
    // const pkg = current.availablePackages.find(
    //   (p) => p.product.productIdentifier === productId
    // );
    //
    // if (!pkg) {
    //   return { success: false, error: `Продукт ${productId} не найден.` };
    // }
    //
    // const { customerInfo } = await Purchases.purchasePackage(pkg);
    // const hasEntitlement =
    //   !!customerInfo.entitlements.active[
    //     tier === 2 ? ENTITLEMENT_PREMIUM : ENTITLEMENT_STANDARD
    //   ];
    //
    // if (hasEntitlement) return { success: true, tier };
    // return { success: false, error: "Покупка прошла, но доступ не активирован. Нажмите «Восстановить»." };

    // ── FALLBACK (test mode) ──────────────────────────────────────────────
    // Remove this block in production once RevenueCat is wired up
    console.warn("[IAP] Test mode: purchase simulated without real billing.");
    return { success: true, tier };
    // ─────────────────────────────────────────────────────────────────────
  } catch (e: any) {
    if (e?.userCancelled === true) {
      return { success: false, error: "Покупка отменена", cancelled: true };
    }
    const msg: string = e?.message ?? "Неизвестная ошибка покупки";
    console.warn("[IAP] Purchase error:", msg);
    return { success: false, error: msg };
  }
}

// ─── Restore ──────────────────────────────────────────────────────────────

/**
 * Restore purchases (required by App Store rules — must be a button in the UI).
 */
export async function restorePurchases(): Promise<RestoreResult> {
  if (Platform.OS === "web") return { success: true, tier: 0 };

  try {
    // TODO: uncomment after installing react-native-purchases
    //
    // const Purchases = (await import("react-native-purchases")).default;
    // const customerInfo = await Purchases.restorePurchases();
    //
    // if (customerInfo.entitlements.active[ENTITLEMENT_PREMIUM]) {
    //   return { success: true, tier: 2 };
    // }
    // if (customerInfo.entitlements.active[ENTITLEMENT_STANDARD]) {
    //   return { success: true, tier: 1 };
    // }
    // return { success: true, tier: 0 };

    // ── FALLBACK (test mode) ──────────────────────────────────────────────
    console.warn("[IAP] Test mode: restore returned no purchases.");
    return { success: true, tier: 0 };
    // ─────────────────────────────────────────────────────────────────────
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Ошибка восстановления" };
  }
}

// ─── Customer info ────────────────────────────────────────────────────────

/**
 * Check current entitlements (e.g. on app launch to sync server state).
 */
export async function syncPremiumStatus(): Promise<PremiumTier> {
  if (Platform.OS === "web") return 0;

  try {
    // TODO: uncomment after installing react-native-purchases
    //
    // const Purchases = (await import("react-native-purchases")).default;
    // const { entitlements } = await Purchases.getCustomerInfo();
    //
    // if (entitlements.active[ENTITLEMENT_PREMIUM]) return 2;
    // if (entitlements.active[ENTITLEMENT_STANDARD]) return 1;

    return 0;
  } catch {
    return 0;
  }
}
