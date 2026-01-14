# Altama CMS - Technical Architecture Document

## 1. System Overview

Altama CMS is a single-page application (SPA) built with modern web technologies to provide a responsive content management interface. The application follows a client-side architecture with API integration for data persistence and external content delivery.

### 1.1 High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │    │   Backend API   │    │   Database      │
│                 │    │                 │    │                 │
│  React SPA      │◄──►│  REST Endpoints │◄──►│  Content Store  │
│  TanStack Router│    │  Authentication │    │  Media Storage  │
│  TanStack Query │    │  CRUD Operations│    │                 │
│  Shadcn UI      │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 2. Technology Stack

### 2.1 Frontend Technologies

| Technology      | Version | Purpose                                          |
| --------------- | ------- | ------------------------------------------------ |
| React           | 19.2.0  | UI framework and component model                 |
| TypeScript      | 5.7.2   | Type safety and enhanced developer experience    |
| Vite            | 7.1.7   | Build tool and development server                |
| TanStack Router | 1.132.0 | File-based routing with type safety              |
| TanStack Query  | 5.90.12 | Server state management and data fetching        |
| Tailwind CSS    | 4.1.18  | Utility-first CSS framework                      |
| Shadcn UI       | Latest  | Pre-built UI components with Radix UI primitives |
| Lucide React    | 0.545.0 | Icon library                                     |

### 2.2 Development Tools

| Tool                | Purpose                         |
| ------------------- | ------------------------------- |
| ESLint              | Code linting and quality checks |
| Prettier            | Code formatting                 |
| Vitest              | Unit testing framework          |
| TypeScript Compiler | Type checking and compilation   |

## 3. Application Architecture

### 3.1 Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn UI components
│   └── Header.tsx      # Application header
├── lib/                # Utility functions and configurations
│   └── utils.ts        # Shared utility functions
├── routes/             # File-based routing structure
│   ├── __root.tsx      # Root layout component
│   └── index.tsx       # Home page component
├── styles.css          # Global styles and Tailwind imports
├── main.tsx            # Application entry point
└── routeTree.gen.ts    # Generated route tree
```

### 3.2 Component Architecture

#### 3.2.1 Component Hierarchy

```
App
├── RouterProvider
└── Root Layout (__root.tsx)
    ├── Header
    ├── Navigation
    ├── Page Content (Outlet)
    └── DevTools
```

#### 3.2.2 Component Patterns

- **Presentational Components**: Focus on UI rendering, receive data via props
- **Container Components**: Handle data fetching and state management
- **Layout Components**: Define page structure and navigation
- **UI Components**: Reusable Shadcn UI components

### 3.3 Routing Architecture

#### 3.3.1 File-Based Routing

TanStack Router provides file-based routing with automatic route generation:

```
src/routes/
├── __root.tsx          # Root layout
├── index.tsx           # Home page (/)
├── login.tsx           # Login page (/login)
├── dashboard.tsx       # Dashboard (/dashboard)
├── blog/
│   ├── index.tsx       # Blog listing (/blog)
│   ├── $postId.tsx     # Blog post detail (/blog/:postId)
│   └── create.tsx      # Create blog post (/blog/create)
├── products/
│   ├── index.tsx       # Products listing (/products)
│   ├── $productId.tsx  # Product detail (/products/:productId)
│   └── create.tsx      # Create product (/products/create)
└── media/
    ├── index.tsx       # Media gallery (/media)
    └── upload.tsx      # Media upload (/media/upload)
```

#### 3.3.2 Route Features

- **Type-safe Navigation**: Compile-time route validation
- **Code Splitting**: Automatic route-based code splitting
- **Route Preloading**: Intelligent data preloading
- **Search Params**: Type-safe search parameter handling

### 3.4 Data Management Architecture

#### 3.4.1 Server State Management

TanStack Query handles server state with the following pattern:

```typescript
// Query hook example
const useBlogPosts = () => {
  return useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => apiClient.get('/api/blog/posts'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Mutation hook example
const useCreateBlogPost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (newPost) => apiClient.post('/api/blog/posts', newPost),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
    },
  })
}
```

#### 3.4.2 Client State Management

For simple client state, React's built-in state management is used:

```typescript
// Local component state
const [isEditing, setIsEditing] = useState(false)

// Context for global state
const AuthContext = createContext<AuthState | null>(null)
```

### 3.5 API Integration Architecture

#### 3.5.1 API Client Structure

```typescript
// API client configuration
const apiClient = {
  baseURL: process.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Authentication handling
  getAuthHeader: () => {
    const token = localStorage.getItem('auth-token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  },
}
```

#### 3.5.2 Data Flow

```
Component → Hook → API Client → Backend API
    ↑                              ↓
    └────── TanStack Query ←────────┘
```

## 4. UI Architecture

### 4.1 Design System

#### 4.1.1 Shadcn UI Integration

- **Component Library**: Pre-built, accessible components
- **Theme System**: CSS variables for consistent theming
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: WCAG compliance with Radix UI primitives

#### 4.1.2 Styling Architecture

```css
/* Tailwind CSS with custom theme */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... more theme variables */
}
```

### 4.2 Component Patterns

#### 4.2.1 Compound Components

```typescript
// Example: Form component with compound pattern
const Form = ({ children, onSubmit }) => {
  return <form onSubmit={onSubmit}>{children}</form>;
};

const FormField = ({ label, error, children }) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
};
```

#### 4.2.2 Render Props Pattern

```typescript
// Example: Data provider with render prop
const DataProvider = ({ url, children }) => {
  const { data, loading, error } = useQuery({ queryKey: [url] })

  return children({ data, loading, error })
}
```

## 5. Security Architecture

### 5.1 Authentication Flow

```
User → Login Form → API Client → Backend API → JWT Token
    ↑                                        ↓
    └────── Token Storage ←────────────────────┘
```

### 5.2 Security Measures

- **Token Storage**: Secure localStorage with httpOnly cookies alternative
- **CSRF Protection**: SameSite cookie attributes
- **XSS Prevention**: Input sanitization and Content Security Policy
- **HTTPS Enforcement**: Production HTTPS only

## 6. Performance Architecture

### 6.1 Optimization Strategies

#### 6.1.1 Code Splitting

- **Route-based**: Automatic code splitting by route
- **Component-based**: Lazy loading for heavy components
- **Vendor Splitting**: Separate vendor bundles for caching

#### 6.1.2 Data Optimization

- **Query Caching**: Intelligent caching with TanStack Query
- **Image Optimization**: Responsive images with lazy loading
- **Bundle Analysis**: Regular bundle size monitoring

### 6.2 Performance Metrics

- **First Contentful Paint**: < 1.5 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **Time to Interactive**: < 3.5 seconds

## 7. Error Handling Architecture

### 7.1 Error Boundaries

```typescript
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

### 7.2 Error Handling Patterns

- **API Errors**: Centralized error handling in API client
- **Validation Errors**: Form-level error display
- **Network Errors**: Retry mechanisms with exponential backoff
- **User Feedback**: Toast notifications for user actions

## 8. Testing Architecture

### 8.1 Testing Strategy

- **Unit Tests**: Component and utility function testing with Vitest
- **Integration Tests**: API integration testing
- **E2E Tests**: Critical user journey testing
- **Visual Regression**: UI component testing

### 8.2 Testing Structure

```
src/
├── __tests__/           # Test files
│   ├── components/      # Component tests
│   ├── hooks/          # Hook tests
│   └── utils/          # Utility tests
└── setupTests.ts       # Test configuration
```

## 9. Deployment Architecture

### 9.1 Build Process

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['@tanstack/react-router'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
})
```

### 9.2 Deployment Pipeline

1. **Development**: Local development with Vite dev server
2. **Staging**: Automated testing and preview deployments
3. **Production**: Optimized build with CDN distribution

## 10. Scalability Considerations

### 10.1 Frontend Scalability

- **Component Library**: Reusable components for consistency
- **State Management**: Efficient data fetching and caching
- **Code Organization**: Modular architecture for team scaling

### 10.2 Performance Scalability

- **Lazy Loading**: Progressive loading of features
- **Virtual Scrolling**: For large data sets
- **Caching Strategy**: Multi-layer caching approach

## 11. Future Architecture Enhancements

### 11.1 Potential Improvements

- **Micro-frontends**: Module federation for team scaling
- **Service Workers**: Offline capabilities and caching
- **WebAssembly**: Performance-critical computations
- **Server Components**: React Server Components adoption

### 11.2 Monitoring and Analytics

- **Performance Monitoring**: Real user monitoring
- **Error Tracking**: Automated error reporting
- **Usage Analytics**: Feature usage tracking
