/**
 * ai-mentor.js - Main Controller for the AI Mentor
 * Integrates Ollama with the Coding for Kids UI
 */

import { OllamaClient } from '../src/js/core/OllamaClient.js';
import { formatMarkdown } from '../src/js/utils/Markdown.js';
import { skillsDatabase } from '../src/js/skills/SkillRegistry.js';

const client = new OllamaClient();

// DOM Elements
const trigger = document.getElementById('ai-mentor-trigger');
const panel = document.getElementById('ai-mentor-panel');
const chatBody = document.getElementById('ai-chat-body');
const input = document.getElementById('ai-input');
const sendBtn = document.getElementById('ai-send');
const modelSelect = document.getElementById('model-select');
const skillSelect = document.getElementById('skill-select');

// Initialize Models
async function initModels() {
    try {
        const data = await client.fetchModels();
        modelSelect.innerHTML = '';
        if (data.models && data.models.length > 0) {
            data.models.forEach(model => {
                const option = document.createElement('option');
                option.value = model.name;
                option.textContent = model.name;
                modelSelect.appendChild(option);
            });
            // Try to set gemma4 as default if exists
            if (data.models.some(m => m.name.includes('gemma4'))) {
                modelSelect.value = data.models.find(m => m.name.includes('gemma4')).name;
            }
        } else {
            modelSelect.innerHTML = '<option value="">ไม่พบโมเดล</option>';
        }
    } catch (error) {
        modelSelect.innerHTML = '<option value="">เชื่อมต่อ Ollama ไม่ได้</option>';
    }
}

// Toggle Panel
trigger.addEventListener('click', () => {
    panel.classList.toggle('ai-panel--active');
    if (panel.classList.contains('ai-panel--active') && modelSelect.value === 'loading') {
        initModels();
    }
});

// Send Message Logic
async function sendMessage() {
    const text = input.value.trim();
    const model = modelSelect.value;
    const skillId = skillSelect.value;

    if (!text || !model) return;

    // Add User Message
    addMessage(text, 'user');
    input.value = '';

    // Create AI Message Placeholder
    const aiMessageDiv = addMessage('...', 'ai');
    let fullResponse = '';

    try {
        // Find skill context
        const skill = getSkillById(skillId);
        const systemPrompt = skill ? skill.prompt : "You are a helpful assistant.";
        const finalPrompt = `${systemPrompt}\n\nคำถาม/ข้อมูล: ${text}\n\nคำตอบ:`;

        await client.generate(model, finalPrompt, {}, (chunk) => {
            fullResponse += chunk;
            aiMessageDiv.innerHTML = formatMarkdown(fullResponse);
            chatBody.scrollTop = chatBody.scrollHeight;
        });
    } catch (error) {
        aiMessageDiv.innerText = 'เกิดข้อผิดพลาดในการเชื่อมต่อโมเดลจ้า!';
        console.error('AI Error:', error);
    }
}

function getSkillById(id) {
    for (const category in skillsDatabase) {
        for (const skillKey in skillsDatabase[category]) {
            if (skillsDatabase[category][skillKey].id === id) {
                return skillsDatabase[category][skillKey];
            }
        }
    }
    return null;
}

function addMessage(text, type) {
    const div = document.createElement('div');
    div.className = `message message--${type}`;
    div.innerHTML = type === 'user' ? text : formatMarkdown(text);
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
    return div;
}

// Event Listeners
sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

console.log('AI Mentor System Initialized (Modular)');
