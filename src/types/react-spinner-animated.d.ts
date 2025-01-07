declare module 'react-spinner-animated' {
    export const BarLoader: React.FC<{
      // Add any props the BarLoader component accepts
      text?: string;
      bgColor?: string;
      center?: boolean;
      width?: string;
      height?: string;
    }>;
  }
  
  // Also declare the CSS module
  declare module 'react-spinner-animated/dist/index.css' {
    const styles: any;
    export default styles;
  }
  