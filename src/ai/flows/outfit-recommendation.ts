
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
  availableItemIds: z.array(z.string()).describe('List of all available clothing item IDs for potential recommendation.'),
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


// Tool definition remains similar, but its description is crucial for the LLM
const assessStyleRulesTool = ai.defineTool({
  name: 'assessStyleRules',
  description:
    'Analyzes selected clothing items and available inventory to suggest complementary items based on common style principles (e.g., color coordination, category pairing). Use this tool to get potential recommendations that logically fit with the items the user has already chosen.',
  inputSchema: z.object({
    selectedItems: z
      .array(z.string())
      .describe('The IDs of clothing items the user has selected.'),
    availableItemIds: z.array(z.string()).describe('List of all available clothing item IDs for potential recommendation.'),
  }),
  outputSchema: z.array(OutfitRecommendationSchema), // Tool outputs potential recommendations
}, async input => {
  // TODO: In a real application, fetch item details (category, color, etc.) for smarter recommendations.
  // This remains a placeholder implementation generating dummy recommendations based on IDs.

  const recommendations: OutfitRecommendation[] = [];
  const selectedSet = new Set(input.selectedItems);
  const potentialRecommendations = input.availableItemIds.filter(id => !selectedSet.has(id));

  // Simple dummy logic: Recommend up to 3 items not already selected.
  if (input.selectedItems.includes('2')) { // If Slim Fit Jeans selected
    const tee = potentialRecommendations.find(id => id === '1'); // Classic White Tee
    if (tee) {
        recommendations.push({ clothingItemId: tee, reason: 'A classic tee creates a timeless casual look with jeans.' });
    }
     const shirt = potentialRecommendations.find(id => id === '7'); // Striped Button-Down
      if (shirt && recommendations.length < 3) {
          recommendations.push({ clothingItemId: shirt, reason: 'A button-down offers a smart-casual option with jeans.' });
      }
      const bomber = potentialRecommendations.find(id => id === '11'); // Bomber Jacket
       if (bomber && recommendations.length < 3) {
         recommendations.push({ clothingItemId: bomber, reason: 'A bomber jacket adds a stylish layer over jeans and a top.' });
       }
  }

   if (input.selectedItems.includes('1')) { // If Classic White Tee selected
     const jeans = potentialRecommendations.find(id => id === '2'); // Slim Fit Jeans
     if (jeans && recommendations.length < 3) {
       recommendations.push({ clothingItemId: jeans, reason: 'Jeans are a natural pairing for a versatile white tee.' });
     }
     const skirt = potentialRecommendations.find(id => id === '8'); // Denim Skirt
      if (skirt && recommendations.length < 3) {
        recommendations.push({ clothingItemId: skirt, reason: 'A denim skirt creates a fun, casual outfit with the tee.' });
      }
       const chinos = potentialRecommendations.find(id => id === '5'); // Casual Chinos
      if (chinos && recommendations.length < 3) {
        recommendations.push({ clothingItemId: chinos, reason: 'Chinos provide a slightly dressier alternative to jeans with the tee.' });
      }
   }

    if (input.selectedItems.includes('3')) { // If Floral Sundress selected
        const sweater = potentialRecommendations.find(id => id === '4'); // Cozy Knit Sweater
        if (sweater && recommendations.length < 3) {
            recommendations.push({ clothingItemId: sweater, reason: 'A light sweater can be layered over the sundress on cooler evenings.' });
        }
         const denimJacket = potentialRecommendations.find(id => id === '6'); // Placeholder for a denim jacket if we add one
         // if (denimJacket && recommendations.length < 3) {
         //    recommendations.push({ clothingItemId: denimJacket, reason: 'A denim jacket adds a casual touch to the sundress.' });
         //}
    }


   // Add some generic recommendations if needed
   const remainingPotential = potentialRecommendations.filter(id => !recommendations.some(r => r.clothingItemId === id));
   let count = 0;
   while (recommendations.length < 3 && count < remainingPotential.length) {
       const randomItemId = remainingPotential[count];
       recommendations.push({ clothingItemId: randomItemId, reason: 'Expands your outfit possibilities.' });
       count++;
   }

  console.log("[assessStyleRulesTool] Generated:", recommendations.slice(0, 3));
  return recommendations.slice(0, 3); // Limit to 3 recommendations
});

// Define the main prompt using the tool
const recommendOutfitPrompt = ai.definePrompt({
    name: 'recommendOutfitPrompt',
    // System prompt instructing the model
    system: `You are a helpful fashion assistant and stylist for AMS Boutique. Your goal is to recommend up to 3 clothing items that complement the items the user has already selected.
- Analyze the user's selected items (IDs provided).
- Consider their optional style preferences and previously viewed items for hints.
- Use the 'assessStyleRulesTool' to get initial suggestions based on style rules and available inventory. The tool provides item IDs and preliminary reasons.
- Refine the reasons provided by the tool to be more engaging and descriptive for the user.
- Ensure the final output contains exactly the requested fields in the specified JSON format.
- Only recommend items that are available (provided in availableItemIds).
- Do not recommend items already selected by the user.
- Prioritize recommendations that create a cohesive outfit.`,
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
    // User prompt template (Handlebars) - This might be simpler now as the system prompt holds more instructions
    prompt: `Please recommend up to 3 complementary clothing items based on my selections.

Selected Item IDs: {{#each selectedItems}} {{this}}{{#unless @last}},{{/unless}}{{/each}}
Available Item IDs for recommendation: {{#each availableItemIds}} {{this}}{{#unless @last}},{{/unless}}{{/each}}
{{#if stylePreferences}}Style Preference: {{{stylePreferences}}}{{/if}}
{{#if previouslyViewedItems}}Previously Viewed IDs: {{#each previouslyViewedItems}} {{this}}{{#unless @last}},{{/unless}}{{/each}}{{/if}}

Use the assessStyleRulesTool to help generate appropriate recommendations. Provide clear reasons for each suggestion.`,
});


// Refactored flow using the prompt and tool
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
    console.log("[recommendOutfitFlow] Input:", input);

    // Check if selected items exist
    if (!input.selectedItems || input.selectedItems.length === 0) {
      console.log("[recommendOutfitFlow] No items selected, returning empty recommendations.");
      return { recommendations: [] };
    }

    // Call the AI model with the prompt, input, and available tools
    const response = await recommendOutfitPrompt(input);
    const output = response.output();

    console.log("[recommendOutfitFlow] AI Response Output:", output);

    if (!output?.recommendations) {
      console.warn("[recommendOutfitFlow] AI did not return valid recommendations.");
      return { recommendations: [] };
    }

    // Basic validation: Ensure recommended items are actually available and not already selected
    const selectedSet = new Set(input.selectedItems);
    const availableSet = new Set(input.availableItemIds);
    const validatedRecommendations = output.recommendations.filter(rec =>
        availableSet.has(rec.clothingItemId) && !selectedSet.has(rec.clothingItemId)
    );

     // Log if any recommendations were filtered out
     if (validatedRecommendations.length < output.recommendations.length) {
        console.warn("[recommendOutfitFlow] Filtered out invalid recommendations:",
            output.recommendations.filter(rec => !validatedRecommendations.includes(rec))
        );
     }


    console.log("[recommendOutfitFlow] Validated Recommendations:", validatedRecommendations);
    // Return the validated recommendations (up to 3 as defined in output schema)
    return { recommendations: validatedRecommendations };
  }
);


// Export the main function for external use
export async function recommendOutfit(input: RecommendOutfitInput): Promise<RecommendOutfitOutput> {
  try {
      console.log("[recommendOutfit] called with input:", input);
      // Ensure availableItemIds are provided, otherwise the flow might fail or hallucinate.
       if (!input.availableItemIds || input.availableItemIds.length === 0) {
           console.error("[recommendOutfit] Error: availableItemIds must be provided.");
           // In a real app, fetch available IDs if not provided
           // For now, return empty or throw error
           return { recommendations: [] };
       }

       // Filter out selected items from available items before passing to the flow
       const selectedSet = new Set(input.selectedItems);
       const filteredAvailableIds = input.availableItemIds.filter(id => !selectedSet.has(id));

        const flowInput = {
            ...input,
            availableItemIds: filteredAvailableIds, // Pass only truly available items for recs
        };


      const result = await recommendOutfitFlow(flowInput);
      console.log("[recommendOutfit] Flow returned:", result);
      return result;
   } catch (error) {
        console.error("[recommendOutfit] Error in recommendOutfit flow:", error);
        // Optionally return a specific error structure or just empty
         return { recommendations: [] };
   }
}
