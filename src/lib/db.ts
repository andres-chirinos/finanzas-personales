import Dexie, { type Table } from 'dexie';

export interface Profile {
  id: string;
  name: string;
  avatar?: string;
  currency: string;
  createdAt: Date;
}

export interface Invoice {
  id?: number;
  profileId: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  isAnonymized: boolean;
}

export interface Category {
  id?: number;
  profileId?: string; // Optional: shared categories or per-profile
  name: string;
  icon: string;
  color: string;
  order: number;
  isHidden: boolean;
}

export interface UserSettings {
  id?: number;
  currentProfileId?: string;
  theme: string;
  currency?: string;
  contributeAnonymously: boolean;
  categorySort?: 'manual' | 'most-used';
  hasCompletedOnboarding: boolean;
}

export class AppDatabase extends Dexie {
  invoices!: Table<Invoice>;
  categories!: Table<Category>;
  settings!: Table<UserSettings>;
  profiles!: Table<Profile>;

  constructor() {
    super('BilleteraDB');
    this.version(5).stores({
      invoices: '++id, profileId, date, category',
      categories: '++id, profileId, name, order, isHidden',
      settings: '++id',
      profiles: 'id, name'
    });
  }
}

export const db = new AppDatabase();

// Initial seed data
export async function seedDatabase() {
  await db.transaction('rw', [db.categories, db.settings, db.profiles], async () => {
    // 1. Ensure at least one profile exists
    let defaultProfile = await db.profiles.toCollection().first();
    if (!defaultProfile) {
      const newId = crypto.randomUUID();
      defaultProfile = {
        id: newId,
        name: 'Principal',
        currency: 'Bs',
        createdAt: new Date()
      };
      await db.profiles.add(defaultProfile);
    }

    // 2. Setup categories
    const categoriesCount = await db.categories.count();
    if (categoriesCount === 0) {
      await db.categories.bulkAdd([
        { name: 'Comida', icon: 'Utensils', color: '#ef4444', order: 1, isHidden: false },
        { name: 'Transporte', icon: 'Car', color: '#3b82f6', order: 2, isHidden: false },
        { name: 'Vivienda', icon: 'Home', color: '#10b981', order: 3, isHidden: false },
        { name: 'Entretenimiento', icon: 'Tv', color: '#f59e0b', order: 4, isHidden: false },
        { name: 'Salud', icon: 'Activity', color: '#ec4899', order: 5, isHidden: false },
        { name: 'Otros', icon: 'MoreHorizontal', color: '#64748b', order: 6, isHidden: false }
      ]);
    }

    // 3. Setup settings
    const settingsCount = await db.settings.count();
    if (settingsCount === 0) {
      await db.settings.add({
        theme: 'dark',
        currentProfileId: defaultProfile.id,
        contributeAnonymously: false,
        hasCompletedOnboarding: false
      });
    } else {
      // Ensure currentProfileId is set if it was missing from previous version
      const settings = await db.settings.toCollection().first();
      if (settings && !settings.currentProfileId) {
        await db.settings.update(settings.id!, { currentProfileId: defaultProfile.id });
      }
    }
  });
}
