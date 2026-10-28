# Commander Deck Analyzer

A JavaScript project for analyzing Magic: The Gathering Commander decks.

## Overview

The Commander Deck Analyzer is a JavaScript program designed to analyze Magic: The Gathering Commander decks and provide players with insight into their deck's composition and validity.

The program can parse a Moxfield text decklist, retrieve card information from the Scryfall API, and construct a deck object for analysis.

It returns information about the selected commander(s), card legality, card type distribution, mana curve, and allowed color identity. It also validates the deck against Commander deckbuilding rules, identifying violations involving deck size, commander eligibility, singleton restrictions, and color identity.

## Features

The analyzer currently supports:

- **Decklist parsing:** Parses Moxfield text exports into commander, main-deck, and sideboard entries.
- **Automatic card retrieval:** Retrieves card data through the Scryfall API using batched requests.
- **Card name resolution:** Handles certain alternate card names and double-faced card names when retrieving card data.
- **Commander validation:** Checks commander eligibility, commander count, and supported partner combinations.
- **Card legality:** Identifies banned, nonlegal, and unresolved cards and classifies decks as standard or casual.
- **Deck validation:** Checks deck size, singleton restrictions, and color identity violations.
- **Card type distribution:** Counts cards by type, including cards with multiple types or faces.
- **Mana curve analysis:** Calculates the distribution of applicable cards by mana value, including spell-faced modal double-faced cards.
- **Commander color identity:** Determines the colors permitted by the selected commander(s).

## Getting Started

### Requirements

- Node.js
- npm (included with Node.js)

No external packages are currently required.

An internet connection is required when retrieving card information from Scryfall.

### Running the Project

1. Clone the repository and navigate into the project folder.
2. Run the demonstration:

   `npm run demo`

This executes `demo.js`, which parses an example decklist, retrieves card information from Scryfall, constructs the deck object, and runs the analyzer.

The analysis results are printed to the terminal.

## Input Format

The project supports parsing Moxfield text decklists containing card quantities and names, organized into sections for commanders, main-deck cards, and sideboard cards.

The parser produces card-name arrays that can be passed to the Scryfall integration to retrieve complete card objects.

The analyzer itself accepts a JavaScript object containing two properties:

- `commanders`: An array of commander card names.
- `cards`: An array of card objects containing the information required for analysis.

The `cards` array must include the commander card(s). A complete Commander deck contains 100 cards, including its commander(s).

Card objects use properties consistent with Scryfall's card data format, including:

- `name`
- `type_line`
- `color_identity`
- `cmc`
- `legalities`

Additional properties, such as `oracle_text`, `keywords`, and `card_faces`, are used when applicable.

### Modal Double-Faced Cards

The analyzer examines individual faces when determining card types.

A modal double-faced card with a spell face and a land face can contribute to both the land-type count and the mana curve. However, it still represents only one card in the deck.

For example, *Fell the Profane // Fell Mire* contributes to the Instant and Land type counts and appears at mana value 4 in the mana curve.

## Project Structure

The project currently includes the following primary files:

- `decklist_parser.js` — Parses text decklists into structured card-name arrays.
- `scryfall.js` — Retrieves card data from Scryfall and constructs deck objects.
- `commander_analyzer.js` — Performs deck analysis and Commander rule validation.
- `demo.js` — Demonstrates the complete workflow using a sample decklist.

## Current Status

The analyzer has successfully processed a 100-card Commander deck using Scryfall card data.

The demonstration confirmed the deck's size, commander eligibility, singleton restrictions, color identity, card legality, type distribution, and mana curve under the rules currently implemented.

Further development will focus on improving unresolved-card handling, supporting fuzzy name matching, and adding Commander bracket evaluation.

## Planned Features

The long-term goal is to expand the Commander Deck Analyzer into a comprehensive deck analysis and playtesting tool.

### Commander Bracket Analysis

- Evaluate decks using the Commander bracket system.
- Identify cards and deck characteristics that influence bracket classification.
- Explain why a deck qualifies for a particular bracket.

### Deck Price Analysis

- Retrieve card pricing information from Scryfall.
- Calculate the estimated total cost of a deck.
- Identify the most expensive cards.
- Provide a breakdown of deck cost by individual card.

### Mana Base and Resource Analysis

- Expand land analysis to identify available mana colors and production capabilities.
- Account for mana-producing artifacts, creatures, and other nonland sources.
- Analyze the deck's access to colored mana.
- Estimate mana availability across different turns.

### Casting Probability Analysis

- Estimate the probability of having sufficient mana to cast a particular card on curve.
- Account for mana costs, available mana sources, and color requirements.
- Use probability calculations or simulated draws to estimate how consistently a deck can cast its spells.
- Help identify cards whose mana requirements may be difficult to satisfy.

### Opening Hand and Draw Simulator

- Shuffle a deck and generate random opening hands.
- Draw additional cards to simulate subsequent turns.
- Allow users to discard cards and experiment with different hands.
- Support repeated playtesting to evaluate deck consistency.
- Eventually incorporate mulligans and more detailed turn-by-turn simulation.

### Web Application

- Develop a browser-based interface for the analyzer.
- Allow users to import and analyze their own Commander decklists.
- Display deck statistics and validation results visually.
- Integrate pricing, probability analysis, and hand simulation into an interactive experience.

## Long-Term Vision: Multiplayer Commander

The ultimate goal of this project is to develop a web-based virtual tabletop where two or more players can play Magic: The Gathering Commander together.

Rather than implementing a fully automated rules engine, the platform would allow players to manually interact with their cards, similar to playing Commander with physical cards.

Players would be able to import their decks, join multiplayer games, move cards between game zones, manage their hands, tap and untap permanents, and track relevant game information.

The platform would synchronize shared game information between players while preserving hidden information, such as cards in each player's hand.

The existing deck analyzer, future mana analysis tools, and opening-hand simulator would serve as foundational components of this larger application.

This multiplayer platform is a long-term ambition. The immediate priority remains developing a reliable, well-tested Commander Deck Analyzer and gradually expanding its capabilities.