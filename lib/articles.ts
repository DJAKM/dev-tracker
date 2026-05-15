export interface QuizOption {
  text: string;
  correct: boolean;
  explanation: string;
}

export interface ArticleSection {
  type: "concept" | "code" | "visual" | "quiz" | "keypoints" | "callout";
  title?: string;
  content?: string;        // markdown-ish plain text
  code?: string;           // code block
  language?: string;
  points?: string[];       // for keypoints
  calloutType?: "tip" | "warning" | "insight"; // for callout
  question?: string;       // for quiz
  options?: QuizOption[];  // for quiz
}

export interface Article {
  id: string;
  title: string;
  tldr: string;
  readTime: string;
  sections: ArticleSection[];
}

const ARTICLES: Record<string, Article> = {

  // ─── Day 1: Big-O Notation ───────────────────────────────────────────────────
  "day-1": {
    id: "day-1",
    title: "Big-O Notation — What It Actually Means",
    tldr: "Big-O tells you how slow your code gets as data grows. O(n²) with 1000 items = 1 million operations. That's why it matters.",
    readTime: "6 min",
    sections: [
      {
        type: "concept",
        title: "The one-line explanation",
        content: "Big-O is not about speed on your machine. It's about how the number of operations GROWS when your input gets bigger. Double the input — does your code do twice as much work? Or four times? Or the same?",
      },
      {
        type: "visual",
        title: "The growth chart you need to memorize",
        content: `n = 1,000 items:

O(1)       →          1 operation   ✅ always instant
O(log n)   →         10 operations  ✅ binary search
O(n)       →      1,000 operations  ✅ one loop
O(n log n) →     10,000 operations  ✅ good sorting
O(n²)      →  1,000,000 operations  ⚠️  nested loops
O(2ⁿ)      →  too many to count     ❌ only for tiny inputs

Rule: avoid O(n²) and above for large inputs.`,
      },
      {
        type: "code",
        title: "Spot the difference",
        language: "javascript",
        code: `// O(n²) — nested loops scanning the same array
function hasDuplicate_BAD(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      if (i !== j && arr[i] === arr[j]) return true;
    }
  }
  return false;
}
// With 1000 items → 1,000,000 comparisons

// O(n) — hash set, single pass
function hasDuplicate_GOOD(arr) {
  const seen = new Set();
  for (const n of arr) {
    if (seen.has(n)) return true;
    seen.add(n);
  }
  return false;
}
// With 1000 items → 1,000 comparisons`,
      },
      {
        type: "callout",
        calloutType: "tip",
        content: "When analyzing code: count the nested loops. One loop = O(n). Loop inside a loop = O(n²). Loop inside loop inside loop = O(n³). Binary search / repeatedly halving = O(log n).",
      },
      {
        type: "concept",
        title: "Drop constants and small terms",
        content: "O(2n) is just O(n). O(n² + n) is just O(n²). We only care about the dominant term — the one that grows fastest. Constants get swallowed at scale.",
      },
      {
        type: "quiz",
        question: "What is the time complexity of this code?\n\nfor (let i = 0; i < n; i++) {\n  for (let j = i; j < n; j++) {\n    console.log(i, j);\n  }\n}",
        options: [
          { text: "O(n)", correct: false, explanation: "This isn't a single loop — there's a nested loop that runs n-i times for each i." },
          { text: "O(n²)", correct: true, explanation: "Even though j starts at i (not 0), this still runs ~n²/2 times total. Drop the constant → O(n²)." },
          { text: "O(log n)", correct: false, explanation: "O(log n) comes from halving the problem each step, like binary search. This doubles the work." },
          { text: "O(n log n)", correct: false, explanation: "O(n log n) is merge/quick sort. No halving here — just two nested linear loops." },
        ],
      },
      {
        type: "keypoints",
        title: "Remember these",
        points: [
          "Big-O = how operations scale with input size, not actual speed",
          "O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ)",
          "A Set/Map lookup is O(1) — prefer it over array search O(n)",
          "Nested loops are a red flag — usually means O(n²)",
          "Drop constants: O(3n) = O(n)",
        ],
      },
    ],
  },

  // ─── Day 2: Sliding Window ───────────────────────────────────────────────────
  "day-2": {
    id: "day-2",
    title: "Sliding Window — Turn O(n²) Into O(n)",
    tldr: "Instead of re-scanning sub-arrays from scratch, slide a window and update incrementally. One of the most useful patterns for array/string problems.",
    readTime: "7 min",
    sections: [
      {
        type: "concept",
        title: "The problem it solves",
        content: "You have an array and need to examine every contiguous sub-array of size k. The naive approach loops through every starting position and sums k elements: O(n×k). The sliding window does it in O(n) — slide the window right, add the new element, remove the old one.",
      },
      {
        type: "visual",
        title: "How it slides",
        content: `Array: [2, 1, 5, 1, 3, 2],  k = 3

Window 1: [2, 1, 5] → sum = 8
           ↓ slide right
Window 2: [1, 5, 1] → sum = 8 - 2 + 1 = 7  ← no re-sum!
           ↓ slide right
Window 3: [5, 1, 3] → sum = 7 - 1 + 3 = 9
           ↓ slide right
Window 4: [1, 3, 2] → sum = 9 - 5 + 2 = 6

Max sum = 9 ✅  — O(n) instead of O(n×k)`,
      },
      {
        type: "code",
        title: "Fixed window: max sum of k elements",
        language: "javascript",
        code: `function maxSumSubarray(nums, k) {
  // Build the first window
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += nums[i];

  let maxSum = windowSum;

  // Slide: add next element, drop first element of old window
  for (let i = k; i < nums.length; i++) {
    windowSum += nums[i] - nums[i - k];
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
}

maxSumSubarray([2, 1, 5, 1, 3, 2], 3); // 9`,
      },
      {
        type: "concept",
        title: "Variable window (the harder pattern)",
        content: "Sometimes the window size isn't fixed — it grows and shrinks based on a condition. You expand the right pointer, and when the condition breaks, shrink from the left. Classic example: longest substring without repeating characters.",
      },
      {
        type: "code",
        title: "Variable window: longest substring without repeats",
        language: "javascript",
        code: `function lengthOfLongestSubstring(s) {
  const seen = new Map(); // char → last seen index
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];

    // If char was seen inside our window, shrink from left
    if (seen.has(char) && seen.get(char) >= left) {
      left = seen.get(char) + 1;
    }

    seen.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}

lengthOfLongestSubstring("abcabcbb"); // 3 ("abc")
lengthOfLongestSubstring("pwwkew");   // 3 ("wke")`,
      },
      {
        type: "callout",
        calloutType: "insight",
        content: "The tell: if a problem says 'contiguous subarray/substring' + 'maximum/minimum/longest/shortest', think sliding window first.",
      },
      {
        type: "quiz",
        question: "In a FIXED sliding window of size k on array of length n, how many total iterations do we do?",
        options: [
          { text: "k iterations", correct: false, explanation: "That's only the setup pass for the first window." },
          { text: "n - k iterations after setup", correct: false, explanation: "Close — n-k slide steps, plus k for the initial window. Total is n." },
          { text: "n total (k setup + n-k slides)", correct: true, explanation: "Exactly. Build the first window in k steps, then slide n-k times = n total. O(n)." },
          { text: "n × k iterations", correct: false, explanation: "That's the naive brute force we're trying to beat." },
        ],
      },
      {
        type: "keypoints",
        title: "Remember these",
        points: [
          "Fixed window: compute first window, then slide (add right, remove left)",
          "Variable window: expand right until condition breaks, shrink left to fix it",
          "A Map/Set tracks what's inside the window in O(1)",
          "Trigger words: contiguous, substring, subarray + max/min/longest/shortest",
          "LeetCode problems to practice: #3, #76, #209, #239, #567",
        ],
      },
    ],
  },

  // ─── Day 3: JavaScript Objects ───────────────────────────────────────────────
  "day-3": {
    id: "day-3",
    title: "JavaScript Objects — How They Actually Work",
    tldr: "Objects are hash maps under the hood. Every property lookup, prototype chain walk, and mutation has a cost. Knowing this makes you write faster, less buggy code.",
    readTime: "8 min",
    sections: [
      {
        type: "concept",
        title: "An object is just a hash map",
        content: "Under the hood, a JS object maps string (or Symbol) keys to values. Property access (obj.name) is a hash map lookup — O(1). But there's a catch: JS engines like V8 optimize objects with consistent shapes (same properties in same order) into fast C++ structs. Add properties dynamically and you lose that optimization.",
      },
      {
        type: "code",
        title: "Property access patterns — fast vs slow",
        language: "javascript",
        code: `// ✅ FAST — V8 creates a hidden class/shape for this object
const user = { id: 1, name: "Arjun", role: "dev" };
// V8 sees the same shape every time — uses an optimized struct

// ⚠️ SLOWER — dynamic properties break the hidden class
const user2 = {};
user2.id = 1;
user2.name = "Arjun";
user2.role = "dev";
// Different code path — V8 has to fall back to a hash map

// ❌ SLOWEST — deleting properties destroys the hidden class
delete user.role;
// Never delete properties in hot code paths`,
      },
      {
        type: "concept",
        title: "The prototype chain",
        content: "Every JS object has an internal [[Prototype]] link. When you access obj.toString(), JS first checks obj's own properties, then walks up the chain to Object.prototype. This chain walk happens on EVERY property access for inherited properties.",
      },
      {
        type: "visual",
        title: "Prototype chain lookup",
        content: `const arr = [1, 2, 3];
arr.map(x => x * 2);

JS engine does this:
arr.map?           → not on arr itself
arr.__proto__?     → Array.prototype ✓ found .map here!

Array.prototype chains to Object.prototype
Object.prototype chains to null (end of chain)

That's why: arr.hasOwnProperty("map") === false
But:        "map" in arr === true  (checks chain)`,
      },
      {
        type: "code",
        title: "Object tricks you must know",
        language: "javascript",
        code: `// Shallow clone (top level only)
const copy = { ...original };
const copy2 = Object.assign({}, original);

// Check own property (not inherited)
obj.hasOwnProperty("key"); // old way
Object.hasOwn(obj, "key"); // modern, preferred

// Iterate safely
Object.keys(obj)    // own enumerable keys
Object.values(obj)  // own enumerable values
Object.entries(obj) // own enumerable [key, value] pairs

// Freeze (make immutable — shallow)
const config = Object.freeze({ apiUrl: "/api", timeout: 5000 });
config.apiUrl = "changed"; // silently fails in non-strict mode

// Computed property names
const field = "email";
const user = { [field]: "a@b.com" }; // { email: "a@b.com" }

// Optional chaining — safe deep access
const city = user?.address?.city ?? "Unknown";`,
      },
      {
        type: "callout",
        calloutType: "warning",
        content: "typeof null === 'object' is a historic bug in JavaScript. Always use value === null to check for null, not typeof.",
      },
      {
        type: "quiz",
        question: "What does `Object.keys(obj)` return for inherited properties?",
        options: [
          { text: "It includes inherited enumerable properties", correct: false, explanation: "That's what for...in does. Object.keys only looks at own properties." },
          { text: "It only returns own enumerable properties", correct: true, explanation: "Object.keys ignores the prototype chain. Use for...in if you need inherited properties too (but you rarely do)." },
          { text: "It includes all own properties including non-enumerable", correct: false, explanation: "Non-enumerable properties (like Object.prototype methods) are excluded. Use Object.getOwnPropertyNames() for those." },
          { text: "It returns Symbol keys too", correct: false, explanation: "Object.keys only returns string keys. Use Object.getOwnPropertySymbols() for Symbol keys." },
        ],
      },
      {
        type: "keypoints",
        title: "Remember these",
        points: [
          "Objects are optimized hash maps — consistent shapes = faster V8",
          "Never delete properties in hot paths — use null/undefined instead",
          "Prototype chain: own props first, then __proto__, until null",
          "hasOwnProperty / Object.hasOwn checks only own props (no chain)",
          "Optional chaining (?.) and nullish coalescing (??) are your friends for safe access",
        ],
      },
    ],
  },

  // ─── Day 4: Prefix Sum ───────────────────────────────────────────────────────
  "day-4": {
    id: "day-4",
    title: "Prefix Sum — Answer Range Queries in O(1)",
    tldr: "Pre-compute a running sum array once in O(n). Then answer any 'sum from i to j' query in O(1) instead of O(n). Shows up constantly in interviews.",
    readTime: "6 min",
    sections: [
      {
        type: "concept",
        title: "The problem",
        content: "You have an array of numbers and thousands of queries: 'what is the sum of elements from index 2 to index 7?'. Brute force: loop through each time → O(n) per query. Prefix sum: pre-process once → O(1) per query.",
      },
      {
        type: "visual",
        title: "Building the prefix sum array",
        content: `Original: [3, 1, 4, 1, 5, 9, 2, 6]
Index:      0  1  2  3  4  5  6  7

prefix[0] = 3
prefix[1] = 3 + 1 = 4
prefix[2] = 4 + 4 = 8
prefix[3] = 8 + 1 = 9
prefix[4] = 9 + 5 = 14
prefix[5] = 14 + 9 = 23
prefix[6] = 23 + 2 = 25
prefix[7] = 25 + 6 = 31

Prefix:   [3, 4, 8, 9, 14, 23, 25, 31]

Sum from index 2 to 5:
= prefix[5] - prefix[1]
= 23 - 4
= 19 ✅  (4+1+5+9 = 19)`,
      },
      {
        type: "code",
        title: "Implementation",
        language: "javascript",
        code: `// Build prefix sum — O(n) once
function buildPrefix(nums) {
  const prefix = new Array(nums.length);
  prefix[0] = nums[0];
  for (let i = 1; i < nums.length; i++) {
    prefix[i] = prefix[i - 1] + nums[i];
  }
  return prefix;
}

// Range sum query — O(1) per query
function rangeSum(prefix, left, right) {
  if (left === 0) return prefix[right];
  return prefix[right] - prefix[left - 1];
}

// Usage
const nums = [3, 1, 4, 1, 5, 9, 2, 6];
const prefix = buildPrefix(nums);

rangeSum(prefix, 2, 5); // 19 (4+1+5+9)
rangeSum(prefix, 0, 3); // 9  (3+1+4+1)`,
      },
      {
        type: "callout",
        calloutType: "insight",
        content: "The pattern extends beyond sums — you can build prefix arrays for XOR, products, counts of specific values, etc. Same O(1) query idea.",
      },
      {
        type: "code",
        title: "Real interview use: subarray sum equals k",
        language: "javascript",
        code: `// LeetCode #560 — how many subarrays sum to k?
// Key insight: if prefix[j] - prefix[i] === k, subarray [i+1..j] sums to k

function subarraySum(nums, k) {
  const counts = new Map([[0, 1]]); // prefixSum → how many times seen
  let sum = 0;
  let result = 0;

  for (const n of nums) {
    sum += n;
    // Have we seen a prefix that, when subtracted, gives k?
    result += counts.get(sum - k) ?? 0;
    counts.set(sum, (counts.get(sum) ?? 0) + 1);
  }

  return result;
}`,
      },
      {
        type: "quiz",
        question: "Array: [1, 2, 3, 4, 5]. Prefix sum = [1, 3, 6, 10, 15].\nWhat is the sum from index 1 to 3?",
        options: [
          { text: "9", correct: true, explanation: "prefix[3] - prefix[0] = 10 - 1 = 9. Elements: 2+3+4 = 9 ✓" },
          { text: "10", correct: false, explanation: "prefix[3] = 10 is the sum from 0 to 3, not 1 to 3." },
          { text: "6", correct: false, explanation: "prefix[2] = 6 is the sum from 0 to 2 (indices 0,1,2)." },
          { text: "7", correct: false, explanation: "Subtract prefix[left-1] from prefix[right]: prefix[3] - prefix[0] = 10 - 1 = 9." },
        ],
      },
      {
        type: "keypoints",
        title: "Remember these",
        points: [
          "prefix[i] = sum of all elements from index 0 to i",
          "rangeSum(l, r) = prefix[r] - prefix[l-1]  (handle l=0 as edge case)",
          "Build once O(n), query in O(1)",
          "Use a Map of prefix sums to find subarrays with target sum",
          "LeetCode practice: #303, #304, #560, #974",
        ],
      },
    ],
  },

  // ─── Day 5: Map & Set ─────────────────────────────────────────────────────────
  "day-5": {
    id: "day-5",
    title: "Map & Set — The Right Tool for Lookup Problems",
    tldr: "If you're using an array to check 'have I seen this before?', you're doing O(n) work on every check. Set does it in O(1). Map does key→value in O(1). These two structures solve half of all interview problems.",
    readTime: "7 min",
    sections: [
      {
        type: "concept",
        title: "Why not just use an object {}?",
        content: "Objects work as key-value stores, but: keys must be strings/Symbols (Map allows any type), objects have inherited prototype properties that can collide, objects don't have a reliable .size, and iterating objects is messier. Use Map when you need a data structure, {} when you need a record.",
      },
      {
        type: "code",
        title: "Set — the 'have I seen this?' tool",
        language: "javascript",
        code: `const set = new Set();

// Core operations — all O(1)
set.add(42);
set.add("hello");
set.add({ id: 1 }); // objects by reference

set.has(42);     // true  — O(1) lookup ← this is the whole point
set.has(99);     // false
set.delete(42);  // removes it
set.size;        // 2

// Most common use: deduplication
const arr = [1, 2, 2, 3, 3, 3, 4];
const unique = [...new Set(arr)]; // [1, 2, 3, 4]

// Check for duplicates
const hasDup = arr.length !== new Set(arr).size; // true

// Intersection of two arrays
const a = new Set([1, 2, 3, 4]);
const b = new Set([3, 4, 5, 6]);
const intersection = [...a].filter(x => b.has(x)); // [3, 4]`,
      },
      {
        type: "code",
        title: "Map — the ordered key→value store",
        language: "javascript",
        code: `const map = new Map();

// Any type as key — unlike objects
map.set("name", "Arjun");
map.set(42, "the answer");
map.set(true, "boolean key!");
map.set({ id: 1 }, "object as key");

// Core operations — all O(1)
map.get("name");  // "Arjun"
map.has(42);      // true
map.delete(42);
map.size;         // 3

// Frequency counter — the most common interview pattern
function charFrequency(s) {
  const freq = new Map();
  for (const ch of s) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }
  return freq;
}
charFrequency("banana");
// Map { 'b' → 1, 'a' → 3, 'n' → 2 }

// Iteration is ordered (insertion order)
for (const [key, val] of map) {
  console.log(key, val);
}`,
      },
      {
        type: "callout",
        calloutType: "tip",
        content: "The pattern `map.get(key) ?? 0` is your go-to for counting. It reads: 'get existing count, or 0 if not seen yet, then add 1'.",
      },
      {
        type: "visual",
        title: "Object vs Map — which to use",
        content: `Use {}  when:
  ✓ You know the keys at write time (config, records)
  ✓ Keys are strings/identifiers
  ✓ You're returning data as JSON

Use Map when:
  ✓ Keys are dynamic / computed at runtime
  ✓ Keys aren't strings (numbers, objects)
  ✓ You need .size
  ✓ You need guaranteed insertion order
  ✓ You're doing frequent add/delete`,
      },
      {
        type: "quiz",
        question: "You need to find the first non-repeating character in a string. What's the optimal approach?",
        options: [
          { text: "Nested loop: for each char, scan rest of string for duplicates — O(n²)", correct: false, explanation: "This works but is O(n²). With a Map you can do it in O(n)." },
          { text: "Sort the string and compare neighbors — O(n log n)", correct: false, explanation: "Sorting changes positions — you'd lose track of which character appeared first." },
          { text: "Build a frequency Map in O(n), then scan for freq===1 in O(n)", correct: true, explanation: "Two passes: count frequencies (O(n)), then find first with count 1 (O(n)). Total O(n). This is LeetCode #387." },
          { text: "Use a Set to collect unique chars — O(n)", correct: false, explanation: "A Set can't tell you if something appeared once vs multiple times — use a Map to count." },
        ],
      },
      {
        type: "keypoints",
        title: "Remember these",
        points: [
          "Set.has() is O(1) — use it instead of Array.includes() which is O(n)",
          "Map allows any type as key, preserves insertion order, has .size",
          "`map.get(key) ?? 0` is the frequency counter pattern",
          "new Set(arr) removes duplicates; arr.length !== new Set(arr).size = has duplicates",
          "Prefer Map over {} when building data structures dynamically",
        ],
      },
    ],
  },

  // ─── Day 6: Two Pointers ──────────────────────────────────────────────────────
  "day-6": {
    id: "day-6",
    title: "Two Pointers — Eliminate the Inner Loop",
    tldr: "Two pointers let you process an array from both ends simultaneously — turning O(n²) brute force into O(n). Three patterns: opposite ends, same direction (fast/slow), and sliding window.",
    readTime: "8 min",
    sections: [
      {
        type: "concept",
        title: "Why it works",
        content: "Brute force on sorted arrays: try every pair with two nested loops → O(n²). Two pointers: start from both ends, move towards each other based on the sum vs target. Each step eliminates an entire row/column of possibilities. This only works because the array is sorted (or has a monotonic property).",
      },
      {
        type: "visual",
        title: "Pattern 1: Opposite ends (Two Sum — sorted array)",
        content: `Target = 9, Array = [1, 2, 4, 6, 8, 9]
                                      ↑                 ↑
                                     left              right

Step 1: 1 + 9 = 10 > 9  → move right left
Step 2: 1 + 8 = 9  = 9  → FOUND! [0, 4]

Each step, we KNOW:
  sum too big  → right pointer can't work with anything → move right left
  sum too small → left pointer can't work with anything → move left right

No element is visited twice → O(n)`,
      },
      {
        type: "code",
        title: "Pattern 1: Two Sum (sorted) + Container With Most Water",
        language: "javascript",
        code: `// Two Sum on sorted array — O(n)
function twoSumSorted(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === target) return [left, right];
    sum < target ? left++ : right--;
  }
  return [];
}

// Container with most water (LeetCode #11) — same pattern
function maxArea(heights) {
  let left = 0, right = heights.length - 1;
  let max = 0;
  while (left < right) {
    const area = Math.min(heights[left], heights[right]) * (right - left);
    max = Math.max(max, area);
    // Move the shorter wall — moving the taller one can only decrease area
    heights[left] < heights[right] ? left++ : right--;
  }
  return max;
}`,
      },
      {
        type: "visual",
        title: "Pattern 2: Fast/Slow pointers (Floyd's Cycle Detection)",
        content: `Linked list:  1 → 2 → 3 → 4 → 5 → 3 (cycle!)

slow moves 1 step, fast moves 2 steps:

Start: slow=1, fast=1
Step 1: slow=2, fast=3
Step 2: slow=3, fast=5
Step 3: slow=4, fast=4   ← they meet! cycle detected.

If no cycle: fast reaches null → no cycle.
If cycle: fast laps slow → they meet inside the cycle.`,
      },
      {
        type: "code",
        title: "Pattern 2: Fast/Slow — cycle detection + find middle",
        language: "javascript",
        code: `// Detect cycle — O(n) time, O(1) space
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}

// Find middle of linked list — same pattern
function findMiddle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow; // slow is at middle when fast reaches end
}`,
      },
      {
        type: "callout",
        calloutType: "insight",
        content: "The key question for opposite-end pointers: 'If I move this pointer, can I definitively eliminate it from consideration?' If yes → two pointers works. This requires a sorted/monotonic property.",
      },
      {
        type: "quiz",
        question: "You have a sorted array and want to find all pairs that sum to a target. Two pointers gives O(n). Why can't you use two pointers on an UNSORTED array for the same problem?",
        options: [
          { text: "You can — two pointers works on any array", correct: false, explanation: "Wrong. On an unsorted array, moving left++ or right-- doesn't tell you anything predictable about the sum." },
          { text: "Because you can't decide which pointer to move — both directions are unpredictable", correct: true, explanation: "Exactly. On a sorted array, sum too big → right pointer is too large → move it left. This logic breaks on unsorted arrays since there's no guarantee about direction." },
          { text: "Because the array might have duplicates", correct: false, explanation: "Duplicates can be handled in either case. The issue is sortedness, not duplicates." },
          { text: "Two pointers is O(n²) on sorted arrays too", correct: false, explanation: "Two pointers on a sorted array is O(n) — each pointer moves at most n times total." },
        ],
      },
      {
        type: "keypoints",
        title: "Remember these",
        points: [
          "Opposite ends: requires sorted/monotonic property to decide which pointer to move",
          "Fast/slow: detects cycles in O(n) time O(1) space — also finds middle",
          "Two pointers never revisit elements → always O(n)",
          "Trigger: sorted array + find pair/triplet, OR linked list cycle/middle",
          "LeetCode: #167, #11, #141, #876, #15 (3Sum — sort first, then two pointers)",
        ],
      },
    ],
  },

  // ─── Day 7: Arrays & Strings Review ──────────────────────────────────────────
  "day-7": {
    id: "day-7",
    title: "Week 1 Recap — Arrays & Strings Pattern Map",
    tldr: "You've covered Big-O, sliding window, prefix sum, Map/Set, and two pointers. This is the foundation every other algorithm pattern builds on. Here's how to recognize which one to reach for.",
    readTime: "8 min",
    sections: [
      {
        type: "concept",
        title: "The decision tree",
        content: "In interviews you'll have 20-25 minutes. The first 5 should be pattern recognition. Read the problem → identify the constraints → pick the right tool. Here's how this week's patterns map to problem types.",
      },
      {
        type: "visual",
        title: "Pattern recognition guide",
        content: `PROBLEM SAYS...              → THINK...

"find pair/triplet summing to X"  → Two pointers (sort first)
"contiguous subarray, max/min"    → Sliding window
"sum of range [i..j] queries"     → Prefix sum
"have I seen this before?"        → Set (O(1) lookup)
"count occurrences of X"          → Map (frequency counter)
"cycle in linked list"            → Fast/slow pointers
"find kth smallest/largest"       → Min-heap or QuickSelect
"nested loop is O(n²), make O(n)" → Hash map (trade space for time)`,
      },
      {
        type: "code",
        title: "The universal optimization move: hash map",
        language: "javascript",
        code: `// Almost any O(n²) can become O(n) with a hash map.
// The idea: store things you've seen, look them up in O(1).

// O(n²) — brute force Two Sum
for (let i = 0; i < n; i++)
  for (let j = i+1; j < n; j++)
    if (nums[i] + nums[j] === target) return [i, j];

// O(n) — hash map Two Sum
const seen = new Map();
for (let i = 0; i < nums.length; i++) {
  const complement = target - nums[i];
  if (seen.has(complement)) return [seen.get(complement), i];
  seen.set(nums[i], i);
}

// The pattern: instead of "for each element, scan for its partner"
// do: "for each element, check if its partner was already seen"`,
      },
      {
        type: "callout",
        calloutType: "tip",
        content: "When you see O(n²) in your brute force, ask: 'What am I looking for on the inner loop? Can I pre-store that and look it up in O(1)?' If yes → hash map. This single move solves dozens of problems.",
      },
      {
        type: "quiz",
        question: "Given an array of integers, find all triplets [a, b, c] such that a + b + c = 0. What's the best approach?",
        options: [
          { text: "Three nested loops — O(n³)", correct: false, explanation: "Correct result, terrible complexity. With 1000 elements that's a billion operations." },
          { text: "Sort, then for each element use two pointers on the rest — O(n²)", correct: true, explanation: "Sort O(n log n), then outer loop O(n) × inner two-pointer O(n) = O(n²). This is the optimal solution for 3Sum (LeetCode #15)." },
          { text: "Hash map reduces it to O(n)", correct: false, explanation: "Hash map can reduce Two Sum to O(n), but 3Sum stays at O(n²) minimum since you need to enumerate pairs." },
          { text: "Sliding window — O(n)", correct: false, explanation: "Sliding window works on contiguous subarrays. Finding triplets doesn't have the contiguity constraint." },
        ],
      },
      {
        type: "keypoints",
        title: "The week 1 cheat sheet",
        points: [
          "O(1): hash lookup, array access by index",
          "O(log n): binary search, balanced BST",
          "O(n): single loop, two pointers, sliding window, prefix sum build",
          "O(n log n): sort — often worth it as a first step",
          "O(n²): nested loops — look for hash map or two pointer optimization",
          "Every O(n²) brute force has an O(n) or O(n log n) solution using the right data structure",
        ],
      },
    ],
  },
};

// Fill remaining days 8-30 with concise versions
const STUB_TOPICS: Record<string, { title: string; tldr: string; topic: string }> = {
  "day-8":  { title: "Linked Lists — Reversal & Pointer Manipulation", tldr: "Reversing a linked list is about managing three pointers: prev, curr, next. Draw it out every time.", topic: "linked-lists" },
  "day-9":  { title: "Floyd's Cycle Detection — Tortoise & Hare", tldr: "Two pointers at different speeds guarantee a meeting point inside any cycle. Mathematical proof makes it O(n) time O(1) space.", topic: "linked-lists" },
  "day-10": { title: "Merging Sorted Lists — The Two-Pointer Merge", tldr: "Compare heads, advance the smaller. Recurse or iterate — both work. This is the core of merge sort.", topic: "linked-lists" },
  "day-11": { title: "Stacks — LIFO and the Bracket Matching Pattern", tldr: "A stack remembers context: what was open, what's waiting to be closed. Every valid bracket problem is a stack problem.", topic: "stacks" },
  "day-12": { title: "Min Stack — O(1) getMin with a Parallel Stack", tldr: "Maintain a second stack of minimums. Push current min whenever you push to the main stack.", topic: "stacks" },
  "day-13": { title: "Monotonic Stack — The Next Greater Element Pattern", tldr: "Keep a stack of candidates. Pop when you find something greater. Processes each element once → O(n).", topic: "stacks" },
  "day-15": { title: "Binary Trees — DFS Traversals (In/Pre/Post Order)", tldr: "All three traversals are the same recursion, just different print positions: left=in, root=pre, right=post.", topic: "trees" },
  "day-16": { title: "BFS — Level Order Traversal with a Queue", tldr: "Queue holds the current level. Process all nodes at depth d before moving to depth d+1.", topic: "trees" },
  "day-17": { title: "BST — Validation with Min/Max Bounds", tldr: "Validate BST by passing down allowed ranges. Left child must be < node, right must be > node — propagate these constraints.", topic: "trees" },
  "day-18": { title: "Backtracking — The Explore-and-Undo Pattern", tldr: "Choose → explore → unchoose. Backtracking systematically tries all possibilities by undoing state after each branch.", topic: "recursion" },
  "day-19": { title: "Permutations — Swap-in-Place Backtracking", tldr: "Swap element to current position, recurse on rest, swap back. Generates all permutations in O(n!) time.", topic: "recursion" },
  "day-20": { title: "Binary Search — Beyond Sorted Arrays", tldr: "Binary search works on any monotonic function. The key insight: use it on the answer space, not just the input array.", topic: "binary-search" },
  "day-22": { title: "Merge Sort — Divide, Sort, Merge", tldr: "Split in half recursively until size 1, then merge sorted halves. O(n log n) guaranteed. Extra O(n) space.", topic: "sorting" },
  "day-23": { title: "Quick Sort — Partition and Conquer", tldr: "Pick a pivot, partition around it, recurse. O(n log n) average, O(n²) worst case. In-place unlike merge sort.", topic: "sorting" },
  "day-24": { title: "Graphs — BFS for Shortest Path, DFS for Connectivity", tldr: "Represent as adjacency list. BFS guarantees shortest path in unweighted graphs. DFS explores deeply — good for cycles and components.", topic: "graphs" },
  "day-25": { title: "Graph Cloning — DFS with a Visited Map", tldr: "Map old node → new node. If already cloned (in map), return clone. Otherwise create, add to map, clone neighbors.", topic: "graphs" },
  "day-26": { title: "Dynamic Programming — Overlapping Subproblems", tldr: "DP = recursion + caching. If you solve the same subproblem twice, cache it. Climbing stairs = fibonacci with DP.", topic: "dp" },
  "day-27": { title: "House Robber — 1D DP State Machine", tldr: "dp[i] = max(rob house i + dp[i-2], skip house i = dp[i-1]). Compress to two variables — O(1) space.", topic: "dp" },
};

for (const [dayId, stub] of Object.entries(STUB_TOPICS)) {
  ARTICLES[dayId] = {
    id: dayId,
    title: stub.title,
    tldr: stub.tldr,
    readTime: "5 min",
    sections: [
      {
        type: "callout",
        calloutType: "insight",
        content: stub.tldr,
      },
      {
        type: "concept",
        title: "Core concept",
        content: `This is Day ${dayId.replace("day-", "")} of Month 1. Full interactive content coming — for now, work through today's LeetCode problem and come back to read the solution explanation.`,
      },
      {
        type: "keypoints",
        title: "Key things to know",
        points: [
          stub.tldr,
          "Work through the LeetCode problem in the task above first",
          "Compare your solution with the official explanation after",
          "The pattern here connects to what you learned in previous days",
        ],
      },
    ],
  };
}

export function getArticle(dayNumber: number): Article | null {
  return ARTICLES[`day-${dayNumber}`] ?? null;
}

