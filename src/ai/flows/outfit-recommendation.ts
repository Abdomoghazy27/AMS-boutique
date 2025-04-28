
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
// Remove direct import of ClothingItem as it's not directly used in the flow logic itself
// import { ClothingItem } from '@/services/clothing';

const RecommendOutfitInputSchema = z.object({
  selectedItems: z
    .array(z.string())
    .describe('The IDs of clothing items the user has selected.'),
  stylePreferences: z
    .string()
    .optional()
    .describe('The user specified style preferences, such as "business casual" or "streetwear".'),
  previouslyViewedItems: z
    .array(z.string())
    .optional()
    .describe('The IDs of clothing items the user has previously viewed.'),
});
export type RecommendOutfitInput = z.infer<typeof RecommendOutfitInputSchema>;

const OutfitRecommendationSchema = z.object({
  clothingItemId: z.string().describe('The ID of the recommended clothing item.'),
  reason: z.string().describe('The reason why this item is recommended.'),
});
export type OutfitRecommendation = z.infer<typeof OutfitRecommendationSchema>;

const RecommendOutfitOutputSchema = z.object({
  recommendations: z.array(OutfitRecommendationSchema).describe('The list of outfit recommendations.'),
});
export type RecommendOutfitOutput = z.infer<typeof RecommendOutfitOutputSchema>;


const includeNewProductsTool = ai.defineTool({
  name: 'includeNewProducts',
  description: 'Decide whether to include new products in the outfit recommendations.',
  inputSchema: z.object({
    selectedItemCount: z.number().describe('Number of items already selected by the user.'),
    includeNewProducts: z
      .boolean()
      .describe(
        'Whether to include new products in the outfit recommendations. Set to true if the user might want to discover new items (e.g., fewer items selected), false if they prefer familiar styles or have many items selected.'
      ),
  }),
  outputSchema: z.boolean(),
}, async input => {
  // Simple logic: suggest new products if few items are selected
  return input.selectedItemCount < 3 ? input.includeNewProducts : false;
});


const assessStyleRulesTool = ai.defineTool({
  name: 'assessStyleRules',
  description:
    'Assess style rules and generate outfit recommendations based on style preferences and selected items.',
  inputSchema: z.object({
    stylePreferences: z
      .string()
      .optional()
      .describe('The user specified style preferences, such as "business casual" or "streetwear".'),
    selectedItems: z
      .array(z.string())
      .describe('The IDs of clothing items the user has selected.'),
    previouslyViewedItems: z
      .array(z.string())
      .optional()
      .describe('The IDs of clothing items the user has previously viewed.'),
    availableItemIds: z.array(z.string()).describe('List of all available clothing item IDs for potential recommendation.'), // Added available items
  }),
  outputSchema: z.array(OutfitRecommendationSchema),
}, async input => {
  // TODO: Implement the logic to fetch clothing items and generate recommendations.
  // This is a placeholder implementation generating dummy recommendations.

  const recommendations: OutfitRecommendation[] = [];
  const selectedSet = new Set(input.selectedItems);
  const potentialRecommendations = input.availableItemIds.filter(id => !selectedSet.has(id));

  // Simple dummy logic: Recommend up to 3 items not already selected.
  // Prioritize based on simple rules (e.g., if jeans selected, recommend a top).

  if (input.selectedItems.includes('2')) { // If Slim Fit Jeans selected
    const tee = potentialRecommendations.find(id => id === '1'); // Classic White Tee
    if (tee) {
        recommendations.push({ clothingItemId: tee, reason: 'A classic tee pairs perfectly with jeans.' });
    }
    const shirt = potentialRecommendations.find(id => id === '7'); // Striped Button-Down
     if (shirt && recommendations.length < 3) {
         recommendations.push({ clothingItemId: shirt, reason: 'A button-down dresses up the jeans slightly.' });
     }
  }

   if (input.selectedItems.includes('1')) { // If Classic White Tee selected
     const jeans = potentialRecommendations.find(id => id === '2'); // Slim Fit Jeans
     if (jeans && recommendations.length < 3) {
       recommendations.push({ clothingItemId: jeans, reason: 'Jeans are a great match for a simple tee.' });
     }
     const skirt = potentialRecommendations.find(id => id === '8'); // Denim Skirt
      if (skirt && recommendations.length < 3) {
        recommendations.push({ clothingItemId: skirt, reason: 'A denim skirt offers a casual alternative.' });
      }
   }

   // Add some generic recommendations if we don't have enough specifics
   const remainingPotential = potentialRecommendations.filter(id => !recommendations.some(r => r.clothingItemId === id));
   let count = 0;
   while (recommendations.length < 3 && count < remainingPotential.length) {
       const randomItemId = remainingPotential[count];
       // Avoid recommending items very similar to what's selected if possible (simple category check)
       // This requires fetching item details, which is complex for a dummy tool.
       // For now, just add a generic reason.
       recommendations.push({ clothingItemId: randomItemId, reason: 'Expands your outfit options.' });
       count++;
   }


  return recommendations.slice(0, 3); // Limit to 3 recommendations
});


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

    // --- Dummy Data Setup ---
    // In a real scenario, you'd fetch this or have it available
     const allAvailableItemIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    // --- End Dummy Data Setup ---


    // Simulate calling the tools (in a real scenario, this would involve AI model calls)
    console.log("Calling includeNewProductsTool with:", { selectedItemCount: input.selectedItems.length, includeNewProducts: true });
    const shouldIncludeNew = await includeNewProductsTool({ selectedItemCount: input.selectedItems.length, includeNewProducts: true });
    console.log("includeNewProductsTool result:", shouldIncludeNew);

    console.log("Calling assessStyleRulesTool with:", { ...input, availableItemIds: allAvailableItemIds });
    const initialRecommendations = await assessStyleRulesTool({ ...input, availableItemIds: allAvailableItemIds });
     console.log("assessStyleRulesTool result:", initialRecommendations);

    // Combine results based on the 'includeNewProducts' decision (simplified for dummy)
    let finalRecommendations = initialRecommendations;

    if (!shouldIncludeNew && input.previouslyViewedItems && input.previouslyViewedItems.length > 0) {
        // Prefer previously viewed items if not including new ones (dummy logic)
        const previouslyViewedSet = new Set(input.previouslyViewedItems);
        const preferredRecommendations = initialRecommendations.filter(rec => previouslyViewedSet.has(rec.clothingItemId));
        if (preferredRecommendations.length > 0) {
            finalRecommendations = preferredRecommendations;
            // Add more from initial if needed, up to limit
            const initialNotPreferred = initialRecommendations.filter(rec => !previouslyViewedSet.has(rec.clothingItemId));
            finalRecommendations.push(...initialNotPreferred.slice(0, 3 - finalRecommendations.length));

        }

    }

    // Ensure we don't exceed the recommendation limit
    finalRecommendations = finalRecommendations.slice(0, 3);

    console.log("Final recommendations:", finalRecommendations);
    return { recommendations: finalRecommendations };
  }
);


// Export the main function for external use
export async function recommendOutfit(input: RecommendOutfitInput): Promise<RecommendOutfitOutput> {
  try {
      console.log("recommendOutfit called with input:", input);
      const result = await recommendOutfitFlow(input);
      console.log("recommendOutfitFlow returned:", result);
      return result;
   } catch (error) {
        console.error("Error in recommendOutfit flow:", error);
        // Return an empty recommendation list or re-throw the error
         return { recommendations: [] };
   }
}


