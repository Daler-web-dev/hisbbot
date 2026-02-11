declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        /** Отключает закрытие/сворачивание приложения свайпом по контенту (скролл не закрывает приложение) */
        disableVerticalSwipes?: () => void;
        themeParams?: { bg_color?: string; text_color?: string };
        initDataUnsafe?: {
          user?: { id: number; first_name?: string; last_name?: string; username?: string };
        };
      };
    };
  }
}

export {};
