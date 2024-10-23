// Initialize the database
let db;
const dbName = "UserAccountDB";

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    
    request.onerror = (event) => reject("IndexedDB error: " + event.target.error);

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      const objectStore = db.createObjectStore("users", { keyPath: "username" });
    };
  });
}

function addUser(username, password) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["users"], "readwrite");
    const objectStore = transaction.objectStore("users");
    const request = objectStore.add({ username, password });

    request.onerror = (event) => reject("Error adding user: " + event.target.error);
    request.onsuccess = (event) => resolve();
  });
}

function getUser(username) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["users"], "readonly");
    const objectStore = transaction.objectStore("users");
    const request = objectStore.get(username);

    request.onerror = (event) => reject("Error getting user: " + event.target.error);
    request.onsuccess = (event) => resolve(request.result);
  });
}
