/**
 * Basic Usage Examples
 */

import {
  AICore,
  ClaudeCodeProvider,
  DeepSeekProvider,
  OpenAIProvider,
  MemoryService,
  SearchService,
  MemoryLevel,
} from '@rebordev/ai-core';

/**
 * Example 1: Simple Claude Code CLI usage
 */
async function example1_ClaudeCodeBasic() {
  console.log('=== Example 1: Claude Code Basic ===\n');

  const claude = new ClaudeCodeProvider();

  const response = await claude.sendMessage(
    'List all TypeScript files in the current directory'
  );

  console.log('Response:', response.content);
}

/**
 * Example 2: DeepSeek order analysis
 */
async function example2_DeepSeekAnalysis() {
  console.log('\n=== Example 2: DeepSeek Order Analysis ===\n');

  const deepseek = new DeepSeekProvider({
    apiKey: process.env.DEEPSEEK_API_KEY!,
  });

  const analysis = await deepseek.analyzeOrder(`
    Create a modern e-commerce platform with:
    - User authentication and authorization
    - Product catalog with search and filters
    - Shopping cart and checkout
    - Payment integration (Stripe)
    - Admin dashboard
    - Order management
    - Email notifications
  `);

  console.log('Title:', analysis.title);
  console.log('Complexity:', analysis.complexity);
  console.log('Estimated Hours:', analysis.estimatedHours);
  console.log('Technologies:', analysis.technologies.join(', '));
  console.log('Risks:', analysis.risks);
}

/**
 * Example 3: OpenAI text processing
 */
async function example3_OpenAIProcessing() {
  console.log('\n=== Example 3: OpenAI Text Processing ===\n');

  const openai = new OpenAIProvider({
    apiKey: process.env.OPENAI_API_KEY!,
  });

  const longText = `
    Artificial Intelligence has revolutionized the way we approach problem-solving
    in various domains. Machine learning algorithms can now process vast amounts of
    data to identify patterns and make predictions. Natural Language Processing
    enables computers to understand and generate human language. Computer Vision
    allows machines to interpret visual information from the world around us.
  `;

  // Summarize
  const summary = await openai.summarize(longText, 100);
  console.log('Summary:', summary);

  // Extract key points
  const keyPoints = await openai.extractKeyPoints(longText);
  console.log('\nKey Points:');
  keyPoints.forEach((point, i) => console.log(`${i + 1}. ${point}`));
}

/**
 * Example 4: Memory management with mem0
 */
async function example4_MemoryManagement() {
  console.log('\n=== Example 4: Memory Management ===\n');

  const memory = new MemoryService({
    userId: 'developer-123',
  });

  // Save user preferences
  await memory.saveUserMemory(
    'developer-123',
    'preferences',
    'Prefers TypeScript, React, and functional programming',
    {
      languages: ['TypeScript', 'JavaScript'],
      frameworks: ['React', 'Node.js'],
      paradigm: 'functional',
    }
  );

  // Save project memory
  await memory.saveProjectMemory(
    'project-abc',
    'architecture',
    'Microservices architecture with Docker and Kubernetes',
    {
      architecture: 'microservices',
      containerization: 'Docker',
      orchestration: 'Kubernetes',
    }
  );

  // Search memories
  const results = await memory.searchMemory('TypeScript preferences', {
    level: MemoryLevel.USER,
    userId: 'developer-123',
  });

  console.log('Found memories:', results.length);
  results.forEach((result) => {
    console.log(`- ${result.key}: ${result.content}`);
  });
}

/**
 * Example 5: Full-text search with Meilisearch
 */
async function example5_MeilisearchSearch() {
  console.log('\n=== Example 5: Meilisearch Search ===\n');

  const search = new SearchService({
    host: 'http://localhost:7700',
    apiKey: process.env.MEILISEARCH_API_KEY,
  });

  // Initialize index
  await search.initializeIndex();

  // Index some memories
  const memories = [
    {
      id: 'mem-1',
      level: MemoryLevel.PROJECT,
      key: 'react-project',
      content: 'React project with TypeScript and Material-UI',
      metadata: { tags: ['react', 'typescript'] },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'mem-2',
      level: MemoryLevel.PROJECT,
      key: 'nodejs-api',
      content: 'Node.js REST API with Express and PostgreSQL',
      metadata: { tags: ['nodejs', 'api'] },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await search.indexMemories(memories);

  // Search
  const results = await search.search('React TypeScript', {
    level: MemoryLevel.PROJECT,
    limit: 5,
  });

  console.log(`Found ${results.hits.length} results in ${results.processingTimeMs}ms`);
  results.hits.forEach((hit) => {
    console.log(`- ${hit.key}: ${hit.content}`);
  });
}

/**
 * Example 6: Project generation agent
 */
async function example6_ProjectGenerator() {
  console.log('\n=== Example 6: Project Generator ===\n');

  const ai = await AICore.initializeStack({
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY!,
    },
  });

  const project = await ai.projectGenerator.generateProject(
    'Create a real-time chat application with WebSocket support',
    {
      includeSubtasks: true,
      estimateEffort: true,
      suggestTechnologies: true,
    }
  );

  console.log('Project:', project.name);
  console.log('Description:', project.description);
  console.log('Complexity:', project.complexity);
  console.log('Total Hours:', project.totalEstimatedHours);
  console.log('\nTasks:');
  project.tasks.forEach((task, i) => {
    console.log(`${i + 1}. ${task.title} (${task.estimatedHours}h)`);
    console.log(`   ${task.description}`);
  });
}

/**
 * Example 7: Order analyzer agent
 */
async function example7_OrderAnalyzer() {
  console.log('\n=== Example 7: Order Analyzer ===\n');

  const ai = await AICore.initializeStack({
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY!,
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY!,
    },
  });

  const orders = [
    {
      id: 'order-1',
      title: 'Mobile App Backend',
      description: 'Need REST API for iOS/Android app with authentication',
      budget: 3000,
      skills: ['Node.js', 'MongoDB'],
      platform: 'Upwork',
    },
    {
      id: 'order-2',
      title: 'E-commerce Website',
      description: 'Full-stack e-commerce platform with payment integration',
      budget: 8000,
      skills: ['React', 'Node.js', 'PostgreSQL'],
      platform: 'Freelancer',
    },
  ];

  const userProfile = {
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'PostgreSQL'],
    experience: ['Web development', 'API design', 'Database design'],
    preferredBudget: { min: 2000, max: 10000 },
    preferredComplexity: ['medium', 'complex'],
  };

  const matches = await ai.orderAnalyzer.matchOrdersToProfile(
    orders,
    userProfile
  );

  console.log('Top Matches:\n');
  matches.forEach((match, i) => {
    console.log(`${i + 1}. ${match.order.title}`);
    console.log(`   Match Score: ${match.matchScore}%`);
    console.log(`   Suggested Bid: $${match.analysis.suggestedBid?.toFixed(2)}`);
    console.log(`   Complexity: ${match.analysis.complexity}`);
    console.log(`   Reasons:`);
    match.reasons.forEach((reason) => console.log(`   - ${reason}`));
    console.log();
  });
}

/**
 * Example 8: Streaming responses
 */
async function example8_StreamingResponses() {
  console.log('\n=== Example 8: Streaming Responses ===\n');

  const claude = new ClaudeCodeProvider();

  console.log('Streaming response:\n');

  await claude.streamMessage(
    'Explain the benefits of TypeScript in 3 paragraphs',
    {
      onToken: (token) => process.stdout.write(token),
      onComplete: (fullText) => {
        console.log('\n\nStreaming complete!');
        console.log(`Total length: ${fullText.length} characters`);
      },
      onError: (error) => {
        console.error('Error:', error.message);
      },
    }
  );
}

/**
 * Example 9: Complete workflow
 */
async function example9_CompleteWorkflow() {
  console.log('\n=== Example 9: Complete Workflow ===\n');

  // Initialize full AI stack
  const ai = await AICore.initializeStack({
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY!,
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY!,
    },
    meilisearch: {
      host: 'http://localhost:7700',
      apiKey: process.env.MEILISEARCH_API_KEY,
    },
  });

  // Step 1: Analyze an order
  console.log('Step 1: Analyzing order...');
  const order = {
    id: 'order-999',
    title: 'Social Media Dashboard',
    description: `
      Create a comprehensive social media analytics dashboard that aggregates
      data from multiple platforms (Twitter, Facebook, Instagram). Features:
      - Real-time data updates
      - Custom reports and visualizations
      - User management
      - API integration
      - Responsive design
    `,
    budget: 6000,
    skills: ['React', 'Node.js', 'API Integration'],
    platform: 'Upwork',
  };

  const analysis = await ai.orderAnalyzer.analyzeOrder(order);
  console.log(`Analysis complete: ${analysis.title}`);
  console.log(`Score: ${analysis.score}/100`);
  console.log(`Estimated hours: ${analysis.estimatedHours}`);

  // Step 2: Generate project structure
  console.log('\nStep 2: Generating project structure...');
  const project = await ai.projectGenerator.generateProject(
    order.description,
    {
      includeSubtasks: false,
      estimateEffort: true,
      suggestTechnologies: true,
      saveToMemory: true,
    }
  );
  console.log(`Project generated: ${project.name}`);
  console.log(`Tasks: ${project.tasks.length}`);

  // Step 3: Estimate cost
  console.log('\nStep 3: Estimating project cost...');
  const hourlyRate = 50;
  const cost = await ai.projectGenerator.estimateProjectCost(
    project,
    hourlyRate
  );
  console.log(`Cost range: $${cost.minCost} - $${cost.maxCost}`);
  console.log(`Average: $${cost.averageCost}`);

  // Step 4: Search similar projects
  console.log('\nStep 4: Finding similar projects...');
  const similar = await ai.projectGenerator.searchSimilarProjects(
    'social media analytics',
    3
  );
  console.log(`Found ${similar.length} similar projects`);

  console.log('\nWorkflow complete!');
}

/**
 * Run all examples
 */
async function runExamples() {
  try {
    // Check if Claude Code is available
    const claudeAvailable = await AICore.isClaudeCodeAvailable();
    console.log(`Claude Code CLI available: ${claudeAvailable}\n`);

    // Run examples one by one
    // Uncomment the examples you want to run:

    // await example1_ClaudeCodeBasic();
    // await example2_DeepSeekAnalysis();
    // await example3_OpenAIProcessing();
    // await example4_MemoryManagement();
    // await example5_MeilisearchSearch();
    // await example6_ProjectGenerator();
    // await example7_OrderAnalyzer();
    // await example8_StreamingResponses();
    await example9_CompleteWorkflow();
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run if executed directly
if (require.main === module) {
  runExamples();
}

export {
  example1_ClaudeCodeBasic,
  example2_DeepSeekAnalysis,
  example3_OpenAIProcessing,
  example4_MemoryManagement,
  example5_MeilisearchSearch,
  example6_ProjectGenerator,
  example7_OrderAnalyzer,
  example8_StreamingResponses,
  example9_CompleteWorkflow,
};
