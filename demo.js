import { buildDeck } from "./scryfall.js";
import { analyzeDeck } from "./commander_analyzer.js";
import { parseExport } from "./decklist_parser.js";


const decklist = `1 'Tis But a Scratch!
1 Adarkar Wastes
1 Ancient Den
1 Ancient Tomb
1 Anguished Unmaking
1 Arcane Signet
1 Arid Mesa
1 Azorius Signet
1 Baral, Chief of Compliance
1 Batwing Brume
1 Black Market Connections
1 Bloodchief Ascension
1 Bloodstained Mire
1 Caves of Koilos
1 Command Tower
1 Commandeer
1 Curiosity
1 Cyclonic Rift
1 Deadly Rollick
1 Delney, Streetwise Lookout
1 Dimir Signet
1 Disallow
1 Enlightened Tutor
1 Fell the Profane
1 Fierce Guardianship
1 Flawless Maneuver
1 Flooded Strand
1 Force of Negation
1 Force of Will
1 G'raha Tia, Scion Reborn
1 Giver of Runes
1 Glittering Caves of Aglarond
1 Godless Shrine
1 Greed
1 Hagra Mauling
1 Hallowed Fountain
1 Horizon of Progress
1 Inkshield
1 Irenicus's Vile Duplication
1 Kambal, Consul of Allocation
1 Leyline of Anticipation
1 Lotho, Corrupt Shirriff
1 Marsh Flats
1 Mindcrank
1 Misdirection
1 Misty Rainforest
1 Mox Diamond
1 Mox Opal
1 Norn's Annex
1 Ophidian Eye
1 Orzhov Signet
1 Otawara, Soaring City
1 Phyresis
1 Polluted Delta
1 Propaganda
1 Quantum Misalignment
1 Raffine's Tower
1 Reins of Power
1 Rhystic Study
1 Scalding Tarn
1 Scrubland
1 Sea Gate Restoration
1 Seat of the Synod
1 Sejiri Shelter
1 Serra's Sanctum
1 Sheoldred, the Apocalypse
1 Sink into Stupor
1 Smothering Tithe
1 Snuff Out
1 Sol Ring
1 Solitary Confinement
1 Sphere of Safety
1 Submerge
1 Swiftfoot Boots
1 Swords to Plowshares
1 Talion, the Kindly Lord
1 Talisman of Dominance
1 Talisman of Hierarchy
1 Talisman of Progress
1 Tandem Lookout
1 Teferi's Protection
1 The Dead Marshes
1 The One Ring
1 Toxic Deluge
1 Tundra
1 Underground River
1 Underground Sea
1 Undermine
1 Unwind
1 Unwinding Clock
1 Urza's Saga
1 Valley Floodcaller
1 Vault of Whispers
1 Verdant Catacombs
1 Vile Consumption
1 Void Rend
1 Watery Grave
1 Windfall
1 Witch Enchanter

SIDEBOARD:
1 Baleful Strix
1 Chrome Mox
1 Faerie Mastermind
1 Frantic Search
1 Gifts Ungiven
1 Island Sanctuary
1 Massacre
1 Mox Amber
1 Mystical Tutor
1 Reverse the Polarity
1 Sigil of Sleep
1 Starting Town
1 Sudden Spoiling
1 Tithe
1 Trouble in Pairs
1 Unstoppable Plan

1 Y'shtola, Night's Blessed`;

const parsedDeckList = parseExport(decklist);

const deck = await buildDeck(
    parsedDeckList.commanderNames,
    [...parsedDeckList.cardNames, ...parsedDeckList.commanderNames]
);

const commanders = deck.commanders;
const cards = deck.cards.map(card => card.name);
const analysis = analyzeDeck(deck);


console.log(commanders);

console.log(cards);

console.log(analysis);