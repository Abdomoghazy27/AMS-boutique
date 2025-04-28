
'use server';
/**
 * @fileOverview Outfit recommendation AI agent.
 *
 * - recommendOutfit - A function that handles the outfit recommendation process.
 * - RecommendOutfitInput - The input type for the recommendOutfit function.
 * - RecommendOutfitOutput - The return type for the recommendOutfit function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const RecommendOutfitInputSchema = z.object({
  selectedItems: z
    .array(z.string())
    .describe('The IDs of clothing items the user has selected to build an outfit around.'),
  stylePreferences: z
    .string()
    .optional()
    .describe('The user specified style preferences, such as "business casual" or "streetwear".'),
  previouslyViewedItems: z
    .array(z.string())
    .optional()
    .describe('The IDs of clothing items the user has previously viewed, which might indicate preferences.'),
  // Tool/Prompt needs the full list to consider *all* possibilities
  availableItemIds: z.array(z.string()).describe('List of ALL available clothing item IDs for potential recommendation.'),
});
export type RecommendOutfitInput = z.infer<typeof RecommendOutfitInputSchema>;

const OutfitRecommendationSchema = z.object({
  clothingItemId: z.string().describe('The ID of the recommended clothing item.'),
  reason: z.string().describe('A concise explanation of why this item is recommended to complement the selected items.'),
});
export type OutfitRecommendation = z.infer<typeof OutfitRecommendationSchema>;

const RecommendOutfitOutputSchema = z.object({
  recommendations: z.array(OutfitRecommendationSchema).max(3).describe('A list of up to 3 outfit recommendations, including the item ID and reason.'),
});
export type RecommendOutfitOutput = z.infer<typeof RecommendOutfitOutputSchema>;


// Tool definition: Analyzes selection and ALL available items to suggest complements
const assessStyleRulesTool = ai.defineTool({
  name: 'assessStyleRules',
  description:
    'Analyzes selected clothing items and ALL available inventory items to suggest complementary items based on common style principles (e.g., color coordination, category pairing). Use this tool to get potential recommendations that logically fit with the items the user has already chosen. DO NOT recommend items already present in the `selectedItems` input.',
  inputSchema: z.object({
    selectedItems: z
      .array(z.string())
      .describe('The IDs of clothing items the user has selected.'),
    availableItemIds: z.array(z.string()).describe('List of ALL available clothing item IDs for potential recommendation.'),
  }),
  outputSchema: z.array(OutfitRecommendationSchema), // Tool outputs potential recommendations
}, async input => {
  console.log("[assessStyleRulesTool] Input:", input);

  // TODO: In a real application, fetch item details (category, color, etc.) for smarter recommendations.
  // This remains a placeholder implementation generating dummy recommendations based on IDs.

  const recommendations: OutfitRecommendation[] = [];
  const selectedSet = new Set(input.selectedItems);
  // Filter OUT selected items FROM the available items here in the tool logic
  const potentialRecommendations = input.availableItemIds.filter(id => !selectedSet.has(id));
  console.log("[assessStyleRulesTool] Potential recommendation candidates (after filtering selected):", potentialRecommendations);

  // Slightly less specific dummy logic
  // Try to add *some* recommendations based on simple pairings
  if (input.selectedItems.includes('2') || input.selectedItems.includes('5')) { // Jeans or Chinos selected
    const topCandidates = ['1', '7', '12']; // Tee, Button-Down, Polo
    for (const candidateId of topCandidates) {
      if (recommendations.length >= 3) break;
      const item = potentialRecommendations.find(id => id === candidateId);
      if (item) {
        recommendations.push({ clothingItemId: item, reason: `Pairs well with ${input.selectedItems.includes('2') ? 'jeans' : 'chinos'}.` });
      }
    }
    const outerwearCandidates = ['6', '11']; // Leather Jacket, Bomber
     for (const candidateId of outerwearCandidates) {
       if (recommendations.length >= 3) break;
       const item = potentialRecommendations.find(id => id === candidateId);
       if (item) {
          recommendations.push({ clothingItemId: item, reason: 'Adds a stylish layer.' });
       }
     }
  }

   if (input.selectedItems.includes('1') || input.selectedItems.includes('7') || input.selectedItems.includes('12')) { // Top selected
     const bottomCandidates = ['2', '5', '8']; // Jeans, Chinos, Skirt
     for (const candidateId of bottomCandidates) {
        if (recommendations.length >= 3) break;
        const item = potentialRecommendations.find(id => id === candidateId);
        if (item) {
            recommendations.push({ clothingItemId: item, reason: 'Completes the look with your selected top.' });
        }
     }
   }

   if (input.selectedItems.includes('3') || input.selectedItems.includes('10')) { // Dress selected
        const outerwearCandidates = ['4', '6', '11']; // Sweater, Leather Jacket, Bomber
        for (const candidateId of outerwearCandidates) {
            if (recommendations.length >= 3) break;
            const item = potentialRecommendations.find(id => id === candidateId);
            if (item) {
                recommendations.push({ clothingItemId: item, reason: 'A great layer for the dress.' });
            }
        }
    }

   // Add some generic recommendations if needed to reach up to 3 and potential items exist
   const existingRecIds = new Set(recommendations.map(r => r.clothingItemId));
   const remainingPotential = potentialRecommendations.filter(id => !existingRecIds.has(id));
   let count = 0;
   while (recommendations.length < 3 && count < remainingPotential.length) {
       const randomItemId = remainingPotential[count];
       recommendations.push({ clothingItemId: randomItemId, reason: 'Expands your outfit possibilities.' });
       count++;
   }

  console.log(`[assessStyleRulesTool] Generated ${recommendations.length} Recommendations (max 3):`, recommendations);
  return recommendations; // Return up to 3 recommendations (output schema handles max)
});

// Define the main prompt using the tool
const recommendOutfitPrompt = ai.definePrompt({
    name: 'recommendOutfitPrompt',
    // System prompt instructing the model
    system: `You are a helpful fashion assistant and stylist for AMS Boutique. Your goal is to recommend up to 3 clothing items that complement the items the user has already selected.
- Analyze the user's selected items (IDs provided).
- Consider their optional style preferences and previously viewed items for hints.
- Use the 'assessStyleRulesTool' to get initial suggestions based on style rules and the *entire* available inventory. The tool provides item IDs and preliminary reasons.
- Refine the reasons provided by the tool to be more engaging and descriptive for the user.
- Ensure the final output contains exactly the requested fields in the specified JSON format.
- ONLY recommend items that are present in the 'availableItemIds' list provided in the user prompt.
- CRITICAL: DO NOT recommend items that are already listed in the user's 'selectedItems'. Ensure the 'assessStyleRulesTool' is used correctly to avoid this.
- Prioritize recommendations that create a cohesive outfit.
- If the tool returns fewer than 3 items, do not invent new ones. Only return what the tool provided.`,
    // Tools available to the model
    tools: [assessStyleRulesTool],
    // Input schema for the prompt
    input: {
        schema: RecommendOutfitInputSchema,
    },
    // Output schema expected from the model
    output: {
        schema: RecommendOutfitOutputSchema,
    },
    // User prompt template (Handlebars)
    prompt: `Please recommend up to 3 complementary clothing items based on my selections.

Selected Item IDs: {{#if selectedItems}} {{#each selectedItems}} {{this}}{{#unless @last}},{{/unless}}{{/each}} {{else}} None {{/if}}
Available Item IDs for recommendation: {{#each availableItemIds}} {{this}}{{#unless @last}},{{/unless}}{{/each}}
{{#if stylePreferences}}Style Preference: {{{stylePreferences}}}{{/if}}
{{#if previouslyViewedItems}}Previously Viewed IDs: {{#each previouslyViewedItems}} {{this}}{{#unless @last}},{{/unless}}{{/each}}{{/if}}

Use the assessStyleRulesTool to help generate appropriate recommendations. Ensure recommendations are from the available IDs AND are NOT already in my selected items. Provide clear reasons for each suggestion.`,
});


// Flow definition using the prompt and tool
const recommendOutfitFlow = ai.defineFlow<
  typeof RecommendOutfitInputSchema,
  typeof RecommendOutfitOutputSchema
>(
  {
    name: 'recommendOutfitFlow',
    inputSchema: RecommendOutfitInputSchema,
    outputSchema: RecommendOutfitOutputSchema,
  },
  async (input) => {
    console.log("[recommendOutfitFlow] Input received:", JSON.stringify(input, null, 2));

    // Check if selected items exist
    if (!input.selectedItems || input.selectedItems.length === 0) {
      console.log("[recommendOutfitFlow] No items selected, returning empty recommendations.");
      return { recommendations: [] };
    }
     // Ensure available items are provided
     if (!input.availableItemIds || input.availableItemIds.length === 0) {
       console.error("[recommendOutfitFlow] Error: No availableItemIds provided to the flow.");
       // Returning empty instead of throwing to prevent client-side crashes on potential edge cases
       return { recommendations: [] };
     }

    // Call the AI model with the prompt, input, and available tools
    console.log("[recommendOutfitFlow] Calling recommendOutfitPrompt...");
    const response = await recommendOutfitPrompt(input);
    const output = response.output();

    console.log("[recommendOutfitFlow] Raw AI Response Output:", JSON.stringify(output, null, 2));

    if (!output?.recommendations) {
      console.warn("[recommendOutfitFlow] AI did not return a valid 'recommendations' structure. Returning empty.");
      return { recommendations: [] };
    }

    // Post-validation: Ensure recommended items are actually available and not already selected
    // The AI/tool *should* handle this based on prompts, but double-check here.
    const selectedSet = new Set(input.selectedItems);
    const availableSet = new Set(input.availableItemIds);
    const validatedRecommendations = output.recommendations.filter(rec => {
        const isAvailable = availableSet.has(rec.clothingItemId);
        const isNotSelected = !selectedSet.has(rec.clothingItemId);
        if (!isAvailable) console.warn(`[recommendOutfitFlow Validation] Filtering out recommendation ${rec.clothingItemId} because it's NOT in the available list.`);
        if (!isNotSelected) console.warn(`[recommendOutfitFlow Validation] Filtering out recommendation ${rec.clothingItemId} because it WAS already selected.`);
        return isAvailable && isNotSelected;
    }).slice(0, 3); // Ensure we don't exceed the max of 3 after filtering

     // Log if any recommendations were filtered out during post-validation
     if (validatedRecommendations.length < output.recommendations.length) {
        console.warn("[recommendOutfitFlow Validation] Post-validation filtered out some recommendations. Initial:", output.recommendations.length, "Final:", validatedRecommendations.length);
     }


    console.log(`[recommendOutfitFlow] Final Validated Recommendations (${validatedRecommendations.length}):`, JSON.stringify(validatedRecommendations, null, 2));
    // Return the validated recommendations (up to 3 as defined in output schema)
    return { recommendations: validatedRecommendations };
  }
);


// Export the main function for external use
export async function recommendOutfit(input: RecommendOutfitInput): Promise<RecommendOutfitOutput> {
  try {
      console.log("[recommendOutfit Wrapper] called with input:", JSON.stringify(input, null, 2));

      // Ensure availableItemIds are provided by the caller (page component)
       if (!input.availableItemIds || input.availableItemIds.length === 0) {
           console.error("[recommendOutfit Wrapper] Error: availableItemIds must be provided by the caller. Returning empty.");
           return { recommendations: [] }; // Return empty or throw error
       }
        // Basic check for selected items
       if (!input.selectedItems || input.selectedItems.length === 0) {
           console.log("[recommendOutfit Wrapper] No items selected for recommendation input. Returning empty.");
           return { recommendations: [] };
       }


      // Call the flow with the exact input received from the page
      const result = await recommendOutfitFlow(input);
      console.log("[recommendOutfit Wrapper] Flow returned:", JSON.stringify(result, null, 2));
      return result;
   } catch (error: any) {
        console.error("[recommendOutfit Wrapper] Error executing recommendOutfit flow:", error.message || error);
        // Optionally return a specific error structure or just empty
         return { recommendations: [] };
   }
}

