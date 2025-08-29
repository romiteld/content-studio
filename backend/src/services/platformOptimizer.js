const brandConfig = require('../config/brandLock');

// Platform-specific guidelines and limits
const platformGuidelines = {
  linkedin: {
    postLimit: 3000,
    articleLimit: 125000,
    headlineLimit: 220,
    summaryLimit: 2600,
    hashtagLimit: 5,
    bestPractices: [
      'Use professional tone',
      'Include industry insights',
      'Add value-driven content',
      'Use 3-5 relevant hashtags',
      'Include a clear call-to-action',
      'Post during business hours (Tuesday-Thursday, 8-10 AM or 5-6 PM)',
      'Use bullet points for readability',
      'Include statistics and data when possible'
    ],
    forbiddenContent: [
      'Misleading financial advice',
      'Guaranteed returns claims',
      'Unverified statistics',
      'Personal attacks',
      'Spam or repetitive content'
    ]
  },
  facebook: {
    postLimit: 63206,
    optimalLength: '40-80', // Characters for highest engagement
    videoDescLimit: 125,
    hashtagLimit: 2,
    bestPractices: [
      'Keep posts between 40-80 characters for best engagement',
      'Use conversational tone',
      'Include questions to encourage engagement',
      'Add relevant images or videos',
      'Post at optimal times (1-4 PM weekdays)',
      'Use 1-2 hashtags maximum',
      'Include emotional triggers',
      'Make content shareable'
    ],
    forbiddenContent: [
      'Financial scams or schemes',
      'False information',
      'Discriminatory content',
      'Clickbait headlines',
      'Excessive promotional content (20% rule)'
    ]
  },
  twitter: {
    postLimit: 280,
    threadLimit: 25, // tweets per thread
    hashtagLimit: 2,
    imageLimit: 4,
    bestPractices: [
      'Keep tweets concise and punchy',
      'Use 1-2 hashtags maximum',
      'Include mentions for visibility',
      'Post during peak hours (9-10 AM, 7-9 PM)',
      'Use threads for longer content',
      'Include visuals when possible',
      'Engage with replies quickly',
      'Use clear CTAs'
    ],
    forbiddenContent: [
      'Financial advice without disclaimers',
      'Misleading information',
      'Spam or duplicate content',
      'Automated mass replies'
    ]
  },
  instagram: {
    captionLimit: 2200,
    hashtagLimit: 30,
    optimalHashtags: 11,
    bioLimit: 150,
    bestPractices: [
      'Use 9-11 hashtags for optimal reach',
      'Include a mix of popular and niche hashtags',
      'Write engaging first lines (only first 2 lines show)',
      'Use emojis strategically',
      'Include clear CTAs',
      'Post at peak times (11 AM-1 PM, 7-9 PM)',
      'Use Stories for time-sensitive content',
      'Maintain consistent aesthetic'
    ],
    forbiddenContent: [
      'Financial promotions without proper disclaimers',
      'Misleading before/after claims',
      'Copyrighted content without permission',
      'Excessive promotional content'
    ]
  }
};

// Format content for specific platform
function optimizeForPlatform(content, platform, contentType = 'post') {
  const guidelines = platformGuidelines[platform.toLowerCase()];
  
  if (!guidelines) {
    return {
      success: false,
      error: 'Platform not supported',
      supportedPlatforms: Object.keys(platformGuidelines)
    };
  }
  
  // Always ensure CTA to thewell.solutions is included
  let contentWithCTA = content;
  if (!content.includes('thewell.solutions')) {
    contentWithCTA = content + '\n\n🔗 Learn more at https://thewell.solutions';
  }
  
  const optimized = {
    platform: platform,
    originalContent: content,
    optimizedContent: '',
    warnings: [],
    suggestions: [],
    metadata: {}
  };
  
  // Check content length (use contentWithCTA)
  const limit = contentType === 'article' && guidelines.articleLimit ? 
    guidelines.articleLimit : guidelines.postLimit;
    
  if (contentWithCTA.length > limit) {
    optimized.warnings.push(`Content exceeds ${platform} limit of ${limit} characters`);
    optimized.optimizedContent = truncateContent(contentWithCTA, limit, platform);
  } else {
    optimized.optimizedContent = contentWithCTA;
  }
  
  // Add platform-specific optimizations
  switch(platform.toLowerCase()) {
    case 'linkedin':
      optimized.optimizedContent = optimizeLinkedIn(optimized.optimizedContent);
      optimized.metadata = {
        recommendedHashtags: generateHashtags(content, 'professional'),
        bestPostTime: 'Tuesday-Thursday, 8-10 AM or 5-6 PM',
        expectedEngagement: 'Professional discussions and shares'
      };
      break;
      
    case 'facebook':
      optimized.optimizedContent = optimizeFacebook(optimized.optimizedContent);
      optimized.metadata = {
        recommendedHashtags: generateHashtags(content, 'casual', 2),
        bestPostTime: '1-4 PM weekdays',
        expectedEngagement: 'Likes, comments, and shares'
      };
      break;
      
    case 'twitter':
      optimized.optimizedContent = optimizeTwitter(optimized.optimizedContent);
      optimized.metadata = {
        recommendedHashtags: generateHashtags(content, 'trending', 2),
        threadSuggestion: content.length > 280 ? createThreadStrategy(content) : null,
        bestPostTime: '9-10 AM or 7-9 PM',
        expectedEngagement: 'Retweets and replies'
      };
      break;
      
    case 'instagram':
      optimized.optimizedContent = optimizeInstagram(optimized.optimizedContent);
      optimized.metadata = {
        recommendedHashtags: generateHashtags(content, 'mixed', 11),
        firstLine: content.substring(0, 125) + '...',
        bestPostTime: '11 AM-1 PM or 7-9 PM',
        expectedEngagement: 'Likes, comments, saves'
      };
      break;
  }
  
  // Add best practices reminders
  optimized.suggestions = guidelines.bestPractices;
  
  // Check for forbidden content
  const violations = checkContentViolations(content, guidelines.forbiddenContent);
  if (violations.length > 0) {
    optimized.warnings.push(...violations.map(v => `Potential violation: ${v}`));
  }
  
  // Add wealth management specific optimizations
  optimized.optimizedContent = addWealthManagementContext(optimized.optimizedContent, platform);
  
  return optimized;
}

// Platform-specific optimization functions
function optimizeLinkedIn(content) {
  // Add professional formatting
  let optimized = content;
  
  // Add bullet points for lists
  optimized = optimized.replace(/^- /gm, '• ');
  
  // Add professional disclaimer if discussing financial topics
  if (content.toLowerCase().includes('investment') || 
      content.toLowerCase().includes('financial') ||
      content.toLowerCase().includes('wealth')) {
    optimized += '\n\n📊 This content is for informational purposes only and should not be considered financial advice.';
  }
  
  // Format for readability with line breaks
  optimized = optimized.replace(/\. /g, '.\n\n');
  
  return optimized;
}

function optimizeFacebook(content) {
  let optimized = content;
  
  // Make it more conversational
  optimized = optimized.replace(/^We are pleased to announce/gi, 'Exciting news!');
  optimized = optimized.replace(/^It is important to note/gi, 'Did you know?');
  
  // Add engagement question if not present
  if (!optimized.includes('?')) {
    optimized += '\n\nWhat are your thoughts on this?';
  }
  
  return optimized;
}

function optimizeTwitter(content) {
  let optimized = content;
  
  // Shorten common phrases
  optimized = optimized.replace(/and/g, '&');
  optimized = optimized.replace(/with/g, 'w/');
  optimized = optimized.replace(/without/g, 'w/o');
  optimized = optimized.replace(/because/g, 'b/c');
  
  // Remove unnecessary words if over limit
  if (optimized.length > 280) {
    optimized = optimized.replace(/\bthe\b/gi, '');
    optimized = optimized.replace(/\bthat\b/gi, '');
    optimized = optimized.replace(/\bvery\b/gi, '');
  }
  
  return optimized.trim();
}

function optimizeInstagram(content) {
  let optimized = content;
  
  // Add emojis for visual appeal
  optimized = optimized.replace(/wealth management/gi, '💰 Wealth Management');
  optimized = optimized.replace(/investment/gi, '📈 Investment');
  optimized = optimized.replace(/success/gi, '🎯 Success');
  optimized = optimized.replace(/growth/gi, '📊 Growth');
  
  // Ensure first line is attention-grabbing
  const firstSentence = optimized.split('.')[0];
  if (firstSentence.length > 125) {
    const shortened = firstSentence.substring(0, 120) + '...👇';
    optimized = shortened + optimized.substring(firstSentence.length);
  }
  
  return optimized;
}

// Generate relevant hashtags based on content and platform
function generateHashtags(content, style = 'professional', limit = 5) {
  const hashtags = [];
  
  // Core wealth management hashtags
  const coreHashtags = {
    professional: ['#WealthManagement', '#FinancialPlanning', '#InvestmentStrategy', '#WealthAdvisor', '#FinancialSuccess'],
    casual: ['#MoneyMatters', '#WealthTips', '#FinancialFreedom', '#InvestSmart', '#MoneyGoals'],
    trending: ['#WealthTech', '#FinTech', '#Investing', '#Money', '#Finance'],
    mixed: ['#WealthManagement', '#FinancialPlanning', '#InvestmentTips', '#MoneyMindset', '#WealthBuilding',
            '#FinancialAdvisor', '#InvestmentGoals', '#WealthCreation', '#FinancialEducation', '#MoneyManagement', '#WealthStrategy']
  };
  
  // Add relevant hashtags based on content keywords
  if (content.toLowerCase().includes('esg')) {
    hashtags.push('#ESGInvesting');
  }
  if (content.toLowerCase().includes('retirement')) {
    hashtags.push('#RetirementPlanning');
  }
  if (content.toLowerCase().includes('tax')) {
    hashtags.push('#TaxPlanning');
  }
  if (content.toLowerCase().includes('estate')) {
    hashtags.push('#EstatePlanning');
  }
  
  // Add core hashtags up to limit
  const styleHashtags = coreHashtags[style] || coreHashtags.professional;
  hashtags.push(...styleHashtags.slice(0, limit - hashtags.length));
  
  return hashtags.slice(0, limit);
}

// Create thread strategy for Twitter
function createThreadStrategy(content) {
  const tweets = [];
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
  
  let currentTweet = '🧵 ';
  let tweetCount = 1;
  
  for (const sentence of sentences) {
    if ((currentTweet + sentence).length <= 275) {
      currentTweet += sentence;
    } else {
      tweets.push(currentTweet);
      currentTweet = `${++tweetCount}/ ${sentence}`;
    }
  }
  
  if (currentTweet.length > 3) {
    tweets.push(currentTweet);
  }
  
  return {
    tweetCount: tweets.length,
    tweets: tweets,
    suggestion: `Break into ${tweets.length} tweets for better engagement`
  };
}

// Truncate content intelligently
function truncateContent(content, limit, platform) {
  if (content.length <= limit) return content;
  
  // Find natural break point
  const truncated = content.substring(0, limit - 20);
  const lastSentence = truncated.lastIndexOf('.');
  const lastSpace = truncated.lastIndexOf(' ');
  
  let cutPoint = lastSentence > 0 ? lastSentence + 1 : lastSpace;
  
  // Add continuation indicator based on platform
  const continuations = {
    linkedin: '\n\n[Read more...]',
    facebook: '... See More',
    twitter: '🧵',
    instagram: '\n\n...more in comments'
  };
  
  return content.substring(0, cutPoint) + (continuations[platform.toLowerCase()] || '...');
}

// Check for content violations
function checkContentViolations(content, forbiddenList) {
  const violations = [];
  const lowerContent = content.toLowerCase();
  
  // Check for guaranteed returns claims
  if (lowerContent.includes('guaranteed return') || 
      lowerContent.includes('risk-free') ||
      lowerContent.includes('guaranteed profit')) {
    violations.push('Claims of guaranteed returns detected');
  }
  
  // Check for specific financial advice without disclaimers
  if ((lowerContent.includes('you should invest') || 
       lowerContent.includes('buy now') ||
       lowerContent.includes('sell immediately')) &&
      !lowerContent.includes('not financial advice')) {
    violations.push('Direct financial advice without disclaimer');
  }
  
  // Check for misleading statistics
  if (lowerContent.match(/\d+%/) && !lowerContent.includes('source:') && !lowerContent.includes('according to')) {
    violations.push('Statistics without source attribution');
  }
  
  return violations;
}

// Add wealth management context and branding
function addWealthManagementContext(content, platform) {
  let enhanced = content;
  
  // Ensure thewell.solutions CTA is present and prominent
  if (!enhanced.includes('thewell.solutions')) {
    enhanced += '\n\n🔗 Visit https://thewell.solutions for expert wealth management';
  }
  
  // Add brand signature if not present
  if (!enhanced.includes('The Well')) {
    const signatures = {
      linkedin: '\n\n— The Well | Premium Wealth Management Solutions\n🌐 thewell.solutions',
      facebook: '\n\n💰 Brought to you by The Well - Your Wealth Management Partner\n👉 thewell.solutions',
      twitter: '\n\n@TheWell_Wealth\n🔗 thewell.solutions',
      instagram: '\n\n@thewellwealth 💰✨\nLink in bio: thewell.solutions'
    };
    
    enhanced += signatures[platform.toLowerCase()] || '\n\n— The Well | thewell.solutions';
  }
  
  return enhanced;
}

// Generate complete social media package
function generateSocialMediaPackage(content, title) {
  const package = {
    title: title,
    platforms: {},
    crossPostStrategy: {},
    publishingSchedule: {}
  };
  
  // Generate optimized content for each platform
  ['linkedin', 'facebook', 'twitter', 'instagram'].forEach(platform => {
    package.platforms[platform] = optimizeForPlatform(content, platform);
  });
  
  // Add cross-posting strategy
  package.crossPostStrategy = {
    primary: 'linkedin', // Start with LinkedIn for professional content
    sequence: [
      { platform: 'linkedin', day: 'Tuesday', time: '9:00 AM' },
      { platform: 'twitter', day: 'Tuesday', time: '11:00 AM' },
      { platform: 'facebook', day: 'Wednesday', time: '2:00 PM' },
      { platform: 'instagram', day: 'Thursday', time: '12:00 PM' }
    ],
    rationale: 'Staggered posting maximizes reach and prevents platform penalties for duplicate content'
  };
  
  // Add publishing schedule recommendations
  const now = new Date();
  package.publishingSchedule = {
    immediate: formatForScheduling(now),
    optimal: getOptimalPostingTimes(now),
    weekly: getWeeklySchedule(now)
  };
  
  return package;
}

// Get optimal posting times for the week
function getOptimalPostingTimes(startDate) {
  const times = [];
  const optimalDays = [2, 3, 4]; // Tuesday, Wednesday, Thursday
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.getDay();
    
    if (optimalDays.includes(dayOfWeek)) {
      times.push({
        date: date.toISOString().split('T')[0],
        platform: dayOfWeek === 2 ? 'linkedin' : dayOfWeek === 3 ? 'facebook' : 'twitter',
        time: dayOfWeek === 2 ? '9:00 AM' : dayOfWeek === 3 ? '2:00 PM' : '7:00 PM',
        reason: 'Peak engagement time for platform'
      });
    }
  }
  
  return times;
}

// Get weekly posting schedule
function getWeeklySchedule(startDate) {
  const schedule = {};
  const platforms = ['linkedin', 'facebook', 'twitter', 'instagram'];
  
  platforms.forEach(platform => {
    schedule[platform] = {
      frequency: platform === 'twitter' ? 'Daily' : platform === 'instagram' ? '3-4 times/week' : '2-3 times/week',
      bestDays: platform === 'linkedin' ? ['Tuesday', 'Wednesday', 'Thursday'] :
                platform === 'facebook' ? ['Wednesday', 'Thursday', 'Friday'] :
                platform === 'twitter' ? ['All days'] :
                ['Monday', 'Wednesday', 'Friday'],
      bestTimes: platformGuidelines[platform].bestPractices.find(p => p.includes('time')) || 'See guidelines'
    };
  });
  
  return schedule;
}

// Format for scheduling tools
function formatForScheduling(date) {
  return {
    buffer: date.toISOString(),
    hootsuite: date.toISOString(),
    later: date.toISOString().split('T')[0],
    sprout: date.getTime() / 1000
  };
}

module.exports = {
  optimizeForPlatform,
  generateSocialMediaPackage,
  platformGuidelines,
  generateHashtags,
  checkContentViolations
};