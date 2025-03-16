###  CelesteTalk
**A public community and platform with Next.js of frontend and FastAPI of backend.**
### branches histories
**check the frontend and backend branches for details**
- frontend documents the UI changes
- backend documents the API changes
- welcome to pull request for optimizing
### MongoDB Shell Create Collections

```

// 创建和使用数据库
use celestetalk

// 创建User集合并添加验证规则
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email", "passwordHash", "createdAt", "status", "settings"],
      properties: {
        username: {
          bsonType: "string",
          description: "必须是字符串且不能为空"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "必须是有效的邮箱格式"
        },
        passwordHash: {
          bsonType: "string",
          description: "必须是字符串且不能为空"
        },
        avatar: {
          bsonType: "string",
          description: "用户头像的URL"
        },
        bio: { bsonType: "string" },
        following: {
          bsonType: "array",
          items: { bsonType: "objectId" }
        },
        followers: {
          bsonType: "array",
          items: { bsonType: "objectId" }
        },
        postsCount: { bsonType: "int" },
        likesCount: { bsonType: "int" },
        status: {
          bsonType: "object",
          required: ["isActive", "isBanned", "lastLoginAt"],
          properties: {
            isActive: { bsonType: "bool" },
            isBanned: { bsonType: "bool" },
            lastLoginAt: { bsonType: "date" }
          }
        },
        settings: {
          bsonType: "object",
          required: ["language", "theme", "notifications"],
          properties: {
            language: { bsonType: "string" },
            theme: { bsonType: "string" },
            notifications: {
              bsonType: "object",
              required: ["email", "push"],
              properties: {
                email: { bsonType: "bool" },
                push: { bsonType: "bool" }
              }
            }
          }
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
})

// 创建Post集合
db.createCollection("posts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["authorId", "content", "createdAt", "isRepost"],
      properties: {
        authorId: {
          bsonType: "objectId",
          description: "必须是有效的ObjectId"
        },
        content: {
          bsonType: "string",
          description: "必须是字符串且不能为空"
        },
        media: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["type", "url"],
            properties: {
              type: {
                bsonType: "string",
                enum: ["image", "video"]
              },
              url: { bsonType: "string" }
            }
          }
        },
        likes: {
          bsonType: "array",
          items: { bsonType: "objectId" }
        },
        repostCount: { bsonType: "int" },
        isRepost: { bsonType: "bool" },
        originalPost: { bsonType: "objectId" },
        replyTo: { bsonType: "objectId" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
})

// 创建Comment集合
db.createCollection("comments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["postId", "authorId", "content", "createdAt"],
      properties: {
        postId: {
          bsonType: "objectId",
          description: "必须是有效的ObjectId"
        },
        authorId: {
          bsonType: "objectId",
          description: "必须是有效的ObjectId"
        },
        content: {
          bsonType: "string",
          description: "必须是字符串且不能为空"
        },
        likes: {
          bsonType: "array",
          items: { bsonType: "objectId" }
        },
        replyTo: { bsonType: "objectId" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
})
//// 创建mails集合并添加验证规则
db.createCollection("mails", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "code", "type"],  // 只保留这三个必需字段
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "必须是有效的邮箱格式"

        },
        code: {
          bsonType: "string",
          description: "验证码必须是字符串格式"
        },
        type: {
          bsonType: "string",
          description: "验证码类型(register/reset-password/update-email)"
        },
        isUsed: {
          bsonType: "bool",
          description: "是否已使用"
        },
        expireAt: {
          bsonType: "date",
          description: "过期时间"
        },
        createdAt: {
          bsonType: "date",
          description: "创建时间"
        }
      }
    }
  }
});


```

### MongoDB Shell create indexs

```
// User 索引
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ "status.lastLoginAt": 1 });
db.users.createIndex({ createdAt: 1 });
db.users.createIndex({ followers: 1 });
db.users.createIndex({ following: 1 });

// Post 索引
db.posts.createIndex({ authorId: 1 });
db.posts.createIndex({ createdAt: -1 });
db.posts.createIndex({ likes: 1 });
db.posts.createIndex({ originalPost: 1 }, { sparse: true });
db.posts.createIndex({ replyTo: 1 }, { sparse: true });

// Comment 索引
db.comments.createIndex({ postId: 1 });
db.comments.createIndex({ authorId: 1 });
db.comments.createIndex({ createdAt: -1 });
db.comments.createIndex({ replyTo: 1 }, { sparse: true });

// 创建TTL索引,验证码15分钟后自动过期删除
db.mails.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });

// 创建复合索引
db.mails.createIndex({ email: 1, type: 1 });
