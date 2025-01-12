import { useState, useEffect } from "react";

export function useTimeFormat(timestamp: string) {
  const [formattedTime, setFormattedTime] = useState("");

  useEffect(() => {
    const formatTime = () => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      let formatted = "";
      if (diffInSeconds < 60) {
        formatted = "刚刚";
      } else if (diffInSeconds < 3600) {
        formatted = `${Math.floor(diffInSeconds / 60)}分钟前`;
      } else if (diffInSeconds < 86400) {
        formatted = `${Math.floor(diffInSeconds / 3600)}小时前`;
      } else {
        formatted = new Intl.DateTimeFormat("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(date);
      }
      setFormattedTime(formatted);
    };

    formatTime();
    const timer = setInterval(formatTime, 60000);
    return () => clearInterval(timer);
  }, [timestamp]);

  return formattedTime;
}
