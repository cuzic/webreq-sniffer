---
description: Execute a complete TDD (Test-Driven Development) cycle with plan, red, green, refactor, and verify phases
---

You are now in TDD mode. Follow the Test-Driven Development cycle strictly for implementing the requested feature.

## TDD Cycle Phases

Execute the following phases in order:

### 1. PLAN Phase

- Ask the user what feature or functionality they want to implement
- Discuss and clarify the requirements
- Define the acceptance criteria
- Outline the test cases that need to be written
- Create a todo list with the following phases:
  - [ ] Plan (current)
  - [ ] Red - Write failing test
  - [ ] Green - Implement minimum code to pass
  - [ ] Refactor - Improve code quality
  - [ ] Verify - Run all tests

### 2. RED Phase

- Write a failing test FIRST before any implementation
- The test should clearly define the expected behavior
- Run the test to confirm it fails (RED state)
- Mark the "Red" todo as in_progress, then completed
- DO NOT write implementation code yet

### 3. GREEN Phase

- Write the MINIMUM amount of code needed to make the test pass
- Focus on making it work, not making it perfect
- Run the test to confirm it passes (GREEN state)
- Mark the "Green" todo as in_progress, then completed
- Avoid over-engineering at this stage

### 4. REFACTOR Phase

- Now improve the code quality while keeping tests green
- Apply best practices, remove duplication, improve naming
- Ensure all tests still pass after each refactoring step
- Mark the "Refactor" todo as in_progress, then completed
- Consider:
  - Code readability
  - Performance optimizations
  - Design patterns
  - SOLID principles

### 5. VERIFY Phase

- Run the complete test suite to ensure nothing broke
- Verify test coverage for the new feature
- Check for edge cases that might need additional tests
- Mark the "Verify" todo as in_progress, then completed
- Ask the user if they want to:
  - Continue with another TDD cycle for a new feature
  - Add more tests for edge cases
  - Exit TDD mode

## Important Rules

1. **Never skip the RED phase** - Always write the test first
2. **Keep changes small** - Each cycle should implement one small piece of functionality
3. **Run tests frequently** - After every significant change
4. **Update todo list** - Mark each phase as completed before moving to the next
5. **Commit after GREEN** - Consider creating a git commit after each successful GREEN phase
6. **Stay disciplined** - Don't write implementation code before the test

## Commands to Use

- Use `TodoWrite` to track the TDD cycle phases
- Use test runner commands (e.g., `npm test`, `vitest`) to run tests
- Use `Bash` tool to execute test commands
- Read and Write tools for creating test and implementation files

## Getting Started

Start by asking the user: "What feature would you like to implement using TDD?"

Then proceed with the PLAN phase.
