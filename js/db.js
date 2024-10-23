// Initialize the database
let db;
const dbName = "UserAccountDB";
const RATE_LIMIT_ATTEMPTS = 5;
const RATE_LIMIT_RESET = 15 * 60 * 1000; // 15 minutes

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 2);
    
    request.onerror = (event) => reject("IndexedDB error: " + event.target.error);

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      const userStore = db.createObjectStore("users", { keyPath: "username" });
      userStore.createIndex("loginAttempts", "loginAttempts", { unique: false });
      userStore.createIndex("lastAttempt", "lastAttempt", { unique: false });
    };
  });
}

async function addUser(username, password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  return new Promise((resolve, reject) => {
    if (!username || !password) {
      reject("Username and password are required");
      return;
    }

    // Sanitize input
    username = DOMPurify.sanitize(username);
    
    const transaction = db.transaction(["users"], "readwrite");
    const objectStore = transaction.objectStore("users");
    const request = objectStore.add({ 
      username, 
      password: hashedPassword,
      loginAttempts: 0,
      lastAttempt: null
    });

    request.onerror = (event) => reject("Error adding user: " + event.target.error);
    request.onsuccess = (event) => resolve();
  });
}

async function getUser(username) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["users"], "readonly");
    const objectStore = transaction.objectStore("users");
    const request = objectStore.get(username);

    request.onerror = (event) => reject("Error getting user: " + event.target.error);
    request.onsuccess = (event) => resolve(request.result);
  });
}

async function updateLoginAttempts(username, reset = false) {
  const transaction = db.transaction(["users"], "readwrite");
  const objectStore = transaction.objectStore("users");
  const user = await getUser(username);
  
  if (!user) return;

  if (reset) {
    user.loginAttempts = 0;
    user.lastAttempt = null;
  } else {
    user.loginAttempts = (user.loginAttempts || 0) + 1;
    user.lastAttempt = Date.now();
  }

  return new Promise((resolve, reject) => {
    const request = objectStore.put(user);
    request.onerror = (event) => reject(event.target.error);
    request.onsuccess = (event) => resolve();
  });
}

async function checkRateLimit(username) {
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