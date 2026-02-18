// Type declarations for libraries without TypeScript support
// إعلانات الأنواع للمكتبات التي لا تدعم TypeScript

declare module '@aegov/design-system-react' {
  import { ReactNode, ComponentProps, HTMLAttributes } from 'react';

  // Card component - مكون البطاقة
  export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'creative' | 'elevated' | 'outlined';
    children?: ReactNode;
    className?: string;
  }
  export const Card: React.FC<CardProps>;

  // Button component - مكون الزر
  export interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'link';
    size?: 'sm' | 'md' | 'lg';
    children?: ReactNode;
    className?: string;
    disabled?: boolean;
  }
  export const Button: React.FC<ButtonProps>;

  // Add more component declarations as needed
  // أضف المزيد من إعلانات المكونات حسب الحاجة
}
