// Claude AI integration for script generation
import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is not set');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';

export interface ScriptGenerationParams {
  seriesTitle: string;
  genre: string;
  tone: string;
  episodeNumber: number;
  previousSummary?: string;
  characters: Array<{
    name: string;
    description: string;
    personality: string;
  }>;
  targetDuration: number; // in minutes
}

export interface GeneratedScript {
  title: string;
  synopsis: string;
  scenes: Array<{
    sceneNumber: number;
    location: string;
    timeOfDay: string;
    description: string;
    dialogue: string;
    visualPrompt: string;
    estimatedDuration: number;
  }>;
  cliffhanger: string;
  nextEpisodeTeaser: string;
}

export async function generateEpisodeScript(
  params: ScriptGenerationParams
): Promise<GeneratedScript> {
  const prompt = buildScriptPrompt(params);

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    temperature: 0.8,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  const responseText = message.content[0].type === 'text'
    ? message.content[0].text
    : '';

  return parseScriptResponse(responseText);
}

function buildScriptPrompt(params: ScriptGenerationParams): string {
  const characterDescriptions = params.characters
    .map(c => `- ${c.name}: ${c.description}. ${c.personality}`)
    .join('\n');

  return `You are a professional soap opera screenwriter. Write a compelling script for episode ${params.episodeNumber} of "${params.seriesTitle}".

SERIES INFORMATION:
- Genre: ${params.genre}
- Tone: ${params.tone}
- Target Duration: ${params.targetDuration} minutes
${params.previousSummary ? `- Previous Episode Summary: ${params.previousSummary}` : ''}

CHARACTERS:
${characterDescriptions}

REQUIREMENTS:
1. Create ${Math.ceil(params.targetDuration / 0.5)} scenes (approximately 30-40 seconds each)
2. Each scene must have:
   - Clear location and time of day
   - Dramatic dialogue with emotional tension
   - Visual description for AI video generation
   - A specific visual prompt optimized for Veo 3 AI
3. Build tension throughout the episode
4. End with a compelling cliffhanger
5. Include a teaser for the next episode

OUTPUT FORMAT (JSON):
{
  "title": "Episode title",
  "synopsis": "2-3 sentence episode summary",
  "scenes": [
    {
      "sceneNumber": 1,
      "location": "Location name",
      "timeOfDay": "Morning/Afternoon/Evening/Night",
      "description": "What happens in this scene",
      "dialogue": "Character dialogue with emotions",
      "visualPrompt": "Detailed visual description for AI video generation (lighting, camera angle, mood, actions)",
      "estimatedDuration": 35
    }
  ],
  "cliffhanger": "Description of cliffhanger ending",
  "nextEpisodeTeaser": "Teaser for next episode"
}

Write the script now in valid JSON format:`;
}

function parseScriptResponse(response: string): GeneratedScript {
  // Extract JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse script response - no valid JSON found');
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!parsed.title || !parsed.synopsis || !Array.isArray(parsed.scenes)) {
      throw new Error('Invalid script structure');
    }

    return parsed as GeneratedScript;
  } catch (error) {
    console.error('Script parsing error:', error);
    throw new Error('Failed to parse generated script');
  }
}

export async function generateSeriesIdeas(
  genre: string,
  tone: string,
  targetAudience: string
): Promise<Array<{ title: string; description: string; hook: string }>> {
  const prompt = `Generate 3 compelling soap opera series ideas:

Genre: ${genre}
Tone: ${tone}
Target Audience: ${targetAudience}

For each series, provide:
1. Title (catchy and memorable)
2. Description (2-3 sentences)
3. Hook (what makes it unique)

Output as JSON array:
[
  {
    "title": "Series Title",
    "description": "Series description...",
    "hook": "Unique selling point..."
  }
]`;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    temperature: 0.9,
    messages: [{ role: 'user', content: prompt }]
  });

  const responseText = message.content[0].type === 'text'
    ? message.content[0].text
    : '';

  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error('Failed to generate series ideas');
}

export async function improveDialogue(
  originalDialogue: string,
  tone: string
): Promise<string> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    temperature: 0.7,
    messages: [
      {
        role: 'user',
        content: `Improve this soap opera dialogue to be more ${tone} and emotionally engaging:

${originalDialogue}

Return only the improved dialogue:`
      }
    ]
  });

  return message.content[0].type === 'text'
    ? message.content[0].text
    : originalDialogue;
}

export const claudeAI = {
  generateEpisodeScript,
  generateSeriesIdeas,
  improveDialogue
};

export default claudeAI;
