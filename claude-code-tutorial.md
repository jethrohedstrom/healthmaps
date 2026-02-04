# Claude Code Tutorial

*Source: Eyad Khrais (@eyad_khrais) — CTO at Varick AI, ex-SWE at Amazon, Disney, Capital One*

This is a beginners playbook containing everything learned from using Claude Code to build robust systems that handle complex workloads from large companies.

---

## Think First

Most people assume that with Claude Code and other AI tools, the first thing you need to do is type (or start talking). But that's probably one of the biggest mistakes you can make straight off the bat. **The first thing that you actually need to do is think.**

10 out of 10 times, the output from plan mode did significantly better than when just starting to talk and spewing everything into Claude Code. It's not even close.

For those without years of software engineering experience, two pieces of advice:

1. **Start learning.** You are handicapping yourself if you never pick up on this, even if just a little bit at a time.
2. **Have a deep back and forth with an LLM**, where you describe exactly what you want to build, ask for the various options in terms of system design, and ultimately settle on a solution. You and the LLM should be asking each other questions, not just a one-way street.

This applies to everything, including small tasks like summarizing emails:
- Before asking Claude to build a feature, think about the architecture
- Before asking it to refactor something, think about what the end state should look like
- Before asking it to debug, think about what you actually know about the problem

The more information you have in plan mode, the better your output will be because the better the input will be.

**The pattern is consistent: thinking first, then typing, produces dramatically better results than typing first and hoping Claude figures it out.**

### Architecture

Architecture in software engineering is like giving someone the output and nothing more. This leaves a LOT of wiggle room, which is essentially the problem with AI-generated code.

**Bad prompt:** "Build me an auth system"

**Good prompt:** "Build email/password authentication using the existing User model, store sessions in Redis with 24-hour expiry, and add middleware that protects all routes under /api/protected."

**How to enter plan mode:** Press shift + tab twice. This takes 5 minutes but saves hours of debugging later.

---

## CLAUDE.md

CLAUDE.md is a markdown file that Claude reads before every single conversation. Every instruction in that file shapes how Claude approaches your project. It's essentially onboarding material.

Most people either ignore it completely or stuff it with garbage that makes Claude worse. There is a threshold where too much or too little information means worse model output.

### What Actually Matters

**Keep it short.** Claude can only reliably follow around 150 to 200 instructions at a time, and Claude Code's system prompt already uses about 50 of those. Every instruction you add competes for attention. If your CLAUDE.md is a novel, Claude will start ignoring things randomly.

**Make it specific to your project.** Don't explain what a components folder is — Claude knows what components are. Tell it the weird stuff, like the bash commands that actually matter. Everything that is part of your flow should go into it.

**Tell it why, not just what.** When you give Claude the reason behind an instruction, it implements it better than if you just tell it what to do.
- "Use TypeScript strict mode" is okay
- "Use TypeScript strict mode because we've had production bugs from implicit any types" is better

The why gives Claude context for making judgment calls you didn't anticipate.

**Update it constantly.** Press the # key while working and Claude will add instructions to your CLAUDE.md automatically. Every time you find yourself correcting Claude on the same thing twice, that's a signal it should be in the file. Over time your CLAUDE.md becomes a living document of how your codebase actually works.

**Bad CLAUDE.md** looks like documentation written for a new hire.

**Good CLAUDE.md** looks like notes you'd leave yourself if you knew you'd have amnesia tomorrow.

---

## The Limitations of Context Windows

Opus 4.5 has a 200,000 token context window. But the model starts to deteriorate way before you hit 100%.

**At around 20-40% context usage** is where the quality of output starts to chip away, even if not significantly. If you've ever experienced Claude Code compacting and then still giving terrible output afterwards, that's why — the model was already degraded before compaction happened, and compaction doesn't magically restore quality.

Every message you send, every file Claude reads, every piece of code it generates, every tool result — all of it accumulates. Once quality starts dropping, more context makes it worse, not better.

### What Actually Helps

**Scope your conversations.** One conversation per feature or task. Don't use the same conversation to build your auth system and then also refactor your database layer. The contexts will bleed together and Claude will get confused.

**Use external memory.** If working on something complex, have Claude write plans and progress to actual files (SCRATCHPAD.md or plan.md). These persist across sessions. When you come back tomorrow, Claude can read the file and pick up where you left off instead of starting from zero.

**The copy-paste reset.** When context gets bloated:
1. Copy everything important from the terminal
2. Run /compact to get a summary
3. Run /clear to clear the context entirely
4. Paste back in only what matters

Fresh context with critical information preserved. Way better than letting Claude struggle through degraded context.

**Know when to clear.** If a conversation has gone off the rails or accumulated irrelevant context, just /clear and start fresh. Claude will still have your CLAUDE.md, so you're not losing your project context. Nine times out of ten, using clear is actually better than not using it.

**Mental model:** Claude is stateless. Every conversation starts from nothing except what you explicitly give it. Plan accordingly.

---

## Prompts Are Everything

People spend weeks learning frameworks and tools. They spend zero time learning how to communicate with the thing that's actually generating their code.

Prompting isn't mystical art — it's fundamental communication. Being clear gets you better results than being vague. Every. Single. Time.

### What Actually Helps

**Be specific about what you want.** "Build an auth system" gives Claude creative freedom it will use poorly. "Build email/password authentication using this existing User model, store sessions in Redis, and add middleware that protects routes under /api/protected" gives Claude a clear target.

**Tell it what NOT to do.** Claude 4.5 in particular likes to overengineer — extra files, unnecessary abstractions, flexibility you didn't ask for. If you want something minimal, say "Keep this simple. Don't add abstractions I didn't ask for. One file if possible."

Always cross-reference what Claude produces — you don't want technical debt from building 12 different files for a task that could have been fixed with a couple of lines of code.

**Give it context about why.**
- "We need this to be fast because it runs on every request" changes how Claude approaches the problem
- "This is a prototype we'll throw away" changes what tradeoffs make sense

Claude can't read your mind about constraints you haven't mentioned.

**Remember: output is everything, but it only comes from input. If your output sucks, your input sucked.**

---

## Bad Input == Bad Output

People blame the model when they get bad results. "Claude isn't smart enough" or "I need a better model."

**Reality check:** If you're getting bad output with a good model like Opus 4.5, your input and prompting sucks. Full stop.

The model matters. A lot. But model quality is table stakes at this point. The bottleneck is almost always on the human side.

If consistently getting bad results, the fix isn't switching models. The fix is getting better at:
- **How you write prompts.** Specific > vague. Constraints > open-ended. Examples > descriptions.
- **How you structure requests.** Break complex tasks into steps. Get agreement on architecture before implementation. Review outputs and iterate.
- **How you provide context.** What does Claude need to know to do this well? What assumptions are you making that Claude can't see?

### Model Differences

**Sonnet** is faster and cheaper. Excellent for execution tasks where the path is clear — writing boilerplate, refactoring based on a specific plan, implementing features where you've already made the architectural decisions.

**Opus** is slower and more expensive. Better for complex reasoning, planning, and tasks where you need Claude to think deeply about tradeoffs.

**Workflow that works:** Use Opus to plan and make architectural decisions, then switch to Sonnet (Shift+Tab in Claude Code) for implementation. Your CLAUDE.md ensures both models operate under the same constraints, so the handoff is clean.

---

## MCP, Tools, and Configurations

Claude has many features: MCP servers, Hooks, Custom slash commands, Settings.json configurations, Skills, Plugins.

You don't need all of them. But you should experiment, because if you're not experimenting, you're probably leaving time or money on the table.

### MCP (Model Context Protocol)

MCP lets Claude connect to external services — Slack, GitHub, databases, APIs. If you find yourself constantly copying information from one place into Claude, there's probably an MCP server that can do it automatically.

### Hooks

Hooks let you run code automatically before or after Claude makes changes.
- Want Prettier to run on every file Claude touches? Hook.
- Want type checking after every edit? Hook.

This catches problems immediately instead of letting them pile up.

### Custom Slash Commands

Just prompts you use repeatedly, packaged as commands. Create a .claude/commands folder, add markdown files with your prompts, and run them with /commandname. If you're running the same kind of task often — debugging, reviewing, deploying — make it a command.

**Don't get shut off if something doesn't work on the first try.** These models improve basically every week. Something that didn't work a month ago might work now. Being an early adopter means staying curious and re-testing things.

---

## When Claude Gets Stuck

Sometimes Claude just loops — tries the same thing, fails, tries again, fails, keeps going. Or it confidently implements something completely wrong.

When this happens, the instinct is to keep pushing — more instructions, more corrections, more context. But the better move is to **change the approach entirely.**

**Clear the conversation.** The accumulated context might be confusing it. /clear gives you a fresh start.

**Simplify the task.** If Claude is struggling with a complex task, break it into smaller pieces. Get each piece working before combining them. If Claude is struggling, your plan mode is insufficient.

**Show instead of tell.** If Claude keeps misunderstanding what you want, write a minimal example yourself. "Here's what the output should look like. Now apply this pattern to the rest." Claude is extremely good at understanding what success looks like.

**Be creative.** Try a different angle. Sometimes the way you framed the problem doesn't map well to how Claude thinks. Reframing — "implement this as a state machine" vs "handle these transitions" — can unlock progress.

**Meta-skill:** Recognizing when you're in a loop early. If you've explained the same thing three times and Claude still isn't getting it, more explaining won't help. Change something.

---

## Build Systems

The people who get the most value from Claude aren't using it for one-off tasks. They're building systems where Claude is a component.

Claude Code has a -p flag for headless mode. It runs your prompt and outputs the result without entering the interactive interface. This means you can:
- Script it
- Pipe output to other tools
- Chain it with bash commands
- Integrate it into automated workflows

Enterprises use this for automatic PR reviews, automatic support ticket responses, automatic logging and documentation updates. All logged, auditable, and improving over time based on what works and what doesn't.

**The flywheel:** Claude makes a mistake → you review the logs → you improve the CLAUDE.md or tooling → Claude gets better next time. This compounds. After months of iteration, systems built this way are meaningfully better than at launch — same models, just better configured.

If you're only using Claude interactively, you're leaving value on the table. Think about where in your workflow Claude could run without you watching.

---

## TLDR

1. **Think before you type.** Planning produces dramatically better results than just starting to talk.
2. **CLAUDE.md is your leverage point.** Keep it short, specific, tell it why, and update constantly. This single file affects every interaction.
3. **Context degrades at 30%, not 100%.** Use external memory, scope conversations, and don't be afraid to clear and restart with the copy-paste reset trick.
4. **Architecture matters more than anything.** You cannot skip planning. If you don't think through structure first, output will be bad.
5. **Output comes from input.** If you're getting bad results with a good model, your prompting needs work. Get better at communicating.
6. **Experiment with tools and configuration.** MCP, hooks, slash commands. If you're paying for Pro Max, try everything. Stay curious even when things don't work the first time.
7. **When stuck, change the approach.** Don't loop. Clear, simplify, show, reframe.
8. **Build systems, not one-shots.** Headless mode, automation, logged improvements over time.

These are the things that determine whether you're fighting the tool or flowing with it.
