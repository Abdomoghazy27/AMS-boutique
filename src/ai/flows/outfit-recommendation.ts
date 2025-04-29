
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
    .describe('The IDs of clothing items the user has explicitly selected to build an outfit around by clicking "Consider for Outfit".'),
  stylePreferences: z
    .string()
    .optional()
    .describe('The user specified style preferences, such as "business casual" or "streetwear".'),
  previouslyViewedItems: z
    .array(z.string())
    .optional()
    .describe('The IDs of clothing items the user has previously viewed, which might indicate preferences.'),
  // Tool/Prompt needs the full list to consider *all* possibilities
  availableItemIds: z.array(z.string()).describe('List of ALL available clothing item IDs in the store for potential recommendation.'),
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
    'Analyzes selected clothing items (user input) and ALL available inventory items (full catalog) to suggest complementary items based on common style principles (e.g., color coordination, category pairing). Use this tool MANDATORILY to get a list of potential recommendations that logically fit with the items the user has explicitly chosen. CRITICAL: DO NOT recommend items already present in the `selectedItems` input. The tool already filters these out, but verify the output.',
  inputSchema: z.object({
    selectedItems: z
      .array(z.string())
      .describe('The IDs of clothing items the user has selected.'),
    availableItemIds: z.array(z.string()).describe('List of ALL available clothing item IDs for potential recommendation.'),
  }),
  // Tool outputs potential recommendations (up to a reasonable limit, let the main prompt decide the final 3)
  outputSchema: z.array(OutfitRecommendationSchema).max(5).describe("List of potential complementary items (up to 5) with basic reasons, based on style rules and available inventory (excluding already selected items)."),
}, async input => {
  console.log("[assessStyleRulesTool] Input:", JSON.stringify(input));
  const recommendations: OutfitRecommendation[] = [];
  const selectedSet = new Set(input.selectedItems);

  // Filter available items to get potential candidates (excluding already selected ones)
  const potentialItems = input.availableItemIds.filter(id => !selectedSet.has(id));
  console.log(`[assessStyleRulesTool] Potential candidates (available excluding selected): ${potentialItems.length} items`);

  if (potentialItems.length === 0) {
      console.warn("[assessStyleRulesTool] No potential items left after filtering selected items. Returning empty.");
      return [];
  }

  // --- Placeholder Dummy Logic ---
  // TODO: Replace with actual logic fetching item details and applying style rules.
  // This simple logic just picks the first few potential items.

  // Example: Try to find a top if bottoms are selected, or bottoms if top is selected
  // (Simplified IDs for example - use actual category/type data in real implementation)
  const selectedItemDetails = input.selectedItems
                                  .map(id => dummyItems.find(item => item.id === id))
                                  .filter(item => item !== undefined);

  const needsTop = selectedItemDetails.some(item => ['Jeans', 'Pants', 'Skirts', 'Shorts'].includes(item!.category));
  const needsBottom = selectedItemDetails.some(item => ['T-Shirts', 'Shirts', 'Tops', 'Sweaters'].includes(item!.category));

  const potentialItemDetails = potentialItems
                                .map(id => dummyItems.find(item => item.id === id))
                                .filter(item => item !== undefined);

  if (needsTop) {
      const topCandidates = potentialItemDetails.filter(item => ['T-Shirts', 'Shirts', 'Tops', 'Sweaters'].includes(item!.category));
      for (const candidate of topCandidates) {
          if (recommendations.length >= 5) break;
          recommendations.push({ clothingItemId: candidate!.id, reason: `Pairs well with your selected bottom (${candidate!.category}).` });
          potentialItems.splice(potentialItems.indexOf(candidate!.id), 1); // Remove used item
      }
  }

  if (needsBottom) {
       const bottomCandidates = potentialItemDetails.filter(item => ['Jeans', 'Pants', 'Skirts', 'Shorts'].includes(item!.category));
       for (const candidate of bottomCandidates) {
          if (recommendations.length >= 5) break;
          recommendations.push({ clothingItemId: candidate!.id, reason: `Completes the look with your selected top (${candidate!.category}).` });
          potentialItems.splice(potentialItems.indexOf(candidate!.id), 1); // Remove used item
       }
  }

  // Add generic recommendations if needed, up to 5, from remaining potential items
  let potentialIndex = 0;
  while (recommendations.length < 5 && potentialIndex < potentialItems.length) {
      recommendations.push({
          clothingItemId: potentialItems[potentialIndex],
          reason: `A versatile option (ID: ${potentialItems[potentialIndex]}) to consider.`
      });
      potentialIndex++;
  }
  // --- End Placeholder Logic ---

  console.log(`[assessStyleRulesTool] Generated ${recommendations.length} Raw Recommendations (max 5):`, JSON.stringify(recommendations));
  return recommendations; // Return up to 5 recommendations for the LLM to choose from
});

// Define the main prompt using the tool
const recommendOutfitPrompt = ai.definePrompt({
    name: 'recommendOutfitPrompt',
    // System prompt instructing the model
    system: `You are a helpful fashion assistant and stylist for AMS Boutique. Your goal is to recommend exactly 1 to 3 clothing items that complement the items the user has explicitly selected (by clicking 'Consider for Outfit').
- Analyze the user's selected items (provided by 'selectedItems' in the input).
- Consider their optional style preferences and previously viewed items for hints about their taste.
- **MANDATORY**: You MUST use the 'assessStyleRulesTool'. This tool analyzes the user's selections against the *entire* available inventory ('availableItemIds') and provides a list of potential complementary items (up to 5) based on basic style rules.
- From the **tool's output ONLY**, select the BEST recommendations (1 to 3 items maximum). Prioritize items that directly complement the selected items and create a cohesive, stylish outfit.
- **Refine the reason** provided by the tool for each selected recommendation. Make the reason more engaging, specific, and descriptive for the user. Explain *why* it complements the look (e.g., "This vibrant color contrasts nicely with...", "The silhouette balances the...", "Perfect for layering over...").
- Ensure the final output is a JSON object matching the specified format, containing an array named 'recommendations' with 1 to 3 items.
- **CRITICAL**: ONLY recommend items that were present in the output of the 'assessStyleRulesTool'. Do NOT invent recommendations or pick items directly from the 'availableItemIds' list.
- **CRITICAL**: Double-check that you DO NOT recommend items that are already listed in the user's 'selectedItems'. The tool should prevent this, but verify.
- If the tool returns 0 items, or if you cannot find suitable items from the tool's output, return an empty 'recommendations' array: { "recommendations": [] }.`,
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
    prompt: `Please recommend 1-3 complementary clothing items based on my current selections.

Items I'm Considering (selectedItems): {{#if selectedItems}} {{#each selectedItems}} {{this}}{{#unless @last}}, {{/unless}}{{/each}} {{else}} None {{/if}}
{{#if stylePreferences}}My Style Preference: {{{stylePreferences}}}{{/if}}
{{#if previouslyViewedItems}}Previously Viewed Item IDs: {{#each previouslyViewedItems}} {{this}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
Full list of Available Item IDs in Store: {{#each availableItemIds}} {{this}}{{#unless @last}},{{/unless}}{{/each}}

**Instructions:**
1. Use the 'assessStyleRulesTool' with my 'selectedItems' and the full 'availableItemIds' list to get initial suggestions.
2. Choose the best 1-3 suggestions *only* from the tool's output.
3. Provide refined, user-friendly reasons explaining *why* each item complements the selections.
4. Ensure recommendations are NOT duplicates of my 'selectedItems'.
5. Format the output as specified in the output schema. If no suitable suggestions are found from the tool, return { "recommendations": [] }.`,
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
      console.log("[recommendOutfitFlow] No items selected by user, returning empty recommendations.");
      return { recommendations: [] };
    }
     if (!input.availableItemIds || input.availableItemIds.length === 0) {
       console.error("[recommendOutfitFlow] Error: No availableItemIds provided to the flow. Cannot generate recommendations. Returning empty.");
       return { recommendations: [] }; // Return empty to prevent crashes
     }
     const potentialItemCount = input.availableItemIds.filter(id => !input.selectedItems.includes(id)).length;
     if (potentialItemCount === 0) {
        console.warn("[recommendOutfitFlow] No items available for recommendation (all available items are already selected). Returning empty.");
        return { recommendations: [] };
     }


    // Call the AI model with the prompt, input, and available tools
    console.log("[recommendOutfitFlow] Calling recommendOutfitPrompt...");
    const response = await recommendOutfitPrompt(input);
    const output = response.output();

    console.log("[recommendOutfitFlow] Raw AI Response Output:", JSON.stringify(output, null, 2));

    // --- Post-processing and Validation ---
    if (!output || !output.recommendations) {
      console.warn("[recommendOutfitFlow] AI did not return a valid 'recommendations' structure or returned null/undefined. Returning empty.");
      return { recommendations: [] };
    }

    // Validate recommendations against input constraints (Safety Net)
    const selectedSet = new Set(input.selectedItems);
    const availableSet = new Set(input.availableItemIds); // Use the *full* available list for validation
    let invalidCount = 0;

    // Retrieve the tool call and its output from the response for stricter validation
    const toolCalls = response.toolCalls();
    const toolOutputs = response.toolOutput();
    let toolRecommendedIds: Set<string> | null = null;

    if (toolCalls && toolCalls.length > 0 && toolOutputs && toolOutputs.length > 0) {
        try {
            const toolCall = toolCalls.find(call => call.toolRequest.name === 'assessStyleRules');
            const toolOutput = toolOutputs.find(out => out.toolRequest.name === 'assessStyleRules');
            if (toolCall && toolOutput) {
                 console.log("[recommendOutfitFlow Validation] Found assessStyleRulesTool call.");
                 // Assuming tool output is an array of { clothingItemId: string, reason: string }
                 const parsedOutput = toolOutput.toolResponse.output as Array<OutfitRecommendation>;
                 if (Array.isArray(parsedOutput)) {
                    toolRecommendedIds = new Set(parsedOutput.map(rec => rec.clothingItemId));
                    console.log("[recommendOutfitFlow Validation] Tool recommended IDs:", Array.from(toolRecommendedIds));
                 } else {
                    console.warn("[recommendOutfitFlow Validation] Tool output was not in the expected array format.");
                 }

            } else {
                console.warn("[recommendOutfitFlow Validation] Could not find matching tool call/output for assessStyleRulesTool in the response.");
            }
        } catch (e) {
             console.error("[recommendOutfitFlow Validation] Error processing tool output from response:", e);
        }
    } else {
         console.warn("[recommendOutfitFlow Validation] AI response did not contain tool calls or outputs. This is unexpected as the tool is mandatory.");
         // If the tool didn't run, we can't validate against its output, rely on other checks.
    }


    const validatedRecommendations = output.recommendations.filter(rec => {
        const isAvailable = availableSet.has(rec.clothingItemId);
        const isNotSelected = !selectedSet.has(rec.clothingItemId);
        // Stricter check: Was it recommended by the tool? Only apply if tool output was successfully parsed.
        const wasRecommendedByTool = toolRecommendedIds ? toolRecommendedIds.has(rec.clothingItemId) : true; // Assume true if tool output missing

        const isValid = isAvailable && isNotSelected && wasRecommendedByTool;

        if (!isAvailable) {
            console.warn(`[recommendOutfitFlow Validation] Filtering out recommendation ID ${rec.clothingItemId} because it's NOT in the available list.`);
            invalidCount++;
        }
        if (!isNotSelected) {
             console.warn(`[recommendOutfitFlow Validation] Filtering out recommendation ID ${rec.clothingItemId} because it WAS already selected by the user.`);
            invalidCount++;
        }
         if (!wasRecommendedByTool && toolRecommendedIds) { // Only log if we have tool output to compare against
             console.warn(`[recommendOutfitFlow Validation] Filtering out recommendation ID ${rec.clothingItemId} because it was NOT present in the assessStyleRulesTool output.`);
            invalidCount++;
         }
        return isValid;
    }).slice(0, 3); // Ensure we strictly adhere to max 3 *after* validation

     if (invalidCount > 0) {
        console.warn(`[recommendOutfitFlow Validation] Post-validation filtered out ${invalidCount} invalid recommendations. Initial count: ${output.recommendations.length}, Final count: ${validatedRecommendations.length}`);
     } else if (validatedRecommendations.length < output.recommendations.length) {
         console.log(`[recommendOutfitFlow Validation] Trimmed AI recommendations from ${output.recommendations.length} to ${validatedRecommendations.length} to meet max limit.`);
     } else {
          console.log("[recommendOutfitFlow Validation] All AI recommendations passed validation checks.");
     }


    console.log(`[recommendOutfitFlow] Final Validated Recommendations (${validatedRecommendations.length}):`, JSON.stringify(validatedRecommendations, null, 2));
    // Return the validated and capped recommendations
    return { recommendations: validatedRecommendations };
  }
);


// Export the main wrapper function for external use
export async function recommendOutfit(input: RecommendOutfitInput): Promise<RecommendOutfitOutput> {
  try {
      console.log("[recommendOutfit Wrapper] Initiating outfit recommendation with input:", JSON.stringify(input, null, 2));

      // --- Input Validation in Wrapper (Guard Clause) ---
      if (!input.availableItemIds || input.availableItemIds.length === 0) {
           console.error("[recommendOutfit Wrapper] Error: availableItemIds MUST be provided by the caller. Returning empty.");
           return { recommendations: [] };
      }
      if (!input.selectedItems || input.selectedItems.length === 0) {
           console.log("[recommendOutfit Wrapper] No items selected by user for recommendation input. Returning empty.");
           return { recommendations: [] };
      }
      const potentialItemCount = input.availableItemIds.filter(id => !input.selectedItems.includes(id)).length;
       if (potentialItemCount === 0) {
         console.warn("[recommendOutfit Wrapper] No items available for recommendation (all available items are already selected). Returning empty.");
         return { recommendations: [] };
       }


      // Call the flow with the input received from the page component
      const result = await recommendOutfitFlow(input);
      console.log("[recommendOutfit Wrapper] Flow execution completed. Result:", JSON.stringify(result, null, 2));
      return result;

   } catch (error: any) {
        console.error("[recommendOutfit Wrapper] CRITICAL ERROR executing recommendOutfit flow:", error.message || error, error.stack);
        // Return empty on error to prevent breaking the UI
         return { recommendations: [] };
   }
}


// Dummy data needed for the placeholder tool logic
const dummyItems = [
    { id: '1', name: 'Classic White Tee', category: 'T-Shirts', price: 25.00, sizes: ['S', 'M', 'L', 'XL'], colors: ['White', 'Black', 'Gray'], imageUrl: '' , description: ''},
    { id: '2', name: 'Slim Fit Jeans', category: 'Jeans', price: 75.50, sizes: ['28', '30', '32', '34', '36'], colors: ['Dark Wash', 'Light Wash', 'Black'], imageUrl: '', description: '' },
    { id: '3', name: 'Floral Sundress', category: 'Dresses', price: 89.99, sizes: ['XS', 'S', 'M', 'L'], colors: ['Pink Floral', 'Blue Floral', 'Yellow Floral'], isOnSale: true, salePrice: 69.99, imageUrl: '', description: '' },
    { id: '4', name: 'Cozy Knit Sweater', category: 'Sweaters', price: 65.00, sizes: ['S', 'M', 'L', 'XL'], colors: ['Cream', 'Navy', 'Burgundy'], imageUrl: '', description: '' },
    { id: '5', name: 'Casual Chinos', category: 'Pants', price: 55.00, sizes: ['30', '32', '34', '36'], colors: ['Khaki', 'Olive', 'Gray'], imageUrl: '', description: '' },
    { id: '6', name: 'Leather Jacket', category: 'Outerwear', price: 199.99, sizes: ['S', 'M', 'L'], colors: ['Black', 'Brown'], imageUrl: '', description: '' },
    { id: '7', name: 'Striped Button-Down Shirt', category: 'Shirts', price: 49.50, sizes: ['S', 'M', 'L', 'XL'], colors: ['Blue/White Stripe', 'Gray/White Stripe'], imageUrl: '', description: '' },
    { id: '8', name: 'Denim Skirt', category: 'Skirts', price: 45.00, sizes: ['XS', 'S', 'M', 'L'], colors: ['Blue Denim', 'Black Denim'], isOnSale: true, salePrice: 35.00, imageUrl: '', description: '' },
    { id: '9', name: 'Graphic Hoodie', category: 'Sweaters', price: 68.00, sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Black', 'Heather Gray', 'Navy'], imageUrl: '', description: '' },
    { id: '10', name: 'Maxi Dress', category: 'Dresses', price: 120.00, sizes: ['S', 'M', 'L'], colors: ['Emerald Green', 'Deep Red', 'Navy Blue'], imageUrl: '', description: '' },
    { id: '11', name: 'Bomber Jacket', category: 'Outerwear', price: 95.00, sizes: ['S', 'M', 'L', 'XL'], colors: ['Olive Green', 'Black', 'Maroon'], isTrending: true, imageUrl: '', description: '' },
    { id: '12', name: 'Polo Shirt', category: 'Shirts', price: 39.95, sizes: ['S', 'M', 'L', 'XL'], colors: ['White', 'Navy', 'Red', 'Green'], isOnSale: true, salePrice: 29.95, imageUrl: '', description: '' },
    { id: '13', name: 'Pleated Midi Skirt', category: 'Skirts', price: 62.00, sizes: ['XS', 'S', 'M', 'L'], colors: ['Blush Pink', 'Black', 'Forest Green'], imageUrl: '', description: '' },
    { id: '14', name: 'Linen Blend Trousers', category: 'Pants', price: 69.00, sizes: ['S', 'M', 'L', 'XL'], colors: ['Beige', 'White', 'Light Blue'], imageUrl: '', description: '' },
    { id: '15', name: 'Cashmere Scarf', category: 'Accessories', price: 85.00, sizes: ['One Size'], colors: ['Camel', 'Charcoal Gray', 'Light Pink'], imageUrl: '', description: '' },
    { id: '16', name: 'V-Neck Blouse', category: 'Shirts', price: 48.00, sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Ivory', 'Black', 'Dusty Rose'], imageUrl: '', description: '' },
    { id: '17', name: 'Wool Blend Coat', category: 'Outerwear', price: 250.00, sizes: ['S', 'M', 'L'], colors: ['Camel', 'Gray', 'Black'], isOnSale: true, salePrice: 199.99, imageUrl: '', description: '' },
    { id: '18', name: 'Canvas Tote Bag', category: 'Accessories', price: 35.00, sizes: ['One Size'], colors: ['Natural', 'Navy Stripe', 'Black'], imageUrl: '', description: '' },
    { id: '19', name: 'High-Waisted Shorts', category: 'Shorts', price: 42.00, sizes: ['XS', 'S', 'M', 'L'], colors: ['Denim Blue', 'White', 'Khaki'], imageUrl: '', description: '' },
    { id: '20', name: 'Silk Camisole', category: 'Tops', price: 58.00, sizes: ['S', 'M', 'L'], colors: ['Champagne', 'Black', 'Silver'], isTrending: true, imageUrl: '', description: '' }
  ];

// Add a type definition for the dummy data structure if needed elsewhere
export type DummyItem = typeof dummyItems[0];
