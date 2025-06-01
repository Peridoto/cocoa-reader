/**
 * Simple article addition script with better error handling
 */

async function addTestArticles() {
  console.log('📝 Adding test articles...\n');

  const articles = [
    {
      url: "https://example.com/react-tutorial",
      title: "React Hooks Tutorial: useState and useEffect",
      textContent: `React Hooks have revolutionized how we write React components. In this comprehensive guide, we'll explore the two most fundamental hooks: useState and useEffect.

The useState hook allows you to add state to functional components. Previously, you had to convert your functional component to a class component to use state. Now, with useState, you can keep your components functional while still managing state.

Here's how useState works: you call useState with an initial value, and it returns an array with two elements. The first element is the current state value, and the second is a function to update that state.

The useEffect hook is equally important. It lets you perform side effects in functional components. Side effects include data fetching, setting up subscriptions, and manually changing the DOM in React components.

useEffect serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount combined in React class components. By using this hook, you tell React that your component needs to do something after render.

One of the key benefits of hooks is that they allow you to organize side effects by what pieces of functionality they're related to, rather than forcing a split based on lifecycle methods.

React Hooks follow two important rules: only call hooks at the top level of React functions, and only call hooks from React functions or custom hooks. These rules ensure that hooks are called in the same order every time the component renders.

Understanding and mastering React Hooks is essential for modern React development. They provide a more direct API to the React concepts you already know and make your code more reusable and easier to test.`,
      excerpt: "Learn the fundamentals of React Hooks including useState and useEffect for modern functional component development.",
      domain: "example.com"
    },
    {
      url: "https://techblog.com/machine-learning-basics",
      title: "Machine Learning Fundamentals for Developers",
      textContent: `Machine learning has become an essential skill for developers in today's technology landscape. Understanding the fundamentals can help you build smarter applications and make data-driven decisions.

At its core, machine learning is about creating algorithms that can learn patterns from data without being explicitly programmed for every scenario. There are three main types of machine learning: supervised learning, unsupervised learning, and reinforcement learning.

Supervised learning uses labeled training data to learn a mapping from inputs to outputs. Common examples include email spam detection, image classification, and price prediction. The algorithm learns from examples where both the input and the correct output are provided.

Unsupervised learning finds hidden patterns in data without labeled examples. Clustering customers based on purchasing behavior, reducing data dimensionality, and detecting anomalies are typical unsupervised learning tasks.

Reinforcement learning involves an agent learning to make decisions by taking actions in an environment and receiving rewards or penalties. This approach is used in game playing, robotics, and autonomous systems.

Before diving into complex algorithms, it's crucial to understand your data. Data preprocessing, including cleaning, normalization, and feature selection, often determines the success of your machine learning project more than the choice of algorithm.

Popular machine learning frameworks like TensorFlow, PyTorch, and scikit-learn have made implementing machine learning models more accessible. These tools provide pre-built algorithms and utilities that can significantly speed up development.

The key to successful machine learning projects is starting simple, understanding your problem domain, and iteratively improving your models based on real-world performance and feedback.`,
      excerpt: "Discover machine learning fundamentals including supervised and unsupervised learning, data preprocessing, and popular frameworks for developers.",
      domain: "techblog.com"
    }
  ];

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log(`Adding article ${i + 1}: "${article.title}"`);
    
    try {
      const response = await fetch('http://localhost:3000/api/article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(article),
      });

      const responseText = await response.text();
      
      if (response.ok) {
        const result = JSON.parse(responseText);
        console.log(`   ✅ Success! ID: ${result.article?.id || 'unknown'}`);
      } else {
        console.log(`   ❌ Failed: ${response.status} - ${responseText}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📋 Verifying articles were added...');
  try {
    const response = await fetch('http://localhost:3000/api/articles');
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Total articles in database: ${data.articles.length}`);
      
      data.articles.forEach((article, index) => {
        console.log(`   ${index + 1}. "${article.title}" (Processed: ${article.aiProcessed ? 'Yes' : 'No'})`);
      });
    } else {
      console.log('❌ Failed to verify articles');
    }
  } catch (error) {
    console.log('❌ Error verifying articles:', error.message);
  }
}

addTestArticles();
