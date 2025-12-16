/**
 * Tech Icon Utility
 * Maps technology names to their Simple Icons/Devicons
 * Uses the Simple Icons CDN for consistent, high-quality tech logos
 */

// Icon mapping with variations of names
const techIconMap = {
  // JavaScript ecosystem
  javascript: { icon: 'javascript', color: '#F7DF1E' },
  js: { icon: 'javascript', color: '#F7DF1E' },
  'java script': { icon: 'javascript', color: '#F7DF1E' },
  
  typescript: { icon: 'typescript', color: '#3178C6' },
  ts: { icon: 'typescript', color: '#3178C6' },
  'type script': { icon: 'typescript', color: '#3178C6' },
  
  react: { icon: 'react', color: '#61DAFB' },
  reactjs: { icon: 'react', color: '#61DAFB' },
  'react js': { icon: 'react', color: '#61DAFB' },
  'react.js': { icon: 'react', color: '#61DAFB' },
  
  vue: { icon: 'vuedotjs', color: '#4FC08D' },
  vuejs: { icon: 'vuedotjs', color: '#4FC08D' },
  'vue js': { icon: 'vuedotjs', color: '#4FC08D' },
  'vue.js': { icon: 'vuedotjs', color: '#4FC08D' },
  
  angular: { icon: 'angular', color: '#DD0031' },
  angularjs: { icon: 'angular', color: '#DD0031' },
  'angular js': { icon: 'angular', color: '#DD0031' },
  
  svelte: { icon: 'svelte', color: '#FF3E00' },
  sveltejs: { icon: 'svelte', color: '#FF3E00' },
  
  nextjs: { icon: 'nextdotjs', color: '#FFFFFF' },
  next: { icon: 'nextdotjs', color: '#FFFFFF' },
  'next js': { icon: 'nextdotjs', color: '#FFFFFF' },
  'next.js': { icon: 'nextdotjs', color: '#FFFFFF' },
  
  nuxt: { icon: 'nuxtdotjs', color: '#00DC82' },
  nuxtjs: { icon: 'nuxtdotjs', color: '#00DC82' },
  'nuxt.js': { icon: 'nuxtdotjs', color: '#00DC82' },
  
  // Node.js ecosystem
  node: { icon: 'nodedotjs', color: '#339933' },
  nodejs: { icon: 'nodedotjs', color: '#339933' },
  'node js': { icon: 'nodedotjs', color: '#339933' },
  'node.js': { icon: 'nodedotjs', color: '#339933' },
  
  express: { icon: 'express', color: '#FFFFFF' },
  expressjs: { icon: 'express', color: '#FFFFFF' },
  'express.js': { icon: 'express', color: '#FFFFFF' },
  
  deno: { icon: 'deno', color: '#FFFFFF' },
  bun: { icon: 'bun', color: '#FBF0DF' },
  
  // Backend
  python: { icon: 'python', color: '#3776AB' },
  django: { icon: 'django', color: '#092E20' },
  flask: { icon: 'flask', color: '#FFFFFF' },
  fastapi: { icon: 'fastapi', color: '#009688' },
  
  java: { icon: 'openjdk', color: '#FFFFFF' },
  spring: { icon: 'spring', color: '#6DB33F' },
  springboot: { icon: 'springboot', color: '#6DB33F' },
  'spring boot': { icon: 'springboot', color: '#6DB33F' },
  
  go: { icon: 'go', color: '#00ADD8' },
  golang: { icon: 'go', color: '#00ADD8' },
  
  rust: { icon: 'rust', color: '#FFFFFF' },
  
  ruby: { icon: 'ruby', color: '#CC342D' },
  rails: { icon: 'rubyonrails', color: '#CC0000' },
  'ruby on rails': { icon: 'rubyonrails', color: '#CC0000' },
  
  php: { icon: 'php', color: '#777BB4' },
  laravel: { icon: 'laravel', color: '#FF2D20' },
  
  'c#': { icon: 'csharp', color: '#239120' },
  csharp: { icon: 'csharp', color: '#239120' },
  dotnet: { icon: 'dotnet', color: '#512BD4' },
  '.net': { icon: 'dotnet', color: '#512BD4' },
  
  kotlin: { icon: 'kotlin', color: '#7F52FF' },
  swift: { icon: 'swift', color: '#F05138' },
  
  // Databases
  mongodb: { icon: 'mongodb', color: '#47A248' },
  mongo: { icon: 'mongodb', color: '#47A248' },
  
  postgresql: { icon: 'postgresql', color: '#4169E1' },
  postgres: { icon: 'postgresql', color: '#4169E1' },
  
  mysql: { icon: 'mysql', color: '#4479A1' },
  
  redis: { icon: 'redis', color: '#DC382D' },
  
  firebase: { icon: 'firebase', color: '#FFCA28' },
  supabase: { icon: 'supabase', color: '#3FCF8E' },
  
  prisma: { icon: 'prisma', color: '#2D3748' },
  
  // DevOps & Cloud
  docker: { icon: 'docker', color: '#2496ED' },
  kubernetes: { icon: 'kubernetes', color: '#326CE5' },
  k8s: { icon: 'kubernetes', color: '#326CE5' },
  
  aws: { icon: 'amazonwebservices', color: '#FF9900' },
  'amazon web services': { icon: 'amazonwebservices', color: '#FF9900' },
  
  gcp: { icon: 'googlecloud', color: '#4285F4' },
  'google cloud': { icon: 'googlecloud', color: '#4285F4' },
  
  azure: { icon: 'microsoftazure', color: '#0078D4' },
  
  vercel: { icon: 'vercel', color: '#FFFFFF' },
  netlify: { icon: 'netlify', color: '#00C7B7' },
  
  // Tools
  git: { icon: 'git', color: '#F05032' },
  github: { icon: 'github', color: '#FFFFFF' },
  gitlab: { icon: 'gitlab', color: '#FC6D26' },
  
  vscode: { icon: 'visualstudiocode', color: '#007ACC' },
  'vs code': { icon: 'visualstudiocode', color: '#007ACC' },
  'visual studio code': { icon: 'visualstudiocode', color: '#007ACC' },
  
  webpack: { icon: 'webpack', color: '#8DD6F9' },
  vite: { icon: 'vite', color: '#646CFF' },
  
  npm: { icon: 'npm', color: '#CB3837' },
  yarn: { icon: 'yarn', color: '#2C8EBB' },
  pnpm: { icon: 'pnpm', color: '#F69220' },
  
  // CSS & UI
  css: { icon: 'css3', color: '#1572B6' },
  css3: { icon: 'css3', color: '#1572B6' },
  
  html: { icon: 'html5', color: '#E34F26' },
  html5: { icon: 'html5', color: '#E34F26' },
  
  sass: { icon: 'sass', color: '#CC6699' },
  scss: { icon: 'sass', color: '#CC6699' },
  
  tailwind: { icon: 'tailwindcss', color: '#06B6D4' },
  tailwindcss: { icon: 'tailwindcss', color: '#06B6D4' },
  'tailwind css': { icon: 'tailwindcss', color: '#06B6D4' },
  
  bootstrap: { icon: 'bootstrap', color: '#7952B3' },
  
  // Testing
  jest: { icon: 'jest', color: '#C21325' },
  vitest: { icon: 'vitest', color: '#6E9F18' },
  cypress: { icon: 'cypress', color: '#17202C' },
  playwright: { icon: 'playwright', color: '#2EAD33' },
  
  // Mobile
  'react native': { icon: 'react', color: '#61DAFB' },
  reactnative: { icon: 'react', color: '#61DAFB' },
  flutter: { icon: 'flutter', color: '#02569B' },
  android: { icon: 'android', color: '#3DDC84' },
  ios: { icon: 'apple', color: '#FFFFFF' },
  
  // AI/ML
  tensorflow: { icon: 'tensorflow', color: '#FF6F00' },
  pytorch: { icon: 'pytorch', color: '#EE4C2C' },
  openai: { icon: 'openai', color: '#FFFFFF' },
  
  // Misc
  graphql: { icon: 'graphql', color: '#E10098' },
  'graph ql': { icon: 'graphql', color: '#E10098' },
  
  linux: { icon: 'linux', color: '#FCC624' },
  ubuntu: { icon: 'ubuntu', color: '#E95420' },
  
  markdown: { icon: 'markdown', color: '#FFFFFF' },
  
  electron: { icon: 'electron', color: '#47848F' },
  tauri: { icon: 'tauri', color: '#FFC131' },
};

/**
 * Get tech icon info from a title
 * @param {string} title - The roadmap title to search for tech terms
 * @returns {{ icon: string, color: string, url: string } | null}
 */
export function getTechIconFromTitle(title) {
  if (!title) return null;
  
  // Normalize the title: lowercase, trim
  const normalizedTitle = title.toLowerCase().trim();
  
  // First, try exact match
  if (techIconMap[normalizedTitle]) {
    const { icon, color } = techIconMap[normalizedTitle];
    return {
      icon,
      color,
      url: `https://cdn.simpleicons.org/${icon}/${color.replace('#', '')}`
    };
  }
  
  // Then, search for any tech keyword in the title
  for (const [keyword, data] of Object.entries(techIconMap)) {
    // Create a regex that matches the keyword as a word boundary
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(normalizedTitle)) {
      return {
        icon: data.icon,
        color: data.color,
        url: `https://cdn.simpleicons.org/${data.icon}/${data.color.replace('#', '')}`
      };
    }
  }
  
  // Try partial matches (for cases like "JavaScript Fundamentals")
  for (const [keyword, data] of Object.entries(techIconMap)) {
    if (normalizedTitle.includes(keyword)) {
      return {
        icon: data.icon,
        color: data.color,
        url: `https://cdn.simpleicons.org/${data.icon}/${data.color.replace('#', '')}`
      };
    }
  }
  
  return null;
}

/**
 * Get all available tech icons (for reference)
 */
export function getAllTechIcons() {
  return Object.keys(techIconMap);
}
