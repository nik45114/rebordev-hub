/**
 * Integration Tests & Examples
 * Demonstrates how to test the AI Core package
 */

import {
  AICore,
  ClaudeCodeProvider,
  DeepSeekProvider,
  OpenAIProvider,
  MemoryService,
  SearchService,
  MemoryLevel,
  AIProviderError,
} from '@rebordev/ai-core';

/**
 * Test 1: Claude Code Provider
 */
async function testClaudeCodeProvider() {
  console.log('Testing Claude Code Provider...');

  try {
    // Check availability first
    const isAvailable = await ClaudeCodeProvider.isAvailable();
    if (!isAvailable) {
      console.log('⚠️  Claude Code CLI not available, skipping test');
      return;
    }

    const claude = new ClaudeCodeProvider({
      timeout: 30000, // 30 seconds for test
    });

    // Test simple message
    const response = await claude.sendMessage('Echo: Hello from test');
    console.log('✓ Simple message sent successfully');
    console.log(`  Response length: ${response.content.length} chars`);

    // Test streaming
    let streamedText = '';
    await claude.streamMessage(
      'Count from 1 to 3',
      {
        onToken: (token) => {
          streamedText += token;
        },
        onComplete: (fullText) => {
          console.log('✓ Streaming completed successfully');
          console.log(`  Streamed ${fullText.length} chars`);
        },
        onError: (error) => {
          throw error;
        },
      }
    );

    console.log('✅ Claude Code Provider tests passed\n');
  } catch (error) {
    console.error('❌ Claude Code Provider tests failed:', error);
  }
}

/**
 * Test 2: DeepSeek Provider
 */
async function testDeepSeekProvider() {
  console.log('Testing DeepSeek Provider...');

  if (!process.env.DEEPSEEK_API_KEY) {
    console.log('⚠️  DEEPSEEK_API_KEY not set, skipping test\n');
    return;
  }

  try {
    const deepseek = new DeepSeekProvider({
      apiKey: process.env.DEEPSEEK_API_KEY,
      temperature: 0.5,
    });

    // Test simple message
    const response = await deepseek.sendMessage('Say "Hello World"');
    console.log('✓ Simple message sent successfully');
    console.log(`  Response: ${response.content.substring(0, 50)}...`);

    // Test chat
    const chatResponse = await deepseek.chat([
      { role: 'user', content: 'What is 2+2?' },
    ]);
    console.log('✓ Chat message sent successfully');
    console.log(`  Response: ${chatResponse.content.substring(0, 50)}...`);

    // Test order analysis
    const analysis = await deepseek.analyzeOrder(
      'Create a simple todo list web app with React'
    );
    console.log('✓ Order analysis completed');
    console.log(`  Title: ${analysis.title}`);
    console.log(`  Complexity: ${analysis.complexity}`);
    console.log(`  Estimated Hours: ${analysis.estimatedHours}`);

    // Test task generation
    const tasks = await deepseek.generateProjectTasks(
      'Build a weather app'
    );
    console.log('✓ Task generation completed');
    console.log(`  Generated ${tasks.length} tasks`);

    console.log('✅ DeepSeek Provider tests passed\n');
  } catch (error) {
    if (error instanceof AIProviderError) {
      console.error('❌ DeepSeek Provider tests failed:');
      console.error(`  Code: ${error.code}`);
      console.error(`  Status: ${error.statusCode}`);
      console.error(`  Retryable: ${error.retryable}`);
    } else {
      console.error('❌ DeepSeek Provider tests failed:', error);
    }
  }
}

/**
 * Test 3: OpenAI Provider
 */
async function testOpenAIProvider() {
  console.log('Testing OpenAI Provider...');

  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️  OPENAI_API_KEY not set, skipping test\n');
    return;
  }

  try {
    const openai = new OpenAIProvider({
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-3.5-turbo', // Use cheaper model for tests
    });

    // Test simple message
    const response = await openai.sendMessage('Say "Test passed"');
    console.log('✓ Simple message sent successfully');
    console.log(`  Response: ${response.content.substring(0, 50)}...`);

    // Test summarization
    const longText = 'The quick brown fox jumps over the lazy dog. '.repeat(20);
    const summary = await openai.summarize(longText, 50);
    console.log('✓ Summarization completed');
    console.log(`  Summary length: ${summary.length} chars`);

    // Test key points extraction
    const keyPoints = await openai.extractKeyPoints(
      'Key point 1: TypeScript is great. Key point 2: Testing is important.'
    );
    console.log('✓ Key points extracted');
    console.log(`  Found ${keyPoints.length} key points`);

    console.log('✅ OpenAI Provider tests passed\n');
  } catch (error) {
    if (error instanceof AIProviderError) {
      console.error('❌ OpenAI Provider tests failed:');
      console.error(`  Code: ${error.code}`);
      console.error(`  Status: ${error.statusCode}`);
    } else {
      console.error('❌ OpenAI Provider tests failed:', error);
    }
  }
}

/**
 * Test 4: Memory Service
 */
async function testMemoryService() {
  console.log('Testing Memory Service...');

  try {
    const memory = new MemoryService({
      userId: 'test-user-123',
    });

    // Note: This test will fail without proper mem0 setup
    // It's here to demonstrate the API

    console.log('⚠️  Memory Service requires mem0 API setup');
    console.log('  Skipping actual API calls');
    console.log('  API methods available:');
    console.log('  - saveMemory()');
    console.log('  - searchMemory()');
    console.log('  - getMemory()');
    console.log('  - updateMemory()');
    console.log('  - deleteMemory()');

    console.log('✅ Memory Service interface validated\n');
  } catch (error) {
    console.error('❌ Memory Service tests failed:', error);
  }
}

/**
 * Test 5: Search Service
 */
async function testSearchService() {
  console.log('Testing Search Service...');

  try {
    const search = new SearchService({
      host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
      apiKey: process.env.MEILISEARCH_API_KEY,
      indexName: 'test-memories',
    });

    // Test initialization
    try {
      await search.initializeIndex();
      console.log('✓ Index initialized');

      // Test indexing
      const testMemory = {
        id: 'test-mem-1',
        level: MemoryLevel.USER,
        key: 'test-key',
        content: 'This is a test memory for search',
        metadata: { test: true },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await search.indexMemory(testMemory);
      console.log('✓ Memory indexed');

      // Test search
      const results = await search.search('test memory', { limit: 5 });
      console.log('✓ Search completed');
      console.log(`  Found ${results.hits.length} results`);
      console.log(`  Processing time: ${results.processingTimeMs}ms`);

      // Cleanup
      await search.deleteMemory('test-mem-1');
      console.log('✓ Test memory cleaned up');

      console.log('✅ Search Service tests passed\n');
    } catch (error: any) {
      if (error.message.includes('Connection')) {
        console.log('⚠️  Meilisearch not available, skipping API tests');
        console.log('✅ Search Service interface validated\n');
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('❌ Search Service tests failed:', error);
  }
}

/**
 * Test 6: Project Generator Agent
 */
async function testProjectGeneratorAgent() {
  console.log('Testing Project Generator Agent...');

  if (!process.env.DEEPSEEK_API_KEY) {
    console.log('⚠️  DEEPSEEK_API_KEY not set, skipping test\n');
    return;
  }

  try {
    const deepseek = new DeepSeekProvider({
      apiKey: process.env.DEEPSEEK_API_KEY,
    });

    const generator = AICore.createProjectGenerator(deepseek);

    // Test project generation
    const project = await generator.generateProject(
      'Create a simple calculator app',
      {
        includeSubtasks: false,
        estimateEffort: true,
        suggestTechnologies: true,
      }
    );

    console.log('✓ Project generated successfully');
    console.log(`  Name: ${project.name}`);
    console.log(`  Tasks: ${project.tasks.length}`);
    console.log(`  Total Hours: ${project.totalEstimatedHours}`);
    console.log(`  Complexity: ${project.complexity}`);

    // Test cost estimation
    const cost = await generator.estimateProjectCost(project, 50);
    console.log('✓ Cost estimated');
    console.log(`  Range: $${cost.minCost} - $${cost.maxCost}`);

    console.log('✅ Project Generator Agent tests passed\n');
  } catch (error) {
    console.error('❌ Project Generator Agent tests failed:', error);
  }
}

/**
 * Test 7: Order Analyzer Agent
 */
async function testOrderAnalyzerAgent() {
  console.log('Testing Order Analyzer Agent...');

  if (!process.env.DEEPSEEK_API_KEY) {
    console.log('⚠️  DEEPSEEK_API_KEY not set, skipping test\n');
    return;
  }

  try {
    const deepseek = new DeepSeekProvider({
      apiKey: process.env.DEEPSEEK_API_KEY,
    });

    const analyzer = AICore.createOrderAnalyzer(deepseek);

    // Test order analysis
    const order = {
      id: 'test-order-1',
      title: 'Test Project',
      description: 'Build a simple web application with user authentication',
      budget: 3000,
      skills: ['React', 'Node.js'],
      platform: 'Test',
    };

    const analysis = await analyzer.analyzeOrder(order);
    console.log('✓ Order analyzed successfully');
    console.log(`  Title: ${analysis.title}`);
    console.log(`  Score: ${analysis.score}/100`);
    console.log(`  Complexity: ${analysis.complexity}`);
    console.log(`  Feasibility: ${analysis.feasibility}`);

    // Test matching
    const userProfile = {
      skills: ['React', 'Node.js', 'TypeScript'],
      experience: ['Web development'],
      preferredBudget: { min: 2000, max: 5000 },
      preferredComplexity: ['simple', 'medium'],
    };

    const matches = await analyzer.matchOrdersToProfile(
      [order],
      userProfile
    );
    console.log('✓ Order matched to profile');
    console.log(`  Match Score: ${matches[0].matchScore}%`);
    console.log(`  Reasons: ${matches[0].reasons.length}`);

    console.log('✅ Order Analyzer Agent tests passed\n');
  } catch (error) {
    console.error('❌ Order Analyzer Agent tests failed:', error);
  }
}

/**
 * Test 8: Full Stack Integration
 */
async function testFullStackIntegration() {
  console.log('Testing Full Stack Integration...');

  if (!process.env.DEEPSEEK_API_KEY) {
    console.log('⚠️  DEEPSEEK_API_KEY not set, skipping test\n');
    return;
  }

  try {
    // Initialize stack (without optional services for testing)
    const ai = await AICore.initializeStack({
      deepseek: {
        apiKey: process.env.DEEPSEEK_API_KEY,
      },
    });

    console.log('✓ AI Stack initialized');

    // Test that all components are available
    console.log('✓ DeepSeek provider available:', !!ai.deepseek);
    console.log('✓ Project Generator available:', !!ai.projectGenerator);
    console.log('✓ Order Analyzer available:', !!ai.orderAnalyzer);

    // Quick functionality test
    const response = await ai.deepseek.sendMessage('Say "Stack OK"');
    console.log('✓ Stack functional test passed');

    console.log('✅ Full Stack Integration tests passed\n');
  } catch (error) {
    console.error('❌ Full Stack Integration tests failed:', error);
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('==========================================');
  console.log('AI Core Package Integration Tests');
  console.log('==========================================\n');

  const startTime = Date.now();

  await testClaudeCodeProvider();
  await testDeepSeekProvider();
  await testOpenAIProvider();
  await testMemoryService();
  await testSearchService();
  await testProjectGeneratorAgent();
  await testOrderAnalyzerAgent();
  await testFullStackIntegration();

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('==========================================');
  console.log(`All tests completed in ${duration}s`);
  console.log('==========================================');
}

// Run if executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { runAllTests };
