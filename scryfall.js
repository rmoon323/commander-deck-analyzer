
const SCRYFALL_COLLECTION_URL = "https://api.scryfall.com/cards/collection";

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getCard(name) {
    const url = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`;

    const response = await fetch(url, {
        headers: {
            "User-Agent": "CommanderDeckAnalyzer/0.1.0",
            "Accept": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to retrieve ${name}: HTTP ${response.status}`);
    }

    return await response.json();
}

async function getCards(names) {
    const cardsByName = new Map();

    // Avoid requesting duplicate card names.
    const uniqueNames = [...new Set(names)];

    // Scryfall's collection endpoint accepts up to 75 identifiers in one request.
    for (let i = 0; i < uniqueNames.length; i += 75) {
        const batch = uniqueNames.slice(i, i + 75);

        const cardIdentifiers = batch.map(name => ({ name: name }));

        const requestBody = {
            identifiers: cardIdentifiers
        };

        // The Scryfall API allows a rate limit of 10 requests per second (100ms delay between calls)
        await wait(150);

        const response = await fetch(SCRYFALL_COLLECTION_URL, {
            method: "POST",
            headers: {
                "User-Agent": "CommanderDeckAnalyzer/0.1.0",
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (response.status === 429) {
            throw new Error(
                "Scryfall rate limit reached. Stop requests and try again later."
            );
        }

        if (!response.ok) {
            throw new Error(
                `Failed to retrieve card collection: HTTP ${response.status}`
            );
        }

        const result = await response.json();

        // Store successfully retrieved cards.

        for (const card of result.data ?? []) {
            // Store the card under its complete name.
            cardsByName.set(card.name.toLowerCase(), card);

            // Also store the card under each face's name.
            if (card.card_faces) {
                for (const face of card.card_faces) {
                    cardsByName.set(face.name.toLowerCase(), card);
                }
            }
        }  


        // Try individual lookups for unresolved card names.
        if (result.not_found?.length) {
            for (const identifier of result.not_found) {
                const requestedName = identifier.name;
                // Scryfall API allows a rate limit of 10 requests per second (100ms delay per call)
                await wait(150);

                const card = await getCard(requestedName);

                // Use the original requested name as the key.
                cardsByName.set(requestedName.toLowerCase(), card);
            }
        }
    }

    // Reconstruct the original deck order, including duplicates.
    return names.map(name => {
        const card = cardsByName.get(name.toLowerCase());

        if (!card) {
            throw new Error(`Missing card data for: ${name}`);
        }

        return card;
    });
}

async function buildDeck(commanderNames, cardNames) {
    const cards = await getCards(cardNames);

    return {
        commanders: commanderNames,
        cards: cards
    };
}

export { getCard, getCards, buildDeck };
