import { Resource } from './types';

export const mockResources: Resource[] = [
  {
    _id: '1',
    type: 'introduction',
    content:
      'Welcome to Advanced React Development! This comprehensive course will take you through modern React patterns, hooks, and best practices used in production applications.',
    createdAt: new Date('2025-01-01T10:00:00Z'),
  },
  {
    _id: '2',
    type: 'study-guide',
    title: 'React Hooks Deep Dive',
    content:
      'A comprehensive guide covering useState, useEffect, useContext, useReducer, and custom hooks with practical examples.',
    createdAt: new Date('2025-01-02T14:30:00Z'),
  },
  {
    _id: '3',
    type: 'study-guide',
    title: 'Component Architecture Patterns',
    content: 'See attached PDF on component patterns.',
    createdAt: new Date('2025-01-03T09:15:00Z'),
  },
  {
    _id: '4',
    type: 'lecture',
    title: 'Advanced State Management',
    content:
      'Learn about Context API, Redux Toolkit, and Zustand for managing complex application state.',
    createdAt: new Date('2025-01-04T16:45:00Z'),
  },
  {
    _id: '5',
    type: 'lecture',
    title: 'Performance Optimization Techniques',
    content: 'See attached video on performance optimization.',
    createdAt: new Date('2025-01-05T11:20:00Z'),
  },
  {
    _id: '6',
    type: 'assignment',
    title: 'React Hooks Implementation',
    deadline: new Date('2025-02-15T23:59:59Z'),
    createdAt: new Date('2025-01-10T10:00:00Z'),
  },
  {
    _id: '7',
    type: 'learning-outcome',
    learningOutcomes: 'Communication and Assistive Technology',
    createdAt: new Date('2025-01-12T08:00:00Z'),
    assessmentCriteria: [
      {
        parentId: '7',
        description: 'Understand communication needs and factors affecting them',
      },
      {
        parentId: '7',
        description:
          'Understand how to support the use of assistive technology to enhance communication',
      },
      {
        parentId: '7',
        description: 'Understand the principles of effective communication',
      },
    ],
  },
];
