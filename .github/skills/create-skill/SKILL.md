---
name: create-skill
description: 'Create reusable agent skills and workflow guides for repeatable tasks. Use for turning a process into a SKILL.md, defining scopes, decision points, and validation checks for project or personal workflows.'
argument-hint: 'What workflow should this skill document?'
user-invocable: true
---

# Skill Authoring

## When to Use
- Turn a repeated workflow into a reusable skill
- Capture project-specific procedures for debugging, review, setup, or delivery
- Document a multi-step process with explicit decisions and completion checks
- Create a new `SKILL.md` when a team or personal workflow is worth reusing

## Decision Flow
1. Decide whether the workflow is project-scoped or personal-scoped.
2. Confirm that a skill is the right primitive for the job.
3. Identify the actual process, decision branches, and quality gates.
4. Draft the skill in the correct location with valid frontmatter.
5. Validate the result before finishing.

## Scope Rules
- Workspace-scoped skills go in `.github/skills/<skill-name>/`
- Personal-scoped skills go in `~/.copilot/skills/<skill-name>/`
- Keep the folder name and `name` field aligned exactly

## Choose the Right Primitive
- Most tasks, broad and always-on guidance -> instructions
- One focused task with inputs -> prompt
- Repeatable multi-step workflow -> skill
- Multi-stage workflow with isolation or stricter tool limits -> custom agent

## Procedure
1. Define the outcome.
   - State what the skill is meant to accomplish.
   - Name the trigger conditions that should cause it to be selected.

2. Capture the workflow.
   - Write each step in order.
   - Include branching logic when conditions change.
   - Record what to do when the workflow is blocked or ambiguous.

3. Add quality criteria.
   - Include a completion checklist or exit criteria.
   - Define what "done" means for the workflow.

4. Draft the `SKILL.md` file.
   - Include YAML frontmatter with `name` and `description`.
   - Keep the description keyword-rich so the skill is discoverable.
   - Add `argument-hint` if the skill should accept user input.
   - Use sections such as:
     - `When to Use`
     - `Decision Flow`
     - `Procedure`
     - `Quality Checklist`
     - `References` or bundled assets

5. Validate the result.
   - Confirm the file is in the correct location.
   - Check that `name` matches the folder name.
   - Ensure there are no YAML syntax issues.
   - Confirm the description includes trigger words.
   - Make sure the workflow is concise and self-contained.

## Quality Checklist
- Description clearly tells when to use the skill
- Workflow is specific and repeatable
- Steps are ordered and actionable
- Branching logic is explicit when needed
- Completion checks are easy to verify
- File location matches scope
- Relative asset links use `./` paths when needed

## Example Pattern
```markdown
---
name: example-skill
description: 'Handle a repeatable workflow. Use for debugging, validation, and end-to-end checks.'
---

# Example Workflow

## When to Use
- Repeatable tasks in this project
- Reusable process that needs guidance

## Procedure
1. Define the goal
2. Collect context
3. Implement the change
4. Validate the result
5. Record the outcome
```

## Final Check Before Completing
- Is this reusable beyond a single chat?
- Will another agent understand when to use it?
- Does it provide clear guidance to finish the task?
- Does it include validation or completion criteria?

If the answer is yes to all of these, the skill is ready.
