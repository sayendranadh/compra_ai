import { Router } from 'express';
import { buildSystemPrompt } from '../prompts/systemPrompt.js';
import { callLLM } from '../services/llmService.js';
import { applyDeterministicInstruction } from '../services/layoutTransforms.js';
import { validateLayout, validateLLMResult } from '../utils/jsonValidator.js';

const router = Router();

router.post('/', async (req, res) => {
  const { message, layout, history = [], lastModifiedElement = null } = req.body;

  try {
    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    validateLayout(layout);

    const deterministicResult = applyDeterministicInstruction(layout, message, lastModifiedElement);
    if (deterministicResult) {
      validateLLMResult(deterministicResult);
      return res.json(deterministicResult);
    }

    const systemPrompt = buildSystemPrompt(layout, lastModifiedElement);
    const llmResult = await callLLM(systemPrompt, history, message);
    validateLLMResult(llmResult);

    return res.json(llmResult);
  } catch (error) {
    console.error(error);
    const status = error.message?.includes('ANTHROPIC_API_KEY') ? 503 : 422;
    return res.status(status).json({
      error: status === 503
        ? 'The backend is running, but the Anthropic API key is not configured. Deterministic demo commands still work.'
        : 'The layout update failed validation. Your current layout was not changed.'
    });
  }
});

export default router;

