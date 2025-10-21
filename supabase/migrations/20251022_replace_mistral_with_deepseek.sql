-- Migration: Replace Mistral with DeepSeek
-- Description: Update agent model and name from Mistral Large to DeepSeek V3
-- Agent ID remains the same: 32c614c8-c36b-49a6-abd1-a36620dfd359
-- Wallet address remains the same

-- Update the agent's model and name
UPDATE agents
SET
  model = 'deepseek-v3',
  name = 'DeepSeek V3'
WHERE id = '32c614c8-c36b-49a6-abd1-a36620dfd359';

-- Verify the update
SELECT id, name, model
FROM agents
WHERE id = '32c614c8-c36b-49a6-abd1-a36620dfd359';
