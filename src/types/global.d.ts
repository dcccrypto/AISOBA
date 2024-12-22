interface Window {
  gtag: (
    command: string,
    targetId: string,
    config?: {
      page_path?: string;
      [key: string]: any;
    }
  ) => void;
} 