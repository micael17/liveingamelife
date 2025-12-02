import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/oauth2callback'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

export const blogger = google.blogger({ version: 'v3', auth: oauth2Client });
export const BLOG_ID = process.env.BLOG_ID;
export const BLOG_URL = process.env.BLOG_URL;

export interface BlogPost {
  id?: string;
  title: string;
  content: string;
  labels?: string[];
  published?: string;
  updated?: string;
  url?: string;
}

// 모든 글 가져오기
export async function getAllPosts(): Promise<BlogPost[]> {
  const posts: BlogPost[] = [];
  let pageToken: string | undefined;

  do {
    const response = await blogger.posts.list({
      blogId: BLOG_ID!,
      maxResults: 500,
      pageToken,
      status: 'live',
    });

    if (response.data.items) {
      posts.push(...response.data.items.map(post => ({
        id: post.id!,
        title: post.title!,
        content: post.content!,
        labels: post.labels || [],
        published: post.published!,
        updated: post.updated!,
        url: post.url!,
      })));
    }

    pageToken = response.data.nextPageToken || undefined;
  } while (pageToken);

  return posts;
}

// 글 발행
export async function publishPost(post: BlogPost): Promise<string> {
  const response = await blogger.posts.insert({
    blogId: BLOG_ID!,
    requestBody: {
      title: post.title,
      content: post.content,
      labels: post.labels,
    },
  });

  return response.data.id!;
}

// 글 수정
export async function updatePost(postId: string, post: BlogPost): Promise<void> {
  await blogger.posts.update({
    blogId: BLOG_ID!,
    postId,
    requestBody: {
      title: post.title,
      content: post.content,
      labels: post.labels,
    },
  });
}

// 글 삭제
export async function deletePost(postId: string): Promise<void> {
  await blogger.posts.delete({
    blogId: BLOG_ID!,
    postId,
  });
}

// Blog ID 조회
export async function getBlogId(): Promise<string> {
  const response = await blogger.blogs.getByUrl({
    url: BLOG_URL!,
  });
  return response.data.id!;
}
