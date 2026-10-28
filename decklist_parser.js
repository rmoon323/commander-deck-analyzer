
function parseCardLine(line) {
    const parts = line.trim().split(" ");
    const quantity = Number(parts[0]);
    const nameParts = parts.slice(1);
    const card = nameParts.join(" ");
    const cards = [];

    for (let i = 1; i <= quantity; i++) {
        cards.push(card);
    }

    return cards;
}

function parseDecklist(text) {
    const lines = text.trim().split("\n");
    const cards = [];

    for (const line of lines) {
        if (line.trim() !== "") {
            cards.push(...parseCardLine(line));
        }
    }

    return cards;
}

function parseExport(text) {
   
    // Separate main deck, commander(s), and sideboard.
    const sections = text.trim().split("\n\n");

    // Plain text exports should contain 2 or 3 sections.
    if (sections.length !== 2 && sections.length !== 3) {
        throw new Error("Invalid export format.");
    }

    const mainDeckSection = sections[0];
    const commanderSection = sections[sections.length - 1];

    let sideboardSection = [];

    if (sections.length === 3) {
        sideboardSection = sections[1];
    } else {
        sideboardSection = null;
    }

    // Parse the main deck and commander separately.
    const cardNames = parseDecklist(mainDeckSection);
    const commanderNames = parseDecklist(commanderSection);

    // Start with an empty sideboard.
    const sideboard = [];

    if (sideboardSection !== null) {
        if (!sideboardSection.startsWith("SIDEBOARD:")) {
            throw new Error("Expected SIDEBOARD: heading.");
        }

        // Remove the SIDEBOARD: heading.
        const lines = sideboardSection.split("\n");
        const cardLines = lines.slice(1).join("\n");

        // Parse the remaining sideboard entries.
        sideboard.push(...parseDecklist(cardLines));
    }

    return {
        commanderNames,
        cardNames,
        sideboard
    };
}

export { parseCardLine, parseDecklist, parseExport };
