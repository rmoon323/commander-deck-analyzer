// The commander is included in deck.cards, so a complete deck contains 100 cards total.
function isValidDeckSize(deck) {
    return {
        isValid: deck.cards.length === 100,
        deckSize: deck.cards.length
    };
}

// Checks card to see if it is a "Lengendary Creature"
function isLegendaryCreature(card) {
    return (card.type_line?.includes("Legendary") ?? false) &&
           (card.type_line?.includes("Creature") ?? false);
}

// Some nonlegendary cards explicitly override the usual commander eligibility rule.
function isCommanderEligible(card) {
    return isLegendaryCreature(card) ||
           (card.oracle_text?.includes("can be your commander") ?? false) ||
           (card.type_line.includes("Legendary Enchantment — Background"));
}

// Resolve commander names to their card data; the deck must contain each named commander.
function findCommanders(deck) {
    const commanders = deck.commanders.map(name => {
        const commanderObject = deck.cards.find(card => card.name === name)

        if (commanderObject) {
            return commanderObject;
        } else {
            throw new Error(`Commander not found: ${name}`);
        }
    });
    return commanders;
}

// Generic Partner is distinct from named "Partner with" and Character select.
function hasGenericPartner(card) {
    const hasPartner = card.keywords?.includes("Partner") ?? false;

    const hasCharacterSelect =
        card.oracle_text?.includes("Partner—Character select") ?? false;

    const hasPartnerWith =
       card.keywords?.includes("Partner with") ?? false;

    return hasPartner && !hasCharacterSelect && !hasPartnerWith;
}

function hasPartnerWith(card) {
    return card.keywords?.includes("Partner with") ?? false;
}

// Extract the named partner from the first line of the card's Oracle text.
function getPartnerWithName(card) {
    if (!hasPartnerWith(card)) {
        return null;
    }

    return card.oracle_text
    .split("Partner with ")[1]
    .split("\n")[0]
    .split(" (")[0];
}

function hasPartnerCharacterSelect(card) {
    return card.oracle_text?.includes("Partner—Character select") ?? false;
}

// Check the pairing mechanics supported by this analyzer.
function arePartnersCompatible(commanders) {
    if (hasGenericPartner(commanders[0]) && hasGenericPartner(commanders[1])) {
        return true;
    }

    if (getPartnerWithName(commanders[0]) === commanders[1].name) {
        return true;
    }

    if (hasPartnerCharacterSelect(commanders[0]) && hasPartnerCharacterSelect(commanders[1])) {
        return true;
    }

    return false;
}

function findIneligibleCommanders(commanders) {
    const ineligibleCommanders = commanders.filter(card =>
        !isCommanderEligible(card)
    );
    return ineligibleCommanders;
}

function hasInvalidCommanderPair(commanders) {
    if (commanders.length === 2) {
        return !arePartnersCompatible(commanders);
    }

    return false;
}

function hasInvalidCommanderCount(commanders) {
    return (commanders.length !== 1) && (commanders.length !== 2);
}

// Report individual commander problems as well as the overall result.
function validateCommanders(commanders) {
    const ineligibleCommanders = findIneligibleCommanders(commanders);
    const invalidPair = hasInvalidCommanderPair(commanders);
    const invalidCount = hasInvalidCommanderCount(commanders);

    const isValid =
    ineligibleCommanders.length === 0 &&
    !invalidPair &&
    !invalidCount

    return {
        isValid,
        ineligibleCommanders,
        invalidPair,
        invalidCount
    };
}


// Keep card legality separate from structural deck validation: flagged cards
// classify a deck as casual without changing its size/singleton/color checks.
function analyzeLegality(deck) {
    const knownStatuses = ["legal", "banned", "not_legal"];

    const flaggedCards = deck.cards.filter(card =>
        card.legalities?.commander !== "legal"
    );

    const bannedCards = flaggedCards.filter(card =>
        card.legalities?.commander === "banned"
    );

    const notLegalCards = flaggedCards.filter(card =>
        card.legalities?.commander === "not_legal"
    )

    const unresolvedCards = flaggedCards.filter(card =>
        !knownStatuses.includes(card.legalities?.commander)
    );

    // Store our findings in a separate analysis object.
    const analysis = {
        flaggedCards: flaggedCards,
        bannedCards: bannedCards,
        notLegalCards: notLegalCards,
        unresolvedCards: unresolvedCards,
        hasUnresolvedCards: unresolvedCards.length > 0,
        classification: null
    };

    // Classify the deck based on whether flagged cards were found.
    if (flaggedCards.length > 0) {
        analysis.classification = "casual";
    } else if (deck.cards.length === 0) {
        analysis.classification = "unclassified";
    } else {
        analysis.classification = "standard";
    }

    return analysis;
}

// A multifaced card may contribute types from more than one face.
function getCardTypes(card) {

    const validTypesList = [
        "Artifact",
        "Creature",
        "Enchantment",
        "Instant",
        "Land",
        "Planeswalker",
        "Sorcery",
        "Battle",
        "Kindred"
    ];

    if (Array.isArray(card.card_faces)) { // Handle multifaced cards by examining each face recursively.
        const allTypes = []

        for (const card_face of card.card_faces) {
            const faceTypes = getCardTypes(card_face); // Recursion to get card types for each face.

            for (const faceType of faceTypes) {
                if (!allTypes.includes(faceType)) {
                    allTypes.push(faceType);
                }
            }
        }
        return allTypes;
    }

    const cardType = card.type_line;

    const validTypes = cardType.split(" — ")[0].split(" ").filter(type =>
        validTypesList.includes(type)
    );

    return validTypes;
}

// Returns each card type and its count for the entire deck.
function countCardTypes(cards) {
    const typeCounts = {};

    for (const card of cards) {
        const validTypes = getCardTypes(card);

        for (const type of validTypes) {
            if (!typeCounts[type]) {
                typeCounts[type] = 1;
            } else {
                typeCounts[type]++;
            }
        }
    }
    return typeCounts;
}

function isBasic(card) {
    return card.type_line?.includes("Basic") ?? false;
}

// Basic lands and cards with explicit deckbuilding exceptions bypass singleton limits.
function getMaxCopies(card) {
    const oracleText = card.oracle_text;

    if (card.oracle_text?.includes("A deck can have any number of cards named") || isBasic(card)) {
        return Infinity;
    }

    if (card.oracle_text?.includes("A deck can have up to")) {//YAGNI. Only Seven Dwarves and Nazgul apply...so far.
        const numberWord = oracleText
        .split("up to ")[1]
        .split(" cards named ")[0];

        const numberWords = {
            seven: 7,
            nine: 9
        };

        return numberWords[numberWord];
    }
    return 1;
}

// Returns the card and count for every card in the deck.
function countCardOccurrences(cards) {
    const counts = {}

    for (const card of cards) {
        const name = card.name;
        if (!counts[name]) {
            counts[name] = 1;
        } else {
            counts[name]++;
        }
    }
    return counts;
}

// Only inspect repeated names; compare each count against that card's exception.
function findSingletonViolations(cards, cardOccurrences) {
    const singletonViolations = []
    const cardOccurrencesEntries = Object.entries(cardOccurrences);

    for (const [cardName, count] of cardOccurrencesEntries) {

        if (count > 1) {
            const currentCard = cards.find(card => card.name === cardName)
            const maxCopies = getMaxCopies(currentCard);

            if (count > maxCopies) {
                singletonViolations.push({
                    card: currentCard,
                    count: count,
                    maxCopies: maxCopies
                });
            }
        }

    }
    return singletonViolations;
}

// Exclude lands from the mana curve, including land faces of multifaced cards.
function getManaValueForCurve(card) {
    if (card.layout === "adventure") {
        const firstFaceTypes = getCardTypes(card.card_faces[0]);

        if (!firstFaceTypes.includes("Land")) {
            return card.cmc;
        } else {
            return null;
        }
    }

    if (card.layout === "split") {
        return card.cmc;
    }

    if (Array.isArray(card.card_faces)) {
        for (const face of card.card_faces) {
            const faceTypes = getCardTypes(face)

            if (!faceTypes.includes("Land")) {
                return card.cmc;
            }
        }

        return null;

    } else {
        const cardTypes = getCardTypes(card);

        if (cardTypes.includes("Land")) {
            return null;

        } else {
            return card.cmc;
        }
    }
}

// Group nonland cards by mana value to produce the curve distribution.
function calculateManaCurve(cards) {
    const manaCurve = {};

    for (const card of cards) {
        const manaValue = getManaValueForCurve(card);

        if (manaValue !== null) {
            if(!manaCurve[manaValue]) {
                manaCurve[manaValue] = 1;
            } else {
                manaCurve[manaValue]++;
            }
        }
    }
    return manaCurve;
}

// Partner commanders contribute a combined set of allowed colors.
function getCommanderColorIdentity(commanders) {
    const combinedIdentity = [];

    for (const commander of commanders) {
        for (const color of commander.color_identity) {
            if (!combinedIdentity.includes(color)) {
                combinedIdentity.push(color);
            }
        }
    }

    return combinedIdentity;
}

// Every color on a card must belong to the commander's allowed identity.
function isValidColorIdentity(card, allowedColors) {
    const isValidIdentity = card.color_identity.every(color => allowedColors.includes(color));

    return isValidIdentity;
}

// Report each offending card name once, even when the deck has duplicates.
function findColorIdentityViolations(cards, allowedColors) {
    const violations = [];

    for (const card of cards) {
        if (!isValidColorIdentity(card, allowedColors)) {
            const hasCard = violations.some(violation => violation.card.name === card.name);

            if (!hasCard) {
                violations.push({card});
            }
        }
    }

    return violations;
}

// Combine the independent structural checks into one validation result.
function validateDeck({
    deckSizeValidation,
    commanderValidation,
    singletonViolations,
    colorViolations
}) {
    const isValid = deckSizeValidation.isValid &&
    commanderValidation.isValid &&
    singletonViolations.length === 0 &&
    colorViolations.length === 0

    return {
        isValid,
        deckSize: deckSizeValidation,
        commander: commanderValidation,
        singleton: singletonViolations,
        colorViolations: colorViolations
    }
}

// Main entry point: calculate statistics, check legality, and validate deck rules.
function analyzeDeck(deck) {
    const deckSizeValidation = isValidDeckSize(deck);

    const commanders = findCommanders(deck);
    const commanderNames = commanders.map(card => card.name);
    const commanderValidation = validateCommanders(commanders);

    const legality = analyzeLegality(deck);
    const cardTypeCount = countCardTypes(deck.cards);
    const manaCurve = calculateManaCurve(deck.cards);

    const cardOccurrences = countCardOccurrences(deck.cards);
    const singletonViolations = findSingletonViolations(deck.cards, cardOccurrences);

    const allowedColors = getCommanderColorIdentity(commanders);
    const colorViolations = findColorIdentityViolations(deck.cards, allowedColors);

    const totalViolations = {
        deckSizeValidation,
        commanderValidation,
        singletonViolations,
        colorViolations
    }
    const deckValidation = validateDeck(totalViolations)

    return {
        commanderNames,
        legality,
        cardTypeCount,
        manaCurve,
        allowedColors,
        deckValidation
    };
}

export { analyzeDeck };


