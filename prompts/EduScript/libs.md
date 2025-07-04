# Word Libraries Structure Guide

This guide defines the structure and design principles for all word library files used in the EduPlatform system. These libraries are designed to power dynamic and categorized word usage within the exercise scripting language, especially for the `@fill()` function.

---

## 📁 File Format

Each library should be stored as a `.json` file and follow the structure below.

### ✅ Main Structure

```json
{
  "theme": "Food",
  "words": [
    {
      "id": "w1",
      "text": "Apple",
      "category": "Fruits",
      "level": "A1",
      "tags": ["healthy", "fruit"]
    },
    {
      "id": "w2",
      "text": "Pizza",
      "category": "Junk",
      "level": "A1",
      "tags": ["fast food", "junk"]
    },
    {
      "id": "w3",
      "text": "Dragon Fruit",
      "category": "Fruits",
      "level": "C1",
      "tags": ["fruit", "exotic"]
    }
  ]
}
🚫 No Virtual Lists (For Now)
All word groupings should be managed through the tags, category, and level fields. Do not use virtual lists or reference arrays at this stage.

While each word includes an id field, it serves as an internal identifier and is not currently used for referencing in other lists. It may become more relevant for advanced features or future tooling but is not required for current functionality.

💡 Designed for @fill() Usage
This structure is ideal for powering the @fill() function inside your scripting language. Words can be filtered and selected dynamically based on:

Category (e.g. "Fruits", "Vegetables")

Level (e.g. A1, B2)

Tags (e.g. "exotic", "healthy")

Example Calls
text
Copy
Edit
@fill('fruits', 5)
@fill('fruits', 5, level=A2)
@fill('fruits', 5, tag="exotic")
These would be resolved by filtering the loaded JSON data by:

"category" == "Fruits"

"level" == "A2" (optional)

"tags" includes "exotic" (optional)

🔧 Notes & Best Practices
Use consistent casing for tags, categories, and levels.

Keep the text field plain (no punctuation or formatting).

Always include a category and level.

Tags should be lowercase, descriptive, and reusable across themes.

📌 Summary
Field	Required	Description
id	✅	Internal identifier (not referenced yet)
text	✅	Word or phrase displayed to users
category	✅	Logical grouping within the theme
level	✅	CEFR level for filtering
tags	✅	Array of classification keywords

This structure supports a clean and flexible word generation system for exercises. It is designed to scale as content grows and integrates seamlessly with the @fill() logic.