import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '@/app/lib/config';

const getUserFromRequest = (request: NextRequest) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    try {
        return jwt.verify(token, config.auth.jwtSecret) as { userId: string; role: string };
    } catch {
        return null;
    }
};

interface Tag {
    id: string;
    name: string;
    category: string | null;
}

// POST - Suggest tags based on project description
export async function POST(request: NextRequest) {
    try {
        const auth = getUserFromRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { description } = body;

        if (!description || description.trim().length < 10) {
            return NextResponse.json(
                { error: 'Please provide a description with at least 10 characters' },
                { status: 400 }
            );
        }

        // Fetch all existing tags
        const existingTags = await query<Tag[]>(`
            SELECT id, name, category, is_active FROM tags WHERE is_active = TRUE ORDER BY name
        `);

        // Filter and map tags efficiently
        const activeTags = existingTags.map(t => ({ name: t.name, category: t.category }));
        const tagNames = activeTags.map(t => t.name);
        const tagCategories = [...new Set(activeTags.map(t => t.category).filter(Boolean))];

        // Build prompt for Gemini - different prompts based on whether tags exist
        const hasExistingTags = tagNames.length > 0;

        // Safeguard: Gemini will crash if enum is empty, so inject a placeholder
        const validTagNames = tagNames.length > 0 ? tagNames : ["Placeholder"];

        const prompt = hasExistingTags
            ? `You are an academic project classification AI. Analyze the project description and suggest relevant tags.

EXISTING TAGS (You MUST strictly choose from these):
${tagNames.join(', ')}

EXISTING CATEGORIES:
${tagCategories.join(', ')}

PROJECT DESCRIPTION:
${description}

INSTRUCTIONS:
1. Select 3-8 relevant tags from EXISTING TAGS.
2. ONLY if critical domains are missing, suggest up to 2 NEW tags.

EXAMPLES OF DESIRED BEHAVIOR:
Project: "A mobile application using React Native to track daily water intake and visualize health trends."
{"existingTags": ["Mobile App", "Health", "Data Visualization"], "newTags": []}

Project: "A novel IoT device utilizing LoRaWAN to measure soil moisture in remote vineyards."
{"existingTags": ["Hardware & IoT", "Agriculture"], "newTags": [{"name": "LoRaWAN", "category": "Hardware & IoT"}]}

Now, process the PROJECT DESCRIPTION and output the JSON.`
            : `You are an academic project classification AI. Analyze the project description and suggest relevant tags.

PROJECT DESCRIPTION:
${description}

INSTRUCTIONS:
1. Since there are no existing tags, suggest 5-8 NEW tags that best describe this project.
2. For each tag, assign an appropriate category from common academic/technical domains like:
   - "Artificial Intelligence", "Software Development", "Data", "Security", "Cloud & DevOps", "Hardware & IoT", "Domain", "Other"
3. Tags should be concise (1-3 words) and descriptive.

EXAMPLES OF DESIRED BEHAVIOR:
Project: "Building a decentralized voting system using blockchain and smart contracts on Ethereum."
{"existingTags": [], "newTags": [{"name": "Blockchain", "category": "Security"}, {"name": "Smart Contracts", "category": "Software Development"}, {"name": "Voting System", "category": "Other"}]}

Project: "Real-time sentiment analysis of social media posts using Python and NLP."
{"existingTags": [], "newTags": [{"name": "NLP", "category": "Artificial Intelligence"}, {"name": "Sentiment Analysis", "category": "Artificial Intelligence"}, {"name": "Social Media Analytics", "category": "Data"}]}

Now, process the PROJECT DESCRIPTION and output the JSON.`;

        // Call Gemini API with Structured Output configuration
        const geminiResponse = await fetch(`${config.ai.geminiUrl}?key=${config.ai.geminiApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 1024,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            existingTags: {
                                type: "ARRAY",
                                items: { 
                                    type: "STRING",
                                    enum: validTagNames
                                },
                                description: "You MUST ONLY select from the provided enum list."
                            },
                            newTags: {
                                type: "ARRAY",
                                items: {
                                    type: "OBJECT",
                                    properties: {
                                        name: { type: "STRING", description: "Name of the new tag (1-3 words)" },
                                        category: { type: "STRING", description: "Category for the new tag" }
                                    },
                                    required: ["name", "category"]
                                },
                                description: "List of new tags to create, only if absolutely necessary"
                            }
                        },
                        required: ["existingTags", "newTags"]
                    }
                }
            }),
        });

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            console.error('Gemini API error details:', errorText);

            // Handle specific model not found cases gracefully
            if (geminiResponse.status === 404) {
                return NextResponse.json(
                    { error: 'AI Model not functional currently. Please try manual selection.' },
                    { status: 503 }
                );
            }

            return NextResponse.json(
                { error: 'Failed to analyze description with AI' },
                { status: 500 }
            );
        }

        const geminiData = await geminiResponse.json();

        // Handle Gemini 2.5 Flash thinking mode - response may have multiple parts
        // The JSON content is typically in the last part (after thinking)
        const parts = geminiData.candidates?.[0]?.content?.parts;
        let responseText: string | undefined;

        if (Array.isArray(parts) && parts.length > 0) {
            // Find the part with text content (skip thought parts if any)
            for (let i = parts.length - 1; i >= 0; i--) {
                if (parts[i]?.text) {
                    responseText = parts[i].text;
                    break;
                }
            }
        }

        if (!responseText) {
            console.error('Gemini response structure:', JSON.stringify(geminiData, null, 2));
            // Return a graceful fallback instead of erroring
            return NextResponse.json({
                suggestedTags: [],
                existingTagsUsed: 0,
                newTagsCreated: 0,
                createdTags: [],
                warning: 'AI returned empty response. Please try again or select tags manually.'
            });
        }

        // Parse the JSON response (it should be valid JSON now)
        let suggestions: { existingTags: string[]; newTags: { name: string; category: string }[] };
        try {
            suggestions = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse Gemini response. Raw text:', responseText);
            console.error('Parse error:', parseError);

            // Return a graceful fallback with a warning
            return NextResponse.json({
                suggestedTags: [],
                existingTagsUsed: 0,
                newTagsCreated: 0,
                createdTags: [],
                warning: 'AI response was malformed. Please try again or select tags manually.'
            });
        }

        // Validate suggestions structure
        if (!suggestions.existingTags) {
            suggestions.existingTags = [];
        }
        if (!suggestions.newTags) {
            suggestions.newTags = [];
        }

        // Validate existing tags - case-insensitive matching
        const validExistingTags = suggestions.existingTags.filter(suggestedName =>
            tagNames.some(existingName => existingName.toLowerCase() === suggestedName.toLowerCase())
        );

        // Correct the casing of existing tags based on DB
        const normalizedExistingTags = validExistingTags.map(suggestedName => {
            const match = activeTags.find(t => t.name.toLowerCase() === suggestedName.toLowerCase());
            return match ? match.name : suggestedName;
        });

        // Create new tags if suggested
        const createdTags: string[] = [];
        const maxNewTags = hasExistingTags ? 2 : 8; // Allow more new tags when bootstrapping
        if (suggestions.newTags && suggestions.newTags.length > 0) {
            for (const newTag of suggestions.newTags.slice(0, maxNewTags)) {
                const tagName = newTag.name.trim();

                // Check if tag already exists in DB (case-insensitive) just in case
                const exists = activeTags.some(t => t.name.toLowerCase() === tagName.toLowerCase());

                if (!exists && tagName.length > 0) {
                    const newId = uuidv4();
                    await query(
                        'INSERT INTO tags (id, name, category, is_active, sort_order) VALUES (?, ?, ?, TRUE, 100)',
                        [newId, tagName, newTag.category || 'Other']
                    );
                    createdTags.push(tagName);
                } else if (exists) {
                    // It exists but AI put it in newTags, add to existing list
                    const match = activeTags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
                    if (match && !normalizedExistingTags.includes(match.name)) {
                        normalizedExistingTags.push(match.name);
                    }
                }
            }
        }

        // Combine all suggested tags
        const allSuggestedTags = [...new Set([...normalizedExistingTags, ...createdTags])];

        return NextResponse.json({
            suggestedTags: allSuggestedTags,
            existingTagsUsed: normalizedExistingTags.length,
            newTagsCreated: createdTags.length,
            createdTags,
        });

    } catch (error) {
        console.error('AI suggest tags error:', error);
        return NextResponse.json(
            { error: 'Failed to suggest tags' },
            { status: 500 }
        );
    }
}

export const dynamic = 'force-dynamic';
