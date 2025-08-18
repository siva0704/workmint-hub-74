# Backend Integration Guide

## 🚀 Frontend Ready for Backend Adaptation

WorkMint Hub's frontend is **production-ready** and fully prepared for backend integration with MongoDB and JWT authentication. This guide outlines how the frontend architecture supports seamless backend connectivity.

## 📋 Integration Checklist

### ✅ Completed Frontend Features
- [x] Complete API service layer (`src/services/api.ts`)
- [x] React Query hooks for all data operations (`src/hooks/useApi.ts`)
- [x] TypeScript interfaces matching API contracts (`src/types/index.ts`)
- [x] Offline support with sync capabilities (`src/utils/offlineStorage.ts`)
- [x] Error handling and loading states
- [x] JWT token management
- [x] Multi-tenant data scoping
- [x] File upload support
- [x] Form validation with Zod schemas

### 🔧 Backend Requirements

#### 1. Authentication Endpoints
```
POST /auth/login
POST /auth/logout  
POST /auth/refresh
POST /tenants/signup
```

#### 2. User Management
```
GET    /users?page={page}&limit={limit}
POST   /users
PATCH  /users/{id}
DELETE /users/{id}
POST   /users/invite
POST   /users/bulk-import
```

#### 3. Tenant Management (Super Admin)
```
GET  /sa/tenants?page={page}&limit={limit}
POST /sa/tenants/{id}/approve
POST /sa/tenants/{id}/reject
POST /sa/tenants/{id}/freeze
```

#### 4. Product & Process Management
```
GET    /products?page={page}&limit={limit}
POST   /products
PATCH  /products/{id}
DELETE /products/{id}
GET    /products/{id}/stages
POST   /products/{id}/stages
PATCH  /products/{id}/stages/{stageId}
POST   /products/{id}/stages/reorder
```

#### 5. Task Management
```
GET   /tasks?filters
POST  /tasks
PATCH /tasks/{id}/complete
POST  /tasks/{id}/confirm
POST  /tasks/{id}/reject
```

## 🏗 Architecture Overview

### API Service Layer
```typescript
// Complete REST client ready for MongoDB backend
class ApiService {
  // JWT token management
  // Error handling
  // Request/response interceptors
  // Multi-tenant scoping
}
```

### State Management
```typescript
// React Query for server state
const { data, isLoading, error } = useUsers();

// Zustand for client state  
const { user, tenant } = useAuthStore();

// Offline storage
offlineStorage.saveTaskDraft(taskId, completedQty);
```

### Data Flow
```
Frontend Form → React Query Hook → API Service → MongoDB
                     ↓
                Loading States → UI Updates → Error Handling
```

## 🔐 Authentication Flow

### JWT Integration Ready
```typescript
// Token storage and refresh
localStorage.setItem('auth-token', token);

// Automatic token injection
headers: {
  'Authorization': `Bearer ${token}`
}

// Token refresh on expiry
await api.refreshToken();
```

### Multi-Tenant Security
```typescript
// All requests include tenant scoping
const tenantId = user.tenantId;

// Data isolation at API level
{ tenantId, ...requestData }
```

## 📱 Offline Capabilities

### Offline-First Architecture
```typescript
// Save drafts when offline
offlineStorage.saveTaskDraft(taskId, completedQty);

// Sync when back online
await offlineStorage.syncDrafts(apiSyncFunction);

// Queue actions for retry
offlineStorage.addAction('update_task_progress', data);
```

### Progressive Web App Features
- Offline task editing
- Automatic sync when online
- Failed request retry
- Local draft storage

## 🗄 MongoDB Schema Alignment

### Frontend Types → MongoDB Collections

#### Users Collection
```typescript
interface User {
  id: string;           // MongoDB _id
  autoId: string;       // Auto-generated EMP001
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  tenantId: string;     // Tenant isolation
  isActive: boolean;
  createdAt: string;
}
```

#### Tenants Collection
```typescript
interface Tenant {
  id: string;
  factoryName: string;
  address: string;
  status: 'pending' | 'active' | 'rejected';
  ownerEmail: string;
  // ... full tenant data
}
```

#### Tasks Collection
```typescript
interface Task {
  id: string;
  tenantId: string;     // Isolation
  employeeId: string;
  productId: string;
  processStageId: string;
  targetQty: number;
  completedQty: number;
  status: TaskStatus;
  // ... complete task schema
}
```

## 🔄 Data Synchronization

### Real-time Updates (Optional)
```typescript
// WebSocket integration ready
useEffect(() => {
  const ws = new WebSocket(wsUrl);
  ws.onmessage = (event) => {
    queryClient.invalidateQueries(['tasks']);
  };
}, []);
```

### Optimistic Updates
```typescript
// UI updates immediately
const mutation = useMutation({
  onMutate: async (newData) => {
    // Cancel queries and update cache
    await queryClient.cancelQueries(['tasks']);
    queryClient.setQueryData(['tasks'], oldData => [...oldData, newData]);
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['tasks'], context.previousData);
  }
});
```

## 📊 File Upload Integration

### Ready for Cloud Storage
```typescript
// Complete file upload system
const uploadMutation = useFileUpload();

// Supports multiple storage backends
await api.uploadFile(file, 'branding-logo');
// Returns: { fileUrl, fileId }
```

## 🧪 Testing Strategy

### API Mock Layer
```typescript
// Development environment
if (process.env.NODE_ENV === 'development') {
  // Use mock data
} else {
  // Use real API endpoints
}
```

### Error Boundary Integration
```typescript
// Complete error handling
<ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</ErrorBoundary>
```

## 🚀 Deployment Configuration

### Environment Variables
```env
VITE_API_BASE_URL=https://api.workmint.com
VITE_WS_URL=wss://api.workmint.com/ws
VITE_UPLOAD_URL=https://api.workmint.com/upload
```

### Production Build Ready
```bash
npm run build
# Generates optimized production bundle
# Code splitting by routes
# Tree-shaken dependencies
# PWA manifest included
```

## 📈 Performance Optimizations

### Data Fetching
- React Query caching (5-minute stale time)
- Background refetching
- Optimistic updates
- Pagination support

### Bundle Optimization
- Route-based code splitting
- Lazy loading for heavy components
- TailwindCSS purging
- Modern JavaScript with fallbacks

## 🔧 Development Workflow

### 1. Backend Development
1. Implement MongoDB schemas matching frontend types
2. Create JWT authentication middleware
3. Build REST API endpoints per specification
4. Add tenant isolation to all queries

### 2. Integration Testing
1. Update API base URL in environment
2. Test authentication flow
3. Verify data synchronization
4. Test offline capabilities

### 3. Production Deployment
1. Set production API URLs
2. Configure error monitoring
3. Set up CI/CD pipeline
4. Monitor performance metrics

## 📞 Support & Integration

The frontend architecture is designed for **zero-breaking-change** backend integration. All API endpoints are clearly defined, error handling is comprehensive, and the offline-first approach ensures reliability.

**Key Benefits:**
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Error Resilience**: Comprehensive error boundaries
- ✅ **Offline Support**: Works without internet
- ✅ **Multi-tenant**: Complete data isolation
- ✅ **Performance**: Optimized for mobile devices
- ✅ **Scalable**: Ready for production loads

---

*Ready for immediate backend integration with MongoDB + JWT authentication.*