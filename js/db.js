// Initialize the database
let db;
let bcryptLoaded = false;
const dbName = "UserAccountDB";
const RATE_LIMIT_ATTEMPTS = 5;
const RATE_LIMIT_RESET = 15 * 60 * 1000; // 15 minutes

class DatabaseError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
  }
}

// Check if bcrypt is loaded
function checkBcrypt() {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 10;
    const interval = 100;

    const check = () => {
      if (typeof bcrypt !== 'undefined') {
        bcryptLoaded = true;
        resolve(true);
        return;
      }

      attempts++;
      if (attempts >= maxAttempts) {
        reject(new DatabaseError("Encryption library failed to load", 'BCRYPT_LOAD_TIMEOUT'));
        return;
      }

      setTimeout(check, interval);
    };

    check();
  });
}

async function initDB() {
  try {
    // Wait for bcrypt to load first
    await checkBcrypt();

    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new DatabaseError("Your browser doesn't support IndexedDB", 'NO_INDEXEDDB'));
        return;
      }

      const request = indexedDB.open(dbName, 2);
      
      request.onerror = (event) => {
        reject(new DatabaseError(
          `IndexedDB error: ${event.target.error.message}`,
          'DB_INIT_ERROR'
        ));
      };

      request.onsuccess = (event) => {
        db = event.target.result;
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        db = event.target.result;
        
        if (!db.objectStoreNames.contains("users")) {
          const userStore = db.createObjectStore("users", { keyPath: "username" });
          userStore.createIndex("loginAttempts", "loginAttempts", { unique: false });
          userStore.createIndex("lastAttempt", "lastAttempt", { unique: false });
        }
      };
    });
  } catch (error) {
    throw new DatabaseError(
      error.message || "Failed to initialize database",
      error.code || 'DB_INIT_ERROR'
    );
  }
}

async function addUser(username, password) {
  if (!db) {
    throw new DatabaseError("Database not initialized", 'DB_NOT_INITIALIZED');
  }

  if (!bcryptLoaded) {
    throw new DatabaseError("Encryption library not loaded", 'BCRYPT_NOT_LOADED');
  }

  if (!username || !password) {
    throw new DatabaseError("Username and password are required", 'MISSING_CREDENTIALS');
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    return new Promise((resolve, reject) => {
      username = DOMPurify.sanitize(username);
      
      const transaction = db.transaction(["users"], "readwrite");
      const objectStore = transaction.objectStore("users");
      const request = objectStore.add({ 
        username, 
        password: hashedPassword,
        loginAttempts: 0,
        lastAttempt: null
      });

      request.onerror = (event) => {
        reject(new DatabaseError(
          `Error adding user: ${event.target.error.message}`,
          'USER_ADD_ERROR'
        ));
      };
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError(
      error.message || 'Error creating user',
      'USER_CREATION_ERROR'
    );
  }
}

async function getUser(username) {
  if (!db) {
    throw new DatabaseError("Database not initialized", 'DB_NOT_INITIALIZED');
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["users"], "readonly");
    const objectStore = transaction.objectStore("users");
    const request = objectStore.get(username);

    request.onerror = (event) => {
      reject(new DatabaseError(
        `Error getting user: ${event.target.error.message}`,
        'USER_GET_ERROR'
      ));
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function updateLoginAttempts(username, reset = false) {
  if (!db) {
    throw new DatabaseError("Database not initialized", 'DB_NOT_INITIALIZED');
  }

  const transaction = db.transaction(["users"], "readwrite");
  const objectStore = transaction.objectStore("users");
  const user = await getUser(username);
  
  if (!user) {
    throw new DatabaseError("User not found", 'USER_NOT_FOUND');
  }

  if (reset) {
    user.loginAttempts = 0;
    user.lastAttempt = null;
  } else {
    user.loginAttempts = (user.loginAttempts || 0) + 1;
    user.lastAttempt = Date.now();
  }

  return new Promise((resolve, reject) => {
    const request = objectStore.put(user);
    request.onerror = (event) => {
      reject(new DatabaseError(
        `Error updating login attempts: ${event.target.error.message}`,
        'UPDATE_ATTEMPTS_ERROR'
      ));
    };
    request.onsuccess = () => resolve();
  });
}

async function checkRateLimit(username) {
  if (!db) {
    throw new DatabaseError("Database not initialized", 'DB_NOT_INITIALIZED');
  }

  const user = await getUser(username);
  if (!user) return true;

  if (user.loginAttempts >= RATE_LIMIT_ATTEMPTS) {
    const timeSinceLastAttempt = Date.now() - (user.lastAttempt || 0);
    if (timeSinceLastAttempt < RATE_LIMIT_RESET) {
      return false;
    }
    await updateLoginAttempts(username, true);
  }
  return true;
}