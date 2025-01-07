enum ContentType {
  JSON = "application/json",
  FORM_DATA = "multipart/form-data",
  BLOB = "application/octet-stream",
  STREAM = "application/stream",
}

interface RequestConfig extends RequestInit {
  data?: object | FormData | Blob;
  params?: object;
  responseType?: "json" | "blob" | "arrayBuffer" | "text";
  contentType?: ContentType;
}

// 添加调试日志
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_PREFIX = "/api/v1";
console.log("API Base URL:", BASE_URL); // 添加这行来验证环境变量是否正确加载

export class HttpClient {
  private static async request<T>(endpoint: string, config: RequestConfig): Promise<T> {
    // 确保endpoint以/开头
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    // 先拼接API前缀和endpoint
    const fullPath = `${API_PREFIX}${normalizedEndpoint}`;
    // 然后创建完整的URL
    const url = new URL(fullPath, BASE_URL);

    console.log("Request URL:", url.toString()); // 现在应该显示正确的URL

    if (config.params) {
      Object.entries(config.params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    let headers: Record<string, string> = {
      ...(config.headers as Record<string, string>),
    };

    // 根据不同的内容类型处理请求体
    if (config.data) {
      if (config.contentType === ContentType.JSON || !config.contentType) {
        headers["Content-Type"] = ContentType.JSON;
        config.body = JSON.stringify(config.data);
      } else if (config.data instanceof FormData) {
        // FormData 不需要设置 Content-Type，浏览器会自动设置
        config.body = config.data;
      } else if (config.data instanceof Blob) {
        headers["Content-Type"] = ContentType.BLOB;
        config.body = config.data;
      }
    }

    try {
      const response = await fetch(url.toString(), {
        ...config,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 根据响应类型处理返回数据
      switch (config.responseType) {
        case "blob":
          return (await response.blob()) as T;
        case "arrayBuffer":
          return (await response.arrayBuffer()) as T;
        case "text":
          return (await response.text()) as T;
        default:
          return (await response.json()) as T;
      }
    } catch (error) {
      console.error("Request failed:", error);
      throw error;
    }
  }

  // 文件上传方法
  static async upload<T>(
    endpoint: string,
    files: File | File[],
    config: RequestConfig = {}
  ): Promise<T> {
    const formData = new FormData();

    if (Array.isArray(files)) {
      files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });
    } else {
      formData.append("file", files);
    }

    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      data: formData,
      contentType: ContentType.FORM_DATA,
    });
  }

  // 文件下载方法
  static async download(endpoint: string, filename?: string): Promise<void> {
    const response = await this.request<Blob>(endpoint, {
      method: "GET",
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(response);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  static async get<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "GET",
    });
  }

  static async post<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
    });
  }

  static async put<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
    });
  }

  static async delete<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "DELETE",
    });
  }
}
