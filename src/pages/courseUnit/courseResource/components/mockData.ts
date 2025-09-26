import { Resource } from './types';

export const mockResources: Resource[] = [
  {
    id: '1',
    type: 'introduction',
    content:
      'Welcome to Advanced React Development! This comprehensive course will take you through modern React patterns, hooks, and best practices used in production applications.',
    createdAt: '2025-01-01T10:00:00Z'
  },
  {
    id: '2',
    type: 'study-guide',
    title: 'React Hooks Deep Dive',
    content:
      'A comprehensive guide covering useState, useEffect, useContext, useReducer, and custom hooks with practical examples.',
    createdAt: '2025-01-02T14:30:00Z'
  },
  {
    id: '3',
    type: 'study-guide',
    title: 'Component Architecture Patterns',
    fileUrl: '/documents/component-patterns.pdf',
    fileName: 'component-patterns.pdf',
    createdAt: '2025-01-03T09:15:00Z'
  },
  {
    id: '4',
    type: 'lecture',
    title: 'Advanced State Management',
    content:
      'Learn about Context API, Redux Toolkit, and Zustand for managing complex application state.',
    createdAt: '2025-01-04T16:45:00Z'
  },
  {
    id: '5',
    type: 'lecture',
    title: 'Performance Optimization Techniques',
    fileUrl: '/documents/performance-optimization.mp4',
    fileName: 'performance-optimization.mp4',
    createdAt: '2025-01-05T11:20:00Z'
  },
  {
    id: '6',
    type: 'assignment',
    title: 'React Hooks Implementation',
    deadline: '2025-02-15T23:59:59Z',
    createdAt: '2025-01-10T10:00:00Z'
  }
];