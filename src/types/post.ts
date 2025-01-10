export interface Post {
  _id: string;
  // 必填字段
  authorId: string;
  content: string;
  createdAt: string;
  isRepost: boolean;
  // 可选字段
  media?: Array<{
    type: "image" | "video";
    url: string;
  }>;
  likes: string[];
  repostCount: number;
  replyTo?: string;
  updatedAt: string;
  // 前端展示用扩展字段 - 通过API额外查询获得
  author: {
    username: string;
    handle: string;
    avatar: string;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
}

// 用于创建帖子的数据类型
export interface CreatePostData {
  _id: string;
  content: string;
}
