// src/custom.d.ts
declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: any; // SVGs can also be React components
  export default value;
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
}
