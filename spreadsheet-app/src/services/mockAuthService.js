let users = [
  {
    id: '1',
    name: 'snufkin',
    email: 'hardstyle@bootleg.com',
    password: 'hardstyle',
    documents: []
  }
];

let currentUser = null;
let currentAccessToken = null;

const getUserDocuments = (userId) => {
  const allDocs = localStorage.getItem('spreadsheet_docs');
  if (!allDocs) return [];
  const docs = JSON.parse(allDocs);
  return docs.filter(doc => doc.userId === userId);
};

const saveUserDocuments = (userId, documents) => {
  const allDocs = localStorage.getItem('spreadsheet_docs');
  let allDocsArray = allDocs ? JSON.parse(allDocs) : [];
  allDocsArray = allDocsArray.filter(doc => doc.userId !== userId);
  allDocsArray.push(...documents.map(doc => ({ ...doc, userId })));
  localStorage.setItem('spreadsheet_docs', JSON.stringify(allDocsArray));
};

export const mockAuthAPI = {
  register: async (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const { name, email, password } = userData;
        
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
          reject({ message: 'Пользователь с таким email уже существует' });
          return;
        }
        
        const newUser = {
          id: Date.now().toString(),
          name,
          email,
          password,
          documents: []
        };
        
        users.push(newUser);
        
        const accessToken = `mock_access_token_${newUser.id}_${Date.now()}`;
        const refreshToken = `mock_refresh_token_${newUser.id}_${Date.now()}`;
        
        localStorage.setItem('refreshToken', refreshToken);
        
        currentUser = { id: newUser.id, name: newUser.name, email: newUser.email };
        currentAccessToken = accessToken;
        
        resolve({
          user: currentUser,
          accessToken,
          refreshToken
        });
      }, 500);
    });
  },
  
  login: async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
          reject({ message: 'Неверный email или пароль' });
          return;
        }
        
        const accessToken = `mock_access_token_${user.id}_${Date.now()}`;
        const refreshToken = `mock_refresh_token_${user.id}_${Date.now()}`;
        
        localStorage.setItem('refreshToken', refreshToken);
        
        currentUser = { id: user.id, name: user.name, email: user.email };
        currentAccessToken = accessToken;
        
        resolve({
          user: currentUser,
          accessToken,
          refreshToken
        });
      }, 500);
    });
  },
  
  getCurrentUser: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (currentUser && currentAccessToken) {
          resolve({ user: currentUser });
        } else {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken && refreshToken.startsWith('mock_refresh_token_')) {
            const userId = refreshToken.split('_')[3];
            const user = users.find(u => u.id === userId);
            if (user) {
              currentUser = { id: user.id, name: user.name, email: user.email };
              currentAccessToken = `mock_access_token_${userId}_${Date.now()}`;
              resolve({ user: currentUser });
            } else {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        }
      }, 100);
    });
  },
  
  refreshToken: async () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken || !refreshToken.startsWith('mock_refresh_token_')) {
          reject({ message: 'Нет refresh токена' });
          return;
        }
        
        const userId = refreshToken.split('_')[3];
        const user = users.find(u => u.id === userId);
        
        if (!user) {
          reject({ message: 'Пользователь не найден' });
          return;
        }
        
        const newAccessToken = `mock_access_token_${userId}_${Date.now()}`;
        currentAccessToken = newAccessToken;
        currentUser = { id: user.id, name: user.name, email: user.email };
        
        resolve({ accessToken: newAccessToken });
      }, 200);
    });
  },
  
  logout: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('refreshToken');
        currentUser = null;
        currentAccessToken = null;
        resolve();
      }, 100);
    });
  },
  
  getUserDocuments: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!currentUser) {
          resolve([]);
          return;
        }
        const allDocs = localStorage.getItem('spreadsheet_docs');
        const docs = allDocs ? JSON.parse(allDocs) : [];
        const userDocs = docs.filter(doc => doc.userId === currentUser.id);
        resolve(userDocs);
      }, 100);
    });
  },
  
  checkDocumentAccess: async (documentId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!currentUser) {
          reject({ status: 401 });
          return;
        }
        
        const allDocs = localStorage.getItem('spreadsheet_docs');
        const docs = allDocs ? JSON.parse(allDocs) : [];
        const doc = docs.find(d => d.id === documentId);
        
        if (!doc) {
          reject({ status: 404 });
          return;
        }
        
        if (doc.userId !== currentUser.id) {
          reject({ status: 403 });
          return;
        }
        
        resolve(doc);
      }, 50);
    });
  },
  
  createDocument: async (docData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!currentUser) {
          reject({ message: 'Не авторизован' });
          return;
        }
        
        const newDoc = {
          ...docData,
          id: Date.now().toString(),
          userId: currentUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          data: {}
        };
        
        const allDocs = localStorage.getItem('spreadsheet_docs');
        const docs = allDocs ? JSON.parse(allDocs) : [];
        docs.push(newDoc);
        localStorage.setItem('spreadsheet_docs', JSON.stringify(docs));
        
        resolve(newDoc);
      }, 200);
    });
  },
  
  updateDocument: async (documentId, updates) => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          await mockAuthAPI.checkDocumentAccess(documentId);
          
          const allDocs = localStorage.getItem('spreadsheet_docs');
          const docs = allDocs ? JSON.parse(allDocs) : [];
          const index = docs.findIndex(d => d.id === documentId);
          
          if (index !== -1) {
            docs[index] = { ...docs[index], ...updates, updatedAt: new Date().toISOString() };
            localStorage.setItem('spreadsheet_docs', JSON.stringify(docs));
            resolve(docs[index]);
          } else {
            reject({ message: 'Документ не найден' });
          }
        } catch (error) {
          reject(error);
        }
      }, 100);
    });
  },
    deleteDocument: async (documentId) => {
    return new Promise(async (resolve, reject) => {
        try {
        await mockAuthAPI.checkDocumentAccess(documentId);
        
        const allDocs = localStorage.getItem('spreadsheet_docs');
        const docs = allDocs ? JSON.parse(allDocs) : [];
        const filtered = docs.filter(d => d.id !== documentId);
        localStorage.setItem('spreadsheet_docs', JSON.stringify(filtered));
        resolve();
        } catch (error) {
        reject(error);
        }
    });
    },

    duplicateDocument: async (documentId) => {
    return new Promise(async (resolve, reject) => {
        try {
        const doc = await mockAuthAPI.checkDocumentAccess(documentId);
        
        const newDoc = {
            ...doc,
            id: Date.now().toString(),
            name: `${doc.name} (копия)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: JSON.parse(JSON.stringify(doc.data || {}))
        };
        
        const allDocs = localStorage.getItem('spreadsheet_docs');
        const docs = allDocs ? JSON.parse(allDocs) : [];
        docs.push(newDoc);
        localStorage.setItem('spreadsheet_docs', JSON.stringify(docs));
        resolve(newDoc);
        } catch (error) {
        reject(error);
        }
    });
    }
};

export const getAccessToken = () => currentAccessToken;

export const isAuthenticated = () => !!currentAccessToken;