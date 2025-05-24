// Quick test to add sample articles and test AI processing
async function addSampleArticle() {
  const sampleArticles = [
    {
      url: "https://example.com/react-hooks-guide",
      title: "Complete Guide to React Hooks",
      textContent: `React Hooks revolutionized how we write React components by allowing us to use state and lifecycle features in functional components. The most fundamental hook is useState, which lets you add state to functional components without converting them to class components.

      useState returns an array with two elements: the current state value and a function to update it. For example, const [count, setCount] = useState(0) creates a state variable called count with an initial value of 0, and setCount is the function to update it.

      Another essential hook is useEffect, which lets you perform side effects in functional components. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount combined in React class components. You can use useEffect to fetch data, set up subscriptions, or manually change the DOM.

      The useContext hook provides a way to consume context without nesting. Instead of wrapping your component in a Consumer, you can call useContext(MyContext) directly in your component function.

      Advanced hooks like useReducer, useCallback, and useMemo give you more control over component behavior and performance. useReducer is an alternative to useState that's more suitable for complex state logic, while useCallback and useMemo help optimize performance by memoizing functions and values.

      When using hooks, there are important rules to follow: always call hooks at the top level of your React function, never inside loops, conditions, or nested functions. This ensures that hooks are called in the same order every time the component renders.

      React Hooks have made functional components much more powerful and have largely replaced class components in modern React development. They promote better code reuse and make it easier to test and reason about your components.`,
      excerpt: "Learn how React Hooks revolutionized functional components with useState, useEffect, and advanced hooks for better state management and performance.",
      domain: "example.com"
    },
    {
      url: "https://example.com/javascript-performance",
      title: "JavaScript Performance Optimization Techniques",
      textContent: `JavaScript performance optimization is crucial for creating fast, responsive web applications. Understanding how the JavaScript engine works and applying best practices can significantly improve your application's speed and user experience.

      One of the most important concepts is avoiding unnecessary DOM manipulations. The DOM is slow, so batch your updates and use techniques like document fragments when adding multiple elements. Instead of modifying the DOM multiple times, collect all changes and apply them at once.

      Memory management is another critical aspect. Avoid memory leaks by properly cleaning up event listeners, clearing timeouts and intervals, and being careful with closures that might prevent garbage collection. Use weak references when appropriate and monitor your application's memory usage.

      Optimize your algorithms and data structures. Choose the right data structure for your use case - arrays for ordered collections, objects for key-value pairs, and Maps/Sets for more complex scenarios. Understand the time complexity of different operations and choose efficient algorithms.

      Leverage browser APIs for better performance. Use requestAnimationFrame for smooth animations, Intersection Observer for efficient scroll handling, and Web Workers for CPU-intensive tasks that shouldn't block the main thread.

      Minimize and optimize your JavaScript bundles. Use tree shaking to remove unused code, code splitting to load only what's needed, and compression to reduce file sizes. Consider using modern JavaScript features that are more performant than their older counterparts.

      Profile your code regularly using browser developer tools. Identify bottlenecks, memory leaks, and performance issues early in development. Use performance monitoring tools in production to track real-world performance metrics.`,
      excerpt: "Master JavaScript performance optimization with DOM manipulation best practices, memory management, algorithm optimization, and browser API utilization.",
      domain: "example.com"
    }
  ];

  for (const article of sampleArticles) {
    try {
      const response = await fetch('http://localhost:3000/api/article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(article),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Added article: ${article.title}`);
        console.log(`   Article ID: ${result.article.id}`);
      } else {
        console.log(`❌ Failed to add article: ${article.title}`);
      }
    } catch (error) {
      console.error(`Error adding article "${article.title}":`, error);
    }
  }
}

addSampleArticle();
