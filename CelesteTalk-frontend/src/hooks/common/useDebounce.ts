import * as React from "react";

type AnyFunction = (...args: any[]) => any;

export function useDebouncedCallback<T extends AnyFunction>(
  callback: T,
  delay: number = 500,
  deps: React.DependencyList = []
): (...args: Parameters<T>) => void {
  // 修改返回类型
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>(setTimeout(() => {}, 0)); // 添加初始值
  const callbackRef = React.useRef<T>(callback);

  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...deps]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return React.useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}

// 值的防抖hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
