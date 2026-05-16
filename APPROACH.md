# Approach

## Prompt Structure

The system prompt defines the model as a layout transformation agent. It explains the artboard, node schema, absolute coordinates, normalized coordinates, semantic roles, and the required strict JSON response shape.

## Safe JSON Transformations

The backend validates both incoming and outgoing layouts. Common operations are handled in code instead of relying entirely on the LLM:

- `convertAspectRatio`
- `resizeArtboard`
- `moveNode`
- `resizeNode`
- `changeNodeColor`

This keeps coordinate math deterministic while still allowing the LLM to reason about user intent.

## Conversation Context

The frontend sends the last six messages to the backend with each request. It also tracks the last modified element, so follow-up instructions like "make it bigger" can refer to the previously edited node.

## Trade-Offs

The wireframe preview is intentionally approximate. It is meant to confirm layout movement and sizing, not reproduce the original design pixel-perfectly. With more time, I would add richer role detection, visual grouping, drag controls, and a deployment pipeline for AWS Amplify plus Elastic Beanstalk.

