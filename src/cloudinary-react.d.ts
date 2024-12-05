// cloudinary-react.d.ts
declare module 'cloudinary-react' {
    import { ReactNode } from 'react';
  
    export const CloudinaryContext: React.FC<{ cloudName: string; children: ReactNode }>;
    export const Image: React.FC<{
      publicId: string|null;
      alt?: string;
      width: string;
      height: string;
      className?: string;
    }>;
  }
  