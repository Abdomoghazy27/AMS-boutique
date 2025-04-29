
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
    'Analyzes selected clothing items and ALL available inventory items to suggest complementary items based on common style principles (e.g., color coordination, category pairing). Use this tool to get potential recommendations that logically fit with the items the user has already chosen. CRITICAL: DO NOT recommend items already present in the `selectedItems` input.',
  inputSchema: z.object({
    selectedItems: z
      .array(z.string())
      .describe('The IDs of clothing items the user has selected.'),
    availableItemIds: z.array(z.string()).describe('List of ALL available clothing item IDs for potential recommendation.'),
  }),
  // Tool outputs potential recommendations (up to a reasonable limit, let the main prompt decide the final 3)
  outputSchema: z.array(OutfitRecommendationSchema).max(5),
}, async input => {
  console.log("[assessStyleRulesTool] Input:", input);
  const recommendations: OutfitRecommendation[] = [];
  const selectedSet = new Set(input.selectedItems);

  // Filter available items to get potential candidates (excluding already selected ones)
  const potentialItems = input.availableItemIds.filter(id => !selectedSet.has(id));
  console.log(`[assessStyleRulesTool] Potential candidates (available excluding selected): ${potentialItems.length} items`);

  // --- Placeholder Dummy Logic ---
  // TODO: Replace with actual logic fetching item details and applying style rules.
  // This simple logic just picks the first few potential items.

  // Example: Try to find a top if bottoms are selected, or bottoms if top is selected
  const needsTop = input.selectedItems.some(id => ['2', '5', '8', '19'].includes(id)); // Jeans, Chinos, Skirt, Shorts
  const needsBottom = input.selectedItems.some(id => ['1', '7', '12', '16', '20'].includes(id)); // Tees, Shirts, Blouse, Cami

  if (needsTop) {
      const topCandidates = ['1', '7', '12', '16', '20'];
      for (const candidateId of topCandidates) {
          if (recommendations.length >= 5) break;
          if (potentialItems.includes(candidateId)) {
              recommendations.push({ clothingItemId: candidateId, reason: `Pairs well with your selected bottom.` });
              potentialItems.splice(potentialItems.indexOf(candidateId), 1); // Remove used item
          }
      }
  }

  if (needsBottom) {
       const bottomCandidates = ['2', '5', '8', '14', '19']; // Jeans, Chinos, Skirt, Linen Trousers, Shorts
       for (const candidateId of bottomCandidates) {
          if (recommendations.length >= 5) break;
          if (potentialItems.includes(candidateId)) {
               recommendations.push({ clothingItemId: candidateId, reason: `Completes the look with your selected top.` });
               potentialItems.splice(potentialItems.indexOf(candidateId), 1); // Remove used item
          }
       }
  }

  // Add generic recommendations if needed, up to 5
  let potentialIndex = 0;
  while (recommendations.length < 5 && potentialIndex < potentialItems.length) {
      recommendations.push({
          clothingItemId: potentialItems[potentialIndex],
          reason: `A versatile option (ID: ${potentialItems[potentialIndex]}) to consider.`
      });
      potentialIndex++;
  }
  // --- End Placeholder Logic ---

  console.log(`[assessStyleRulesTool] Generated ${recommendations.length} Raw Recommendations (max 5):`, recommendations);
  return recommendations; // Return up to 5 recommendations for the LLM to choose from
});

// Define the main prompt using the tool
const recommendOutfitPrompt = ai.definePrompt({
    name: 'recommendOutfitPrompt',
    // System prompt instructing the model
    system: `You are a helpful fashion assistant and stylist for AMS Boutique. Your goal is to recommend up to 3 clothing items that complement the items the user has already selected.
- Analyze the user's selected items (IDs provided).
- Consider their optional style preferences and previously viewed items for hints.
- Use the 'assessStyleRulesTool' to get initial suggestions based on style rules and the *entire* available inventory. The tool provides item IDs and preliminary reasons based on basic pairing.
- From the tool's suggestions, select the BEST recommendations (up to 3) that create a cohesive and stylish outfit. Prioritize items that directly complement the selected items.
- Refine the reasons provided by the tool to be more engaging, specific, and descriptive for the user. Explain *why* it complements the look (e.g., color contrast, style match, layering possibility).
- Ensure the final output contains exactly the requested fields in the specified JSON format, with a maximum of 3 recommendations.
- ONLY recommend items that were suggested by the 'assessStyleRulesTool' AND are present in the 'availableItemIds' list provided in the user prompt.
- CRITICAL: DO NOT recommend items that are already listed in the user's 'selectedItems'. Ensure the 'assessStyleRulesTool' is used correctly to avoid this, and double-check the tool's output.
- If the tool returns fewer than 3 items, only recommend those provided by the tool. Do not invent new ones.`,
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

Use the assessStyleRulesTool to get a list of potential complementary items from the available inventory (excluding the selected items). Then, choose the best suggestions (up to 3) from the tool's output and provide refined, user-friendly reasons for each choice. Ensure recommendations are from the available IDs AND are NOT already in my selected items.`,
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

    // Basic Input Validation
    if (!input.selectedItems || input.selectedItems.length === 0) {
      console.log("[recommendOutfitFlow] No items selected, returning empty recommendations.");
      return { recommendations: [] };
    }
     if (!input.availableItemIds || input.availableItemIds.length === 0) {
       console.error("[recommendOutfitFlow] Error: No availableItemIds provided to the flow.");
       return { recommendations: [] }; // Return empty to prevent crashes
     }
     if (input.availableItemIds.length <= input.selectedItems.length) {
        console.warn("[recommendOutfitFlow] No items available for recommendation (available <= selected). Returning empty.");
        return { recommendations: [] };
     }


    // Call the AI model with the prompt, input, and available tools
    console.log("[recommendOutfitFlow] Calling recommendOutfitPrompt...");
    const response = await recommendOutfitPrompt(input);
    const output = response.output();

    console.log("[recommendOutfitFlow] Raw AI Response Output:", JSON.stringify(output, null, 2));

    // --- Post-processing and Validation ---
    if (!output?.recommendations) {
      console.warn("[recommendOutfitFlow] AI did not return a valid 'recommendations' structure. Returning empty.");
      return { recommendations: [] };
    }

    // Validate recommendations against input constraints (Safety Net)
    const selectedSet = new Set(input.selectedItems);
    const availableSet = new Set(input.availableItemIds);
    let invalidCount = 0;

    const validatedRecommendations = output.recommendations.filter(rec => {
        const isAvailable = availableSet.has(rec.clothingItemId);
        const isNotSelected = !selectedSet.has(rec.clothingItemId);
        const isValid = isAvailable && isNotSelected;

        if (!isAvailable) {
            console.warn(`[recommendOutfitFlow Validation] Filtering out recommendation ID ${rec.clothingItemId} because it's NOT in the available list.`);
            invalidCount++;
        }
        if (!isNotSelected) {
             console.warn(`[recommendOutfitFlow Validation] Filtering out recommendation ID ${rec.clothingItemId} because it WAS already selected.`);
            invalidCount++;
        }
        return isValid;
    }).slice(0, 3); // Ensure we strictly adhere to max 3 *after* validation

     if (invalidCount > 0) {
        console.warn(`[recommendOutfitFlow Validation] Post-validation filtered out ${invalidCount} invalid recommendations. Initial count: ${output.recommendations.length}, Final count: ${validatedRecommendations.length}`);
     } else if (validatedRecommendations.length < output.recommendations.length) {
         console.log(`[recommendOutfitFlow Validation] Trimmed recommendations from ${output.recommendations.length} to ${validatedRecommendations.length} to meet max limit.`);
     } else {
          console.log("[recommendOutfitFlow Validation] All AI recommendations passed validation.");
     }


    console.log(`[recommendOutfitFlow] Final Validated Recommendations (${validatedRecommendations.length}):`, JSON.stringify(validatedRecommendations, null, 2));
    // Return the validated and capped recommendations
    return { recommendations: validatedRecommendations };
  }
);


// Export the main wrapper function for external use
export async function recommendOutfit(input: RecommendOutfitInput): Promise<RecommendOutfitOutput> {
  try {
      console.log("[recommendOutfit Wrapper] called with input:", JSON.stringify(input, null, 2));

      // --- Input Validation in Wrapper (Guard Clause) ---
      if (!input.availableItemIds || input.availableItemIds.length === 0) {
           console.error("[recommendOutfit Wrapper] Error: availableItemIds must be provided by the caller. Returning empty.");
           return { recommendations: [] };
      }
      if (!input.selectedItems || input.selectedItems.length === 0) {
           console.log("[recommendOutfit Wrapper] No items selected for recommendation input. Returning empty.");
           return { recommendations: [] };
      }
      if (input.availableItemIds.length <= input.selectedItems.length) {
        console.warn("[recommendOutfit Wrapper] No items available for recommendation (available <= selected). Returning empty.");
        return { recommendations: [] };
      }


      // Call the flow with the input received from the page component
      const result = await recommendOutfitFlow(input);
      console.log("[recommendOutfit Wrapper] Flow returned:", JSON.stringify(result, null, 2));
      return result;

   } catch (error: any) {
        console.error("[recommendOutfit Wrapper] Error executing recommendOutfit flow:", error.message || error);
        // Return empty on error to prevent breaking the UI
         return { recommendations: [] };
   }
}
