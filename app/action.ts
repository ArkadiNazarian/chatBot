'use server'

import { OpenRouter } from '@openrouter/sdk'
import { NextRequest, NextResponse } from 'next/server'

export async function postMessage() {
    const openrouter = new OpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
    });

    // Stream the response to get reasoning tokens in usage
    const stream = await openrouter.chat.send({
        chatRequest: {
            model: "nvidia/nemotron-3.5-lightning:free",
            messages: [
                {
                    role: "user",
                    content: "How many r's are in the word 'strawberry'?"
                }
            ],
            stream: true
        }
    });

    let response = "";
    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
            response += content;
            process.stdout.write(content);
        }

        if (chunk.usage) {
            console.log("\nReasoning tokens:", chunk.usage.completionTokensDetails?.reasoningTokens);
        }
    }

    return {
        response
    }
}