export type TaskCategory =
  | "DSA" | "UI" | "Reading" | "State" | "Testing"
  | "Project" | "Interview" | "Apply" | "Review";

export interface Task {
  id: string;
  category: TaskCategory;
  title: string;
  description: string;
  links: Array<{ label: string; url: string }>;
}

export interface DayPlan {
  day: number;
  month: number;
  week: number;
  theme: string;
  tasks: Task[];
  article: { title: string; url: string; source: string; readTime: string };
}

// ─── Month 1: Rebuild Coding Habits ───────────────────────────────────────────
const month1: DayPlan[] = [
  // Week 1: Arrays & Strings + Flexbox
  {
    day: 1, month: 1, week: 1, theme: "Arrays – Two Pointer",
    tasks: [
      { id: "m1d1-dsa", category: "DSA", title: "Solve: Two Sum", description: "Solve LeetCode #1 using a hash map. Understand O(n) vs O(n²) approaches.", links: [{ label: "LeetCode #1", url: "https://leetcode.com/problems/two-sum/" }] },
      { id: "m1d1-ui", category: "UI", title: "Build: Flexbox Navbar", description: "Create a responsive nav with logo left, links center, CTA right. No CSS framework.", links: [{ label: "Flexbox Guide", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" }] },
      { id: "m1d1-read", category: "Reading", title: "Read: React useState source", description: "Read the useState hook implementation in react-reconciler. Understand fiber nodes.", links: [{ label: "React Source", url: "https://github.com/facebook/react/blob/main/packages/react/src/ReactHooks.js" }] },
    ],
    article: { title: "Big-O Cheat Sheet Every Developer Needs", url: "https://www.bigocheatsheet.com/", source: "bigocheatsheet.com", readTime: "10 min" },
  },
  {
    day: 2, month: 1, week: 1, theme: "Arrays – Sliding Window",
    tasks: [
      { id: "m1d2-dsa", category: "DSA", title: "Solve: Best Time to Buy Stock", description: "LeetCode #121. Track minimum seen so far, calculate max profit.", links: [{ label: "LeetCode #121", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" }] },
      { id: "m1d2-ui", category: "UI", title: "Build: Flex Card Grid", description: "Build a responsive 3-column card grid using flexbox with gap and wrap.", links: [{ label: "MDN Flexbox", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout" }] },
      { id: "m1d2-read", category: "Reading", title: "Skim: Next.js App Router docs", description: "Read the routing fundamentals section. Understand layouts, pages, loading.tsx.", links: [{ label: "Next.js Routing", url: "https://nextjs.org/docs/app/building-your-application/routing" }] },
    ],
    article: { title: "Sliding Window Technique Explained", url: "https://leetcode.com/discuss/study-guide/1773891/", source: "LeetCode Discuss", readTime: "15 min" },
  },
  {
    day: 3, month: 1, week: 1, theme: "Strings – Hash Maps",
    tasks: [
      { id: "m1d3-dsa", category: "DSA", title: "Solve: Valid Anagram", description: "LeetCode #242. Use a character frequency map.", links: [{ label: "LeetCode #242", url: "https://leetcode.com/problems/valid-anagram/" }] },
      { id: "m1d3-ui", category: "UI", title: "Build: Responsive Sidebar", description: "Collapsible sidebar with flexbox. Icon-only on mobile, full label on desktop.", links: [{ label: "MDN @media", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/@media" }] },
      { id: "m1d3-read", category: "Reading", title: "Read: Tailwind v4 what's new", description: "Understand the CSS-first config, no tailwind.config.js, new @import syntax.", links: [{ label: "Tailwind v4 Blog", url: "https://tailwindcss.com/blog/tailwindcss-v4" }] },
    ],
    article: { title: "How JavaScript Objects Work Under the Hood", url: "https://javascript.info/object", source: "javascript.info", readTime: "20 min" },
  },
  {
    day: 4, month: 1, week: 1, theme: "Arrays – Prefix Sum",
    tasks: [
      { id: "m1d4-dsa", category: "DSA", title: "Solve: Move Zeroes", description: "LeetCode #283. In-place two-pointer approach.", links: [{ label: "LeetCode #283", url: "https://leetcode.com/problems/move-zeroes/" }] },
      { id: "m1d4-ui", category: "UI", title: "Build: Stats Dashboard Row", description: "Four metric cards in a flex row with icon, value, label, and trend arrow.", links: [{ label: "Flexbox children", url: "https://css-tricks.com/flex-grow-is-weird/" }] },
      { id: "m1d4-read", category: "Reading", title: "Read: lodash source (chunk/flatten)", description: "How lodash implements array chunking. Note the type guards.", links: [{ label: "lodash source", url: "https://github.com/lodash/lodash/blob/main/src/chunk.ts" }] },
    ],
    article: { title: "Prefix Sum: The Technique Behind Efficient Range Queries", url: "https://cp-algorithms.com/algebra/prefix-sums.html", source: "cp-algorithms.com", readTime: "12 min" },
  },
  {
    day: 5, month: 1, week: 1, theme: "Arrays – Set/Map patterns",
    tasks: [
      { id: "m1d5-dsa", category: "DSA", title: "Solve: Contains Duplicate", description: "LeetCode #217. Compare Set size vs array length.", links: [{ label: "LeetCode #217", url: "https://leetcode.com/problems/contains-duplicate/" }] },
      { id: "m1d5-ui", category: "UI", title: "Build: Notification Bell Dropdown", description: "Flex-positioned dropdown with badge count, triggered by click.", links: [{ label: "CSS Position", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/position" }] },
      { id: "m1d5-read", category: "Reading", title: "Read: axios interceptors source", description: "Understand request/response interceptor chain pattern.", links: [{ label: "axios source", url: "https://github.com/axios/axios/blob/main/lib/core/InterceptorManager.js" }] },
    ],
    article: { title: "JavaScript Set and Map: A Complete Guide", url: "https://javascript.info/map-set", source: "javascript.info", readTime: "15 min" },
  },
  {
    day: 6, month: 1, week: 1, theme: "Arrays – Harder patterns",
    tasks: [
      { id: "m1d6-dsa", category: "DSA", title: "Solve: Product of Array Except Self", description: "LeetCode #238. No division allowed — left/right prefix products.", links: [{ label: "LeetCode #238", url: "https://leetcode.com/problems/product-of-array-except-self/" }] },
      { id: "m1d6-ui", category: "UI", title: "Build: Full Page Flex Layout", description: "Header + sidebar + main + footer layout. Sidebar + main share a flex row.", links: [{ label: "Holy Grail Layout", url: "https://css-tricks.com/the-holy-grail-layout-with-css-grid/" }] },
      { id: "m1d6-read", category: "Reading", title: "Read: React Router source (useNavigate)", description: "Understand history API wrapping and context provision.", links: [{ label: "React Router", url: "https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/hooks.tsx" }] },
    ],
    article: { title: "The Two Pointer Technique — Patterns & Practice", url: "https://leetcode.com/discuss/study-guide/1688903/", source: "LeetCode Discuss", readTime: "20 min" },
  },
  {
    day: 7, month: 1, week: 1, theme: "Week 1 Review",
    tasks: [
      { id: "m1d7-review", category: "Review", title: "Re-solve this week's DSA without notes", description: "Do Two Sum, Best Time to Buy Stock, Valid Anagram again — aim for optimal solution first try.", links: [] },
      { id: "m1d7-ui", category: "UI", title: "Combine: Build a full app shell", description: "Use today to build a complete app shell: nav + sidebar + content + cards. All flexbox.", links: [{ label: "Flexbox Froggy", url: "https://flexboxfroggy.com/" }] },
    ],
    article: { title: "Week in Review: Arrays & Strings Patterns", url: "https://neetcode.io/roadmap", source: "neetcode.io", readTime: "25 min" },
  },

  // Week 2: LinkedLists & Stacks + CSS Grid
  {
    day: 8, month: 1, week: 2, theme: "LinkedLists – Reversal",
    tasks: [
      { id: "m1d8-dsa", category: "DSA", title: "Solve: Reverse Linked List", description: "LeetCode #206. Iterative with prev/curr pointers. Then try recursive.", links: [{ label: "LeetCode #206", url: "https://leetcode.com/problems/reverse-linked-list/" }] },
      { id: "m1d8-ui", category: "UI", title: "Build: CSS Grid 12-column system", description: "Create a grid utility with 12 columns. Build a 3-2-1 responsive layout.", links: [{ label: "CSS Grid Guide", url: "https://css-tricks.com/snippets/css/complete-guide-grid/" }] },
      { id: "m1d8-read", category: "Reading", title: "Read: Zustand source (create store)", description: "See how Zustand's create() wraps React useSyncExternalStore.", links: [{ label: "Zustand source", url: "https://github.com/pmndrs/zustand/blob/main/src/vanilla.ts" }] },
    ],
    article: { title: "Linked Lists for JavaScript Developers", url: "https://www.freecodecamp.org/news/implementing-a-linked-list-in-javascript/", source: "freeCodeCamp", readTime: "18 min" },
  },
  {
    day: 9, month: 1, week: 2, theme: "LinkedLists – Fast/Slow Pointers",
    tasks: [
      { id: "m1d9-dsa", category: "DSA", title: "Solve: Linked List Cycle", description: "LeetCode #141. Floyd's tortoise and hare algorithm.", links: [{ label: "LeetCode #141", url: "https://leetcode.com/problems/linked-list-cycle/" }] },
      { id: "m1d9-ui", category: "UI", title: "Build: Grid Photo Gallery", description: "Masonry-style photo grid with CSS Grid auto-rows and span.", links: [{ label: "MDN Grid areas", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-areas" }] },
      { id: "m1d9-read", category: "Reading", title: "Read: immer source (produce function)", description: "How immer creates a draft proxy and tracks mutations.", links: [{ label: "immer source", url: "https://github.com/immerjs/immer/blob/main/src/core/immerClass.ts" }] },
    ],
    article: { title: "Floyd's Cycle Detection Algorithm", url: "https://en.wikipedia.org/wiki/Cycle_detection#Floyd's_tortoise_and_hare", source: "Wikipedia", readTime: "10 min" },
  },
  {
    day: 10, month: 1, week: 2, theme: "LinkedLists – Merge",
    tasks: [
      { id: "m1d10-dsa", category: "DSA", title: "Solve: Merge Two Sorted Lists", description: "LeetCode #21. Recursive and iterative. Return the merged head.", links: [{ label: "LeetCode #21", url: "https://leetcode.com/problems/merge-two-sorted-lists/" }] },
      { id: "m1d10-ui", category: "UI", title: "Build: Responsive Dashboard Grid", description: "Grid with 4 stat cards + 2 charts + 1 table. Full responsive breakpoints.", links: [{ label: "Grid auto-fit", url: "https://css-tricks.com/auto-sizing-columns-css-grid-auto-fill-vs-auto-fit/" }] },
      { id: "m1d10-read", category: "Reading", title: "Read: SWR source (useSWR hook)", description: "Understand cache key hashing, deduplication, and revalidation strategy.", links: [{ label: "SWR source", url: "https://github.com/vercel/swr/blob/main/src/use-swr.ts" }] },
    ],
    article: { title: "CSS Grid Complete Guide — Auto-fill and Auto-fit", url: "https://css-tricks.com/auto-sizing-columns-css-grid-auto-fill-vs-auto-fit/", source: "CSS-Tricks", readTime: "12 min" },
  },
  {
    day: 11, month: 1, week: 2, theme: "Stacks – Brackets",
    tasks: [
      { id: "m1d11-dsa", category: "DSA", title: "Solve: Valid Parentheses", description: "LeetCode #20. Use a stack. Match closing brackets to last opening.", links: [{ label: "LeetCode #20", url: "https://leetcode.com/problems/valid-parentheses/" }] },
      { id: "m1d11-ui", category: "UI", title: "Build: Kanban Board Layout", description: "Three-column board with drag columns using CSS Grid. Cards stack vertically.", links: [] },
      { id: "m1d11-read", category: "Reading", title: "Read: vite source (plugin pipeline)", description: "How Vite chains transform plugins. See the pluginContainer.ts.", links: [{ label: "Vite source", url: "https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/pluginContainer.ts" }] },
    ],
    article: { title: "Stacks and Queues in JavaScript", url: "https://www.freecodecamp.org/news/stack-vs-queue/", source: "freeCodeCamp", readTime: "12 min" },
  },
  {
    day: 12, month: 1, week: 2, theme: "Stacks – Min Stack",
    tasks: [
      { id: "m1d12-dsa", category: "DSA", title: "Solve: Min Stack", description: "LeetCode #155. Maintain a parallel min-stack. O(1) getMin.", links: [{ label: "LeetCode #155", url: "https://leetcode.com/problems/min-stack/" }] },
      { id: "m1d12-ui", category: "UI", title: "Build: Data Table with grid", description: "Responsive table built with CSS Grid rows and sticky header.", links: [] },
      { id: "m1d12-read", category: "Reading", title: "Read: Prisma ORM source (query engine)", description: "How Prisma client sends queries to the query engine binary.", links: [{ label: "Prisma source", url: "https://github.com/prisma/prisma/tree/main/packages/client/src" }] },
    ],
    article: { title: "How to Design a Min Stack — Walkthrough", url: "https://neetcode.io/problems/minimum-stack", source: "neetcode.io", readTime: "10 min" },
  },
  {
    day: 13, month: 1, week: 2, theme: "Stacks – Monotonic",
    tasks: [
      { id: "m1d13-dsa", category: "DSA", title: "Solve: Daily Temperatures", description: "LeetCode #739. Monotonic decreasing stack — next greater element pattern.", links: [{ label: "LeetCode #739", url: "https://leetcode.com/problems/daily-temperatures/" }] },
      { id: "m1d13-ui", category: "UI", title: "Build: Timeline Component", description: "Vertical timeline with alternating left/right entries using CSS Grid.", links: [] },
      { id: "m1d13-read", category: "Reading", title: "Read: Next.js middleware source", description: "How Next.js middleware chain works. Request matching and response mutation.", links: [{ label: "Next.js middleware", url: "https://github.com/vercel/next.js/blob/canary/packages/next/src/server/web/sandbox/context.ts" }] },
    ],
    article: { title: "Monotonic Stack — The Pattern You're Missing", url: "https://leetcode.com/discuss/study-guide/2347639/", source: "LeetCode Discuss", readTime: "15 min" },
  },
  {
    day: 14, month: 1, week: 2, theme: "Week 2 Review",
    tasks: [
      { id: "m1d14-review", category: "Review", title: "Re-solve LinkedList + Stack problems", description: "Reverse LL, Cycle Detection, Valid Parentheses, Daily Temperatures — no hints.", links: [] },
      { id: "m1d14-ui", category: "UI", title: "Build: Full admin page with Grid", description: "Admin page: sidebar (grid col 1) + content (grid col 2-5). Fully responsive.", links: [] },
    ],
    article: { title: "CSS Grid vs Flexbox: When to Use Which", url: "https://blog.webdevsimplified.com/2021-03/flexbox-vs-grid/", source: "Web Dev Simplified", readTime: "10 min" },
  },

  // Week 3: Trees & Recursion + Reading codebases
  {
    day: 15, month: 1, week: 3, theme: "Trees – Traversal",
    tasks: [
      { id: "m1d15-dsa", category: "DSA", title: "Solve: Binary Tree Inorder Traversal", description: "LeetCode #94. Recursive first, then iterative with a stack.", links: [{ label: "LeetCode #94", url: "https://leetcode.com/problems/binary-tree-inorder-traversal/" }] },
      { id: "m1d15-ui", category: "UI", title: "Build: Accordion Component", description: "Multi-item accordion with smooth height animation. Pure CSS + JS.", links: [{ label: "CSS Details", url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details" }] },
      { id: "m1d15-read", category: "Reading", title: "Read: react-query source (QueryClient)", description: "How react-query manages cache, stale time, and garbage collection.", links: [{ label: "TanStack Query", url: "https://github.com/TanStack/query/blob/main/packages/query-core/src/queryClient.ts" }] },
    ],
    article: { title: "Tree Traversals — BFS vs DFS for Interviews", url: "https://javascript.info/tree", source: "javascript.info", readTime: "15 min" },
  },
  {
    day: 16, month: 1, week: 3, theme: "Trees – BFS/Level Order",
    tasks: [
      { id: "m1d16-dsa", category: "DSA", title: "Solve: Maximum Depth of Binary Tree", description: "LeetCode #104. Recursive DFS: 1 + max(left, right).", links: [{ label: "LeetCode #104", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" }] },
      { id: "m1d16-ui", category: "UI", title: "Build: Tabs Component", description: "Animated tab switcher with indicator bar sliding to active tab.", links: [] },
      { id: "m1d16-read", category: "Reading", title: "Read: Radix UI source (Dialog)", description: "How Radix UI handles focus trap, portal, and aria attributes in Dialog.", links: [{ label: "Radix Dialog", url: "https://github.com/radix-ui/primitives/tree/main/packages/react/dialog/src" }] },
    ],
    article: { title: "BFS vs DFS — Which to Use and When", url: "https://medium.com/basecs/breaking-down-breadth-first-search-cebe696709d9", source: "basecs", readTime: "12 min" },
  },
  {
    day: 17, month: 1, week: 3, theme: "Trees – BST",
    tasks: [
      { id: "m1d17-dsa", category: "DSA", title: "Solve: Validate Binary Search Tree", description: "LeetCode #98. Pass min/max bounds down recursion.", links: [{ label: "LeetCode #98", url: "https://leetcode.com/problems/validate-binary-search-tree/" }] },
      { id: "m1d17-ui", category: "UI", title: "Build: Modal/Dialog Component", description: "Accessible modal with backdrop, focus trap, Escape key close.", links: [{ label: "a11y dialog patterns", url: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/" }] },
      { id: "m1d17-read", category: "Reading", title: "Read: zod source (z.object)", description: "How Zod builds schema parsers as composable objects.", links: [{ label: "Zod source", url: "https://github.com/colinhacks/zod/blob/master/src/types.ts" }] },
    ],
    article: { title: "Binary Search Trees — A Visual Guide", url: "https://visualgo.net/en/bst", source: "visualgo.net", readTime: "15 min" },
  },
  {
    day: 18, month: 1, week: 3, theme: "Recursion – Backtracking",
    tasks: [
      { id: "m1d18-dsa", category: "DSA", title: "Solve: Subsets", description: "LeetCode #78. Backtracking — include or exclude each element.", links: [{ label: "LeetCode #78", url: "https://leetcode.com/problems/subsets/" }] },
      { id: "m1d18-ui", category: "UI", title: "Build: Toast Notification System", description: "Stack of toast messages with auto-dismiss and slide-in animation.", links: [] },
      { id: "m1d18-read", category: "Reading", title: "Read: express source (Router)", description: "How Express chains middleware and routes via the layer system.", links: [{ label: "Express Router", url: "https://github.com/expressjs/express/blob/master/lib/router/index.js" }] },
    ],
    article: { title: "Backtracking Explained with Examples", url: "https://leetcode.com/discuss/study-guide/1405817/", source: "LeetCode Discuss", readTime: "20 min" },
  },
  {
    day: 19, month: 1, week: 3, theme: "Recursion – Permutations",
    tasks: [
      { id: "m1d19-dsa", category: "DSA", title: "Solve: Permutations", description: "LeetCode #46. Backtrack by swapping elements in place.", links: [{ label: "LeetCode #46", url: "https://leetcode.com/problems/permutations/" }] },
      { id: "m1d19-ui", category: "UI", title: "Build: Skeleton Loader", description: "Animated shimmer skeleton for a card list. Pure CSS animation.", links: [] },
      { id: "m1d19-read", category: "Reading", title: "Read: date-fns source (format)", description: "How date-fns formats dates without modifying Date prototype.", links: [{ label: "date-fns format", url: "https://github.com/date-fns/date-fns/blob/main/src/format.ts" }] },
    ],
    article: { title: "Recursion for Programmers — Full Deep Dive", url: "https://www.freecodecamp.org/news/quick-intro-to-recursion/", source: "freeCodeCamp", readTime: "15 min" },
  },
  {
    day: 20, month: 1, week: 3, theme: "Binary Search",
    tasks: [
      { id: "m1d20-dsa", category: "DSA", title: "Solve: Binary Search", description: "LeetCode #704. Iterative with lo/hi/mid. Understand left-biased vs right-biased.", links: [{ label: "LeetCode #704", url: "https://leetcode.com/problems/binary-search/" }] },
      { id: "m1d20-ui", category: "UI", title: "Build: Search Bar with Debounce", description: "Search input with 300ms debounce. Show live filtered results.", links: [] },
      { id: "m1d20-read", category: "Reading", title: "Read: React Fiber reconciler overview", description: "Read React's README on Fiber architecture — understand work units.", links: [{ label: "React Fiber", url: "https://github.com/acdlite/react-fiber-architecture" }] },
    ],
    article: { title: "Binary Search — Everything You Need to Know", url: "https://cp-algorithms.com/num_methods/binary_search.html", source: "cp-algorithms.com", readTime: "18 min" },
  },
  {
    day: 21, month: 1, week: 3, theme: "Week 3 Review",
    tasks: [
      { id: "m1d21-review", category: "Review", title: "Re-solve Trees & Recursion problems", description: "Inorder traversal, Max Depth, Validate BST, Subsets — no looking up.", links: [] },
      { id: "m1d21-ui", category: "UI", title: "Build: Complete UI Kit page", description: "Showcase page with all components built this week: modal, toast, tabs, accordion.", links: [] },
    ],
    article: { title: "How to Read Source Code Without Going Crazy", url: "https://www.freecodecamp.org/news/read-open-source-project-source-code/", source: "freeCodeCamp", readTime: "10 min" },
  },

  // Week 4: Sorting + Component Patterns
  {
    day: 22, month: 1, week: 4, theme: "Sorting – Merge Sort",
    tasks: [
      { id: "m1d22-dsa", category: "DSA", title: "Implement Merge Sort", description: "Implement merge sort from scratch. Understand O(n log n). Sort Leetcode #912.", links: [{ label: "LeetCode #912", url: "https://leetcode.com/problems/sort-an-array/" }] },
      { id: "m1d22-ui", category: "UI", title: "Build: Compound Component (Dropdown)", description: "Compound components pattern: <Dropdown>, <Dropdown.Trigger>, <Dropdown.Menu>.", links: [{ label: "Compound Components", url: "https://kentcdodds.com/blog/compound-components-with-react-hooks" }] },
      { id: "m1d22-read", category: "Reading", title: "Read: clsx and cn utility patterns", description: "Understand conditional className merging with clsx. How shadcn/ui's cn works.", links: [{ label: "clsx source", url: "https://github.com/lukeed/clsx/blob/master/src/index.js" }] },
    ],
    article: { title: "Merge Sort Explained Visually", url: "https://visualgo.net/en/sorting", source: "visualgo.net", readTime: "15 min" },
  },
  {
    day: 23, month: 1, week: 4, theme: "Sorting – Quick Sort",
    tasks: [
      { id: "m1d23-dsa", category: "DSA", title: "Implement Quick Sort", description: "Lomuto partition scheme. Understand worst case O(n²) and how to avoid it.", links: [{ label: "QuickSort Guide", url: "https://neetcode.io/courses/dsa-for-beginners/37" }] },
      { id: "m1d23-ui", category: "UI", title: "Build: Render Props pattern", description: "Build a <DataFetcher> using render props. Pass data down to children function.", links: [{ label: "Render Props", url: "https://react.dev/reference/react/cloneElement" }] },
      { id: "m1d23-read", category: "Reading", title: "Read: TypeScript compiler options", description: "Understand strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes.", links: [{ label: "TS Config", url: "https://www.typescriptlang.org/tsconfig" }] },
    ],
    article: { title: "JavaScript Sorting Algorithms Explained", url: "https://www.freecodecamp.org/news/sorting-algorithms-explained/", source: "freeCodeCamp", readTime: "20 min" },
  },
  {
    day: 24, month: 1, week: 4, theme: "Graphs – BFS",
    tasks: [
      { id: "m1d24-dsa", category: "DSA", title: "Solve: Number of Islands", description: "LeetCode #200. BFS/DFS to flood-fill connected land cells.", links: [{ label: "LeetCode #200", url: "https://leetcode.com/problems/number-of-islands/" }] },
      { id: "m1d24-ui", category: "UI", title: "Build: HOC (Higher Order Component)", description: "Build a withAuth HOC and a withLoading HOC. Wrap a component with both.", links: [{ label: "HOC Patterns", url: "https://legacy.reactjs.org/docs/higher-order-components.html" }] },
      { id: "m1d24-read", category: "Reading", title: "Read: ESLint plugin-react-hooks source", description: "How eslint-plugin-react-hooks enforces Rules of Hooks.", links: [{ label: "eslint-plugin-react-hooks", url: "https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks" }] },
    ],
    article: { title: "Graph Algorithms for Coding Interviews", url: "https://leetcode.com/discuss/study-guide/655708/", source: "LeetCode Discuss", readTime: "20 min" },
  },
  {
    day: 25, month: 1, week: 4, theme: "Graphs – DFS",
    tasks: [
      { id: "m1d25-dsa", category: "DSA", title: "Solve: Clone Graph", description: "LeetCode #133. DFS with a visited hashmap for cycle detection.", links: [{ label: "LeetCode #133", url: "https://leetcode.com/problems/clone-graph/" }] },
      { id: "m1d25-ui", category: "UI", title: "Build: Context + useReducer pattern", description: "Global UI state with Context + useReducer. Theme toggle + modal state.", links: [{ label: "useReducer", url: "https://react.dev/reference/react/useReducer" }] },
      { id: "m1d25-read", category: "Reading", title: "Read: Prisma schema SDL", description: "Deep-read Prisma schema language: relations, enums, indexes, @@unique.", links: [{ label: "Prisma Schema Ref", url: "https://www.prisma.io/docs/orm/reference/prisma-schema-reference" }] },
    ],
    article: { title: "DFS vs BFS — When Each Shines", url: "https://medium.com/basecs/deep-dive-through-a-graph-dfs-traversal-8177df5d0f13", source: "basecs", readTime: "12 min" },
  },
  {
    day: 26, month: 1, week: 4, theme: "DP – 1D",
    tasks: [
      { id: "m1d26-dsa", category: "DSA", title: "Solve: Climbing Stairs", description: "LeetCode #70. Bottom-up DP. Recognize fibonacci pattern.", links: [{ label: "LeetCode #70", url: "https://leetcode.com/problems/climbing-stairs/" }] },
      { id: "m1d26-ui", category: "UI", title: "Build: Custom Hook library", description: "Write useLocalStorage, useDebounce, useOnClickOutside hooks.", links: [{ label: "usehooks.com", url: "https://usehooks.com/" }] },
      { id: "m1d26-read", category: "Reading", title: "Read: Next.js cache source", description: "How Next.js implements fetch caching in the App Router.", links: [{ label: "Next.js caching", url: "https://nextjs.org/docs/app/building-your-application/caching" }] },
    ],
    article: { title: "Dynamic Programming for Beginners — Patterns", url: "https://leetcode.com/discuss/study-guide/458695/", source: "LeetCode Discuss", readTime: "25 min" },
  },
  {
    day: 27, month: 1, week: 4, theme: "DP – House Robber",
    tasks: [
      { id: "m1d27-dsa", category: "DSA", title: "Solve: House Robber", description: "LeetCode #198. dp[i] = max(dp[i-1], dp[i-2] + nums[i]).", links: [{ label: "LeetCode #198", url: "https://leetcode.com/problems/house-robber/" }] },
      { id: "m1d27-ui", category: "UI", title: "Build: Virtualized List", description: "Build a simple windowed list renderer for 10k items — only render visible.", links: [{ label: "Virtualization concept", url: "https://www.patterns.dev/vanilla/virtual-lists/" }] },
      { id: "m1d27-read", category: "Reading", title: "Read: Tailwind plugin system", description: "How to write a Tailwind plugin with addUtilities and addComponents.", links: [{ label: "Tailwind Plugins", url: "https://tailwindcss.com/docs/plugins" }] },
    ],
    article: { title: "The House Robber Pattern in Dynamic Programming", url: "https://neetcode.io/problems/house-robber", source: "neetcode.io", readTime: "15 min" },
  },
  {
    day: 28, month: 1, week: 4, theme: "Month 1 Final Review",
    tasks: [
      { id: "m1d28-review", category: "Review", title: "Take 5 LeetCode Easy/Medium problems blind", description: "Pick any 5 from the NeetCode 150. No hints. Time yourself at 20 min each.", links: [{ label: "NeetCode 150", url: "https://neetcode.io/roadmap" }] },
      { id: "m1d28-ui", category: "UI", title: "Portfolio component showcase", description: "Build a page that lists all components you made this month. Add to GitHub.", links: [] },
    ],
    article: { title: "How to Build a Coding Habit That Sticks", url: "https://jamesclear.com/habit-guide", source: "James Clear", readTime: "12 min" },
  },
  {
    day: 29, month: 1, week: 4, theme: "Month 1 Polish",
    tasks: [
      { id: "m1d29-review", category: "Review", title: "Push all month 1 code to GitHub", description: "Create a repo 'frontend-portfolio'. Push all UI components. Write a README.", links: [] },
      { id: "m1d29-dsa", category: "DSA", title: "Solve 2 medium problems", description: "Pick any two NeetCode mediums you haven't done yet.", links: [{ label: "NeetCode", url: "https://neetcode.io/" }] },
    ],
    article: { title: "How to Write a Developer Portfolio README", url: "https://www.freecodecamp.org/news/how-to-write-a-good-readme-file/", source: "freeCodeCamp", readTime: "10 min" },
  },
  {
    day: 30, month: 1, week: 4, theme: "Month 1 Complete",
    tasks: [
      { id: "m1d30-review", category: "Review", title: "Reflect: Month 1 learnings", description: "Write 3 things you learned, 3 things still confusing, 3 goals for Month 2.", links: [] },
      { id: "m1d30-ui", category: "UI", title: "Plan Month 2 project structure", description: "Set up a new Next.js project with TypeScript, Tailwind, ESLint for Month 2.", links: [] },
    ],
    article: { title: "Deliberate Practice — The Key to Mastery", url: "https://jamesclear.com/deliberate-practice-theory", source: "James Clear", readTime: "12 min" },
  },
];

// ─── Month 2: State Management + Testing ──────────────────────────────────────
const month2: DayPlan[] = [
  {
    day: 31, month: 2, week: 1, theme: "Redux Toolkit – Setup",
    tasks: [
      { id: "m2d31-state", category: "State", title: "Set up Redux Toolkit in Next.js", description: "Install @reduxjs/toolkit and react-redux. Create store, Provider, first slice.", links: [{ label: "RTK Quick Start", url: "https://redux-toolkit.js.org/introduction/getting-started" }] },
      { id: "m2d31-dsa", category: "DSA", title: "Solve: LRU Cache", description: "LeetCode #146. Use Map (ordered) for O(1) get/put.", links: [{ label: "LeetCode #146", url: "https://leetcode.com/problems/lru-cache/" }] },
    ],
    article: { title: "Redux Toolkit: The Modern Way to Redux", url: "https://redux-toolkit.js.org/introduction/getting-started", source: "Redux Toolkit Docs", readTime: "20 min" },
  },
  {
    day: 32, month: 2, week: 1, theme: "Redux Toolkit – Slices",
    tasks: [
      { id: "m2d32-state", category: "State", title: "Build: Auth slice with RTK", description: "authSlice with login/logout/setUser. Connect to a mock API with createAsyncThunk.", links: [{ label: "createAsyncThunk", url: "https://redux-toolkit.js.org/api/createAsyncThunk" }] },
      { id: "m2d32-dsa", category: "DSA", title: "Solve: Maximum Subarray", description: "LeetCode #53. Kadane's algorithm.", links: [{ label: "LeetCode #53", url: "https://leetcode.com/problems/maximum-subarray/" }] },
    ],
    article: { title: "createAsyncThunk Deep Dive", url: "https://redux-toolkit.js.org/api/createAsyncThunk", source: "Redux Docs", readTime: "15 min" },
  },
  {
    day: 33, month: 2, week: 1, theme: "Redux Toolkit – RTK Query",
    tasks: [
      { id: "m2d33-state", category: "State", title: "Build: RTK Query API service", description: "Define endpoints with createApi. Use auto-generated hooks. Add tag invalidation.", links: [{ label: "RTK Query", url: "https://redux-toolkit.js.org/rtk-query/overview" }] },
      { id: "m2d33-dsa", category: "DSA", title: "Solve: Jump Game", description: "LeetCode #55. Greedy — track max reachable index.", links: [{ label: "LeetCode #55", url: "https://leetcode.com/problems/jump-game/" }] },
    ],
    article: { title: "RTK Query vs TanStack Query — Which to Pick", url: "https://redux-toolkit.js.org/rtk-query/comparison", source: "Redux Docs", readTime: "15 min" },
  },
  {
    day: 34, month: 2, week: 1, theme: "Zustand – Core",
    tasks: [
      { id: "m2d34-state", category: "State", title: "Set up Zustand store", description: "Replace Redux with Zustand for a simpler project. Create useUserStore, useCartStore.", links: [{ label: "Zustand docs", url: "https://docs.pmnd.rs/zustand/getting-started/introduction" }] },
      { id: "m2d34-dsa", category: "DSA", title: "Solve: Coin Change", description: "LeetCode #322. DP bottom-up, build up from 0 to amount.", links: [{ label: "LeetCode #322", url: "https://leetcode.com/problems/coin-change/" }] },
    ],
    article: { title: "Zustand: Bear Necessities for State Management", url: "https://docs.pmnd.rs/zustand/getting-started/introduction", source: "Zustand Docs", readTime: "15 min" },
  },
  {
    day: 35, month: 2, week: 1, theme: "Zustand – Middleware",
    tasks: [
      { id: "m2d35-state", category: "State", title: "Add Zustand persist + devtools", description: "Use persist middleware with localStorage. Add devtools middleware for debugging.", links: [{ label: "Zustand middleware", url: "https://docs.pmnd.rs/zustand/integrations/persisting-store-data" }] },
      { id: "m2d35-dsa", category: "DSA", title: "Solve: Unique Paths", description: "LeetCode #62. DP grid — dp[i][j] = dp[i-1][j] + dp[i][j-1].", links: [{ label: "LeetCode #62", url: "https://leetcode.com/problems/unique-paths/" }] },
    ],
    article: { title: "State Persistence in Web Apps — Patterns and Pitfalls", url: "https://web.dev/articles/storage-for-the-web", source: "web.dev", readTime: "12 min" },
  },
  {
    day: 36, month: 2, week: 1, theme: "React Query – Basics",
    tasks: [
      { id: "m2d36-state", category: "State", title: "Set up TanStack Query", description: "QueryClient, QueryClientProvider. useQuery with loading/error states. Refetch on focus.", links: [{ label: "TanStack Query", url: "https://tanstack.com/query/latest/docs/framework/react/quick-start" }] },
      { id: "m2d36-dsa", category: "DSA", title: "Solve: Word Break", description: "LeetCode #139. DP or BFS — mark reachable indices.", links: [{ label: "LeetCode #139", url: "https://leetcode.com/problems/word-break/" }] },
    ],
    article: { title: "TanStack Query: Server State Management Done Right", url: "https://tanstack.com/query/latest/docs/framework/react/overview", source: "TanStack Docs", readTime: "15 min" },
  },
  {
    day: 37, month: 2, week: 1, theme: "React Query – Mutations",
    tasks: [
      { id: "m2d37-state", category: "State", title: "useMutation + Optimistic Updates", description: "Use useMutation for POST/PUT. Implement optimistic update with onMutate rollback.", links: [{ label: "Optimistic Updates", url: "https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates" }] },
      { id: "m2d37-dsa", category: "DSA", title: "Solve: Decode Ways", description: "LeetCode #91. DP — count valid decodings of digit string.", links: [{ label: "LeetCode #91", url: "https://leetcode.com/problems/decode-ways/" }] },
    ],
    article: { title: "Optimistic UI Updates Explained", url: "https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates", source: "TanStack Docs", readTime: "15 min" },
  },
  {
    day: 38, month: 2, week: 2, theme: "Jest – Setup & Basics",
    tasks: [
      { id: "m2d38-testing", category: "Testing", title: "Set up Jest + ts-jest in Next.js", description: "Install jest, @types/jest, ts-jest. Configure jest.config.ts. Write first test.", links: [{ label: "Jest Getting Started", url: "https://jestjs.io/docs/getting-started" }] },
      { id: "m2d38-dsa", category: "DSA", title: "Solve: Longest Increasing Subsequence", description: "LeetCode #300. DP O(n²) then understand O(n log n) patience sort.", links: [{ label: "LeetCode #300", url: "https://leetcode.com/problems/longest-increasing-subsequence/" }] },
    ],
    article: { title: "Jest Complete Guide for TypeScript Projects", url: "https://jestjs.io/docs/getting-started#using-typescript", source: "Jest Docs", readTime: "20 min" },
  },
  {
    day: 39, month: 2, week: 2, theme: "Jest – Mocking",
    tasks: [
      { id: "m2d39-testing", category: "Testing", title: "jest.mock, jest.fn, jest.spyOn", description: "Mock an API module. Spy on console.error. Mock timers with jest.useFakeTimers.", links: [{ label: "Jest Mock Functions", url: "https://jestjs.io/docs/mock-functions" }] },
      { id: "m2d39-dsa", category: "DSA", title: "Solve: Merge Intervals", description: "LeetCode #56. Sort by start, merge overlapping.", links: [{ label: "LeetCode #56", url: "https://leetcode.com/problems/merge-intervals/" }] },
    ],
    article: { title: "The Art of Mocking in Jest", url: "https://jestjs.io/docs/mock-functions", source: "Jest Docs", readTime: "15 min" },
  },
  {
    day: 40, month: 2, week: 2, theme: "RTL – Queries",
    tasks: [
      { id: "m2d40-testing", category: "Testing", title: "React Testing Library basics", description: "render, screen.getByRole, getByText, userEvent. Test a simple Button component.", links: [{ label: "RTL Getting Started", url: "https://testing-library.com/docs/react-testing-library/intro/" }] },
      { id: "m2d40-dsa", category: "DSA", title: "Solve: Non-overlapping Intervals", description: "LeetCode #435. Greedy — keep intervals with earliest end time.", links: [{ label: "LeetCode #435", url: "https://leetcode.com/problems/non-overlapping-intervals/" }] },
    ],
    article: { title: "Common Mistakes with React Testing Library", url: "https://kentcdodds.com/blog/common-mistakes-with-react-testing-library", source: "Kent C. Dodds", readTime: "20 min" },
  },
  {
    day: 41, month: 2, week: 2, theme: "RTL – User Events",
    tasks: [
      { id: "m2d41-testing", category: "Testing", title: "Test forms with userEvent", description: "Test a sign-in form: type email/password, submit, assert API call mock.", links: [{ label: "userEvent v14", url: "https://testing-library.com/docs/user-event/intro" }] },
      { id: "m2d41-dsa", category: "DSA", title: "Solve: Find Minimum in Rotated Sorted Array", description: "LeetCode #153. Binary search — find the pivot.", links: [{ label: "LeetCode #153", url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/" }] },
    ],
    article: { title: "userEvent vs fireEvent — What's the Difference", url: "https://testing-library.com/docs/user-event/intro#differences-from-fireevent", source: "Testing Library Docs", readTime: "10 min" },
  },
  {
    day: 42, month: 2, week: 2, theme: "RTL – Async",
    tasks: [
      { id: "m2d42-testing", category: "Testing", title: "Test async components with waitFor", description: "Test a component that fetches data. Mock fetch. Use waitFor and findByText.", links: [{ label: "Async RTL", url: "https://testing-library.com/docs/dom-testing-library/api-async/" }] },
      { id: "m2d42-dsa", category: "DSA", title: "Solve: Kth Largest Element in Array", description: "LeetCode #215. QuickSelect — partial quicksort O(n) average.", links: [{ label: "LeetCode #215", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/" }] },
    ],
    article: { title: "Testing Async React Components", url: "https://testing-library.com/docs/dom-testing-library/api-async/", source: "Testing Library", readTime: "12 min" },
  },
  {
    day: 43, month: 2, week: 2, theme: "RTL – Custom Hooks",
    tasks: [
      { id: "m2d43-testing", category: "Testing", title: "Test custom hooks with renderHook", description: "Test useDebounce and useLocalStorage hooks with renderHook + act.", links: [{ label: "renderHook", url: "https://testing-library.com/docs/react-testing-library/api/#renderhook" }] },
      { id: "m2d43-dsa", category: "DSA", title: "Solve: Serialize and Deserialize Binary Tree", description: "LeetCode #297. BFS serialization. Handle nulls.", links: [{ label: "LeetCode #297", url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/" }] },
    ],
    article: { title: "Testing Custom React Hooks", url: "https://kentcdodds.com/blog/how-to-test-custom-react-hooks", source: "Kent C. Dodds", readTime: "15 min" },
  },
  {
    day: 44, month: 2, week: 2, theme: "Week 2 Review",
    tasks: [
      { id: "m2d44-review", category: "Review", title: "Write tests for Month 1 components", description: "Write RTL tests for 5 components you built in Month 1.", links: [] },
      { id: "m2d44-dsa", category: "DSA", title: "Solve: Course Schedule", description: "LeetCode #207. Topological sort with DFS cycle detection.", links: [{ label: "LeetCode #207", url: "https://leetcode.com/problems/course-schedule/" }] },
    ],
    article: { title: "Test-Driven Development with React", url: "https://kentcdodds.com/blog/write-tests", source: "Kent C. Dodds", readTime: "15 min" },
  },
  ...Array.from({ length: 16 }, (_, i) => {
    const d = 45 + i;
    const week = d <= 51 ? 3 : 4;
    return {
      day: d, month: 2, week, theme: week === 3 ? "Integration Testing" : "E2E + Coverage",
      tasks: [
        { id: `m2d${d}-testing`, category: "Testing" as TaskCategory, title: `Testing Day ${d - 44}: ${week === 3 ? "Integration tests" : "Coverage & CI"}`, description: week === 3 ? "Write integration tests that test multiple components together with a mock API." : "Set up Vitest coverage reports. Add GitHub Actions CI to run tests on PR.", links: [{ label: "Vitest coverage", url: "https://vitest.dev/guide/coverage.html" }] },
        { id: `m2d${d}-dsa`, category: "DSA" as TaskCategory, title: "Daily DSA problem", description: "Pick one NeetCode medium you haven't solved. Time yourself at 25 minutes.", links: [{ label: "NeetCode", url: "https://neetcode.io/" }] },
      ],
      article: { title: "The Testing Trophy — What to Test and How Much", url: "https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications", source: "Kent C. Dodds", readTime: "12 min" },
    };
  }),
];

// ─── Month 3: Portfolio Projects ───────────────────────────────────────────────
const projectOneTasks: string[] = [
  "Project setup: Next.js + Prisma + PostgreSQL (use Neon free tier)",
  "Auth: NextAuth.js with Google OAuth + credentials",
  "Feature: Dashboard with real-time stats",
  "Feature: CRUD operations with server actions",
  "Feature: File uploads to Cloudflare R2",
  "Feature: Email notifications with Resend",
  "Feature: Search and filtering with debounce",
  "Feature: Pagination with cursor-based approach",
  "UI polish: Responsive design + dark mode",
  "Testing: RTL tests for critical paths",
  "Deploy: Vercel + Neon + environment setup",
  "Polish: Error boundaries + loading states",
  "SEO: metadata, OG images, sitemap",
  "README + case study writeup",
  "Stretch: Add analytics dashboard",
];

const projectTwoTasks: string[] = [
  "Project 2 setup: different domain (fintech/edtech/social)",
  "Schema design: Prisma schema with 5+ related models",
  "Auth: Role-based access control (admin/user/guest)",
  "Feature: Real-time with Server-Sent Events or WebSockets",
  "Feature: Complex data visualizations (recharts/visx)",
  "Feature: PDF generation with @react-pdf/renderer",
  "Feature: Stripe payment integration",
  "Feature: Rate limiting with Upstash Redis",
  "Feature: Caching strategy with revalidation",
  "Testing: Integration test suite",
  "Deploy: Docker + Railway OR Vercel Edge",
  "Performance: Lighthouse audit + fixes",
  "Accessibility: WCAG 2.1 AA compliance check",
  "Demo video: Loom walkthrough",
  "Case study: Write detailed blog post about architecture",
];

const month3: DayPlan[] = Array.from({ length: 30 }, (_, i) => {
  const d = 61 + i;
  const isP1 = i < 15;
  const taskIndex = i % 15;
  return {
    day: d, month: 3, week: Math.floor(i / 7) + 1, theme: isP1 ? "Portfolio Project 1" : "Portfolio Project 2",
    tasks: [
      { id: `m3d${d}-project`, category: "Project" as TaskCategory, title: (isP1 ? projectOneTasks : projectTwoTasks)[taskIndex], description: "Work on today's project milestone. Commit code at end of day.", links: [] },
      { id: `m3d${d}-dsa`, category: "DSA" as TaskCategory, title: "Daily DSA (keep the habit)", description: "One LeetCode medium to keep skills sharp during project month.", links: [{ label: "NeetCode", url: "https://neetcode.io/" }] },
    ],
    article: { title: isP1 ? "Building a Portfolio Project That Gets You Hired" : "How to Document Your Portfolio Project", url: isP1 ? "https://www.freecodecamp.org/news/portfolio-projects-for-developers/" : "https://www.freecodecamp.org/news/how-to-write-a-good-readme-file/", source: "freeCodeCamp", readTime: "15 min" },
  };
});

// ─── Month 4: Interview Prep + Applying ───────────────────────────────────────
const month4Topics = [
  "System Design: URL Shortener",
  "System Design: News Feed",
  "System Design: Chat App",
  "System Design: Design Twitter",
  "System Design: Rate Limiter",
  "System Design: File Storage",
  "System Design: Search Autocomplete",
  "Resume: Tailor for target roles",
  "Resume: STAR method for bullets",
  "LinkedIn: Optimize profile",
  "Behavioral: Tell me about yourself",
  "Behavioral: Greatest challenge + STAR",
  "Behavioral: Why this company?",
  "Behavioral: Work style + disagreements",
  "LC Review: Blind 75 gaps",
  "LC Review: Company-tagged problems",
  "LC Review: Mock interview x1",
  "Apply: 5 applications today",
  "Apply: 5 more + follow-ups",
  "Apply: Research companies deeply",
  "Apply: 5 more + referrals",
  "Apply: Cold outreach to engineers",
  "Mock Interview: DS&A round",
  "Mock Interview: System design round",
  "Mock Interview: Behavioral round",
  "Apply: Track responses, follow up",
  "Negotiate: Salary research (levels.fyi)",
  "Negotiate: Counter-offer strategies",
  "Network: Attend local meetup or online event",
  "Reflect: Month 4 + plan next steps",
];

const month4: DayPlan[] = Array.from({ length: 30 }, (_, i) => {
  const d = 91 + i;
  const topic = month4Topics[i] || "Interview Prep";
  const cat: TaskCategory = topic.startsWith("Apply") ? "Apply" : topic.startsWith("System") ? "Interview" : topic.startsWith("Behavioral") || topic.startsWith("Resume") || topic.startsWith("LinkedIn") ? "Interview" : "Interview";
  return {
    day: d, month: 4, week: Math.floor(i / 7) + 1, theme: topic,
    tasks: [
      { id: `m4d${d}-main`, category: cat, title: topic, description: `Focus: ${topic}. Spend 60-90 minutes on this. Take notes.`, links: topic.startsWith("System") ? [{ label: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer" }] : topic.startsWith("Apply") ? [{ label: "LinkedIn Jobs", url: "https://linkedin.com/jobs" }] : [{ label: "Behavioral Guide", url: "https://www.youtube.com/watch?v=PJKYqLP6MRo" }] },
      { id: `m4d${d}-dsa`, category: "DSA", title: "LeetCode company-tagged problem", description: "Pick a problem tagged with your target company. Time yourself 25 min.", links: [{ label: "LeetCode Company Tags", url: "https://leetcode.com/problemset/" }] },
    ],
    article: { title: topic.startsWith("System") ? "Grokking the System Design Interview" : topic.startsWith("Behavioral") ? "STAR Method for Behavioral Interviews" : "Job Search Strategy for Developers", url: topic.startsWith("System") ? "https://github.com/donnemartin/system-design-primer" : "https://www.levels.fyi/", source: topic.startsWith("System") ? "GitHub" : "levels.fyi", readTime: "20 min" },
  };
});

export const CURRICULUM: DayPlan[] = [...month1, ...month2, ...month3, ...month4];

export function getDayPlan(dayNumber: number): DayPlan | null {
  return CURRICULUM.find((d) => d.day === dayNumber) || null;
}

export const MONTH_NAMES = ["Month 1: Coding Habits", "Month 2: State & Testing", "Month 3: Portfolio", "Month 4: Interview Prep"];
