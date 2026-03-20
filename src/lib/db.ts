import Dexie, { type Table } from 'dexie';

export interface Invoice {
  id?: number;
  amount: number;
  description: string;
  category: string;
  date: Date;
  store?: string;
  isAnonymized: boolean; // Flag to check if it has been shared anonymously
}

export interface Category {
  id?: number;
  name: string;
  icon: string;
  color: string;
}

export interface UserSettings {
  id?: number;
  theme: 'light' | 'dark';
  currency: string;
  contributeAnonymously: boolean;
}

export class MyDatabase extends Dexie {
  invoices!: Table<Invoice>;
  categories!: Table<Category>;
  settings!: Table<UserSettings>;

  constructor() {
    super('BilleteraDB');
    this.version(1).stores({
      invoices: '++id, date, category, isAnonymized',
      categories: '++id, &name',
      settings: '++id'
    });
  }
}

export const db = new MyDatabase();

// Initial seed data
export async function seedDatabase() {
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

  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add({
      theme: 'dark',
      currency: 'USD',
      contributeAnonymously: false
    });
  }
}
