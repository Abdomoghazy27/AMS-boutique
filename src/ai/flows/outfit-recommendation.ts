
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
import { ClothingItem } from '@/services/clothing'; // Import ClothingItem type

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
// Removed min(2) constraint to allow graceful error handling return without schema validation failure
const RecommendOutfitOutputSchema = z.object({
  recommendations: z.array(OutfitRecommendationSchema).max(5).describe('A list of up to 5 clothing items that form a cohesive outfit.'),
  outfitReason: z.string().optional().describe('A concise explanation for why these items work well together as an outfit, considering the style preference if provided. Can also contain error messages.'),
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
- Select items *only* from the provided 'availableItemIds' list. Do NOT invent items. Your response MUST ONLY include IDs from this list.
- Aim for a balanced outfit. Include a top and a bottom at minimum. Consider adding a third piece like outerwear, a dress (counts as top+bottom), or a relevant accessory if appropriate for the style.
- Provide a brief, engaging 'outfitReason' explaining why the suggested items form a good outfit, mentioning the style it fits.
- Ensure the final output is a JSON object matching the specified format, containing an array named 'recommendations' (with item IDs only) and the optional 'outfitReason'.
- **CRITICAL**: ONLY recommend items that are present in the 'availableItemIds' list. Double-check your response to ensure every recommended ID is from the provided list.`,
    // No tools needed for this version
    tools: [],
    // Input schema for the prompt
    input: {
        schema: RecommendOutfitInputSchema,
    },
    // Output schema expected from the model
    output: {
        // This schema defines what we ASK the LLM for. Still asking for min 2 items.
        schema: z.object({
            recommendations: z.array(OutfitRecommendationSchema).min(2).max(5).describe('A list of 2 to 5 clothing items that form a cohesive outfit.'),
            outfitReason: z.string().optional().describe('A concise explanation for why these items work well together as an outfit, considering the style preference if provided.'),
        }),
    },
    // User prompt template (Handlebars)
    // Simplified prompt to be more direct
    prompt: `Suggest a complete outfit (2-5 items) from the available items.
{{#if stylePreferences}}Style Preference: {{{stylePreferences}}}{{else}}Style Preference: Smart Casual{{/if}}

Available Item IDs: {{#each availableItemIds}} {{this}}{{#unless @last}},{{/unless}}{{/each}}

Instructions:
1. Select 2-5 items from the 'Available Item IDs' list to form a cohesive outfit matching the style preference.
2. Include at least a top and a bottom (or equivalent like a dress).
3. Provide an 'outfitReason'.
4. Output ONLY JSON matching the required schema ('recommendations' array of objects with 'clothingItemId', and 'outfitReason' string).
5. CRITICAL: Only use IDs from the 'Available Item IDs' list.`,
});


// Flow definition using the prompt
const recommendOutfitFlow = ai.defineFlow<
  typeof RecommendOutfitInputSchema,
  typeof RecommendOutfitOutputSchema // This now uses the updated schema without min(2)
>(
  {
    name: 'recommendOutfitFlow',
    inputSchema: RecommendOutfitInputSchema,
    outputSchema: RecommendOutfitOutputSchema, // Flow output validation uses the updated schema
  },
  async (input) => {
    const flowStartTime = Date.now();
    console.log(`[recommendOutfitFlow @ ${flowStartTime}] Input received:`, JSON.stringify(input, null, 2));

    // --- Input Validation ---
    if (!input.availableItemIds || input.availableItemIds.length === 0) {
      const errorTime = Date.now();
      console.error(`[recommendOutfitFlow @ ${errorTime}] Error: No availableItemIds provided to the flow. Cannot generate recommendations.`);
      // This return value is now valid according to the updated RecommendOutfitOutputSchema
      return { recommendations: [], outfitReason: "Internal Error: No items were available to select from." };
    }
    if (input.availableItemIds.length < 2) {
       const warnTime = Date.now();
       console.warn(`[recommendOutfitFlow @ ${warnTime}] Warning: Fewer than 2 items available (${input.availableItemIds.length}). Cannot create a full outfit.`);
       // This return value is now valid according to the updated RecommendOutfitOutputSchema
       return { recommendations: [], outfitReason: "Not enough unique items available in the store to suggest a full outfit." };
    }
    console.log(`[recommendOutfitFlow @ ${Date.now()}] Input validation passed. ${input.availableItemIds.length} available items.`);

    // --- Call the AI model ---
    let response;
    // Define output type based on the *prompt's* output schema (which still has min(2))
    let promptOutput: z.infer<typeof recommendOutfitPrompt.outputSchema> | null | undefined;
    try {
      const callStartTime = Date.now();
      console.log(`[recommendOutfitFlow @ ${callStartTime}] Calling recommendOutfitPrompt...`);
      response = await recommendOutfitPrompt(input);
      // Access output using response.output()
      promptOutput = response?.output(); // Use optional chaining in case response is unexpected
      const callEndTime = Date.now();
      console.log(`[recommendOutfitFlow @ ${callEndTime}] Raw AI Response Output (took ${callEndTime - callStartTime}ms):`, JSON.stringify(promptOutput, null, 2));

      // Check if the output method exists and the result is valid *before* accessing further
      if (typeof response?.output !== 'function' || !promptOutput) {
          throw new Error("Invalid response structure from AI model - output() method missing or returned null/undefined.");
      }

    } catch (aiError: any) {
        const errorTime = Date.now();
         // Log detailed error information if possible
        console.error(`[recommendOutfitFlow @ ${errorTime}] CRITICAL ERROR during AI prompt call. Message: ${aiError?.message}. Details:`, aiError);
         // This return value is now valid according to the updated RecommendOutfitOutputSchema
         return { recommendations: [], outfitReason: `AI Generation Error: ${aiError?.message || 'Failed to get a valid response from the AI model.'}` };
    }


    // --- Post-processing and Validation ---
    // Use the promptOutput variable which holds the result of response.output()
    if (!promptOutput || !promptOutput.recommendations || !Array.isArray(promptOutput.recommendations)) {
      const warnTime = Date.now();
      // Add logging for the raw response from the AI before it's processed
      console.warn(`[recommendOutfitFlow @ ${warnTime}] AI response issue: Invalid 'recommendations' structure or null/undefined output. Raw response object:`, response?.response()); // Log raw response if available
      console.warn(`[recommendOutfitFlow @ ${warnTime}] Parsed output object:`, JSON.stringify(promptOutput, null, 2));
      // This return value is now valid according to the updated RecommendOutfitOutputSchema
      return { recommendations: [], outfitReason: "AI Response Error: The format of the generated response was unexpected." };
    }

     // Check against the AI's *intended* output constraints (min 2)
     if (promptOutput.recommendations.length < 2) {
       const warnTime = Date.now();
       console.warn(`[recommendOutfitFlow @ ${warnTime}] AI returned fewer than 2 items (${promptOutput.recommendations.length}). Output:`, JSON.stringify(promptOutput.recommendations));
       // This return value is now valid according to the updated RecommendOutfitOutputSchema
       return { recommendations: [], outfitReason: "AI Suggestion Error: Suggested outfit has too few items." };
     }
     if (promptOutput.recommendations.length > 5) {
       const warnTime = Date.now();
       console.warn(`[recommendOutfitFlow @ ${warnTime}] AI returned more than 5 items (${promptOutput.recommendations.length}). Will truncate. Output:`, JSON.stringify(promptOutput.recommendations));
       // We will truncate after validation anyway
     }

    // Validate recommendations against input constraints (Safety Net)
    const availableSet = new Set(input.availableItemIds);
    let invalidCount = 0;
    let duplicateCount = 0;
    const seenIds = new Set<string>();

    console.log(`[recommendOutfitFlow @ ${Date.now()}] Starting validation of ${promptOutput.recommendations.length} raw recommendations against ${availableSet.size} available IDs.`);

    // Use promptOutput here for validation
    const validatedRecommendations = promptOutput.recommendations.map((rec, index) => {
        // Check 1: Does the recommendation have a valid ID string?
         if (!rec || typeof rec.clothingItemId !== 'string' || !rec.clothingItemId) {
            console.warn(`[recommendOutfitFlow Validation @ ${Date.now()}] Filtering out invalid recommendation at index ${index}: Missing or invalid 'clothingItemId'. Rec:`, JSON.stringify(rec));
            invalidCount++;
            return null; // Invalid structure
         }

        const itemId = rec.clothingItemId;

        // Check 2: Is the item ID actually available?
        const isAvailable = availableSet.has(itemId);
        if (!isAvailable) {
            console.warn(`[recommendOutfitFlow Validation @ ${Date.now()}] Filtering out recommendation ID ${itemId} because it's NOT in the available list.`);
            invalidCount++;
            return null; // Not available
        }

        // Check 3: Is this a duplicate within the recommendations?
        if (seenIds.has(itemId)) {
             console.warn(`[recommendOutfitFlow Validation @ ${Date.now()}] Filtering out duplicate recommendation ID ${itemId}.`);
             duplicateCount++;
             return null; // Duplicate
        }

        seenIds.add(itemId);
        // Return the simplified structure expected by RecommendOutfitOutputSchema
        return { clothingItemId: itemId };

    }).filter((rec): rec is OutfitRecommendation => rec !== null) // Filter out nulls and type guard
      .slice(0, 5); // Ensure we strictly adhere to max 5 *after* validation


     // --- Final Checks and Return ---
     const validationEndTime = Date.now();
     console.log(`[recommendOutfitFlow Validation @ ${validationEndTime}] Finished validation. ${invalidCount} invalid IDs, ${duplicateCount} duplicates removed. Initial count: ${promptOutput.recommendations.length}, Final count: ${validatedRecommendations.length}.`);


     if (validatedRecommendations.length < 2) {
        const errorTime = Date.now();
        console.warn(`[recommendOutfitFlow @ ${errorTime}] After validation, fewer than 2 valid items remain (${validatedRecommendations.length}). Cannot form a complete outfit.`);
        let reason = "Could not form a valid outfit suggestion.";
        if (invalidCount > 0) reason += " Some suggested items were unavailable.";
        if (duplicateCount > 0) reason += " Some duplicate items were suggested.";
        if (promptOutput.recommendations.length > 0 && validatedRecommendations.length === 0) reason = "AI suggested items that were not available in the store.";
        // This return value is now valid according to the updated RecommendOutfitOutputSchema
        return { recommendations: [], outfitReason: reason };
     }


    const flowEndTime = Date.now();
    console.log(`[recommendOutfitFlow @ ${flowEndTime}] Final Validated Recommendations (${validatedRecommendations.length}):`, JSON.stringify(validatedRecommendations, null, 2));
    console.log(`[recommendOutfitFlow @ ${flowEndTime}] Total Flow Execution Time: ${flowEndTime - flowStartTime}ms`);

    // Return the validated and capped recommendations with the outfit reason
    // The structure now matches the relaxed RecommendOutfitOutputSchema
    return {
        recommendations: validatedRecommendations,
        // Use AI reason, or provide a fallback if AI didn't include one
        outfitReason: promptOutput.outfitReason || "Here's a stylish outfit suggestion for you!"
    };
  }
);


// Export the main wrapper function for external use
export async function recommendOutfit(input: RecommendOutfitInput): Promise<RecommendOutfitOutput> {
  const wrapperStartTime = Date.now();
  try {
      console.log(`[recommendOutfit Wrapper @ ${wrapperStartTime}] Initiating outfit recommendation with input:`, JSON.stringify(input, null, 2));

      // --- Input Validation in Wrapper (Guard Clause) ---
      if (!input.availableItemIds || input.availableItemIds.length === 0) {
           const errorTime = Date.now();
           console.error(`[recommendOutfit Wrapper @ ${errorTime}] Error: availableItemIds MUST be provided by the caller.`);
           return { recommendations: [], outfitReason: "Input Error: Missing available items list." };
      }
       if (input.availableItemIds.length < 2) {
           const warnTime = Date.now();
           console.warn(`[recommendOutfit Wrapper @ ${warnTime}] Warning: Fewer than 2 items available in input (${input.availableItemIds.length}). Cannot generate outfit.`);
            return { recommendations: [], outfitReason: "Input Error: Not enough items provided to form an outfit." };
       }
      console.log(`[recommendOutfit Wrapper @ ${Date.now()}] Input validation passed.`);

      // Call the flow with the input received from the page component
      const result = await recommendOutfitFlow(input);
      const wrapperEndTime = Date.now();
      console.log(`[recommendOutfit Wrapper @ ${wrapperEndTime}] Flow execution completed. Result:`, JSON.stringify(result, null, 2));
      console.log(`[recommendOutfit Wrapper @ ${wrapperEndTime}] Total Wrapper Execution Time: ${wrapperEndTime - wrapperStartTime}ms`);
      // The result here will already match the updated RecommendOutfitOutputSchema
      return result;

   } catch (error: any) {
        const errorTime = Date.now();
        // Log the specific error encountered in the wrapper's catch block
        console.error(`[recommendOutfit Wrapper @ ${errorTime}] CRITICAL ERROR executing recommendOutfit flow: Message: ${error?.message}. Details:`, error);
        // Return empty structure on error with a specific message pointing to logs
         // This return value is now valid according to the updated RecommendOutfitOutputSchema
         return { recommendations: [], outfitReason: `An unexpected error occurred. Check server logs for details. (Error: ${error?.message || 'Unknown'})` };
   }
}


// Dummy data (keep for reference, but not used by the flow directly anymore)
const dummyItems = [
    { id: '1', name: 'Classic White Tee', category: 'T-Shirts', price: 25.00, sizes: ['S', 'M', 'L', 'XL'], colors: ['White', 'Black', 'Gray'], imageUrl: 'https://picsum.photos/seed/tee/400/300' , description: 'A versatile and comfortable cotton t-shirt.'},
    { id: '2', name: 'Slim Fit Jeans', category: 'Jeans', price: 75.50, sizes: ['28', '30', '32', '34', '36'], colors: ['Dark Wash', 'Light Wash', 'Black'], imageUrl: 'https://picsum.photos/seed/jeans/400/300', description: 'Stylish dark wash slim fit jeans.' },
    { id: '3', name: 'Floral Sundress', category: 'Dresses', price: 89.99, sizes: ['XS', 'S', 'M', 'L'], colors: ['Pink Floral', 'Blue Floral', 'Yellow Floral'], isOnSale: true, salePrice: 69.99, imageUrl: 'https://picsum.photos/seed/dress/400/300', description: 'Light and airy floral print sundress, perfect for summer.' },
    { id: '4', name: 'Cozy Knit Sweater', category: 'Sweaters', price: 65.00, sizes: ['S', 'M', 'L', 'XL'], colors: ['Cream', 'Navy', 'Burgundy'], imageUrl: 'https://picsum.photos/seed/sweater/400/300', description: 'Warm and soft knit sweater for cooler days.' },
    { id: '5', name: 'Casual Chinos', category: 'Pants', price: 55.00, sizes: ['30', '32', '34', '36'], colors: ['Khaki', 'Olive', 'Gray'], imageUrl: 'https://picsum.photos/seed/chinos/400/300', description: 'Comfortable and stylish chinos for everyday wear.' },
    { id: '6', name: 'Leather Jacket', category: 'Outerwear', price: 199.99, sizes: ['S', 'M', 'L'], colors: ['Black', 'Brown'], imageUrl: 'https://picsum.photos/seed/jacket/400/300', description: 'Classic biker style leather jacket.' },
    { id: '7', name: 'Striped Button-Down Shirt', category: 'Shirts', price: 49.50, sizes: ['S', 'M', 'L', 'XL'], colors: ['Blue/White Stripe', 'Gray/White Stripe'], imageUrl: 'https://picsum.photos/seed/shirt/400/300', description: 'A sharp striped shirt for smart-casual looks.' },
    { id: '8', name: 'Denim Skirt', category: 'Skirts', price: 45.00, sizes: ['XS', 'S', 'M', 'L'], colors: ['Blue Denim', 'Black Denim'], isOnSale: true, salePrice: 35.00, imageUrl: 'https://picsum.photos/seed/skirt/400/300', description: 'A versatile denim mini skirt.' },
    { id: '9', name: 'Graphic Hoodie', category: 'Sweaters', price: 68.00, sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Black', 'Heather Gray', 'Navy'], imageUrl: 'https://picsum.photos/seed/hoodie/400/300', description: 'Comfortable hoodie with a cool graphic print.' },
    { id: '10', name: 'Maxi Dress', category: 'Dresses', price: 120.00, sizes: ['S', 'M', 'L'], colors: ['Emerald Green', 'Deep Red', 'Navy Blue'], imageUrl: 'https://picsum.photos/seed/maxidress/400/300', description: 'Elegant flowing maxi dress for special occasions.' },
    { id: '11', name: 'Bomber Jacket', category: 'Outerwear', price: 95.00, sizes: ['S', 'M', 'L', 'XL'], colors: ['Olive Green', 'Black', 'Maroon'], isTrending: true, imageUrl: 'https://picsum.photos/seed/bomber/400/300', description: 'A trendy lightweight bomber jacket.' },
    { id: '12', name: 'Polo Shirt', category: 'Shirts', price: 39.95, sizes: ['S', 'M', 'L', 'XL'], colors: ['White', 'Navy', 'Red', 'Green'], isOnSale: true, salePrice: 29.95, imageUrl: 'https://picsum.photos/seed/polo/400/300', description: 'Classic polo shirt for a preppy look.' },
    { id: '13', name: 'Pleated Midi Skirt', category: 'Skirts', price: 62.00, sizes: ['XS', 'S', 'M', 'L'], colors: ['Blush Pink', 'Black', 'Forest Green'], imageUrl: 'https://picsum.photos/seed/midiskirt/400/300', description: 'Elegant pleated midi skirt for a sophisticated look.' },
    { id: '14', name: 'Linen Blend Trousers', category: 'Pants', price: 69.00, sizes: ['S', 'M', 'L', 'XL'], colors: ['Beige', 'White', 'Light Blue'], imageUrl: 'https://picsum.photos/seed/linentrousers/400/300', description: 'Lightweight and breathable linen blend trousers.' },
    { id: '15', name: 'Cashmere Scarf', category: 'Accessories', price: 85.00, sizes: ['One Size'], colors: ['Camel', 'Charcoal Gray', 'Light Pink'], imageUrl: 'https://picsum.photos/seed/scarf/400/300', description: 'Luxuriously soft cashmere scarf.' },
    { id: '16', name: 'V-Neck Blouse', category: 'Shirts', price: 48.00, sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Ivory', 'Black', 'Dusty Rose'], imageUrl: 'https://picsum.photos/seed/blouse/400/300', description: 'A flattering V-neck blouse, easy to dress up or down.' },
    { id: '17', name: 'Wool Blend Coat', category: 'Outerwear', price: 250.00, sizes: ['S', 'M', 'L'], colors: ['Camel', 'Gray', 'Black'], isOnSale: true, salePrice: 199.99, imageUrl: 'https://picsum.photos/seed/coat/400/300', description: 'A warm and stylish wool blend coat for winter.' },
    { id: '18', name: 'Canvas Tote Bag', category: 'Accessories', price: 35.00, sizes: ['One Size'], colors: ['Natural', 'Navy Stripe', 'Black'], imageUrl: 'https://picsum.photos/seed/totebag/400/300', description: 'Durable and spacious canvas tote bag.' },
    { id: '19', name: 'High-Waisted Shorts', category: 'Shorts', price: 42.00, sizes: ['XS', 'S', 'M', 'L'], colors: ['Denim Blue', 'White', 'Khaki'], imageUrl: 'https://picsum.photos/seed/shorts/400/300', description: 'Comfortable high-waisted shorts for warm weather.' },
    { id: '20', name: 'Silk Camisole', category: 'Tops', price: 58.00, sizes: ['S', 'M', 'L'], colors: ['Champagne', 'Black', 'Silver'], isTrending: true, imageUrl: 'https://picsum.photos/seed/camisole/400/300', description: 'A luxurious silk camisole top.' }
  ];

// Add a type definition for the dummy data structure if needed elsewhere
export type DummyItem = typeof dummyItems[0];

