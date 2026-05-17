import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, IS_REAL_SUPABASE } from './supabaseClient';

// --- DATA TYPES ---
export interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  role: 'admin' | 'user';
  address?: string;
  mobile_number?: string;
  created_at?: string;
  email?: string; // High-fidelity mock custom credential saving
  password?: string; // High-fidelity mock custom credential saving
}

export interface FurnitureItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: 'Sofas & Armchairs' | 'Tables & Desks' | 'Beds & Mattresses' | 'Chairs & Stools';
  description: string;
  is_hidden: boolean; // Soft delete field
  created_at?: string;
}

export interface CartItem {
  id: string;
  furniture_id: string;
  user_id: string;
  quantity: number;
  furniture?: FurnitureItem; // Populated details
}

export interface ActivityLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: 'CREATE' | 'UPDATE' | 'SOFT_DELETE' | 'HARD_DELETE';
  target_item_id: string;
  target_item_name: string;
  details: string;
  created_at: string;
}

// --- DEFAULT LUXURY INVENTORY (Amethyst Purple & Champagne Gold accents) ---
const DEFAULT_FURNITURE: FurnitureItem[] = [
  {
    id: 'f1',
    name: 'Royal Amethyst Armchair',
    price: 899,
    image_url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80',
    category: 'Sofas & Armchairs',
    description: 'Upholstered in rich deep amethyst velvet and trimmed with premium brushed gold metal legs. Ergonomic seating designed to combine high-luxury style with absolute comfort.',
    is_hidden: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'f2',
    name: 'Aurelia Marble Desk',
    price: 1299,
    image_url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80',
    category: 'Tables & Desks',
    description: 'A striking work desk featuring a premium black Calacatta marble slab inlaid with delicate golden veins. Set on an elegant obsidian geometric support architecture.',
    is_hidden: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'f3',
    name: 'Sovereign Velvet Bedframe',
    price: 2499,
    image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
    category: 'Beds & Mattresses',
    description: 'A grand master bedroom bedframe with an expansive tufted headboard, hand-stitched with amethyst purple threads and accentuated with custom brass borders.',
    is_hidden: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'f4',
    name: 'Majestic Gold Accent Chair',
    price: 450,
    image_url: 'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&w=600&q=80',
    category: 'Chairs & Stools',
    description: 'A modern sculptural chair crafted in solid chrome steel and electroplated with pure champagne gold. A high-contrast premium accent piece to elevate any contemporary interior.',
    is_hidden: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'f5',
    name: 'Imperial Chesterfield Sofa',
    price: 3200,
    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    category: 'Sofas & Armchairs',
    description: 'Classic Chesterfield design re-imagined with deep-buttoned premium amethyst leather. Wide scrolled armrests and solid dark mahogany bun feet with gold metal caps.',
    is_hidden: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'f6',
    name: 'Luxor Glass Dining Table',
    price: 1500,
    image_url: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=600&q=80',
    category: 'Tables & Desks',
    description: 'A dining experience built around a thick tempered glass tabletop, supported by a mesmerizing, interlocking double-ring base finished in luxurious antique gold.',
    is_hidden: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'f7',
    name: 'Crown Rest Ortho Mattress',
    price: 950,
    image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80',
    category: 'Beds & Mattresses',
    description: 'Elite multi-layer memory foam mattress utilizing copper-infused cooling tech. Specifically engineered for targeted spine alignment and therapeutic body contour support.',
    is_hidden: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'f8',
    name: 'Monarch Velvet Barstool',
    price: 280,
    image_url: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=600&q=80',
    category: 'Chairs & Stools',
    description: 'Elevate your bar counter with this plush, purple-velvet counter-height stool, featuring a golden ring footrest and robust obsidian powder-coated iron chassis.',
    is_hidden: false,
    created_at: new Date().toISOString()
  }
];

// --- MOCK STORAGE KEYS ---
const KEY_INVENTORY = '@furniture_inventory';
const KEY_PROFILES = '@furniture_profiles';
const KEY_CARTS = '@furniture_carts';
const KEY_LOGS = '@furniture_activity_logs';
const KEY_SESSION = '@furniture_session';

// --- MOCK DATABASE INITIALIZER ---
export const initializeMockDB = async () => {
  try {
    const inv = await AsyncStorage.getItem(KEY_INVENTORY);
    if (!inv) {
      await AsyncStorage.setItem(KEY_INVENTORY, JSON.stringify(DEFAULT_FURNITURE));
    } else {
      // Overwrite/restore original cover images for default items (f1-f8) to ensure they are the premium Unsplash photos!
      const items: FurnitureItem[] = JSON.parse(inv);
      let updated = false;
      const newItems = items.map(item => {
        const defaultItem = DEFAULT_FURNITURE.find(df => df.id === item.id);
        if (defaultItem && item.image_url !== defaultItem.image_url) {
          item.image_url = defaultItem.image_url;
          updated = true;
        }
        return item;
      });
      if (updated) {
        await AsyncStorage.setItem(KEY_INVENTORY, JSON.stringify(newItems));
      }
    }
    
    const profs = await AsyncStorage.getItem(KEY_PROFILES);
    if (!profs) {
      // Default Mock Accounts
      const defaultProfiles: Profile[] = [
        {
          id: 'admin_1',
          username: 'AdminChief',
          avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
          role: 'admin',
        },
        {
          id: 'user_1',
          username: 'Jane Doe',
          avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
          role: 'user',
          address: '123 Elegance Lane, Amethyst Heights',
          mobile_number: '+1 (555) 123-4567'
        }
      ];
      await AsyncStorage.setItem(KEY_PROFILES, JSON.stringify(defaultProfiles));
    }

    const carts = await AsyncStorage.getItem(KEY_CARTS);
    if (!carts) {
      await AsyncStorage.setItem(KEY_CARTS, JSON.stringify([]));
    }

    const logs = await AsyncStorage.getItem(KEY_LOGS);
    if (!logs) {
      await AsyncStorage.setItem(KEY_LOGS, JSON.stringify([]));
    }
  } catch (e) {
    console.error('Failed to initialize local mock database', e);
  }
};

// --- AUTH API ---
export const authAPI = {
  login: async (email: string, password: string, requestRole: 'admin' | 'user'): Promise<{ user: Profile | null; error: string | null }> => {
    // 1. INPUT SANITIZATION & SECURITY VALIDATION
    if (!email || !password) {
      return { user: null, error: 'Email and password are required fields.' };
    }
    const cleanEmail = email.trim().toLowerCase();
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { user: null, error: 'Please enter a valid email address.' };
    }
    // Password security check
    if (password.length < 6) {
      return { user: null, error: 'Password must be at least 6 characters in length.' };
    }

    if (IS_REAL_SUPABASE) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });
        if (error) throw error;
        
        // Fetch matching role profile
        const { data: profile, error: profError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profError || !profile) {
          return { user: null, error: 'Profile not found. Contact system administrator.' };
        }

        if (profile.role !== requestRole) {
          await supabase.auth.signOut();
          return { user: null, error: `Access denied. Authorized role is: ${profile.role.toUpperCase()}` };
        }

        return { user: profile as Profile, error: null };
      } catch (err: any) {
        return { user: null, error: err.message || 'Authentication error. Please try again.' };
      }
    } else {
      // High-Fidelity Strict Mock Authentication
      await initializeMockDB();
      const profilesStr = await AsyncStorage.getItem(KEY_PROFILES);
      const profiles: Profile[] = profilesStr ? JSON.parse(profilesStr) : [];
      
      // Enforce default mock accounts
      if (requestRole === 'admin' && cleanEmail === 'admin@furniture.com') {
        if (password !== 'admin123') {
          return { user: null, error: 'Invalid password for Admin. (Hint: use admin123)' };
        }
        const adminProfile = profiles.find(p => p.role === 'admin');
        if (adminProfile) {
          await AsyncStorage.setItem(KEY_SESSION, JSON.stringify(adminProfile));
          return { user: adminProfile, error: null };
        }
      } else if (requestRole === 'user' && cleanEmail === 'user@furniture.com') {
        if (password !== 'user123') {
          return { user: null, error: 'Invalid password. (Hint: use user123)' };
        }
        const userProfile = profiles.find(p => p.role === 'user');
        if (userProfile) {
          await AsyncStorage.setItem(KEY_SESSION, JSON.stringify(userProfile));
          return { user: userProfile, error: null };
        }
      }
      
      // Check if they are a user who previously signed up
      const emailPrefix = cleanEmail.split('@')[0];
      const matchProfile = profiles.find(
        p => (p.email?.toLowerCase() === cleanEmail || p.username.toLowerCase() === emailPrefix.toLowerCase()) && p.role === requestRole
      );
      
      if (matchProfile) {
        const defaultPassword = requestRole === 'admin' ? 'admin123' : 'user123';
        const expectedPassword = matchProfile.password || defaultPassword;
        if (password !== expectedPassword) {
          return { user: null, error: `Invalid password for this account. (Hint: use ${expectedPassword})` };
        }
        await AsyncStorage.setItem(KEY_SESSION, JSON.stringify(matchProfile));
        return { user: matchProfile, error: null };
      }

      return { 
        user: null, 
        error: `Access Denied: Invalid email or password. Please use 'user@furniture.com' with password 'user123' to log in, or register a new account on the SIGN UP tab!` 
      };
    }
  },

  signUp: async (username: string, email: string, password: string): Promise<{ user: Profile | null; error: string | null }> => {
    // 1. ROBUST INPUT SANITIZATION & SECURITY VALIDATION
    if (!username || !email || !password) {
      return { user: null, error: 'All fields (Username, Email, Password) are strictly required.' };
    }
    const cleanUser = username.trim();
    if (cleanUser.length < 3) {
      return { user: null, error: 'Username must be at least 3 characters long.' };
    }
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { user: null, error: 'Please submit a valid email address.' };
    }
    if (password.length < 8) {
      return { user: null, error: 'Security constraint: Password must be at least 8 characters long.' };
    }

    if (IS_REAL_SUPABASE) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { username: cleanUser }
          }
        });
        if (error) throw error;
        
        // Edge functions automatically seed profile table on auth signup.
        // We retrieve the newly created profile via Edge Function profile-api.
        const { data: profile, error: profError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user?.id)
          .single();

        if (profError) throw profError;
        return { user: profile as Profile, error: null };
      } catch (err: any) {
        return { user: null, error: err.message || 'Error occurred during registration.' };
      }
    } else {
      // Mock SignUp
      await initializeMockDB();
      const profilesStr = await AsyncStorage.getItem(KEY_PROFILES);
      const profiles: Profile[] = profilesStr ? JSON.parse(profilesStr) : [];

      const exists = profiles.some(p => p.username.toLowerCase() === cleanUser.toLowerCase());
      if (exists) {
        return { user: null, error: 'Security conflict: Username is already registered.' };
      }

      const newMockUser: Profile = {
        id: `user_${Date.now()}`,
        username: cleanUser,
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanUser)}&background=8A2BE2&color=fff`,
        role: 'user',
        address: '',
        mobile_number: '',
        email: cleanEmail, // Save their signup email!
        password: password, // Save their signup password!
      };

      profiles.push(newMockUser);
      await AsyncStorage.setItem(KEY_PROFILES, JSON.stringify(profiles));
      await AsyncStorage.setItem(KEY_SESSION, JSON.stringify(newMockUser));
      return { user: newMockUser, error: null };
    }
  },

  getCurrentSession: async (): Promise<Profile | null> => {
    if (IS_REAL_SUPABASE) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return profile as Profile;
    } else {
      const sess = await AsyncStorage.getItem(KEY_SESSION);
      return sess ? JSON.parse(sess) : null;
    }
  },

  logout: async (): Promise<void> => {
    if (IS_REAL_SUPABASE) {
      await supabase.auth.signOut();
    } else {
      await AsyncStorage.removeItem(KEY_SESSION);
    }
  }
};

// --- FURNITURE CRUD API ---
export const furnitureAPI = {
  list: async (): Promise<FurnitureItem[]> => {
    if (IS_REAL_SUPABASE) {
      // Enforces RBAC & fetches from secure Edge Function
      const { data, error } = await supabase.functions.invoke('furniture-api', {
        method: 'GET'
      });
      if (error) {
        console.error('Edge function inventory pull failed, fallback direct DB read', error);
        // Direct RBAC shielded DB SELECT fallback
        const { data: dbData } = await supabase
          .from('furniture')
          .select('*')
          .order('created_at', { ascending: false });
        return dbData || [];
      }
      return data || [];
    } else {
      await initializeMockDB();
      const itemsStr = await AsyncStorage.getItem(KEY_INVENTORY);
      const items: FurnitureItem[] = itemsStr ? JSON.parse(itemsStr) : [];
      return items;
    }
  },

  create: async (item: Omit<FurnitureItem, 'id' | 'is_hidden' | 'created_at'>, admin: Profile): Promise<FurnitureItem> => {
    // 1. DATA VALIDATION
    if (!item.name || !item.price || !item.image_url || !item.category || !item.description) {
      throw new Error('All inventory input fields are strictly required.');
    }
    if (item.price < 0) {
      throw new Error('Price cannot be a negative amount.');
    }

    if (IS_REAL_SUPABASE) {
      const { data, error } = await supabase.functions.invoke('furniture-api', {
        method: 'POST',
        body: { item, adminId: admin.id }
      });
      if (error) throw new Error(error.message || 'Failed to register item through Edge API.');
      return data;
    } else {
      const items = await furnitureAPI.list();
      const newItem: FurnitureItem = {
        ...item,
        id: `f_${Date.now()}`,
        is_hidden: false,
        created_at: new Date().toISOString()
      };
      items.unshift(newItem);
      await AsyncStorage.setItem(KEY_INVENTORY, JSON.stringify(items));

      // Append Activity Log
      await activityAPI.log(admin, 'CREATE', newItem.id, newItem.name, `Added new product "${newItem.name}" under ${newItem.category} priced at $${newItem.price}`);
      return newItem;
    }
  },

  update: async (id: string, updates: Partial<Omit<FurnitureItem, 'id' | 'created_at'>>, admin: Profile): Promise<FurnitureItem> => {
    // DATA VALIDATION
    if (updates.price !== undefined && updates.price < 0) {
      throw new Error('Price cannot be negative.');
    }

    if (IS_REAL_SUPABASE) {
      const { data, error } = await supabase.functions.invoke('furniture-api', {
        method: 'PUT',
        body: { id, updates, adminId: admin.id }
      });
      if (error) throw new Error(error.message || 'Failed to modify item through Edge API.');
      return data;
    } else {
      const items = await furnitureAPI.list();
      const idx = items.findIndex(item => item.id === id);
      if (idx === -1) throw new Error('Selected item was not found in inventory.');
      
      const updatedItem = {
        ...items[idx],
        ...updates
      };
      items[idx] = updatedItem;
      await AsyncStorage.setItem(KEY_INVENTORY, JSON.stringify(items));

      // Append Activity Log
      await activityAPI.log(
        admin, 
        'UPDATE', 
        id, 
        updatedItem.name, 
        `Updated details for "${updatedItem.name}". New details: ${JSON.stringify(updates)}`
      );
      return updatedItem;
    }
  },

  // Soft Delete / Hide from user display
  softDelete: async (id: string, admin: Profile): Promise<void> => {
    if (IS_REAL_SUPABASE) {
      const { error } = await supabase.functions.invoke('furniture-api', {
        method: 'DELETE',
        body: { id, adminId: admin.id }
      });
      if (error) throw new Error(error.message || 'Failed to soft delete item through Edge API.');
    } else {
      const items = await furnitureAPI.list();
      const idx = items.findIndex(item => item.id === id);
      if (idx === -1) throw new Error('Selected item was not found in inventory.');

      items[idx].is_hidden = true;
      await AsyncStorage.setItem(KEY_INVENTORY, JSON.stringify(items));

      // Append Activity Log
      await activityAPI.log(
        admin, 
        'SOFT_DELETE', 
        id, 
        items[idx].name, 
        `Hiding "${items[idx].name}" from customers immediately (Soft Delete enabled).`
      );
    }
  },

  // Hard Delete / Permanent removal from database
  hardDelete: async (id: string, admin: Profile): Promise<void> => {
    if (IS_REAL_SUPABASE) {
      const { error } = await supabase
        .from('furniture')
        .delete()
        .eq('id', id);
      if (error) throw new Error(error.message || 'Failed to permanently delete item.');
    } else {
      const items = await furnitureAPI.list();
      const idx = items.findIndex(item => item.id === id);
      if (idx === -1) throw new Error('Selected item was not found in inventory.');
      const itemName = items[idx].name;
      
      const updatedItems = items.filter(item => item.id !== id);
      await AsyncStorage.setItem(KEY_INVENTORY, JSON.stringify(updatedItems));

      // Append Activity Log
      await activityAPI.log(
        admin, 
        'HARD_DELETE', 
        id, 
        itemName, 
        `Permanently removed "${itemName}" from the database catalog (Hard Delete).`
      );
    }
  }
};

// --- CUSTOMER CART API ---
export const cartAPI = {
  list: async (userId: string): Promise<CartItem[]> => {
    if (IS_REAL_SUPABASE) {
      const { data, error } = await supabase.functions.invoke('cart-api', {
        method: 'GET',
        headers: { 'x-user-id': userId }
      });
      if (error) {
        // DB Fallback SELECT
        const { data: dbData } = await supabase
          .from('cart')
          .select('*, furniture(*)')
          .eq('user_id', userId);
        return dbData || [];
      }
      return data || [];
    } else {
      await initializeMockDB();
      const cartStr = await AsyncStorage.getItem(KEY_CARTS);
      const carts: CartItem[] = cartStr ? JSON.parse(cartStr) : [];
      const userCarts = carts.filter(item => item.user_id === userId);
      
      // Hydrate with furniture detail
      const furniture = await furnitureAPI.list();
      return userCarts.map(item => ({
        ...item,
        furniture: furniture.find(f => f.id === item.furniture_id)
      })).filter(item => item.furniture && !item.furniture.is_hidden); // Filter out hidden items
    }
  },

  addToCart: async (userId: string, furnitureId: string, quantity = 1): Promise<void> => {
    if (IS_REAL_SUPABASE) {
      const { error } = await supabase.functions.invoke('cart-api', {
        method: 'POST',
        body: { userId, furnitureId, quantity }
      });
      if (error) throw new Error(error.message || 'Cart operations failed.');
    } else {
      await initializeMockDB();
      const cartStr = await AsyncStorage.getItem(KEY_CARTS);
      const carts: CartItem[] = cartStr ? JSON.parse(cartStr) : [];
      
      const idx = carts.findIndex(item => item.user_id === userId && item.furniture_id === furnitureId);
      if (idx !== -1) {
        carts[idx].quantity += quantity;
      } else {
        carts.push({
          id: `c_${Date.now()}`,
          user_id: userId,
          furniture_id: furnitureId,
          quantity
        });
      }
      await AsyncStorage.setItem(KEY_CARTS, JSON.stringify(carts));
    }
  },

  updateQuantity: async (userId: string, furnitureId: string, newQty: number): Promise<void> => {
    if (newQty <= 0) {
      await cartAPI.removeFromCart(userId, furnitureId);
      return;
    }
    
    if (IS_REAL_SUPABASE) {
      const { error } = await supabase.functions.invoke('cart-api', {
        method: 'PUT',
        body: { userId, furnitureId, quantity: newQty }
      });
      if (error) throw new Error(error.message || 'Quantity update failed.');
    } else {
      await initializeMockDB();
      const cartStr = await AsyncStorage.getItem(KEY_CARTS);
      const carts: CartItem[] = cartStr ? JSON.parse(cartStr) : [];
      const idx = carts.findIndex(item => item.user_id === userId && item.furniture_id === furnitureId);
      if (idx !== -1) {
        carts[idx].quantity = newQty;
        await AsyncStorage.setItem(KEY_CARTS, JSON.stringify(carts));
      }
    }
  },

  removeFromCart: async (userId: string, furnitureId: string): Promise<void> => {
    if (IS_REAL_SUPABASE) {
      const { error } = await supabase.functions.invoke('cart-api', {
        method: 'DELETE',
        body: { userId, furnitureId }
      });
      if (error) throw new Error(error.message || 'Remove failed.');
    } else {
      await initializeMockDB();
      const cartStr = await AsyncStorage.getItem(KEY_CARTS);
      let carts: CartItem[] = cartStr ? JSON.parse(cartStr) : [];
      carts = carts.filter(item => !(item.user_id === userId && item.furniture_id === furnitureId));
      await AsyncStorage.setItem(KEY_CARTS, JSON.stringify(carts));
    }
  },

  clearCart: async (userId: string): Promise<void> => {
    if (IS_REAL_SUPABASE) {
      await supabase.functions.invoke('cart-api', {
        method: 'DELETE',
        body: { userId, clearAll: true }
      });
    } else {
      await initializeMockDB();
      const cartStr = await AsyncStorage.getItem(KEY_CARTS);
      let carts: CartItem[] = cartStr ? JSON.parse(cartStr) : [];
      carts = carts.filter(item => item.user_id !== userId);
      await AsyncStorage.setItem(KEY_CARTS, JSON.stringify(carts));
    }
  }
};

// --- CUSTOMER & ADMIN PROFILE UPDATE API ---
export const profileAPI = {
  get: async (userId: string): Promise<Profile> => {
    if (IS_REAL_SUPABASE) {
      const { data, error } = await supabase.functions.invoke('profile-api', {
        method: 'GET',
        headers: { 'x-user-id': userId }
      });
      if (error) {
        const { data: dbData } = await supabase.from('profiles').select('*').eq('id', userId).single();
        return dbData as Profile;
      }
      return data;
    } else {
      await initializeMockDB();
      const profilesStr = await AsyncStorage.getItem(KEY_PROFILES);
      const profiles: Profile[] = profilesStr ? JSON.parse(profilesStr) : [];
      const profile = profiles.find(p => p.id === userId);
      if (!profile) throw new Error('User profile does not exist.');
      return profile;
    }
  },

  update: async (userId: string, updates: Partial<Omit<Profile, 'id' | 'role' | 'created_at'>>, requestUserRole: 'admin' | 'user'): Promise<Profile> => {
    // 1. INPUT SANITIZATION & STAGE CHECKS
    if (requestUserRole === 'admin' && updates.username !== undefined) {
      // Strict constraint: Admin cannot edit their own username
      throw new Error('Security Breach: Administrators are restricted from editing their username.');
    }
    if (updates.mobile_number !== undefined && updates.mobile_number !== '') {
      // Validate mobile number characters
      const cleanMobile = updates.mobile_number.replace(/[\s()+-]/g, '');
      if (isNaN(Number(cleanMobile)) || cleanMobile.length < 7) {
        throw new Error('Please input a valid contact mobile number.');
      }
    }

    if (IS_REAL_SUPABASE) {
      const { data, error } = await supabase.functions.invoke('profile-api', {
        method: 'PUT',
        body: { userId, updates }
      });
      if (error) throw new Error(error.message || 'Profile modification was rejected by server.');
      return data;
    } else {
      await initializeMockDB();
      const profilesStr = await AsyncStorage.getItem(KEY_PROFILES);
      const profiles: Profile[] = profilesStr ? JSON.parse(profilesStr) : [];
      const idx = profiles.findIndex(p => p.id === userId);
      if (idx === -1) throw new Error('User profile not found.');

      // Extra check inside mock layer just in case
      if (profiles[idx].role === 'admin' && updates.username !== undefined) {
        throw new Error('Security policy: Admin username is fixed.');
      }

      const updated = {
        ...profiles[idx],
        ...updates
      };
      profiles[idx] = updated;
      await AsyncStorage.setItem(KEY_PROFILES, JSON.stringify(profiles));
      
      // Update session storage as well
      const session = await AsyncStorage.getItem(KEY_SESSION);
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed.id === userId) {
          await AsyncStorage.setItem(KEY_SESSION, JSON.stringify(updated));
        }
      }
      return updated;
    }
  }
};

// --- SYSTEM SECURITY ACTIVITY LOGS API ---
export const activityAPI = {
  list: async (): Promise<ActivityLog[]> => {
    if (IS_REAL_SUPABASE) {
      const { data, error } = await supabase.functions.invoke('logs-api', {
        method: 'GET'
      });
      if (error) {
        const { data: dbData } = await supabase
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false });
        return dbData || [];
      }
      return data || [];
    } else {
      await initializeMockDB();
      const logsStr = await AsyncStorage.getItem(KEY_LOGS);
      const logs: ActivityLog[] = logsStr ? JSON.parse(logsStr) : [];
      return logs;
    }
  },

  log: async (admin: Profile, action: 'CREATE' | 'UPDATE' | 'SOFT_DELETE' | 'HARD_DELETE', targetId: string, targetName: string, details: string): Promise<void> => {
    if (IS_REAL_SUPABASE) {
      // Note: Edge functions insert logs automatically as part of item modification triggers,
      // but if we need a direct audit logger:
      await supabase.functions.invoke('logs-api', {
        method: 'POST',
        body: { adminId: admin.id, action, targetId, details }
      });
    } else {
      await initializeMockDB();
      const logsStr = await AsyncStorage.getItem(KEY_LOGS);
      const logs: ActivityLog[] = logsStr ? JSON.parse(logsStr) : [];
      
      const newLog: ActivityLog = {
        id: `log_${Date.now()}`,
        admin_id: admin.id,
        admin_name: admin.username,
        action,
        target_item_id: targetId,
        target_item_name: targetName,
        details,
        created_at: new Date().toISOString()
      };
      
      logs.unshift(newLog);
      await AsyncStorage.setItem(KEY_LOGS, JSON.stringify(logs));
    }
  }
};
