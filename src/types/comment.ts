export interface Comment {
  _id?: string;
  // 必填字段
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;

  // 可选字段
  likes: string[]; // 存储用户ID字符串
  replyTo: string | null; // 回复评论ID字符串
  updatedAt: string;

  // 前端展示用的扩展字段
  author?: {
    username: string;
    handle: string;
    avatar: string;
  };
  stats?: {
    likes: number;
    replies: number;
    shares: number;
  };
}

// 创建评论时的请求数据类型
export interface CreateCommentData {
  postId: string;
  authorId: string;
  content: string;
  replyTo?: string;
}
