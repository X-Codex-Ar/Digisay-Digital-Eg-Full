export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  image: string;
  category: string;
  tags: string[];
  author: string;
  content: string[];
  to: string;
}

export interface BlogCategory {
  slug: string;
  name: string;
}

export interface BlogAuthor {
  name: string;
  bio?: string;
}
