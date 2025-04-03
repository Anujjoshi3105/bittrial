export const prompts = {
  BLOG_IMPROVEMENT: `As a senior content editor, analyze the blog post below and provide structured improvements.
  
    Follow these guidelines:
    1. Identify 3-5 key areas for enhancement in engagement, clarity, and professionalism.
    2. Suggest specific rewrites for awkward phrasing.
    3. Highlight opportunities for storytelling or data incorporation.
  
    Provide your response in clear, structured paragraphs. For example:
  
    **Improve Introduction Impact:** The introduction could be more compelling by incorporating a relevant statistic or a rhetorical question. This helps hook the reader immediately and sets the stage for the topic.
  
    **Enhance Readability:** Break down complex sentences and use more active voice to improve clarity. Instead of saying, "A detailed explanation of the concept is provided below," say, "We explain the concept in detail below."
  
    **Use More Storytelling:** Add real-world examples or case studies where applicable to make the content more relatable and engaging.`,

  TOPIC_GENERATION: `As an SEO content strategist, generate 10 blog topics for [industry/niche].
  
    Requirements:
    - Include the primary keyword and 1-2 related terms.
    - Address current trends (2024) and audience pain points.
    - Organize topics into pillar content clusters.
  
    Provide your response in paragraph form, such as:
  
    **Pillar: AI in Healthcare**
    - How AI is Revolutionizing Patient Diagnosis in 2024
    - The Role of Machine Learning in Drug Discovery
    - Telemedicine & AI: The Future of Remote Healthcare
  
    **Pillar: AI in Finance**
    - How AI is Preventing Fraud in Banking
    - The Future of Algorithmic Trading in 2024
    - AI-driven Personalized Financial Planning`,

  SEO_OPTIMISATION: `As an SEO expert, analyze this content and provide optimization recommendations.
  
    **Keyword Optimization:** Ensure the primary keyword appears in the title, first 100 words, and headings. Use variations and long-tail keywords naturally.
  
    **Technical SEO:** Improve meta descriptions and ensure the page loads quickly by optimizing images and reducing unnecessary scripts.
  
    **Content Structure:** Break long paragraphs into shorter sections, use bullet points for clarity, and add internal links to related articles.
  
    **Link-Building Opportunities:** Suggest relevant high-authority sources for external links and create opportunities for backlinks through industry collaborations.`,

  OUTLINE_CREATION: `As a content architect, create a comprehensive outline for "[Topic]."
  
    **Title:** [Suggested Blog Title]
  
    **Introduction:** Explain why this topic is important and its relevance in 2024.
  
    **Section 1: [H2 Heading]**
    - [h2 Subpoint 1]
    - [h2 Subpoint 2]
    - [h2 Subpoint 3]
  
    **Section 2: [H2 Heading]**
    - [h2 Subpoint 1]
    - [h2 Subpoint 2]
    - [h2 Subpoint 3]
  
    Indicate where data is needed by marking it as **[DATA]**. Use natural SEO keywords in headings and suggest content formats like case studies, comparisons, or how-to guides.`,

  CTA_ENHANCEMENT: `As a conversion rate optimizer, improve CTAs in this content.
  
    **Existing CTA:** "Sign up today."
  
    **Improved Variants:**
    - **Direct Action:** "Join Now – Limited Spots!"
    - **Value-Focused:** "Get Your Free Template Now!"
    - **Curiosity-Driven:** "Discover the Secret to [Benefit]!"
  
    Use psychological triggers such as scarcity ("Limited spots"), social proof ("Join 10,000+ users"), or urgency ("Act before the price increases!").`,

  PROOFREADING: `As a senior editor, perform deep proofreading.
  
    **Grammar & Style:** Ensure proper punctuation, grammar, and style guide adherence (AP/Chicago). Example: Replace "Their going to the store" with "They're going to the store."
  
    **Clarity & Readability:** Improve readability by simplifying complex sentences and maintaining Flesch-Kincaid scores above 60.
  
    **Ambiguous Phrasing:** Flag unclear or awkward sentences for revision. Example: "The solution is rather difficult to implement" → **[FLAG]** Consider specifying why it's difficult.`,

  VISUAL_CONTENT: `As a multimedia strategist, suggest visuals for this content.
  
    **General Guidelines:** Use one visual per 150 words. Choose from:
    - **Data Visuals:** Graphs, charts for statistical insights.
    - **Conceptual Graphics:** Infographics that simplify complex ideas.
    - **Emotional Imagery:** High-quality stock photos that resonate with the audience.
  
    Example:
    - **After Paragraph 3:** Insert a bar chart showing market trends in 2024.
    - **In Section on AI Benefits:** Use an infographic explaining AI's impact on productivity.
    - **Final CTA Section:** Add an engaging image of a user successfully implementing the guide.`,

  AUDIENCE_PERSONALISATION: `As a persona specialist, adapt content for [target audience].
  
    **Audience Pain Points:** Identify 5 key struggles this audience faces and adjust the content accordingly.
  
    **Jargon & Tone Adjustment:** If targeting tech professionals, use precise terminology like "machine learning model" instead of "AI tool." If writing for general readers, simplify explanations.
  
    **Value Proposition Refinement:** Highlight benefits that matter most to the audience. Example: Instead of "Improve workflow efficiency," say "Save 10+ hours weekly with automated workflows."
  
    **Cultural Relevance:** Adapt references based on audience familiarity. A US-based audience might relate more to Silicon Valley case studies, while a European audience might prefer global industry trends.`,
} as const;

export type PromptType = keyof typeof prompts;
export const promptTitles = Object.keys(prompts) as PromptType[];
