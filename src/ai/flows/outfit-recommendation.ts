
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

// Simplified Input: Only needs available items and optional preferences
const RecommendOutfitInputSchema = z.object({
  stylePreferences: z
    .string()
    .optional()
    .describe('Optional user-specified style preferences, such as "business casual", "streetwear", "summer vacation", etc.'),
  availableItemIds: z.array(z.string()).min(1).describe('List of ALL available clothing item IDs in the store for potential recommendation.'),
  // Removed selectedItems and previouslyViewedItems
});
export type RecommendOutfitInput = z.infer<typeof RecommendOutfitInputSchema>;

const OutfitRecommendationSchema = z.object({
  clothingItemId: z.string().describe('The ID of the recommended clothing item.'),
  // Removed the individual 'reason' per item, focus is on the overall outfit reason
  // reason: z.string().describe('A concise explanation of why this item is part of the outfit.'),
});
export type OutfitRecommendation = z.infer<typeof OutfitRecommendationSchema>;

// Updated Output: Includes an overall reason for the suggested outfit
const RecommendOutfitOutputSchema = z.object({
  recommendations: z.array(OutfitRecommendationSchema).min(2).max(5).describe('A list of 2 to 5 clothing items that form a cohesive outfit.'),
  outfitReason: z.string().optional().describe('A concise explanation for why these items work well together as an outfit, considering the style preference if provided.'),
});
export type RecommendOutfitOutput = z.infer<typeof RecommendOutfitOutputSchema>;


// Removed the assessStyleRulesTool


// Define the main prompt without the tool
const recommendOutfitPrompt = ai.definePrompt({
    name: 'recommendOutfitPrompt',
    // System prompt instructing the model
    system: `You are a helpful fashion assistant and stylist for AMS Boutique. Your goal is to create a complete and stylish outfit suggestion consisting of 2 to 5 items from the available inventory.
- Base the outfit primarily on common fashion principles (e.g., category pairing like top + bottom + optional layer/accessory, color coordination, occasion suitability).
- If the user provides 'stylePreferences', prioritize creating an outfit that fits that style (e.g., 'business casual', 'beachwear', 'night out'). If no preference is given, suggest a versatile 'smart casual' outfit.
- Select items *only* from the provided 'availableItemIds' list. Do NOT invent items.
- Aim for a balanced outfit. Include a top and a bottom at minimum. Consider adding a third piece like outerwear, a dress (counts as top+bottom), or a relevant accessory if appropriate for the style.
- Provide a brief, engaging 'outfitReason' explaining why the suggested items form a good outfit, mentioning the style it fits.
- Ensure the final output is a JSON object matching the specified format, containing an array named 'recommendations' (with item IDs only) and the optional 'outfitReason'.
- **CRITICAL**: ONLY recommend items that are present in the 'availableItemIds' list.`,
    // No tools needed for this version
    tools: [],
    // Input schema for the prompt
    input: {
        schema: RecommendOutfitInputSchema,
    },
    // Output schema expected from the model
    output: {
        schema: RecommendOutfitOutputSchema,
    },
    // User prompt template (Handlebars)
    prompt: `Please suggest a complete outfit (2-5 items) for me from the available items.
{{#if stylePreferences}}My Style Preference: {{{stylePreferences}}}{{else}}Style Preference: Smart Casual (default){{/if}}

Full list of Available Item IDs in Store: {{#each availableItemIds}} {{this}}{{#unless @last}},{{/unless}}{{/each}}

**Instructions:**
1. Select 2-5 items from the 'availableItemIds' list that create a cohesive outfit matching the specified (or default) style preference.
2. Ensure the outfit includes at least a top and a bottom (or a dress equivalent).
3. Provide an 'outfitReason' explaining the overall look.
4. Format the output as specified in the output schema (recommendations array with clothingItemId only, and optional outfitReason).
5. ONLY use items from the available list.`,
});


// Flow definition using the prompt
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
     if (!input.availableItemIds || input.availableItemIds.length === 0) {
       console.error("[recommendOutfitFlow] Error: No availableItemIds provided to the flow. Cannot generate recommendations. Returning empty.");
       // Return an empty structure matching the output schema
       return { recommendations: [], outfitReason: "Error: No items available to create an outfit from." };
     }
     if (input.availableItemIds.length < 2) {
        console.warn("[recommendOutfitFlow] Warning: Fewer than 2 items available. Cannot create a full outfit. Returning empty.");
        return { recommendations: [], outfitReason: "Not enough items available to suggest an outfit." };
     }


    // Call the AI model with the prompt and input
    console.log("[recommendOutfitFlow] Calling recommendOutfitPrompt...");
    const response = await recommendOutfitPrompt(input);
    const output = response.output();

    console.log("[recommendOutfitFlow] Raw AI Response Output:", JSON.stringify(output, null, 2));

    // --- Post-processing and Validation ---
    if (!output || !output.recommendations || !Array.isArray(output.recommendations)) {
      console.warn("[recommendOutfitFlow] AI did not return a valid 'recommendations' array structure or returned null/undefined. Returning empty.");
      return { recommendations: [], outfitReason: "AI failed to generate a valid response structure." };
    }

     if (output.recommendations.length < 2) {
       console.warn(`[recommendOutfitFlow] AI returned fewer than 2 items (${output.recommendations.length}). Returning empty as it's not a full outfit.`);
       return { recommendations: [], outfitReason: "AI suggested too few items for a complete outfit." };
     }

    // Validate recommendations against input constraints (Safety Net)
    const availableSet = new Set(input.availableItemIds);
    let invalidCount = 0;

    const validatedRecommendations = output.recommendations.filter(rec => {
        const isAvailable = availableSet.has(rec.clothingItemId);
        if (!isAvailable) {
            console.warn(`[recommendOutfitFlow Validation] Filtering out recommendation ID ${rec.clothingItemId} because it's NOT in the available list.`);
            invalidCount++;
        }
        return isAvailable;
    }).slice(0, 5); // Ensure we strictly adhere to max 5 *after* validation

     if (invalidCount > 0) {
        console.warn(`[recommendOutfitFlow Validation] Post-validation filtered out ${invalidCount} invalid recommendations (item not available). Initial count: ${output.recommendations.length}, Final count: ${validatedRecommendations.length}`);
     } else if (validatedRecommendations.length < output.recommendations.length) {
         console.log(`[recommendOutfitFlow Validation] Trimmed AI recommendations from ${output.recommendations.length} to ${validatedRecommendations.length} to meet max limit.`);
     } else {
          console.log("[recommendOutfitFlow Validation] All AI recommendations passed validation checks.");
     }

     // If validation removed too many items, return empty
     if (validatedRecommendations.length < 2) {
        console.warn(`[recommendOutfitFlow Validation] After validation, fewer than 2 items remain (${validatedRecommendations.length}). Returning empty.`);
        return { recommendations: [], outfitReason: "Could not form a valid outfit with available items after AI suggestion." };
     }


    console.log(`[recommendOutfitFlow] Final Validated Recommendations (${validatedRecommendations.length}):`, JSON.stringify(validatedRecommendations, null, 2));
    // Return the validated and capped recommendations with the outfit reason
    return {
        recommendations: validatedRecommendations,
        outfitReason: output.outfitReason // Pass through the reason from the AI
    };
  }
);


// Export the main wrapper function for external use
export async function recommendOutfit(input: RecommendOutfitInput): Promise<RecommendOutfitOutput> {
  try {
      console.log("[recommendOutfit Wrapper] Initiating outfit recommendation with input:", JSON.stringify(input, null, 2));

      // --- Input Validation in Wrapper (Guard Clause) ---
      if (!input.availableItemIds || input.availableItemIds.length === 0) {
           console.error("[recommendOutfit Wrapper] Error: availableItemIds MUST be provided by the caller. Returning empty.");
           return { recommendations: [], outfitReason: "Input Error: Missing available items." };
      }
       if (input.availableItemIds.length < 2) {
           console.warn("[recommendOutfit Wrapper] Warning: Fewer than 2 items available in input. Cannot generate outfit. Returning empty.");
            return { recommendations: [], outfitReason: "Input Error: Not enough items to form an outfit." };
       }


      // Call the flow with the input received from the page component
      const result = await recommendOutfitFlow(input);
      console.log("[recommendOutfit Wrapper] Flow execution completed. Result:", JSON.stringify(result, null, 2));
      return result;

   } catch (error: any) {
        console.error("[recommendOutfit Wrapper] CRITICAL ERROR executing recommendOutfit flow:", error.message || error, error.stack);
        // Return empty structure on error
         return { recommendations: [], outfitReason: "An unexpected error occurred during generation." };
   }
}


// Dummy data (keep for reference, but not used by the flow directly anymore)
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
