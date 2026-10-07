import { writeFileSync } from 'fs'; import { toMarkdown } from '../src/lib/kb.js'
writeFileSync('docs/KB-PowerBI-Dashboard.md', toMarkdown())
