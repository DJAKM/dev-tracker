export interface Question {
  id: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  answer: string;
  codeSolution?: string; // Only shown AFTER user reveals the answer (they must try first)
  tags: string[];
}

export const QUESTIONS: Question[] = [
  // ─── JavaScript Fundamentals ──────────────────────────────────────────
  { id: "js-001", topic: "JavaScript", difficulty: "easy", question: "What is the difference between `==` and `===` in JavaScript?", answer: "`==` uses type coercion (loose equality): `'5' == 5` is `true`. `===` is strict equality — both value AND type must match: `'5' === 5` is `false`. Always prefer `===` to avoid subtle bugs.", codeSolution: `// == coerces types before comparing
console.log(0 == false)   // true  (false → 0)
console.log('' == false)  // true  (both → 0)
console.log(null == undefined) // true

// === requires same type AND value
console.log(0 === false)  // false
console.log('' === false) // false
console.log(null === undefined) // false

// Always use === in production code
function isLoggedIn(user) {
  return user !== null && user !== undefined; // not != null
}`, tags: ["javascript", "basics"] },
  { id: "js-002", topic: "JavaScript", difficulty: "easy", question: "What does `var`, `let`, and `const` differ in?", answer: "`var` is function-scoped and hoisted (initialized as `undefined`). `let` and `const` are block-scoped and NOT initialized when hoisted (Temporal Dead Zone). `const` can't be reassigned — but its properties can be mutated. Use `const` by default, `let` when you need to reassign.", tags: ["javascript", "scope"] },
  { id: "js-003", topic: "JavaScript", difficulty: "medium", question: "Explain JavaScript's event loop. What is the call stack vs the task queue?", answer: "JS is single-threaded. The call stack runs synchronous code. Async callbacks (setTimeout, fetch) go to the Web APIs → task queue (macrotask) or microtask queue (Promises). The event loop checks: is call stack empty? If yes, run ALL microtasks first, then ONE macrotask. This is why Promise.then() always runs before setTimeout.", tags: ["javascript", "async"] },
  { id: "js-004", topic: "JavaScript", difficulty: "medium", question: "What is a closure in JavaScript? Give a real-world example.", answer: "A closure is a function that 'closes over' variables from its outer scope, keeping them alive even after the outer function returns. Real example: `function makeCounter() { let n = 0; return () => ++n; }` — the returned arrow function retains access to `n`. Used for private state, factory functions, memoization.", codeSolution: `// Counter — private state via closure
function makeCounter(initial = 0) {
  let count = initial; // private — not accessible outside
  return {
    increment: () => ++count,
    decrement: () => --count,
    value: () => count,
    reset: () => { count = initial; },
  };
}

const c = makeCounter(10);
c.increment(); // 11
c.increment(); // 12
c.value();     // 12

// Real use: debounce
function debounce(fn, ms) {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), ms);
  };
}

const search = debounce((query) => fetchResults(query), 300);`, tags: ["javascript", "closures"] },
  { id: "js-005", topic: "JavaScript", difficulty: "hard", question: "What is prototypal inheritance? How does it differ from classical OOP?", answer: "JS objects have a `[[Prototype]]` chain. When you access a property, JS walks up the chain until found or null. `class` syntax is syntactic sugar over this — `class Foo extends Bar` sets `Foo.prototype.__proto__ = Bar.prototype`. Unlike classical OOP, instances share prototype methods (not copies), saving memory. Use `Object.create()` to set prototypes explicitly.", tags: ["javascript", "prototype"] },
  { id: "js-006", topic: "JavaScript", difficulty: "medium", question: "What is the difference between `Promise.all`, `Promise.race`, `Promise.allSettled`, and `Promise.any`?", answer: "`all`: resolves when ALL resolve, rejects immediately on first rejection. `race`: resolves/rejects with first settled promise. `allSettled`: always resolves with all results (fulfilled or rejected). `any`: resolves on first fulfilled, rejects (AggregateError) if all reject. Use `allSettled` for parallel calls where you need all results regardless.", tags: ["javascript", "async", "promises"] },
  { id: "js-007", topic: "JavaScript", difficulty: "easy", question: "What is the difference between `null` and `undefined`?", answer: "`undefined`: variable declared but not assigned, or function with no return. `null`: explicitly assigned 'no value'. `typeof undefined === 'undefined'`. `typeof null === 'object'` (historic bug). Use `=== null` to check for null. Both are falsy.", tags: ["javascript", "basics"] },
  { id: "js-008", topic: "JavaScript", difficulty: "medium", question: "How does `this` work in JavaScript? When does it change?", answer: "`this` is the object that owns the current function call. Rules: 1) Global context: window/global. 2) Object method: the object. 3) Arrow function: lexically inherits `this` from outer scope (never has own `this`). 4) `new`: the new instance. 5) `call/apply/bind`: explicitly set. Arrow functions are key for callbacks inside class methods.", tags: ["javascript", "this"] },
  { id: "js-009", topic: "JavaScript", difficulty: "medium", question: "What is memoization? Implement a simple memoize function.", answer: "Memoization caches function results keyed by inputs. Use for pure functions with expensive computations.", codeSolution: `function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log('cache hit:', key);
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Example: expensive fibonacci
const fib = memoize(function(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
});

fib(40); // fast — each subproblem computed once

// React equivalent: useMemo
const expensiveValue = useMemo(
  () => computeExpensiveValue(a, b),
  [a, b] // only recomputes when a or b changes
);`, tags: ["javascript", "performance"] },
  { id: "js-010", topic: "JavaScript", difficulty: "hard", question: "What are generators and when would you use them?", answer: "Generators are functions that can pause/resume execution via `yield`. `function* gen() { yield 1; yield 2; }`. The returned iterator has `.next()` which runs until the next yield. Use cases: lazy sequences, infinite iterators, async control flow (before async/await), implementing iterators for custom data structures.", tags: ["javascript", "advanced"] },

  // ─── TypeScript ───────────────────────────────────────────────────────
  { id: "ts-001", topic: "TypeScript", difficulty: "easy", question: "What is the difference between `interface` and `type` in TypeScript?", answer: "`interface` is extendable (declaration merging, `extends`). `type` can do everything interface can, plus unions/intersections (`type A = B | C`), mapped types, conditional types. Use `interface` for object shapes (especially public APIs that may need extension). Use `type` for unions, intersections, and complex types. They're nearly interchangeable for simple object shapes.", tags: ["typescript"] },
  { id: "ts-002", topic: "TypeScript", difficulty: "medium", question: "What are generics in TypeScript? Give a practical example.", answer: "Generics let you write reusable, type-safe code for different types. `function first<T>(arr: T[]): T | undefined { return arr[0]; }` — T is inferred from the argument. Real use: `useQuery<User>()`, `Array<string>`, `Promise<ApiResponse<Data>>`. They prevent `any` while maintaining flexibility.", tags: ["typescript", "generics"] },
  { id: "ts-003", topic: "TypeScript", difficulty: "hard", question: "What is `unknown` vs `any`? Why prefer `unknown`?", answer: "`any` disables type checking — you can do anything with it. `unknown` is the type-safe alternative: you can't use an `unknown` value without first narrowing the type (`typeof`, `instanceof`, type guard). Use `any` as a last resort escape hatch. Use `unknown` for values you truly don't know the type of (e.g., catch clause error, fetch response).", tags: ["typescript"] },
  { id: "ts-004", topic: "TypeScript", difficulty: "medium", question: "Explain conditional types and the `infer` keyword.", answer: "`type IsArray<T> = T extends any[] ? true : false`. The `infer` keyword extracts types within conditional types: `type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never`. This powers utility types like `ReturnType<>`, `Parameters<>`, `Awaited<>`.", tags: ["typescript", "advanced"] },
  { id: "ts-005", topic: "TypeScript", difficulty: "medium", question: "What are discriminated unions? How are they used for type narrowing?", answer: "A discriminated union has a shared literal property (discriminant) that TypeScript uses for narrowing: `type Shape = { kind: 'circle', radius: number } | { kind: 'square', side: number }`. In a switch on `shape.kind`, TypeScript narrows the type in each branch. Great for state machines, action types, API responses.", tags: ["typescript"] },

  // ─── React ────────────────────────────────────────────────────────────
  { id: "react-001", topic: "React", difficulty: "easy", question: "What is the difference between state and props?", answer: "Props are inputs passed FROM parent to child — read-only in the child. State is internal, mutable data managed by the component itself with useState/useReducer. When state or props change, the component re-renders. Lift state up when siblings need the same data.", tags: ["react", "fundamentals"] },
  { id: "react-002", topic: "React", difficulty: "medium", question: "Explain React's reconciliation process.", answer: "When state/props change, React re-renders the component and creates a new virtual DOM tree. It then diffs it against the previous tree (reconciliation). React assumes: 1) Elements of different types produce different trees. 2) Keys help identify list items. It only updates the actual DOM nodes that changed. With Fiber, this work can be paused and resumed.", tags: ["react", "performance"] },
  { id: "react-003", topic: "React", difficulty: "medium", question: "When should you use `useMemo` and `useCallback`?", answer: "`useMemo` caches a computed value: `useMemo(() => expensiveCalc(a, b), [a, b])`. `useCallback` caches a function reference: `useCallback(() => doThing(id), [id])`. Use `useCallback` when passing callbacks to memoized child components (with `React.memo`). Don't overuse — they have overhead too. Profile first.", tags: ["react", "hooks", "performance"] },
  { id: "react-004", topic: "React", difficulty: "hard", question: "What are React Server Components? How do they differ from Client Components?", answer: "RSCs render on the server and send HTML/JSON to the client — zero JS bundle. They can be async, access databases directly, and can't use hooks or browser APIs. Client Components ('use client') have interactivity, hooks, and event handlers but ship JS. RSCs can include Client Components but not vice versa. Default in Next.js App Router.", tags: ["react", "server-components"] },
  { id: "react-005", topic: "React", difficulty: "medium", question: "What is the problem with using `useEffect` for data fetching?", answer: "useEffect runs after paint (client-side only), causing loading spinners, layout shift, and request waterfalls. It doesn't cache, deduplicate, or handle race conditions by default. Solutions: React Query/SWR for client-side, or Server Components for server-side. If you must use useEffect, return a cleanup to handle race conditions (AbortController).", tags: ["react", "hooks"] },
  { id: "react-006", topic: "React", difficulty: "medium", question: "Explain the React rendering lifecycle: when do useEffect, useLayoutEffect, and useInsertionEffect run?", answer: "Order: render → DOM update → useInsertionEffect (for CSS-in-JS) → browser paint → useLayoutEffect (sync, before paint visible to user) → useEffect (async, after paint). useLayoutEffect is like componentDidMount/Update — use for DOM measurements. useEffect is for side effects that don't need synchronous DOM access.", tags: ["react", "hooks"] },
  { id: "react-007", topic: "React", difficulty: "hard", question: "How does React's concurrent mode work? What is Suspense?", answer: "Concurrent React can render component trees off-screen, pause, and discard renders. This enables features like Transitions (startTransition — mark updates as non-urgent) and Suspense. Suspense catches components that 'suspend' (throw a Promise) and shows a fallback. Used for lazy loading (React.lazy) and data fetching in frameworks.", tags: ["react", "concurrent"] },
  { id: "react-008", topic: "React", difficulty: "medium", question: "What is React.memo and when does it help?", answer: "`React.memo(Component)` wraps a component so it only re-renders if props change (shallow comparison). Useful when a parent re-renders frequently but child props are stable. Combine with `useCallback` for callback props. Don't memoize everything — adds complexity. Profile with React DevTools Profiler first.", tags: ["react", "performance"] },

  // ─── Next.js ──────────────────────────────────────────────────────────
  { id: "next-001", topic: "Next.js", difficulty: "easy", question: "What are Server Actions in Next.js?", answer: "Server Actions are async functions marked with `'use server'` that run on the server. They can be called from client-side forms (action={serverAction}) or Client Components. They handle mutations, database writes, revalidation — replacing API routes for most mutations. They're secure because they run server-side only.", tags: ["nextjs", "server-actions"] },
  { id: "next-002", topic: "Next.js", difficulty: "medium", question: "Explain Next.js caching layers.", answer: "Next.js has 4 cache layers: 1) Request Memoization — deduplicates fetch() calls in one render tree. 2) Data Cache — persists fetch() responses server-side across requests. 3) Full Route Cache — caches rendered HTML+RSC payload for static routes. 4) Router Cache — client-side cache of visited routes. Use `revalidatePath`, `revalidateTag`, or `cache: 'no-store'` to opt out.", tags: ["nextjs", "caching"] },
  { id: "next-003", topic: "Next.js", difficulty: "medium", question: "What is the difference between static and dynamic rendering in Next.js?", answer: "Static: rendered at build time, served from CDN, no request overhead. Dynamic: rendered per-request (when you use cookies(), headers(), searchParams, or fetch with no-store). You can have dynamic routes that are statically generated with generateStaticParams. Partial Prerendering (new) mixes static shells with dynamic streaming.", tags: ["nextjs"] },
  { id: "next-004", topic: "Next.js", difficulty: "medium", question: "How does file-based routing work in Next.js App Router?", answer: "Each `page.tsx` in `app/` becomes a route. `layout.tsx` wraps child pages. `loading.tsx` is shown while the page loads (Suspense boundary). `error.tsx` catches errors. `route.ts` defines API endpoints. Special files: `not-found.tsx`, `sitemap.ts`, `robots.ts`. Dynamic segments: `[id]`, catch-all: `[...slug]`.", tags: ["nextjs", "routing"] },
  { id: "next-005", topic: "Next.js", difficulty: "hard", question: "What is middleware in Next.js and what can you use it for?", answer: "Middleware runs at the Edge before a request is processed. Use it for: auth redirects (check session cookie), A/B testing, geolocation-based routing, rate limiting, rewriting URLs. Return `NextResponse.redirect()`, `rewrite()`, or `next()`. Keep it lightweight — no Node.js APIs, no DB calls (use Edge-compatible solutions like Upstash Redis).", tags: ["nextjs", "middleware"] },

  // ─── CSS & UI ─────────────────────────────────────────────────────────
  { id: "css-001", topic: "CSS", difficulty: "easy", question: "What is the CSS box model?", answer: "Every element is a box: content → padding → border → margin. `box-sizing: content-box` (default): width = content only. `box-sizing: border-box` (recommended): width includes padding + border. Always set `* { box-sizing: border-box }` for predictable layouts.", tags: ["css", "basics"] },
  { id: "css-002", topic: "CSS", difficulty: "medium", question: "How does CSS specificity work?", answer: "Specificity is calculated as (inline, IDs, classes, elements): inline=1000, #id=100, .class/[attr]/:pseudo=10, element=1. Highest specificity wins. `!important` overrides all (avoid using it). `:is()` and `:where()` have the specificity of their selector arguments (`:where` is always 0).", tags: ["css", "specificity"] },
  { id: "css-003", topic: "CSS", difficulty: "medium", question: "Explain CSS Flexbox: what does `flex: 1` mean?", answer: "`flex` is shorthand for `flex-grow flex-shrink flex-basis`. `flex: 1` = `flex: 1 1 0%`. Grow to fill space, shrink if needed, start at 0 basis. `flex: auto` = `flex: 1 1 auto` (uses content size as basis). Use `flex: 1` for equal-width flex children.", tags: ["css", "flexbox"] },
  { id: "css-004", topic: "CSS", difficulty: "medium", question: "What is the difference between `position: absolute`, `fixed`, `sticky`, and `relative`?", answer: "`relative`: offset from its normal position, still in flow. `absolute`: removed from flow, positioned relative to nearest positioned ancestor. `fixed`: relative to viewport, stays on scroll. `sticky`: hybrid — in flow until scroll threshold, then fixed. A `sticky` parent needs `overflow: visible` or it won't stick.", tags: ["css", "layout"] },
  { id: "css-005", topic: "CSS", difficulty: "hard", question: "Explain CSS Grid `auto-fill` vs `auto-fit`.", answer: "Both use `repeat(auto-fill/auto-fit, minmax(200px, 1fr))` to create responsive grids without media queries. `auto-fill`: fills the row with as many columns as possible, even if empty. `auto-fit`: collapses empty columns, so filled columns stretch to fill space. For responsive cards with stretch, use `auto-fit`.", tags: ["css", "grid"] },
  { id: "css-006", topic: "CSS", difficulty: "medium", question: "What are CSS custom properties (variables) and how do they work?", answer: "CSS variables are declared with `--name: value` and used with `var(--name)`. They cascade and inherit like any CSS property. Change theme with one `:root` update. Can be read/set with JS (`el.style.setProperty('--color', 'red')`). Scope them to components by declaring on the component root rather than `:root`.", tags: ["css", "variables"] },

  // ─── System Design ────────────────────────────────────────────────────
  { id: "sys-001", topic: "System Design", difficulty: "medium", question: "What is horizontal vs vertical scaling?", answer: "Vertical (scale up): add more CPU/RAM to one server. Simple but has limits and single point of failure. Horizontal (scale out): add more servers, distribute load via load balancer. More complex (need stateless design, shared sessions/cache) but unlimited scale. Modern systems prefer horizontal.", tags: ["system-design"] },
  { id: "sys-002", topic: "System Design", difficulty: "medium", question: "Explain the CAP theorem.", answer: "In a distributed system, you can only guarantee 2 of 3: Consistency (all nodes return same data), Availability (always returns a response), Partition Tolerance (works despite network splits). Since partitions happen, you choose CP (consistent but may be unavailable, e.g., HBase) or AP (available but may return stale data, e.g., DynamoDB/Cassandra). SQL is typically CP.", tags: ["system-design"] },
  { id: "sys-003", topic: "System Design", difficulty: "hard", question: "How would you design a URL shortener (like bit.ly)?", answer: "Requirements: shorten URL, redirect short→long, analytics. Core: Generate 6-char base62 ID (or hash). Store in DB: {short_code, original_url, created_at, clicks}. Read-heavy: cache short_code→URL in Redis. For 301 (permanent) vs 302 (temporary) redirect — use 302 for analytics. Handle: custom aliases, expiration, rate limiting.", tags: ["system-design"] },
  { id: "sys-004", topic: "System Design", difficulty: "hard", question: "What is a CDN and when would you use one?", answer: "CDN (Content Delivery Network) caches static assets at edge servers near users. Reduces latency, origin server load, bandwidth costs. Use for: static files (JS, CSS, images), API responses (with cache headers), streaming. Invalidation is the hard part — use versioned URLs or cache tags. Vercel/Cloudflare provide CDN automatically.", tags: ["system-design"] },
  { id: "sys-005", topic: "System Design", difficulty: "medium", question: "What is the difference between SQL and NoSQL databases?", answer: "SQL: structured schema, ACID transactions, joins, relational. Best for complex queries, financial data. NoSQL: flexible schema, horizontal scale, various models (document, key-value, column, graph). Document DBs (MongoDB) good for nested data. Key-value (Redis) for caching. Choose based on query patterns, not popularity.", tags: ["system-design"] },
  { id: "sys-006", topic: "System Design", difficulty: "hard", question: "How do you implement rate limiting?", answer: "Algorithms: 1) Token bucket: refill tokens at rate, consume per request. 2) Leaky bucket: fixed-rate queue. 3) Sliding window: count requests in rolling time window. Implement with Redis: `INCR user:123:minute:2024010112`, set TTL=60s. Upstash Redis is great for Edge rate limiting in Next.js middleware.", tags: ["system-design", "security"] },

  // ─── DSA Concepts ─────────────────────────────────────────────────────
  { id: "dsa-001", topic: "Algorithms", difficulty: "easy", question: "What is Big-O notation? What is O(n log n)?", answer: "Big-O describes time/space complexity growth as input size n increases. O(1)=constant, O(log n)=halving each step (binary search), O(n)=linear, O(n log n)=sorting (merge/quick sort), O(n²)=nested loops, O(2ⁿ)=exponential. O(n log n) is optimal for comparison-based sorting.", codeSolution: `// O(1) — constant
function getFirst(arr) { return arr[0]; }

// O(log n) — binary search: halves problem each step
function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] === target) return mid;
    arr[mid] < target ? lo = mid + 1 : hi = mid - 1;
  }
  return -1;
}

// O(n) — linear scan
function findMax(arr) {
  return arr.reduce((max, n) => n > max ? n : max, -Infinity);
}

// O(n²) — nested loops (avoid!)
function hasDuplicate_slow(arr) {
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++)
      if (arr[i] === arr[j]) return true;
  return false;
}

// O(n) — hash set (better!)
function hasDuplicate_fast(arr) {
  return new Set(arr).size !== arr.length;
}`, tags: ["algorithms", "complexity"] },
  { id: "dsa-002", topic: "Algorithms", difficulty: "medium", question: "Explain the two-pointer technique. When do you use it?", answer: "Two pointers reduce O(n²) to O(n) for sorted arrays. Patterns: 1) Opposite ends — close gap (Two Sum sorted, Container with Most Water). 2) Same direction — sliding window (max subarray). 3) Fast/slow — cycle detection (Floyd's algorithm). Key: works on sorted arrays or when order doesn't matter.", codeSolution: `// Pattern 1: Opposite ends — Two Sum (sorted array)
function twoSumSorted(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const sum = nums[lo] + nums[hi];
    if (sum === target) return [lo, hi];
    sum < target ? lo++ : hi--;
  }
  return [];
}

// Pattern 2: Sliding window — max sum subarray of size k
function maxSumSubarray(nums, k) {
  let sum = nums.slice(0, k).reduce((a, b) => a + b, 0);
  let max = sum;
  for (let i = k; i < nums.length; i++) {
    sum += nums[i] - nums[i - k];
    max = Math.max(max, sum);
  }
  return max;
}

// Pattern 3: Fast/slow — detect cycle in linked list
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`, tags: ["algorithms", "patterns"] },
  { id: "dsa-003", topic: "Algorithms", difficulty: "medium", question: "What is dynamic programming? How do you identify a DP problem?", answer: "DP solves problems by breaking into overlapping subproblems and caching results. Identify: 1) Optimal substructure (optimal solution uses optimal sub-solutions). 2) Overlapping subproblems (same sub-problems repeated). Signs: 'maximum', 'minimum', 'number of ways', 'can we reach'. Top-down = memoization (recursive + cache). Bottom-up = tabulation (iterative).", codeSolution: `// Classic: Climbing Stairs (LeetCode #70)
// How many ways to reach step n, taking 1 or 2 steps?

// Top-down (memoization)
function climbStairs_memo(n, memo = {}) {
  if (n <= 2) return n;
  if (memo[n]) return memo[n];
  memo[n] = climbStairs_memo(n - 1, memo) + climbStairs_memo(n - 2, memo);
  return memo[n];
}

// Bottom-up (tabulation) — O(n) time, O(1) space
function climbStairs(n) {
  if (n <= 2) return n;
  let prev2 = 1, prev1 = 2;
  for (let i = 3; i <= n; i++) {
    [prev2, prev1] = [prev1, prev1 + prev2];
  }
  return prev1;
}

// House Robber (LeetCode #198)
function rob(nums) {
  let prev2 = 0, prev1 = 0;
  for (const n of nums) {
    [prev2, prev1] = [prev1, Math.max(prev1, prev2 + n)];
  }
  return prev1;
}`, tags: ["algorithms", "dp"] },
  { id: "dsa-004", topic: "Algorithms", difficulty: "hard", question: "Explain Dijkstra's algorithm. What problem does it solve?", answer: "Dijkstra finds shortest paths from a source to all nodes in a weighted graph (non-negative weights). Uses a min-heap: start with dist[src]=0, all others=∞. Pop minimum, relax neighbors. O((V+E) log V) with binary heap. Fails with negative weights — use Bellman-Ford instead. Used in GPS, network routing.", codeSolution: `// Dijkstra's shortest path (min-heap via sorted array for simplicity)
function dijkstra(graph, start) {
  // graph: { node: [[neighbor, weight], ...] }
  const dist = {};
  for (const node in graph) dist[node] = Infinity;
  dist[start] = 0;

  // Min-heap: [distance, node]
  const heap = [[0, start]];

  while (heap.length) {
    heap.sort((a, b) => a[0] - b[0]);
    const [d, node] = heap.shift();

    if (d > dist[node]) continue; // stale entry

    for (const [neighbor, weight] of graph[node]) {
      const newDist = dist[node] + weight;
      if (newDist < dist[neighbor]) {
        dist[neighbor] = newDist;
        heap.push([newDist, neighbor]);
      }
    }
  }
  return dist;
}

// Example
const graph = {
  A: [['B', 4], ['C', 2]],
  B: [['D', 3]],
  C: [['B', 1], ['D', 5]],
  D: [],
};
dijkstra(graph, 'A'); // { A: 0, B: 3, C: 2, D: 6 }`, tags: ["algorithms", "graphs"] },
  { id: "dsa-005", topic: "Algorithms", difficulty: "medium", question: "What is a hash table? What causes collisions and how are they resolved?", answer: "Hash table maps keys to values via a hash function → array index. Collisions (two keys → same index): 1) Chaining: each bucket is a linked list. 2) Open addressing: probe next empty slot (linear, quadratic, double hashing). JS Map uses a hash table. Good hash function minimizes collisions. Load factor > 0.75 triggers resize.", codeSolution: `// JS Map IS a hash table — O(1) average get/set
const map = new Map();
map.set('key', 'value');
map.get('key'); // 'value'
map.has('key'); // true

// Common interview pattern: frequency count
function twoSum(nums, target) {
  const seen = new Map(); // value → index
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
  }
  return [];
}

// Group anagrams: sort letters as key
function groupAnagrams(strs) {
  const map = new Map();
  for (const s of strs) {
    const key = s.split('').sort().join('');
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  }
  return [...map.values()];
}`, tags: ["data-structures"] },
  { id: "dsa-006", topic: "Algorithms", difficulty: "medium", question: "When do you use DFS vs BFS?", answer: "DFS: deep first, uses stack (or recursion). Use for: cycle detection, topological sort, connected components, finding paths in a maze, tree depth. BFS: level by level, uses queue. Use for: shortest path in unweighted graph, level-order tree traversal, finding nearest node. BFS is better for 'closest' problems.", codeSolution: `// DFS — recursive (tree/graph)
function dfs(node, visited = new Set()) {
  if (!node || visited.has(node.val)) return;
  visited.add(node.val);
  console.log(node.val);
  for (const neighbor of node.neighbors) dfs(neighbor, visited);
}

// DFS — iterative (explicit stack)
function dfsIterative(root) {
  const stack = [root], result = [];
  while (stack.length) {
    const node = stack.pop();
    result.push(node.val);
    for (const child of node.children.reverse()) stack.push(child);
  }
  return result;
}

// BFS — always iterative with queue
function bfs(root) {
  const queue = [root], result = [];
  while (queue.length) {
    const node = queue.shift();
    result.push(node.val);
    for (const child of node.children) queue.push(child);
  }
  return result;
}

// BFS for shortest path (unweighted graph)
function shortestPath(graph, start, end) {
  const queue = [[start, 0]], visited = new Set([start]);
  while (queue.length) {
    const [node, dist] = queue.shift();
    if (node === end) return dist;
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, dist + 1]);
      }
    }
  }
  return -1;
}`, tags: ["algorithms", "graphs"] },
  { id: "dsa-007", topic: "Algorithms", difficulty: "hard", question: "What is the difference between a heap and a BST?", answer: "Heap: complete binary tree, parent > children (max-heap). O(log n) insert/delete, O(1) get-max/min. Not searchable. Used for priority queues, heap sort. BST: left < node < right. O(log n) search/insert/delete (balanced). Searchable, ordered. Balanced BSTs (AVL, Red-Black) maintain O(log n) guarantees.", codeSolution: `// Min-heap implementation (for priority queue pattern)
class MinHeap {
  constructor() { this.data = []; }

  push(val) {
    this.data.push(val);
    this._bubbleUp(this.data.length - 1);
  }

  pop() {
    const min = this.data[0];
    const last = this.data.pop();
    if (this.data.length) {
      this.data[0] = last;
      this._sinkDown(0);
    }
    return min;
  }

  peek() { return this.data[0]; }
  size() { return this.data.length; }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.data[parent] <= this.data[i]) break;
      [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
      i = parent;
    }
  }

  _sinkDown(i) {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.data[l] < this.data[smallest]) smallest = l;
      if (r < n && this.data[r] < this.data[smallest]) smallest = r;
      if (smallest === i) break;
      [this.data[smallest], this.data[i]] = [this.data[i], this.data[smallest]];
      i = smallest;
    }
  }
}

// Use: Kth largest element
const heap = new MinHeap();
for (const n of [3,2,1,5,6,4]) {
  heap.push(n);
  if (heap.size() > 2) heap.pop(); // keep only 2 largest
}
heap.peek(); // 5 (2nd largest)`, tags: ["data-structures"] },

  // ─── Testing ──────────────────────────────────────────────────────────
  { id: "test-001", topic: "Testing", difficulty: "easy", question: "What is the difference between unit, integration, and E2E tests?", answer: "Unit: tests one function/component in isolation (fast, cheap, brittle to refactor). Integration: tests multiple units working together (balanced). E2E: tests full user flows in a browser (slow, expensive, high confidence). Testing Trophy (Kent C. Dodds): mostly integration tests, fewer unit/E2E. Test behavior, not implementation.", tags: ["testing"] },
  { id: "test-002", topic: "Testing", difficulty: "medium", question: "What does 'test behavior, not implementation' mean?", answer: "Test what the component does (user sees X, form submits Y) not how it's implemented (state variable equals Z, method called once). Implementation tests break on refactoring — behavior tests don't. Query by role/label (getByRole) not by className. This is React Testing Library's core philosophy.", tags: ["testing", "rtl"] },
  { id: "test-003", topic: "Testing", difficulty: "medium", question: "How do you test a component that makes API calls?", answer: "1) Mock the API module with jest.mock. 2) Use MSW (Mock Service Worker) to intercept fetch at the network level — more realistic. 3) Use RTL's waitFor or findBy queries for async updates. Always test: loading state, success state, error state. Clean up mocks in afterEach.", tags: ["testing", "mocking"] },
  { id: "test-004", topic: "Testing", difficulty: "hard", question: "What is test coverage and what percentage should you aim for?", answer: "Coverage measures which lines/branches/functions are executed during tests. 100% coverage is not the goal — tests for sake of coverage add noise. Aim for: critical paths 100%, happy + error paths covered, avoid testing library internals. Use Istanbul/V8 coverage in Jest. Branches (if/else paths) are most valuable to cover.", tags: ["testing"] },
  { id: "test-005", topic: "Testing", difficulty: "medium", question: "What is Mock Service Worker (MSW) and why is it better than jest.mock for API calls?", answer: "MSW intercepts requests at the network layer (Service Worker in browser, node http interceptor in Node). This means your actual fetch/axios code runs unchanged — you test the real integration. Benefits: realistic tests, reuse mocks across tests and Storybook, no code changes for testing. Set up with setupServer, rest.get handlers.", tags: ["testing", "msw"] },

  // ─── Career & Behavioral ──────────────────────────────────────────────
  { id: "career-001", topic: "Career", difficulty: "easy", question: "How do you explain a technical gap or career change?", answer: "Be honest, brief, and forward-focused. Structure: 1) Acknowledge the gap briefly (1 sentence). 2) What you did during it (learning, projects). 3) Why you're excited about this role now. Never apologize. Example: 'I took time to deepen my frontend skills — built two full-stack projects with Next.js and TypeScript. I'm now focused on roles where I can build user-facing products with impact.'", tags: ["career", "behavioral"] },
  { id: "career-002", topic: "Career", difficulty: "medium", question: "How do you handle a coding problem you're stuck on during an interview?", answer: "1) Think out loud — interviewers care about process. 2) Clarify constraints (ask questions). 3) Start with brute force, state the complexity. 4) Optimize step by step. 5) If truly stuck, ask for a hint ('Can I get a nudge?'). 6) Write pseudocode first. Silence is worse than wrong — keep narrating.", tags: ["career", "interview"] },
  { id: "career-003", topic: "Career", difficulty: "medium", question: "What makes a strong developer portfolio project?", answer: "1) Solves a real problem (not a clone). 2) Live URL + GitHub link. 3) README with problem, solution, tech decisions, and challenges. 4) Non-trivial features: auth, DB, payments, real-time. 5) Tests. 6) Good commit history (shows process). 7) Responsive and accessible. 2 strong projects > 10 half-finished ones.", tags: ["career", "portfolio"] },
  { id: "career-004", topic: "Career", difficulty: "easy", question: "How do you negotiate a job offer?", answer: "1) Always negotiate — 85% of offers have room. 2) Never give a number first ('I'm flexible based on the role'). 3) Once offered, ask for 10-20% more with data (levels.fyi, Glassdoor). 4) 'I'm very excited about this role. Based on my research and experience, I was hoping for X. Is there flexibility?' 5) If they can't move on salary, negotiate equity, bonus, remote, PTO.", tags: ["career", "negotiation"] },
  { id: "career-005", topic: "Career", difficulty: "medium", question: "Explain a time you disagreed with a technical decision on your team.", answer: "Use STAR: Situation, Task, Action, Result. Key: show you raised concerns professionally (not complaining), listened to others' reasoning, and either changed your mind with new info OR accepted the decision gracefully. Don't say you were 'always right'. Good answer shows collaboration, not stubbornness.", tags: ["career", "behavioral"] },

  // ─── Web Performance ──────────────────────────────────────────────────
  { id: "perf-001", topic: "Performance", difficulty: "medium", question: "What are Core Web Vitals?", answer: "LCP (Largest Contentful Paint): load time of largest visible element. <2.5s good. CLS (Cumulative Layout Shift): visual stability score. <0.1 good. INP (Interaction to Next Paint): response time. <200ms good. Measured by Lighthouse and Chrome UX Report. In Next.js: use next/image (LCP), avoid dynamic inserts (CLS), minimize JS (INP).", tags: ["performance", "web"] },
  { id: "perf-002", topic: "Performance", difficulty: "medium", question: "What is code splitting and how does it improve performance?", answer: "Code splitting splits your JS bundle into smaller chunks loaded on demand. Without it: entire app downloads on first load. With it: only what's needed for current route loads. Next.js does this automatically per page. In React: `React.lazy(() => import('./Component'))` + Suspense. Reduces initial bundle, faster TTI.", tags: ["performance"] },
  { id: "perf-003", topic: "Performance", difficulty: "hard", question: "What is a render-blocking resource and how do you fix it?", answer: "Render-blocking: resources (CSS, JS in `<head>`) that pause HTML parsing until downloaded. Fix: 1) CSS: critical CSS inline, rest async with `media='print' onload`. 2) JS: add `defer` or `async`, or move to end of body. 3) Fonts: `font-display: swap`. 4) Third-party scripts: load async with strategy='lazyOnload' in Next.js Script.", tags: ["performance", "web"] },

  // ─── Security ─────────────────────────────────────────────────────────
  { id: "sec-001", topic: "Security", difficulty: "medium", question: "What is XSS (Cross-Site Scripting) and how do you prevent it?", answer: "XSS: attacker injects malicious scripts into pages viewed by other users. Types: Stored (in DB), Reflected (in URL), DOM-based. Prevention: 1) Escape output (React does this by default with JSX). 2) Never use dangerouslySetInnerHTML with user input. 3) Content Security Policy headers. 4) Sanitize with DOMPurify if you must render HTML.", tags: ["security"] },
  { id: "sec-002", topic: "Security", difficulty: "medium", question: "What is CSRF and how does Next.js protect against it?", answer: "CSRF: forges a request as an authenticated user from a different site. Prevention: 1) SameSite=Strict/Lax cookies (default in modern browsers). 2) CSRF tokens in forms. 3) Check Origin/Referer header. Next.js Server Actions automatically include CSRF protection by validating the Origin header and using SameSite cookies.", tags: ["security"] },
  { id: "sec-003", topic: "Security", difficulty: "medium", question: "What is SQL injection? How does Prisma prevent it?", answer: "SQL injection: user input inserted into SQL query changes its meaning. E.g., `WHERE id = '1 OR 1=1'`. Prisma uses parameterized queries — user input is never concatenated into SQL strings. The ORM generates safe queries. Never use raw SQL with user input. If using `prisma.$queryRaw`, use `Prisma.sql` template literal.", tags: ["security", "database"] },

  // ─── Git & DevOps ─────────────────────────────────────────────────────
  { id: "git-001", topic: "Git", difficulty: "easy", question: "What is the difference between `git merge` and `git rebase`?", answer: "`merge` creates a merge commit combining two branches — preserves history. `rebase` moves commits on top of another branch — cleaner linear history. Rebase rewrites commits (new SHAs) — never rebase shared/public branches. Use merge for feature → main PRs. Use rebase to incorporate main → feature updates.", tags: ["git"] },
  { id: "git-002", topic: "Git", difficulty: "medium", question: "What is `git stash` and when would you use it?", answer: "`git stash` saves your working directory changes temporarily (doesn't commit). Use when: switching branches mid-work, pulling upstream changes, doing a hotfix. `git stash pop` re-applies. `git stash list` shows all stashes. Name them: `git stash push -m 'wip: auth form'`. Stashes are local only — don't rely on them long-term.", tags: ["git"] },
  { id: "git-003", topic: "Git", difficulty: "medium", question: "Explain CI/CD. What should a basic CI pipeline for a Next.js app include?", answer: "CI: automatically build + test on every push. CD: automatically deploy when tests pass. Basic Next.js CI: 1) `npm ci` (install). 2) `npm run lint`. 3) `npm run type-check` (tsc --noEmit). 4) `npm test`. 5) `npm run build`. On success, deploy to Vercel/Railway. Use GitHub Actions — it's free for public repos.", tags: ["devops", "ci-cd"] },
];

// Seeded shuffle by date so questions are same within a day but different daily
export function getDailyQuestions(dateStr: string, count = 10): Question[] {
  const seed = dateStr.replace(/-/g, "");
  const rng = mulberry32(parseInt(seed, 10));
  const shuffled = [...QUESTIONS].sort(() => rng() - 0.5);
  return shuffled.slice(0, count);
}

function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
