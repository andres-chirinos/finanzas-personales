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
}

export interface UserSettings {
  id?: number;
  currentProfileId?: string;
  theme: string;
  currency?: string;
  contributeAnonymously: boolean;
}

export class AppDatabase extends Dexie {
  invoices!: Table<Invoice>;
  categories!: Table<Category>;
  settings!: Table<UserSettings>;
  profiles!: Table<Profile>;

  constructor() {
    super('BilleteraDB');
    this.version(3).stores({
      invoices: '++id, profileId, date, category',
      categories: '++id, profileId, &name',
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
        { name: 'Comida', icon: 'Utensils', color: '#ef4444' },
        { name: 'Transporte', icon: 'Car', color: '#3b82f6' },
        { name: 'Vivienda', icon: 'Home', color: '#10b981' },
        { name: 'Entretenimiento', icon: 'Tv', color: '#f59e0b' },
        { name: 'Salud', icon: 'Activity', color: '#ec4899' },
        { name: 'Otros', icon: 'MoreHorizontal', color: '#64748b' }
      ]);
    }

    // 3. Setup settings
    const settingsCount = await db.settings.count();
    if (settingsCount === 0) {
      await db.settings.add({
        theme: 'dark',
        currentProfileId: defaultProfile.id,
        contributeAnonymously: false
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
